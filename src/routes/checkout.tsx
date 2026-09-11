import { createFileRoute, Link, useNavigate, useSearch } from "@tanstack/react-router";
import { useServerFn } from "@tanstack/react-start";
import { useState, useMemo, useEffect } from "react";
import { toast } from "sonner";
import {
  Lock,
  ShieldCheck,
  CheckCircle2,
  ArrowLeft,
  Sparkles,
  CreditCard,
  QrCode,
  Copy,
  Check,
  Clock,
  HelpCircle,
  MessageCircle,
  Award,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { CHECKOUT_TRANSLATIONS, type SupportedLang } from "@/lib/checkout-translations";
import { processCheckout, type CheckoutPlanId, type CheckoutPaymentMethod } from "@/lib/checkout.functions";

export const Route = createFileRoute("/checkout")({
  head: () => ({
    meta: [
      { title: "Checkout — Talk'n'Bit AI English" },
      {
        name: "description",
        content: "Secure checkout for Talk'n'Bit. Instant WhatsApp English coaching activation.",
      },
      { property: "og:title", content: "Checkout — Talk'n'Bit AI English" },
      { property: "og:description", content: "Secure checkout for Talk'n'Bit." },
      { name: "robots", content: "noindex, nofollow" },
    ],
  }),
  validateSearch: (search: Record<string, unknown>): { plan?: CheckoutPlanId } => {
    return {
      plan: (search.plan as CheckoutPlanId) || "yearly",
    };
  },
  component: CheckoutPage,
});

const COUNTRY_CODES = [
  { code: "55", label: "🇧🇷 Brazil (+55)", example: "13991878104" },
  { code: "1", label: "🇺🇸 United States (+1)", example: "4155552671" },
  { code: "34", label: "🇪🇸 Spain (+34)", example: "612345678" },
  { code: "52", label: "🇲🇽 Mexico (+52)", example: "5512345678" },
  { code: "57", label: "🇨🇴 Colombia (+57)", example: "3001234567" },
  { code: "54", label: "🇦🇷 Argentina (+54)", example: "91123456789" },
  { code: "56", label: "🇨🇱 Chile (+56)", example: "912345678" },
  { code: "351", label: "🇵🇹 Portugal (+351)", example: "912345678" },
  { code: "44", label: "🇬🇧 UK (+44)", example: "7911123456" },
];

function CheckoutPage() {
  const navigate = useNavigate();
  const search = useSearch({ from: "/checkout" });
  const runCheckout = useServerFn(processCheckout);

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

  // Form states
  const [plan, setPlan] = useState<CheckoutPlanId>(search.plan || "yearly");
  const [countryCode, setCountryCode] = useState("55");
  const [rawPhone, setRawPhone] = useState("");
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [paymentMethod, setPaymentMethod] = useState<CheckoutPaymentMethod>("pix");
  const [installments, setInstallments] = useState(1);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Credit Card fields (simulated)
  const [cardNumber, setCardNumber] = useState("");
  const [cardName, setCardName] = useState("");
  const [cardExpiry, setCardExpiry] = useState("");
  const [cardCvv, setCardCvv] = useState("");

  // Pix code copy state
  const [pixCopied, setPixCopied] = useState(false);

  // Price calculations
  const planInfo = useMemo(() => {
    if (plan === "monthly") {
      return {
        id: "monthly",
        name: t.pricing.monthlyPlanName,
        billingCycle: "Monthly",
        regularPrice: 432,
        regularPriceFormatted: "R$ 432,00",
        price: 36,
        priceFormatted: "R$ 36,00",
        discountFormatted: "R$ 0,00",
        total: 36,
        totalFormatted: "R$ 36,00",
        periodText: "/ month",
        badge: null,
      };
    }
    if (plan === "semi") {
      return {
        id: "semi",
        name: t.pricing.semiPlanName,
        billingCycle: "Billed semiannually",
        regularPrice: 216,
        regularPriceFormatted: "R$ 216,00",
        price: 29,
        priceFormatted: "R$ 174,00",
        discountFormatted: "- R$ 42,00 (20% OFF)",
        total: 174,
        totalFormatted: "R$ 174,00",
        periodText: "/ 6 months",
        badge: t.pricing.save20Badge,
      };
    }
    // Default: yearly
    return {
      id: "yearly",
      name: t.pricing.yearlyPlanName,
      billingCycle: "Billed annually (365 days)",
      regularPrice: 432,
      regularPriceFormatted: "R$ 432,00",
      price: 21,
      priceFormatted: "R$ 252,00",
      discountFormatted: "- R$ 180,00 (40% OFF)",
      total: 252,
      totalFormatted: "R$ 252,00",
      periodText: "/ year",
      badge: t.pricing.save40Badge,
    };
  }, [plan, t]);

  const simulatedPixCode = useMemo(() => {
    return `00020126580014br.gov.bcb.pix0136talknbit-pay-991878104520400005303986540${planInfo.total}.005802BR5913TALKNBIT LTDA6009SAO PAULO62070503***6304D1A8`;
  }, [planInfo.total]);

  const handleCopyPix = () => {
    if (navigator.clipboard) {
      navigator.clipboard.writeText(simulatedPixCode);
      setPixCopied(true);
      toast.success(t.checkout.pixCopiedBtn);
      setTimeout(() => setPixCopied(false), 3000);
    }
  };

  const handleFormatCardNumber = (val: string) => {
    const digits = val.replace(/\D/g, "").slice(0, 16);
    const parts = digits.match(/.{1,4}/g) || [];
    setCardNumber(parts.join(" "));
  };

  const handleFormatExpiry = (val: string) => {
    const digits = val.replace(/\D/g, "").slice(0, 4);
    if (digits.length >= 3) {
      setCardExpiry(`${digits.slice(0, 2)}/${digits.slice(2)}`);
    } else {
      setCardExpiry(digits);
    }
  };

  const handleSubmitCheckout = async (e: React.FormEvent) => {
    e.preventDefault();

    const cleanDigits = rawPhone.replace(/\D/g, "");
    if (!cleanDigits || cleanDigits.length < 8) {
      toast.error("Please enter a valid WhatsApp phone number");
      return;
    }
    if (!name.trim()) {
      toast.error("Please enter your full name");
      return;
    }
    if (!email.trim() || !email.includes("@")) {
      toast.error("Please enter a valid email address");
      return;
    }

    const fullPhoneNumber = countryCode + cleanDigits;

    setIsSubmitting(true);
    try {
      const result = await runCheckout({
        data: {
          phone: fullPhoneNumber,
          name: name.trim(),
          email: email.trim(),
          plan,
          paymentMethod,
          installments,
          countryCode,
        },
      });

      if (result.ok) {
        toast.success("Order confirmed! Activating WhatsApp access...");
        // Navigate to payment confirmation
        navigate({
          to: "/payment-confirmed",
          search: {
            orderId: result.orderId,
            phone: result.phone,
            name: result.name,
            plan: result.plan,
            paymentMethod: result.paymentMethod,
            amount: result.amountFormatted,
            expiresAt: result.expiresAt,
          } as any,
        });
      }
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Failed to process checkout. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#fbf9fe] text-[#1f0a44] font-sans antialiased selection:bg-[#fec84d] selection:text-[#1f0a44] relative">
      {/* Background ambient lighting */}
      <div className="fixed inset-0 bg-[radial-gradient(ellipse_80%_45%_at_50%_-15%,rgba(120,60,200,0.06),transparent)] pointer-events-none" />

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
            <span className="hidden sm:inline-flex items-center gap-1.5 rounded-full bg-emerald-100/80 px-3 py-1 text-xs font-bold text-emerald-900 border border-emerald-200/70">
              <Lock className="w-3.5 h-3.5 text-emerald-700" /> {t.common.secureCheckout}
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
              to="/pricing"
              className="inline-flex items-center gap-1.5 rounded-full border border-purple-900/15 bg-purple-50/70 px-4 py-1.5 text-xs font-semibold text-[#1e0a45] transition-all hover:bg-purple-100 hover:border-purple-900/30"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">{t.common.plansNav}</span>
            </Link>
          </div>
        </div>
      </header>

      {/* Main Container */}
      <main className="max-w-6xl mx-auto px-6 py-10 sm:py-14 relative z-10">
        <form onSubmit={handleSubmitCheckout} className="grid lg:grid-cols-12 gap-8 items-start">
          {/* Left Column: Form (8 cols) */}
          <div className="lg:col-span-7 space-y-6">
            {/* Header banner */}
            <div>
              <span className="text-[11px] font-bold uppercase tracking-wider text-purple-700 bg-purple-100 px-3 py-1 rounded-full border border-purple-200">
                {t.checkout.badge}
              </span>
              <h1 className="text-2xl sm:text-3xl font-extrabold text-[#1f0a44] mt-2">
                {t.checkout.heading}
              </h1>
              <p className="text-xs text-slate-500 mt-1">
                {t.checkout.subheading}
              </p>
            </div>

            {/* Step 1: Student Information */}
            <div className="rounded-3xl border border-purple-100 bg-white p-6 sm:p-8 shadow-xs space-y-4">
              <h2 className="text-sm font-bold text-[#1f0a44] pb-2 border-b border-purple-50 flex items-center gap-2">
                <span className="w-6 h-6 rounded-full bg-purple-100 text-purple-900 flex items-center justify-center text-xs font-black">
                  1
                </span>
                <span>{t.checkout.step1Title}</span>
              </h2>

              {/* WhatsApp Phone Number with Country Code */}
              <div className="space-y-1.5">
                <Label htmlFor="phone" className="text-xs font-semibold text-slate-700">
                  {t.checkout.whatsappLabel} <span className="text-rose-500">*</span>
                </Label>
                <div className="flex gap-2">
                  <select
                    value={countryCode}
                    onChange={(e) => setCountryCode(e.target.value)}
                    className="w-40 text-xs rounded-xl border border-slate-200 bg-slate-50/50 p-2.5 text-slate-800 font-semibold focus:outline-none focus:ring-2 focus:ring-purple-600 focus:bg-white transition-all cursor-pointer"
                  >
                    {COUNTRY_CODES.map((c) => (
                      <option key={c.code} value={c.code}>
                        {c.label}
                      </option>
                    ))}
                  </select>
                  <Input
                    id="phone"
                    type="tel"
                    required
                    value={rawPhone}
                    onChange={(e) => setRawPhone(e.target.value)}
                    placeholder="13 99187-8104"
                    className="flex-1 rounded-xl border-slate-200 bg-slate-50/50 text-xs px-3.5 py-2.5 text-[#1f0a44] font-mono focus:bg-white focus:border-purple-600"
                  />
                </div>
                <p className="text-[11px] text-amber-700 font-medium bg-amber-50/80 border border-amber-200/60 p-2 rounded-xl mt-1.5">
                  {t.checkout.whatsappHelp}
                </p>
              </div>

              {/* Name */}
              <div className="space-y-1.5 pt-1">
                <Label htmlFor="name" className="text-xs font-semibold text-slate-700">
                  {t.checkout.nameLabel} <span className="text-rose-500">*</span>
                </Label>
                <Input
                  id="name"
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder={t.checkout.namePlaceholder}
                  className="rounded-xl border-slate-200 bg-slate-50/50 text-xs px-3.5 py-2.5 text-[#1f0a44] focus:bg-white focus:border-purple-600"
                />
              </div>

              {/* Email */}
              <div className="space-y-1.5 pt-1">
                <Label htmlFor="email" className="text-xs font-semibold text-slate-700">
                  {t.checkout.emailLabel} <span className="text-rose-500">*</span>
                </Label>
                <Input
                  id="email"
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder={t.checkout.emailPlaceholder}
                  className="rounded-xl border-slate-200 bg-slate-50/50 text-xs px-3.5 py-2.5 text-[#1f0a44] focus:bg-white focus:border-purple-600"
                />
              </div>
            </div>

            {/* Step 2: Payment Method */}
            <div className="rounded-3xl border border-purple-100 bg-white p-6 sm:p-8 shadow-xs space-y-5">
              <h2 className="text-sm font-bold text-[#1f0a44] pb-2 border-b border-purple-50 flex items-center gap-2">
                <span className="w-6 h-6 rounded-full bg-purple-100 text-purple-900 flex items-center justify-center text-xs font-black">
                  2
                </span>
                <span>{t.checkout.step2Title}</span>
              </h2>

              {/* Payment Tabs */}
              <div className="grid grid-cols-2 gap-2 p-1 rounded-2xl bg-purple-50/80 border border-purple-100">
                <button
                  type="button"
                  onClick={() => setPaymentMethod("pix")}
                  className={`py-2.5 px-4 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center justify-center gap-2 ${
                    paymentMethod === "pix"
                      ? "bg-white text-purple-950 shadow-xs border border-purple-200/50"
                      : "text-slate-600 hover:text-purple-950"
                  }`}
                >
                  <QrCode className="w-4 h-4 text-emerald-600" />
                  <span>{t.checkout.tabPix}</span>
                </button>
                <button
                  type="button"
                  onClick={() => setPaymentMethod("credit_card")}
                  className={`py-2.5 px-4 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center justify-center gap-2 ${
                    paymentMethod === "credit_card"
                      ? "bg-white text-purple-950 shadow-xs border border-purple-200/50"
                      : "text-slate-600 hover:text-purple-950"
                  }`}
                >
                  <CreditCard className="w-4 h-4 text-purple-600" />
                  <span>{t.checkout.tabCard}</span>
                </button>
              </div>

              {/* Pix Tab Content */}
              {paymentMethod === "pix" && (
                <div className="rounded-2xl bg-[#f8fafc] border border-slate-200/80 p-5 space-y-4">
                  <div className="flex items-start gap-4">
                    <div className="w-24 h-24 bg-white border border-slate-200 rounded-xl p-2 shrink-0 flex items-center justify-center shadow-xs">
                      {/* Stylized QR Code preview */}
                      <img
                        src={`https://api.qrserver.com/v1/create-qr-code/?size=150x150&data=${encodeURIComponent(simulatedPixCode)}`}
                        alt="Pix QR Code"
                        className="w-full h-full object-contain"
                      />
                    </div>
                    <div className="space-y-1.5 text-xs text-slate-600 leading-relaxed">
                      <p className="font-semibold text-slate-800">{t.checkout.pixInstructions}</p>
                      <p className="text-[11px] text-emerald-700 font-medium flex items-center gap-1">
                        <Clock className="w-3 h-3" /> {t.checkout.pixExpiryNote}
                      </p>
                    </div>
                  </div>

                  {/* Pix Copia e Cola box */}
                  <div className="space-y-1.5">
                    <div className="flex items-center gap-2">
                      <input
                        readOnly
                        value={simulatedPixCode}
                        className="flex-1 rounded-xl border border-slate-200 bg-white px-3 py-2 text-[11px] font-mono text-slate-600 select-all"
                      />
                      <Button
                        type="button"
                        onClick={handleCopyPix}
                        className="rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold px-4 py-2 shrink-0 flex items-center gap-1.5 cursor-pointer shadow-xs"
                      >
                        {pixCopied ? (
                          <>
                            <Check className="w-3.5 h-3.5" />
                            <span>Copied!</span>
                          </>
                        ) : (
                          <>
                            <Copy className="w-3.5 h-3.5" />
                            <span>{t.checkout.pixCopyBtn}</span>
                          </>
                        )}
                      </Button>
                    </div>
                  </div>
                </div>
              )}

              {/* Credit Card Tab Content */}
              {paymentMethod === "credit_card" && (
                <div className="rounded-2xl bg-slate-50/60 border border-slate-200/80 p-5 space-y-4">
                  <div className="space-y-1.5">
                    <Label htmlFor="cardNumber" className="text-xs font-semibold text-slate-700">
                      {t.checkout.cardNumberLabel}
                    </Label>
                    <Input
                      id="cardNumber"
                      type="text"
                      maxLength={19}
                      value={cardNumber}
                      onChange={(e) => handleFormatCardNumber(e.target.value)}
                      placeholder="0000 0000 0000 0000"
                      className="rounded-xl border-slate-200 bg-white text-xs font-mono py-2"
                    />
                  </div>

                  <div className="space-y-1.5">
                    <Label htmlFor="cardName" className="text-xs font-semibold text-slate-700">
                      {t.checkout.cardNameLabel}
                    </Label>
                    <Input
                      id="cardName"
                      type="text"
                      value={cardName}
                      onChange={(e) => setCardName(e.target.value.toUpperCase())}
                      placeholder="MARIA S SILVA"
                      className="rounded-xl border-slate-200 bg-white text-xs py-2 uppercase"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div className="space-y-1.5">
                      <Label htmlFor="cardExpiry" className="text-xs font-semibold text-slate-700">
                        {t.checkout.cardExpiryLabel}
                      </Label>
                      <Input
                        id="cardExpiry"
                        type="text"
                        maxLength={5}
                        value={cardExpiry}
                        onChange={(e) => handleFormatExpiry(e.target.value)}
                        placeholder="MM/AA"
                        className="rounded-xl border-slate-200 bg-white text-xs font-mono py-2"
                      />
                    </div>
                    <div className="space-y-1.5">
                      <Label htmlFor="cardCvv" className="text-xs font-semibold text-slate-700">
                        {t.checkout.cardCvvLabel}
                      </Label>
                      <Input
                        id="cardCvv"
                        type="password"
                        maxLength={4}
                        value={cardCvv}
                        onChange={(e) => setCardCvv(e.target.value.replace(/\D/g, ""))}
                        placeholder="123"
                        className="rounded-xl border-slate-200 bg-white text-xs font-mono py-2"
                      />
                    </div>
                  </div>

                  {/* Installments */}
                  <div className="space-y-1.5">
                    <Label htmlFor="installments" className="text-xs font-semibold text-slate-700">
                      {t.checkout.cardInstallmentsLabel}
                    </Label>
                    <select
                      id="installments"
                      value={installments}
                      onChange={(e) => setInstallments(Number(e.target.value))}
                      className="w-full text-xs rounded-xl border border-slate-200 bg-white p-2 text-slate-800 font-semibold focus:outline-none focus:ring-2 focus:ring-purple-600 cursor-pointer"
                    >
                      <option value={1}>
                        {t.checkout.installmentSingle.replace("{amount}", planInfo.totalFormatted)}
                      </option>
                      {[2, 3, 4, 6, 12].map((cnt) => {
                        const installmentVal = (planInfo.total / cnt).toFixed(2).replace(".", ",");
                        return (
                          <option key={cnt} value={cnt}>
                            {t.checkout.installmentOption
                              .replace("{count}", String(cnt))
                              .replace("{amount}", `R$ ${installmentVal}`)}
                          </option>
                        );
                      })}
                    </select>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Right Column: Order Summary (5 cols) */}
          <div className="lg:col-span-5 space-y-6 sticky top-24">
            <div className="rounded-3xl border border-purple-100 bg-white p-6 sm:p-7 shadow-lg space-y-6">
              <h3 className="text-base font-bold text-[#1f0a44] pb-3 border-b border-purple-50 flex items-center justify-between">
                <span>{t.checkout.orderSummaryTitle}</span>
                <span className="text-[10px] font-bold text-emerald-700 bg-emerald-100 px-2.5 py-0.5 rounded-full">
                  SSL Encrypted
                </span>
              </h3>

              {/* Plan Switcher Pills */}
              <div className="space-y-2">
                <span className="text-xs font-bold text-slate-500">{t.checkout.switchPlanLabel}</span>
                <div className="grid grid-cols-3 gap-1.5 p-1 rounded-xl bg-purple-50 border border-purple-100">
                  <button
                    type="button"
                    onClick={() => setPlan("monthly")}
                    className={`py-1.5 px-2 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                      plan === "monthly"
                        ? "bg-[#240b4a] text-white shadow-xs"
                        : "text-purple-900/70 hover:text-purple-950"
                    }`}
                  >
                    Monthly
                  </button>
                  <button
                    type="button"
                    onClick={() => setPlan("semi")}
                    className={`py-1.5 px-2 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                      plan === "semi"
                        ? "bg-[#240b4a] text-white shadow-xs"
                        : "text-purple-900/70 hover:text-purple-950"
                    }`}
                  >
                    Semiannual
                  </button>
                  <button
                    type="button"
                    onClick={() => setPlan("yearly")}
                    className={`py-1.5 px-2 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                      plan === "yearly"
                        ? "bg-[#240b4a] text-white shadow-xs"
                        : "text-purple-900/70 hover:text-purple-950"
                    }`}
                  >
                    Yearly (40%)
                  </button>
                </div>
              </div>

              {/* Selected Plan Details Box */}
              <div className="rounded-2xl bg-purple-50/60 border border-purple-100 p-4 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-sm text-[#1f0a44]">{planInfo.name}</span>
                  {planInfo.badge && (
                    <span className="bg-[#fec84d] text-[#1f0a44] text-[10px] font-black px-2 py-0.5 rounded-full">
                      {planInfo.badge}
                    </span>
                  )}
                </div>
                <p className="text-xs text-slate-500">{planInfo.billingCycle}</p>
                <div className="pt-2 border-t border-purple-100 text-xs text-slate-700 space-y-1">
                  <div className="flex items-center gap-1.5">
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                    <span>Unlimited 1-on-1 WhatsApp Practice</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                    <span>Discreet private corrections</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                    <span>Study Buddy practice rooms included</span>
                  </div>
                </div>
              </div>

              {/* Price Breakdown */}
              <div className="space-y-2.5 text-xs pt-1 border-t border-purple-50">
                <div className="flex items-center justify-between text-slate-600">
                  <span>{t.checkout.subtotalLabel}</span>
                  <span>{planInfo.regularPriceFormatted}</span>
                </div>
                {plan !== "monthly" && (
                  <div className="flex items-center justify-between text-emerald-700 font-semibold">
                    <span>{t.checkout.discountLabel}</span>
                    <span>{planInfo.discountFormatted}</span>
                  </div>
                )}
                <div className="flex items-center justify-between text-base font-extrabold text-[#1f0a44] pt-2 border-t border-purple-100">
                  <span>{t.checkout.totalLabel}</span>
                  <span className="text-xl font-black text-purple-950">{planInfo.totalFormatted}</span>
                </div>
              </div>

              {/* Submit CTA */}
              <Button
                type="submit"
                disabled={isSubmitting}
                className="w-full py-6 rounded-full bg-gradient-to-r from-[#240b4a] via-[#35106b] to-[#170535] text-white font-bold text-xs shadow-lg shadow-purple-950/20 hover:scale-[1.01] active:scale-[0.99] transition-all cursor-pointer uppercase tracking-wider"
              >
                {isSubmitting ? t.checkout.processingBtn : t.checkout.submitBtn}
              </Button>

              {/* Guarantees */}
              <div className="space-y-2 pt-2 text-[11px] text-slate-500 text-center">
                <div className="flex items-center justify-center gap-1.5 text-amber-800 font-semibold">
                  <Award className="w-4 h-4 text-amber-600" />
                  <span>{t.checkout.guaranteeNotice}</span>
                </div>
                <p className="leading-relaxed">
                  {t.checkout.instantActivationNotice}
                </p>
              </div>
            </div>
          </div>
        </form>
      </main>
    </div>
  );
}
