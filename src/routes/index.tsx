import { createFileRoute, Link } from "@tanstack/react-router";
import {
  Award,
  Globe,
  MessageCircle,
  ArrowRight,
  ShieldCheck,
  Menu,
  X,
  ChevronDown,
  ChevronUp,
  HelpCircle,
  BookOpen,
  Sparkles,
  CheckCircle2,
} from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import { TRANSLATIONS, type SupportedLang } from "@/lib/translations";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Talk'n'Bit — Chat in English Everyday with AI-Powered Instant Feedback" },
      {
        name: "description",
        content:
          "Find partners with similar interests and immerse yourself in English on WhatsApp with AI-powered instant grammar feedback.",
      },
      { property: "og:title", content: "Talk'n'Bit — WhatsApp English Learning & Immersion" },
      {
        property: "og:description",
        content:
          "Chat in English everyday on WhatsApp with real partners and get instant AI grammar corrections.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: LandingPage,
});

const BASE_WA_NUMBER = "5513991878104";
function getWhatsAppUrl(customMessage: string) {
  return `https://wa.me/${BASE_WA_NUMBER}?text=${encodeURIComponent(customMessage)}`;
}

function LandingPage() {
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

  const t = TRANSLATIONS[selectedLang] || TRANSLATIONS.en;

  const [interactiveSentence, setInteractiveSentence] = useState("");
  const [simulatedFeedback, setSimulatedFeedback] = useState<{
    original: string;
    correction: string;
    why: string;
  } | null>(null);

  // Interactive mockups 'Why?' states
  const [showHeroWhy, setShowHeroWhy] = useState(false);
  const [showVocabWhy, setShowVocabWhy] = useState(false);

  // Modals & Navigation states
  const [isFaqOpen, setIsFaqOpen] = useState(false);
  const [isBlogOpen, setIsBlogOpen] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [openFaqIndex, setOpenFaqIndex] = useState<number | null>(0);

  const WHATSAPP_URL = getWhatsAppUrl(t.whatsappMessages.greeting);

  const handleSelectLanguage = (lang: SupportedLang) => {
    setSelectedLang(lang);
    if (typeof window !== "undefined") {
      localStorage.setItem("talknbit_lang", lang);
    }
    const names = { en: "English", pt: "Português (Brasil)", es: "Español" };
    toast.success(`Language set to ${names[lang]}`);
  };

  const handleSimulate = (e: React.FormEvent) => {
    e.preventDefault();
    if (!interactiveSentence.trim()) return;

    const text = interactiveSentence.trim();
    const lower = text.toLowerCase();

    if (lower.includes("didn't went") || lower.includes("did not went")) {
      setSimulatedFeedback({
        original: text,
        correction: text.replace(/didn't went/gi, "didn't go").replace(/did not went/gi, "did not go"),
        why:
          selectedLang === "pt"
            ? "No passado simples com 'didn't', usamos o verbo na forma base ('go', e não 'went')."
            : selectedLang === "es"
            ? "En pasado simple con 'didn't', usamos el verbo en su forma base ('go', no 'went')."
            : "In past simple with 'didn't', we use the base verb form ('go', not 'went').",
      });
    } else if (lower.includes("don't likes") || lower.includes("doesn't likes")) {
      setSimulatedFeedback({
        original: text,
        correction: text.replace(/don't likes/gi, "doesn't like").replace(/doesn't likes/gi, "doesn't like"),
        why:
          selectedLang === "pt"
            ? "A terceira pessoa do singular exige 'doesn't' + verbo base 'like'."
            : selectedLang === "es"
            ? "La tercera persona del singular requiere 'doesn't' + verbo base 'like'."
            : "Third-person singular takes 'doesn't' + base verb 'like'.",
      });
    } else if (lower.includes("have") && (lower.includes("years old") || lower.includes("years"))) {
      setSimulatedFeedback({
        original: text,
        correction: text.replace(/have\s+(\d+)\s+years/gi, "am $1 years old").replace(/have\s+(\d+)/gi, "am $1 years old"),
        why:
          selectedLang === "pt"
            ? "Em inglês, usamos o verbo 'to be' para expressar idade ('I am 25 years old', nunca 'I have 25 years')."
            : selectedLang === "es"
            ? "En inglés, usamos el verbo 'to be' para la edad ('I am 25 years old', nunca 'I have 25 years')."
            : "In English, we use 'to be' for age (e.g. 'I am 25 years old', not 'I have 25 years').",
      });
    } else if (lower.includes("for to")) {
      setSimulatedFeedback({
        original: text,
        correction: text.replace(/for to/gi, "to"),
        why:
          selectedLang === "pt"
            ? "Para expressar objetivo ou finalidade, use apenas 'to' + verbo base, nunca 'for to'."
            : selectedLang === "es"
            ? "Para expresar propósito, usa solo 'to' + verbo base, nunca 'for to'."
            : "To express purpose, use just 'to' + base verb, never 'for to'.",
      });
    } else if (lower.includes("more better")) {
      setSimulatedFeedback({
        original: text,
        correction: text.replace(/more better/gi, "better"),
        why:
          selectedLang === "pt"
            ? "Adjetivos comparativos irregulares como 'better' não recebem 'more'."
            : selectedLang === "es"
            ? "Los adjetivos comparativos irregulares como 'better' no admiten 'more'."
            : "Comparative adjectives don't take double comparatives ('more better' -> 'better').",
      });
    } else {
      setSimulatedFeedback({
        original: text,
        correction:
          selectedLang === "pt"
            ? `Muito bem! Sua frase soa natural: "${text}"`
            : selectedLang === "es"
            ? `¡Excelente! Tu frase es natural: "${text}"`
            : `Great job! Your sentence is natural: "${text}"`,
        why:
          selectedLang === "pt"
            ? "Nenhum erro gramatical identificado. Continue praticando!"
            : selectedLang === "es"
            ? "¡No se detectaron errores gramaticales! Sigue practicando."
            : "No grammatical mistakes found. Keep practicing!",
      });
    }
  };

  const scrollToSection = (id: string) => {
    setIsMobileMenuOpen(false);
    const elem = document.getElementById(id);
    if (elem) {
      elem.scrollIntoView({ behavior: "smooth" });
    }
  };

  return (
    <div className="min-h-screen bg-white text-[#1f0a44] font-sans antialiased selection:bg-[#fec84d] selection:text-[#1f0a44]">
      {/* 1. Header / Navbar */}
      <header className="sticky top-0 z-50 bg-white/95 backdrop-blur-md border-b border-purple-50/80">
        <div className="max-w-6xl mx-auto px-6 h-20 flex items-center justify-between">
          <Link to="/" className="flex items-center gap-2 group">
            <img
              src="/images/logo.png"
              alt="Talk 'n' bit"
              className="h-11 w-auto object-contain transition-transform group-hover:scale-105"
            />
          </Link>

          {/* Desktop Navigation Links */}
          <nav className="hidden md:flex items-center gap-7 text-sm font-medium text-[#2d1257]">
            <button
              onClick={() => scrollToSection("practice")}
              className="hover:text-purple-600 transition-colors cursor-pointer capitalize"
            >
              {t.nav.practice}
            </button>
            <button
              onClick={() => scrollToSection("how-it-works")}
              className="hover:text-purple-600 transition-colors cursor-pointer capitalize"
            >
              {t.nav.howItWorks}
            </button>
            <Link
              to="/pricing"
              className="hover:text-purple-600 transition-colors cursor-pointer capitalize"
            >
              {t.nav.plans}
            </Link>
            <button
              onClick={() => setIsBlogOpen(true)}
              className="hover:text-purple-600 transition-colors cursor-pointer capitalize"
            >
              {t.nav.blog}
            </button>
            <button
              onClick={() => setIsFaqOpen(true)}
              className="hover:text-purple-600 transition-colors cursor-pointer uppercase"
            >
              {t.nav.faq}
            </button>
            <button
              onClick={() => scrollToSection("contact")}
              className="hover:text-purple-600 transition-colors cursor-pointer capitalize"
            >
              {t.nav.contact}
            </button>
          </nav>

          {/* Header Action Buttons & Language Switcher */}
          <div className="flex items-center gap-2 sm:gap-2.5">
            {/* Language Switcher Pills */}
            <div className="hidden sm:flex items-center bg-purple-50/90 p-0.5 rounded-full border border-purple-200/70 text-[11px] font-bold">
              <button
                type="button"
                onClick={() => handleSelectLanguage("en")}
                className={`px-2 py-1 rounded-full transition-all cursor-pointer ${
                  selectedLang === "en"
                    ? "bg-[#240b4a] text-white shadow-xs"
                    : "text-purple-900/80 hover:text-purple-950"
                }`}
                title="English"
              >
                EN
              </button>
              <button
                type="button"
                onClick={() => handleSelectLanguage("pt")}
                className={`px-2 py-1 rounded-full transition-all cursor-pointer ${
                  selectedLang === "pt"
                    ? "bg-[#240b4a] text-white shadow-xs"
                    : "text-purple-900/80 hover:text-purple-950"
                }`}
                title="Português"
              >
                PT
              </button>
              <button
                type="button"
                onClick={() => handleSelectLanguage("es")}
                className={`px-2 py-1 rounded-full transition-all cursor-pointer ${
                  selectedLang === "es"
                    ? "bg-[#240b4a] text-white shadow-xs"
                    : "text-purple-900/80 hover:text-purple-950"
                }`}
                title="Español"
              >
                ES
              </button>
            </div>

            <Link
              to="/admin"
              className="inline-flex items-center gap-1.5 rounded-full border border-purple-900/20 bg-purple-50/80 px-3 sm:px-4 py-2 text-xs font-semibold text-[#1e0a45] transition-all hover:bg-purple-100 hover:border-purple-900/40 hover:scale-105 shadow-xs"
            >
              <ShieldCheck className="w-3.5 h-3.5 text-purple-700" />
              <span>{t.nav.admin}</span>
            </Link>

            <a
              href={WHATSAPP_URL}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 rounded-full bg-gradient-to-r from-[#240b4a] to-[#170535] px-4 sm:px-5 py-2.5 text-xs font-semibold text-white shadow-md shadow-purple-950/20 transition-all hover:scale-105 hover:shadow-purple-900/40"
            >
              <MessageCircle className="w-4 h-4 text-[#25D366]" />
              <span className="hidden sm:inline">{t.nav.chatOnWhatsApp}</span>
              <span className="sm:hidden">WhatsApp</span>
            </a>

            {/* Mobile Hamburger Menu Button */}
            <button
              type="button"
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="md:hidden p-2 rounded-full border border-purple-100 text-purple-950 hover:bg-purple-50 transition-colors"
              aria-label="Toggle navigation menu"
            >
              {isMobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>
        </div>

        {/* Mobile Dropdown Menu */}
        {isMobileMenuOpen && (
          <div className="md:hidden border-b border-purple-100 bg-white/98 px-6 py-4 space-y-3 shadow-lg animate-in slide-in-from-top-2">
            {/* Mobile Language Selector */}
            <div className="pb-3 border-b border-purple-100 flex items-center justify-between">
              <span className="text-xs font-semibold text-[#1e0a45] flex items-center gap-1.5">
                <Globe className="w-3.5 h-3.5 text-purple-700" /> Language:
              </span>
              <div className="flex gap-1">
                <button
                  type="button"
                  onClick={() => handleSelectLanguage("en")}
                  className={`px-2.5 py-1 rounded-full text-xs font-bold ${
                    selectedLang === "en" ? "bg-[#240b4a] text-white" : "bg-purple-50 text-purple-900"
                  }`}
                >
                  EN
                </button>
                <button
                  type="button"
                  onClick={() => handleSelectLanguage("pt")}
                  className={`px-2.5 py-1 rounded-full text-xs font-bold ${
                    selectedLang === "pt" ? "bg-[#240b4a] text-white" : "bg-purple-50 text-purple-900"
                  }`}
                >
                  PT
                </button>
                <button
                  type="button"
                  onClick={() => handleSelectLanguage("es")}
                  className={`px-2.5 py-1 rounded-full text-xs font-bold ${
                    selectedLang === "es" ? "bg-[#240b4a] text-white" : "bg-purple-50 text-purple-900"
                  }`}
                >
                  ES
                </button>
              </div>
            </div>

            <button
              onClick={() => scrollToSection("practice")}
              className="block w-full text-left py-2 text-sm font-semibold text-[#1e0a45] hover:text-purple-700 capitalize"
            >
              {t.nav.practice}
            </button>
            <button
              onClick={() => scrollToSection("how-it-works")}
              className="block w-full text-left py-2 text-sm font-semibold text-[#1e0a45] hover:text-purple-700 capitalize"
            >
              {t.nav.howItWorks}
            </button>
            <Link
              to="/pricing"
              onClick={() => setIsMobileMenuOpen(false)}
              className="block w-full text-left py-2 text-sm font-semibold text-[#1e0a45] hover:text-purple-700 capitalize"
            >
              {t.nav.plans}
            </Link>
            <button
              onClick={() => {
                setIsMobileMenuOpen(false);
                setIsBlogOpen(true);
              }}
              className="block w-full text-left py-2 text-sm font-semibold text-[#1e0a45] hover:text-purple-700 capitalize"
            >
              {t.nav.blog}
            </button>
            <button
              onClick={() => {
                setIsMobileMenuOpen(false);
                setIsFaqOpen(true);
              }}
              className="block w-full text-left py-2 text-sm font-semibold text-[#1e0a45] hover:text-purple-700 uppercase"
            >
              {t.nav.faq}
            </button>
            <button
              onClick={() => scrollToSection("contact")}
              className="block w-full text-left py-2 text-sm font-semibold text-[#1e0a45] hover:text-purple-700 capitalize"
            >
              {t.nav.contact}
            </button>
          </div>
        )}
      </header>

      {/* 2. Hero Section */}
      <section id="practice" className="pt-12 pb-20 px-6 max-w-6xl mx-auto">
        <div className="grid lg:grid-cols-12 gap-12 items-center">
          {/* Hero Left */}
          <div className="lg:col-span-7 space-y-6 text-left">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-purple-50 text-purple-900 border border-purple-100 text-xs font-semibold">
              <span>✨</span> {t.hero.badge}
            </div>

            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold tracking-tight text-[#1e0a45] leading-[1.12]">
              {t.hero.titleLine1} <br />
              {t.hero.titleLine2} <br />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#2a0b5a] via-[#521b96] to-[#2a0b5a]">
                {t.hero.titleHighlight1} <br />
                {t.hero.titleHighlight2}
              </span>
            </h1>

            <p className="text-base sm:text-lg text-slate-600 max-w-lg font-normal leading-relaxed">
              {t.hero.subtitle}
            </p>

            <div className="pt-2 flex flex-wrap items-center gap-4">
              <a
                href={WHATSAPP_URL}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center justify-center rounded-full bg-gradient-to-r from-[#240b4a] via-[#35106b] to-[#170535] px-8 py-3.5 text-sm font-semibold text-white shadow-lg shadow-purple-950/25 transition-all hover:scale-105 hover:shadow-purple-900/40"
              >
                {t.hero.getStarted}
              </a>
              <button
                onClick={() => scrollToSection("how-it-works")}
                className="inline-flex items-center gap-1.5 px-5 py-3 text-sm font-medium text-purple-900 hover:text-purple-600 transition-colors cursor-pointer"
              >
                {t.hero.seeHowItWorks} <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Hero Right: Phone Mockup with Interactive Buttons */}
          <div className="lg:col-span-5 flex justify-center">
            <div className="relative w-full max-w-[320px] aspect-[9/17] rounded-[42px] border-[7px] border-[#220c4e] bg-slate-50 shadow-2xl p-4 flex flex-col justify-between overflow-hidden">
              {/* Phone background diagonal grid */}
              <div
                className="absolute inset-0 opacity-[0.07] pointer-events-none"
                style={{
                  backgroundImage:
                    "linear-gradient(45deg, #1f0a44 25%, transparent 25%), linear-gradient(-45deg, #1f0a44 25%, transparent 25%), linear-gradient(45deg, transparent 75%, #1f0a44 75%), linear-gradient(-45deg, transparent 75%, #1f0a44 75%)",
                  backgroundSize: "24px 24px",
                }}
              />

              {/* Phone speaker notch */}
              <div className="mx-auto w-24 h-4 bg-[#220c4e] rounded-b-xl flex items-center justify-center gap-2 z-10">
                <div className="w-10 h-1 bg-slate-600 rounded-full" />
                <div className="w-2 h-2 bg-slate-700 rounded-full" />
              </div>

              {/* Chat messages */}
              <div className="relative z-10 space-y-4 my-auto py-2">
                {/* User message */}
                <div className="flex items-end justify-end gap-2">
                  <div className="bg-[#dcf8c6] text-[#0f2c14] text-xs px-3.5 py-2.5 rounded-2xl rounded-tr-none shadow-sm max-w-[200px] leading-snug">
                    I didn't went to the party yesterday.
                  </div>
                  <img
                    src="/images/student_guy.png"
                    alt="Student"
                    className="w-8 h-8 rounded-full border border-purple-900/20 object-cover shadow-sm shrink-0"
                  />
                </div>

                {/* Bot correction message */}
                <div className="flex items-start gap-2">
                  <img
                    src="/images/robot.png"
                    alt="Talk'n'Bit Robot"
                    className="w-8 h-8 rounded-full object-contain shrink-0 mt-1 drop-shadow"
                  />
                  <div className="bg-[#fef9eb] border border-amber-200/60 text-[#1e0a45] text-xs px-3.5 py-2.5 rounded-2xl rounded-tl-none shadow-sm max-w-[215px] leading-snug space-y-1.5">
                    <p className="font-medium text-slate-800">
                      You meant: <span className="text-purple-900 font-bold">"I didn't go to the party yesterday."</span>
                    </p>
                    <div className="pt-1 border-t border-amber-200/50 flex items-center justify-between text-[10px]">
                      {/* Wired Interactive Why Button */}
                      <button
                        type="button"
                        onClick={() => setShowHeroWhy(!showHeroWhy)}
                        className="font-semibold text-purple-700 bg-purple-100 hover:bg-purple-200 px-2.5 py-0.5 rounded-full transition-all active:scale-95 flex items-center gap-1 cursor-pointer"
                        title="Click to test the interactive explanation!"
                      >
                        <span>{t.hero.whyButton}</span>
                        {showHeroWhy ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />}
                      </button>
                      <span className="text-slate-400">{t.hero.instantAi}</span>
                    </div>

                    {/* Interactive Explanation Card Dropdown */}
                    {showHeroWhy && (
                      <div className="mt-2 pt-2 border-t border-amber-200/80 text-[10px] text-slate-700 space-y-1 bg-amber-100/50 p-2 rounded-xl animate-in fade-in slide-in-from-top-1">
                        <p className="font-bold text-purple-950">{t.hero.grammarRuleTitle}</p>
                        <p>{t.hero.grammarRuleHero}</p>
                        <p className="text-emerald-700 font-bold">✓ I didn't go</p>
                      </div>
                    )}
                  </div>
                </div>

                {/* Interactive preview bubble if user tested */}
                {simulatedFeedback && (
                  <div className="bg-purple-50 border border-purple-200 text-[#1f0a44] text-[11px] p-2.5 rounded-xl animate-in fade-in slide-in-from-bottom-2 space-y-1">
                    <div className="flex items-center justify-between">
                      <span className="font-semibold text-purple-900">{t.hero.liveAiEvaluation}</span>
                      <button onClick={() => setSimulatedFeedback(null)} className="text-slate-400 hover:text-slate-600">✕</button>
                    </div>
                    <p className="text-slate-800 font-medium">{simulatedFeedback.correction}</p>
                    <p className="text-slate-500 text-[10px]">💡 {simulatedFeedback.why}</p>
                    <a
                      href={getWhatsAppUrl(`Hi! I tested this sentence with the bot: "${simulatedFeedback.original}"`)}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1 text-[10px] font-bold text-emerald-700 bg-emerald-100/80 px-2 py-0.5 rounded-md hover:bg-emerald-200 transition-colors"
                    >
                      <MessageCircle className="w-3 h-3" /> {t.hero.practiceOnWhatsApp}
                    </a>
                  </div>
                )}
              </div>

              {/* Bottom interactive test input */}
              <form onSubmit={handleSimulate} className="relative z-10 flex items-center gap-1.5 pt-2">
                <input
                  type="text"
                  placeholder={t.hero.inputPlaceholder}
                  value={interactiveSentence}
                  onChange={(e) => setInteractiveSentence(e.target.value)}
                  className="w-full text-xs px-3 py-2 bg-white rounded-full border border-slate-200 focus:outline-none focus:border-purple-600 shadow-inner"
                />
                <button
                  type="submit"
                  className="bg-[#240b4a] text-white p-2 rounded-full hover:bg-purple-800 shrink-0 shadow-sm cursor-pointer"
                  title="Test sentence"
                >
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </form>
            </div>
          </div>
        </div>
      </section>

      {/* 3. Section: Experience English Immersion */}
      <section className="py-20 px-6 max-w-6xl mx-auto">
        <div className="grid lg:grid-cols-12 gap-12 items-center">
          {/* Left: Woman Image */}
          <div className="lg:col-span-6 flex justify-center">
            <div className="relative max-w-md w-full">
              <img
                src="/images/woman.png"
                alt="Experience English Immersion"
                className="w-full h-auto object-contain drop-shadow-xl"
              />
            </div>
          </div>

          {/* Right: Content */}
          <div className="lg:col-span-6 space-y-8 text-left">
            <h2 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-[#1e0a45]">
              {t.immersion.titleLine1} <br />
              {t.immersion.titleLine2}
            </h2>

            <div className="space-y-4">
              <div className="flex items-center gap-3">
                <span className="text-[#fec84d] text-2xl leading-none">✨</span>
                <span className="text-base sm:text-lg font-medium text-slate-800">
                  {t.immersion.point1}
                </span>
              </div>
              <div className="flex items-center gap-3">
                <span className="text-[#fec84d] text-2xl leading-none">✨</span>
                <span className="text-base sm:text-lg font-medium text-slate-800">
                  {t.immersion.point2}
                </span>
              </div>
              <div className="flex items-center gap-3">
                <span className="text-[#fec84d] text-2xl leading-none">✨</span>
                <span className="text-base sm:text-lg font-medium text-slate-800">
                  {t.immersion.point3}
                </span>
              </div>
            </div>

            <div>
              <a
                href={getWhatsAppUrl(t.whatsappMessages.immersion)}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center justify-center rounded-full bg-gradient-to-r from-[#240b4a] to-[#170535] px-8 py-3.5 text-sm font-semibold text-white shadow-lg shadow-purple-950/25 transition-all hover:scale-105 hover:shadow-purple-900/40"
              >
                {t.immersion.cta}
              </a>
            </div>
          </div>
        </div>
      </section>

      {/* 4. Section: Unlock Vocabulary */}
      <section className="py-20 px-6 max-w-6xl mx-auto">
        <div className="grid lg:grid-cols-12 gap-12 items-center">
          {/* Left: Copy */}
          <div className="lg:col-span-6 space-y-6 text-left">
            <h2 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-[#1e0a45]">
              {t.vocabulary.titleLine1} <br />
              {t.vocabulary.titleLine2}
            </h2>

            <p className="text-base sm:text-lg font-bold text-[#240b4a]">
              {t.vocabulary.question}
            </p>

            <p className="text-slate-600 leading-relaxed text-base">
              {t.vocabulary.description}
            </p>

            <div className="pt-2">
              <a
                href={getWhatsAppUrl(t.whatsappMessages.vocab)}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center justify-center rounded-full bg-gradient-to-r from-[#240b4a] to-[#170535] px-8 py-3.5 text-sm font-semibold text-white shadow-lg shadow-purple-950/25 transition-all hover:scale-105 hover:shadow-purple-900/40"
              >
                {t.vocabulary.cta}
              </a>
            </div>
          </div>

          {/* Right: Phone Mockup with Contextual translation & Interactive Why */}
          <div className="lg:col-span-6 flex justify-center">
            <div className="relative w-full max-w-[320px] aspect-[9/17] rounded-[42px] border-[7px] border-[#220c4e] bg-slate-50 shadow-2xl p-4 flex flex-col justify-between overflow-hidden">
              <div
                className="absolute inset-0 opacity-[0.07] pointer-events-none"
                style={{
                  backgroundImage:
                    "linear-gradient(45deg, #1f0a44 25%, transparent 25%), linear-gradient(-45deg, #1f0a44 25%, transparent 25%), linear-gradient(45deg, transparent 75%, #1f0a44 75%), linear-gradient(-45deg, transparent 75%, #1f0a44 75%)",
                  backgroundSize: "24px 24px",
                }}
              />

              <div className="mx-auto w-24 h-4 bg-[#220c4e] rounded-b-xl flex items-center justify-center gap-2 z-10">
                <div className="w-10 h-1 bg-slate-600 rounded-full" />
                <div className="w-2 h-2 bg-slate-700 rounded-full" />
              </div>

              <div className="relative z-10 space-y-4 my-auto py-2">
                {/* User sends mixed sentence */}
                <div className="flex items-end justify-end gap-2">
                  <div className="bg-[#dcf8c6] text-[#0f2c14] text-xs px-3.5 py-2.5 rounded-2xl rounded-tr-none shadow-sm max-w-[200px] leading-snug">
                    {t.vocabulary.userMixSentence}
                  </div>
                  <img
                    src="/images/student_woman.png"
                    alt="Student"
                    className="w-8 h-8 rounded-full border border-purple-900/20 object-cover shadow-sm shrink-0"
                  />
                </div>

                {/* Bot context correction */}
                <div className="flex items-start gap-2">
                  <img
                    src="/images/robot.png"
                    alt="Talk'n'Bit Robot"
                    className="w-8 h-8 rounded-full object-contain shrink-0 mt-1 drop-shadow"
                  />
                  <div className="bg-[#fef9eb] border border-amber-200/60 text-[#1e0a45] text-xs px-3.5 py-2.5 rounded-2xl rounded-tl-none shadow-sm max-w-[215px] leading-snug space-y-1.5">
                    <p className="font-medium text-slate-800">
                      {t.vocabulary.botCorrectionPrefix}{" "}
                      <span className="text-purple-900 font-bold">{t.vocabulary.botCorrection}</span>
                    </p>
                    <div className="pt-1 border-t border-amber-200/50 flex items-center justify-between text-[10px]">
                      {/* Interactive Why Button */}
                      <button
                        type="button"
                        onClick={() => setShowVocabWhy(!showVocabWhy)}
                        className="font-semibold text-purple-700 bg-purple-100 hover:bg-purple-200 px-2.5 py-0.5 rounded-full transition-all active:scale-95 flex items-center gap-1 cursor-pointer"
                        title="Click to test the interactive explanation!"
                      >
                        <span>{t.hero.whyButton}</span>
                        {showVocabWhy ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />}
                      </button>
                      <span className="text-slate-400">{t.vocabulary.contextAi}</span>
                    </div>

                    {/* Interactive Explanation Dropdown */}
                    {showVocabWhy && (
                      <div className="mt-2 pt-2 border-t border-amber-200/80 text-[10px] text-slate-700 space-y-1 bg-amber-100/50 p-2 rounded-xl animate-in fade-in slide-in-from-top-1">
                        <p className="font-bold text-purple-950">{t.vocabulary.vocabRuleTitle}</p>
                        <p>{t.vocabulary.vocabRuleExplanation}</p>
                      </div>
                    )}
                  </div>
                </div>
              </div>

              <div className="relative z-10 text-center py-2 text-xs text-slate-400 font-medium">
                {t.vocabulary.bottomTag}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 5. Transition Banner 1 */}
      <section className="py-24 px-6 text-center bg-purple-50/50">
        <div className="max-w-4xl mx-auto space-y-1">
          <h3 className="text-3xl sm:text-5xl font-extrabold tracking-tight text-[#1e0a45] leading-tight">
            {t.transition1.line1} <br />
            {t.transition1.line2} <br />
            {t.transition1.line3} <br />
            {t.transition1.line4}
          </h3>
        </div>
      </section>

      {/* 6. Section: How It Works */}
      <section id="how-it-works" className="py-20 px-6 max-w-6xl mx-auto">
        <div className="grid lg:grid-cols-12 gap-12 items-center">
          {/* Left: Copy */}
          <div className="lg:col-span-6 space-y-8 text-left">
            <h2 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-[#1e0a45]">
              {t.howItWorks.title}
            </h2>

            <div className="space-y-4">
              <div className="flex items-center gap-3">
                <span className="text-[#fec84d] text-2xl leading-none">✨</span>
                <span className="text-base sm:text-lg font-medium text-slate-800">
                  {t.howItWorks.step1}
                </span>
              </div>
              <div className="flex items-center gap-3">
                <span className="text-[#fec84d] text-2xl leading-none">✨</span>
                <span className="text-base sm:text-lg font-medium text-slate-800">
                  {t.howItWorks.step2}
                </span>
              </div>
              <div className="flex items-center gap-3">
                <span className="text-[#fec84d] text-2xl leading-none">✨</span>
                <span className="text-base sm:text-lg font-medium text-slate-800">
                  {t.howItWorks.step3}
                </span>
              </div>
            </div>

            <div>
              <a
                href={getWhatsAppUrl(t.whatsappMessages.howItWorks)}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center justify-center rounded-full bg-gradient-to-r from-[#240b4a] to-[#170535] px-8 py-3.5 text-sm font-semibold text-white shadow-lg shadow-purple-950/25 transition-all hover:scale-105 hover:shadow-purple-900/40"
              >
                {t.howItWorks.cta}
              </a>
            </div>
          </div>

          {/* Right: Man Image */}
          <div className="lg:col-span-6 flex justify-center">
            <div className="relative max-w-md w-full">
              <img
                src="/images/man.png"
                alt="How it works"
                className="w-full h-auto object-contain drop-shadow-xl"
              />
            </div>
          </div>
        </div>
      </section>

      {/* 7. Section: Why It Works */}
      <section className="py-20 px-6 max-w-6xl mx-auto text-center">
        <div className="max-w-3xl mx-auto space-y-4">
          <h2 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-[#1e0a45]">
            {t.whyItWorks.title}
          </h2>
          <p className="text-slate-600 text-sm sm:text-base leading-relaxed">
            {t.whyItWorks.subtitle}
          </p>
        </div>

        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6 mt-14 text-left">
          {/* Card 1 */}
          <div className="bg-[#fef9eb] border border-amber-200/50 rounded-2xl p-6 space-y-3 shadow-sm hover:shadow-md transition-shadow">
            <h4 className="font-bold text-[#1f0a44] text-base leading-snug">
              {t.whyItWorks.card1Title}
            </h4>
            <p className="text-xs sm:text-sm text-slate-700 leading-relaxed">
              {t.whyItWorks.card1Desc}
            </p>
          </div>

          {/* Card 2 */}
          <div className="bg-[#fef9eb] border border-amber-200/50 rounded-2xl p-6 space-y-3 shadow-sm hover:shadow-md transition-shadow">
            <h4 className="font-bold text-[#1f0a44] text-base leading-snug">
              {t.whyItWorks.card2Title}
            </h4>
            <p className="text-xs sm:text-sm text-slate-700 leading-relaxed">
              {t.whyItWorks.card2Desc}
            </p>
          </div>

          {/* Card 3 */}
          <div className="bg-[#fef9eb] border border-amber-200/50 rounded-2xl p-6 space-y-3 shadow-sm hover:shadow-md transition-shadow">
            <h4 className="font-bold text-[#1f0a44] text-base leading-snug">
              {t.whyItWorks.card3Title}
            </h4>
            <p className="text-xs sm:text-sm text-slate-700 leading-relaxed">
              {t.whyItWorks.card3Desc}
            </p>
          </div>

          {/* Card 4 */}
          <div className="bg-[#fef9eb] border border-amber-200/50 rounded-2xl p-6 space-y-3 shadow-sm hover:shadow-md transition-shadow">
            <h4 className="font-bold text-[#1f0a44] text-base leading-snug">
              {t.whyItWorks.card4Title}
            </h4>
            <p className="text-xs sm:text-sm text-slate-700 leading-relaxed">
              {t.whyItWorks.card4Desc}
            </p>
          </div>
        </div>
      </section>

      {/* 8. Transition Banner 2 */}
      <section className="py-24 px-6 text-center bg-purple-50/50">
        <div className="max-w-4xl mx-auto">
          <h3 className="text-3xl sm:text-5xl font-extrabold tracking-tight text-[#1e0a45] leading-tight">
            {t.transition2.line1} <br />
            {t.transition2.line2} <br />
            {t.transition2.line3}
          </h3>
        </div>
      </section>

      {/* 9. Section: Plans (Deep Violet Gradient) */}
      <section id="plans" className="py-24 px-6 bg-gradient-to-b from-[#0b0324] via-[#1b084b] to-[#0f042e] text-white text-center">
        <div className="max-w-6xl mx-auto space-y-12">
          <div>
            <h2 className="text-3xl sm:text-5xl font-extrabold tracking-tight text-white">
              {t.plans.title}
            </h2>
          </div>

          {/* 15-Day Free Trial Spotlight Card on Landing Page */}
          <div className="max-w-5xl mx-auto rounded-3xl bg-gradient-to-r from-white/15 via-white/10 to-white/5 backdrop-blur-md p-6 sm:p-8 text-white shadow-2xl border border-white/25 relative overflow-hidden text-left">
            <div className="absolute -right-10 -top-10 w-48 h-48 bg-[#fec84d]/15 rounded-full blur-2xl pointer-events-none" />
            <div className="flex flex-col md:flex-row items-center justify-between gap-6 relative z-10">
              <div className="space-y-2 text-center md:text-left">
                <div className="inline-flex items-center gap-2 bg-[#fec84d] text-[#1f0a44] px-3 py-1 rounded-full text-xs font-black uppercase tracking-wider shadow-xs">
                  <Sparkles className="w-3.5 h-3.5" />
                  <span>{t.plans.trialBadge}</span>
                </div>
                <h3 className="text-xl sm:text-2xl font-extrabold tracking-tight text-white">
                  {t.plans.trialTitle} — {t.plans.trialPrice} {t.plans.trialPeriod}
                </h3>
                <p className="text-xs sm:text-sm text-purple-100/90 max-w-xl">
                  {t.plans.trialDesc}
                </p>
                <div className="pt-1 text-xs text-purple-200 flex items-center justify-center md:justify-start gap-1.5">
                  <CheckCircle2 className="w-4 h-4 text-[#fec84d]" />
                  <span>{t.plans.trialPhoneNotice}</span>
                </div>
              </div>

              <div className="shrink-0 w-full md:w-auto">
                <Link
                  to="/checkout"
                  search={{ plan: "trial" }}
                  className="block w-full md:w-auto rounded-full bg-[#fec84d] hover:bg-[#fed36c] text-[#1f0a44] font-black text-xs sm:text-sm px-8 py-3.5 shadow-xl hover:scale-105 active:scale-95 transition-all text-center cursor-pointer"
                >
                  {t.plans.trialCta}
                </Link>
              </div>
            </div>
          </div>

          {/* 3 Pricing Cards */}
          <div className="grid md:grid-cols-3 gap-8 max-w-5xl mx-auto items-stretch">
            {/* Monthly */}
            <div className="bg-white text-[#1f0a44] rounded-3xl p-8 flex flex-col justify-between shadow-2xl border border-white/20 transition-transform hover:-translate-y-1">
              <div>
                <h4 className="text-sm font-semibold text-slate-600">{t.plans.monthlyTitle}</h4>
                <div className="mt-4">
                  <span className="text-4xl sm:text-5xl font-extrabold tracking-tight text-[#1f0a44]">
                    {t.plans.monthlyPrice}
                  </span>
                  <span className="block text-xs text-slate-500 font-medium mt-1">{t.plans.perMonth}</span>
                </div>
                <div className="mt-4 text-xs text-slate-600 space-y-0.5 font-medium">
                  <p>{t.plans.monthlyBilling}</p>
                  <p>{t.plans.monthlyAnnualTotal}</p>
                </div>
              </div>
              <div className="mt-8 pt-6 border-t border-slate-100">
                <Link
                  to="/checkout"
                  search={{ plan: "monthly" }}
                  className="block w-full py-3 rounded-full text-xs font-bold uppercase tracking-wider bg-slate-100 text-[#1f0a44] hover:bg-slate-200 transition-colors text-center cursor-pointer"
                >
                  {t.plans.getMonthly}
                </Link>
              </div>
            </div>

            {/* Semiannual */}
            <div className="bg-white text-[#1f0a44] rounded-3xl p-8 flex flex-col justify-between shadow-2xl border border-white/20 transition-transform hover:-translate-y-1">
              <div>
                <h4 className="text-sm font-semibold text-slate-600">{t.plans.semiTitle}</h4>
                <div className="mt-4">
                  <span className="text-4xl sm:text-5xl font-extrabold tracking-tight text-[#1f0a44]">
                    {t.plans.semiPrice}
                  </span>
                  <span className="block text-xs text-slate-500 font-medium mt-1">{t.plans.perMonth}</span>
                </div>
                <div className="mt-4 text-xs text-slate-600 space-y-0.5 font-medium">
                  <p>{t.plans.semiBilling}</p>
                  <p>{t.plans.semiAnnualTotal}</p>
                </div>
                <div className="mt-3">
                  <span className="inline-block text-xs font-bold text-emerald-600 bg-emerald-50 px-2.5 py-1 rounded-full">
                    {t.plans.save20}
                  </span>
                </div>
              </div>
              <div className="mt-8 pt-6 border-t border-slate-100">
                <Link
                  to="/checkout"
                  search={{ plan: "semi" }}
                  className="block w-full py-3 rounded-full text-xs font-bold uppercase tracking-wider bg-slate-100 text-[#1f0a44] hover:bg-slate-200 transition-colors text-center cursor-pointer"
                >
                  {t.plans.getSemi}
                </Link>
              </div>
            </div>

            {/* Yearly (Highlighted in Green) */}
            <div className="bg-white text-[#1f0a44] rounded-3xl p-8 flex flex-col justify-between shadow-2xl border-2 border-emerald-400 relative transition-transform hover:-translate-y-1">
              <div className="absolute -top-3.5 left-1/2 -translate-x-1/2 bg-emerald-500 text-white text-[10px] font-bold uppercase tracking-widest px-3 py-1 rounded-full shadow-md">
                {t.plans.bestValue}
              </div>
              <div>
                <h4 className="text-sm font-semibold text-slate-600">{t.plans.yearlyTitle}</h4>
                <div className="mt-4">
                  <span className="text-4xl sm:text-5xl font-extrabold tracking-tight text-emerald-600">
                    {t.plans.yearlyPrice}
                  </span>
                  <span className="block text-xs text-slate-500 font-medium mt-1">{t.plans.perMonth}</span>
                </div>
                <div className="mt-4 text-xs text-slate-600 space-y-0.5 font-medium">
                  <p>{t.plans.yearlyBilling}</p>
                  <p>{t.plans.yearlyAnnualTotal}</p>
                </div>
                <div className="mt-3">
                  <span className="inline-block text-xs font-bold text-emerald-600 bg-emerald-50 px-2.5 py-1 rounded-full">
                    {t.plans.save40}
                  </span>
                </div>
              </div>
              <div className="mt-8 pt-6 border-t border-slate-100">
                <Link
                  to="/checkout"
                  search={{ plan: "yearly" }}
                  className="block w-full py-3 rounded-full text-xs font-bold uppercase tracking-wider bg-[#240b4a] text-white hover:bg-purple-900 transition-colors shadow-md text-center cursor-pointer"
                >
                  {t.plans.getYearly}
                </Link>
              </div>
            </div>
          </div>

          {/* Guarantee Ribbon & Main CTA */}
          <div className="pt-6 space-y-6">
            <div className="inline-flex items-center gap-2 text-white/90 text-sm font-semibold">
              <Award className="w-5 h-5 text-[#fec84d]" />
              <span>{t.plans.guarantee}</span>
            </div>

            <div>
              <Link
                to="/pricing"
                className="inline-flex items-center justify-center rounded-full bg-gradient-to-r from-[#240b4a] via-[#481885] to-[#170535] border border-white/20 px-10 py-3.5 text-sm font-semibold text-white shadow-xl shadow-purple-950/50 transition-all hover:scale-105 hover:border-white/40 cursor-pointer"
              >
                {t.plans.choosePlan}
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* 10. Brand Footer (Warm Yellow) */}
      <footer id="contact" className="bg-[#fec84d] text-[#1f0a44] pt-16 pb-12 px-6">
        <div className="max-w-6xl mx-auto">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-10">
            {/* Col 1: Logo & Social */}
            <div className="col-span-2 md:col-span-1 space-y-4">
              <img
                src="/images/logo.png"
                alt="Talk 'n' bit"
                className="h-12 w-auto object-contain brightness-0"
              />
              <div className="flex items-center gap-3 pt-2">
                <a
                  href="/"
                  className="w-8 h-8 rounded-full border border-[#1f0a44]/30 flex items-center justify-center hover:bg-black/10 transition-colors"
                  title="Website Home"
                >
                  <Globe className="w-4 h-4" />
                </a>
                <a
                  href={getWhatsAppUrl(t.whatsappMessages.contact)}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-8 h-8 rounded-full border border-[#1f0a44]/30 flex items-center justify-center hover:bg-black/10 transition-colors"
                  title="Chat on WhatsApp"
                >
                  <MessageCircle className="w-4 h-4" />
                </a>
              </div>
            </div>

            {/* Col 2: Language Switchers & Free Practice */}
            <div className="space-y-2.5 text-xs sm:text-sm font-medium">
              <button
                type="button"
                onClick={() => handleSelectLanguage("en")}
                className={`block text-left transition-colors cursor-pointer ${
                  selectedLang === "en" ? "font-bold underline" : "hover:underline opacity-85"
                }`}
              >
                English {selectedLang === "en" && "✓"}
              </button>
              <button
                type="button"
                onClick={() => handleSelectLanguage("pt")}
                className={`block text-left transition-colors cursor-pointer ${
                  selectedLang === "pt" ? "font-bold underline" : "hover:underline opacity-85"
                }`}
              >
                Português {selectedLang === "pt" && "✓"}
              </button>
              <button
                type="button"
                onClick={() => handleSelectLanguage("es")}
                className={`block text-left transition-colors cursor-pointer ${
                  selectedLang === "es" ? "font-bold underline" : "hover:underline opacity-85"
                }`}
              >
                Español {selectedLang === "es" && "✓"}
              </button>
              <a
                href={getWhatsAppUrl(t.whatsappMessages.freePractice)}
                target="_blank"
                rel="noopener noreferrer"
                className="block hover:underline pt-1 text-[#1e0a45] font-semibold"
              >
                {t.footer.freePractice}
              </a>
            </div>

            {/* Col 3: Lessons, Blog, FAQ, Trial */}
            <div className="space-y-2.5 text-xs sm:text-sm font-medium">
              <a
                href={getWhatsAppUrl(t.whatsappMessages.lesson)}
                target="_blank"
                rel="noopener noreferrer"
                className="block hover:underline"
              >
                {t.footer.bookLesson}
              </a>
              <button
                type="button"
                onClick={() => setIsBlogOpen(true)}
                className="block text-left hover:underline cursor-pointer"
              >
                {t.footer.blogTips}
              </button>
              <button
                type="button"
                onClick={() => setIsFaqOpen(true)}
                className="block text-left hover:underline cursor-pointer"
              >
                {t.footer.faq}
              </button>
              <a
                href={getWhatsAppUrl(t.whatsappMessages.trial)}
                target="_blank"
                rel="noopener noreferrer"
                className="block hover:underline text-[#1e0a45] font-semibold"
              >
                {t.footer.trial}
              </a>
            </div>

            {/* Col 4: Terms, Privacy, Contact, Admin Portal */}
            <div className="space-y-2.5 text-xs sm:text-sm font-medium">
              <Link to="/pricing" className="block hover:underline font-semibold text-[#1e0a45]">
                {t.nav.plans} & Pricing →
              </Link>
              <Link to="/terms" className="block hover:underline">
                {t.footer.terms}
              </Link>
              <Link to="/privacy" className="block hover:underline">
                {t.footer.privacy}
              </Link>
              <a
                href={getWhatsAppUrl(t.whatsappMessages.contact)}
                target="_blank"
                rel="noopener noreferrer"
                className="block hover:underline"
              >
                {t.footer.contactWa}
              </a>
              <a href="mailto:support@talknbit.com" className="block text-[11px] text-[#1e0a45]/80 hover:underline">
                support@talknbit.com
              </a>
              <Link to="/admin" className="block text-purple-950/90 hover:text-purple-950 underline font-bold pt-1">
                {t.footer.adminPortal}
              </Link>
            </div>
          </div>

          {/* Copyright */}
          <div className="mt-16 pt-8 border-t border-[#1f0a44]/15 text-center text-xs text-[#1f0a44]/80 font-medium">
            {t.footer.copyright}
          </div>
        </div>
      </footer>

      {/* FAQ MODAL */}
      {isFaqOpen && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 animate-in fade-in-50">
          <div className="bg-white rounded-3xl border border-purple-100 shadow-2xl max-w-2xl w-full max-h-[85vh] flex flex-col overflow-hidden animate-in zoom-in-95">
            {/* Modal Header */}
            <div className="px-6 py-5 border-b border-purple-50 flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-full bg-amber-100 flex items-center justify-center text-amber-900">
                  <HelpCircle className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-[#1e0a45]">{t.faqModal.title}</h3>
                  <p className="text-xs text-slate-500">{t.faqModal.subtitle}</p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setIsFaqOpen(false)}
                className="p-1.5 rounded-full hover:bg-slate-100 text-slate-400 hover:text-slate-700 transition-colors cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Accordion Content */}
            <div className="p-6 overflow-y-auto space-y-3 divide-y divide-purple-50">
              {t.faqModal.items.map((item, idx) => {
                const isOpen = openFaqIndex === idx;
                return (
                  <div key={idx} className="pt-3 first:pt-0">
                    <button
                      type="button"
                      onClick={() => setOpenFaqIndex(isOpen ? null : idx)}
                      className="w-full flex items-center justify-between text-left py-2 font-bold text-sm text-[#1e0a45] hover:text-purple-700 transition-colors cursor-pointer"
                    >
                      <span>{item.q}</span>
                      {isOpen ? <ChevronUp className="w-4 h-4 text-purple-700 shrink-0" /> : <ChevronDown className="w-4 h-4 text-slate-400 shrink-0" />}
                    </button>
                    {isOpen && (
                      <p className="text-xs sm:text-sm text-slate-600 mt-1 mb-2 leading-relaxed bg-purple-50/50 p-3.5 rounded-2xl border border-purple-100/60 animate-in fade-in slide-in-from-top-1">
                        {item.a}
                      </p>
                    )}
                  </div>
                );
              })}
            </div>

            {/* Modal Footer */}
            <div className="px-6 py-4 bg-purple-50/50 border-t border-purple-100 flex items-center justify-between">
              <span className="text-xs text-slate-500">{t.faqModal.differentQuestion}</span>
              <a
                href={getWhatsAppUrl(t.whatsappMessages.faq)}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1.5 rounded-full bg-[#240b4a] px-4 py-2 text-xs font-semibold text-white hover:bg-purple-900 transition-all"
              >
                <MessageCircle className="w-3.5 h-3.5 text-[#25D366]" /> {t.faqModal.askWa}
              </a>
            </div>
          </div>
        </div>
      )}

      {/* BLOG MODAL */}
      {isBlogOpen && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 animate-in fade-in-50">
          <div className="bg-white rounded-3xl border border-purple-100 shadow-2xl max-w-2xl w-full max-h-[85vh] flex flex-col overflow-hidden animate-in zoom-in-95">
            {/* Modal Header */}
            <div className="px-6 py-5 border-b border-purple-50 flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-full bg-purple-100 flex items-center justify-center text-purple-900">
                  <BookOpen className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-[#1e0a45]">{t.blogModal.title}</h3>
                  <p className="text-xs text-slate-500">{t.blogModal.subtitle}</p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setIsBlogOpen(false)}
                className="p-1.5 rounded-full hover:bg-slate-100 text-slate-400 hover:text-slate-700 transition-colors cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Articles List */}
            <div className="p-6 overflow-y-auto space-y-4">
              {t.blogModal.posts.map((post, idx) => (
                <article
                  key={idx}
                  className="rounded-2xl border border-purple-100 p-5 bg-purple-50/30 hover:bg-purple-50/70 transition-all space-y-2"
                >
                  <div className="flex items-center justify-between text-[11px] text-slate-400">
                    <span className="font-bold text-purple-800 bg-purple-100 px-2 py-0.5 rounded-full">
                      {post.tag}
                    </span>
                    <span>{post.readTime}</span>
                  </div>
                  <h4 className="text-base font-bold text-[#1e0a45] leading-snug">
                    {post.title}
                  </h4>
                  <p className="text-xs text-slate-600 leading-relaxed">
                    {post.summary}
                  </p>
                  <div className="pt-2">
                    <a
                      href={getWhatsAppUrl(`Hi! I read your blog post "${post.title}" and want to discuss it`)}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1 text-xs font-semibold text-purple-700 hover:text-purple-950 transition-colors"
                    >
                      {t.blogModal.discussWa} <ArrowRight className="w-3.5 h-3.5" />
                    </a>
                  </div>
                </article>
              ))}
            </div>

            {/* Modal Footer */}
            <div className="px-6 py-4 bg-purple-50/50 border-t border-purple-100 flex items-center justify-between">
              <span className="text-xs text-slate-500">{t.blogModal.readyPrompt}</span>
              <a
                href={WHATSAPP_URL}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1.5 rounded-full bg-[#240b4a] px-4 py-2 text-xs font-semibold text-white hover:bg-purple-900 transition-all"
              >
                {t.blogModal.startFree}
              </a>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
