/**
 * Server-only helpers for Talk'n'Bit.
 * Never import this file from client code.
 */

export type MetaConfig = {
  accessToken: string;
  phoneNumberId: string;
  verifyToken: string;
  appSecret: string;
};

export function readMetaConfig(): MetaConfig {
  return {
    accessToken: process.env["META_WHATSAPP_ACCESS_TOKEN"] ?? "",
    phoneNumberId: process.env["META_PHONE_NUMBER_ID"] ?? "",
    verifyToken: process.env["META_WEBHOOK_VERIFY_TOKEN"] ?? "",
    appSecret: process.env["META_APP_SECRET"] ?? "",
  };
}

export function metaConfigStatus() {
  const c = readMetaConfig();
  return {
    accessToken: Boolean(c.accessToken),
    phoneNumberId: Boolean(c.phoneNumberId),
    verifyToken: Boolean(c.verifyToken),
    appSecret: Boolean(c.appSecret),
    ready: Boolean(c.accessToken && c.phoneNumberId && c.verifyToken),
  };
}

export type AIConfig = {
  provider: "openrouter" | "anthropic" | null;
  model: string;
  configured: boolean;
  label: string;
};

export function getAIConfig(): AIConfig {
  const openRouterKey = process.env["OPENROUTER_API_KEY"] || process.env["CLAUDE_API_KEY"];
  const anthropicKey = process.env["ANTHROPIC_API_KEY"];

  // OpenRouter key or Anthropic key that uses OpenRouter prefix
  if (openRouterKey || (anthropicKey && anthropicKey.startsWith("sk-or-v1-"))) {
    const model = process.env["CLAUDE_MODEL"] || process.env["AI_MODEL"] || "anthropic/claude-3-haiku";
    return {
      provider: "openrouter",
      model,
      configured: true,
      label: `Claude (${model.replace("anthropic/", "")}) via OpenRouter`,
    };
  }

  // Direct Anthropic API key
  if (anthropicKey && anthropicKey.startsWith("sk-ant-")) {
    const model = process.env["CLAUDE_MODEL"] || process.env["AI_MODEL"] || "claude-3-haiku-20240307";
    return {
      provider: "anthropic",
      model,
      configured: true,
      label: `Claude (${model}) via Anthropic`,
    };
  }

  return {
    provider: null,
    model: "none",
    configured: false,
    label: "Not configured",
  };
}

export function aiConfigStatus(): AIConfig {
  return getAIConfig();
}

/** Keep only the last 4 digits of a phone identifier: 55•••••1234 */
export function maskSender(waId: string): string {
  if (!waId) return "unknown";
  const tail = waId.slice(-4);
  const head = waId.slice(0, 2);
  return `${head}${"•".repeat(Math.max(waId.length - 6, 3))}${tail}`;
}

/** Verify Meta's X-Hub-Signature-256 header against the raw request body. */
export async function verifyMetaSignature(rawBody: string, header: string | null): Promise<boolean> {
  const secret = readMetaConfig().appSecret;
  if (!secret) return true; // not configured yet — allow, dashboard flags it
  if (!header?.startsWith("sha256=")) return false;

  const key = await crypto.subtle.importKey(
    "raw",
    new TextEncoder().encode(secret),
    { name: "HMAC", hash: "SHA-256" },
    false,
    ["sign"],
  );
  const sigBuffer = await crypto.subtle.sign("HMAC", key, new TextEncoder().encode(rawBody));
  const expected = [...new Uint8Array(sigBuffer)]
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("");
  const provided = header.slice("sha256=".length);

  if (provided.length !== expected.length) return false;
  let diff = 0;
  for (let i = 0; i < expected.length; i++) diff |= provided.charCodeAt(i) ^ expected.charCodeAt(i);
  return diff === 0;
}

export type IncomingTextMessage = {
  type: "text";
  waMessageId: string;
  from: string;
  text: string;
  timestamp: string | null;
  groupId: string | null;
};

export type IncomingInteractiveMessage = {
  type: "interactive";
  waMessageId: string;
  from: string;
  buttonId: string;
  buttonTitle: string;
  contextMessageId: string | null;
  timestamp: string | null;
  groupId: string | null;
};

export type IncomingWhatsAppMessage = IncomingTextMessage | IncomingInteractiveMessage;

/** Extract incoming messages (text and button replies) including group identifiers. */
export function parseIncomingMessages(payload: unknown): IncomingWhatsAppMessage[] {
  const out: IncomingWhatsAppMessage[] = [];
  const body = payload as {
    object?: string;
    entry?: Array<{ changes?: Array<{ field?: string; value?: Record<string, unknown> }> }>;
  };
  if (!body || body.object !== "whatsapp_business_account" || !Array.isArray(body.entry)) return out;

  for (const entry of body.entry) {
    for (const change of entry.changes ?? []) {
      if (change.field !== "messages") continue;
      const value = change.value as
        | { messages?: Array<Record<string, unknown>>; statuses?: unknown }
        | undefined;
      if (!value || !Array.isArray(value.messages)) continue; // status callbacks etc.

      for (const msg of value.messages) {
        const id = typeof msg["id"] === "string" ? msg["id"] : "";
        const from = typeof msg["from"] === "string" ? msg["from"] : "";
        if (!id || !from) continue;

        const tsRaw = msg["timestamp"];
        const ts =
          typeof tsRaw === "string" || typeof tsRaw === "number"
            ? new Date(Number(tsRaw) * 1000).toISOString()
            : null;

        const groupId =
          typeof msg["group_id"] === "string"
            ? msg["group_id"]
            : typeof (msg as Record<string, unknown>)["chat_id"] === "string" &&
                ((msg as Record<string, unknown>)["chat_id"] as string).endsWith("@g.us")
              ? ((msg as Record<string, unknown>)["chat_id"] as string)
              : null;

        const msgType = msg["type"];

        if (msgType === "text") {
          const textObj = msg["text"] as { body?: string } | undefined;
          const text = typeof textObj?.body === "string" ? textObj.body.trim() : "";
          if (!text) continue;
          out.push({ type: "text", waMessageId: id, from, text, timestamp: ts, groupId });
        } else if (msgType === "interactive") {
          const interactive = msg["interactive"] as
            | {
                type?: string;
                button_reply?: { id?: string; title?: string };
              }
            | undefined;
          if (interactive?.type === "button_reply" && interactive.button_reply) {
            const buttonId =
              typeof interactive.button_reply.id === "string" ? interactive.button_reply.id : "";
            const buttonTitle =
              typeof interactive.button_reply.title === "string" ? interactive.button_reply.title : "";
            const context = msg["context"] as { id?: string } | undefined;
            const contextMessageId = typeof context?.id === "string" ? context.id : null;
            if (buttonId) {
              out.push({
                type: "interactive",
                waMessageId: id,
                from,
                buttonId,
                buttonTitle,
                contextMessageId,
                timestamp: ts,
                groupId,
              });
            }
          }
        }
      }
    }
  }
  return out;
}

/** Backward-compatible helper to extract only text messages. */
export function parseIncomingTextMessages(payload: unknown): IncomingTextMessage[] {
  return parseIncomingMessages(payload).filter((m): m is IncomingTextMessage => m.type === "text");
}

export type CorrectionResult = {
  has_error: boolean;
  corrected_text: string;
  explanation: string;
  reply: string;
};

/** Send correction request to configured AI provider; returns null when the response is unusable. */
export async function requestCorrection(
  systemPrompt: string,
  userText: string,
): Promise<CorrectionResult | null> {
  const config = getAIConfig();
  if (!config.configured || !config.provider) {
    throw new Error("AI provider is not configured (missing OPENROUTER_API_KEY or ANTHROPIC_API_KEY)");
  }

  let content: string | undefined;

  if (config.provider === "openrouter") {
    const apiKey =
      process.env["OPENROUTER_API_KEY"] ||
      process.env["CLAUDE_API_KEY"] ||
      process.env["ANTHROPIC_API_KEY"];
    if (!apiKey) throw new Error("OpenRouter API key is missing");

    const res = await fetch("https://openrouter.ai/api/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${apiKey}`,
        "HTTP-Referer": "https://english-angel-bot.lovable.app",
        "X-Title": "Talk'n'Bit English Correction",
      },
      body: JSON.stringify({
        model: config.model,
        temperature: 0.2,
        response_format: { type: "json_object" },
        messages: [
          { role: "system", content: systemPrompt },
          { role: "user", content: userText },
        ],
      }),
    });

    if (!res.ok) {
      const detail = await res.text();
      throw new Error(`OpenRouter (${config.model}) ${res.status}: ${detail.slice(0, 300)}`);
    }

    const data = (await res.json()) as {
      choices?: Array<{ message?: { content?: string } }>;
    };
    content = data.choices?.[0]?.message?.content;
  } else if (config.provider === "anthropic") {
    const apiKey = process.env["ANTHROPIC_API_KEY"] || process.env["CLAUDE_API_KEY"];
    if (!apiKey) throw new Error("Anthropic API key is missing");

    const res = await fetch("https://api.anthropic.com/v1/messages", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-api-key": apiKey,
        "anthropic-version": "2023-06-01",
      },
      body: JSON.stringify({
        model: config.model,
        max_tokens: 1000,
        temperature: 0.2,
        system: systemPrompt,
        messages: [{ role: "user", content: userText }],
      }),
    });

    if (!res.ok) {
      const detail = await res.text();
      throw new Error(`Anthropic ${res.status}: ${detail.slice(0, 300)}`);
    }

    const data = (await res.json()) as {
      content?: Array<{ type: string; text?: string }>;
    };
    content = data.content?.find((c) => c.type === "text")?.text;
  }

  if (!content) return null;

  let parsed: unknown;
  try {
    const fenceMatch = content.match(/```(?:json)?\s*([\s\S]*?)\s*```/);
    const textToParse = fenceMatch?.[1] ? fenceMatch[1].trim() : content.trim();
    parsed = JSON.parse(textToParse);
  } catch {
    return null;
  }

  const obj = parsed as Partial<CorrectionResult>;
  if (typeof obj?.has_error !== "boolean") return null;

  let reply = typeof obj.reply === "string" ? obj.reply.trim() : "";
  const corrected = typeof obj.corrected_text === "string" ? obj.corrected_text.trim() : "";
  const explanation = typeof obj.explanation === "string" ? obj.explanation.trim() : "";

  // If error was detected but reply was left blank, synthesize a friendly fallback reply
  if (obj.has_error && !reply) {
    if (corrected && explanation) {
      reply = `${corrected} (${explanation})`;
    } else if (corrected) {
      reply = corrected;
    } else if (explanation) {
      reply = explanation;
    } else {
      return null;
    }
  }

  return {
    has_error: obj.has_error,
    corrected_text: corrected,
    explanation,
    reply: reply.slice(0, 1000),
  };
}

/** Send a plain text WhatsApp message through the official Meta Graph API. */
export async function sendWhatsAppText(to: string, text: string): Promise<void> {
  const { accessToken, phoneNumberId } = readMetaConfig();
  if (!accessToken || !phoneNumberId) {
    throw new Error("WhatsApp is not configured (missing access token or phone number id)");
  }

  const res = await fetch(`https://graph.facebook.com/v21.0/${phoneNumberId}/messages`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${accessToken}`,
    },
    body: JSON.stringify({
      messaging_product: "whatsapp",
      recipient_type: "individual",
      to,
      type: "text",
      text: { preview_url: false, body: text },
    }),
  });

  if (!res.ok) {
    const detail = await res.text();
    // Never log the token; only Meta's error payload.
    throw new Error(`Meta send failed ${res.status}: ${detail.slice(0, 300)}`);
  }
}

export type QuickReplyButton = {
  id: string;
  title: string;
};

/**
 * Send an interactive quick-reply button message (1 to 3 buttons) via Meta Graph API.
 * Gracefully falls back to plain text if interactive message delivery fails.
 */
export async function sendWhatsAppInteractiveButtons(
  to: string,
  bodyText: string,
  buttons: QuickReplyButton[],
  footerText?: string,
): Promise<void> {
  const { accessToken, phoneNumberId } = readMetaConfig();
  if (!accessToken || !phoneNumberId) {
    throw new Error("WhatsApp is not configured (missing access token or phone number id)");
  }

  // Meta restrictions:
  // reply.title: max 20 chars
  // reply.id: max 256 chars
  // body.text: max 1024 chars
  // buttons array: max 3 buttons
  const text = bodyText.slice(0, 1024);
  const actionButtons = buttons.slice(0, 3).map((b) => ({
    type: "reply",
    reply: {
      id: b.id.slice(0, 256),
      title: b.title.slice(0, 20),
    },
  }));

  const interactivePayload: Record<string, unknown> = {
    type: "button",
    body: { text },
    action: {
      buttons: actionButtons,
    },
  };

  if (footerText) {
    interactivePayload["footer"] = { text: footerText.slice(0, 60) };
  }

  try {
    const res = await fetch(`https://graph.facebook.com/v21.0/${phoneNumberId}/messages`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${accessToken}`,
      },
      body: JSON.stringify({
        messaging_product: "whatsapp",
        recipient_type: "individual",
        to,
        type: "interactive",
        interactive: interactivePayload,
      }),
    });

    if (!res.ok) {
      const detail = await res.text();
      console.warn(
        `Meta interactive message send failed ${res.status}: ${detail.slice(0, 300)}. Falling back to plain text.`,
      );
      await sendWhatsAppText(to, text);
    }
  } catch (err) {
    console.warn("Interactive send threw an error, falling back to plain text:", err);
    await sendWhatsAppText(to, text);
  }
}

/**
 * Send an interactive quick-reply button message via Meta Graph API.
 * Gracefully falls back to plain text if interactive message delivery fails.
 */
export async function sendWhatsAppInteractiveButton(
  to: string,
  bodyText: string,
  buttonId: string,
  buttonTitle: string = "Why? 💡",
  footerText?: string,
): Promise<void> {
  return sendWhatsAppInteractiveButtons(
    to,
    bodyText,
    [{ id: buttonId, title: buttonTitle }],
    footerText,
  );
}

/**
 * Format the welcome Intro Panel, Tutorial & Capabilities overview for WhatsApp.
 */
export function formatIntroPanel(headline?: string): string {
  const top = headline || "👋 *Welcome to Talk'n'Bit!* 🚀\nYour personal AI English immersion coach on WhatsApp.";
  return [
    top,
    "",
    "Here is what I can do for you:",
    "",
    "1️⃣ *1-on-1 Chat & Real-Time Feedback* 🗣️",
    "Chat in English naturally about anything—your day, work, plans, or hobbies.",
    "• If you make a mistake, I'll gently reply with the natural phrasing.",
    "• Tap *[Why? 💡]* to learn the grammar rule behind it!",
    "",
    "2️⃣ *Study Buddy Practice Rooms* 👥",
    "Practice with a friend without fear of judgment!",
    "• Text */join 101* (or any number) to connect.",
    "• Talk'n'Bit secretly watches and whispers corrections *privately* to you—your partner never sees your mistakes!",
    "",
    "3️⃣ *Bilingual Questions & Translations* 🇧🇷🇪🇸",
    "Ask questions in Portuguese or Spanish whenever you're stuck:",
    "• _\"Como se diz 'dar uma volta' em inglês?\"_",
    "• _\"Why do we say 'interested in' and not 'interested on'?\"_",
    "",
    "⚡ *Quick Commands:*",
    "• */join <room>* — Connect with a study partner (e.g. */join 101*)",
    "• */leave* — Exit back to 1-on-1 mode",
    "• */status* — Check your active room connection",
    "• */help* — Show this intro panel again",
    "",
    "👇 *Tap a button below or send a message in English to begin!*",
  ].join("\n");
}

export const CONVERSATION_TOPICS = [
  "What did you do today, or what are your plans for this weekend?",
  "If you could travel anywhere in the world tomorrow, where would you go and why?",
  "What's your favorite movie or TV series of all time, and why do you love it?",
  "Tell me about your job or what you're studying—what do you enjoy most about it?",
  "What is one hobby or skill you've always wanted to learn, and what's stopping you?",
  "What is your favorite food, and can you cook it yourself?",
];

/**
 * Format a warm-up conversation starter to get the user speaking in English immediately.
 */
export function formatPracticeStarter(topicIndex?: number): string {
  const idx =
    typeof topicIndex === "number" && topicIndex >= 0
      ? topicIndex % CONVERSATION_TOPICS.length
      : Math.floor(Math.random() * CONVERSATION_TOPICS.length);
  const topic = CONVERSATION_TOPICS[idx];

  return [
    "🎯 *1-on-1 Practice Active!*",
    "",
    "Here is a warm-up question to get us started:",
    `👉 *${topic}*`,
    "",
    "Reply in English! Don't worry about making mistakes—every mistake is a stepping stone to fluency. 😊",
  ].join("\n");
}

/**
 * Format a 3-step walkthrough on how Study Buddy Rooms work.
 */
export function formatRoomsTutorial(): string {
  return [
    "👥 *Study Buddy Rooms — Quick Tutorial*",
    "",
    "Practice speaking English with a partner or friend—privately and judgment-free!",
    "",
    "*How it works in 3 easy steps:*",
    "1️⃣ Choose any room number (e.g. *101*).",
    "2️⃣ Text: */join 101*",
    "3️⃣ Have your study partner message this bot: */join 101*",
    "",
    "🎉 *Connected!* Everything you send is forwarded directly to your partner.",
    "",
    "🕵️ *The Secret Watcher Feature:*",
    "If you make a grammar mistake, Talk'n'Bit whispers the fix *privately only to you*. Your partner will NEVER see your corrections!",
    "",
    "To leave anytime, text: */leave*",
    "",
    "👉 Try it right now by texting: */join 101*",
  ].join("\n");
}

/**
 * Format a deep-dive explanation of Talk'n'Bit capabilities and pedagogy.
 */
export function formatCapabilitiesDeepDive(): string {
  return [
    "✨ *Talk'n'Bit Capabilities Deep-Dive*",
    "",
    "• *Discreet Micro-Feedback:* Natural corrections without breaking conversation flow.",
    "• *[Why? 💡] Grammar Cards:* Pinpoints specific Brazilian Portuguese & Spanish false cognates, preposition pitfalls, and verb tenses.",
    "• *Secret-Watcher Rooms:* Real human practice with silent AI coaching in the background.",
    "• *Zero Friction:* 100% inside WhatsApp. No app store downloads, logins, or ads.",
    "",
    "Send any message in English to practice 1-on-1 right now! 🌟",
  ].join("\n");
}

/**
 * Format a rich WhatsApp Grammar Explanation Card using WhatsApp Markdown formatting.
 */
export function formatExplanationCard(
  originalText: string,
  correctedText: string,
  explanation: string,
): string {
  const lines: string[] = ["*💡 Grammar Breakdown*", ""];

  if (originalText) {
    lines.push(`❌ *Original:* ~${originalText}~`);
  }
  if (correctedText) {
    lines.push(`✅ *Correction:* *${correctedText}*`);
  }
  if (explanation) {
    lines.push("", "*📖 Rule:*", explanation);
  }

  lines.push("", "_Keep practicing! You're doing great._ 🌟");

  return lines.join("\n");
}

/**
 * Format a private correction message when a student made a mistake in a group chat vs direct chat.
 */
export function formatPrivateCorrection(
  originalText: string,
  reply: string,
  isGroup: boolean,
): string {
  if (!isGroup) {
    return reply;
  }

  // In group chats, make it obvious which message this private DM refers to,
  // while keeping it brief and friendly.
  const shortOriginal = originalText.length > 60 ? `${originalText.slice(0, 57)}...` : originalText;
  return `💬 *In group chat:*\n~${shortOriginal}~\n\n👉 *Better:* ${reply}`;
}

/**
 * Create a WhatsApp Study Group via Meta Cloud API.
 * Requires Official Business Account (OBA) status from Meta.
 */
export async function createWhatsAppGroup(
  subject: string,
  description?: string,
): Promise<{ groupId: string; inviteCode?: string; inviteLink?: string }> {
  const { accessToken, phoneNumberId } = readMetaConfig();
  if (!accessToken || !phoneNumberId) {
    throw new Error("WhatsApp is not configured (missing access token or phone number id)");
  }

  const payload: Record<string, unknown> = {
    messaging_product: "whatsapp",
    subject: subject.slice(0, 100),
  };
  if (description) {
    payload["description"] = description.slice(0, 255);
  }

  const res = await fetch(`https://graph.facebook.com/v21.0/${phoneNumberId}/groups`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${accessToken}`,
    },
    body: JSON.stringify(payload),
  });

  if (!res.ok) {
    const detail = await res.text();
    throw new Error(`Failed to create WhatsApp group (${res.status}): ${detail.slice(0, 300)}`);
  }

  const data = (await res.json()) as { id: string };
  const groupId = data.id;

  let inviteCode: string | undefined;
  let inviteLink: string | undefined;

  try {
    const inviteRes = await fetch(`https://graph.facebook.com/v21.0/${groupId}/invite_code`, {
      method: "GET",
      headers: { Authorization: `Bearer ${accessToken}` },
    });
    if (inviteRes.ok) {
      const inviteData = (await inviteRes.json()) as { invite_code: string };
      inviteCode = inviteData.invite_code;
      inviteLink = `https://chat.whatsapp.com/${inviteCode}`;
    }
  } catch {
    // If fetching invite link fails right away, return groupId
  }

  return {
    groupId,
    ...(inviteCode ? { inviteCode } : {}),
    ...(inviteLink ? { inviteLink } : {}),
  };
}

/**
 * Get the invite link for an existing WhatsApp group.
 */
export async function getWhatsAppGroupInvite(
  groupId: string,
): Promise<{ inviteCode: string; inviteLink: string }> {
  const { accessToken } = readMetaConfig();
  if (!accessToken) {
    throw new Error("WhatsApp access token is not configured");
  }

  const res = await fetch(`https://graph.facebook.com/v21.0/${groupId}/invite_code`, {
    method: "GET",
    headers: { Authorization: `Bearer ${accessToken}` },
  });

  if (!res.ok) {
    const detail = await res.text();
    throw new Error(`Failed to get group invite code (${res.status}): ${detail.slice(0, 300)}`);
  }

  const data = (await res.json()) as { invite_code: string };
  return {
    inviteCode: data.invite_code,
    inviteLink: `https://chat.whatsapp.com/${data.invite_code}`,
  };
}


