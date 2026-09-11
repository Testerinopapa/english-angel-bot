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
  email?: string | null,
) {
  const normalizedEmail = email?.toLowerCase().trim();

  // If email is in the designated superadmin list, ensure role exists and authorize immediately!
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

  const { data } = await (supabase as RpcClient).rpc("has_role", {
    _user_id: userId,
    _role: "admin",
  });
  if (data !== true) throw new Error("Forbidden");
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
