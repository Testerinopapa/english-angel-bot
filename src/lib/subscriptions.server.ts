import { maskSender } from "./talknbit.server";

export type SubscriberStatus = "trial" | "active" | "expired" | "cancelled" | "vip";
export type SubscriptionPlan = "free_trial" | "monthly" | "semiannual" | "yearly" | "lifetime";

export type SubscriberRow = {
  id: string;
  phone_number: string;
  status: SubscriberStatus;
  plan: SubscriptionPlan;
  trial_started_at: string;
  trial_ends_at: string;
  subscription_ends_at: string | null;
  messages_count: number;
  notes: string | null;
  created_at: string;
  updated_at: string;
};

export type EntitlementResult = {
  hasAccess: boolean;
  status: SubscriberStatus;
  plan: SubscriptionPlan;
  isTrial: boolean;
  isExpired: boolean;
  isVip: boolean;
  messagesLeft: number;
  trialHoursLeft: number;
  reason?: "trial_expired" | "message_limit_exceeded" | "subscription_expired";
};

export const TRIAL_DURATION_DAYS = 15;
export const TRIAL_DURATION_HOURS = 24 * TRIAL_DURATION_DAYS; // 15 Days (360 hours)
export const TRIAL_MESSAGE_LIMIT = 1000; // Unlimited / generous cap for 15-day trial

/** Canonicalize phone number to digits only: +55 (13) 99187-8104 -> 5513991878104 */
export function normalizePhoneNumber(rawPhone: string): string {
  return rawPhone.replace(/\D/g, "");
}

/**
 * Generate all possible phone number variants (handles Brazilian 8 vs 9 digits, with/without 55).
 * e.g. 5513991878104 <-> 551391878104 <-> 13991878104 <-> 1391878104
 */
export function getPhoneVariants(rawPhone: string): string[] {
  const digits = rawPhone.replace(/\D/g, "");
  if (!digits) return [];
  const variants = new Set<string>([digits]);

  if (digits.startsWith("55")) {
    const local = digits.slice(2);
    if (local.length === 11 && local[2] === "9") {
      const ddd = local.slice(0, 2);
      const rest = local.slice(3);
      variants.add(`55${ddd}${rest}`);
      variants.add(local);
      variants.add(`${ddd}${rest}`);
    } else if (local.length === 10) {
      const ddd = local.slice(0, 2);
      const rest = local.slice(2);
      variants.add(`55${ddd}9${rest}`);
      variants.add(local);
      variants.add(`${ddd}9${rest}`);
    }
  } else if (digits.length === 11 && digits[2] === "9") {
    const ddd = digits.slice(0, 2);
    const rest = digits.slice(3);
    variants.add(`55${digits}`);
    variants.add(`55${ddd}${rest}`);
    variants.add(`${ddd}${rest}`);
  } else if (digits.length === 10) {
    const ddd = digits.slice(0, 2);
    const rest = digits.slice(2);
    variants.add(`55${digits}`);
    variants.add(`55${ddd}9${rest}`);
    variants.add(`${ddd}9${rest}`);
  }

  return Array.from(variants);
}

/**
 * Fetch or initialize a subscriber record for a given WhatsApp phone number.
 * Every new phone number automatically receives a 24-hour / 15-message trial.
 */
export async function getOrCreateSubscriber(rawPhone: string): Promise<EntitlementResult> {
  const phone = normalizePhoneNumber(rawPhone);
  const variants = getPhoneVariants(rawPhone);
  const { supabaseAdmin } = await import("@/integrations/supabase/client.server");

  const { data: rows } = await supabaseAdmin
    .from("subscribers")
    .select("*")
    .in("phone_number", variants);

  let subscriber: SubscriberRow;

  if (rows && rows.length > 0) {
    const activeRow = rows.find((r) => r.status === "active" || r.status === "vip") || rows[0];
    subscriber = activeRow as SubscriberRow;

    if (rows.length > 1) {
      const obsoleteIds = rows.filter((r) => r.id !== activeRow.id).map((r) => r.id);
      await supabaseAdmin.from("subscribers").delete().in("id", obsoleteIds);
    }
  } else {
    const now = new Date();
    const trialEnds = new Date(now.getTime() + TRIAL_DURATION_HOURS * 60 * 60 * 1000);

    const { data: inserted, error } = await supabaseAdmin
      .from("subscribers")
      .insert({
        phone_number: phone,
        status: "trial",
        plan: "free_trial",
        trial_started_at: now.toISOString(),
        trial_ends_at: trialEnds.toISOString(),
        messages_count: 0,
      })
      .select("*")
      .single();

    if (error || !inserted) {
      // Fallback in case table isn't migrated yet or DB glitch: grant temporary trial access
      console.warn("Could not insert subscriber, granting graceful trial access:", error);
      return {
        hasAccess: true,
        status: "trial",
        plan: "free_trial",
        isTrial: true,
        isExpired: false,
        isVip: false,
        messagesLeft: TRIAL_MESSAGE_LIMIT,
        trialHoursLeft: TRIAL_DURATION_HOURS,
      };
    }
    subscriber = inserted as SubscriberRow;
  }

  const now = new Date();

  // VIP / Lifetime Access
  if (subscriber.status === "vip" || subscriber.plan === "lifetime") {
    return {
      hasAccess: true,
      status: "vip",
      plan: subscriber.plan,
      isTrial: false,
      isExpired: false,
      isVip: true,
      messagesLeft: Infinity,
      trialHoursLeft: Infinity,
    };
  }

  // Active Paid Subscription
  if (subscriber.status === "active") {
    if (subscriber.subscription_ends_at) {
      const expiresAt = new Date(subscriber.subscription_ends_at);
      if (now > expiresAt) {
        // Mark expired in background
        await supabaseAdmin
          .from("subscribers")
          .update({ status: "expired", updated_at: now.toISOString() })
          .eq("phone_number", phone);

        return {
          hasAccess: false,
          status: "expired",
          plan: subscriber.plan,
          isTrial: false,
          isExpired: true,
          isVip: false,
          messagesLeft: 0,
          trialHoursLeft: 0,
          reason: "subscription_expired",
        };
      }
    }

    return {
      hasAccess: true,
      status: "active",
      plan: subscriber.plan,
      isTrial: false,
      isExpired: false,
      isVip: false,
      messagesLeft: Infinity,
      trialHoursLeft: Infinity,
    };
  }

  // Free Trial Evaluation
  if (subscriber.status === "trial") {
    const trialEnds = new Date(subscriber.trial_ends_at);
    const msLeft = trialEnds.getTime() - now.getTime();
    const hoursLeft = Math.max(0, Math.ceil(msLeft / (1000 * 60 * 60)));
    const messagesLeft = Math.max(0, TRIAL_MESSAGE_LIMIT - subscriber.messages_count);

    if (now > trialEnds) {
      await supabaseAdmin
        .from("subscribers")
        .update({ status: "expired", updated_at: now.toISOString() })
        .eq("phone_number", phone);

      return {
        hasAccess: false,
        status: "expired",
        plan: "free_trial",
        isTrial: false,
        isExpired: true,
        isVip: false,
        messagesLeft: 0,
        trialHoursLeft: 0,
        reason: "trial_expired",
      };
    }

    if (subscriber.messages_count >= TRIAL_MESSAGE_LIMIT) {
      return {
        hasAccess: false,
        status: "trial",
        plan: "free_trial",
        isTrial: true,
        isExpired: true,
        isVip: false,
        messagesLeft: 0,
        trialHoursLeft: hoursLeft,
        reason: "message_limit_exceeded",
      };
    }

    return {
      hasAccess: true,
      status: "trial",
      plan: "free_trial",
      isTrial: true,
      isExpired: false,
      isVip: false,
      messagesLeft,
      trialHoursLeft: hoursLeft,
    };
  }

  // Default Expired / Cancelled
  return {
    hasAccess: false,
    status: subscriber.status,
    plan: subscriber.plan,
    isTrial: false,
    isExpired: true,
    isVip: false,
    messagesLeft: 0,
    trialHoursLeft: 0,
    reason: "subscription_expired",
  };
}

/**
 * Increment the message counter for ANY subscriber (both trial and active/registered).
 */
export async function incrementSubscriberMessageCount(rawPhone: string): Promise<void> {
  const variants = getPhoneVariants(rawPhone);
  const { supabaseAdmin } = await import("@/integrations/supabase/client.server");

  const { data: rows } = await supabaseAdmin
    .from("subscribers")
    .select("id, phone_number, messages_count, status, plan")
    .in("phone_number", variants);

  if (rows && rows.length > 0) {
    const activeRow = rows.find((r) => r.status === "active" || r.status === "vip") || rows[0];
    const totalCount = rows.reduce((acc, r) => acc + (r.messages_count || 0), 0) + 1;

    await supabaseAdmin
      .from("subscribers")
      .update({
        messages_count: totalCount,
        updated_at: new Date().toISOString(),
      })
      .eq("id", activeRow.id);

    // Clean up duplicate variant rows if any
    if (rows.length > 1) {
      const obsoleteIds = rows.filter((r) => r.id !== activeRow.id).map((r) => r.id);
      await supabaseAdmin.from("subscribers").delete().in("id", obsoleteIds);
    }
  } else {
    const phone = normalizePhoneNumber(rawPhone);
    const now = new Date();
    const trialEnds = new Date(now.getTime() + TRIAL_DURATION_HOURS * 60 * 60 * 1000);
    await supabaseAdmin
      .from("subscribers")
      .insert({
        phone_number: phone,
        status: "trial",
        plan: "free_trial",
        trial_started_at: now.toISOString(),
        trial_ends_at: trialEnds.toISOString(),
        messages_count: 1,
        created_at: now.toISOString(),
        updated_at: now.toISOString(),
      });
  }
}

/** Backward-compatible alias for incrementSubscriberMessageCount */
export const incrementTrialMessageCount = incrementSubscriberMessageCount;

/**
 * Reset message count for a subscriber.
 */
export async function resetSubscriberMessagesCount(rawPhone: string): Promise<void> {
  const variants = getPhoneVariants(rawPhone);
  const { supabaseAdmin } = await import("@/integrations/supabase/client.server");

  await supabaseAdmin
    .from("subscribers")
    .update({
      messages_count: 0,
      updated_at: new Date().toISOString(),
    })
    .in("phone_number", variants);
}

/**
 * Activate or extend a subscriber's paid access (called by payment webhooks or admin).
 */
export async function activateSubscription(
  rawPhone: string,
  plan: SubscriptionPlan = "monthly",
  durationDays: number = 30,
  notes?: string,
): Promise<SubscriberRow | null> {
  const phone = normalizePhoneNumber(rawPhone);
  const variants = getPhoneVariants(rawPhone);
  const { supabaseAdmin } = await import("@/integrations/supabase/client.server");

  const { data: rows } = await supabaseAdmin
    .from("subscribers")
    .select("*")
    .in("phone_number", variants);

  const existing = rows && rows.length > 0 ? rows[0] : null;
  const targetId = existing?.id;
  const targetPhone = existing ? existing.phone_number : phone;
  const currentCount = rows ? rows.reduce((acc, r) => acc + (r.messages_count || 0), 0) : 0;

  const now = new Date();
  const endsAt = durationDays >= 3650
    ? null
    : new Date(now.getTime() + durationDays * 24 * 60 * 60 * 1000);

  let updatedRow: SubscriberRow | null = null;

  const targetStatus: SubscriberStatus = plan === "free_trial" ? "trial" : "active";

  if (targetId) {
    const { data, error } = await supabaseAdmin
      .from("subscribers")
      .update({
        status: targetStatus,
        plan,
        subscription_ends_at: endsAt ? endsAt.toISOString() : null,
        ...(plan === "free_trial"
          ? {
              trial_started_at: now.toISOString(),
              trial_ends_at: endsAt ? endsAt.toISOString() : null,
            }
          : {}),
        messages_count: currentCount,
        updated_at: now.toISOString(),
        ...(notes ? { notes } : {}),
      })
      .eq("id", targetId)
      .select("*")
      .single();

    if (!error && data) {
      updatedRow = data as SubscriberRow;
    }

    if (rows && rows.length > 1) {
      const obsoleteIds = rows.filter((r) => r.id !== targetId).map((r) => r.id);
      await supabaseAdmin.from("subscribers").delete().in("id", obsoleteIds);
    }
  } else {
    const { data, error } = await supabaseAdmin
      .from("subscribers")
      .insert({
        phone_number: targetPhone,
        status: targetStatus,
        plan,
        subscription_ends_at: endsAt ? endsAt.toISOString() : null,
        trial_started_at: now.toISOString(),
        trial_ends_at: endsAt ? endsAt.toISOString() : now.toISOString(),
        messages_count: 0,
        updated_at: now.toISOString(),
        ...(notes ? { notes } : {}),
      })
      .select("*")
      .single();

    if (!error && data) {
      updatedRow = data as SubscriberRow;
    }
  }

  return updatedRow;
}

/**
 * Format the high-converting WhatsApp Paywall Card.
 */
export function formatPaywallCard(reason?: "trial_expired" | "message_limit_exceeded" | "subscription_expired"): string {
  const headline =
    reason === "trial_expired"
      ? "⏱️ *Your 15-Day Free Trial Has Ended*"
      : reason === "message_limit_exceeded"
        ? "🎯 *Your Free Trial Access Has Concluded*"
        : "🔒 *Talk'n'Bit Premium Membership Required*";

  return [
    headline,
    "",
    "To continue receiving personalized English coaching right here on WhatsApp, unlock Talk'n'Bit Premium:",
    "",
    "✨ *What's included in Premium:*",
    "• Unlimited 1-on-1 AI conversation & grammar corrections",
    "• Interactive *[Why? 💡]* grammar rule breakdowns",
    "• Study Buddy secret-watcher practice rooms",
    "• Bilingual translations & idioms assistance 🇧🇷🇪🇸",
    "• Audio pronunciation & vocabulary drills",
    "",
    "💳 *Choose your plan:*",
    "• *Monthly:* R$ 39,90/month",
    "• *Semiannual:* R$ 31,90/month (20% OFF)",
    "• *Yearly:* R$ 23,90/month (40% OFF - Best Value)",
    "",
    "👇 *Tap a button below to activate instant access:*",
  ].join("\n");
}

/**
 * Format subscription confirmation message when payment completes.
 */
export function formatSubscriptionConfirmation(plan: string, endsAtDate: string): string {
  return [
    "🎉 *Welcome to Talk'n'Bit Premium!*",
    "",
    `Your plan (*${plan.toUpperCase()}*) has been successfully activated!`,
    `🗓️ *Active until:* ${endsAtDate}`,
    "",
    "✨ You now have unlimited access to 1-on-1 English practice, secret-watcher rooms, and bilingual guidance.",
    "",
    "Send a message in English right now to continue practicing! 🚀",
  ].join("\n");
}
