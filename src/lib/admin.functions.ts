import { createServerFn } from "@tanstack/react-start";

import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";
import { settingsUpdateSchema } from "@/lib/admin-schema";
import { assertAdmin, buildSettingsPatch } from "@/lib/admin.server";

export const getDashboard = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    const { supabase, userId } = context;
    await assertAdmin(supabase, userId);

    const { metaConfigStatus, aiConfigStatus } = await import("@/lib/talknbit.server");

    const { data: settings } = await supabase
      .from("app_settings")
      .select("bot_enabled, store_message_content, system_prompt, updated_at")
      .eq("id", 1)
      .maybeSingle();

    const { data: events } = await supabase
      .from("message_events")
      .select(
        "id, wa_message_id, sender_masked, status, has_error, correction_sent, error_detail, message_content, created_at",
      )
      .order("created_at", { ascending: false })
      .limit(100);

    const counts = async (status?: string) => {
      const query = supabase.from("message_events").select("*", { count: "exact", head: true });
      const { count } = status ? await query.eq("status", status) : await query;
      return count ?? 0;
    };

    const { data: subscribers } = await supabase
      .from("subscribers")
      .select("*")
      .order("created_at", { ascending: false })
      .limit(100);

    const subCounts = async (status?: string) => {
      const query = supabase.from("subscribers").select("*", { count: "exact", head: true });
      const { count } = status ? await query.eq("status", status) : await query;
      return count ?? 0;
    };

    return {
      settings: settings ?? null,
      meta: metaConfigStatus(),
      ai: aiStatus,
      stats: {
        total: await counts(),
        corrected: (await counts("corrected")) + (await counts("corrected_group_dm")),
        groupCorrections: await counts("corrected_group_dm"),
        noError: await counts("no_error"),
        failed: await counts("failed"),
      },
      subscriberStats: {
        total: await subCounts(),
        active: (await subCounts("active")) + (await subCounts("vip")),
        trial: await subCounts("trial"),
        expired: await subCounts("expired"),
      },
      subscribers: subscribers ?? [],
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

export const grantSubscriberAccess = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input: unknown) => {
    const obj = input as { phone: string; plan?: string; days?: number; notes?: string };
    if (!obj?.phone) throw new Error("Phone number is required");
    return {
      phone: obj.phone,
      plan: (obj.plan || "monthly") as "monthly" | "yearly" | "lifetime",
      days: obj.days || 30,
      notes: obj.notes || "Granted by Admin",
    };
  })
  .handler(async ({ data, context }) => {
    const { supabase, userId } = context;
    await assertAdmin(supabase, userId);

    const { activateSubscription } = await import("@/lib/subscriptions.server");
    const updated = await activateSubscription(data.phone, data.plan, data.days, data.notes);
    return { ok: true, subscriber: updated };
  });

export const createStudyGroup = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input: unknown) => {
    const obj = input as { subject?: string; description?: string } | undefined;
    return {
      subject: typeof obj?.subject === "string" && obj.subject.trim() ? obj.subject.trim() : "Talk'n'Bit Practice Room",
      description: typeof obj?.description === "string" ? obj.description.trim() : undefined,
    };
  })
  .handler(async ({ data, context }) => {
    const { supabase, userId } = context;
    await assertAdmin(supabase, userId);

    const { createWhatsAppGroup } = await import("@/lib/talknbit.server");
    return await createWhatsAppGroup(data.subject, data.description);
  });

