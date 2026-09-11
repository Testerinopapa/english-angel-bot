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

export const TRIAL_MESSAGE_LIMIT = 15;
export const TRIAL_DURATION_HOURS = 24;

/** Canonicalize phone number to digits only: +55 (13) 99187-8104 -> 5513991878104 */
export function normalizePhoneNumber(rawPhone: string): string {
  return rawPhone.replace(/\D/g, "");
}

/**
 * Fetch or initialize a subscriber record for a given WhatsApp phone number.
 * Every new phone number automatically receives a 24-hour / 15-message trial.
 */
export async function getOrCreateSubscriber(rawPhone: string): Promise<EntitlementResult> {
  const phone = normalizePhoneNumber(rawPhone);
  const { supabaseAdmin } = await import("@/integrations/supabase/client.server");

  const { data: existing } = await supabaseAdmin
    .from("subscribers")
    .select("*")
    .eq("phone_number", phone)
    .maybeSingle();

  let subscriber: SubscriberRow;

  if (!existing) {
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
  } else {
    subscriber = existing as SubscriberRow;
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
 * Increment the message counter for a user on trial.
 */
export async function incrementTrialMessageCount(rawPhone: string): Promise<void> {
  const phone = normalizePhoneNumber(rawPhone);
  const { supabaseAdmin } = await import("@/integrations/supabase/client.server");

  // Fetch current count to avoid race condition or raw sql
  const { data } = await supabaseAdmin
    .from("subscribers")
    .select("messages_count, status")
    .eq("phone_number", phone)
    .maybeSingle();

  if (data && data.status === "trial") {
    await supabaseAdmin
      .from("subscribers")
      .update({
        messages_count: (data.messages_count || 0) + 1,
        updated_at: new Date().toISOString(),
      })
      .eq("phone_number", phone);
  }
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
  const { supabaseAdmin } = await import("@/integrations/supabase/client.server");

  const now = new Date();
  const endsAt = new Date(now.getTime() + durationDays * 24 * 60 * 60 * 1000);

  const { data, error } = await supabaseAdmin
    .from("subscribers")
    .upsert(
      {
        phone_number: phone,
        status: "active",
        plan,
        subscription_ends_at: endsAt.toISOString(),
        updated_at: now.toISOString(),
        ...(notes ? { notes } : {}),
      },
      { onConflict: "phone_number" },
    )
    .select("*")
    .single();

  if (error) {
    console.error("Failed to activate subscription:", error);
    return null;
  }
  return data as SubscriberRow;
}

/**
 * Format the high-converting WhatsApp Paywall Card.
 */
export function formatPaywallCard(reason?: "trial_expired" | "message_limit_exceeded" | "subscription_expired"): string {
  const headline =
    reason === "trial_expired"
      ? "⏱️ *Your 24-Hour Free Trial Has Ended*"
      : reason === "message_limit_exceeded"
        ? "🎯 *You've Used Your 15 Free Trial Messages*"
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
