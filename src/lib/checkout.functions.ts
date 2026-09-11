import { createServerFn } from "@tanstack/react-start";

export const BASE_WA_NUMBER = "5513991878104";

export function getWhatsAppUrl(customMessage: string) {
  return `https://wa.me/${BASE_WA_NUMBER}?text=${encodeURIComponent(customMessage)}`;
}

export type CheckoutPlanId = "monthly" | "semi" | "yearly" | "lifetime";
export type CheckoutPaymentMethod = "pix" | "credit_card";

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
    const data = input as Record<string, any>;

    const phone = String(data.phone || "").trim();
    if (!phone || phone.replace(/\D/g, "").length < 8) {
      throw new Error("A valid WhatsApp phone number is required");
    }

    const name = String(data.name || "").trim();
    if (!name) {
      throw new Error("Full name is required");
    }

    const email = String(data.email || "").trim();
    if (!email || !email.includes("@")) {
      throw new Error("A valid email address is required");
    }

    const plan = (data.plan || "yearly") as CheckoutPlanId;
    const paymentMethod = (data.paymentMethod || "pix") as CheckoutPaymentMethod;

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
    const { activateSubscription, normalizePhoneNumber } = await import("@/lib/subscriptions.server");

    // Clean and normalize phone number
    const normalizedDigits = normalizePhoneNumber(data.phone);
    const orderId = `TNB-${Math.floor(100000 + Math.random() * 900000)}`;

    let planKey: "monthly" | "semiannual" | "yearly" | "lifetime" = "yearly";
    let durationDays = 365;
    let planName = "Yearly Plan";
    let amountFormatted = "R$ 252,00";

    if (data.plan === "monthly") {
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

    const notes = `Online Checkout Order #${orderId} | Buyer: ${data.name} (${data.email}) | Payment: ${data.paymentMethod.toUpperCase()}${
      data.paymentMethod === "credit_card" && data.installments && data.installments > 1
        ? ` (${data.installments}x)`
        : ""
    }`;

    // Immediately activate the subscriber in Supabase!
    const sub = await activateSubscription(normalizedDigits, planKey, durationDays, notes);

    const now = new Date();
    const expiryDate = new Date(now.getTime() + durationDays * 24 * 60 * 60 * 1000);
    const expiresAt = sub?.subscription_ends_at || expiryDate.toISOString();

    const starterMessage = `Hello Talk'n'Bit! 🚀 I just subscribed to the ${planName} (Order #${orderId}). My name is ${data.name}. I'm ready to start practicing English!`;
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
