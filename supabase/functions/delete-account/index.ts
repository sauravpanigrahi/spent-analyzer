import { createClient } from "@supabase/supabase-js";

declare const Deno: {
  env: {
    get(name: string): string | undefined;
  };
  serve(handler: (request: Request) => Promise<Response> | Response): void;
};

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
};

const jsonResponse = (body: Record<string, string>, status = 200) =>
  new Response(JSON.stringify(body), {
    status,
    headers: { ...corsHeaders, "Content-Type": "application/json" },
  });

Deno.serve(async (request: Request) => {
  if (request.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  if (request.method !== "POST") {
    return jsonResponse({ error: "Method not allowed." }, 405);
  }

  const authorization = request.headers.get("Authorization");
  if (!authorization?.startsWith("Bearer ")) {
    return jsonResponse({ error: "Authentication is required." }, 401);
  }

  const supabaseUrl = Deno.env.get("SUPABASE_URL");
  const anonKey = Deno.env.get("SUPABASE_ANON_KEY");
  const serviceRoleKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");
  if (!supabaseUrl || !anonKey || !serviceRoleKey) {
    console.error("Delete-account function is missing Supabase secrets.");
    return jsonResponse({ error: "Account deletion is not configured." }, 500);
  }

  const userClient = createClient(supabaseUrl, anonKey, {
    global: { headers: { Authorization: authorization } },
    auth: { persistSession: false, autoRefreshToken: false },
  });
  const accessToken = authorization.slice("Bearer ".length);
  const { data: userData, error: authError } =
    await userClient.auth.getUser(accessToken);
  if (authError || !userData.user) {
    return jsonResponse({ error: "The current session is invalid." }, 401);
  }

  const adminClient = createClient(supabaseUrl, serviceRoleKey, {
    auth: { persistSession: false, autoRefreshToken: false },
  });

  const { error: transactionsError } = await adminClient
    .from("transactions")
    .delete()
    .eq("user_id", userData.user.id);
  if (transactionsError) {
    console.error("Could not delete account transactions:", transactionsError);
    return jsonResponse({ error: "Could not delete account transactions." }, 500);
  }

  const { error: profileError } = await adminClient
    .from("profilesetup")
    .delete()
    .eq("id", userData.user.id);
  if (profileError) {
    console.error("Could not delete account profile:", profileError);
    return jsonResponse({ error: "Could not delete account profile." }, 500);
  }

  const { error: deleteUserError } = await adminClient.auth.admin.deleteUser(
    userData.user.id,
  );
  if (deleteUserError) {
    console.error("Could not delete Supabase auth user:", deleteUserError);
    return jsonResponse({ error: "Could not delete the account." }, 500);
  }

  return jsonResponse({ success: "Account and associated data deleted." });
});
