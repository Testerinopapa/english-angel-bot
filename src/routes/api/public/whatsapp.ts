import { createFileRoute } from "@tanstack/react-router";

import {
  maskSender,
  parseIncomingTextMessages,
  readMetaConfig,
  requestCorrection,
  sendWhatsAppText,
  verifyMetaSignature,
  type IncomingTextMessage,
} from "@/lib/talknbit.server";

type Settings = {
  bot_enabled: boolean;
  store_message_content: boolean;
  system_prompt: string;
};

async function processMessage(msg: IncomingTextMessage) {
  const { supabaseAdmin } = await import("@/integrations/supabase/client.server");

  // Duplicate protection: unique wa_message_id. If Meta retries, this insert fails.
  const { error: insertError } = await supabaseAdmin.from("message_events").insert({
    wa_message_id: msg.waMessageId,
    sender_masked: maskSender(msg.from),
    wa_timestamp: msg.timestamp,
    status: "received",
  });
  if (insertError) return; // already processed (or unrecoverable) — never double-reply

  const finish = async (patch: Record<string, unknown>) => {
    await supabaseAdmin
      .from("message_events")
      .update({ ...patch, updated_at: new Date().toISOString() })
      .eq("wa_message_id", msg.waMessageId);
  };

  const { data: settingsRow } = await supabaseAdmin
    .from("app_settings")
    .select("bot_enabled, store_message_content, system_prompt")
    .eq("id", 1)
    .maybeSingle();
  const settings = settingsRow as Settings | null;

  if (!settings) {
    await finish({ status: "failed", error_detail: "Settings row missing" });
    return;
  }

  const content = settings.store_message_content ? msg.text.slice(0, 1000) : null;

  if (!settings.bot_enabled) {
    await finish({ status: "skipped_disabled", message_content: content });
    return;
  }

  try {
    const result = await requestCorrection(settings.system_prompt, msg.text);
    if (!result) {
      await finish({
        status: "failed",
        error_detail: "Invalid model response",
        message_content: content,
      });
      return;
    }

    if (!result.has_error) {
      await finish({ status: "no_error", has_error: false, message_content: content });
      return;
    }

    await sendWhatsAppText(msg.from, result.reply);
    await finish({
      status: "corrected",
      has_error: true,
      correction_sent: true,
      message_content: content,
    });
  } catch (error) {
    await finish({
      status: "failed",
      has_error: null,
      error_detail: error instanceof Error ? error.message.slice(0, 500) : "Unknown error",
      message_content: content,
    });
  }
}

export const Route = createFileRoute("/api/public/whatsapp")({
  server: {
    handlers: {
      // Meta webhook verification handshake
      GET: async ({ request }) => {
        const url = new URL(request.url);
        const mode = url.searchParams.get("hub.mode");
        const token = url.searchParams.get("hub.verify_token");
        const challenge = url.searchParams.get("hub.challenge");
        const expected = readMetaConfig().verifyToken;

        if (!expected) return new Response("Verify token not configured", { status: 503 });
        if (mode === "subscribe" && token === expected && challenge) {
          return new Response(challenge, {
            status: 200,
            headers: { "content-type": "text/plain" },
          });
        }
        return new Response("Forbidden", { status: 403 });
      },

      POST: async ({ request }) => {
        const raw = await request.text();

        const valid = await verifyMetaSignature(raw, request.headers.get("x-hub-signature-256"));
        if (!valid) return new Response("Invalid signature", { status: 401 });

        let payload: unknown;
        try {
          payload = JSON.parse(raw);
        } catch {
          return new Response("EVENT_RECEIVED", { status: 200 });
        }

        try {
          const messages = parseIncomingTextMessages(payload);
          for (const msg of messages) {
            await processMessage(msg);
          }
        } catch (error) {
          console.error("whatsapp webhook error", error);
        }

        // Always acknowledge so Meta does not retry endlessly.
        return new Response("EVENT_RECEIVED", { status: 200 });
      },
    },
  },
});
