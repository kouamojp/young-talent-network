// Récupération d'une page fournie par un utilisateur, sans exposer le réseau interne.
//
// Une fonction Edge qui fait `fetch(url)` sur une adresse choisie par l'utilisateur
// peut être détournée pour atteindre des services internes (métadonnées cloud,
// localhost, réseau privé). On n'accepte donc que http(s) vers une adresse publique,
// on suit les redirections à la main en revérifiant chaque saut, et on limite la
// durée et la taille de la réponse.

const MAX_REDIRECTS = 3;
const TIMEOUT_MS = 10_000;
const MAX_BYTES = 2 * 1024 * 1024;

const isPrivateIPv4 = (ip: string): boolean => {
  const p = ip.split(".").map(Number);
  if (p.length !== 4 || p.some((n) => !Number.isInteger(n) || n < 0 || n > 255)) return true;
  const [a, b] = p;
  return (
    a === 0 || a === 10 || a === 127 ||
    (a === 100 && b >= 64 && b <= 127) ||   // CGNAT
    (a === 169 && b === 254) ||             // link-local, métadonnées cloud
    (a === 172 && b >= 16 && b <= 31) ||
    (a === 192 && b === 168) ||
    (a === 192 && b === 0) ||
    (a === 198 && (b === 18 || b === 19)) ||
    a >= 224                                // multicast, réservé
  );
};

const isPrivateIPv6 = (ip: string): boolean => {
  const v = ip.toLowerCase().replace(/^\[|\]$/g, "");
  if (v === "::" || v === "::1") return true;
  if (v.startsWith("fc") || v.startsWith("fd")) return true;   // unique local
  if (/^fe[89ab]/.test(v)) return true;                         // link-local
  const mapped = v.match(/^::ffff:(\d+\.\d+\.\d+\.\d+)$/);
  return mapped ? isPrivateIPv4(mapped[1]) : false;
};

export class UnsafeUrlError extends Error {}

/** Vérifie qu'une URL est en http(s) et pointe vers une adresse publique. */
export async function assertPublicUrl(raw: string): Promise<URL> {
  let url: URL;
  try { url = new URL(raw); } catch { throw new UnsafeUrlError("URL invalide"); }
  if (url.protocol !== "http:" && url.protocol !== "https:") throw new UnsafeUrlError("Seules les adresses http(s) sont acceptées");
  if (url.username || url.password) throw new UnsafeUrlError("URL invalide");
  if (url.port && !["80", "443"].includes(url.port)) throw new UnsafeUrlError("Port non autorisé");

  const host = url.hostname.toLowerCase();
  if (host === "localhost" || host.endsWith(".localhost") || host.endsWith(".local") || host.endsWith(".internal")) {
    throw new UnsafeUrlError("Adresse non autorisée");
  }
  if (/^\d+\.\d+\.\d+\.\d+$/.test(host)) {
    if (isPrivateIPv4(host)) throw new UnsafeUrlError("Adresse non autorisée");
    return url;
  }
  if (host.includes(":")) {
    if (isPrivateIPv6(host)) throw new UnsafeUrlError("Adresse non autorisée");
    return url;
  }

  // Nom de domaine : toutes les adresses résolues doivent être publiques.
  const [v4, v6] = await Promise.all([
    Deno.resolveDns(host, "A").catch(() => [] as string[]),
    Deno.resolveDns(host, "AAAA").catch(() => [] as string[]),
  ]);
  if (v4.length + v6.length === 0) throw new UnsafeUrlError("Domaine introuvable");
  if (v4.some(isPrivateIPv4) || v6.some(isPrivateIPv6)) throw new UnsafeUrlError("Adresse non autorisée");
  return url;
}

/** Télécharge le texte d'une page publique (redirections revérifiées, durée et taille limitées). */
export async function fetchPublicPage(raw: string): Promise<{ ok: boolean; status: number; text: string }> {
  let current = raw;
  for (let hop = 0; hop <= MAX_REDIRECTS; hop++) {
    const url = await assertPublicUrl(current);
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), TIMEOUT_MS);
    try {
      const res = await fetch(url, {
        redirect: "manual",
        signal: controller.signal,
        headers: {
          "User-Agent": "Mozilla/5.0 (compatible; YAT-Bot/1.0)",
          "Accept": "text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8",
        },
      });
      if (res.status >= 300 && res.status < 400) {
        const location = res.headers.get("location");
        await res.body?.cancel();
        if (!location) return { ok: false, status: res.status, text: "" };
        current = new URL(location, url).toString();
        continue;
      }
      if (!res.ok || !res.body) return { ok: res.ok, status: res.status, text: "" };

      // Lecture bornée : on s'arrête à MAX_BYTES.
      const reader = res.body.getReader();
      const chunks: Uint8Array[] = [];
      let size = 0;
      while (size < MAX_BYTES) {
        const { done, value } = await reader.read();
        if (done) break;
        chunks.push(value);
        size += value.length;
      }
      await reader.cancel().catch(() => {});
      const bytes = new Uint8Array(Math.min(size, MAX_BYTES));
      let offset = 0;
      for (const c of chunks) {
        const part = c.subarray(0, Math.min(c.length, bytes.length - offset));
        bytes.set(part, offset);
        offset += part.length;
        if (offset >= bytes.length) break;
      }
      return { ok: true, status: res.status, text: new TextDecoder().decode(bytes) };
    } finally {
      clearTimeout(timer);
    }
  }
  throw new UnsafeUrlError("Trop de redirections");
}
