import { createServerFn } from "@tanstack/react-start";

export const BASE_WA_NUMBER = "5513991878104";

export function getWhatsAppUrl(customMessage: string) {
  return `https://wa.me/${BASE_WA_NUMBER}?text=${encodeURIComponent(customMessage)}`;
}

export type CheckoutPlanId = "trial" | "monthly" | "semi" | "yearly" | "lifetime";
export type CheckoutPaymentMethod = "pix" | "credit_card" | "free_trial";

export interface CheckoutInput {
  phone: string;
  name: string;
  email: string;
  plan: CheckoutPlanId;
  paymentMethod: CheckoutPaymentMethod;
  installments?: number;
  countryCode?: string;
}

export interface CheckoutResult {
  ok: boolean;
  orderId: string;
  phone: string;
  name: string;
  email: string;
  plan: CheckoutPlanId;
  planName: string;
  amountFormatted: string;
  expiresAt: string;
  paymentMethod: CheckoutPaymentMethod;
  whatsAppUrl: string;
  notes?: string;
}

export const processCheckout = createServerFn({ method: "POST" })
  .inputValidator((input: unknown): CheckoutInput => {
    if (!input || typeof input !== "object") {
      throw new Error("Invalid checkout payload");
    }
    const data = input as any;

    const phone = String(data.phone || "").trim();
    if (!phone || phone.replace(/\D/g, "").length < 8) {
      throw new Error("A valid WhatsApp phone number is required");
    }

    const name = String(data.name || "").trim();
    if (!name) {
      throw new Error("Full name is required");
    }

    const email = String(data.email || "").trim();

    const plan = (data.plan || "yearly") as CheckoutPlanId;
    const paymentMethod = (data.paymentMethod || (plan === "trial" ? "free_trial" : "pix")) as CheckoutPaymentMethod;

    return {
      phone,
      name,
      email,
      plan,
      paymentMethod,
      installments: Number(data.installments) || 1,
      countryCode: String(data.countryCode || "55"),
    };
  })
  .handler(async ({ data }): Promise<CheckoutResult> => {
    const { activateSubscription, normalizePhoneNumber, getPhoneVariants } = await import("@/lib/subscriptions.server");
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");

    // Clean and normalize phone number
    const normalizedDigits = normalizePhoneNumber(data.phone);
    const orderId = `TNB-${Math.floor(100000 + Math.random() * 900000)}`;

    let planKey: "free_trial" | "monthly" | "semiannual" | "yearly" | "lifetime" = "yearly";
    let durationDays = 365;
    let planName = "Yearly Plan";
    let amountFormatted = "R$ 252,00";

    if (data.plan === "trial") {
      // 1-Phone Verification: Check if this phone number already claimed / expired a free trial
      const variants = getPhoneVariants(normalizedDigits);
      const { data: existingRows } = await supabaseAdmin
        .from("subscribers")
        .select("id, status, plan, trial_started_at, trial_ends_at, subscription_ends_at")
        .in("phone_number", variants);

      if (existingRows && existingRows.length > 0) {
        const now = new Date();
        const hasActivePaid = existingRows.some((r) => r.status === "active" || r.status === "vip");
        if (hasActivePaid) {
          throw new Error("This WhatsApp number is already subscribed to an active plan!");
        }

        const pastTrial = existingRows.find((r) => r.plan === "free_trial" || r.trial_started_at);
        if (pastTrial) {
          const trialEnds = pastTrial.trial_ends_at ? new Date(pastTrial.trial_ends_at) : null;
          if (trialEnds && now > trialEnds) {
            throw new Error(
              "This WhatsApp phone number has already completed its 15-day free trial. Please select a monthly or yearly plan to continue."
            );
          }
        }
      }

      planKey = "free_trial";
      durationDays = 15;
      planName = "15-Day Free Trial";
      amountFormatted = "R$ 0,00";
    } else if (data.plan === "monthly") {
      planKey = "monthly";
      durationDays = 30;
      planName = "Monthly Plan";
      amountFormatted = "R$ 36,00";
    } else if (data.plan === "semi") {
      planKey = "semiannual";
      durationDays = 180;
      planName = "Semiannual Plan";
      amountFormatted = "R$ 174,00";
    } else if (data.plan === "yearly") {
      planKey = "yearly";
      durationDays = 365;
      planName = "Yearly Plan";
      amountFormatted = "R$ 252,00";
    } else if (data.plan === "lifetime") {
      planKey = "lifetime";
      durationDays = 3650;
      planName = "Lifetime VIP";
      amountFormatted = "R$ 497,00";
    }

    const cleanEmail = data.email ? data.email.toLowerCase().trim() : "";
    const emailSnippet = cleanEmail ? ` (${cleanEmail})` : "";
    const emailTag = cleanEmail ? ` [email:${cleanEmail}]` : "";
    const notes = data.plan === "trial"
      ? `15-Day Free Trial Activation | Phone: ${normalizedDigits} | User: ${data.name}${emailSnippet}${emailTag}`
      : `Online Checkout Order #${orderId} | Buyer: ${data.name}${emailSnippet}${emailTag} | Payment: ${data.paymentMethod.toUpperCase()}${
          data.paymentMethod === "credit_card" && data.installments && data.installments > 1
            ? ` (${data.installments}x)`
            : ""
        }`;

    // Immediately activate or provision the subscriber in Supabase!
    const sub = await activateSubscription(normalizedDigits, planKey, durationDays, notes);

    const now = new Date();
    const expiryDate = new Date(now.getTime() + durationDays * 24 * 60 * 60 * 1000);
    const expiresAt = sub?.subscription_ends_at || sub?.trial_ends_at || expiryDate.toISOString();

    const starterMessage = data.plan === "trial"
      ? `Hello Talk'n'Bit! 🚀 I just activated my 15-Day Free Trial (Order #${orderId}). My name is ${data.name}. I'm ready to start practicing English!`
      : `Hello Talk'n'Bit! 🚀 I just subscribed to the ${planName} (Order #${orderId}). My name is ${data.name}. I'm ready to start practicing English!`;
    const whatsAppUrl = getWhatsAppUrl(starterMessage);

    return {
      ok: true,
      orderId,
      phone: normalizedDigits,
      name: data.name,
      email: data.email,
      plan: data.plan,
      planName,
      amountFormatted,
      expiresAt,
      paymentMethod: data.paymentMethod,
      whatsAppUrl,
      notes,
    };
  });
