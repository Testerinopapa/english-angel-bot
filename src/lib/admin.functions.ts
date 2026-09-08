import { createServerFn } from "@tanstack/react-start";

import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";
import { settingsUpdateSchema } from "@/lib/admin-schema";
import { assertAdmin, buildSettingsPatch } from "@/lib/admin.server";

export const getDashboard = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    const { supabase, userId } = context;
    await assertAdmin(supabase, userId);

    const { metaConfigStatus, openAiConfigured } = await import("@/lib/talknbit.server");

    const { data: settings } = await supabase
      .from("app_settings")
      .select("bot_enabled, store_message_content, system_prompt, updated_at")
      .eq("id", 1)
      .maybeSingle();

    const { data: events } = await supabase
      .from("message_events")
      .select(
        "id, wa_message_id, sender_masked, status, has_error, correction_sent, error_detail, created_at",
      )
      .order("created_at", { ascending: false })
      .limit(25);

    const counts = async (status?: string) => {
      const query = supabase.from("message_events").select("*", { count: "exact", head: true });
      const { count } = status ? await query.eq("status", status) : await query;
      return count ?? 0;
    };

    return {
      settings: settings ?? null,
      meta: metaConfigStatus(),
      openai: { configured: openAiConfigured() },
      stats: {
        total: await counts(),
        corrected: await counts("corrected"),
        noError: await counts("no_error"),
        failed: await counts("failed"),
      },
      recent: events ?? [],
    };
  });

export const updateSettings = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input: unknown) => settingsUpdateSchema.parse(input))
  .handler(async ({ data, context }) => {
    const { supabase, userId } = context;
    await assertAdmin(supabase, userId);

    const { error } = await supabase
      .from("app_settings")
      .update(buildSettingsPatch(data))
      .eq("id", 1);
    if (error) throw new Error(error.message);
    return { ok: true };
  });
