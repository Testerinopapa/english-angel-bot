import { createFileRoute } from "@tanstack/react-router";

import {
  getPartnerPhone,
  getRoomStatus,
  joinPracticeRoom,
  leavePracticeRoom,
} from "@/lib/rooms.server";
import {
  formatCapabilitiesDeepDive,
  formatExplanationCard,
  formatIntroPanel,
  formatPracticeStarter,
  formatPrivateCorrection,
  formatRoomsTutorial,
  maskSender,
  parseIncomingMessages,
  readMetaConfig,
  requestCorrection,
  sendWhatsAppInteractiveButton,
  sendWhatsAppInteractiveButtons,
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

  // --- Study Buddy Room Commands ---
  const trimmed = msg.text.trim();

  // /join <code> or /pair <code> or /room <code>
  const joinMatch = trimmed.match(/^\/(?:join|pair|room)\s*([A-Za-z0-9_-]+)?$/i);
  if (joinMatch) {
    const code = joinMatch[1] || "101";
    const res = await joinPracticeRoom(msg.from, code);
    if (res.isNew) {
      await sendWhatsAppText(
        msg.from,
        `⏳ *Practice Room #${res.roomCode} created!*\n\nShare this code with your study partner. When they message this bot:\n👉 */join ${res.roomCode}*\n\nyou will be automatically connected!`,
      );
    } else if (res.partnerPhone) {
      await sendWhatsAppText(
        msg.from,
        `🎉 *Connected to your study partner!*\n\nStart chatting in English! Talk'n'Bit will secretly watch your grammar and privately help you.\n\n_(Text */leave* anytime to exit)_`,
      );
      await sendWhatsAppText(
        res.partnerPhone,
        `🎉 *Your study partner has joined!*\n\nSay hello to start practicing in English! Talk'n'Bit will secretly watch and guide your grammar privately.\n\n_(Text */leave* anytime to exit)_`,
      );
    } else {
      await sendWhatsAppText(msg.from, res.message);
    }
    await finish({ status: "room_command", message_content: msg.text });
    return;
  }

  // /leave or /exit or /quit
  if (/^\/(?:leave|exit|quit)$/i.test(trimmed)) {
    const res = await leavePracticeRoom(msg.from);
    await sendWhatsAppText(
      msg.from,
      `👋 You left the practice room. Your messages are now in 1-on-1 mode with Talk'n'Bit.`,
    );
    if (res.partnerPhone) {
      await sendWhatsAppText(
        res.partnerPhone,
        `👋 Your study partner has left the room. Practice session ended.`,
      );
    }
    await finish({ status: "room_command", message_content: msg.text });
    return;
  }

  // /status or /info
  if (/^\/(?:status|info)$/i.test(trimmed)) {
    const st = await getRoomStatus(msg.from);
    if (st.inRoom) {
      await sendWhatsAppText(
        msg.from,
        `👥 *Practice Room Status:*\nYou are connected in Room *#${st.roomCode}* with partner *${st.partnerMasked}*.\n\nEverything you say is forwarded to your partner while Talk'n'Bit secretly helps with grammar.\nText */leave* to exit.`,
      );
    } else if (st.waiting) {
      await sendWhatsAppText(
        msg.from,
        `⏳ *Waiting for partner in Room #${st.roomCode}*.\nAsk your friend to text: */join ${st.roomCode}*`,
      );
    } else {
      await sendWhatsAppText(
        msg.from,
        `🤖 *1-on-1 Mode with Talk'n'Bit*\n\nTo practice with a partner while the bot secretly watches, text:\n👉 */join <room_code>* (e.g. */join 101*)`,
      );
    }
    await finish({ status: "room_command", message_content: msg.text });
    return;
  }

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

  // --- Study Buddy Active Room Secret-Watcher Relay ---
  const partnerInfo = await getPartnerPhone(msg.from);
  if (partnerInfo.inRoom && partnerInfo.partnerPhone) {
    let correctionResult = null;
    if (settings.bot_enabled) {
      try {
        correctionResult = await requestCorrection(settings.system_prompt, msg.text);
      } catch (err) {
        console.warn("AI error during room relay:", err);
      }
    }

    // Secret whisper to author if error detected
    if (correctionResult && correctionResult.has_error) {
      const whisper = `💬 *In room #${partnerInfo.roomCode}:*\n~${msg.text}~\n\n👉 *Better:* ${correctionResult.reply}`;
      await sendWhatsAppInteractiveButton(
        msg.from,
        whisper,
        `why_${msg.waMessageId}`,
        "Why? 💡",
      );
    }

    // Seamlessly forward message to partner (partner NEVER sees corrections!)
    await sendWhatsAppText(
      partnerInfo.partnerPhone,
      `💬 *Partner:* ${msg.text}`,
    );

    const detail = JSON.stringify({
      original_text: msg.text,
      corrected_text: correctionResult?.corrected_text ?? null,
      explanation: correctionResult?.explanation ?? null,
      reply: correctionResult?.reply ?? null,
      is_room_relay: true,
      room_code: partnerInfo.roomCode,
      partner_masked: maskSender(partnerInfo.partnerPhone),
    });

    await finish({
      status: correctionResult?.has_error ? "relay_corrected" : "relay_ok",
      has_error: correctionResult?.has_error ?? false,
      correction_sent: Boolean(correctionResult?.has_error),
      message_content: `[Room #${partnerInfo.roomCode}] ${msg.text.slice(0, 950)}`,
      error_detail: detail,
    });
    return;
  }

  // --- Regular 1-on-1 or Group Fallback Mode ---
  const isGroup = Boolean(msg.groupId);
  const content = isGroup ? `[Group] ${msg.text.slice(0, 950)}` : msg.text.slice(0, 950);

  if (!settings.bot_enabled) {
    await finish({ status: "skipped_disabled", message_content: content });
    return;
  }

  // --- Intro Panel, Tutorial & Capabilities Trigger ---
  const cleanedText = trimmed
    .toLowerCase()
    .replace(/[!.,?]/g, "")
    .replace(/['’]/g, "'")
    .trim();

  const isExactIntroGreeting =
    cleanedText === "hi i want to practice english with talk'n'bit" ||
    cleanedText === "hi i want to practice english with talknbit" ||
    cleanedText === "hello i want to practice english with talk'n'bit" ||
    cleanedText === "i want to practice english with talk'n'bit" ||
    cleanedText === "i want to practice english with talknbit" ||
    cleanedText.includes("want to practice english with talk");

  const isIntroCommand = /^\/(?:start|intro|tutorial|help|menu|about|capabilities)$/i.test(trimmed);
  const isStandaloneGreeting = /^(?:hi|hello|hey|oi|ol[áa]|bom dia|boa tarde|boa noite|help|start|menu)[!?.]*$/i.test(trimmed);
  const isPlanOrTrialInquiry =
    cleanedText.startsWith("hi i want to start my english immersion") ||
    cleanedText.startsWith("hi i want to expand my english vocabulary") ||
    cleanedText.startsWith("hi i want to start my free english practice") ||
    cleanedText.startsWith("hi i'd like to activate my one-day free trial") ||
    cleanedText.startsWith("hi id like to activate my one-day free trial") ||
    cleanedText.startsWith("hi i'd like to book an english trial lesson") ||
    cleanedText.startsWith("hi id like to book an english trial lesson") ||
    cleanedText.startsWith("hi i want to subscribe to the talk'n'bit") ||
    cleanedText.startsWith("hi i want to subscribe to the talknbit");

  if (!isGroup && (isExactIntroGreeting || isIntroCommand || isStandaloneGreeting || isPlanOrTrialInquiry)) {
    const headline = isPlanOrTrialInquiry
      ? "🎉 *Welcome to Talk'n'Bit!* 🚀\nYour trial and English practice are ready to begin."
      : undefined;

    const introText = formatIntroPanel(headline);
    await sendWhatsAppInteractiveButtons(
      msg.from,
      introText,
      [
        { id: "btn_1on1", title: "Practice 1-on-1 🗣️" },
        { id: "btn_rooms", title: "Study Buddy 👥" },
        { id: "btn_capabilities", title: "How It Works 💡" },
      ],
      "Talk'n'Bit • AI English Immersion",
    );

    await finish({
      status: "intro_sent",
      has_error: false,
      message_content: content,
      error_detail: JSON.stringify({
        type: "intro_panel",
        trigger: msg.text,
        matched: isExactIntroGreeting
          ? "exact_landing_greeting"
          : isIntroCommand
            ? "intro_command"
            : isPlanOrTrialInquiry
              ? "plan_or_trial"
              : "greeting",
      }),
    });
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
  } else if (msg.buttonId === "btn_1on1") {
    const starter = formatPracticeStarter();
    await sendWhatsAppInteractiveButton(
      msg.from,
      starter,
      "btn_random_topic",
      "New Topic 🎲",
      "Talk'n'Bit • 1-on-1 Practice",
    );
    await finish({
      status: "starter_sent",
      has_error: false,
      message_content: `[${msg.buttonTitle}]`,
      error_detail: JSON.stringify({ action: "start_1on1" }),
    });
  } else if (msg.buttonId === "btn_rooms") {
    const tutorial = formatRoomsTutorial();
    await sendWhatsAppInteractiveButton(
      msg.from,
      tutorial,
      "btn_join_101",
      "Join Room 101 🚀",
      "Talk'n'Bit • Study Buddy Rooms",
    );
    await finish({
      status: "room_tutorial_sent",
      has_error: false,
      message_content: `[${msg.buttonTitle}]`,
      error_detail: JSON.stringify({ action: "rooms_tutorial" }),
    });
  } else if (msg.buttonId === "btn_capabilities") {
    const capabilities = formatCapabilitiesDeepDive();
    await sendWhatsAppInteractiveButton(
      msg.from,
      capabilities,
      "btn_1on1",
      "Start 1-on-1 🗣️",
      "Talk'n'Bit • Capabilities",
    );
    await finish({
      status: "capabilities_sent",
      has_error: false,
      message_content: `[${msg.buttonTitle}]`,
      error_detail: JSON.stringify({ action: "capabilities_deep_dive" }),
    });
  } else if (msg.buttonId === "btn_random_topic") {
    const starter = formatPracticeStarter();
    await sendWhatsAppInteractiveButton(
      msg.from,
      starter,
      "btn_random_topic",
      "New Topic 🎲",
      "Talk'n'Bit • 1-on-1 Practice",
    );
    await finish({
      status: "starter_sent",
      has_error: false,
      message_content: `[${msg.buttonTitle}]`,
      error_detail: JSON.stringify({ action: "random_topic" }),
    });
  } else if (msg.buttonId === "btn_join_101") {
    const res = await joinPracticeRoom(msg.from, "101");
    if (res.isNew) {
      await sendWhatsAppText(
        msg.from,
        `⏳ *Practice Room #101 created!*\n\nShare this code with your study partner. When they message this bot:\n👉 */join 101*\n\nyou will be automatically connected!`,
      );
    } else if (res.partnerPhone) {
      await sendWhatsAppText(
        msg.from,
        `🎉 *Connected to your study partner!*\n\nStart chatting in English! Talk'n'Bit will secretly watch your grammar and privately help you.\n\n_(Text */leave* anytime to exit)_`,
      );
      await sendWhatsAppText(
        res.partnerPhone,
        `🎉 *Your study partner has joined!*\n\nSay hello to start practicing in English! Talk'n'Bit will secretly watch and guide your grammar privately.\n\n_(Text */leave* anytime to exit)_`,
      );
    } else {
      await sendWhatsAppText(msg.from, res.message);
    }
    await finish({
      status: "room_command",
      message_content: `[${msg.buttonTitle}] Join Room 101`,
      error_detail: JSON.stringify({ action: "joined_room_101", roomCode: "101" }),
    });
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
