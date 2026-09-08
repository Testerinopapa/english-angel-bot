# English Buddy Bot

Build a clean replacement for an existing WhatsApp English-correction bot called Talk'n'Bit.

The old system used Hostinger + Easypanel + n8n + Evolution API + OpenAI. I do NOT want to reproduce that infrastructure.

The new version should run using Lovable Cloud as the backend, the official Meta WhatsApp Cloud API for WhatsApp, and the OpenAI API for language processing.

Main goal

The bot receives incoming WhatsApp text messages.

Its behavior is:

Receive a message from the official Meta WhatsApp webhook.

Ignore messages that are not normal incoming user text messages.

Send the user's text to OpenAI.

Determine whether the English contains a meaningful grammatical, spelling, wording, or natural-language mistake.

If there is no meaningful error, send NO reply.

If there is an error, generate a short, friendly correction.

Send that correction back to the same WhatsApp user using the official Meta WhatsApp Cloud API.

The bot should primarily behave as an English correction assistant, not as a general-purpose chatbot.

Do not answer unrelated questions just because the user sends them. The purpose is to identify and correct English mistakes.

Correction style

Corrections should be:

concise

friendly

easy to understand

not overly academic

optionally use a small number of appropriate emojis

show the corrected English clearly

briefly explain the mistake when useful

Avoid long lessons unless necessary.

Architecture

Use:

Lovable Cloud backend

server-side functions / Edge Functions for webhook processing

official Meta WhatsApp Cloud API

OpenAI API

Lovable Secrets for all credentials

database only where useful

Do NOT use:

Evolution API

Baileys

unofficial WhatsApp libraries

n8n

client-side API keys

hardcoded secrets

All Meta and OpenAI credentials must remain server-side.

Meta webhook

Create a backend endpoint suitable for use as the Meta WhatsApp webhook.

It must support:

Webhook verification

Handle Meta's GET verification request using:

hub.mode

hub.verify_token

hub.challenge

The verify token must come from a Lovable Secret.

Incoming events

Handle POST webhook events from WhatsApp.

Extract:

sender WhatsApp ID / phone identifier

message ID

text body

timestamp where available

Ignore unsupported event types safely, including delivery/read status callbacks.

Prevent accidental duplicate processing of the same WhatsApp message if Meta retries a webhook.

Return a successful webhook response quickly and handle failures safely.

Meta API sending

Create a reusable server-side function for sending WhatsApp text messages through the official Meta Graph API.

Credentials/configuration must be stored as Lovable Secrets, with placeholders for things such as:

META_WHATSAPP_ACCESS_TOKEN

META_PHONE_NUMBER_ID

META_WEBHOOK_VERIFY_TOKEN

META_APP_SECRET if required

OPENAI_API_KEY

Do not expose any of these to the browser.

OpenAI logic

Prefer ONE OpenAI request per incoming user message rather than first asking "does this contain an error?" and then making a second request.

Ask OpenAI to return structured JSON, for example:

{
"has_error": true,
"corrected_text": "...",
"explanation": "...",
"reply": "..."
}

If has_error is false, the application should not send anything to WhatsApp.

Validate the model response server-side before acting on it.

Make the OpenAI system prompt easy for me to edit later.

Admin dashboard

Create a simple, clean admin dashboard for me.

This is an internal tool, not a public marketing site.

Show:

Talk'n'Bit title

bot status

Meta webhook configuration status

OpenAI configuration status

total messages received

corrections sent

messages ignored because they contained no error

recent activity

errors / failed requests

Add a clear ON/OFF control for processing messages.

When OFF, incoming webhooks can still be acknowledged, but the bot should not process them through OpenAI or send responses.

Prompt settings

Create a Settings area where I can edit the bot's OpenAI correction instructions without changing source code.

Store this setting securely in the backend/database.

Provide a sensible default prompt based on the behavior described above.

Logging

Store enough information to troubleshoot problems, but avoid unnecessarily storing private WhatsApp message content.

Prefer storing:

message ID

sender identifier or safely masked identifier

timestamp

processing status

whether an error was detected

whether a correction was sent

API/error status

If message content is stored for debugging, make that optional and clearly configurable.

Security

Important:

never expose API keys to frontend code

use Lovable Secrets

verify webhook requests where supported by Meta

validate all external payloads

do not trust client-provided admin state

keep sensitive actions server-side

do not log access tokens

do not put secrets in database rows readable by frontend users

Current project situation

This is a fresh rebuild.

Do not depend on the previous Hostinger VPS, n8n workflow, Easypanel, or Evolution API.

The official Meta WhatsApp setup may not be fully finished yet, so design the system so I can add the final Meta:

access token

WhatsApp Business phone number ID

webhook verify token

app secret

later through secure configuration.

Until those values are available, the dashboard should clearly show that WhatsApp is "Not configured" rather than crash.

Development approach

Build the foundation first.

Start with:

database/schema if required

secure configuration architecture

Meta webhook endpoint

webhook verification

incoming text-message parser

OpenAI correction function

Meta send-message function

duplicate-message protection

logging

admin dashboard

settings/editor for the correction prompt

Keep the implementation simple and maintainable.

Do not overengineer this.

Before implementing anything that requires a specific Meta credential I have not provided yet, create the integration with a secure placeholder and tell me exactly which value I will need to add later.

At the end, give me a clear status report with:

what is already implemented

which Lovable Secrets I need to add

the webhook URL I need to enter in Meta

the webhook verify token setup

anything I still need to configure in Meta Business / Meta Developers

exactly how to test the bot end-to-end

This project was built with [Lovable](https://lovable.dev).

**Live app**: https://english-angel-bot.lovable.app

## Build with Lovable

Continue developing this project in the [Lovable editor](https://lovable.dev/projects/1c65eb91-ae75-4547-87dd-1f1ea658a864).

- **Ship faster**: describe what you want to build and Lovable handles the code.
- **Stay in sync**: every change made in Lovable is committed straight to this repository.
- **Full ownership**: this code is yours. Push to `main` on GitHub and your changes sync back into Lovable, ready for your next prompt.

## Development

Prefer working locally? You need Node.js and npm — [install with nvm](https://github.com/nvm-sh/nvm#installing-and-updating).

```sh
git clone <this-repository-url>
cd <repository-name>
npm i
npm run dev
```
