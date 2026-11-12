// Détecte les textes d'interface écrits en dur (non traduits) dans src/.
//
//   node scripts/i18n-scan.mjs            résumé par fichier
//   node scripts/i18n-scan.mjs --json     liste complète (fichier, ligne, type, texte)
//   node scripts/i18n-scan.mjs --check    code de sortie 1 s'il reste des textes en dur
//
// Sont détectés : le texte JSX, les attributs visibles (placeholder, title,
// aria-label, alt, label…), les propriétés d'objets qui portent du texte
// (title, description, label…) et les chaînes passées à toast().
// Les exclusions voulues (marques, valeurs de données) sont dans i18n-ignore.json.
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import ts from 'typescript';

const HERE = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(HERE, '..', 'src');
const IGNORE = JSON.parse(fs.readFileSync(path.join(HERE, 'i18n-ignore.json'), 'utf8'));

const IGNORE_DIRS = new Set(['integrations', 'i18n', 'ui']);
const TEXT_ATTRS = new Set(['placeholder', 'title', 'aria-label', 'alt', 'label', 'description', 'emptyLabel', 'tooltip', 'subtitle', 'heading']);
const TEXT_PROPS = new Set(['title', 'description', 'label', 'placeholder', 'message', 'desc', 'text', 'subtitle', 'name', 'q', 'tooltip', 'question', 'area', 'detail', 'value_label']);
const TOAST_FNS = new Set(['toast', 'success', 'error', 'info', 'warning', 'message']);
const T_FNS = new Set(['t', 'tr', 'i18nT']);

const ENTITIES = { '&amp;': '&', '&nbsp;': ' ', '&lt;': '<', '&gt;': '>', '&quot;': '"', '&#39;': "'", '&apos;': "'" };
const decode = (s) => s.replace(/&(amp|nbsp|lt|gt|quot|#39|apos);/g, (m) => ENTITIES[m]);
const norm = (s) => s.replace(/[ \t\r\n]+/g, ' ').trim();
const hasLetters = (s) => /[A-Za-zÀ-ÿА-Яа-яЁё]{2,}/.test(s.replace(/\{p\d+\}/g, ''));
// Not UI text: css classes, urls, identifiers, keys, paths…
const looksTechnical = (s) =>
  /^[a-z0-9_.:/#?&=%@-]+$/i.test(s) && (/[._/:#-]/.test(s) || s === s.toLowerCase());

export function listFiles(dir = ROOT, out = []) {
  for (const e of fs.readdirSync(dir, { withFileTypes: true })) {
    if (e.isDirectory()) { if (!IGNORE_DIRS.has(e.name)) listFiles(path.join(dir, e.name), out); }
    else if (/\.tsx?$/.test(e.name) && !/\.test\.tsx?$/.test(e.name) && !e.name.endsWith('.d.ts')) out.push(path.join(dir, e.name));
  }
  return out;
}

export const relPath = (file) => path.relative(path.resolve(HERE, '..'), file).replace(/\\/g, '/');

/**
 * Returns the hard-coded UI strings of a file. Each finding carries what a
 * codemod needs: the source range to replace, how to replace it (`mode`), the
 * text as a translation pattern ({p0}, {p1}… for template expressions) and the
 * source of those expressions (`params`).
 */
export function scanFile(file, { applyIgnore = true } = {}) {
  const rel = relPath(file);
  if (applyIgnore && IGNORE.files.includes(rel)) return [];
  const src = fs.readFileSync(file, 'utf8');
  const sf = ts.createSourceFile(file, src, ts.ScriptTarget.Latest, true, file.endsWith('x') ? ts.ScriptKind.TSX : ts.ScriptKind.TS);
  const found = [];

  const push = (start, end, kind, mode, text, params = []) => {
    const t = norm(text);
    if (!t || !hasLetters(t)) return;
    // Visible JSX text is always UI text; elsewhere, skip identifiers, urls, css classes…
    if (kind !== 'jsx' && params.length === 0 && looksTechnical(t)) return;
    if (applyIgnore) {
      if (IGNORE.texts.includes(t)) return;
      if (kind === 'prop:name' && !IGNORE.namePropFiles.includes(rel)) return;
      if (kind === 'literal' && IGNORE.literalFiles.includes(rel)) return;
    }
    const { line } = sf.getLineAndCharacterOfPosition(start);
    found.push({ line: line + 1, kind, mode, text: t, params, start, end });
  };

  const isString = (n) => ts.isStringLiteral(n) || ts.isNoSubstitutionTemplateLiteral(n);
  const isTCall = (n) => ts.isCallExpression(n) && ts.isIdentifier(n.expression) && T_FNS.has(n.expression.text);

  // A string-ish expression: literal, template, or a ?: / && / || combination of them.
  const collect = (e, kind, gate = () => true) => {
    if (isString(e)) { if (gate(e.text)) push(e.getStart(sf), e.getEnd(), kind, 'expr', e.text); }
    else if (ts.isTemplateExpression(e)) {
      let pattern = e.head.text;
      const params = [];
      e.templateSpans.forEach((span, i) => { params.push(span.expression.getText(sf)); pattern += `{p${i}}` + span.literal.text; });
      push(e.getStart(sf), e.getEnd(), kind, 'expr', pattern, params);
    }
    else if (ts.isConditionalExpression(e)) { collect(e.whenTrue, kind, gate); collect(e.whenFalse, kind, gate); }
    else if (ts.isParenthesizedExpression(e)) collect(e.expression, kind, gate);
    else if (ts.isBinaryExpression(e)) {
      const op = e.operatorToken.kind;
      if (op === ts.SyntaxKind.AmpersandAmpersandToken) collect(e.right, kind, gate);
      // t('key') || 'fallback' : the fallback is dead text once the key exists
      else if (op === ts.SyntaxKind.BarBarToken || op === ts.SyntaxKind.QuestionQuestionToken) { if (!isTCall(e.left)) collect(e.right, kind, gate); }
    }
  };

  // A free-standing string literal that is clearly a sentence shown to the user:
  // accented or Cyrillic words, or several words starting with a capital.
  // Excludes anything that is code: imports, keys, comparisons, console, css, queries…
  const NON_UI_ATTRS = /^(className|class|style|id|key|href|to|src|type|name|value|variant|size|role|htmlFor|accept|target|rel|d|viewBox|fill|stroke|data-.*|on[A-Z].*)$/;
  const NON_UI_CALLS = /^(console\.|supabase|fetch|navigate|require|import|localStorage|sessionStorage|document\.|window\.|.*\.(from|select|eq|neq|in|or|order|ilike|like|rpc|channel|on|invoke|includes|startsWith|endsWith|split|join|replace|match|test|getItem|setItem|addEventListener|removeEventListener|querySelector|getElementById|createElement|setAttribute|toLocaleDateString|toLocaleTimeString|toLocaleString|filter|contains|not|is|gte|lte|gt|lt|single|maybeSingle|upload|getPublicUrl|createSignedUrl|storage)$|tr$|t$|cn$|clsx$|cva$|z\.|new )/;
  const looksLikeSentence = (s) =>
    (/[À-ÿА-Яа-яЁё]/.test(s) ? /[A-Za-zÀ-ÿА-Яа-яЁё]{3,}/.test(s) : /^[A-Z][a-z]+( [A-Za-z'’-]+){2,}/.test(s)) && !/^[\w./:#?&=%@-]+$/.test(s);
  const isLooseText = (node) => {
    const s = node.text;
    if (!looksLikeSentence(s)) return false;
    const p = node.parent;
    if (ts.isImportDeclaration(p) || ts.isExportDeclaration(p) || ts.isLiteralTypeNode(p) || ts.isPropertyAssignment(p) && p.name === node) return false;
    if (ts.isJsxAttribute(p)) return false; // handled (or deliberately skipped) by the attribute rule
    if (ts.isJsxExpression(p) && ts.isJsxAttribute(p.parent) && NON_UI_ATTRS.test(p.parent.name.getText(sf))) return false;
    if (ts.isBinaryExpression(p) && [ts.SyntaxKind.EqualsEqualsEqualsToken, ts.SyntaxKind.ExclamationEqualsEqualsToken, ts.SyntaxKind.EqualsEqualsToken, ts.SyntaxKind.ExclamationEqualsToken].includes(p.operatorToken.kind)) return false;
    if (ts.isCaseClause(p) || ts.isElementAccessExpression(p) || ts.isEnumMember(p) || ts.isThrowStatement(p)) return false;
    if (ts.isNewExpression(p) || (ts.isCallExpression(p) && NON_UI_CALLS.test(p.expression.getText(sf).replace(/\s+/g, '')))) return false;
    for (let a = p; a; a = a.parent) {
      if (ts.isThrowStatement(a) || ts.isTypeNode(a)) return false;
      if (ts.isCallExpression(a) && /^console\./.test(a.expression.getText(sf))) return false;
      if (ts.isFunctionLike(a)) break;
    }
    return true;
  };

  const insideToast = (node) => {
    for (let p = node.parent; p; p = p.parent) {
      if (ts.isCallExpression(p)) {
        const c = p.expression;
        const name = ts.isIdentifier(c) ? c.text : ts.isPropertyAccessExpression(c) ? c.name.text : '';
        const obj = ts.isPropertyAccessExpression(c) && ts.isIdentifier(c.expression) ? c.expression.text : '';
        return name === 'toast' || (obj === 'toast' && TOAST_FNS.has(name));
      }
      if (ts.isFunctionLike(p)) return false;
    }
    return false;
  };

  const visit = (node) => {
    if (ts.isJsxText(node)) {
      const raw = node.getFullText(sf);
      const lead = raw.length - raw.trimStart().length;
      const trail = raw.length - raw.trimEnd().length;
      if (raw.trim()) push(node.getFullStart() + lead, node.getEnd() - trail, 'jsx', 'jsx', decode(raw));
    } else if (ts.isJsxAttribute(node) && node.initializer) {
      const name = node.name.getText(sf);
      const init = node.initializer;
      if (TEXT_ATTRS.has(name)) {
        if (ts.isStringLiteral(init)) push(init.getStart(sf), init.getEnd(), `attr:${name}`, 'attr', decode(init.text));
        else if (ts.isJsxExpression(init) && init.expression) collect(init.expression, `attr:${name}`);
      } else if (ts.isStringLiteral(init) && !NON_UI_ATTRS.test(name) && looksLikeSentence(init.text)) {
        // Any other attribute carrying a sentence (text="…", hint="…", …)
        push(init.getStart(sf), init.getEnd(), `attr:${name}`, 'attr', decode(init.text));
      }
    } else if (ts.isJsxExpression(node) && node.expression && !ts.isJsxAttribute(node.parent)) {
      collect(node.expression, 'jsx-expr');
    } else if (ts.isPropertyAssignment(node)) {
      const name = node.name.getText(sf).replace(/['"]/g, '');
      if (TEXT_PROPS.has(name)) {
        const toast = insideToast(node);
        collect(node.initializer, `prop:${name}`, (s) => toast || /\s/.test(s) || /[À-ÿА-Яа-яЁё]/.test(s) || /^[A-ZÀ-ÝА-Я]/.test(s));
      }
    } else if (isString(node) && isLooseText(node)) {
      push(node.getStart(sf), node.getEnd(), 'literal', 'expr', node.text);
    } else if (ts.isCallExpression(node)) {
      const c = node.expression;
      if (ts.isPropertyAccessExpression(c) && ts.isIdentifier(c.expression) && c.expression.text === 'toast' && TOAST_FNS.has(c.name.text) && node.arguments[0]) {
        collect(node.arguments[0], 'toast');
      }
    }
    ts.forEachChild(node, visit);
  };
  visit(sf);

  // A node can be reached twice (e.g. a toast() argument that is also a prop): keep one finding per range.
  const seen = new Set();
  return found.filter((f) => { const k = `${f.start}:${f.end}`; if (seen.has(k)) return false; seen.add(k); return true; });
}

if (process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  const files = listFiles();
  const all = [];
  for (const f of files) for (const r of scanFile(f)) all.push({ file: relPath(f), ...r });
  if (process.argv.includes('--json')) {
    console.log(JSON.stringify(all, null, 1));
  } else {
    const byFile = {};
    for (const r of all) byFile[r.file] = (byFile[r.file] || 0) + 1;
    for (const [f, n] of Object.entries(byFile).sort((a, b) => b[1] - a[1])) console.log(String(n).padStart(4), f);
    console.log(`\n${all.length} textes en dur dans ${Object.keys(byFile).length} fichiers (${files.length} fichiers analysés)`);
  }
  if (process.argv.includes('--check') && all.length) process.exit(1);
}
