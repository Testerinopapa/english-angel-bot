import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";

import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";

const settingsUpdateSchema = z.object({
  bot_enabled: z.boolean().optional(),
  store_message_content: z.boolean().optional(),
  system_prompt: z.string().min(20).max(8000).optional(),
});

async function assertAdmin(supabase: {
  rpc: (fn: string, args: Record<string, unknown>) => Promise<{ data: unknown }>;
}, userId: string) {
  const { data } = await supabase.rpc("has_role", { _user_id: userId, _role: "admin" });
  if (data !== true) throw new Error("Forbidden");
}

export const getDashboard = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    const { supabase, userId } = context;
    await assertAdmin(supabase as never, userId);

    const { metaConfigStatus, openAiConfigured } = await import("@/lib/talknbit.server");

    const { data: settings } = await supabase
      .from("app_settings")
      .select("bot_enabled, store_message_content, system_prompt, updated_at")
      .eq("id", 1)
      .maybeSingle();

    const { data: events } = await supabase
      .from("message_events")
      .select("id, wa_message_id, sender_masked, status, has_error, correction_sent, error_detail, created_at")
      .order("created_at", { ascending: false })
      .limit(50);

    const rows = events ?? [];
    const countBy = (status: string) => rows.filter((r) => r.status === status).length;

    const { count: total } = await supabase
      .from("message_events")
      .select("*", { count: "exact", head: true });
    const { count: corrected } = await supabase
      .from("message_events")
      .select("*", { count: "exact", head: true })
      .eq("status", "corrected");
    const { count: noError } = await supabase
      .from("message_events")
      .select("*", { count: "exact", head: true })
      .eq("status", "no_error");
    const { count: failed } = await supabase
      .from("message_events")
      .select("*", { count: "exact", head: true })
      .eq("status", "failed");

    return {
      settings: settings ?? null,
      meta: metaConfigStatus(),
      openai: { configured: openAiConfigured() },
      stats: {
        total: total ?? countBy("received"),
        corrected: corrected ?? 0,
        noError: noError ?? 0,
        failed: failed ?? 0,
      },
      recent: rows.slice(0, 25),
    };
  });

export const updateSettings = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input: unknown) => settingsUpdateSchema.parse(input))
  .handler(async ({ data, context }) => {
    const { supabase, userId } = context;
    await assertAdmin(supabase as never, userId);

    const { error } = await supabase
      .from("app_settings")
      .update({ ...data, updated_at: new Date().toISOString() })
      .eq("id", 1);
    if (error) throw new Error(error.message);
    return { ok: true };
  });
