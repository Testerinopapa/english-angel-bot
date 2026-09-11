import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useServerFn } from "@tanstack/react-start";
import { useEffect, useState, useMemo } from "react";
import { toast } from "sonner";
import {
  ArrowLeft,
  ShieldCheck,
  CheckCircle2,
  AlertCircle,
  Check,
  Bot,
  Sparkles,
  Users,
  MessageSquare,
  MessageCircle,
  Activity,
  Settings as SettingsIcon,
  Search,
  RefreshCw,
  Eye,
  Filter,
  Layers,
  ChevronDown,
  ChevronUp,
  CreditCard,
  Calendar,
  Zap,
  RotateCcw,
  Trash2,
  LogOut,
  Clock,
  Phone,
  ArrowRight,
} from "lucide-react";

import { AdminAuth } from "@/components/AdminAuth";
import { StatusPill } from "@/components/StatusPill";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Textarea } from "@/components/ui/textarea";
import { supabase } from "@/integrations/supabase/client";
import {
  getDashboard,
  updateSettings,
  grantSubscriberAccess,
  resetSubscriberCount,
  deleteSubscriber,
  linkPhoneToStudentAccount,
} from "@/lib/admin.functions";
import type { SettingsUpdate } from "@/lib/admin-schema";
import { ADMIN_TRANSLATIONS, type SupportedLang } from "@/lib/admin-translations";

export const Route = createFileRoute("/admin")({
  head: () => ({
    meta: [
      { title: "Talk'n'Bit — Admin Portal & Message Monitor" },
      {
        name: "description",
        content:
          "Internal control panel for Talk'n'Bit: read and monitor incoming WhatsApp messages, bot status, and prompt settings.",
      },
      { property: "og:title", content: "Talk'n'Bit — Admin Portal & Message Monitor" },
      {
        property: "og:description",
        content: "Internal control panel and WhatsApp message monitor for Talk'n'Bit.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
      { name: "robots", content: "noindex, nofollow" },
    ],
  }),
  component: AdminDashboard,
});

const statusLabels: Record<string, { label: string; tone: "ok" | "warn" | "bad" | "idle" }> = {
  // Corrections & AI Feedback
  corrected: { label: "Correction Sent", tone: "ok" },
  corrected_group_dm: { label: "Group Correction DM", tone: "ok" },
  relay_corrected: { label: "Relayed + Correction", tone: "ok" },
  relay_ok: { label: "Relayed (No Mistake)", tone: "idle" },
  no_error: { label: "Natural English (Clean)", tone: "idle" },
  confirmed_correct: { label: "Confirmed Natural", tone: "ok" },
  hint_sent: { label: "Grammar Hint Sent", tone: "ok" },
  explanation_sent: { label: "Grammar Explanation", tone: "ok" },

  // Bot Navigation & Onboarding Menus
  intro_sent: { label: "Welcome Menu Sent", tone: "ok" },
  capabilities_sent: { label: "How It Works Sent", tone: "ok" },
  starter_sent: { label: "1-on-1 Practice Started", tone: "ok" },
  room_tutorial_sent: { label: "Study Buddy Guide", tone: "ok" },
  room_command: { label: "Study Buddy Command", tone: "idle" },
  try_sentence_prompted: { label: "Practice Prompt Sent", tone: "ok" },
  bilingual_answered: { label: "Bilingual Helper Sent", tone: "ok" },

  // Subscriptions & Paywall
  paywall_shown: { label: "Trial Paywall Shown", tone: "warn" },
  pay_link_sent: { label: "Checkout Link Sent", tone: "ok" },
  paywall_benefits_sent: { label: "Plan Benefits Sent", tone: "ok" },

  // System & Status
  skipped_disabled: { label: "Bot Inactive", tone: "warn" },
  failed: { label: "Processing Error", tone: "bad" },
  received: { label: "Message Received", tone: "idle" },
};

function getStatusInfo(status: string, lang: SupportedLang = "en"): { label: string; tone: "ok" | "warn" | "bad" | "idle" } {
  const dict = (ADMIN_TRANSLATIONS[lang] || ADMIN_TRANSLATIONS.en).statusLabels;
  if (dict[status]) {
    return dict[status];
  }
  if (statusLabels[status]) {
    return statusLabels[status];
  }
  const cleanLabel = status
    .replace(/_/g, " ")
    .replace(/\b\w/g, (c) => c.toUpperCase());
  return { label: cleanLabel, tone: "idle" };
}

interface MessageEventRow {
  id: string;
  wa_message_id: string;
  sender_masked: string | null;
  status: string;
  has_error: boolean | null;
  correction_sent: boolean;
  error_detail: string | null;
  message_content?: string | null;
  created_at: string;
}

function parseMessageEvent(row: MessageEventRow) {
  let studentText = row.message_content || "";
  let botReply: string | null = null;
  let correctedText: string | null = null;
  let explanation: string | null = null;
  let isRoom = false;
  let roomCode: string | null = null;
  let partnerMasked: string | null = null;
  let isGroup = false;

  if (row.error_detail) {
    try {
      const p = JSON.parse(row.error_detail);
      if (typeof p.original_text === "string" && p.original_text.trim()) {
        studentText = p.original_text;
      }
      if (typeof p.corrected_text === "string") correctedText = p.corrected_text;
      if (typeof p.explanation === "string") explanation = p.explanation;
      if (typeof p.reply === "string") botReply = p.reply;
      if (p.is_room_relay || p.room_code) {
        isRoom = true;
        roomCode = p.room_code ?? null;
        partnerMasked = p.partner_masked ?? null;
      }
      if (p.is_group) isGroup = true;
    } catch {
      // plain text error detail
    }
  }

  if (studentText.startsWith("[Room #")) {
    isRoom = true;
    const match = studentText.match(/^\[Room #([^\]]+)\]\s*(.*)$/);
    if (match) {
      roomCode = match[1];
      studentText = match[2];
    }
  } else if (studentText.startsWith("[Group] ")) {
    isGroup = true;
    studentText = studentText.replace(/^\[Group\]\s*/, "");
  }

  // Convert raw button IDs to human-friendly action text
  if (studentText.startsWith("[btn_") || studentText.startsWith("btn_") || (studentText.startsWith("[") && studentText.endsWith("]"))) {
    const rawClean = studentText.replace(/^\[|\]$/g, "");
    if (rawClean === "btn_1on1" || rawClean.includes("Practice 1-on-1")) {
      studentText = "🔘 Selected: Practice 1-on-1 🗣️";
    } else if (rawClean === "btn_rooms" || rawClean.includes("Study Buddy")) {
      studentText = "🔘 Selected: Study Buddy Rooms 👥";
    } else if (rawClean === "btn_capabilities" || rawClean.includes("How It Works")) {
      studentText = "🔘 Selected: How It Works 💡";
    } else if (rawClean === "btn_try_sentence" || rawClean.includes("Try in a Sentence")) {
      studentText = "🔘 Selected: Try in a Sentence ✍️";
    } else if (rawClean === "btn_random_topic" || rawClean.includes("New Topic") || rawClean.includes("Random Topic")) {
      studentText = "🔘 Selected: New Topic 🎲";
    } else if (rawClean === "btn_sentence_hint" || rawClean.includes("Hint")) {
      studentText = "🔘 Selected: Give Me a Hint 💡";
    } else if (rawClean === "btn_join_101" || rawClean.includes("Join Room")) {
      studentText = "🔘 Selected: Join Room #101 🚀";
    } else if (rawClean === "btn_pay_monthly") {
      studentText = "🔘 Selected: Monthly Plan (R$36) 💳";
    } else if (rawClean === "btn_pay_yearly") {
      studentText = "🔘 Selected: Yearly Plan (40% OFF) 🚀";
    } else if (rawClean === "btn_paywall_benefits") {
      studentText = "🔘 Selected: What's Included 💡";
    }
  }

  // Friendly descriptions of bot responses for onboarding & menu flows
  if (row.status === "intro_sent") {
    studentText = studentText || "Sent greeting / started conversation";
    botReply = botReply || "Sent Talk'n'Bit Welcome Menu: 1-on-1 Practice, Study Buddy Rooms & How It Works";
  } else if (row.status === "capabilities_sent") {
    studentText = studentText || "🔘 Selected: How It Works 💡";
    botReply = botReply || "Sent feature overview & instructions on how Talk'n'Bit corrects English";
  } else if (row.status === "starter_sent") {
    studentText = studentText || "🔘 Selected: Practice 1-on-1 🗣️";
    botReply = botReply || "Sent 1-on-1 practice topic starter to get the conversation rolling";
  } else if (row.status === "room_tutorial_sent") {
    studentText = studentText || "🔘 Selected: Study Buddy Rooms 👥";
    botReply = botReply || "Sent Study Buddy Room tutorial (/join <code>)";
  } else if (row.status === "try_sentence_prompted") {
    studentText = studentText || "🔘 Selected: Try in a Sentence ✍️";
    botReply = botReply || "Prompted student to write a practice sentence for AI review";
  } else if (row.status === "hint_sent") {
    studentText = studentText || "🔘 Selected: Give Me a Hint 💡";
    botReply = botReply || "Sent sentence starter ideas and vocabulary hints";
  } else if (row.status === "paywall_shown") {
    botReply = botReply || "Sent trial expiration notice & subscription plan options";
  } else if (row.status === "pay_link_sent") {
    botReply = botReply || "Sent secure checkout link";
  } else if (row.status === "paywall_benefits_sent") {
    studentText = studentText || "🔘 Selected: What's Included 💡";
    botReply = botReply || "Sent full Talk'n'Bit Premium benefits breakdown";
  } else if (row.status === "explanation_sent") {
    studentText = studentText || "Tapped 'Why? 💡' button";
    if (row.error_detail) {
      try {
        const p = JSON.parse(row.error_detail);
        if (p.explanation) explanation = p.explanation;
      } catch {}
    }
  }

  return {
    id: row.id,
    waMessageId: row.wa_message_id,
    senderMasked: row.sender_masked || "Unknown",
    status: row.status,
    hasError: row.has_error,
    correctionSent: row.correction_sent,
    createdAt: row.created_at,
    studentText: studentText.trim(),
    botReply,
    correctedText,
    explanation,
    isRoom,
    roomCode,
    partnerMasked,
    isGroup,
    rawDetail: row.error_detail,
  };
}

function AdminDashboard() {
  const [session, setSession] = useState<{ email?: string } | null | undefined>(undefined);

  useEffect(() => {
    const { data: sub } = supabase.auth.onAuthStateChange((_event, s) => {
      setSession(s ? { email: s.user.email ?? "" } : null);
    });
    supabase.auth.getSession().then(({ data }) => {
      setSession(data.session ? { email: data.session.user.email ?? "" } : null);
    });
    return () => sub.subscription.unsubscribe();
  }, []);

  if (session === undefined) {
    return (
      <main className="min-h-screen bg-[#fbf9fe] flex items-center justify-center">
        <div className="w-8 h-8 rounded-full border-2 border-purple-600 border-t-transparent animate-spin" />
      </main>
    );
  }
  if (session === null) {
    return <AdminAuth />;
  }
interface StudentPortalProps {
  email: string;
  subscription: any;
  selectedLang: SupportedLang;
  handleSelectLanguage: (lang: SupportedLang) => void;
  t: (typeof ADMIN_TRANSLATIONS)["en"];
  onRefresh: () => void;
}

function StudentPortal({
  email,
  subscription,
  selectedLang,
  handleSelectLanguage,
  t,
  onRefresh,
}: StudentPortalProps) {
  const linkPhoneFn = useServerFn(linkPhoneToStudentAccount);
  const [manualPhone, setManualPhone] = useState("");
  const [isLinking, setIsLinking] = useState(false);

  const daysRemaining = useMemo(() => {
    if (!subscription) return 0;
    const targetDateStr = subscription.trial_ends_at || subscription.subscription_ends_at;
    if (!targetDateStr) return 15;
    const target = new Date(targetDateStr);
    const now = new Date();
    const diffMs = target.getTime() - now.getTime();
    return Math.max(0, Math.ceil(diffMs / (1000 * 60 * 60 * 24)));
  }, [subscription]);

  const formattedExpiry = useMemo(() => {
    if (!subscription) return "";
    const targetDateStr = subscription.trial_ends_at || subscription.subscription_ends_at;
    if (!targetDateStr) return "";
    return new Date(targetDateStr).toLocaleDateString(
      selectedLang === "pt" ? "pt-BR" : selectedLang === "es" ? "es-ES" : "en-US",
      { month: "short", day: "numeric", year: "numeric" }
    );
  }, [subscription, selectedLang]);

  const formattedPhone = useMemo(() => {
    if (!subscription?.phone_number) return "";
    const p = String(subscription.phone_number);
    if (p.startsWith("55") && p.length >= 12) {
      const ddd = p.slice(2, 4);
      const rest = p.slice(4);
      if (rest.length === 9) {
        return `+55 (${ddd}) ${rest.slice(0, 5)}-${rest.slice(5)}`;
      }
      return `+55 (${ddd}) ${rest.slice(0, 4)}-${rest.slice(4)}`;
    }
    return `+${p}`;
  }, [subscription]);

  const whatsAppUrl = useMemo(() => {
    const customMessage =
      selectedLang === "pt"
        ? "Olá Talk'n'Bit! 🚀 Estou com meu acesso ativo no portal e quero praticar inglês!"
        : selectedLang === "es"
        ? "¡Hola Talk'n'Bit! 🚀 ¡Tengo mi acceso activo en el portal y quiero practicar inglés!"
        : "Hello Talk'n'Bit! 🚀 I have active access on the portal and want to practice English!";
    return `https://wa.me/5513991878104?text=${encodeURIComponent(customMessage)}`;
  }, [selectedLang]);

  const handleLinkPhone = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!manualPhone.trim() || manualPhone.replace(/\D/g, "").length < 8) {
      toast.error(selectedLang === "pt" ? "Digite um número válido com DDD" : "Please enter a valid phone number");
      return;
    }
    setIsLinking(true);
    try {
      await linkPhoneFn({ data: { phone: manualPhone, email } });
      toast.success(selectedLang === "pt" ? "Telefone vinculado com sucesso!" : "Phone linked successfully!");
      setManualPhone("");
      onRefresh();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Failed to link phone");
    } finally {
      setIsLinking(false);
    }
  };

  const isTrial = subscription?.plan === "free_trial" || subscription?.status === "trial";
  const isExpired = subscription?.status === "expired" || (daysRemaining === 0 && Boolean(subscription));

  return (
    <div className="min-h-screen bg-[#fbf9fe] text-[#1e0a45] font-sans selection:bg-[#fec84d] selection:text-[#1e0a45] relative">
      {/* Ambient background glow */}
      <div className="fixed inset-0 bg-[radial-gradient(ellipse_80%_45%_at_50%_-15%,rgba(120,60,200,0.06),transparent)] pointer-events-none" />

      {/* Top Navbar */}
      <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-purple-100/80 shadow-xs">
        <div className="max-w-5xl mx-auto px-6 h-18 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Link to="/" className="flex items-center gap-2 group">
              <img
                src="/images/logo.png"
                alt="Talk 'n' bit"
                className="h-10 w-auto object-contain transition-transform group-hover:scale-105"
              />
            </Link>
            <span className="inline-flex items-center gap-1.5 rounded-full bg-purple-100/80 px-3 py-1 text-xs font-bold text-purple-900 border border-purple-200/70">
              <Sparkles className="w-3.5 h-3.5 text-purple-700" />
              <span>{t.studentPortal.badge}</span>
            </span>
          </div>

          <div className="flex items-center gap-3">
            <span className="hidden sm:inline-flex items-center gap-2 text-xs font-medium text-slate-600 bg-slate-100/80 px-3 py-1 rounded-full">
              {email}
            </span>

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
              className="inline-flex items-center gap-1.5 rounded-full border border-purple-900/15 bg-purple-50/70 px-3.5 py-1.5 text-xs font-semibold text-[#1e0a45] transition-all hover:bg-purple-100 hover:border-purple-900/30"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">{t.nav.viewSite}</span>
            </Link>

            <button
              type="button"
              onClick={() => supabase.auth.signOut()}
              className="rounded-full bg-[#fef2f2] border border-[#fecdd3] text-[#e11d48] font-semibold text-xs px-3.5 py-1.5 hover:bg-[#fee2e2] hover:border-[#fda4af] hover:text-[#be123c] shadow-2xs transition-all active:scale-95 cursor-pointer inline-flex items-center gap-1.5"
            >
              <LogOut className="w-3.5 h-3.5" />
              <span>{t.nav.signOut}</span>
            </button>
          </div>
        </div>
      </header>

      {/* Main Content Area */}
      <main className="max-w-5xl mx-auto px-6 py-8 sm:py-12 space-y-8 relative z-10">
        {subscription ? (
          <>
            {/* Active Subscription / Trial Hero Card */}
            <div className="rounded-3xl bg-gradient-to-br from-[#240b4a] via-[#371070] to-[#170535] text-white p-6 sm:p-10 shadow-2xl relative overflow-hidden border border-purple-300/20">
              <div className="absolute -right-16 -top-16 w-64 h-64 bg-[#fec84d]/15 rounded-full blur-3xl pointer-events-none" />

              <div className="space-y-6 relative z-10">
                <div className="flex flex-wrap items-center justify-between gap-4">
                  <div className="inline-flex items-center gap-2 bg-[#fec84d] text-[#1f0a44] px-3.5 py-1 rounded-full text-xs font-black uppercase tracking-wider shadow-xs">
                    <Sparkles className="w-3.5 h-3.5" />
                    <span>{isTrial ? t.studentPortal.trialBadge : String(subscription.plan)}</span>
                  </div>

                  <span
                    className={`px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider flex items-center gap-1.5 ${
                      isExpired
                        ? "bg-rose-500/20 text-rose-300 border border-rose-500/30"
                        : "bg-emerald-500/20 text-emerald-300 border border-emerald-500/30"
                    }`}
                  >
                    <span
                      className={`w-2 h-2 rounded-full ${isExpired ? "bg-rose-400" : "bg-emerald-400 animate-pulse"}`}
                    />
                    <span>{isExpired ? t.studentPortal.expiredStatus : t.studentPortal.activeStatus}</span>
                  </span>
                </div>

                <div>
                  <h1 className="text-2xl sm:text-4xl font-extrabold tracking-tight">
                    {t.studentPortal.welcomeBack}, {email}!
                  </h1>
                  <p className="text-xs sm:text-sm text-purple-100/90 mt-2 max-w-2xl leading-relaxed">
                    {t.studentPortal.practicePrompt}
                  </p>
                </div>

                {/* 3 Status Info Cards */}
                <div className="grid sm:grid-cols-3 gap-4 pt-2">
                  <div className="rounded-2xl bg-white/10 backdrop-blur-md p-4 border border-white/15">
                    <div className="flex items-center gap-2 text-purple-200 text-xs font-semibold">
                      <Phone className="w-4 h-4 text-[#fec84d]" />
                      <span>{t.studentPortal.activatedPhone}</span>
                    </div>
                    <div className="mt-2 text-base sm:text-lg font-black tracking-tight text-white font-mono">
                      {formattedPhone || "1 Phone Activated"}
                    </div>
                    <p className="text-[11px] text-emerald-300 font-medium mt-1 flex items-center gap-1">
                      <CheckCircle2 className="w-3 h-3" />
                      <span>1 WhatsApp phone active</span>
                    </p>
                  </div>

                  <div className="rounded-2xl bg-white/10 backdrop-blur-md p-4 border border-white/15">
                    <div className="flex items-center gap-2 text-purple-200 text-xs font-semibold">
                      <Clock className="w-4 h-4 text-[#fec84d]" />
                      <span>{t.studentPortal.expiresLabel}</span>
                    </div>
                    <div className="mt-2 text-base sm:text-lg font-black tracking-tight text-white">
                      {isExpired ? `0 ${t.studentPortal.daysLeft}` : `${daysRemaining} ${t.studentPortal.daysLeft}`}
                    </div>
                    <p className="text-[11px] text-purple-200/80 font-medium mt-1">
                      {formattedExpiry ? `${t.studentPortal.expiresOn} ${formattedExpiry}` : "Full access"}
                    </p>
                  </div>

                  <div className="rounded-2xl bg-white/10 backdrop-blur-md p-4 border border-white/15">
                    <div className="flex items-center gap-2 text-purple-200 text-xs font-semibold">
                      <MessageCircle className="w-4 h-4 text-[#fec84d]" />
                      <span>{t.studentPortal.messagesSent}</span>
                    </div>
                    <div className="mt-2 text-base sm:text-lg font-black tracking-tight text-white">
                      {subscription.messages_count || 0}
                    </div>
                    <p className="text-[11px] text-purple-200/80 font-medium mt-1">
                      Real-time AI corrections
                    </p>
                  </div>
                </div>

                {/* Big Primary Action: Open WhatsApp */}
                <div className="pt-2">
                  <a
                    href={whatsAppUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="w-full sm:w-auto inline-flex items-center justify-center gap-2 rounded-full bg-[#25D366] hover:bg-[#20bd5a] text-white font-extrabold text-sm sm:text-base px-8 py-4 shadow-xl hover:scale-105 active:scale-95 transition-all cursor-pointer"
                  >
                    <MessageCircle className="w-5 h-5 fill-white" />
                    <span>{t.studentPortal.openWhatsAppBtn}</span>
                  </a>
                </div>
              </div>
            </div>

            {/* 3 Learning Features */}
            <div className="grid md:grid-cols-3 gap-6">
              <div className="rounded-3xl border border-purple-100 bg-white p-6 shadow-xs space-y-2 hover:shadow-md transition-shadow">
                <div className="w-10 h-10 rounded-2xl bg-purple-50 border border-purple-200 flex items-center justify-center text-purple-700">
                  <Bot className="w-5 h-5" />
                </div>
                <h3 className="font-bold text-sm text-[#1e0a45]">{t.studentPortal.feature1Title}</h3>
                <p className="text-xs text-slate-500 leading-relaxed">{t.studentPortal.feature1Desc}</p>
              </div>

              <div className="rounded-3xl border border-purple-100 bg-white p-6 shadow-xs space-y-2 hover:shadow-md transition-shadow">
                <div className="w-10 h-10 rounded-2xl bg-amber-50 border border-amber-200 flex items-center justify-center text-amber-700">
                  <Sparkles className="w-5 h-5" />
                </div>
                <h3 className="font-bold text-sm text-[#1e0a45]">{t.studentPortal.feature2Title}</h3>
                <p className="text-xs text-slate-500 leading-relaxed">{t.studentPortal.feature2Desc}</p>
              </div>

              <div className="rounded-3xl border border-purple-100 bg-white p-6 shadow-xs space-y-2 hover:shadow-md transition-shadow">
                <div className="w-10 h-10 rounded-2xl bg-blue-50 border border-blue-200 flex items-center justify-center text-blue-700">
                  <Users className="w-5 h-5" />
                </div>
                <h3 className="font-bold text-sm text-[#1e0a45]">{t.studentPortal.feature3Title}</h3>
                <p className="text-xs text-slate-500 leading-relaxed">{t.studentPortal.feature3Desc}</p>
              </div>
            </div>

            {/* Upgrade Plan Card */}
            <div className="rounded-3xl border border-purple-100/90 bg-white p-6 sm:p-8 shadow-sm flex flex-col md:flex-row items-center justify-between gap-6">
              <div className="space-y-1 text-center md:text-left">
                <h4 className="text-base font-bold text-[#1e0a45]">{t.studentPortal.upgradeTitle}</h4>
                <p className="text-xs text-slate-500 max-w-xl leading-relaxed">{t.studentPortal.upgradeDesc}</p>
              </div>
              <div className="flex flex-wrap items-center justify-center gap-3 shrink-0">
                <Link
                  to="/checkout"
                  search={{ plan: "yearly" }}
                  className="rounded-full bg-gradient-to-r from-[#240b4a] to-[#170535] text-white font-bold text-xs px-6 py-3 shadow-md hover:scale-105 active:scale-95 transition-all text-center cursor-pointer"
                >
                  {t.studentPortal.upgradeYearly}
                </Link>
                <Link
                  to="/checkout"
                  search={{ plan: "monthly" }}
                  className="rounded-full bg-slate-100 hover:bg-slate-200 text-slate-800 font-semibold text-xs px-5 py-3 border border-slate-200 transition-all text-center cursor-pointer"
                >
                  {t.studentPortal.upgradeMonthly}
                </Link>
              </div>
            </div>
          </>
        ) : (
          /* User has account but hasn't activated 15-day free trial yet */
          <div className="max-w-2xl mx-auto rounded-3xl border border-purple-100 bg-white p-8 sm:p-12 shadow-xl shadow-purple-950/5 text-center space-y-6">
            <div className="w-16 h-16 rounded-full bg-[#fec84d]/20 border border-[#fec84d]/50 flex items-center justify-center mx-auto text-[#1f0a44]">
              <Sparkles className="w-8 h-8 text-purple-700" />
            </div>

            <div className="space-y-2">
              <div className="inline-flex items-center gap-1.5 rounded-full bg-[#fec84d] text-[#1f0a44] px-3.5 py-1 text-xs font-black uppercase tracking-wider">
                <Sparkles className="w-3.5 h-3.5" />
                <span>100% FREE</span>
              </div>
              <h2 className="text-2xl sm:text-3xl font-extrabold text-[#1f0a44] tracking-tight">
                {t.studentPortal.noSubTitle}
              </h2>
              <p className="text-xs sm:text-sm text-slate-600 max-w-lg mx-auto leading-relaxed">
                {t.studentPortal.noSubDesc}
              </p>
            </div>

            <div className="pt-2">
              <Link
                to="/checkout"
                search={{ plan: "trial" }}
                className="inline-flex items-center justify-center gap-2 rounded-full bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-sm px-8 py-4 shadow-xl hover:scale-105 active:scale-95 transition-all cursor-pointer w-full sm:w-auto"
              >
                <Sparkles className="w-4 h-4" />
                <span>{t.studentPortal.activateTrialBtn}</span>
              </Link>
            </div>

            {/* Link existing WhatsApp number if already activated */}
            <div className="pt-6 border-t border-purple-50 text-left space-y-3">
              <p className="text-xs text-slate-600 font-medium">
                {t.studentPortal.linkPhonePrompt}
              </p>
              <form onSubmit={handleLinkPhone} className="flex gap-2">
                <Input
                  type="tel"
                  value={manualPhone}
                  onChange={(e) => setManualPhone(e.target.value)}
                  placeholder={t.studentPortal.phoneInputPlaceholder}
                  className="rounded-xl border-slate-200 bg-slate-50/50 text-xs px-3.5 py-2.5 flex-1"
                />
                <Button
                  type="submit"
                  disabled={isLinking}
                  className="rounded-xl bg-[#240b4a] hover:bg-[#35106b] text-white text-xs font-semibold px-5"
                >
                  {t.studentPortal.linkPhoneBtn}
                </Button>
              </form>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}

function Dashboard({ email }: { email: string }) {
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

  const t = ADMIN_TRANSLATIONS[selectedLang] || ADMIN_TRANSLATIONS.en;

  const handleSelectLanguage = (lang: SupportedLang) => {
    setSelectedLang(lang);
    if (typeof window !== "undefined") {
      localStorage.setItem("talknbit_lang", lang);
    }
    const names = { en: "English", pt: "Português (Brasil)", es: "Español" };
    toast.success(`Language set to ${names[lang]}`);
  };

  const navigate = useNavigate();
  const fetchDashboard = useServerFn(getDashboard);
  const saveSettings = useServerFn(updateSettings);
  const queryClient = useQueryClient();
  const grantAccess = useServerFn(grantSubscriberAccess);
  const [subSearchQuery, setSubSearchQuery] = useState("");
  const [subStatusFilter, setSubStatusFilter] = useState<"all" | "active" | "trial" | "expired">("all");
  const [grantPhone, setGrantPhone] = useState("");
  const [grantPlan, setGrantPlan] = useState<"monthly" | "yearly" | "lifetime">("monthly");
  const [grantDays, setGrantDays] = useState(30);

  const grantMutation = useMutation({
    mutationFn: (input: { phone: string; plan: "monthly" | "yearly" | "lifetime"; days: number }) =>
      grantAccess({ data: input }),
    onSuccess: () => {
      toast.success("Subscriber access updated successfully!");
      setGrantPhone("");
      queryClient.invalidateQueries({ queryKey: ["dashboard"] });
    },
    onError: (e) => toast.error(e instanceof Error ? e.message : "Failed to grant access"),
  });

  const resetCountFn = useServerFn(resetSubscriberCount);
  const deleteSubFn = useServerFn(deleteSubscriber);

  const resetCountMutation = useMutation({
    mutationFn: (phone: string) => resetCountFn({ data: { phone } }),
    onSuccess: () => {
      toast.success("Message counter reset to 0");
      queryClient.invalidateQueries({ queryKey: ["dashboard"] });
    },
    onError: (e) => toast.error(e instanceof Error ? e.message : "Failed to reset count"),
  });

  const deleteSubMutation = useMutation({
    mutationFn: (id: string) => deleteSubFn({ data: { id } }),
    onSuccess: () => {
      toast.success("Subscriber removed successfully");
      queryClient.invalidateQueries({ queryKey: ["dashboard"] });
    },
    onError: (e) => toast.error(e instanceof Error ? e.message : "Failed to remove subscriber"),
  });

  const [activeTab, setActiveTab] = useState("overview");

  // Message filter states
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<"all" | "corrected" | "clean" | "rooms" | "failed">("all");
  const [viewMode, setViewMode] = useState<"feed" | "table">("feed");

  const { data, isLoading, isFetching, error } = useQuery({
    queryKey: ["dashboard", email],
    queryFn: () => fetchDashboard({ data: { email } }),
    refetchInterval: 30_000,
  });

  const mutation = useMutation({
    mutationFn: (input: SettingsUpdate) => saveSettings({ data: input }),
    onSuccess: () => {
      toast.success("Settings saved successfully");
      queryClient.invalidateQueries({ queryKey: ["dashboard"] });
    },
    onError: (e) => toast.error(e instanceof Error ? e.message : "Could not save"),
  });

  const [prompt, setPrompt] = useState<string | null>(null);
  const currentPrompt = prompt ?? data?.settings?.system_prompt ?? "";



  // Parsed and filtered messages
  const filteredSubscribers = useMemo(() => {
    const list = (data?.subscribers as any[]) || [];
    return list.filter((sub) => {
      const matchSearch =
        !subSearchQuery.trim() ||
        sub.phone_number.includes(subSearchQuery.trim().replace(/\D/g, "")) ||
        (sub.plan && sub.plan.toLowerCase().includes(subSearchQuery.toLowerCase()));

      let matchStatus = true;
      if (subStatusFilter === "active") {
        matchStatus = sub.status === "active" || sub.status === "vip";
      } else if (subStatusFilter === "trial") {
        matchStatus = sub.status === "trial";
      } else if (subStatusFilter === "expired") {
        matchStatus = sub.status === "expired" || sub.status === "cancelled";
      }

      return matchSearch && matchStatus;
    });
  }, [data?.subscribers, subSearchQuery, subStatusFilter]);

  const parsedMessages = useMemo(() => {
    const raw = (data?.recent ?? []) as MessageEventRow[];
    return raw.map(parseMessageEvent);
  }, [data?.recent]);

  const filteredMessages = useMemo(() => {
    return parsedMessages.filter((msg) => {
      // Status filter
      if (statusFilter === "corrected") {
        if (!msg.status.includes("corrected") && !msg.hasError) return false;
      } else if (statusFilter === "clean") {
        if (msg.status !== "no_error" && msg.status !== "relay_ok") return false;
      } else if (statusFilter === "rooms") {
        if (!msg.isRoom && msg.status !== "room_command") return false;
      } else if (statusFilter === "failed") {
        if (msg.status !== "failed" && msg.status !== "skipped_disabled") return false;
      }

      // Search query
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const matchesText = msg.studentText.toLowerCase().includes(q);
        const matchesSender = msg.senderMasked.toLowerCase().includes(q);
        const matchesCorrection = (msg.botReply || msg.correctedText || "").toLowerCase().includes(q);
        const matchesExplanation = (msg.explanation || "").toLowerCase().includes(q);
        const matchesRoom = (msg.roomCode || "").toLowerCase().includes(q);
        return matchesText || matchesSender || matchesCorrection || matchesExplanation || matchesRoom;
      }

      return true;
    });
  }, [parsedMessages, statusFilter, searchQuery]);

  if (isLoading) {
    return (
      <main className="min-h-screen bg-[#fbf9fe] flex items-center justify-center">
        <div className="w-8 h-8 rounded-full border-2 border-purple-600 border-t-transparent animate-spin" />
      </main>
    );
  }

  if (data?.role === "student") {
    return (
      <StudentPortal
        email={email}
        subscription={data.subscription}
        selectedLang={selectedLang}
        handleSelectLanguage={handleSelectLanguage}
        t={t}
        onRefresh={() => queryClient.invalidateQueries({ queryKey: ["dashboard", email] })}
      />
    );
  }

  if (error) {
    const handleContinueTrial = () => {
      // Keep session active and proceed directly to free trial checkout!
      navigate({ to: "/checkout", search: { plan: "trial" } as any });
    };

    const handleGoHome = () => {
      navigate({ to: "/" });
    };

    const handleSignOut = async () => {
      try {
        await supabase.auth.signOut();
      } catch (err) {
        console.warn("Sign out error:", err);
      }
    };

    return (
      <main className="min-h-screen bg-gradient-to-b from-[#fbf9fe] to-purple-50/50 flex items-center justify-center p-4 text-center">
        <div className="w-full max-w-md rounded-3xl border border-purple-100 bg-white p-8 shadow-xl shadow-purple-950/5 space-y-4">
          <div className="flex justify-end mb-1">
            <div className="flex items-center bg-purple-50/90 p-0.5 rounded-full border border-purple-200/70 text-[11px] font-bold">
              {(["en", "pt", "es"] as const).map((lang) => (
                <button
                  key={lang}
                  type="button"
                  onClick={() => handleSelectLanguage(lang)}
                  className={`px-2 py-0.5 rounded-full transition-all cursor-pointer uppercase ${
                    selectedLang === lang
                      ? "bg-[#240b4a] text-white shadow-xs"
                      : "text-purple-900/80 hover:text-purple-950"
                  }`}
                >
                  {lang}
                </button>
              ))}
            </div>
          </div>

          <div className="mx-auto w-14 h-14 rounded-full bg-purple-50 border border-purple-200/80 flex items-center justify-center text-purple-700 shadow-xs">
            <Sparkles className="w-7 h-7 text-purple-700" />
          </div>

          <div className="space-y-2">
            <div className="inline-flex items-center gap-1.5 rounded-full bg-purple-100/90 px-3 py-0.5 text-[11px] font-bold text-purple-900 border border-purple-200">
              <Sparkles className="w-3 h-3 text-purple-700" />
              <span>{t.auth.studentAccountBadge}</span>
            </div>
            <h1 className="text-xl sm:text-2xl font-black text-[#1e0a45]">{t.auth.noAccessTitle}</h1>
            <p className="text-xs text-slate-600 leading-relaxed max-w-sm mx-auto">
              Account {email ? <span className="font-semibold text-purple-950">({email})</span> : ""} {t.auth.noAccessDesc}
            </p>
          </div>

          {/* Trial Prompt Banner */}
          <div className="rounded-2xl border border-emerald-200 bg-emerald-50/80 p-4 text-left space-y-1.5 shadow-2xs">
            <div className="flex items-center gap-2 text-xs font-bold text-emerald-950">
              <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
              <span>{t.auth.trialPromptTitle}</span>
            </div>
            <p className="text-[11px] text-emerald-900/90 leading-relaxed">
              {t.auth.trialPromptDesc}
            </p>
          </div>

          {/* Primary Action Button: Continue to Free Trial with Account */}
          <div className="pt-2 space-y-2.5">
            <button
              type="button"
              onClick={handleContinueTrial}
              className="w-full py-3.5 px-5 rounded-full bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs sm:text-sm shadow-md shadow-emerald-800/20 transition-all hover:scale-[1.02] active:scale-[0.98] cursor-pointer flex items-center justify-center gap-2"
            >
              <Sparkles className="w-4 h-4" />
              <span>{t.auth.startTrialWithAccount}</span>
            </button>

            <div className="flex items-center justify-center gap-2.5 pt-1">
              <button
                type="button"
                onClick={handleGoHome}
                className="inline-flex items-center justify-center rounded-full bg-slate-100 hover:bg-slate-200 border border-slate-200 px-4 py-2 text-xs font-semibold text-slate-700 shadow-2xs hover:scale-105 transition-all cursor-pointer"
              >
                <span>{t.auth.goHome}</span>
              </button>

              <button
                type="button"
                className="rounded-full bg-[#fef2f2] border border-[#fecdd3] text-[#e11d48] font-semibold text-xs px-4 py-2 hover:bg-[#fee2e2] hover:border-[#fda4af] hover:text-[#be123c] shadow-2xs transition-all active:scale-95 cursor-pointer inline-flex items-center gap-1.5"
                onClick={handleSignOut}
              >
                <LogOut className="w-3.5 h-3.5" />
                <span>{t.auth.signOut}</span>
              </button>
            </div>
          </div>
        </div>
      </main>
    );
  }

  const meta = data?.meta;
  const botOn = data?.settings?.bot_enabled ?? false;
  const metaReady = meta?.ready ?? false;
  const ai = data?.ai;
  const aiReady = ai?.configured ?? false;
  const aiLabel = ai?.label ?? (aiReady ? "Configured" : "Not configured");

  const isSuperadmin = ["lorendamasio@gmail.com", "gmalavaes@gmail.com"].includes(
    email.toLowerCase().trim(),
  );

  return (
    <div className="min-h-screen bg-[#fbf9fe] text-[#1e0a45] font-sans selection:bg-[#fec84d] selection:text-[#1e0a45] relative">
      {/* Ambient background decoration */}
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
            <span className="hidden sm:inline-flex items-center gap-1.5 rounded-full bg-purple-100/80 px-3 py-1 text-xs font-bold text-purple-900 border border-purple-200/70">
              <ShieldCheck className="w-3.5 h-3.5 text-purple-700" /> {t.nav.adminPortal}
            </span>
          </div>

          <div className="flex items-center gap-3">
            <span className="hidden md:inline-flex items-center gap-2 text-xs font-medium text-slate-600 bg-slate-100/80 px-3 py-1 rounded-full">
              {email}
              {isSuperadmin && (
                <span className="rounded-full bg-amber-100 border border-amber-300 px-2 py-0.5 text-[10px] font-black text-amber-900 tracking-wide uppercase">
                  👑 {t.nav.superadmin}
                </span>
              )}
            </span>

            <StatusPill tone={botOn && metaReady && aiReady ? "ok" : botOn ? "warn" : "idle"}>
              {botOn ? (metaReady && aiReady ? t.nav.botLive : t.nav.botIncomplete) : t.nav.botPaused}
            </StatusPill>

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
              className="inline-flex items-center gap-1.5 rounded-full border border-purple-900/15 bg-purple-50/70 px-3.5 py-1.5 text-xs font-semibold text-[#1e0a45] transition-all hover:bg-purple-100 hover:border-purple-900/30"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">{t.nav.viewSite}</span>
            </Link>

            <button
              type="button"
              onClick={() => supabase.auth.signOut()}
              className="rounded-full bg-[#fef2f2] border border-[#fecdd3] text-[#e11d48] font-semibold text-xs px-3.5 py-1.5 hover:bg-[#fee2e2] hover:border-[#fda4af] hover:text-[#be123c] shadow-2xs transition-all active:scale-95 cursor-pointer inline-flex items-center gap-1.5"
            >
              <LogOut className="w-3.5 h-3.5" />
              <span>{t.nav.signOut}</span>
            </button>
          </div>
        </div>
      </header>

      {/* Main Container */}
      <main className="max-w-6xl mx-auto px-6 py-8 space-y-8 relative z-10">
        {/* Bot Enable/Disable Banner */}
        <div className="rounded-3xl border border-purple-100/90 bg-white p-6 shadow-sm flex flex-wrap items-center justify-between gap-6 transition-all hover:shadow-md hover:shadow-purple-950/5">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-2xl bg-purple-50 border border-purple-200/60 flex items-center justify-center shrink-0">
              <img
                src="/images/robot.png"
                alt="Talk'n'Bit Robot"
                className="w-8 h-8 object-contain drop-shadow"
              />
            </div>
            <div>
              <Label htmlFor="bot-toggle" className="text-base font-bold text-[#1e0a45] cursor-pointer">
                {t.banner.title}
              </Label>
              <p className="text-xs text-slate-500 mt-0.5 max-w-xl leading-relaxed">
                {t.banner.desc}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <span className={`text-xs font-semibold ${botOn ? "text-emerald-600" : "text-slate-400"}`}>
              {botOn ? t.banner.active : t.banner.disabled}
            </span>
            <Switch
              id="bot-toggle"
              checked={botOn}
              disabled={isLoading || mutation.isPending}
              onCheckedChange={(checked) => mutation.mutate({ bot_enabled: checked })}
            />
          </div>
        </div>

        {/* Tabs Navigation */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <div className="flex flex-wrap items-center justify-between gap-4">
            <TabsList className="bg-purple-100/70 p-1 rounded-full border border-purple-200/60 gap-1 h-auto">
              <TabsTrigger
                value="overview"
                className="rounded-full px-5 py-2 text-xs font-bold data-[state=active]:bg-[#240b4a] data-[state=active]:text-white data-[state=active]:shadow-sm transition-all text-purple-950/70 hover:text-purple-950 flex items-center gap-1.5"
              >
                <Activity className="w-3.5 h-3.5" /> {t.tabs.overview}
              </TabsTrigger>
              <TabsTrigger
                value="messages"
                className="rounded-full px-5 py-2 text-xs font-bold data-[state=active]:bg-[#240b4a] data-[state=active]:text-white data-[state=active]:shadow-sm transition-all text-purple-950/70 hover:text-purple-950 flex items-center gap-1.5"
              >
                <MessageSquare className="w-3.5 h-3.5" /> {t.tabs.messages}
                <span className="ml-1 px-1.5 py-0.2 rounded-full bg-purple-200/80 text-[10px] font-extrabold text-purple-950">
                  {parsedMessages.length}
                </span>
              </TabsTrigger>
              <TabsTrigger
                value="subscribers"
                className="rounded-full px-5 py-2 text-xs font-bold data-[state=active]:bg-[#240b4a] data-[state=active]:text-white data-[state=active]:shadow-sm transition-all text-purple-950/70 hover:text-purple-950 flex items-center gap-1.5"
              >
                <Users className="w-3.5 h-3.5" /> {t.tabs.subscribers}
                <span className="ml-1 px-1.5 py-0.2 rounded-full bg-purple-200/80 text-[10px] font-extrabold text-purple-950">
                  {data?.subscriberStats?.total ?? 0}
                </span>
              </TabsTrigger>
              <TabsTrigger
                value="settings"
                className="rounded-full px-5 py-2 text-xs font-bold data-[state=active]:bg-[#240b4a] data-[state=active]:text-white data-[state=active]:shadow-sm transition-all text-purple-950/70 hover:text-purple-950 flex items-center gap-1.5"
              >
                <SettingsIcon className="w-3.5 h-3.5" /> {t.tabs.settings}
              </TabsTrigger>
            </TabsList>

            {/* Quick action: Refresh feed */}
            <div className="flex items-center gap-2">
              <span className="inline-flex items-center gap-1 text-[11px] text-slate-400 font-medium">
                <span className="size-1.5 rounded-full bg-emerald-500 animate-pulse" /> {t.tabs.liveMonitor}
              </span>
              <Button
                variant="outline"
                size="sm"
                className="rounded-full border-purple-100 bg-white text-xs h-8 px-3 gap-1.5 text-[#1e0a45] hover:bg-purple-50"
                onClick={() => queryClient.invalidateQueries({ queryKey: ["dashboard"] })}
                disabled={isFetching}
              >
                <RefreshCw className={`w-3 h-3 ${isFetching ? "animate-spin text-purple-700" : ""}`} />
                <span>{isFetching ? t.tabs.refreshing : t.tabs.refresh}</span>
              </Button>
            </div>
          </div>

          {/* Tab 1: Overview */}
          <TabsContent value="overview" className="space-y-6 mt-0">
            {/* Stat Cards */}
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
              <StatCard
                label={t.overview.kpiMessages}
                value={data?.stats.total ?? 0}
                tone="default"
              />
              <StatCard
                label={t.overview.kpiCorrections}
                value={data?.stats.corrected ?? 0}
                tone="amber"
                highlight={t.overview.kpiCorrectionsHighlight}
              />
              <StatCard
                label={t.overview.kpiClean}
                value={data?.stats.noError ?? 0}
                tone="green"
                highlight={t.overview.kpiCleanHighlight}
              />
              <StatCard
                label={t.overview.kpiFailed}
                value={data?.stats.failed ?? 0}
                tone="red"
              />
            </div>

            {/* Recent Messages Quick Preview */}
            <div className="rounded-3xl border border-purple-100/90 bg-white p-6 shadow-sm space-y-4">
              <div className="flex items-center justify-between pb-3 border-b border-purple-50">
                <div className="flex items-center gap-2">
                  <MessageCircle className="w-5 h-5 text-emerald-600" />
                  <h2 className="text-base font-bold text-[#1e0a45]">{t.overview.latestMessages}</h2>
                </div>
                <button
                  type="button"
                  onClick={() => setActiveTab("messages")}
                  className="text-xs font-semibold text-purple-700 hover:text-purple-950 transition-colors flex items-center gap-1 cursor-pointer"
                >
                  {t.overview.openLiveMonitor}
                </button>
              </div>

              <div className="space-y-3">
                {parsedMessages.slice(0, 5).map((msg) => {
                  const s = getStatusInfo(msg.status, selectedLang);
                  return (
                    <div
                      key={msg.id}
                      onClick={() => setActiveTab("messages")}
                      className="cursor-pointer rounded-2xl border border-purple-50 p-4 bg-slate-50/50 hover:bg-purple-50/50 hover:border-purple-200/60 transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs group"
                    >
                      <div className="space-y-1.5 min-w-0 flex-1">
                        <div className="flex items-center gap-2 flex-wrap">
                          <span className="font-mono font-bold text-purple-950 text-xs sm:text-sm">
                            {msg.senderMasked}
                          </span>
                          {msg.isRoom && (
                            <span className="bg-purple-100 text-purple-900 px-2 py-0.5 rounded-full text-[10px] font-bold">
                              Room #{msg.roomCode}
                            </span>
                          )}
                          <StatusPill tone={s.tone}>{s.label}</StatusPill>
                        </div>

                        {/* Student text preview */}
                        <p className="text-slate-800 font-medium truncate">
                          "{msg.studentText || "Sent a greeting"}"
                        </p>

                        {/* Bot action summary */}
                        {(msg.correctedText || msg.botReply || msg.explanation) && (
                          <p className="text-[11px] text-purple-900/80 truncate flex items-center gap-1 font-normal">
                            <span className="text-purple-600 font-semibold">Bot:</span>
                            {msg.correctedText ? (
                              <span>Corrected to "{msg.correctedText}"</span>
                            ) : msg.explanation ? (
                              <span>💡 {msg.explanation}</span>
                            ) : (
                              <span>{msg.botReply}</span>
                            )}
                          </p>
                        )}
                      </div>

                      <div className="flex sm:flex-col items-center sm:items-end justify-between sm:justify-center gap-1 shrink-0">
                        <span className="text-[11px] text-slate-400 font-medium">
                          {new Date(msg.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </span>
                        <span className="text-[10px] text-purple-600 font-semibold opacity-0 group-hover:opacity-100 transition-opacity flex items-center gap-0.5">
                          {t.overview.viewDetails}
                        </span>
                      </div>
                    </div>
                  );
                })}

                {parsedMessages.length === 0 && (
                  <p className="text-center py-6 text-xs text-slate-400">
                    {t.overview.noMessages}
                  </p>
                )}
              </div>
            </div>

            {/* Study Buddy Practice Rooms */}
            <div className="rounded-3xl border border-purple-100/90 bg-white p-6 shadow-sm space-y-4">
              <div className="flex items-center justify-between pb-3 border-b border-purple-50">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-purple-100/70 border border-purple-200/50 flex items-center justify-center text-purple-800">
                    <Users className="w-5 h-5" />
                  </div>
                  <div>
                    <h2 className="text-base font-bold text-[#1e0a45]">
                      {t.overview.studyBuddyTitle}
                    </h2>
                    <p className="text-xs text-slate-500 mt-0.5">
                      {t.overview.studyBuddySubtitle}
                    </p>
                  </div>
                </div>
                <StatusPill tone="ok">{t.overview.studyBuddyActive}</StatusPill>
              </div>

              <div className="grid md:grid-cols-2 gap-4 pt-1">
                <div className="rounded-2xl bg-purple-50/50 border border-purple-100 p-4 space-y-2">
                  <p className="text-xs font-bold text-[#1e0a45]">{t.overview.howConnect}</p>
                  <ul className="space-y-1.5 text-xs text-slate-600">
                    <li className="flex items-center gap-2">
                      <span className="text-purple-600">1.</span>
                      <span>{t.overview.step1} <code className="bg-purple-100 px-1.5 py-0.5 rounded font-mono font-bold text-purple-900">/join 101</code></span>
                    </li>
                    <li className="flex items-center gap-2">
                      <span className="text-purple-600">2.</span>
                      <span>{t.overview.step2} <code className="bg-purple-100 px-1.5 py-0.5 rounded font-mono font-bold text-purple-900">/join 101</code></span>
                    </li>
                    <li className="flex items-center gap-2">
                      <span className="text-purple-600">3.</span>
                      <span>{t.overview.step3}</span>
                    </li>
                    <li className="flex items-center gap-2">
                      <span className="text-purple-600">4.</span>
                      <span>{t.overview.step4} <code className="bg-purple-100 px-1.5 py-0.5 rounded font-mono font-bold text-purple-900">/leave</code></span>
                    </li>
                  </ul>
                </div>

                <div className="rounded-2xl bg-[#fef9eb] border border-amber-200/70 p-4 flex flex-col justify-between">
                  <div>
                    <p className="text-xs font-bold text-amber-950">{t.overview.watcherTitle}</p>
                    <p className="text-xs text-amber-900/80 mt-1 leading-relaxed">
                      {t.overview.watcherDesc}
                    </p>
                  </div>
                  <div className="pt-3 border-t border-amber-200/50 flex items-center justify-between text-xs">
                    <span className="font-semibold text-amber-950">{t.overview.watcherDms}</span>
                    <span className="font-mono font-extrabold text-purple-900 bg-white px-2.5 py-0.5 rounded-full border border-amber-300">
                      {data?.stats.groupCorrections ?? 0}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </TabsContent>

          {/* Tab 2: WhatsApp Messages Monitor */}
          <TabsContent value="messages" className="space-y-6 mt-0">
            {/* Filter & Search Bar */}
            <div className="rounded-3xl border border-purple-100/90 bg-white p-5 shadow-sm space-y-4">
              <div className="flex flex-col sm:flex-row gap-3 items-stretch sm:items-center justify-between">
                {/* Search */}
                <div className="relative flex-1 max-w-md">
                  <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                  <Input
                    type="text"
                    placeholder={t.messages.searchPlaceholder}
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="rounded-full border-slate-200 pl-10 text-xs py-2 bg-slate-50/50 focus:bg-white focus:border-purple-600"
                  />
                  {searchQuery && (
                    <button
                      onClick={() => setSearchQuery("")}
                      className="absolute right-3.5 top-1/2 -translate-y-1/2 text-xs text-slate-400 hover:text-slate-600"
                    >
                      ✕
                    </button>
                  )}
                </div>

                {/* View Mode Toggle */}
                <div className="flex items-center gap-1 bg-purple-50 p-1 rounded-full border border-purple-100 self-start sm:self-auto">
                  <button
                    type="button"
                    onClick={() => setViewMode("feed")}
                    className={`px-3 py-1 text-xs font-semibold rounded-full transition-all flex items-center gap-1.5 cursor-pointer ${
                      viewMode === "feed"
                        ? "bg-white text-[#1e0a45] shadow-xs"
                        : "text-slate-500 hover:text-slate-800"
                    }`}
                  >
                    <Layers className="w-3.5 h-3.5" /> {t.messages.chatFeed}
                  </button>
                  <button
                    type="button"
                    onClick={() => setViewMode("table")}
                    className={`px-3 py-1 text-xs font-semibold rounded-full transition-all flex items-center gap-1.5 cursor-pointer ${
                      viewMode === "table"
                        ? "bg-white text-[#1e0a45] shadow-xs"
                        : "text-slate-500 hover:text-slate-800"
                    }`}
                  >
                    <Filter className="w-3.5 h-3.5" /> {t.messages.table}
                  </button>
                </div>
              </div>

              {/* Status Filter Chips */}
              <div className="flex flex-wrap items-center gap-2 pt-1">
                <FilterChip
                  active={statusFilter === "all"}
                  label={t.messages.filterAll}
                  count={parsedMessages.length}
                  onClick={() => setStatusFilter("all")}
                />
                <FilterChip
                  active={statusFilter === "corrected"}
                  label={t.messages.filterCorrected}
                  count={parsedMessages.filter((m) => m.status.includes("corrected") || m.hasError).length}
                  onClick={() => setStatusFilter("corrected")}
                  badgeColor="amber"
                />
                <FilterChip
                  active={statusFilter === "clean"}
                  label={t.messages.filterClean}
                  count={parsedMessages.filter((m) => m.status === "no_error" || m.status === "relay_ok").length}
                  onClick={() => setStatusFilter("clean")}
                  badgeColor="green"
                />
                <FilterChip
                  active={statusFilter === "rooms"}
                  label={t.messages.filterRooms}
                  count={parsedMessages.filter((m) => m.isRoom || m.status === "room_command").length}
                  onClick={() => setStatusFilter("rooms")}
                  badgeColor="purple"
                />
                <FilterChip
                  active={statusFilter === "failed"}
                  label={t.messages.filterFailed}
                  count={parsedMessages.filter((m) => m.status === "failed" || m.status === "skipped_disabled").length}
                  onClick={() => setStatusFilter("failed")}
                  badgeColor="red"
                />
              </div>
            </div>

            {/* Message Feed View */}
            {viewMode === "feed" && (
              <div className="space-y-4">
                {filteredMessages.map((msg) => {
                  const s = getStatusInfo(msg.status, selectedLang);

                  return (
                    <div
                      key={msg.id}
                      className="rounded-3xl border border-purple-100/90 bg-white p-5 sm:p-6 shadow-xs transition-all hover:shadow-md hover:shadow-purple-950/5 space-y-4"
                    >
                      {/* Message Meta Header */}
                      <div className="flex flex-wrap items-center justify-between gap-3 pb-3 border-b border-purple-50 text-xs">
                        <div className="flex items-center gap-2.5 flex-wrap">
                          <div className="w-7 h-7 rounded-full bg-emerald-100 border border-emerald-200 flex items-center justify-center text-emerald-800 font-bold text-xs">
                            💬
                          </div>
                          <span className="font-mono font-bold text-purple-950 text-sm">
                            {msg.senderMasked}
                          </span>

                          {msg.isRoom && (
                            <span className="inline-flex items-center gap-1 rounded-full bg-purple-100 px-2.5 py-0.5 text-[11px] font-bold text-purple-900 border border-purple-200">
                              <Users className="w-3 h-3" /> {t.messages.room} #{msg.roomCode}
                              {msg.partnerMasked && <span className="text-purple-700 font-normal">→ {msg.partnerMasked}</span>}
                            </span>
                          )}

                          {msg.isGroup && (
                            <span className="rounded-full bg-blue-50 text-blue-800 px-2 py-0.5 text-[11px] font-bold border border-blue-200">
                              {t.messages.group}
                            </span>
                          )}

                          <StatusPill tone={s.tone}>{s.label}</StatusPill>
                        </div>

                        <div className="flex items-center gap-2 text-slate-400 text-[11px]">
                          <span>{new Date(msg.createdAt).toLocaleString()}</span>
                        </div>
                      </div>

                      {/* Content: Conversation flow */}
                      <div className="space-y-3">
                        {/* Student WhatsApp Bubble */}
                        <div className="flex items-start gap-2.5">
                          <span className="text-xs font-bold text-slate-400 mt-1 uppercase tracking-wider shrink-0 w-16">
                            {t.messages.student}
                          </span>
                          <div className="bg-[#e7fed6] border border-[#cbebb2] text-[#0f2c14] rounded-2xl rounded-tl-none px-4 py-2.5 text-xs sm:text-sm font-medium shadow-2xs max-w-2xl leading-relaxed">
                            {msg.studentText || <span className="text-slate-400 italic">{t.messages.noText}</span>}
                          </div>
                        </div>

                        {/* Bot Action / Correction */}
                        {(msg.botReply || msg.correctedText) && (
                          <div className="flex items-start gap-2.5">
                            <span className="text-xs font-bold text-purple-900 mt-1 uppercase tracking-wider shrink-0 w-16 flex items-center gap-1">
                              <img src="/images/robot.png" alt="Bot" className="w-3.5 h-3.5 object-contain" /> {t.messages.bot}
                            </span>
                            <div className="bg-[#fef9eb] border border-amber-200/80 rounded-2xl rounded-tl-none p-3.5 text-xs space-y-2 max-w-2xl shadow-2xs">
                              <p className="font-semibold text-slate-800">
                                {msg.correctedText ? (
                                  <>
                                    {t.messages.youMeant} <span className="text-purple-950 font-bold">"{msg.correctedText}"</span>
                                  </>
                                ) : (
                                  <span className="text-purple-950 font-medium">{msg.botReply}</span>
                                )}
                              </p>

                              {msg.explanation && (
                                <div className="pt-2 border-t border-amber-200/60 text-slate-700 text-[11px] flex items-start gap-1.5">
                                  <span className="text-amber-600 font-bold shrink-0">{t.messages.why}</span>
                                  <span>{msg.explanation}</span>
                                </div>
                              )}
                            </div>
                          </div>
                        )}

                        {/* Clean Message confirmation */}
                        {!msg.hasError && (msg.status === "no_error" || msg.status === "relay_ok") && (
                          <div className="flex items-start gap-2.5">
                            <span className="text-xs font-bold text-slate-400 mt-1 uppercase tracking-wider shrink-0 w-16">
                              Bot:
                            </span>
                            <div className="bg-emerald-50/70 border border-emerald-100 text-emerald-800 rounded-xl px-3.5 py-1.5 text-xs font-medium inline-flex items-center gap-1.5">
                              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                              <span>{t.messages.cleanFeedback}</span>
                            </div>
                          </div>
                        )}

                        {/* Room Command confirmation */}
                        {msg.status === "room_command" && (
                          <div className="flex items-start gap-2.5">
                            <span className="text-xs font-bold text-slate-400 mt-1 uppercase tracking-wider shrink-0 w-16">
                              Action:
                            </span>
                            <div className="bg-purple-50 text-purple-900 border border-purple-100 rounded-xl px-3.5 py-1.5 text-xs font-mono font-semibold inline-flex items-center gap-1.5">
                              <span>{t.messages.roomAction}</span>
                            </div>
                          </div>
                        )}
                      </div>


                    </div>
                  );
                })}

                {filteredMessages.length === 0 && (
                  <div className="rounded-3xl border border-purple-100 bg-white p-12 text-center space-y-3">
                    <div className="w-12 h-12 rounded-full bg-purple-50 flex items-center justify-center mx-auto text-purple-700">
                      <Search className="w-5 h-5" />
                    </div>
                    <h3 className="text-sm font-bold text-[#1e0a45]">{t.messages.noResultsTitle}</h3>
                    <p className="text-xs text-slate-500 max-w-sm mx-auto">
                      {searchQuery
                        ? t.messages.noResultsSearch.replace("{query}", searchQuery)
                        : t.messages.noResultsCategory}
                    </p>
                    {searchQuery && (
                      <Button
                        variant="outline"
                        size="sm"
                        className="rounded-full text-xs"
                        onClick={() => {
                          setSearchQuery("");
                          setStatusFilter("all");
                        }}
                      >
                        {t.messages.resetFilters}
                      </Button>
                    )}
                  </div>
                )}
              </div>
            )}

            {/* Table View */}
            {viewMode === "table" && (
              <div className="rounded-3xl border border-purple-100/90 bg-white overflow-hidden shadow-sm">
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs">
                    <thead className="bg-purple-50/70 text-[#1e0a45] uppercase tracking-wider font-bold border-b border-purple-100/80">
                      <tr>
                        <th className="px-5 py-3.5">{t.messages.timeCol}</th>
                        <th className="px-5 py-3.5">{t.messages.senderCol}</th>
                        <th className="px-5 py-3.5">{t.messages.messageCol}</th>
                        <th className="px-5 py-3.5">{t.messages.replyCol}</th>
                        <th className="px-5 py-3.5">{t.messages.statusCol}</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-purple-50 text-slate-700">
                      {filteredMessages.map((msg) => {
                        const s = getStatusInfo(msg.status, selectedLang);

                        return (
                          <tr key={msg.id} className="hover:bg-purple-50/40 transition-colors">
                            <td className="px-5 py-3.5 whitespace-nowrap text-slate-500 font-medium">
                              {new Date(msg.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                            </td>
                            <td className="px-5 py-3.5 font-mono text-xs whitespace-nowrap">
                              <span className="text-purple-950 font-semibold">{msg.senderMasked}</span>
                              {msg.isRoom && (
                                <span className="ml-1.5 inline-flex items-center rounded-full bg-purple-100 px-1.5 py-0.2 text-[10px] font-bold text-purple-900 border border-purple-200">
                                  #{msg.roomCode}
                                </span>
                              )}
                            </td>
                            <td className="px-5 py-3.5 max-w-xs truncate font-medium text-slate-900" title={msg.studentText}>
                              {msg.studentText || <span className="text-slate-300 italic">—</span>}
                            </td>
                            <td className="px-5 py-3.5 max-w-sm truncate text-purple-950" title={msg.botReply || msg.correctedText || msg.explanation || ""}>
                              {msg.correctedText ? (
                                <span>✏️ "{msg.correctedText}"</span>
                              ) : msg.botReply ? (
                                <span>👉 {msg.botReply}</span>
                              ) : msg.explanation ? (
                                <span>💡 {msg.explanation}</span>
                              ) : (
                                <span className="text-slate-400">—</span>
                              )}
                            </td>
                            <td className="px-5 py-3.5 whitespace-nowrap">
                              <StatusPill tone={s.tone}>{s.label}</StatusPill>
                            </td>
                          </tr>
                        );
                      })}

                      {filteredMessages.length === 0 && (
                        <tr>
                          <td colSpan={5} className="px-6 py-12 text-center text-slate-400">
                            {t.messages.noTableMessages}
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            )}
          </TabsContent>

          {/* Tab 3: Settings */}
          <TabsContent value="settings" className="space-y-6 mt-0">
            {/* System Prompt */}
            <div className="rounded-3xl border border-purple-100/90 bg-white p-6 shadow-sm space-y-4">
              <div className="flex items-center justify-between pb-3 border-b border-purple-50">
                <div>
                  <h2 className="text-base font-bold text-[#1e0a45]">{t.settings.promptTitle}</h2>
                  <p className="text-xs text-slate-500 mt-0.5">
                    {t.settings.promptSubtitle}
                  </p>
                </div>
                <Button
                  className="rounded-full bg-gradient-to-r from-[#240b4a] via-[#35106b] to-[#170535] text-white px-6 text-xs font-semibold shadow-md shadow-purple-950/20 hover:scale-105 transition-all"
                  disabled={mutation.isPending || currentPrompt.trim().length < 20}
                  onClick={() => mutation.mutate({ system_prompt: currentPrompt })}
                >
                  {mutation.isPending ? t.settings.savingPrompt : t.settings.savePrompt}
                </Button>
              </div>

              <Textarea
                className="min-h-[340px] font-mono text-xs rounded-2xl border-purple-100 bg-slate-50/50 p-4 text-[#1e0a45] focus:bg-white focus:border-purple-600 focus:ring-2 focus:ring-purple-600/15 leading-relaxed transition-all"
                value={currentPrompt}
                onChange={(e) => setPrompt(e.target.value)}
              />

              <div className="flex items-center justify-between pt-2">
                <Button
                  variant="ghost"
                  className="text-xs text-purple-900/70 hover:text-purple-950 rounded-full"
                  onClick={() => setPrompt(null)}
                >
                  {t.settings.resetChanges}
                </Button>
                <span className="text-[11px] text-slate-400">{t.settings.validJsonNote}</span>
              </div>
            </div>


          </TabsContent>
          {/* Tab 4: Subscribers & Paywall */}
          <TabsContent value="subscribers" className="space-y-6 mt-0">
            {/* Subscriber KPI Cards */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
              <div className="rounded-3xl border border-purple-100 bg-white p-5 shadow-xs">
                <div className="flex items-center justify-between text-xs text-slate-400 font-medium">
                  <span>{t.subscribers.activeTitle}</span>
                  <span className="p-1.5 rounded-full bg-emerald-100 text-emerald-800">
                    <CheckCircle2 className="w-3.5 h-3.5" />
                  </span>
                </div>
                <div className="mt-2 text-2xl font-extrabold text-[#1e0a45]">
                  {data?.subscriberStats?.active ?? 0}
                </div>
                <div className="mt-1 text-[11px] text-emerald-700 font-semibold">{t.subscribers.activeSub}</div>
              </div>

              <div className="rounded-3xl border border-purple-100 bg-white p-5 shadow-xs">
                <div className="flex items-center justify-between text-xs text-slate-400 font-medium">
                  <span>{t.subscribers.trialsTitle}</span>
                  <span className="p-1.5 rounded-full bg-amber-100 text-amber-800">
                    <Zap className="w-3.5 h-3.5" />
                  </span>
                </div>
                <div className="mt-2 text-2xl font-extrabold text-[#1e0a45]">
                  {data?.subscriberStats?.trial ?? 0}
                </div>
                <div className="mt-1 text-[11px] text-amber-700 font-semibold">{t.subscribers.trialsSub}</div>
              </div>

              <div className="rounded-3xl border border-purple-100 bg-white p-5 shadow-xs">
                <div className="flex items-center justify-between text-xs text-slate-400 font-medium">
                  <span>{t.subscribers.expiredTitle}</span>
                  <span className="p-1.5 rounded-full bg-rose-100 text-rose-800">
                    <AlertCircle className="w-3.5 h-3.5" />
                  </span>
                </div>
                <div className="mt-2 text-2xl font-extrabold text-[#1e0a45]">
                  {data?.subscriberStats?.expired ?? 0}
                </div>
                <div className="mt-1 text-[11px] text-slate-500 font-medium">{t.subscribers.expiredSub}</div>
              </div>

              <div className="rounded-3xl border border-purple-100 bg-white p-5 shadow-xs">
                <div className="flex items-center justify-between text-xs text-slate-400 font-medium">
                  <span>{t.subscribers.totalTitle}</span>
                  <span className="p-1.5 rounded-full bg-purple-100 text-purple-800">
                    <Users className="w-3.5 h-3.5" />
                  </span>
                </div>
                <div className="mt-2 text-2xl font-extrabold text-[#1e0a45]">
                  {data?.subscriberStats?.total ?? 0}
                </div>
                <div className="mt-1 text-[11px] text-purple-700 font-semibold">{t.subscribers.totalSub}</div>
              </div>
            </div>

            {/* Grant / Extend Access Box */}
            <div className="rounded-3xl border border-purple-100 bg-white p-6 shadow-xs space-y-4">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-full bg-purple-100 flex items-center justify-center text-purple-900">
                  <CreditCard className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-[#1e0a45]">{t.subscribers.grantTitle}</h3>
                  <p className="text-xs text-slate-500">{t.subscribers.grantSubtitle}</p>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-4 gap-3">
                <div className="sm:col-span-2">
                  <Label htmlFor="grant-phone" className="text-xs font-semibold text-[#1e0a45]">
                    {t.subscribers.phoneLabel}
                  </Label>
                  <Input
                    id="grant-phone"
                    placeholder={t.subscribers.phonePlaceholder}
                    value={grantPhone}
                    onChange={(e) => setGrantPhone(e.target.value)}
                    className="mt-1 text-xs rounded-xl border-purple-100"
                  />
                </div>
                <div>
                  <Label htmlFor="grant-plan" className="text-xs font-semibold text-[#1e0a45]">
                    {t.subscribers.planLabel}
                  </Label>
                  <select
                    id="grant-plan"
                    value={grantPlan}
                    onChange={(e) => setGrantPlan(e.target.value as any)}
                    className="mt-1 w-full text-xs rounded-xl border border-purple-100 bg-white p-2 text-slate-700 focus:outline-none focus:ring-2 focus:ring-purple-600 cursor-pointer"
                  >
                    <option value="monthly">{t.subscribers.planMonthly}</option>
                    <option value="yearly">{t.subscribers.planYearly}</option>
                    <option value="lifetime">{t.subscribers.planLifetime}</option>
                  </select>
                </div>
                <div className="flex items-end">
                  <Button
                    type="button"
                    disabled={!grantPhone.trim() || grantMutation.isPending}
                    onClick={() => {
                      const days = grantPlan === "yearly" ? 365 : grantPlan === "lifetime" ? 3650 : 30;
                      grantMutation.mutate({ phone: grantPhone, plan: grantPlan, days });
                    }}
                    className="w-full rounded-xl bg-[#240b4a] text-white hover:bg-purple-900 text-xs font-bold h-9 cursor-pointer"
                  >
                    {grantMutation.isPending ? t.subscribers.activatingBtn : t.subscribers.unlockBtn}
                  </Button>
                </div>
              </div>
            </div>

            {/* Filter & Search Bar */}
            <div className="rounded-3xl border border-purple-100 bg-white p-4 shadow-xs flex flex-wrap items-center justify-between gap-3">
              <div className="relative flex-1 min-w-[200px]">
                <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                <Input
                  placeholder={t.subscribers.searchPlaceholder}
                  value={subSearchQuery}
                  onChange={(e) => setSubSearchQuery(e.target.value)}
                  className="pl-9 text-xs rounded-full border-purple-100 bg-purple-50/40"
                />
              </div>

              <div className="flex items-center gap-1.5 overflow-x-auto">
                {(["all", "active", "trial", "expired"] as const).map((filter) => {
                  const filterLabels: Record<string, string> = {
                    all: t.subscribers.filterAll,
                    active: t.subscribers.filterActive,
                    trial: t.subscribers.filterTrial,
                    expired: t.subscribers.filterExpired,
                  };
                  return (
                    <button
                      key={filter}
                      type="button"
                      onClick={() => setSubStatusFilter(filter)}
                      className={`rounded-full px-3 py-1 text-xs font-semibold capitalize transition-all cursor-pointer ${
                        subStatusFilter === filter
                          ? "bg-[#240b4a] text-white"
                          : "bg-purple-50 text-[#1e0a45] hover:bg-purple-100"
                      }`}
                    >
                      {filterLabels[filter] || filter}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Subscribers Table */}
            <div className="rounded-3xl border border-purple-100 bg-white shadow-xs overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead className="bg-purple-50/70 border-b border-purple-100 text-[11px] font-bold text-[#1e0a45] uppercase tracking-wider">
                    <tr>
                      <th className="py-3 px-4">{t.subscribers.colPhone}</th>
                      <th className="py-3 px-4">{t.subscribers.colStatus}</th>
                      <th className="py-3 px-4">{t.subscribers.colPlan}</th>
                      <th className="py-3 px-4">{t.subscribers.colMessages}</th>
                      <th className="py-3 px-4">{t.subscribers.colExpires}</th>
                      <th className="py-3 px-4 text-right">{t.subscribers.colActions}</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-purple-50">
                    {filteredSubscribers.length === 0 ? (
                      <tr>
                        <td colSpan={6} className="py-8 text-center text-slate-400 text-xs">
                          {t.subscribers.noSubscribers}
                        </td>
                      </tr>
                    ) : (
                      filteredSubscribers.map((sub: any) => {
                        const isExpired = sub.status === "expired";
                        const isActive = sub.status === "active" || sub.status === "vip";
                        const isTrial = sub.status === "trial";
                        const expiryDate = sub.subscription_ends_at || sub.trial_ends_at;

                        return (
                          <tr key={sub.id} className="hover:bg-purple-50/40 transition-colors">
                            <td className="py-3.5 px-4 font-mono font-bold text-[#1e0a45]">
                              +{sub.phone_number}
                            </td>
                            <td className="py-3.5 px-4">
                              <span
                                className={`inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-[10px] font-extrabold uppercase ${
                                  isActive
                                    ? "bg-emerald-100 text-emerald-900 border border-emerald-200"
                                    : isTrial
                                      ? "bg-amber-100 text-amber-900 border border-amber-200"
                                      : "bg-rose-100 text-rose-900 border border-rose-200"
                                }`}
                              >
                                {sub.status}
                              </span>
                            </td>
                            <td className="py-3.5 px-4 font-medium text-slate-600 capitalize">
                              {sub.plan.replace("_", " ")}
                            </td>
                            <td className="py-3.5 px-4 text-slate-600">
                              {isTrial ? (
                                <span className="font-semibold text-amber-800">
                                  {sub.messages_count} / 15 msgs
                                </span>
                              ) : (
                                <span className="font-medium text-emerald-800">
                                  {sub.messages_count} ({t.subscribers.unlimitedMsgs})
                                </span>
                              )}
                            </td>
                            <td className="py-3.5 px-4 text-slate-500 font-mono text-[11px]">
                              {expiryDate ? new Date(expiryDate).toLocaleString() : t.subscribers.neverExpires}
                            </td>
                            <td className="py-3.5 px-4 text-right">
                              <div className="flex items-center justify-end gap-1.5">
                                <Button
                                  size="sm"
                                  variant="outline"
                                  disabled={grantMutation.isPending}
                                  onClick={() => {
                                    grantMutation.mutate({ phone: sub.phone_number, plan: "monthly", days: 30 });
                                  }}
                                  className="h-7 text-[11px] rounded-lg border-purple-100 text-purple-900 hover:bg-purple-100 cursor-pointer"
                                >
                                  {t.subscribers.btn30Days}
                                </Button>
                                <Button
                                  size="sm"
                                  variant="outline"
                                  disabled={grantMutation.isPending}
                                  onClick={() => {
                                    grantMutation.mutate({ phone: sub.phone_number, plan: "lifetime", days: 3650 });
                                  }}
                                  className="h-7 text-[11px] rounded-lg border-purple-200 bg-purple-50 text-purple-950 font-bold hover:bg-purple-200 cursor-pointer"
                                >
                                  {t.subscribers.btnVip}
                                </Button>
                                <Button
                                  size="sm"
                                  variant="outline"
                                  title={t.subscribers.resetCountTooltip}
                                  disabled={resetCountMutation.isPending}
                                  onClick={() => {
                                    if (confirm(`Reset message count to 0 for ${sub.phone_number}?`)) {
                                      resetCountMutation.mutate(sub.phone_number);
                                    }
                                  }}
                                  className="h-7 px-2 text-[11px] rounded-lg border-amber-200 text-amber-900 bg-amber-50 hover:bg-amber-100 cursor-pointer"
                                >
                                  <RotateCcw className="w-3 h-3" />
                                </Button>
                                <Button
                                  size="sm"
                                  variant="outline"
                                  title={t.subscribers.removeSubTooltip}
                                  disabled={deleteSubMutation.isPending}
                                  onClick={() => {
                                    if (confirm(`Remove subscriber ${sub.phone_number}?`)) {
                                      deleteSubMutation.mutate(sub.id);
                                    }
                                  }}
                                  className="h-7 px-2 text-[11px] rounded-lg border-rose-200 text-rose-700 bg-rose-50 hover:bg-rose-100 cursor-pointer"
                                >
                                  <Trash2 className="w-3 h-3" />
                                </Button>
                              </div>
                            </td>
                          </tr>
                        );
                      })
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </TabsContent>
        </Tabs>
      </main>
    </div>
  );
}

function StatCard({
  label,
  value,
  tone = "default",
  highlight,
}: {
  label: string;
  value: number;
  tone?: "default" | "amber" | "green" | "red";
  highlight?: string;
}) {
  const styles = {
    default: "bg-white border-purple-100/90 text-[#1e0a45]",
    amber: "bg-[#fef9eb] border-amber-200/80 text-[#1e0a45]",
    green: "bg-white border-emerald-100/90 text-[#1e0a45]",
    red: "bg-white border-rose-100/90 text-[#1e0a45]",
  };

  return (
    <div className={`rounded-3xl border p-5 shadow-xs transition-transform hover:-translate-y-0.5 ${styles[tone]}`}>
      <div className="flex items-center justify-between">
        <p className="text-[11px] font-bold uppercase tracking-wider text-slate-500">{label}</p>
        {highlight && (
          <span className="text-[10px] font-bold text-amber-800 bg-amber-100/80 px-2 py-0.5 rounded-full">
            {highlight}
          </span>
        )}
      </div>
      <p className={`mt-3 text-3xl font-extrabold tracking-tight ${tone === "red" && value > 0 ? "text-rose-600" : "text-[#1e0a45]"}`}>
        {value}
      </p>
    </div>
  );
}

function FilterChip({
  label,
  count,
  active,
  onClick,
  badgeColor = "slate",
}: {
  label: string;
  count: number;
  active: boolean;
  onClick: () => void;
  badgeColor?: "slate" | "amber" | "green" | "purple" | "red";
}) {
  const badgeColors = {
    slate: "bg-slate-200/80 text-slate-800",
    amber: "bg-amber-200/90 text-amber-950",
    green: "bg-emerald-200/90 text-emerald-950",
    purple: "bg-purple-200/90 text-purple-950",
    red: "bg-rose-200/90 text-rose-950",
  };

  return (
    <button
      type="button"
      onClick={onClick}
      className={`rounded-full px-3.5 py-1.5 text-xs font-semibold transition-all inline-flex items-center gap-1.5 border ${
        active
          ? "bg-[#240b4a] text-white border-[#240b4a] shadow-xs"
          : "bg-white text-slate-600 border-purple-100/80 hover:bg-purple-50/50"
      }`}
    >
      <span>{label}</span>
      <span className={`px-1.5 py-0.2 rounded-full text-[10px] font-extrabold ${active ? "bg-white/20 text-white" : badgeColors[badgeColor]}`}>
        {count}
      </span>
    </button>
  );
}
