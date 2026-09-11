import { createServerFn } from "@tanstack/react-start";

import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";
import { settingsUpdateSchema } from "@/lib/admin-schema";
import { assertAdmin, checkIsAdmin, buildSettingsPatch } from "@/lib/admin.server";

export const getDashboard = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input: unknown) => {
    if (input && typeof input === "object" && "email" in input) {
      return { email: String((input as any).email) };
    }
    return { email: undefined };
  })
  .handler(async ({ data, context }) => {
    const { supabase, userId, claims } = context;
    const isAdmin = await checkIsAdmin(supabase, userId, claims, data?.email);

    let dbClient: any = supabase;
    try {
      const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
      if (supabaseAdmin) dbClient = supabaseAdmin;
    } catch {
      dbClient = supabase;
    }

    // Resolve user email
    let userEmail = data?.email;
    if (!userEmail && typeof (claims as any)?.email === "string") {
      userEmail = (claims as any).email;
    }
    if (!userEmail && (supabase as any)?.auth?.getUser) {
      try {
        const { data: authData } = await (supabase as any).auth.getUser();
        if (authData?.user?.email) userEmail = authData.user.email;
      } catch {}
    }

    if (!isAdmin) {
      // Student / Free Trial Portal mode
      let studentSubscription: any = null;
      if (userEmail) {
        const normalized = userEmail.toLowerCase().trim();
        const { data: subRows } = await dbClient
          .from("subscribers")
          .select("id, phone_number, status, plan, trial_started_at, trial_ends_at, subscription_ends_at, messages_count, notes, created_at")
          .ilike("notes", `%${normalized}%`)
          .order("created_at", { ascending: false })
          .limit(1);

        if (subRows && subRows.length > 0) {
          studentSubscription = subRows[0];
        }
      }

      return {
        role: "student" as const,
        isAdmin: false,
        email: userEmail || "",
        subscription: studentSubscription,
        settings: null,
        meta: null,
        ai: null,
        stats: null,
        subscriberStats: null,
        subscribers: [],
        recent: [],
      };
    }

    // Admin mode
    const { metaConfigStatus, aiConfigStatus } = await import("@/lib/talknbit.server");

    const { data: settings } = await dbClient
      .from("app_settings")
      .select("bot_enabled, store_message_content, system_prompt, updated_at")
      .eq("id", 1)
      .maybeSingle();

    const { data: events } = await dbClient
      .from("message_events")
      .select(
        "id, wa_message_id, sender_masked, status, has_error, correction_sent, error_detail, message_content, created_at",
      )
      .order("created_at", { ascending: false })
      .limit(100);

    const counts = async (status?: string) => {
      const query = dbClient.from("message_events").select("*", { count: "exact", head: true });
      const { count } = status ? await query.eq("status", status) : await query;
      return count ?? 0;
    };

    const { data: subscribers } = await dbClient
      .from("subscribers")
      .select("*")
      .order("created_at", { ascending: false })
      .limit(100);

    const subCounts = async (status?: string) => {
      const query = dbClient.from("subscribers").select("*", { count: "exact", head: true });
      const { count } = status ? await query.eq("status", status) : await query;
      return count ?? 0;
    };

    return {
      role: "admin" as const,
      isAdmin: true,
      email: userEmail || "",
      subscription: null,
      settings: settings ?? null,
      meta: metaConfigStatus(),
      ai: aiConfigStatus(),
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
    const { supabase, userId, claims } = context;
    await assertAdmin(supabase, userId, claims);

    let dbClient: any = supabase;
    try {
      const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
      if (supabaseAdmin) dbClient = supabaseAdmin;
    } catch {
      dbClient = supabase;
    }

    const { error } = await dbClient
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
    const { supabase, userId, claims } = context;
    await assertAdmin(supabase, userId, claims);

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
    const { supabase, userId, claims } = context;
    await assertAdmin(supabase, userId, claims);

    const { createWhatsAppGroup } = await import("@/lib/talknbit.server");
    return await createWhatsAppGroup(data.subject, data.description);
  });

export const resetSubscriberCount = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input: unknown) => {
    const obj = input as { phone: string };
    if (!obj?.phone) throw new Error("Phone number is required");
    return { phone: obj.phone };
  })
  .handler(async ({ data, context }) => {
    const { supabase, userId, claims } = context;
    await assertAdmin(supabase, userId, claims);

    const { resetSubscriberMessagesCount } = await import("@/lib/subscriptions.server");
    await resetSubscriberMessagesCount(data.phone);
    return { ok: true };
  });

export const deleteSubscriber = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input: unknown) => {
    const obj = input as { id: string };
    if (!obj?.id) throw new Error("Subscriber ID is required");
    return { id: obj.id };
  })
  .handler(async ({ data, context }) => {
    const { supabase, userId, claims } = context;
    await assertAdmin(supabase, userId, claims);

    let dbClient: any = supabase;
    try {
      const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
      if (supabaseAdmin) dbClient = supabaseAdmin;
    } catch {
      dbClient = supabase;
    }

    const { error } = await dbClient.from("subscribers").delete().eq("id", data.id);
    if (error) throw new Error(error.message);
    return { ok: true };
  });

export const linkPhoneToStudentAccount = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input: unknown): { phone: string; email?: string } => {
    if (!input || typeof input !== "object") throw new Error("Invalid payload");
    const data = input as any;
    const phone = String(data.phone || "").replace(/\D/g, "");
    if (phone.length < 8) throw new Error("Please enter a valid phone number");
    return { phone, email: data.email ? String(data.email).trim() : undefined };
  })
  .handler(async ({ data, context }) => {
    const { getPhoneVariants, normalizePhoneNumber } = await import("@/lib/subscriptions.server");
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");

    let userEmail = data.email;
    if (!userEmail && (context.claims as any)?.email) {
      userEmail = (context.claims as any).email;
    }

    const cleanPhone = normalizePhoneNumber(data.phone);
    const variants = getPhoneVariants(cleanPhone);

    const { data: rows } = await supabaseAdmin
      .from("subscribers")
      .select("*")
      .in("phone_number", variants);

    if (!rows || rows.length === 0) {
      throw new Error("No subscription or free trial found for this phone number. Please activate your 15-day trial first.");
    }

    const targetRow = rows[0];
    if (userEmail) {
      const currentNotes = targetRow.notes || "";
      const updatedNotes = currentNotes.includes(userEmail)
        ? currentNotes
        : `${currentNotes} | User: ${userEmail}`.trim();

      await supabaseAdmin
        .from("subscribers")
        .update({ notes: updatedNotes, updated_at: new Date().toISOString() })
        .eq("id", targetRow.id);
    }

    return { ok: true, subscription: targetRow };
  });

