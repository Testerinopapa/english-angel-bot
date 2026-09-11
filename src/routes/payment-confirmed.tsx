import { createFileRoute, Link, useSearch } from "@tanstack/react-router";
import { useState } from "react";
import { toast } from "sonner";
import {
  CheckCircle2,
  Sparkles,
  ArrowRight,
  ArrowLeft,
  MessageCircle,
  ShieldCheck,
  Award,
  Calendar,
  CreditCard,
  Phone,
  QrCode,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import { CHECKOUT_TRANSLATIONS, type SupportedLang } from "@/lib/checkout-translations";
import { getWhatsAppUrl } from "@/lib/checkout.functions";

export const Route = createFileRoute("/payment-confirmed")({
  head: () => ({
    meta: [
      { title: "Payment Confirmed — Talk'n'Bit AI English" },
      {
        name: "description",
        content: "Your Talk'n'Bit WhatsApp English access has been activated successfully.",
      },
      { property: "og:title", content: "Payment Confirmed — Talk'n'Bit AI English" },
      { name: "robots", content: "noindex, nofollow" },
    ],
  }),
  validateSearch: (search: Record<string, unknown>) => {
    return {
      orderId: String(search.orderId || "TNB-" + Math.floor(100000 + Math.random() * 900000)),
      phone: String(search.phone || "5513991878104"),
      name: String(search.name || "Student"),
      plan: String(search.plan || "yearly"),
      paymentMethod: String(search.paymentMethod || "pix"),
      amount: String(search.amount || "R$ 252,00"),
      expiresAt: String(search.expiresAt || new Date(Date.now() + 365 * 24 * 60 * 60 * 1000).toISOString()),
    };
  },
  component: PaymentConfirmedPage,
});

function PaymentConfirmedPage() {
  const search = useSearch({ from: "/payment-confirmed" });

  const [selectedLang, setSelectedLang] = useState<SupportedLang>(() => {
    if (typeof window !== "undefined") {
      const saved = localStorage.getItem("talknbit_lang") as SupportedLang;
      if (saved && (saved === "en" || saved === "pt" || saved === "es")) {
        return saved;
      }
      const browserLang = navigator.language?.toLowerCase() || "";
      if (browserLang.startsWith("pt")) return "pt";
      if (browserLang.startsWith("es")) return "es";
    }
    return "en";
  });

  const t = CHECKOUT_TRANSLATIONS[selectedLang] || CHECKOUT_TRANSLATIONS.en;

  const handleSelectLanguage = (lang: SupportedLang) => {
    setSelectedLang(lang);
    if (typeof window !== "undefined") {
      localStorage.setItem("talknbit_lang", lang);
    }
    const names = { en: "English", pt: "Português (Brasil)", es: "Español" };
    toast.success(`Language set to ${names[lang]}`);
  };

  const planTitles: Record<string, string> = {
    trial: t.pricing.trialPlanName,
    monthly: t.pricing.monthlyPlanName,
    semi: t.pricing.semiPlanName,
    yearly: t.pricing.yearlyPlanName,
    lifetime: "Lifetime VIP",
  };
  const planDisplayName = planTitles[search.plan] || t.pricing.yearlyPlanName;

  const starterMessage =
    search.plan === "trial"
      ? `Hello Talk'n'Bit! 🚀 I just activated my 15-Day Free Trial (Order #${search.orderId}). My name is ${search.name}. I'm ready to start practicing English!`
      : `Hello Talk'n'Bit! 🚀 I just activated my ${planDisplayName} (Order #${search.orderId}). My name is ${search.name}. I'm ready to start practicing English!`;
  const whatsAppUrl = getWhatsAppUrl(starterMessage);

  const formattedDate = new Date(search.expiresAt).toLocaleDateString([], {
    year: "numeric",
    month: "long",
    day: "numeric",
  });

  return (
    <div className="min-h-screen bg-[#fbf9fe] text-[#1f0a44] font-sans antialiased selection:bg-[#fec84d] selection:text-[#1f0a44] relative">
      {/* Background ambient lighting */}
      <div className="fixed inset-0 bg-[radial-gradient(ellipse_80%_45%_at_50%_-15%,rgba(16,185,129,0.08),transparent)] pointer-events-none" />

      {/* Top Navbar */}
      <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-purple-100/80 shadow-xs">
        <div className="max-w-4xl mx-auto px-6 h-18 flex items-center justify-between">
          <Link to="/" className="flex items-center gap-2 group">
            <img
              src="/images/logo.png"
              alt="Talk 'n' bit"
              className="h-10 w-auto object-contain transition-transform group-hover:scale-105"
            />
          </Link>

          <div className="flex items-center gap-3">
            {/* Language Switcher Pills */}
            <div className="flex items-center bg-purple-50/90 p-0.5 rounded-full border border-purple-200/70 text-[11px] font-bold">
              {(["en", "pt", "es"] as const).map((lang) => (
                <button
                  key={lang}
                  type="button"
                  onClick={() => handleSelectLanguage(lang)}
                  className={`px-2 py-1 rounded-full transition-all cursor-pointer uppercase ${
                    selectedLang === lang
                      ? "bg-[#240b4a] text-white shadow-xs"
                      : "text-purple-900/80 hover:text-purple-950"
                  }`}
                  title={lang === "en" ? "English" : lang === "pt" ? "Português" : "Español"}
                >
                  {lang}
                </button>
              ))}
            </div>

            <Link
              to="/"
              className="inline-flex items-center gap-1.5 rounded-full border border-purple-900/15 bg-purple-50/70 px-4 py-1.5 text-xs font-semibold text-[#1e0a45] transition-all hover:bg-purple-100 hover:border-purple-900/30"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              <span>{t.confirmation.homeBtn}</span>
            </Link>
          </div>
        </div>
      </header>

      {/* Main Container */}
      <main className="max-w-3xl mx-auto px-6 py-12 sm:py-16 relative z-10 space-y-8">
        {/* Celebratory Banner Card */}
        <div className="rounded-3xl border border-emerald-200 bg-white p-8 sm:p-10 shadow-xl text-center space-y-4">
          <div className="mx-auto w-16 h-16 rounded-full bg-emerald-50 border border-emerald-200 flex items-center justify-center text-emerald-600 shadow-md">
            <CheckCircle2 className="w-9 h-9" />
          </div>

          <div className="space-y-1.5">
            <span className="text-xs font-extrabold uppercase tracking-widest text-emerald-700 bg-emerald-100/80 px-3.5 py-1 rounded-full border border-emerald-200">
              {search.plan === "trial" ? t.checkout.trialReceiptBadge : t.confirmation.celebration}
            </span>
            <h1 className="text-2xl sm:text-4xl font-extrabold text-[#1f0a44] pt-1">
              {search.plan === "trial" ? t.confirmation.trialActivatedTitle : t.confirmation.heading}
            </h1>
            <p className="text-xs sm:text-sm text-slate-600 max-w-md mx-auto leading-relaxed">
              {search.plan === "trial" ? t.confirmation.trialActivatedSub : t.confirmation.subheading}
            </p>
          </div>

          {/* Primary Action Button: Open WhatsApp */}
          <div className="pt-4 max-w-md mx-auto">
            <a
              href={whatsAppUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="block w-full py-5 px-6 rounded-full bg-emerald-600 hover:bg-emerald-700 text-white font-extrabold text-xs sm:text-sm shadow-xl shadow-emerald-700/25 transition-all hover:scale-[1.02] active:scale-[0.98] text-center"
            >
              {search.plan === "trial" ? t.confirmation.trialOpenWhatsAppBtn : t.confirmation.openWhatsAppBtn}
            </a>
          </div>
        </div>

        {/* Order Receipt Details Card */}
        <div className="rounded-3xl border border-purple-100 bg-white p-6 sm:p-8 shadow-sm space-y-4">
          <h2 className="text-sm font-bold text-[#1f0a44] pb-3 border-b border-purple-50 flex items-center justify-between">
            <span>{t.confirmation.receiptTitle}</span>
            <span className="text-[11px] font-bold text-emerald-700 bg-emerald-50 border border-emerald-200 px-2.5 py-0.5 rounded-full flex items-center gap-1">
              <CheckCircle2 className="w-3 h-3" /> {t.confirmation.statusActive}
            </span>
          </h2>

          <div className="grid sm:grid-cols-2 gap-4 text-xs">
            <div className="p-3.5 rounded-2xl bg-slate-50/70 border border-slate-100 space-y-1">
              <span className="text-slate-400 font-medium">{t.confirmation.orderIdLabel}</span>
              <p className="font-mono font-bold text-purple-950 text-sm">{search.orderId}</p>
            </div>

            <div className="p-3.5 rounded-2xl bg-slate-50/70 border border-slate-100 space-y-1">
              <span className="text-slate-400 font-medium">{t.confirmation.phoneLabel}</span>
              <p className="font-mono font-bold text-purple-950 text-sm">+{search.phone}</p>
            </div>

            <div className="p-3.5 rounded-2xl bg-slate-50/70 border border-slate-100 space-y-1">
              <span className="text-slate-400 font-medium">{t.confirmation.planLabel}</span>
              <p className="font-bold text-[#1f0a44] text-sm">{planDisplayName}</p>
            </div>

            <div className="p-3.5 rounded-2xl bg-slate-50/70 border border-slate-100 space-y-1">
              <span className="text-slate-400 font-medium">{t.confirmation.expiresLabel}</span>
              <p className="font-semibold text-slate-800 text-sm">{formattedDate}</p>
            </div>
          </div>
        </div>

        {/* Next Steps Guide */}
        <div className="rounded-3xl border border-purple-100 bg-white p-6 sm:p-8 shadow-sm space-y-4">
          <h3 className="text-sm font-bold text-[#1f0a44] pb-2 border-b border-purple-50">
            {t.confirmation.nextStepsTitle}
          </h3>

          <div className="space-y-3 pt-1">
            <div className="flex items-start gap-3 p-3 rounded-2xl bg-purple-50/50 border border-purple-100/60">
              <span className="w-6 h-6 rounded-full bg-purple-200/80 text-purple-900 flex items-center justify-center text-xs font-black shrink-0 mt-0.5">
                1
              </span>
              <p className="text-xs text-slate-700 leading-relaxed font-medium">
                {t.confirmation.step1}
              </p>
            </div>

            <div className="flex items-start gap-3 p-3 rounded-2xl bg-purple-50/50 border border-purple-100/60">
              <span className="w-6 h-6 rounded-full bg-purple-200/80 text-purple-900 flex items-center justify-center text-xs font-black shrink-0 mt-0.5">
                2
              </span>
              <p className="text-xs text-slate-700 leading-relaxed font-medium">
                {t.confirmation.step2}
              </p>
            </div>

            <div className="flex items-start gap-3 p-3 rounded-2xl bg-purple-50/50 border border-purple-100/60">
              <span className="w-6 h-6 rounded-full bg-purple-200/80 text-purple-900 flex items-center justify-center text-xs font-black shrink-0 mt-0.5">
                3
              </span>
              <p className="text-xs text-slate-700 leading-relaxed font-medium">
                {t.confirmation.step3}
              </p>
            </div>
          </div>
        </div>

        {/* Support & Home Link */}
        <div className="text-center space-y-3 pt-2">
          <p className="text-xs text-slate-500">
            {t.confirmation.needHelp} <a href={getWhatsAppUrl("Hello! I need help with my Talk'n'Bit order #" + search.orderId)} target="_blank" rel="noopener noreferrer" className="text-purple-700 font-semibold underline underline-offset-4 hover:text-purple-950">{t.confirmation.contactSupport}</a>
          </p>
          <div>
            <Link
              to="/"
              className="inline-flex items-center justify-center rounded-full border border-purple-200 bg-white px-6 py-2.5 text-xs font-bold text-[#1f0a44] shadow-xs hover:bg-purple-50 transition-colors"
            >
              {t.confirmation.homeBtn}
            </Link>
          </div>
        </div>
      </main>
    </div>
  );
}
