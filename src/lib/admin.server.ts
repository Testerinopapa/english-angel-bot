import type { SettingsUpdate } from "@/lib/admin-schema";

type RpcClient = {
  rpc: (fn: string, args: Record<string, unknown>) => Promise<{ data: unknown }>;
};

export const SUPERADMIN_EMAILS = [
  "lorendamasio@gmail.com",
  "gmalavaes@gmail.com",
];

export async function assertAdmin(
  supabase: unknown,
  userId: string,
  emailOrClaims?: unknown,
  clientProvidedEmail?: string | null,
) {
  let email: string | null | undefined = null;

  if (typeof emailOrClaims === "string") {
    email = emailOrClaims;
  } else if (emailOrClaims && typeof emailOrClaims === "object") {
    const obj = emailOrClaims as any;
    email = obj.email || obj.user_metadata?.email || obj.app_metadata?.email;
  }

  if (!email && clientProvidedEmail) {
    email = clientProvidedEmail;
  }

  // If still not resolved, query user's authenticated details directly from Supabase
  if (!email && (supabase as any)?.auth?.getUser) {
    try {
      const { data } = await (supabase as any).auth.getUser();
      if (data?.user?.email) {
        email = data.user.email;
      }
    } catch (err) {
      console.warn("assertAdmin: supabase.auth.getUser error:", err);
    }
  }

  // Try service role client if available
  if (!email) {
    try {
      const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
      const { data } = await supabaseAdmin.auth.admin.getUserById(userId);
      if (data?.user?.email) {
        email = data.user.email;
      }
    } catch (err) {
      console.warn("assertAdmin: supabaseAdmin getUserById error:", err);
    }
  }

  const normalizedEmail = email?.toLowerCase().trim();

  // If email is in designated superadmin list, ensure role in user_roles and authorize
  if (normalizedEmail && SUPERADMIN_EMAILS.includes(normalizedEmail)) {
    try {
      const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
      await supabaseAdmin
        .from("user_roles")
        .upsert(
          { user_id: userId, role: "admin" },
          { onConflict: "user_id,role" },
        );
    } catch (err) {
      console.warn("Could not auto-upsert superadmin role in user_roles:", err);
    }
    return;
  }

  // Check user_roles table directly with service role if available
  try {
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    const { data: roleRow } = await supabaseAdmin
      .from("user_roles")
      .select("role")
      .eq("user_id", userId)
      .eq("role", "admin")
      .maybeSingle();
    if (roleRow) return;
  } catch (err) {
    // fallback to rpc
  }

  const { data } = await (supabase as RpcClient).rpc("has_role", {
    _user_id: userId,
    _role: "admin",
  });
  if (data !== true) throw new Error("Forbidden");
}

export async function checkIsAdmin(
  supabase: unknown,
  userId: string,
  emailOrClaims?: unknown,
  clientProvidedEmail?: string | null,
): Promise<boolean> {
  try {
    await assertAdmin(supabase, userId, emailOrClaims, clientProvidedEmail);
    return true;
  } catch {
    return false;
  }
}

export function buildSettingsPatch(input: SettingsUpdate) {
  const patch: {
    bot_enabled?: boolean;
    store_message_content?: boolean;
    system_prompt?: string;
    updated_at: string;
  } = { updated_at: new Date().toISOString() };
  if (input.bot_enabled !== undefined) patch.bot_enabled = input.bot_enabled;
  if (input.store_message_content !== undefined)
    patch.store_message_content = input.store_message_content;
  if (input.system_prompt !== undefined) patch.system_prompt = input.system_prompt;
  return patch;
}
