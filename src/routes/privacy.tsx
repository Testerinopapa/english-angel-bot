import { createFileRoute, Link } from "@tanstack/react-router";
import { ArrowLeft, ShieldCheck, Lock, Eye, MessageSquare, CheckCircle2, Mail, Users } from "lucide-react";

export const Route = createFileRoute("/privacy")({
  head: () => ({
    meta: [
      { title: "Privacy Policy — Talk'n'Bit" },
      {
        name: "description",
        content:
          "Privacy Policy for Talk'n'Bit: how your WhatsApp data, messages, and privacy are protected with end-to-end transport encryption and strict zero-selling policies.",
      },
      { property: "og:title", content: "Privacy Policy — Talk'n'Bit" },
      {
        property: "og:description",
        content:
          "Learn how Talk'n'Bit protects your WhatsApp messages, grammar logs, and personal privacy.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: PrivacyPage,
});

function PrivacyPage() {
  const contactEmail = "support@talknbit.com";

  return (
    <div className="min-h-screen bg-[#fbf9fe] text-[#1f0a44] font-sans antialiased selection:bg-[#fec84d] selection:text-[#1f0a44] relative">
      {/* Top ambient glow */}
      <div className="fixed inset-0 bg-[radial-gradient(ellipse_80%_45%_at_50%_-15%,rgba(120,60,200,0.06),transparent)] pointer-events-none" />

      {/* Header */}
      <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-purple-100/80 shadow-xs">
        <div className="max-w-4xl mx-auto px-6 h-18 flex items-center justify-between">
          <Link to="/" className="flex items-center gap-2 group">
            <img
              src="/images/logo.png"
              alt="Talk 'n' bit"
              className="h-10 w-auto object-contain transition-transform group-hover:scale-105"
            />
          </Link>

          <div className="flex items-center gap-3">
            <Link
              to="/terms"
              className="text-xs font-semibold text-purple-900/70 hover:text-purple-950 transition-colors hidden sm:inline"
            >
              Terms of Service
            </Link>
            <Link
              to="/"
              className="inline-flex items-center gap-1.5 rounded-full border border-purple-900/15 bg-purple-50/70 px-4 py-1.5 text-xs font-semibold text-[#1e0a45] transition-all hover:bg-purple-100 hover:border-purple-900/30"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              <span>Back to Home</span>
            </Link>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-4xl mx-auto px-6 py-12">
        <div className="rounded-3xl border border-purple-100/90 bg-white p-8 md:p-12 shadow-xl shadow-purple-950/5 space-y-8">
          {/* Title Header */}
          <div className="border-b border-purple-50 pb-8">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-purple-50 border border-purple-200 text-xs font-bold text-purple-900 mb-3">
              <ShieldCheck className="w-3.5 h-3.5 text-purple-700" />
              <span>Data Protection & Confidentiality</span>
            </div>
            <h1 className="text-3xl md:text-4xl font-black text-[#1e0a45] tracking-tight">
              Privacy Policy
            </h1>
            <p className="mt-2 text-sm text-slate-500">
              Talk'n'Bit — Last updated: September 11, 2026
            </p>

            {/* Privacy Commitments */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mt-6">
              <div className="rounded-2xl border border-purple-100 bg-purple-50/50 p-4">
                <div className="flex items-center gap-2 text-purple-900 font-bold text-xs">
                  <Lock className="w-4 h-4 text-purple-700" />
                  <span>Never Sold or Shared</span>
                </div>
                <p className="text-xs text-slate-600 mt-1 leading-relaxed">
                  Your phone number and messages are never sold to advertisers or third parties.
                </p>
              </div>

              <div className="rounded-2xl border border-emerald-100 bg-emerald-50/40 p-4">
                <div className="flex items-center gap-2 text-emerald-950 font-bold text-xs">
                  <Eye className="w-4 h-4 text-emerald-700" />
                  <span>Masked Logs</span>
                </div>
                <p className="text-xs text-slate-600 mt-1 leading-relaxed">
                  Administrative monitors mask sender phone identifiers (e.g. 55•••••1234) for privacy.
                </p>
              </div>

              <div className="rounded-2xl border border-amber-100 bg-amber-50/50 p-4">
                <div className="flex items-center gap-2 text-amber-950 font-bold text-xs">
                  <Users className="w-4 h-4 text-amber-700" />
                  <span>Secret-Watcher Rooms</span>
                </div>
                <p className="text-xs text-slate-600 mt-1 leading-relaxed">
                  Study partners never see your grammar corrections. Bot whispers to you privately.
                </p>
              </div>
            </div>
          </div>

          {/* Section 1 */}
          <section className="space-y-3">
            <h2 className="text-lg font-bold text-[#1e0a45] flex items-center gap-2">
              <span className="w-6 h-6 rounded-full bg-purple-100 text-purple-900 text-xs font-extrabold flex items-center justify-center">
                1
              </span>
              Overview
            </h2>
            <p className="text-sm leading-relaxed text-slate-600">
              This Privacy Policy explains how <strong>Talk'n'Bit</strong> collects, uses, stores, and protects information when you interact with our WhatsApp English learning service and website. We respect your privacy and adhere to applicable data protection regulations including the Brazilian General Data Protection Law (LGPD - Lei Geral de Proteção de Dados, Lei nº 13.709/2018) and the General Data Protection Regulation (GDPR).
            </p>
          </section>

          {/* Section 2 */}
          <section className="space-y-3">
            <h2 className="text-lg font-bold text-[#1e0a45] flex items-center gap-2">
              <span className="w-6 h-6 rounded-full bg-purple-100 text-purple-900 text-xs font-extrabold flex items-center justify-center">
                2
              </span>
              Information We Collect
            </h2>
            <p className="text-sm leading-relaxed text-slate-600">
              When you message Talk'n'Bit on WhatsApp or subscribe on our website, we process only the minimum information necessary to deliver English corrections:
            </p>
            <ul className="list-disc pl-6 space-y-1.5 text-sm text-slate-600">
              <li><strong>WhatsApp Phone Identifier:</strong> Used to manage your subscription status, trial message counter, and deliver correction replies back to your chat.</li>
              <li><strong>Message Text:</strong> The English or translation prompt you submit so the AI can detect mistakes and generate friendly corrections.</li>
              <li><strong>Technical Metadata:</strong> WhatsApp message IDs and timestamps to prevent duplicate message processing.</li>
            </ul>
            <p className="text-sm text-slate-600">
              We do <strong>not</strong> collect your profile photos, WhatsApp status, contact lists, or audio recordings unless explicitly submitted by you for pronunciation evaluation.
            </p>
          </section>

          {/* Section 3 */}
          <section className="space-y-3">
            <h2 className="text-lg font-bold text-[#1e0a45] flex items-center gap-2">
              <span className="w-6 h-6 rounded-full bg-purple-100 text-purple-900 text-xs font-extrabold flex items-center justify-center">
                3
              </span>
              How We Use Your Information
            </h2>
            <p className="text-sm leading-relaxed text-slate-600">
              Your data is used strictly for instructional and operational purposes:
            </p>
            <ul className="list-disc pl-6 space-y-1.5 text-sm text-slate-600">
              <li>To evaluate English grammar, spelling, and phrasing in real time and return helpful replies.</li>
              <li>To power the <em>[Why? 💡]</em> interactive breakdown feature explaining specific grammar rules.</li>
              <li>To safely relay chat messages between paired partners in Study Buddy practice rooms.</li>
              <li>To verify subscription status and enforce trial limits.</li>
              <li>To monitor system performance, prevent spam, and resolve technical errors.</li>
            </ul>
          </section>

          {/* Section 4 */}
          <section className="space-y-3">
            <h2 className="text-lg font-bold text-[#1e0a45] flex items-center gap-2">
              <span className="w-6 h-6 rounded-full bg-purple-100 text-purple-900 text-xs font-extrabold flex items-center justify-center">
                4
              </span>
              Study Buddy Rooms & Partner Privacy
            </h2>
            <p className="text-sm leading-relaxed text-slate-600">
              In our Study Buddy practice rooms (accessed via <code>/join &lt;code&gt;</code>), Talk'n'Bit forwards your English conversation to your connected partner so you can chat naturally. <strong>Your corrections and grammar explanations are strictly confidential</strong>: Talk'n'Bit whispers them exclusively to your private DM. Your partner never sees your mistakes or corrections.
            </p>
          </section>

          {/* Section 5 */}
          <section className="space-y-3">
            <h2 className="text-lg font-bold text-[#1e0a45] flex items-center gap-2">
              <span className="w-6 h-6 rounded-full bg-purple-100 text-purple-900 text-xs font-extrabold flex items-center justify-center">
                5
              </span>
              Data Processors & Third Parties
            </h2>
            <p className="text-sm leading-relaxed text-slate-600">
              To operate Talk'n'Bit, message text and identifiers are processed through secure enterprise providers under strict confidentiality agreements:
            </p>
            <ul className="list-disc pl-6 space-y-1.5 text-sm text-slate-600">
              <li><strong>Meta Platforms (WhatsApp Cloud API):</strong> Used for secure delivery of incoming and outgoing WhatsApp messages.</li>
              <li><strong>AI Processing Providers (Anthropic / OpenRouter):</strong> Processes message text solely to evaluate grammar and craft corrections. Data sent to these APIs is not used to train public foundational AI models.</li>
              <li><strong>Database & Infrastructure Providers:</strong> Encrypted databases hosted on secure cloud infrastructure with strict Row-Level Security (RLS).</li>
            </ul>
          </section>

          {/* Section 6 */}
          <section className="space-y-3">
            <h2 className="text-lg font-bold text-[#1e0a45] flex items-center gap-2">
              <span className="w-6 h-6 rounded-full bg-purple-100 text-purple-900 text-xs font-extrabold flex items-center justify-center">
                6
              </span>
              Data Retention & Security
            </h2>
            <p className="text-sm leading-relaxed text-slate-600">
              We employ HTTPS/TLS encryption for all webhook payloads and database connections. Access to admin dashboards requires authenticated credentials. Message logs are retained only as long as necessary to maintain service continuity and subscriber entitlements.
            </p>
          </section>

          {/* Section 7 */}
          <section className="space-y-3">
            <h2 className="text-lg font-bold text-[#1e0a45] flex items-center gap-2">
              <span className="w-6 h-6 rounded-full bg-purple-100 text-purple-900 text-xs font-extrabold flex items-center justify-center">
                7
              </span>
              Your Rights (LGPD & GDPR)
            </h2>
            <p className="text-sm leading-relaxed text-slate-600">
              You have the right at any time to:
            </p>
            <ul className="list-disc pl-6 space-y-1.5 text-sm text-slate-600">
              <li>Request confirmation and access to personal data processed by Talk'n'Bit.</li>
              <li>Request anonymization, blocking, or permanent deletion of your phone number and message history.</li>
              <li>Revoke your consent for future communication by simply texting <em>STOP</em> or contacting our support team.</li>
            </ul>
          </section>

          {/* Section 8 */}
          <section className="space-y-3 border-t border-purple-50 pt-6">
            <h2 className="text-lg font-bold text-[#1e0a45] flex items-center gap-2">
              <span className="w-6 h-6 rounded-full bg-purple-100 text-purple-900 text-xs font-extrabold flex items-center justify-center">
                8
              </span>
              Contact & Data Protection Officer
            </h2>
            <p className="text-sm leading-relaxed text-slate-600">
              For any privacy inquiries, data deletion requests, or questions regarding our compliance with LGPD/GDPR, please contact our team:
            </p>
            <div className="mt-2 rounded-2xl bg-purple-50/60 border border-purple-100 p-4 text-xs space-y-1">
              <p className="font-bold text-purple-950">Talk'n'Bit Privacy & Compliance</p>
              <p className="text-slate-600 flex items-center gap-1.5">
                <Mail className="w-3.5 h-3.5 text-purple-700" />
                <a href={`mailto:${contactEmail}`} className="text-purple-700 font-semibold underline">
                  {contactEmail}
                </a>
              </p>
              <p className="text-slate-600">WhatsApp: +55 (13) 99187-8104</p>
            </div>
          </section>
        </div>

        {/* Bottom Footer Navigation */}
        <div className="mt-8 text-center text-xs text-slate-500 space-y-2">
          <div className="flex items-center justify-center gap-4">
            <Link to="/" className="hover:text-purple-900 underline">
              Home
            </Link>
            <span>•</span>
            <Link to="/terms" className="hover:text-purple-900 underline">
              Terms of Service
            </Link>
            <span>•</span>
            <Link to="/admin" className="hover:text-purple-900 underline">
              Admin Portal
            </Link>
          </div>
          <p>© {new Date().getFullYear()} Talk'n'Bit. All rights reserved.</p>
        </div>
      </main>
    </div>
  );
}
