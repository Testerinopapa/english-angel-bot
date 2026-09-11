import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { toast } from "sonner";
import {
  CheckCircle2,
  Sparkles,
  ArrowRight,
  ArrowLeft,
  ShieldCheck,
  Zap,
  HelpCircle,
  Award,
  ChevronDown,
  ChevronUp,
  MessageCircle,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import { CHECKOUT_TRANSLATIONS, type SupportedLang } from "@/lib/checkout-translations";

export const Route = createFileRoute("/pricing")({
  head: () => ({
    meta: [
      { title: "Plans & Pricing — Talk'n'Bit AI English" },
      {
        name: "description",
        content:
          "Simple, transparent pricing for Talk'n'Bit. Chat in English every day on WhatsApp with real-time AI grammar feedback and Study Buddy rooms.",
      },
      { property: "og:title", content: "Plans & Pricing — Talk'n'Bit AI English" },
      {
        property: "og:description",
        content:
          "Invest in your English fluency with 100% WhatsApp-based AI coaching. 15-day risk-free money-back guarantee.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: PricingPage,
});

function PricingPage() {
  const navigate = useNavigate();
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

  const [billingCycle, setBillingCycle] = useState<"monthly" | "semi" | "yearly">("yearly");
  const [openFaq, setOpenFaq] = useState<number | null>(0);

  const handleSelectPlan = (plan: "trial" | "monthly" | "semi" | "yearly") => {
    navigate({
      to: "/checkout",
      search: { plan } as any,
    });
  };

  return (
    <div className="min-h-screen bg-[#fbf9fe] text-[#1f0a44] font-sans antialiased selection:bg-[#fec84d] selection:text-[#1f0a44] relative">
      {/* Background ambient lighting */}
      <div className="fixed inset-0 bg-[radial-gradient(ellipse_80%_50%_at_50%_-10%,rgba(120,60,200,0.08),transparent)] pointer-events-none" />

      {/* Top Navbar */}
      <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-purple-100/80 shadow-xs">
        <div className="max-w-6xl mx-auto px-6 h-18 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Link to="/" className="flex items-center gap-2 group">
              <img
                src="/images/logo.png"
                alt="Talk 'n' bit"
                className="h-10 w-auto object-contain transition-transform group-hover:scale-105"
              />
            </Link>
            <span className="hidden sm:inline-flex items-center gap-1.5 rounded-full bg-purple-100/80 px-3 py-1 text-xs font-bold text-purple-900 border border-purple-200/70">
              <Sparkles className="w-3.5 h-3.5 text-purple-700" /> {t.common.plansNav}
            </span>
          </div>

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
              <span className="hidden sm:inline">{t.common.backHome}</span>
            </Link>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-6xl mx-auto px-6 py-12 sm:py-16 space-y-16 relative z-10">
        {/* Hero Header */}
        <div className="text-center max-w-3xl mx-auto space-y-4">
          <div className="inline-flex items-center gap-1.5 rounded-full bg-purple-100 px-3.5 py-1 text-xs font-bold text-purple-900 border border-purple-200 shadow-2xs">
            <Sparkles className="w-3.5 h-3.5 text-purple-700" />
            <span>{t.pricing.badge}</span>
          </div>
          <h1 className="text-3xl sm:text-5xl font-extrabold tracking-tight text-[#1f0a44] leading-tight">
            {t.pricing.heading}
          </h1>
          <p className="text-sm sm:text-base text-slate-600 leading-relaxed max-w-2xl mx-auto">
            {t.pricing.subheading}
          </p>

          {/* Billing Interval Toggle Pill */}
          <div className="pt-4 flex items-center justify-center">
            <div className="inline-flex items-center p-1.5 rounded-full bg-purple-100/80 border border-purple-200/80 shadow-inner">
              <button
                type="button"
                onClick={() => setBillingCycle("monthly")}
                className={`rounded-full px-4 py-1.5 text-xs font-bold transition-all cursor-pointer ${
                  billingCycle === "monthly"
                    ? "bg-[#240b4a] text-white shadow-xs"
                    : "text-purple-900/70 hover:text-purple-950"
                }`}
              >
                {t.pricing.billingMonthly}
              </button>
              <button
                type="button"
                onClick={() => setBillingCycle("semi")}
                className={`rounded-full px-4 py-1.5 text-xs font-bold transition-all cursor-pointer ${
                  billingCycle === "semi"
                    ? "bg-[#240b4a] text-white shadow-xs"
                    : "text-purple-900/70 hover:text-purple-950"
                }`}
              >
                {t.pricing.billingSemi}
              </button>
              <button
                type="button"
                onClick={() => setBillingCycle("yearly")}
                className={`rounded-full px-4 py-1.5 text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
                  billingCycle === "yearly"
                    ? "bg-[#240b4a] text-white shadow-xs"
                    : "text-purple-900/70 hover:text-purple-950"
                }`}
              >
                <span>{t.pricing.billingYearly}</span>
                <span className="bg-[#fec84d] text-[#1f0a44] text-[10px] font-black px-1.5 py-0.2 rounded-full uppercase tracking-wider">
                  40% OFF
                </span>
              </button>
            </div>
          </div>
        </div>

        {/* 15-Day Free Trial Spotlight Card */}
        <div className="max-w-5xl mx-auto rounded-3xl bg-gradient-to-r from-[#2a0b58] via-[#43147f] to-[#1e0740] p-6 sm:p-8 text-white shadow-2xl relative overflow-hidden border border-purple-400/30">
          <div className="absolute -right-12 -top-12 w-64 h-64 bg-amber-400/10 rounded-full blur-3xl pointer-events-none" />
          <div className="flex flex-col md:flex-row items-center justify-between gap-6 relative z-10">
            <div className="space-y-2 text-center md:text-left">
              <div className="inline-flex items-center gap-2 bg-[#fec84d] text-[#1f0a44] px-3 py-1 rounded-full text-xs font-black uppercase tracking-wider shadow-xs">
                <Sparkles className="w-3.5 h-3.5" />
                <span>{t.pricing.trialBadge}</span>
              </div>
              <h3 className="text-xl sm:text-2xl font-black tracking-tight text-white">
                {t.pricing.trialPlanName} — {t.pricing.trialPrice} {t.pricing.trialPeriod}
              </h3>
              <p className="text-xs sm:text-sm text-purple-200/90 max-w-xl">
                {t.pricing.trialDesc}
              </p>
              <div className="flex flex-wrap items-center justify-center md:justify-start gap-4 pt-1 text-xs text-purple-200">
                <span className="inline-flex items-center gap-1.5">
                  <CheckCircle2 className="w-4 h-4 text-[#fec84d]" />
                  {t.pricing.trialPhoneNotice}
                </span>
                <span className="inline-flex items-center gap-1.5">
                  <CheckCircle2 className="w-4 h-4 text-[#fec84d]" />
                  Instant WhatsApp Activation
                </span>
              </div>
            </div>

            <div className="shrink-0 w-full md:w-auto">
              <Button
                type="button"
                size="lg"
                onClick={() => handleSelectPlan("trial")}
                className="w-full md:w-auto rounded-full bg-[#fec84d] hover:bg-[#fed36c] text-[#1f0a44] font-black text-sm px-8 py-3.5 shadow-xl hover:scale-105 active:scale-95 transition-all cursor-pointer flex items-center justify-center gap-2"
              >
                <span>{t.pricing.trialCta}</span>
                <ArrowRight className="w-4 h-4" />
              </Button>
            </div>
          </div>
        </div>

        {/* 3 Pricing Cards */}
        <div className="grid md:grid-cols-3 gap-8 items-stretch max-w-5xl mx-auto">
          {/* Monthly Card */}
          <div
            className={`rounded-3xl p-8 flex flex-col justify-between transition-all bg-white border shadow-xl ${
              billingCycle === "monthly"
                ? "border-purple-600 ring-2 ring-purple-600/20 scale-[1.02]"
                : "border-purple-100 hover:border-purple-200"
            }`}
          >
            <div>
              <span className="text-xs font-bold uppercase tracking-wider text-slate-500">
                {t.pricing.monthlyPlanName}
              </span>
              <div className="mt-4 flex items-baseline gap-1">
                <span className="text-4xl sm:text-5xl font-extrabold text-[#1f0a44]">
                  {t.pricing.monthlyPrice}
                </span>
                <span className="text-xs text-slate-500 font-semibold">{t.pricing.monthlyPeriod}</span>
              </div>
              <p className="mt-4 text-xs text-slate-600 leading-relaxed">
                {t.pricing.monthlyDesc}
              </p>

              <div className="mt-6 pt-6 border-t border-purple-50 space-y-3 text-xs text-slate-700">
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                  <span>Unlimited 1-on-1 AI practice</span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                  <span>Discreet grammar whispers</span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                  <span>Study Buddy rooms (/join 101)</span>
                </div>
              </div>
            </div>

            <div className="mt-8 pt-6 border-t border-purple-50">
              <Button
                type="button"
                onClick={() => handleSelectPlan("monthly")}
                variant="outline"
                className="w-full py-5 rounded-full border-purple-200 text-[#1f0a44] font-bold text-xs hover:bg-purple-50 hover:text-purple-950 transition-all cursor-pointer"
              >
                {t.pricing.monthlyCta}
              </Button>
            </div>
          </div>

          {/* Semiannual Card */}
          <div
            className={`rounded-3xl p-8 flex flex-col justify-between transition-all bg-white border shadow-xl ${
              billingCycle === "semi"
                ? "border-purple-600 ring-2 ring-purple-600/20 scale-[1.02]"
                : "border-purple-100 hover:border-purple-200"
            }`}
          >
            <div>
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold uppercase tracking-wider text-slate-500">
                  {t.pricing.semiPlanName}
                </span>
                <span className="bg-purple-100 text-purple-900 text-[10px] font-extrabold px-2.5 py-0.5 rounded-full">
                  {t.pricing.save20Badge}
                </span>
              </div>
              <div className="mt-4 flex items-baseline gap-1">
                <span className="text-4xl sm:text-5xl font-extrabold text-[#1f0a44]">
                  {t.pricing.semiPrice}
                </span>
                <span className="text-xs text-slate-500 font-semibold">{t.pricing.semiPeriod}</span>
              </div>
              <p className="mt-4 text-xs text-slate-600 leading-relaxed">
                {t.pricing.semiDesc}
              </p>

              <div className="mt-6 pt-6 border-t border-purple-50 space-y-3 text-xs text-slate-700">
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                  <span>Everything in Monthly plan</span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                  <span>Interactive [Why? 💡] Grammar Cards</span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                  <span>Bilingual help in Portuguese/Spanish</span>
                </div>
              </div>
            </div>

            <div className="mt-8 pt-6 border-t border-purple-50">
              <Button
                type="button"
                onClick={() => handleSelectPlan("semi")}
                variant="outline"
                className="w-full py-5 rounded-full border-purple-200 text-[#1f0a44] font-bold text-xs hover:bg-purple-50 hover:text-purple-950 transition-all cursor-pointer"
              >
                {t.pricing.semiCta}
              </Button>
            </div>
          </div>

          {/* Yearly Card (Featured / Best Value) */}
          <div className="relative rounded-3xl p-8 flex flex-col justify-between transition-all bg-gradient-to-b from-[#240b4a] via-[#35106b] to-[#170535] text-white shadow-2xl border-2 border-[#fec84d]/60 scale-105">
            {/* Top Ribbon */}
            <div className="absolute -top-3.5 left-1/2 -translate-x-1/2 bg-gradient-to-r from-[#fec84d] to-amber-400 text-[#1f0a44] text-[10px] font-black uppercase tracking-widest px-4 py-1 rounded-full shadow-md">
              👑 {t.pricing.bestValueBadge}
            </div>

            <div>
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold uppercase tracking-wider text-purple-200">
                  {t.pricing.yearlyPlanName}
                </span>
                <span className="bg-emerald-500/30 text-emerald-300 border border-emerald-400/40 text-[10px] font-black px-2.5 py-0.5 rounded-full">
                  {t.pricing.save40Badge}
                </span>
              </div>
              <div className="mt-4 flex items-baseline gap-1">
                <span className="text-4xl sm:text-5xl font-extrabold text-[#fec84d]">
                  {t.pricing.yearlyPrice}
                </span>
                <span className="text-xs text-purple-200 font-semibold">{t.pricing.yearlyPeriod}</span>
              </div>
              <p className="mt-4 text-xs text-purple-100/90 leading-relaxed">
                {t.pricing.yearlyDesc}
              </p>

              <div className="mt-6 pt-6 border-t border-purple-800/60 space-y-3 text-xs text-purple-100">
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-[#fec84d] shrink-0" />
                  <span>Unlimited 365 days of 1-on-1 coaching</span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-[#fec84d] shrink-0" />
                  <span>All grammar cards & secret-watcher rooms</span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-[#fec84d] shrink-0" />
                  <span>Audio & voice note corrections included</span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-[#fec84d] shrink-0" />
                  <span>15-Day 100% money-back guarantee</span>
                </div>
              </div>
            </div>

            <div className="mt-8 pt-6 border-t border-purple-800/60">
              <Button
                type="button"
                onClick={() => handleSelectPlan("yearly")}
                className="w-full py-6 rounded-full bg-gradient-to-r from-[#fec84d] via-amber-400 to-[#e5ab28] text-[#1f0a44] font-black text-xs hover:brightness-105 active:scale-95 shadow-lg shadow-[#fec84d]/20 transition-all cursor-pointer uppercase tracking-wider"
              >
                {t.pricing.yearlyCta}
              </Button>
            </div>
          </div>
        </div>

        {/* Feature Highlights Grid */}
        <div className="rounded-3xl border border-purple-100 bg-white p-8 sm:p-10 shadow-sm space-y-6 max-w-5xl mx-auto">
          <div className="text-center space-y-2">
            <h2 className="text-2xl font-extrabold text-[#1f0a44]">
              {t.pricing.featuresHeading}
            </h2>
            <p className="text-xs text-slate-500">
              Everything you need to eliminate hesitation and speak with natural English confidence.
            </p>
          </div>

          <div className="grid sm:grid-cols-2 gap-4 pt-4">
            {t.pricing.featuresList.map((feat, idx) => (
              <div
                key={idx}
                className="flex items-start gap-3 p-3.5 rounded-2xl bg-purple-50/50 border border-purple-100/70"
              >
                <div className="w-5 h-5 rounded-full bg-emerald-100 border border-emerald-200 text-emerald-700 flex items-center justify-center shrink-0 mt-0.5">
                  <CheckCircle2 className="w-3.5 h-3.5" />
                </div>
                <span className="text-xs font-semibold text-slate-700">{feat}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Free Trial vs Premium Comparison Table */}
        <div className="rounded-3xl border border-purple-100 bg-white overflow-hidden shadow-sm max-w-5xl mx-auto">
          <div className="p-6 sm:p-8 bg-purple-50/50 border-b border-purple-100 text-center space-y-1">
            <h3 className="text-xl font-extrabold text-[#1f0a44]">
              {t.pricing.comparisonHeading}
            </h3>
            <p className="text-xs text-slate-500">
              {t.pricing.comparisonSub}
            </p>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-purple-100/50 uppercase tracking-wider font-bold text-[#1f0a44] border-b border-purple-100">
                <tr>
                  <th className="py-4 px-6">{t.pricing.compColFeature}</th>
                  <th className="py-4 px-6 text-slate-500">{t.pricing.compColTrial}</th>
                  <th className="py-4 px-6 text-purple-950 font-black">{t.pricing.compColPremium}</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-purple-50">
                {t.pricing.compRows.map((row, idx) => (
                  <tr key={idx} className="hover:bg-purple-50/30 transition-colors">
                    <td className="py-3.5 px-6 font-semibold text-slate-800">{row.name}</td>
                    <td className="py-3.5 px-6 text-slate-500">{row.trial}</td>
                    <td className="py-3.5 px-6 font-bold text-emerald-700 flex items-center gap-1.5">
                      <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                      <span>{row.premium}</span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* 15-Day Money-Back Guarantee Card */}
        <div className="rounded-3xl border border-amber-200/80 bg-[#fef9eb] p-8 sm:p-10 shadow-sm max-w-5xl mx-auto flex flex-col sm:flex-row items-center gap-6">
          <div className="w-16 h-16 rounded-2xl bg-amber-100 border border-amber-200 text-amber-800 flex items-center justify-center shrink-0">
            <Award className="w-8 h-8 text-amber-700" />
          </div>
          <div className="space-y-1.5 text-center sm:text-left flex-1">
            <h4 className="text-lg font-bold text-amber-950">{t.pricing.guaranteeTitle}</h4>
            <p className="text-xs text-amber-900/85 leading-relaxed">{t.pricing.guaranteeDesc}</p>
          </div>
          <div className="shrink-0">
            <Button
              type="button"
              onClick={() => handleSelectPlan("yearly")}
              className="rounded-full bg-[#240b4a] text-white px-6 py-5 text-xs font-bold hover:bg-purple-900 shadow-md transition-all cursor-pointer"
            >
              Start Risk-Free 🚀
            </Button>
          </div>
        </div>

        {/* FAQ Section */}
        <div className="max-w-4xl mx-auto space-y-6 pt-6">
          <div className="text-center space-y-2">
            <h3 className="text-2xl font-extrabold text-[#1f0a44]">{t.pricing.faqHeading}</h3>
            <p className="text-xs text-slate-500">{t.pricing.faqSub}</p>
          </div>

          <div className="space-y-3">
            {t.pricing.faqs.map((faq, idx) => {
              const isOpen = openFaq === idx;
              return (
                <div
                  key={idx}
                  className="rounded-2xl border border-purple-100 bg-white overflow-hidden shadow-2xs transition-all"
                >
                  <button
                    type="button"
                    onClick={() => setOpenFaq(isOpen ? null : idx)}
                    className="w-full px-6 py-4 text-left flex items-center justify-between text-xs sm:text-sm font-bold text-[#1f0a44] hover:bg-purple-50/40 transition-colors cursor-pointer"
                  >
                    <span>{faq.q}</span>
                    {isOpen ? (
                      <ChevronUp className="w-4 h-4 text-purple-700 shrink-0" />
                    ) : (
                      <ChevronDown className="w-4 h-4 text-slate-400 shrink-0" />
                    )}
                  </button>
                  {isOpen && (
                    <div className="px-6 pb-4 text-xs text-slate-600 leading-relaxed border-t border-purple-50 pt-3">
                      {faq.a}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>

        {/* Bottom CTA Banner */}
        <div className="rounded-3xl bg-gradient-to-r from-[#240b4a] via-[#35106b] to-[#170535] p-8 sm:p-12 text-center text-white space-y-6 shadow-xl max-w-5xl mx-auto">
          <h3 className="text-2xl sm:text-3xl font-extrabold text-white">
            Ready to Start Speaking English Every Day?
          </h3>
          <p className="text-xs sm:text-sm text-purple-100/80 max-w-xl mx-auto">
            Choose your plan and your WhatsApp number will be activated immediately upon confirmation.
          </p>
          <div>
            <Button
              type="button"
              onClick={() => handleSelectPlan("yearly")}
              className="rounded-full bg-gradient-to-r from-[#fec84d] to-amber-400 text-[#1f0a44] px-10 py-6 text-xs font-black shadow-lg shadow-purple-950/40 hover:scale-105 active:scale-95 transition-all cursor-pointer uppercase tracking-wider"
            >
              Get Started with Yearly (40% OFF) 🚀
            </Button>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="mt-20 border-t border-purple-100 bg-white py-8 text-center text-xs text-slate-500">
        <div className="max-w-6xl mx-auto px-6 flex flex-col sm:flex-row items-center justify-between gap-4">
          <span>Copyright &copy; 2025 {t.common.brandName}. All rights reserved.</span>
          <div className="flex items-center gap-4 text-xs">
            <Link to="/terms" className="hover:text-purple-900 transition-colors">
              Terms of Use
            </Link>
            <Link to="/privacy" className="hover:text-purple-900 transition-colors">
              Privacy Policy
            </Link>
          </div>
        </div>
      </footer>
    </div>
  );
}
