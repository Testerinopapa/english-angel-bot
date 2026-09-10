import { createFileRoute } from "@tanstack/react-router";

import {
  formatExplanationCard,
  formatPrivateCorrection,
  maskSender,
  parseIncomingMessages,
  readMetaConfig,
  requestCorrection,
  sendWhatsAppInteractiveButton,
  sendWhatsAppText,
  verifyMetaSignature,
  type IncomingInteractiveMessage,
  type IncomingTextMessage,
} from "@/lib/talknbit.server";

type Settings = {
  bot_enabled: boolean;
  store_message_content: boolean;
  system_prompt: string;
};

async function processTextMessage(msg: IncomingTextMessage) {
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

  const isGroup = Boolean(msg.groupId);
  const rawContent = settings.store_message_content ? msg.text.slice(0, 950) : null;
  const content = rawContent ? (isGroup ? `[Group] ${rawContent}` : rawContent) : null;

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

    // Format correction: in group messages, discreetly indicate context in private DM
    const replyText = formatPrivateCorrection(msg.text, result.reply, isGroup);

    // Send interactive button ALWAYS privately to msg.from (the student), never to group!
    await sendWhatsAppInteractiveButton(
      msg.from,
      replyText,
      `why_${msg.waMessageId}`,
      "Why? 💡",
    );

    // Save structured correction detail for instant "Why?" lookup
    const errorDetail = JSON.stringify({
      original_text: msg.text,
      corrected_text: result.corrected_text,
      explanation: result.explanation,
      reply: result.reply,
      is_group: isGroup,
      group_id: msg.groupId ?? null,
    });

    await finish({
      status: isGroup ? "corrected_group_dm" : "corrected",
      has_error: true,
      correction_sent: true,
      message_content: content,
      error_detail: errorDetail,
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

async function processInteractiveMessage(msg: IncomingInteractiveMessage) {
  const { supabaseAdmin } = await import("@/integrations/supabase/client.server");

  // Duplicate protection: unique wa_message_id.
  const { error: insertError } = await supabaseAdmin.from("message_events").insert({
    wa_message_id: msg.waMessageId,
    sender_masked: maskSender(msg.from),
    wa_timestamp: msg.timestamp,
    status: "received",
  });
  if (insertError) return;

  const finish = async (patch: Record<string, unknown>) => {
    await supabaseAdmin
      .from("message_events")
      .update({ ...patch, updated_at: new Date().toISOString() })
      .eq("wa_message_id", msg.waMessageId);
  };

  if (msg.buttonId.startsWith("why_")) {
    const targetWaId = msg.buttonId.slice(4);

    let eventRow: {
      wa_message_id: string;
      message_content: string | null;
      error_detail: string | null;
    } | null = null;

    if (targetWaId) {
      const { data } = await supabaseAdmin
        .from("message_events")
        .select("wa_message_id, message_content, error_detail")
        .eq("wa_message_id", targetWaId)
        .maybeSingle();
      eventRow = data;
    }

    // Fallback: look up the most recent corrected message for this sender if ID search missed
    if (!eventRow) {
      const { data: fallbackData } = await supabaseAdmin
        .from("message_events")
        .select("wa_message_id, message_content, error_detail")
        .eq("sender_masked", maskSender(msg.from))
        .eq("status", "corrected")
        .order("created_at", { ascending: false })
        .limit(1)
        .maybeSingle();
      eventRow = fallbackData;
    }

    let explanation = "";
    let correctedText = "";
    let originalText = "";

    if (eventRow?.error_detail) {
      try {
        const parsed = JSON.parse(eventRow.error_detail);
        explanation = typeof parsed.explanation === "string" ? parsed.explanation : "";
        correctedText = typeof parsed.corrected_text === "string" ? parsed.corrected_text : "";
        originalText = typeof parsed.original_text === "string" ? parsed.original_text : "";
      } catch {
        explanation = eventRow.error_detail;
      }
    }
    if (!originalText && eventRow?.message_content) {
      originalText = eventRow.message_content;
    }

    if (explanation || correctedText) {
      const card = formatExplanationCard(originalText, correctedText, explanation);
      await sendWhatsAppText(msg.from, card);
      await finish({
        status: "explanation_sent",
        has_error: false,
        correction_sent: true,
        message_content: `[${msg.buttonTitle}]`,
        error_detail: JSON.stringify({
          target_wa_id: targetWaId,
          explanation,
        }),
      });
    } else {
      const fallbackMsg =
        "💡 *Grammar Tip:* Keep chatting! Whenever a mistake is spotted, tap *Why?* to see the explanation.";
      await sendWhatsAppText(msg.from, fallbackMsg);
      await finish({
        status: "explanation_sent",
        has_error: false,
        correction_sent: true,
        message_content: `[${msg.buttonTitle}] (no cached explanation)`,
      });
    }
  } else {
    await finish({
      status: "received",
      message_content: `Interactive button: ${msg.buttonId}`,
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
          const messages = parseIncomingMessages(payload);
          for (const msg of messages) {
            if (msg.type === "text") {
              await processTextMessage(msg);
            } else if (msg.type === "interactive") {
              await processInteractiveMessage(msg);
            }
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
