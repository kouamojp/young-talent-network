// Seed test accounts (talent, organization, agent, admin)
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const ACCOUNTS = [
  { email: "talent@yat.test",       password: "Test1234!", name: "Test Talent",       user_type: "talent" },
  { email: "organization@yat.test", password: "Test1234!", name: "Test Organization", user_type: "organization" },
  { email: "agent@yat.test",        password: "Test1234!", name: "Test Agent",        user_type: "agent" },
  { email: "admin@yat.test",        password: "Test1234!", name: "Test Admin",        user_type: "talent", admin: true },
];

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });
  try {
    const supabase = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!,
    );

    const results: any[] = [];

    for (const acc of ACCOUNTS) {
      // Check existing
      const { data: list } = await supabase.auth.admin.listUsers();
      let user = list.users.find((u) => u.email === acc.email);

      if (!user) {
        const { data, error } = await supabase.auth.admin.createUser({
          email: acc.email,
          password: acc.password,
          email_confirm: true,
          user_metadata: { name: acc.name, user_type: acc.user_type },
        });
        if (error) { results.push({ email: acc.email, status: "error", error: error.message }); continue; }
        user = data.user!;
      } else {
        // Reset password & confirm
        await supabase.auth.admin.updateUserById(user.id, {
          password: acc.password,
          email_confirm: true,
          user_metadata: { name: acc.name, user_type: acc.user_type },
        });
      }

      // Ensure profile
      await supabase.from("profiles").upsert({
        id: user.id,
        email: acc.email,
        name: acc.name,
        user_type: acc.user_type,
      }, { onConflict: "id" });

      // Admin role
      if (acc.admin) {
        await supabase.from("user_roles").upsert({ user_id: user.id, role: "admin" }, { onConflict: "user_id,role" });
      }

      results.push({ email: acc.email, password: acc.password, user_type: acc.user_type, admin: !!acc.admin, status: "ok" });
    }

    return new Response(JSON.stringify({ accounts: results }, null, 2), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (e: any) {
    return new Response(JSON.stringify({ error: e.message }), { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } });
  }
});
