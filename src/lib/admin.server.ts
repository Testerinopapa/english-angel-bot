import { z } from "zod";

export const settingsUpdateSchema = z.object({
  bot_enabled: z.boolean().optional(),
  store_message_content: z.boolean().optional(),
  system_prompt: z.string().min(20).max(8000).optional(),
});

export type SettingsUpdate = z.infer<typeof settingsUpdateSchema>;

type RpcClient = {
  rpc: (fn: string, args: Record<string, unknown>) => Promise<{ data: unknown }>;
};

export async function assertAdmin(supabase: unknown, userId: string) {
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
