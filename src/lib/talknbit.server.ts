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
  waMessageId: string;
  from: string;
  text: string;
  timestamp: string | null;
};

/** Extract normal incoming text messages; everything else is ignored. */
export function parseIncomingTextMessages(payload: unknown): IncomingTextMessage[] {
  const out: IncomingTextMessage[] = [];
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
        if (msg["type"] !== "text") continue;
        const textObj = msg["text"] as { body?: string } | undefined;
        const text = typeof textObj?.body === "string" ? textObj.body.trim() : "";
        const id = typeof msg["id"] === "string" ? msg["id"] : "";
        const from = typeof msg["from"] === "string" ? msg["from"] : "";
        if (!text || !id || !from) continue;
        const tsRaw = msg["timestamp"];
        const ts =
          typeof tsRaw === "string" || typeof tsRaw === "number"
            ? new Date(Number(tsRaw) * 1000).toISOString()
            : null;
        out.push({ waMessageId: id, from, text, timestamp: ts });
      }
    }
  }
  return out;
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
    const textToParse = fenceMatch ? fenceMatch[1].trim() : content.trim();
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
