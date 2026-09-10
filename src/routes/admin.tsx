import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { createFileRoute, Link } from "@tanstack/react-router";
import { useServerFn } from "@tanstack/react-start";
import { useEffect, useState } from "react";
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
  Activity,
  Settings as SettingsIcon,
} from "lucide-react";

import { AdminAuth } from "@/components/AdminAuth";
import { StatusPill } from "@/components/StatusPill";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Textarea } from "@/components/ui/textarea";
import { supabase } from "@/integrations/supabase/client";
import { getDashboard, updateSettings } from "@/lib/admin.functions";
import type { SettingsUpdate } from "@/lib/admin-schema";
import { webhookUrl } from "@/lib/webhook-url";

export const Route = createFileRoute("/admin")({
  head: () => ({
    meta: [
      { title: "Talk'n'Bit — Admin Portal" },
      {
        name: "description",
        content:
          "Internal control panel for Talk'n'Bit: bot status, WhatsApp and AI model configuration, message activity and correction prompt settings.",
      },
      { property: "og:title", content: "Talk'n'Bit — Admin Portal" },
      {
        property: "og:description",
        content: "Internal control panel for the Talk'n'Bit WhatsApp English correction bot.",
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
  const [copiedWebhook, setCopiedWebhook] = useState(false);

  const { data, isLoading, error } = useQuery({
    queryKey: ["dashboard"],
    queryFn: () => fetchDashboard(),
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
            <span className="hidden md:inline-block text-xs font-medium text-slate-500 bg-slate-100/80 px-3 py-1 rounded-full">
              {email}
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

        {/* Tabs */}
        <Tabs defaultValue="overview" className="space-y-6">
          <div className="flex justify-center sm:justify-start">
            <TabsList className="bg-purple-100/70 p-1 rounded-full border border-purple-200/60 gap-1 h-auto">
              <TabsTrigger
                value="overview"
                className="rounded-full px-5 py-2 text-xs font-bold data-[state=active]:bg-[#240b4a] data-[state=active]:text-white data-[state=active]:shadow-sm transition-all text-purple-950/70 hover:text-purple-950 flex items-center gap-1.5"
              >
                <Activity className="w-3.5 h-3.5" /> Overview
              </TabsTrigger>
              <TabsTrigger
                value="activity"
                className="rounded-full px-5 py-2 text-xs font-bold data-[state=active]:bg-[#240b4a] data-[state=active]:text-white data-[state=active]:shadow-sm transition-all text-purple-950/70 hover:text-purple-950 flex items-center gap-1.5"
              >
                <MessageSquare className="w-3.5 h-3.5" /> Activity
              </TabsTrigger>
              <TabsTrigger
                value="settings"
                className="rounded-full px-5 py-2 text-xs font-bold data-[state=active]:bg-[#240b4a] data-[state=active]:text-white data-[state=active]:shadow-sm transition-all text-purple-950/70 hover:text-purple-950 flex items-center gap-1.5"
              >
                <SettingsIcon className="w-3.5 h-3.5" /> Settings
              </TabsTrigger>
            </TabsList>
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

            {/* Meta & AI Cards */}
            <div className="grid gap-6 md:grid-cols-2">
              {/* WhatsApp Meta Config */}
              <div className="rounded-3xl border border-purple-100/90 bg-white p-6 shadow-sm space-y-4">
                <div className="flex items-center justify-between pb-3 border-b border-purple-50">
                  <div className="flex items-center gap-2">
                    <span className="text-xl">💬</span>
                    <h2 className="text-base font-bold text-[#1e0a45]">WhatsApp (Meta Cloud API)</h2>
                  </div>
                  <StatusPill tone={metaReady ? "ok" : "warn"}>
                    {metaReady ? "Configured" : "Incomplete"}
                  </StatusPill>
                </div>

                <ul className="space-y-2.5 text-xs">
                  <ConfigRow label="System User Access Token" ok={meta?.accessToken} />
                  <ConfigRow label="Phone Number ID" ok={meta?.phoneNumberId} />
                  <ConfigRow label="Webhook Verify Token" ok={meta?.verifyToken} />
                  <ConfigRow label="App Secret (HMAC signature)" ok={meta?.appSecret} optional />
                </ul>

                <div className="mt-4 rounded-2xl bg-purple-50/60 border border-purple-100/70 p-4 space-y-2">
                  <div className="flex items-center justify-between">
                    <p className="text-[11px] font-semibold text-purple-950">Webhook Callback URL</p>
                    <button
                      type="button"
                      onClick={copyWebhook}
                      className="inline-flex items-center gap-1 text-[11px] font-semibold text-purple-700 hover:text-purple-900 transition-colors"
                    >
                      {copiedWebhook ? (
                        <>
                          <Check className="w-3.5 h-3.5 text-emerald-600" /> Copied!
                        </>
                      ) : (
                        <>
                          <Copy className="w-3.5 h-3.5" /> Copy
                        </>
                      )}
                    </button>
                  </div>
                  <code className="block text-[11px] font-mono break-all text-purple-900/80 bg-white/80 p-2 rounded-lg border border-purple-200/50">
                    {webhookUrl()}
                  </code>
                </div>
              </div>

              {/* AI Engine Config */}
              <div className="rounded-3xl border border-purple-100/90 bg-white p-6 shadow-sm space-y-4">
                <div className="flex items-center justify-between pb-3 border-b border-purple-50">
                  <div className="flex items-center gap-2">
                    <span className="text-xl">🤖</span>
                    <h2 className="text-base font-bold text-[#1e0a45]">AI Correction Engine</h2>
                  </div>
                  <StatusPill tone={aiReady ? "ok" : "bad"}>
                    {aiReady ? "Configured" : "Missing API Key"}
                  </StatusPill>
                </div>

                <div className="space-y-2 text-xs">
                  <div className="flex items-center justify-between py-1.5 border-b border-slate-50">
                    <span className="text-slate-600">Active Model Provider</span>
                    <span className="font-mono font-semibold text-purple-900 bg-purple-50 px-2 py-0.5 rounded-md border border-purple-100">
                      {aiLabel}
                    </span>
                  </div>
                </div>

                <p className="text-xs text-slate-500 leading-relaxed pt-2">
                  Every incoming WhatsApp message is evaluated for grammatical and vocabulary errors. When a mistake is detected, Talk'n'Bit sends a private, helpful correction with an interactive <strong>Why? 💡</strong> explanation button.
                </p>

                <div className="rounded-2xl bg-[#fef9eb] border border-amber-200/60 p-3.5 flex items-center gap-3">
                  <span className="text-amber-600 text-lg">💡</span>
                  <p className="text-[11px] text-amber-950 font-medium">
                    Corrections are only sent when real errors occur, keeping student conversations natural and motivating.
                  </p>
                </div>
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

          {/* Tab 2: Activity */}
          <TabsContent value="activity" className="space-y-6 mt-0">
            <div className="rounded-3xl border border-purple-100/90 bg-white overflow-hidden shadow-sm">
              <div className="px-6 py-4 border-b border-purple-50 flex items-center justify-between">
                <div>
                  <h2 className="text-base font-bold text-[#1e0a45]">Recent WhatsApp Activity</h2>
                  <p className="text-xs text-slate-500 mt-0.5">Last 25 message events received by the bot</p>
                </div>
                <span className="text-xs text-slate-400 font-medium">Auto-refreshes every 30s</span>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead className="bg-purple-50/70 text-[#1e0a45] uppercase tracking-wider font-bold border-b border-purple-100/80">
                    <tr>
                      <th className="px-6 py-3.5">Timestamp</th>
                      <th className="px-6 py-3.5">Sender</th>
                      <th className="px-6 py-3.5">Status</th>
                      <th className="px-6 py-3.5">Correction / Error Detail</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-purple-50 text-slate-700">
                    {(data?.recent ?? []).map((row) => {
                      const s = statusLabels[row.status] ?? { label: row.status, tone: "idle" as const };
                      let isGroup = false;
                      try {
                        if (row.error_detail) {
                          const p = JSON.parse(row.error_detail);
                          if (p.is_group) isGroup = true;
                        }
                      } catch {}

                      return (
                        <tr key={row.id} className="hover:bg-purple-50/40 transition-colors">
                          <td className="px-6 py-3.5 whitespace-nowrap text-slate-500 font-medium">
                            {new Date(row.created_at).toLocaleString()}
                          </td>
                          <td className="px-6 py-3.5 font-mono text-xs">
                            <span className="text-purple-950 font-semibold">{row.sender_masked}</span>
                            {isGroup && (
                              <span className="ml-2 inline-flex items-center rounded-full bg-purple-100 px-2 py-0.5 text-[10px] font-bold text-purple-900 border border-purple-200">
                                Room
                              </span>
                            )}
                          </td>
                          <td className="px-6 py-3.5">
                            <StatusPill tone={s.tone}>{s.label}</StatusPill>
                          </td>
                          <td className="px-6 py-3.5 max-w-sm truncate text-slate-600" title={row.error_detail ?? ""}>
                            {(() => {
                              if (!row.error_detail) return <span className="text-slate-300">—</span>;
                              try {
                                const parsed = JSON.parse(row.error_detail);
                                if (parsed.explanation) return parsed.explanation;
                              } catch {}
                              return row.error_detail;
                            })()}
                          </td>
                        </tr>
                      );
                    })}

                    {!isLoading && (data?.recent?.length ?? 0) === 0 && (
                      <tr>
                        <td colSpan={4} className="px-6 py-12 text-center text-slate-400">
                          No messages received yet. Send a WhatsApp message to test!
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
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
                  Off by default. When off, only message IDs, masked phone numbers, and correction metadata are stored.
                </p>
              </div>
              <Switch
                id="store-toggle"
                checked={data?.settings?.store_message_content ?? false}
                disabled={isLoading || mutation.isPending}
                onCheckedChange={(checked) => mutation.mutate({ store_message_content: checked })}
              />
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

function ConfigRow({
  label,
  ok,
  optional,
}: {
  label: string;
  ok?: boolean | undefined;
  optional?: boolean | undefined;
}) {
  return (
    <li className="flex items-center justify-between gap-3 py-1.5 border-b border-slate-50 last:border-0">
      <span className="text-slate-600 font-medium">{label}</span>
      <StatusPill tone={ok ? "ok" : optional ? "idle" : "warn"}>
        {ok ? "Configured" : optional ? "Optional" : "Missing"}
      </StatusPill>
    </li>
  );
}
