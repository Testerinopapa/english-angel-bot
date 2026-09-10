import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { createFileRoute } from "@tanstack/react-router";
import { useServerFn } from "@tanstack/react-start";
import { useEffect, useState } from "react";
import { toast } from "sonner";

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

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Talk'n'Bit — WhatsApp English Correction Bot" },
      {
        name: "description",
        content:
          "Internal control panel for Talk'n'Bit: bot status, WhatsApp and AI model configuration, message activity and correction prompt settings.",
      },
      { property: "og:title", content: "Talk'n'Bit — WhatsApp English Correction Bot" },
      {
        property: "og:description",
        content: "Internal control panel for the Talk'n'Bit WhatsApp English correction bot.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
      { name: "robots", content: "noindex, nofollow" },
    ],
  }),
  component: Index,
});

const statusLabels: Record<string, { label: string; tone: "ok" | "warn" | "bad" | "idle" }> = {
  corrected: { label: "Correction sent", tone: "ok" },
  corrected_group_dm: { label: "Group Private DM", tone: "ok" },
  explanation_sent: { label: "Explanation sent", tone: "ok" },
  no_error: { label: "No mistake", tone: "idle" },
  skipped_disabled: { label: "Bot off", tone: "warn" },
  failed: { label: "Failed", tone: "bad" },
  received: { label: "Received", tone: "idle" },
};

function Index() {
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
    return <main className="min-h-screen" />;
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

  const { data, isLoading, error } = useQuery({
    queryKey: ["dashboard"],
    queryFn: () => fetchDashboard(),
    refetchInterval: 30_000,
  });

  const mutation = useMutation({
    mutationFn: (input: SettingsUpdate) => saveSettings({ data: input }),
    onSuccess: () => {
      toast.success("Saved");
      queryClient.invalidateQueries({ queryKey: ["dashboard"] });
    },
    onError: (e) => toast.error(e instanceof Error ? e.message : "Could not save"),
  });

  const [prompt, setPrompt] = useState<string | null>(null);
  const currentPrompt = prompt ?? data?.settings?.system_prompt ?? "";

  if (error) {
    return (
      <main className="flex min-h-screen items-center justify-center px-4 text-center">
        <div className="panel max-w-md p-8">
          <h1 className="text-xl font-semibold">No admin access</h1>
          <p className="mt-2 text-sm text-muted-foreground">
            This account is not an administrator of Talk&apos;n&apos;Bit.
          </p>
          <Button className="mt-6" variant="secondary" onClick={() => supabase.auth.signOut()}>
            Sign out
          </Button>
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
    <main className="mx-auto min-h-screen w-full max-w-5xl px-5 py-10">
      <header className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-semibold">Talk&apos;n&apos;Bit</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            WhatsApp English correction bot · {email}
          </p>
        </div>
        <div className="flex items-center gap-3">
          <StatusPill tone={botOn && metaReady && aiReady ? "ok" : botOn ? "warn" : "idle"}>
            {botOn ? (metaReady && aiReady ? "Live" : "On, incomplete setup") : "Paused"}
          </StatusPill>
          <Button variant="secondary" size="sm" onClick={() => supabase.auth.signOut()}>
            Sign out
          </Button>
        </div>
      </header>

      <section className="panel mt-8 flex flex-wrap items-center justify-between gap-4 p-6">
        <div>
          <Label htmlFor="bot-toggle" className="text-base">
            Process incoming messages
          </Label>
          <p className="mt-1 text-sm text-muted-foreground">
            When off, WhatsApp messages are still acknowledged and logged, but nothing is sent to
            the AI model and no reply goes out.
          </p>
        </div>
        <Switch
          id="bot-toggle"
          checked={botOn}
          disabled={isLoading || mutation.isPending}
          onCheckedChange={(checked) => mutation.mutate({ bot_enabled: checked })}
        />
      </section>

      <Tabs defaultValue="overview" className="mt-8">
        <TabsList>
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="activity">Activity</TabsTrigger>
          <TabsTrigger value="settings">Settings</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="mt-6 space-y-6">
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            <Stat label="Messages received" value={data?.stats.total ?? 0} />
            <Stat label="Corrections sent" value={data?.stats.corrected ?? 0} />
            <Stat label="No mistake found" value={data?.stats.noError ?? 0} />
            <Stat label="Failed" value={data?.stats.failed ?? 0} tone="bad" />
          </div>

          <div className="grid gap-4 md:grid-cols-2">
            <div className="panel p-6">
              <div className="flex items-center justify-between">
                <h2 className="text-lg font-semibold">WhatsApp (Meta)</h2>
                <StatusPill tone={metaReady ? "ok" : "warn"}>
                  {metaReady ? "Configured" : "Not configured"}
                </StatusPill>
              </div>
              <ul className="mt-4 space-y-2 text-sm">
                <ConfigRow label="Access token" ok={meta?.accessToken} />
                <ConfigRow label="Phone number ID" ok={meta?.phoneNumberId} />
                <ConfigRow label="Webhook verify token" ok={meta?.verifyToken} />
                <ConfigRow label="App secret (signature check)" ok={meta?.appSecret} optional />
              </ul>
              <div className="mt-4 rounded-lg bg-muted/50 p-3">
                <p className="text-xs text-muted-foreground">Webhook callback URL</p>
                <code className="mt-1 block text-xs break-all">{webhookUrl()}</code>
              </div>
            </div>

            <div className="panel p-6">
              <div className="flex items-center justify-between">
                <h2 className="text-lg font-semibold">AI Engine</h2>
                <StatusPill tone={aiReady ? "ok" : "bad"}>
                  {aiReady ? "Configured" : "Not configured"}
                </StatusPill>
              </div>
              <p className="mt-2 font-mono text-xs text-primary">
                {aiLabel}
              </p>
              <p className="mt-4 text-sm text-muted-foreground">
                One request per incoming message, returning structured JSON with the correction
                decision. Replies are only sent when a real mistake is detected.
              </p>
            </div>
          </div>

          <div className="panel p-6">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-lg font-semibold">Group Secret-Watcher Mode</h2>
                <p className="mt-1 text-sm text-muted-foreground">
                  Two or more students chatting normally in a WhatsApp study group. The bot secretly watches and sends
                  corrections privately via 1-on-1 DM, keeping the group conversation uninterrupted.
                </p>
              </div>
              <StatusPill tone="ok">Active</StatusPill>
            </div>
            <div className="mt-4 flex flex-wrap items-center gap-4 text-xs">
              <span className="rounded bg-primary/10 px-2.5 py-1 font-mono font-medium text-primary">
                Group Private DMs: {data?.stats.groupCorrections ?? 0}
              </span>
            </div>
          </div>
        </TabsContent>

        <TabsContent value="activity" className="mt-6">
          <div className="panel overflow-hidden">
            <table className="w-full text-sm">
              <thead className="bg-muted/40 text-left text-xs text-muted-foreground">
                <tr>
                  <th className="px-4 py-3 font-medium">When</th>
                  <th className="px-4 py-3 font-medium">Sender</th>
                  <th className="px-4 py-3 font-medium">Status</th>
                  <th className="px-4 py-3 font-medium">Detail</th>
                </tr>
              </thead>
              <tbody>
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
                    <tr key={row.id} className="border-t border-border/60">
                      <td className="px-4 py-3 whitespace-nowrap text-muted-foreground">
                        {new Date(row.created_at).toLocaleString()}
                      </td>
                      <td className="px-4 py-3 font-mono text-xs">
                        {row.sender_masked}
                        {isGroup && (
                          <span className="ml-2 inline-flex items-center rounded bg-primary/10 px-1.5 py-0.5 text-[10px] font-medium text-primary">
                            Group
                          </span>
                        )}
                      </td>
                      <td className="px-4 py-3">
                        <StatusPill tone={s.tone}>{s.label}</StatusPill>
                      </td>
                      <td className="max-w-xs truncate px-4 py-3 text-muted-foreground" title={row.error_detail ?? ""}>
                        {(() => {
                          if (!row.error_detail) return "";
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
                    <td colSpan={4} className="px-4 py-10 text-center text-muted-foreground">
                      No messages yet.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </TabsContent>

        <TabsContent value="settings" className="mt-6 space-y-6">
          <div className="panel p-6">
            <h2 className="text-lg font-semibold">Correction instructions</h2>
            <p className="mt-1 text-sm text-muted-foreground">
              The prompt sent to the AI model with every message. It must keep asking for JSON with
              has_error, corrected_text, explanation and reply.
            </p>
            <Textarea
              className="mt-4 min-h-[320px] font-mono text-xs"
              value={currentPrompt}
              onChange={(e) => setPrompt(e.target.value)}
            />
            <div className="mt-4 flex items-center gap-3">
              <Button
                disabled={mutation.isPending || currentPrompt.trim().length < 20}
                onClick={() => mutation.mutate({ system_prompt: currentPrompt })}
              >
                Save prompt
              </Button>
              <Button variant="ghost" onClick={() => setPrompt(null)}>
                Reset changes
              </Button>
            </div>
          </div>

          <div className="panel flex flex-wrap items-center justify-between gap-4 p-6">
            <div>
              <Label htmlFor="store-toggle" className="text-base">
                Store message text for debugging
              </Label>
              <p className="mt-1 text-sm text-muted-foreground">
                Off by default. Only the message ID, masked sender and status are logged.
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
  );
}

function Stat({ label, value, tone }: { label: string; value: number; tone?: "bad" }) {
  return (
    <div className="panel p-5">
      <p className="text-xs tracking-wide text-muted-foreground uppercase">{label}</p>
      <p
        className={`mt-2 text-3xl font-semibold ${tone === "bad" && value > 0 ? "text-destructive" : ""}`}
      >
        {value}
      </p>
    </div>
  );
}

function ConfigRow({ label, ok, optional }: { label: string; ok?: boolean | undefined; optional?: boolean | undefined }) {
  return (
    <li className="flex items-center justify-between gap-3">
      <span className="text-muted-foreground">{label}</span>
      <StatusPill tone={ok ? "ok" : optional ? "idle" : "warn"}>
        {ok ? "Set" : optional ? "Optional" : "Missing"}
      </StatusPill>
    </li>
  );
}
