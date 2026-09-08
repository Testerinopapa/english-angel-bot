import { createFileRoute, Link } from "@tanstack/react-router";

export const Route = createFileRoute("/privacy")({
  head: () => ({
    meta: [
      { title: "Privacy Policy — English Buddy Bot" },
      {
        name: "description",
        content:
          "Privacy policy for English Buddy Bot: how WhatsApp data, messages, and metadata are processed, stored, and protected.",
      },
      { property: "og:title", content: "Privacy Policy — English Buddy Bot" },
      {
        property: "og:description",
        content:
          "How English Buddy Bot processes WhatsApp data, messages, and metadata.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: PrivacyPage,
});

function PrivacyPage() {
  const contactEmail = "[operator-email@example.com]";

  return (
    <main className="mx-auto min-h-screen w-full max-w-3xl px-5 py-12">
      <div className="panel p-8 md:p-10">
        <h1 className="text-3xl font-semibold tracking-tight">Privacy Policy</h1>
        <p className="mt-2 text-sm text-muted-foreground">
          English Buddy Bot — Last updated: September 8, 2026
        </p>

        <section className="mt-8">
          <h2 className="text-lg font-semibold">1. Overview</h2>
          <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
            This Privacy Policy explains how English Buddy Bot collects, uses, stores, and protects
            information when you interact with our WhatsApp-based English assistance service. By
            sending a message to our WhatsApp number, you agree to the practices described here.
          </p>
        </section>

        <section className="mt-6">
          <h2 className="text-lg font-semibold">2. Data we collect</h2>
          <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
            When you message the bot, we process:
          </p>
          <ul className="mt-2 list-disc space-y-1 pl-5 text-sm text-muted-foreground">
            <li>Your WhatsApp phone number or user ID (masked in our logs).</li>
            <li>The text of the messages you send.</li>
            <li>Necessary message metadata, such as the WhatsApp message ID and timestamp.</li>
          </ul>
          <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
            We do not intentionally collect names, profile photos, or other WhatsApp profile
            information beyond what is required to receive and respond to your message.
          </p>
        </section>

        <section className="mt-6">
          <h2 className="text-lg font-semibold">3. How we use your data</h2>
          <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
            We use the information above to:
          </p>
          <ul className="mt-2 list-disc space-y-1 pl-5 text-sm text-muted-foreground">
            <li>Receive incoming WhatsApp messages.</li>
            <li>Provide English-language corrections and assistance.</li>
            <li>Operate, monitor, and secure the service.</li>
            <li>Prevent abuse, spam, and repeated errors.</li>
          </ul>
        </section>

        <section className="mt-6">
          <h2 className="text-lg font-semibold">4. Data sharing</h2>
          <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
            We do not sell your personal data. To operate the service, data may be processed by:
          </p>
          <ul className="mt-2 list-disc space-y-1 pl-5 text-sm text-muted-foreground">
            <li>
              <strong>Meta / WhatsApp</strong> — for message delivery through the WhatsApp Cloud
              API.
            </li>
            <li>
              <strong>AI processing providers (Anthropic / OpenRouter / OpenAI)</strong> — to
              analyze messages and generate English language corrections. Message content may be
              sent to these providers solely for processing corrections.
            </li>
            <li>
              <strong>Hosting providers</strong> — to run the service infrastructure and store logs.
            </li>
          </ul>
          <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
            We only share what is necessary for these providers to perform their functions and we
            rely on their own privacy and security commitments.
          </p>
        </section>

        <section className="mt-6">
          <h2 className="text-lg font-semibold">5. Data retention</h2>
          <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
            We keep message logs only as long as needed to operate and improve the service, diagnose
            errors, and comply with legal obligations. Logs can be configured to store only message
            IDs, masked sender information, and status, or optionally the full message content for
            debugging. You may request deletion of your data at any time (see User rights below).
          </p>
        </section>

        <section className="mt-6">
          <h2 className="text-lg font-semibold">6. Security</h2>
          <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
            We use industry-standard measures to protect data, including encrypted connections
            (HTTPS/TLS), signed webhook verification for WhatsApp events, access-controlled
            databases, and server-side processing of credentials. No API keys or access tokens are
            exposed in the client-side application.
          </p>
        </section>

        <section className="mt-6">
          <h2 className="text-lg font-semibold">7. Your rights</h2>
          <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
            You have the right to access, correct, restrict, or delete your personal data. To
            request deletion of your data, or to exercise any other right, contact the operator at
            the email below. We will respond within a reasonable timeframe.
          </p>
        </section>

        <section className="mt-6">
          <h2 className="text-lg font-semibold">8. Children</h2>
          <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
            The service is not directed at children under 13, and we do not knowingly collect
            personal data from children. If you believe a child has used the service and provided
            personal data, contact us so we can delete the information.
          </p>
        </section>

        <section className="mt-6">
          <h2 className="text-lg font-semibold">9. Changes to this policy</h2>
          <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
            We may update this Privacy Policy from time to time. The latest version will always be
            available at this URL, and the "Last updated" date at the top will reflect the most
            recent revision.
          </p>
        </section>

        <section className="mt-6">
          <h2 className="text-lg font-semibold">10. Contact</h2>
          <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
            For questions, data-deletion requests, or privacy concerns, contact the operator at:{" "}
            <a
              href={`mailto:${contactEmail.replace(/\[|\]/g, "")}`}
              className="break-all text-primary underline underline-offset-4 hover:text-primary/80"
            >
              {contactEmail}
            </a>
          </p>
          <p className="mt-4 text-sm text-muted-foreground">
            Return to{" "}
            <Link to="/" className="text-primary underline underline-offset-4 hover:text-primary/80">
              home
            </Link>
            .
          </p>
        </section>
      </div>
    </main>
  );
}
