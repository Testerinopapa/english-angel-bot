import { createFileRoute, Link } from "@tanstack/react-router";
import { ArrowLeft, ShieldCheck, CheckCircle2, FileText, Sparkles, Mail } from "lucide-react";

export const Route = createFileRoute("/terms")({
  head: () => ({
    meta: [
      { title: "Terms of Service — Talk'n'Bit" },
      {
        name: "description",
        content:
          "Terms of Service for Talk'n'Bit: subscription terms, 15-day money-back guarantee, free trial rules, and acceptable use policy.",
      },
      { property: "og:title", content: "Terms of Service — Talk'n'Bit" },
      {
        property: "og:description",
        content:
          "Terms of Service and user agreement for Talk'n'Bit AI-powered English assistant on WhatsApp.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: TermsPage,
});

function TermsPage() {
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
              to="/privacy"
              className="text-xs font-semibold text-purple-900/70 hover:text-purple-950 transition-colors hidden sm:inline"
            >
              Privacy Policy
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
              <FileText className="w-3.5 h-3.5 text-purple-700" />
              <span>Legal & Service Agreement</span>
            </div>
            <h1 className="text-3xl md:text-4xl font-black text-[#1e0a45] tracking-tight">
              Terms of Service
            </h1>
            <p className="mt-2 text-sm text-slate-500">
              Talk'n'Bit — Last updated: September 11, 2026
            </p>

            {/* Highlights Grid */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mt-6">
              <div className="rounded-2xl border border-purple-100 bg-purple-50/50 p-3 text-center">
                <p className="text-xs font-bold text-purple-950">100% WhatsApp</p>
                <p className="text-[11px] text-slate-500 mt-0.5">No extra apps needed</p>
              </div>
              <div className="rounded-2xl border border-emerald-100 bg-emerald-50/40 p-3 text-center">
                <p className="text-xs font-bold text-emerald-950">15-Day Free Trial</p>
                <p className="text-[11px] text-slate-500 mt-0.5">1 Phone • Risk-free</p>
              </div>
              <div className="rounded-2xl border border-amber-100 bg-amber-50/50 p-3 text-center">
                <p className="text-xs font-bold text-amber-950">15-Day Guarantee</p>
                <p className="text-[11px] text-slate-500 mt-0.5">100% money back</p>
              </div>
              <div className="rounded-2xl border border-blue-100 bg-blue-50/40 p-3 text-center">
                <p className="text-xs font-bold text-blue-950">Cancel Anytime</p>
                <p className="text-[11px] text-slate-500 mt-0.5">Zero long-term lock-in</p>
              </div>
            </div>
          </div>

          {/* Section 1 */}
          <section className="space-y-3">
            <h2 className="text-lg font-bold text-[#1e0a45] flex items-center gap-2">
              <span className="w-6 h-6 rounded-full bg-purple-100 text-purple-900 text-xs font-extrabold flex items-center justify-center">
                1
              </span>
              Acceptance of Terms
            </h2>
            <p className="text-sm leading-relaxed text-slate-600">
              Welcome to <strong>Talk'n'Bit</strong>. By accessing our website, subscribing to our services, or interacting with our WhatsApp bot (via phone number +55 13 99187-8104 or associated endpoints), you agree to be bound by these Terms of Service and our Privacy Policy. If you do not agree to these terms, please discontinue using the service.
            </p>
          </section>

          {/* Section 2 */}
          <section className="space-y-3">
            <h2 className="text-lg font-bold text-[#1e0a45] flex items-center gap-2">
              <span className="w-6 h-6 rounded-full bg-purple-100 text-purple-900 text-xs font-extrabold flex items-center justify-center">
                2
              </span>
              Description of Service
            </h2>
            <p className="text-sm leading-relaxed text-slate-600">
              Talk'n'Bit provides an artificial-intelligence powered English learning and immersion assistant delivered through WhatsApp. The service includes:
            </p>
            <ul className="list-disc pl-6 space-y-1.5 text-sm text-slate-600">
              <li><strong>1-on-1 Practice:</strong> Interactive English conversational practice with automated grammar and vocabulary corrections.</li>
              <li><strong>Interactive Explanations:</strong> On-demand <em>Why? 💡</em> rule explanations, contextual hints, and sentence tryouts.</li>
              <li><strong>Study Buddy Practice Rooms:</strong> Private paired chat rooms where Talk'n'Bit acts as a secret observer, relaying messages between two students while whispering private corrections to the author only.</li>
              <li><strong>Bilingual Assistance:</strong> Portuguese/Spanish to English translations and natural phrasing assistance.</li>
            </ul>
          </section>

          {/* Section 3 */}
          <section className="space-y-3">
            <h2 className="text-lg font-bold text-[#1e0a45] flex items-center gap-2">
              <span className="w-6 h-6 rounded-full bg-purple-100 text-purple-900 text-xs font-extrabold flex items-center justify-center">
                3
              </span>
              Free Trial & Entitlements
            </h2>
            <p className="text-sm leading-relaxed text-slate-600">
              Every new user can choose our <strong>15-Day Free Trial Plan</strong> during sign-up. The free trial authorizes exactly <strong>1 WhatsApp phone number</strong> to activate and chat with the bot for 15 days of full conversational practice with zero charge. No credit card is required. Each phone number is eligible for only one free trial. Once the 15-day period ends, users can subscribe to a paid plan (Monthly, Semiannual, or Yearly) to continue receiving coaching and corrections.
            </p>
          </section>

          {/* Section 4 */}
          <section className="space-y-3">
            <h2 className="text-lg font-bold text-[#1e0a45] flex items-center gap-2">
              <span className="w-6 h-6 rounded-full bg-purple-100 text-purple-900 text-xs font-extrabold flex items-center justify-center">
                4
              </span>
              Subscriptions, Billing & Renewal
            </h2>
            <p className="text-sm leading-relaxed text-slate-600">
              Talk'n'Bit offers flexible recurring subscription tiers (Monthly, Semiannual, and Yearly) and VIP access. By choosing a recurring plan:
            </p>
            <ul className="list-disc pl-6 space-y-1.5 text-sm text-slate-600">
              <li>You authorize recurring charges to your payment method at the beginning of each billing cycle until cancelled.</li>
              <li>Payments are processed securely via verified third-party payment gateways (including Pix, Stripe, or credit cards). Talk'n'Bit never stores raw credit card numbers.</li>
              <li>Subscriptions grant unlimited 1-on-1 conversation, room access, and bilingual assistance for the duration of the paid term.</li>
            </ul>
          </section>

          {/* Section 5 */}
          <section className="space-y-3">
            <h2 className="text-lg font-bold text-[#1e0a45] flex items-center gap-2">
              <span className="w-6 h-6 rounded-full bg-purple-100 text-purple-900 text-xs font-extrabold flex items-center justify-center">
                5
              </span>
              15-Day 100% Money-Back Guarantee
            </h2>
            <div className="rounded-2xl bg-amber-50/70 border border-amber-200/70 p-4 space-y-2">
              <p className="text-xs font-bold text-amber-950 flex items-center gap-1.5">
                <Sparkles className="w-4 h-4 text-amber-600" />
                Zero-Risk Guarantee
              </p>
              <p className="text-xs text-amber-900 leading-relaxed">
                If you are not completely satisfied with your English learning progress or experience within the first <strong>15 days</strong> of your initial paid subscription, contact our support team at <a href={`mailto:${contactEmail}`} className="underline font-bold">{contactEmail}</a> or via WhatsApp, and we will issue a full 100% refund—no questions asked.
              </p>
            </div>
          </section>

          {/* Section 6 */}
          <section className="space-y-3">
            <h2 className="text-lg font-bold text-[#1e0a45] flex items-center gap-2">
              <span className="w-6 h-6 rounded-full bg-purple-100 text-purple-900 text-xs font-extrabold flex items-center justify-center">
                6
              </span>
              Cancellation Policy
            </h2>
            <p className="text-sm leading-relaxed text-slate-600">
              You can cancel your subscription at any time with immediate effect for future billing cycles. You will retain full access to Talk'n'Bit features until the end of your current paid billing period. To cancel, message our WhatsApp support number or email <a href={`mailto:${contactEmail}`} className="text-purple-700 underline font-medium">{contactEmail}</a>.
            </p>
          </section>

          {/* Section 7 */}
          <section className="space-y-3">
            <h2 className="text-lg font-bold text-[#1e0a45] flex items-center gap-2">
              <span className="w-6 h-6 rounded-full bg-purple-100 text-purple-900 text-xs font-extrabold flex items-center justify-center">
                7
              </span>
              User Conduct & Acceptable Use
            </h2>
            <p className="text-sm leading-relaxed text-slate-600">
              You agree to use Talk'n'Bit solely for language learning and educational purposes. You agree not to:
            </p>
            <ul className="list-disc pl-6 space-y-1.5 text-sm text-slate-600">
              <li>Transmit any unlawful, threatening, abusive, harassing, defamatory, or obscene messages.</li>
              <li>Harass or abuse other students in shared Study Buddy practice rooms.</li>
              <li>Attempt to reverse-engineer, exploit, or spam the AI system or WhatsApp API endpoints.</li>
              <li>Use automated scripts or bots to overwhelm the service.</li>
            </ul>
            <p className="text-sm text-slate-600">
              We reserve the right to immediately terminate or block any phone number that violates these conduct guidelines without refund.
            </p>
          </section>

          {/* Section 8 */}
          <section className="space-y-3">
            <h2 className="text-lg font-bold text-[#1e0a45] flex items-center gap-2">
              <span className="w-6 h-6 rounded-full bg-purple-100 text-purple-900 text-xs font-extrabold flex items-center justify-center">
                8
              </span>
              AI Technology & Educational Disclaimer
            </h2>
            <p className="text-sm leading-relaxed text-slate-600">
              Talk'n'Bit utilizes advanced generative artificial intelligence models to assist students. While our models strive for high grammatical accuracy and natural phrasing, AI outputs may occasionally contain minor inaccuracies or stylistic preferences. Talk'n'Bit is an educational practice tool and does not guarantee specific exam scores (e.g. IELTS, TOEFL) or formal certifications.
            </p>
          </section>

          {/* Section 9 */}
          <section className="space-y-3">
            <h2 className="text-lg font-bold text-[#1e0a45] flex items-center gap-2">
              <span className="w-6 h-6 rounded-full bg-purple-100 text-purple-900 text-xs font-extrabold flex items-center justify-center">
                9
              </span>
              Intellectual Property
            </h2>
            <p className="text-sm leading-relaxed text-slate-600">
              All branding, logos, software, website designs, and instructional materials provided by Talk'n'Bit are the intellectual property of Talk'n'Bit. You retain ownership of the original text you submit for correction.
            </p>
          </section>

          {/* Section 10 */}
          <section className="space-y-3">
            <h2 className="text-lg font-bold text-[#1e0a45] flex items-center gap-2">
              <span className="w-6 h-6 rounded-full bg-purple-100 text-purple-900 text-xs font-extrabold flex items-center justify-center">
                10
              </span>
              Modifications to Terms
            </h2>
            <p className="text-sm leading-relaxed text-slate-600">
              We reserve the right to modify these Terms of Service at any time. Changes become effective immediately upon posting to this page. Your continued use of Talk'n'Bit following any changes constitutes acceptance of the new terms.
            </p>
          </section>

          {/* Section 11 */}
          <section className="space-y-3 border-t border-purple-50 pt-6">
            <h2 className="text-lg font-bold text-[#1e0a45] flex items-center gap-2">
              <span className="w-6 h-6 rounded-full bg-purple-100 text-purple-900 text-xs font-extrabold flex items-center justify-center">
                11
              </span>
              Contact & Support
            </h2>
            <p className="text-sm leading-relaxed text-slate-600">
              If you have any questions, concerns, or requests regarding these Terms of Service, please reach out to us:
            </p>
            <div className="mt-2 rounded-2xl bg-purple-50/60 border border-purple-100 p-4 text-xs space-y-1">
              <p className="font-bold text-purple-950">Talk'n'Bit Support Team</p>
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
            <Link to="/privacy" className="hover:text-purple-900 underline">
              Privacy Policy
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
