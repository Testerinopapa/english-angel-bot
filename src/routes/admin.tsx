import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { createFileRoute, Link } from "@tanstack/react-router";
import { useServerFn } from "@tanstack/react-start";
import { useEffect, useState, useMemo } from "react";
import { toast } from "sonner";
import {
  ArrowLeft,
  ShieldCheck,
  CheckCircle2,
  AlertCircle,
  Copy,
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
  Code,
  Filter,
  Layers,
  ChevronDown,
  ChevronUp,
  CreditCard,
  Calendar,
  Zap,
  RotateCcw,
  Trash2,
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
} from "@/lib/admin.functions";
import type { SettingsUpdate } from "@/lib/admin-schema";
import { webhookUrl } from "@/lib/webhook-url";

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
  corrected: { label: "Correction sent", tone: "ok" },
  corrected_group_dm: { label: "Group Private DM", tone: "ok" },
  relay_corrected: { label: "Relayed + Private DM", tone: "ok" },
  relay_ok: { label: "Relayed (Clean)", tone: "idle" },
  room_command: { label: "Room command", tone: "idle" },
  explanation_sent: { label: "Explanation sent", tone: "ok" },
  no_error: { label: "No mistake", tone: "idle" },
  skipped_disabled: { label: "Bot off", tone: "warn" },
  failed: { label: "Failed", tone: "bad" },
  received: { label: "Received", tone: "idle" },
};

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

  if (row.status === "explanation_sent") {
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
  return <Dashboard email={session.email ?? ""} />;
}

function Dashboard({ email }: { email: string }) {
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

  const [copiedWebhook, setCopiedWebhook] = useState(false);
  const [activeTab, setActiveTab] = useState("overview");

  // Message filter states
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<"all" | "corrected" | "clean" | "rooms" | "failed">("all");
  const [viewMode, setViewMode] = useState<"feed" | "table">("feed");
  const [expandedDetails, setExpandedDetails] = useState<Record<string, boolean>>({});

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

  const copyWebhook = () => {
    navigator.clipboard.writeText(webhookUrl());
    setCopiedWebhook(true);
    toast.success("Webhook URL copied to clipboard");
    setTimeout(() => setCopiedWebhook(false), 2000);
  };

  const toggleDetails = (id: string) => {
    setExpandedDetails((prev) => ({ ...prev, [id]: !prev[id] }));
  };

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

  if (error) {
    return (
      <main className="min-h-screen bg-gradient-to-b from-[#fbf9fe] to-purple-50/50 flex items-center justify-center p-4 text-center">
        <div className="w-full max-w-md rounded-3xl border border-purple-100 bg-white p-8 shadow-xl shadow-purple-950/5">
          <div className="mx-auto w-12 h-12 rounded-full bg-rose-50 border border-rose-200 flex items-center justify-center text-rose-600 mb-4">
            <AlertCircle className="w-6 h-6" />
          </div>
          <h1 className="text-xl font-bold text-[#1e0a45]">No admin access</h1>
          <p className="mt-2 text-xs text-slate-600 leading-relaxed">
            Account {email ? <span className="font-semibold text-purple-950">({email})</span> : ""} is not registered as an administrator in Talk'n'Bit.
          </p>
          <div className="mt-6 flex items-center justify-center gap-3">
            <Button
              variant="outline"
              className="rounded-full border-slate-200 text-xs px-5 hover:bg-rose-50 hover:text-rose-700"
              onClick={() => supabase.auth.signOut()}
            >
              Sign out
            </Button>
            <Link
              to="/"
              className="inline-flex items-center justify-center rounded-full bg-gradient-to-r from-[#240b4a] to-[#170535] px-5 py-2 text-xs font-semibold text-white shadow-sm hover:scale-105 transition-all"
            >
              Go to Home
            </Link>
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
              <ShieldCheck className="w-3.5 h-3.5 text-purple-700" /> Admin Portal
            </span>
          </div>

          <div className="flex items-center gap-3">
            <span className="hidden md:inline-flex items-center gap-2 text-xs font-medium text-slate-600 bg-slate-100/80 px-3 py-1 rounded-full">
              {email}
              {isSuperadmin && (
                <span className="rounded-full bg-amber-100 border border-amber-300 px-2 py-0.5 text-[10px] font-black text-amber-900 tracking-wide uppercase">
                  👑 Superadmin
                </span>
              )}
            </span>

            <StatusPill tone={botOn && metaReady && aiReady ? "ok" : botOn ? "warn" : "idle"}>
              {botOn ? (metaReady && aiReady ? "Live" : "On, incomplete setup") : "Paused"}
            </StatusPill>

            <Link
              to="/"
              className="inline-flex items-center gap-1.5 rounded-full border border-purple-900/15 bg-purple-50/70 px-3.5 py-1.5 text-xs font-semibold text-[#1e0a45] transition-all hover:bg-purple-100 hover:border-purple-900/30"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">View Site</span>
            </Link>

            <Button
              variant="outline"
              size="sm"
              className="rounded-full border-slate-200 text-xs px-3.5 py-1.5 hover:bg-rose-50 hover:text-rose-700 hover:border-rose-200 transition-colors"
              onClick={() => supabase.auth.signOut()}
            >
              Sign out
            </Button>
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
                Process Incoming Messages
              </Label>
              <p className="text-xs text-slate-500 mt-0.5 max-w-xl leading-relaxed">
                When enabled, Talk'n'Bit checks student grammar and sends real-time WhatsApp corrections. When paused, messages are logged without replies.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <span className={`text-xs font-semibold ${botOn ? "text-emerald-600" : "text-slate-400"}`}>
              {botOn ? "Active" : "Disabled"}
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
                <Activity className="w-3.5 h-3.5" /> Overview
              </TabsTrigger>
              <TabsTrigger
                value="messages"
                className="rounded-full px-5 py-2 text-xs font-bold data-[state=active]:bg-[#240b4a] data-[state=active]:text-white data-[state=active]:shadow-sm transition-all text-purple-950/70 hover:text-purple-950 flex items-center gap-1.5"
              >
                <MessageSquare className="w-3.5 h-3.5" /> WhatsApp Messages
                <span className="ml-1 px-1.5 py-0.2 rounded-full bg-purple-200/80 text-[10px] font-extrabold text-purple-950">
                  {parsedMessages.length}
                </span>
              </TabsTrigger>
              <TabsTrigger
                value="subscribers"
                className="rounded-full px-5 py-2 text-xs font-bold data-[state=active]:bg-[#240b4a] data-[state=active]:text-white data-[state=active]:shadow-sm transition-all text-purple-950/70 hover:text-purple-950 flex items-center gap-1.5"
              >
                <Users className="w-3.5 h-3.5" /> Subscribers & Paywall
                <span className="ml-1 px-1.5 py-0.2 rounded-full bg-purple-200/80 text-[10px] font-extrabold text-purple-950">
                  {data?.subscriberStats?.total ?? 0}
                </span>
              </TabsTrigger>
              <TabsTrigger
                value="settings"
                className="rounded-full px-5 py-2 text-xs font-bold data-[state=active]:bg-[#240b4a] data-[state=active]:text-white data-[state=active]:shadow-sm transition-all text-purple-950/70 hover:text-purple-950 flex items-center gap-1.5"
              >
                <SettingsIcon className="w-3.5 h-3.5" /> Settings
              </TabsTrigger>
            </TabsList>

            {/* Quick action: Refresh feed */}
            <div className="flex items-center gap-2">
              <span className="inline-flex items-center gap-1 text-[11px] text-slate-400 font-medium">
                <span className="size-1.5 rounded-full bg-emerald-500 animate-pulse" /> Live monitor
              </span>
              <Button
                variant="outline"
                size="sm"
                className="rounded-full border-purple-100 bg-white text-xs h-8 px-3 gap-1.5 text-[#1e0a45] hover:bg-purple-50"
                onClick={() => queryClient.invalidateQueries({ queryKey: ["dashboard"] })}
                disabled={isFetching}
              >
                <RefreshCw className={`w-3 h-3 ${isFetching ? "animate-spin text-purple-700" : ""}`} />
                <span>{isFetching ? "Refreshing..." : "Refresh"}</span>
              </Button>
            </div>
          </div>

          {/* Tab 1: Overview */}
          <TabsContent value="overview" className="space-y-6 mt-0">
            {/* Stat Cards */}
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
              <StatCard
                label="Messages Received"
                value={data?.stats.total ?? 0}
                tone="default"
              />
              <StatCard
                label="Corrections Sent"
                value={data?.stats.corrected ?? 0}
                tone="amber"
                highlight="Warm feedback"
              />
              <StatCard
                label="Clean Messages"
                value={data?.stats.noError ?? 0}
                tone="green"
                highlight="No errors"
              />
              <StatCard
                label="Failed Invocations"
                value={data?.stats.failed ?? 0}
                tone="red"
              />
            </div>

            {/* Recent Messages Quick Preview */}
            <div className="rounded-3xl border border-purple-100/90 bg-white p-6 shadow-sm space-y-4">
              <div className="flex items-center justify-between pb-3 border-b border-purple-50">
                <div className="flex items-center gap-2">
                  <MessageCircle className="w-5 h-5 text-emerald-600" />
                  <h2 className="text-base font-bold text-[#1e0a45]">Latest WhatsApp Messages</h2>
                </div>
                <button
                  type="button"
                  onClick={() => setActiveTab("messages")}
                  className="text-xs font-semibold text-purple-700 hover:text-purple-950 transition-colors flex items-center gap-1"
                >
                  Open Live Monitor →
                </button>
              </div>

              <div className="space-y-3">
                {parsedMessages.slice(0, 4).map((msg) => (
                  <div
                    key={msg.id}
                    onClick={() => setActiveTab("messages")}
                    className="cursor-pointer rounded-2xl border border-purple-50 p-3.5 bg-slate-50/40 hover:bg-purple-50/40 transition-colors flex flex-wrap items-center justify-between gap-3 text-xs"
                  >
                    <div className="space-y-1 max-w-xl">
                      <div className="flex items-center gap-2">
                        <span className="font-mono font-semibold text-purple-950">{msg.senderMasked}</span>
                        {msg.isRoom && (
                          <span className="bg-purple-100 text-purple-900 px-2 py-0.5 rounded-full text-[10px] font-bold">
                            Room #{msg.roomCode}
                          </span>
                        )}
                        <StatusPill tone={(statusLabels[msg.status]?.tone as any) ?? "idle"}>
                          {statusLabels[msg.status]?.label ?? msg.status}
                        </StatusPill>
                      </div>
                      <p className="text-slate-800 font-medium truncate">
                        "{msg.studentText || "No text payload"}"
                      </p>
                    </div>
                    <span className="text-[11px] text-slate-400">
                      {new Date(msg.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </span>
                  </div>
                ))}

                {parsedMessages.length === 0 && (
                  <p className="text-center py-6 text-xs text-slate-400">
                    No messages received yet. Send a WhatsApp message to test!
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
                      Study Buddy Practice Rooms (Secret-Watcher Mode)
                    </h2>
                    <p className="text-xs text-slate-500 mt-0.5">
                      Two students chat directly via Talk'n'Bit while AI quietly observes and whispers corrections.
                    </p>
                  </div>
                </div>
                <StatusPill tone="ok">Active</StatusPill>
              </div>

              <div className="grid md:grid-cols-2 gap-4 pt-1">
                <div className="rounded-2xl bg-purple-50/50 border border-purple-100 p-4 space-y-2">
                  <p className="text-xs font-bold text-[#1e0a45]">How Students Connect:</p>
                  <ul className="space-y-1.5 text-xs text-slate-600">
                    <li className="flex items-center gap-2">
                      <span className="text-purple-600">1.</span>
                      <span>Student A texts <code className="bg-purple-100 px-1.5 py-0.5 rounded font-mono font-bold text-purple-900">/join 101</code></span>
                    </li>
                    <li className="flex items-center gap-2">
                      <span className="text-purple-600">2.</span>
                      <span>Student B texts <code className="bg-purple-100 px-1.5 py-0.5 rounded font-mono font-bold text-purple-900">/join 101</code></span>
                    </li>
                    <li className="flex items-center gap-2">
                      <span className="text-purple-600">3.</span>
                      <span>Both are instantly paired and messages relay in real-time</span>
                    </li>
                    <li className="flex items-center gap-2">
                      <span className="text-purple-600">4.</span>
                      <span>Either partner texts <code className="bg-purple-100 px-1.5 py-0.5 rounded font-mono font-bold text-purple-900">/leave</code> to disconnect</span>
                    </li>
                  </ul>
                </div>

                <div className="rounded-2xl bg-[#fef9eb] border border-amber-200/70 p-4 flex flex-col justify-between">
                  <div>
                    <p className="text-xs font-bold text-amber-950">Secret-Watcher Intelligence</p>
                    <p className="text-xs text-amber-900/80 mt-1 leading-relaxed">
                      Neither student sees their partner get corrected in public. Corrections arrive as private whispers with <strong>Why? 💡</strong> explanations directly from the bot.
                    </p>
                  </div>
                  <div className="pt-3 border-t border-amber-200/50 flex items-center justify-between text-xs">
                    <span className="font-semibold text-amber-950">Room Private DMs Delivered:</span>
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
                    placeholder="Search WhatsApp messages, numbers, corrections..."
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
                    className={`px-3 py-1 text-xs font-semibold rounded-full transition-all flex items-center gap-1.5 ${
                      viewMode === "feed"
                        ? "bg-white text-[#1e0a45] shadow-xs"
                        : "text-slate-500 hover:text-slate-800"
                    }`}
                  >
                    <Layers className="w-3.5 h-3.5" /> Chat Feed
                  </button>
                  <button
                    type="button"
                    onClick={() => setViewMode("table")}
                    className={`px-3 py-1 text-xs font-semibold rounded-full transition-all flex items-center gap-1.5 ${
                      viewMode === "table"
                        ? "bg-white text-[#1e0a45] shadow-xs"
                        : "text-slate-500 hover:text-slate-800"
                    }`}
                  >
                    <Filter className="w-3.5 h-3.5" /> Table
                  </button>
                </div>
              </div>

              {/* Status Filter Chips */}
              <div className="flex flex-wrap items-center gap-2 pt-1">
                <FilterChip
                  active={statusFilter === "all"}
                  label="All Messages"
                  count={parsedMessages.length}
                  onClick={() => setStatusFilter("all")}
                />
                <FilterChip
                  active={statusFilter === "corrected"}
                  label="Mistakes Corrected"
                  count={parsedMessages.filter((m) => m.status.includes("corrected") || m.hasError).length}
                  onClick={() => setStatusFilter("corrected")}
                  badgeColor="amber"
                />
                <FilterChip
                  active={statusFilter === "clean"}
                  label="Natural / No Mistake"
                  count={parsedMessages.filter((m) => m.status === "no_error" || m.status === "relay_ok").length}
                  onClick={() => setStatusFilter("clean")}
                  badgeColor="green"
                />
                <FilterChip
                  active={statusFilter === "rooms"}
                  label="Study Buddy Rooms"
                  count={parsedMessages.filter((m) => m.isRoom || m.status === "room_command").length}
                  onClick={() => setStatusFilter("rooms")}
                  badgeColor="purple"
                />
                <FilterChip
                  active={statusFilter === "failed"}
                  label="Issues / Failed"
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
                  const s = statusLabels[msg.status] ?? { label: msg.status, tone: "idle" as const };
                  const isExpanded = expandedDetails[msg.id] ?? false;

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
                              <Users className="w-3 h-3" /> Room #{msg.roomCode}
                              {msg.partnerMasked && <span className="text-purple-700 font-normal">→ {msg.partnerMasked}</span>}
                            </span>
                          )}

                          {msg.isGroup && (
                            <span className="rounded-full bg-blue-50 text-blue-800 px-2 py-0.5 text-[11px] font-bold border border-blue-200">
                              WhatsApp Group
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
                            Student:
                          </span>
                          <div className="bg-[#e7fed6] border border-[#cbebb2] text-[#0f2c14] rounded-2xl rounded-tl-none px-4 py-2.5 text-xs sm:text-sm font-medium shadow-2xs max-w-2xl leading-relaxed">
                            {msg.studentText || <span className="text-slate-400 italic">No message text recorded</span>}
                          </div>
                        </div>

                        {/* Bot Action / Correction */}
                        {(msg.botReply || msg.correctedText) && (
                          <div className="flex items-start gap-2.5">
                            <span className="text-xs font-bold text-purple-900 mt-1 uppercase tracking-wider shrink-0 w-16 flex items-center gap-1">
                              <img src="/images/robot.png" alt="Bot" className="w-3.5 h-3.5 object-contain" /> Bot:
                            </span>
                            <div className="bg-[#fef9eb] border border-amber-200/80 rounded-2xl rounded-tl-none p-3.5 text-xs space-y-2 max-w-2xl shadow-2xs">
                              <p className="font-semibold text-slate-800">
                                You meant: <span className="text-purple-950 font-bold">"{msg.botReply || msg.correctedText}"</span>
                              </p>

                              {msg.explanation && (
                                <div className="pt-2 border-t border-amber-200/60 text-slate-700 text-[11px] flex items-start gap-1.5">
                                  <span className="text-amber-600 font-bold shrink-0">💡 Why?</span>
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
                              <span>Natural English detected — no correction needed.</span>
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
                              <span>Executed Study Buddy command</span>
                            </div>
                          </div>
                        )}
                      </div>

                      {/* Expandable Technical Detail */}
                      <div className="pt-2 border-t border-purple-50/80 flex items-center justify-between text-[11px]">
                        <button
                          type="button"
                          onClick={() => toggleDetails(msg.id)}
                          className="text-purple-700 hover:text-purple-950 font-semibold inline-flex items-center gap-1 transition-colors"
                        >
                          <Code className="w-3.5 h-3.5" />
                          <span>{isExpanded ? "Hide Technical Details" : "Inspect Raw Payload"}</span>
                          {isExpanded ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />}
                        </button>

                        <span className="font-mono text-slate-400 text-[10px]">
                          ID: {msg.waMessageId.slice(-12)}
                        </span>
                      </div>

                      {/* Raw Payload Section */}
                      {isExpanded && (
                        <div className="rounded-2xl bg-slate-900 text-slate-200 p-4 font-mono text-[11px] space-y-2 animate-in fade-in-50">
                          <div className="flex items-center justify-between text-slate-400 border-b border-slate-800 pb-1.5">
                            <span>WhatsApp Message ID: {msg.waMessageId}</span>
                            <span>UUID: {msg.id}</span>
                          </div>
                          {msg.rawDetail ? (
                            <pre className="overflow-x-auto text-[10px] text-emerald-400 max-h-48 leading-relaxed">
                              {(() => {
                                try {
                                  return JSON.stringify(JSON.parse(msg.rawDetail), null, 2);
                                } catch {
                                  return msg.rawDetail;
                                }
                              })()}
                            </pre>
                          ) : (
                            <p className="text-slate-500 italic">No error details logged</p>
                          )}
                        </div>
                      )}
                    </div>
                  );
                })}

                {filteredMessages.length === 0 && (
                  <div className="rounded-3xl border border-purple-100 bg-white p-12 text-center space-y-3">
                    <div className="w-12 h-12 rounded-full bg-purple-50 flex items-center justify-center mx-auto text-purple-700">
                      <Search className="w-5 h-5" />
                    </div>
                    <h3 className="text-sm font-bold text-[#1e0a45]">No messages found</h3>
                    <p className="text-xs text-slate-500 max-w-sm mx-auto">
                      {searchQuery
                        ? `No messages matched your search "${searchQuery}". Try clearing filters.`
                        : "No messages in this category yet. Send a test WhatsApp message to see it appear live!"}
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
                        Reset Filters
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
                        <th className="px-5 py-3.5">Time</th>
                        <th className="px-5 py-3.5">Sender</th>
                        <th className="px-5 py-3.5">WhatsApp Message</th>
                        <th className="px-5 py-3.5">Bot Correction & Reply</th>
                        <th className="px-5 py-3.5">Status</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-purple-50 text-slate-700">
                      {filteredMessages.map((msg) => {
                        const s = statusLabels[msg.status] ?? { label: msg.status, tone: "idle" as const };

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
                            <td className="px-5 py-3.5 max-w-sm truncate text-purple-950" title={msg.botReply || msg.explanation || ""}>
                              {msg.botReply ? (
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
                            No messages match your criteria.
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
                  <h2 className="text-base font-bold text-[#1e0a45]">Correction Instructions (System Prompt)</h2>
                  <p className="text-xs text-slate-500 mt-0.5">
                    Defines how Talk'n'Bit analyzes grammar, context, and crafts friendly corrections and explanations.
                  </p>
                </div>
                <Button
                  className="rounded-full bg-gradient-to-r from-[#240b4a] via-[#35106b] to-[#170535] text-white px-6 text-xs font-semibold shadow-md shadow-purple-950/20 hover:scale-105 transition-all"
                  disabled={mutation.isPending || currentPrompt.trim().length < 20}
                  onClick={() => mutation.mutate({ system_prompt: currentPrompt })}
                >
                  Save Prompt
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
                  Reset Changes
                </Button>
                <span className="text-[11px] text-slate-400">Must return valid JSON schema for bot parsing</span>
              </div>
            </div>

            {/* Store Message Content Toggle */}
            <div className="rounded-3xl border border-purple-100/90 bg-white p-6 shadow-sm flex flex-wrap items-center justify-between gap-4">
              <div>
                <Label htmlFor="store-toggle" className="text-sm font-bold text-[#1e0a45] cursor-pointer">
                  Store Message Text For Debugging
                </Label>
                <p className="text-xs text-slate-500 mt-0.5">
                  Allows storing message body for admin auditing and live monitoring.
                </p>
              </div>
              <Switch
                id="store-toggle"
                checked={data?.settings?.store_message_content ?? false}
                disabled={isLoading || mutation.isPending}
                onCheckedChange={(checked) => mutation.mutate({ store_message_content: checked })}
              />
            </div>

            {/* WhatsApp Webhook Callback URL */}
            <div className="rounded-3xl border border-purple-100/90 bg-white p-6 shadow-sm space-y-4">
              <div className="flex items-center justify-between pb-3 border-b border-purple-50">
                <div>
                  <h3 className="text-base font-bold text-[#1e0a45]">WhatsApp Webhook Configuration</h3>
                  <p className="text-xs text-slate-500 mt-0.5">
                    Configure this callback URL in your Meta for Developers App Dashboard (WhatsApp &gt; Configuration)
                  </p>
                </div>
                <button
                  type="button"
                  onClick={copyWebhook}
                  className="inline-flex items-center gap-1.5 rounded-full border border-purple-200 bg-purple-50 px-3.5 py-1.5 text-xs font-semibold text-purple-950 hover:bg-purple-100 transition-colors"
                >
                  {copiedWebhook ? (
                    <>
                      <Check className="w-3.5 h-3.5 text-emerald-600" /> Copied!
                    </>
                  ) : (
                    <>
                      <Copy className="w-3.5 h-3.5 text-purple-700" /> Copy URL
                    </>
                  )}
                </button>
              </div>

              <div className="space-y-1.5">
                <Label className="text-xs font-semibold text-slate-600">Callback URL</Label>
                <code className="block text-xs font-mono break-all text-purple-950 bg-purple-50/50 p-3 rounded-xl border border-purple-100/70">
                  {webhookUrl()}
                </code>
              </div>
            </div>
          </TabsContent>
          {/* Tab 4: Subscribers & Paywall */}
          <TabsContent value="subscribers" className="space-y-6 mt-0">
            {/* Subscriber KPI Cards */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
              <div className="rounded-3xl border border-purple-100 bg-white p-5 shadow-xs">
                <div className="flex items-center justify-between text-xs text-slate-400 font-medium">
                  <span>Active Subscribers</span>
                  <span className="p-1.5 rounded-full bg-emerald-100 text-emerald-800">
                    <CheckCircle2 className="w-3.5 h-3.5" />
                  </span>
                </div>
                <div className="mt-2 text-2xl font-extrabold text-[#1e0a45]">
                  {data?.subscriberStats?.active ?? 0}
                </div>
                <div className="mt-1 text-[11px] text-emerald-700 font-semibold">Paying & VIP Members</div>
              </div>

              <div className="rounded-3xl border border-purple-100 bg-white p-5 shadow-xs">
                <div className="flex items-center justify-between text-xs text-slate-400 font-medium">
                  <span>Free Trials</span>
                  <span className="p-1.5 rounded-full bg-amber-100 text-amber-800">
                    <Zap className="w-3.5 h-3.5" />
                  </span>
                </div>
                <div className="mt-2 text-2xl font-extrabold text-[#1e0a45]">
                  {data?.subscriberStats?.trial ?? 0}
                </div>
                <div className="mt-1 text-[11px] text-amber-700 font-semibold">24h / 15-msg trials</div>
              </div>

              <div className="rounded-3xl border border-purple-100 bg-white p-5 shadow-xs">
                <div className="flex items-center justify-between text-xs text-slate-400 font-medium">
                  <span>Paywalled / Expired</span>
                  <span className="p-1.5 rounded-full bg-rose-100 text-rose-800">
                    <AlertCircle className="w-3.5 h-3.5" />
                  </span>
                </div>
                <div className="mt-2 text-2xl font-extrabold text-[#1e0a45]">
                  {data?.subscriberStats?.expired ?? 0}
                </div>
                <div className="mt-1 text-[11px] text-slate-500 font-medium">Shown paywall card</div>
              </div>

              <div className="rounded-3xl border border-purple-100 bg-white p-5 shadow-xs">
                <div className="flex items-center justify-between text-xs text-slate-400 font-medium">
                  <span>Total Users Seen</span>
                  <span className="p-1.5 rounded-full bg-purple-100 text-purple-800">
                    <Users className="w-3.5 h-3.5" />
                  </span>
                </div>
                <div className="mt-2 text-2xl font-extrabold text-[#1e0a45]">
                  {data?.subscriberStats?.total ?? 0}
                </div>
                <div className="mt-1 text-[11px] text-purple-700 font-semibold">Tracked numbers</div>
              </div>
            </div>

            {/* Grant / Extend Access Box */}
            <div className="rounded-3xl border border-purple-100 bg-white p-6 shadow-xs space-y-4">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-full bg-purple-100 flex items-center justify-center text-purple-900">
                  <CreditCard className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-[#1e0a45]">Manual Access Grant & Number Activation</h3>
                  <p className="text-xs text-slate-500">Instantly activate or extend access for a WhatsApp phone number</p>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-4 gap-3">
                <div className="sm:col-span-2">
                  <Label htmlFor="grant-phone" className="text-xs font-semibold text-[#1e0a45]">
                    WhatsApp Number (with country code)
                  </Label>
                  <Input
                    id="grant-phone"
                    placeholder="e.g. 5513991878104"
                    value={grantPhone}
                    onChange={(e) => setGrantPhone(e.target.value)}
                    className="mt-1 text-xs rounded-xl border-purple-100"
                  />
                </div>
                <div>
                  <Label htmlFor="grant-plan" className="text-xs font-semibold text-[#1e0a45]">
                    Plan Type
                  </Label>
                  <select
                    id="grant-plan"
                    value={grantPlan}
                    onChange={(e) => setGrantPlan(e.target.value as any)}
                    className="mt-1 w-full text-xs rounded-xl border border-purple-100 bg-white p-2 text-slate-700 focus:outline-none focus:ring-2 focus:ring-purple-600"
                  >
                    <option value="monthly">Monthly Plan (30 days)</option>
                    <option value="yearly">Yearly Plan (365 days)</option>
                    <option value="lifetime">Lifetime VIP (Unlimited)</option>
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
                    className="w-full rounded-xl bg-[#240b4a] text-white hover:bg-purple-900 text-xs font-bold h-9"
                  >
                    {grantMutation.isPending ? "Activating..." : "Unlock Number 🚀"}
                  </Button>
                </div>
              </div>
            </div>

            {/* Filter & Search Bar */}
            <div className="rounded-3xl border border-purple-100 bg-white p-4 shadow-xs flex flex-wrap items-center justify-between gap-3">
              <div className="relative flex-1 min-w-[200px]">
                <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                <Input
                  placeholder="Search subscriber by phone digits or plan..."
                  value={subSearchQuery}
                  onChange={(e) => setSubSearchQuery(e.target.value)}
                  className="pl-9 text-xs rounded-full border-purple-100 bg-purple-50/40"
                />
              </div>

              <div className="flex items-center gap-1.5 overflow-x-auto">
                {(["all", "active", "trial", "expired"] as const).map((filter) => (
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
                    {filter}
                  </button>
                ))}
              </div>
            </div>

            {/* Subscribers Table */}
            <div className="rounded-3xl border border-purple-100 bg-white shadow-xs overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead className="bg-purple-50/70 border-b border-purple-100 text-[11px] font-bold text-[#1e0a45] uppercase tracking-wider">
                    <tr>
                      <th className="py-3 px-4">Phone Number</th>
                      <th className="py-3 px-4">Status</th>
                      <th className="py-3 px-4">Plan</th>
                      <th className="py-3 px-4">Messages Count</th>
                      <th className="py-3 px-4">Access Expires</th>
                      <th className="py-3 px-4 text-right">Quick Action</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-purple-50">
                    {filteredSubscribers.length === 0 ? (
                      <tr>
                        <td colSpan={6} className="py-8 text-center text-slate-400 text-xs">
                          No subscribers match your search filter.
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
                                  {sub.messages_count} (Unlimited)
                                </span>
                              )}
                            </td>
                            <td className="py-3.5 px-4 text-slate-500 font-mono text-[11px]">
                              {expiryDate ? new Date(expiryDate).toLocaleString() : "Never"}
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
                                  className="h-7 text-[11px] rounded-lg border-purple-100 text-purple-900 hover:bg-purple-100"
                                >
                                  +30 Days
                                </Button>
                                <Button
                                  size="sm"
                                  variant="outline"
                                  disabled={grantMutation.isPending}
                                  onClick={() => {
                                    grantMutation.mutate({ phone: sub.phone_number, plan: "lifetime", days: 3650 });
                                  }}
                                  className="h-7 text-[11px] rounded-lg border-purple-200 bg-purple-50 text-purple-950 font-bold hover:bg-purple-200"
                                >
                                  VIP
                                </Button>
                                <Button
                                  size="sm"
                                  variant="outline"
                                  title="Reset Message Count to 0"
                                  disabled={resetCountMutation.isPending}
                                  onClick={() => {
                                    if (confirm(`Reset message count to 0 for ${sub.phone_number}?`)) {
                                      resetCountMutation.mutate(sub.phone_number);
                                    }
                                  }}
                                  className="h-7 px-2 text-[11px] rounded-lg border-amber-200 text-amber-900 bg-amber-50 hover:bg-amber-100"
                                >
                                  <RotateCcw className="w-3 h-3" />
                                </Button>
                                <Button
                                  size="sm"
                                  variant="outline"
                                  title="Remove Subscriber"
                                  disabled={deleteSubMutation.isPending}
                                  onClick={() => {
                                    if (confirm(`Remove subscriber ${sub.phone_number}?`)) {
                                      deleteSubMutation.mutate(sub.id);
                                    }
                                  }}
                                  className="h-7 px-2 text-[11px] rounded-lg border-rose-200 text-rose-700 bg-rose-50 hover:bg-rose-100"
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
