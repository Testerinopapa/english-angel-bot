import { createFileRoute, Link } from "@tanstack/react-router";
import {
  Award,
  CheckCircle2,
  ExternalLink,
  Globe,
  MessageCircle,
  Sparkles,
  ArrowRight,
} from "lucide-react";
import { useState } from "react";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Talk'n'Bit — Chat in English Everyday with AI-Powered Instant Feedback" },
      {
        name: "description",
        content:
          "Find partners with similar interests and immerse yourself in English on WhatsApp with AI-powered instant grammar feedback.",
      },
      { property: "og:title", content: "Talk'n'Bit — WhatsApp English Learning & Immersion" },
      {
        property: "og:description",
        content:
          "Chat in English everyday on WhatsApp with real partners and get instant AI grammar corrections.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: LandingPage,
});

const WHATSAPP_URL =
  "https://wa.me/5513991878104?text=Hi!%20I%20want%20to%20practice%20English%20with%20Talk'n'Bit";

function LandingPage() {
  const [interactiveSentence, setInteractiveSentence] = useState("");
  const [simulatedFeedback, setSimulatedFeedback] = useState<{
    original: string;
    correction: string;
    why: string;
  } | null>(null);

  const handleSimulate = (e: React.FormEvent) => {
    e.preventDefault();
    if (!interactiveSentence.trim()) return;

    // Quick demo simulation
    const text = interactiveSentence.trim();
    if (text.toLowerCase().includes("went") || text.toLowerCase().includes("didn't went")) {
      setSimulatedFeedback({
        original: text,
        correction: text.replace(/didn't went/gi, "didn't go").replace(/went/gi, "go"),
        why: "In past simple with 'didn't', we use the base verb form ('go', not 'went').",
      });
    } else if (text.toLowerCase().includes("don't likes") || text.toLowerCase().includes("doesn't likes")) {
      setSimulatedFeedback({
        original: text,
        correction: text.replace(/don't likes/gi, "doesn't like").replace(/doesn't likes/gi, "doesn't like"),
        why: "Third-person singular takes 'doesn't' + base verb 'like'.",
      });
    } else {
      setSimulatedFeedback({
        original: text,
        correction: `Great job! Your sentence is natural: \"${text}\"`,
        why: "No grammatical mistakes found. Keep practicing!",
      });
    }
  };

  return (
    <div className="min-h-screen bg-white text-[#1f0a44] font-sans antialiased selection:bg-[#fec84d] selection:text-[#1f0a44]">
      {/* 1. Header / Navbar */}
      <header className="sticky top-0 z-50 bg-white/95 backdrop-blur-md border-b border-purple-50/80">
        <div className="max-w-6xl mx-auto px-6 h-20 flex items-center justify-between">
          <Link to="/" className="flex items-center gap-2 group">
            <img
              src="/images/logo.png"
              alt="Talk 'n' bit"
              className="h-11 w-auto object-contain transition-transform group-hover:scale-105"
            />
          </Link>

          <nav className="hidden md:flex items-center gap-8 text-sm font-medium text-[#2d1257]">
            <a href="#how-it-works" className="hover:text-purple-600 transition-colors">
              blog
            </a>
            <a href="#plans" className="hover:text-purple-600 transition-colors">
              plans
            </a>
            <a href="#practice" className="hover:text-purple-600 transition-colors">
              practice
            </a>
            <a href="#contact" className="hover:text-purple-600 transition-colors">
              contact
            </a>
          </nav>

          <div className="flex items-center gap-3">
            <a
              href={WHATSAPP_URL}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 rounded-full bg-gradient-to-r from-[#240b4a] to-[#170535] px-5 py-2.5 text-xs font-semibold text-white shadow-md shadow-purple-950/20 transition-all hover:scale-105 hover:shadow-purple-900/40"
            >
              <MessageCircle className="w-4 h-4 text-[#25D366]" />
              <span>Chat on WhatsApp</span>
            </a>
          </div>
        </div>
      </header>

      {/* 2. Hero Section */}
      <section id="practice" className="pt-12 pb-20 px-6 max-w-6xl mx-auto">
        <div className="grid lg:grid-cols-12 gap-12 items-center">
          {/* Hero Left */}
          <div className="lg:col-span-7 space-y-6 text-left">
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold tracking-tight text-[#1e0a45] leading-[1.12]">
              Chat in English <br />
              everyday with <br />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#2a0b5a] via-[#521b96] to-[#2a0b5a]">
                AI-powered <br />
                instant feedback
              </span>
            </h1>

            <p className="text-base sm:text-lg text-slate-600 max-w-lg font-normal leading-relaxed">
              Find partners with similar interests and immerse yourself in English
            </p>

            <div className="pt-2 flex flex-wrap items-center gap-4">
              <a
                href={WHATSAPP_URL}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center justify-center rounded-full bg-gradient-to-r from-[#240b4a] via-[#35106b] to-[#170535] px-8 py-3.5 text-sm font-semibold text-white shadow-lg shadow-purple-950/25 transition-all hover:scale-105 hover:shadow-purple-900/40"
              >
                Get Started
              </a>
              <a
                href="#how-it-works"
                className="inline-flex items-center gap-1.5 px-5 py-3 text-sm font-medium text-purple-900 hover:text-purple-600 transition-colors"
              >
                See how it works <ArrowRight className="w-4 h-4" />
              </a>
            </div>
          </div>

          {/* Hero Right: Phone Mockup */}
          <div className="lg:col-span-5 flex justify-center">
            <div className="relative w-full max-w-[320px] aspect-[9/17] rounded-[42px] border-[7px] border-[#220c4e] bg-slate-50 shadow-2xl p-4 flex flex-col justify-between overflow-hidden">
              {/* Phone background diagonal grid */}
              <div
                className="absolute inset-0 opacity-[0.07] pointer-events-none"
                style={{
                  backgroundImage:
                    "linear-gradient(45deg, #1f0a44 25%, transparent 25%), linear-gradient(-45deg, #1f0a44 25%, transparent 25%), linear-gradient(45deg, transparent 75%, #1f0a44 75%), linear-gradient(-45deg, transparent 75%, #1f0a44 75%)",
                  backgroundSize: "24px 24px",
                }}
              />

              {/* Phone speaker notch */}
              <div className="mx-auto w-24 h-4 bg-[#220c4e] rounded-b-xl flex items-center justify-center gap-2 z-10">
                <div className="w-10 h-1 bg-slate-600 rounded-full" />
                <div className="w-2 h-2 bg-slate-700 rounded-full" />
              </div>

              {/* Chat messages */}
              <div className="relative z-10 space-y-6 my-auto py-4">
                {/* User message */}
                <div className="flex items-end justify-end gap-2">
                  <div className="bg-[#dcf8c6] text-[#0f2c14] text-xs px-3.5 py-2.5 rounded-2xl rounded-tr-none shadow-sm max-w-[200px] leading-snug">
                    I didn't went to the party yesterday.
                  </div>
                  <img
                    src="/images/student_guy.png"
                    alt="Student"
                    className="w-8 h-8 rounded-full border border-purple-900/20 object-cover shadow-sm shrink-0"
                  />
                </div>

                {/* Bot correction message */}
                <div className="flex items-start gap-2">
                  <img
                    src="/images/robot.png"
                    alt="Talk'n'Bit Robot"
                    className="w-8 h-8 rounded-full object-contain shrink-0 mt-1 drop-shadow"
                  />
                  <div className="bg-[#fef9eb] border border-amber-200/60 text-[#1e0a45] text-xs px-3.5 py-2.5 rounded-2xl rounded-tl-none shadow-sm max-w-[210px] leading-snug">
                    <p className="font-medium text-slate-800">
                      You meant: <span className="text-purple-900 font-bold">"I didn't go to the party yesterday."</span>
                    </p>
                    <div className="mt-2 pt-1 border-t border-amber-200/50 flex items-center justify-between text-[10px]">
                      <span className="font-semibold text-purple-700 bg-purple-100 px-2 py-0.5 rounded-full">
                        Why? 💡
                      </span>
                      <span className="text-slate-400">Instant AI</span>
                    </div>
                  </div>
                </div>

                {/* Interactive preview bubble if user tested */}
                {simulatedFeedback && (
                  <div className="bg-purple-50 border border-purple-200 text-[#1f0a44] text-[11px] p-2.5 rounded-xl animate-in fade-in slide-in-from-bottom-2">
                    <p className="font-semibold text-purple-900">Result:</p>
                    <p className="text-slate-700 mt-0.5">{simulatedFeedback.correction}</p>
                    <p className="text-slate-500 text-[10px] mt-1">💡 {simulatedFeedback.why}</p>
                  </div>
                )}
              </div>

              {/* Bottom interactive test input */}
              <form onSubmit={handleSimulate} className="relative z-10 flex items-center gap-1.5 pt-2">
                <input
                  type="text"
                  placeholder="Test sentence..."
                  value={interactiveSentence}
                  onChange={(e) => setInteractiveSentence(e.target.value)}
                  className="w-full text-xs px-3 py-2 bg-white rounded-full border border-slate-200 focus:outline-none focus:border-purple-600 shadow-inner"
                />
                <button
                  type="submit"
                  className="bg-[#240b4a] text-white p-2 rounded-full hover:bg-purple-800 shrink-0 shadow-sm"
                  title="Test"
                >
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </form>
            </div>
          </div>
        </div>
      </section>

      {/* 3. Section: Experience English Immersion */}
      <section className="py-20 px-6 max-w-6xl mx-auto">
        <div className="grid lg:grid-cols-12 gap-12 items-center">
          {/* Left: Woman Image with Yellow Star */}
          <div className="lg:col-span-6 flex justify-center">
            <div className="relative max-w-md w-full">
              <img
                src="/images/woman.png"
                alt="Experience English Immersion"
                className="w-full h-auto object-contain drop-shadow-xl"
              />
            </div>
          </div>

          {/* Right: Content */}
          <div className="lg:col-span-6 space-y-8 text-left">
            <h2 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-[#1e0a45]">
              Experience English <br />
              Immersion
            </h2>

            <div className="space-y-4">
              <div className="flex items-center gap-3">
                <span className="text-[#fec84d] text-2xl leading-none">✨</span>
                <span className="text-base sm:text-lg font-medium text-slate-800">
                  No expensive costs
                </span>
              </div>
              <div className="flex items-center gap-3">
                <span className="text-[#fec84d] text-2xl leading-none">✨</span>
                <span className="text-base sm:text-lg font-medium text-slate-800">
                  No extra apps needed
                </span>
              </div>
              <div className="flex items-center gap-3">
                <span className="text-[#fec84d] text-2xl leading-none">✨</span>
                <span className="text-base sm:text-lg font-medium text-slate-800">
                  Real time feedback from AI
                </span>
              </div>
            </div>

            <div>
              <a
                href={WHATSAPP_URL}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center justify-center rounded-full bg-gradient-to-r from-[#240b4a] to-[#170535] px-8 py-3.5 text-sm font-semibold text-white shadow-lg shadow-purple-950/25 transition-all hover:scale-105 hover:shadow-purple-900/40"
              >
                Get Started
              </a>
            </div>
          </div>
        </div>
      </section>

      {/* 4. Section: Unlock Vocabulary */}
      <section className="py-20 px-6 max-w-6xl mx-auto">
        <div className="grid lg:grid-cols-12 gap-12 items-center">
          {/* Left: Copy */}
          <div className="lg:col-span-6 space-y-6 text-left">
            <h2 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-[#1e0a45]">
              Unlock <br />
              Vocabulary
            </h2>

            <p className="text-base sm:text-lg font-bold text-[#240b4a]">
              Don't know how to say it?
            </p>

            <p className="text-slate-600 leading-relaxed text-base">
              No more flipping through dictionaries. Our AI shows you instantly. Because when you
              learn in context, it just clicks.
            </p>

            <div className="pt-2">
              <a
                href={WHATSAPP_URL}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center justify-center rounded-full bg-gradient-to-r from-[#240b4a] to-[#170535] px-8 py-3.5 text-sm font-semibold text-white shadow-lg shadow-purple-950/25 transition-all hover:scale-105 hover:shadow-purple-900/40"
              >
                Get Started
              </a>
            </div>
          </div>

          {/* Right: Phone Mockup with Portuguese translation */}
          <div className="lg:col-span-6 flex justify-center">
            <div className="relative w-full max-w-[320px] aspect-[9/17] rounded-[42px] border-[7px] border-[#220c4e] bg-slate-50 shadow-2xl p-4 flex flex-col justify-between overflow-hidden">
              <div
                className="absolute inset-0 opacity-[0.07] pointer-events-none"
                style={{
                  backgroundImage:
                    "linear-gradient(45deg, #1f0a44 25%, transparent 25%), linear-gradient(-45deg, #1f0a44 25%, transparent 25%), linear-gradient(45deg, transparent 75%, #1f0a44 75%), linear-gradient(-45deg, transparent 75%, #1f0a44 75%)",
                  backgroundSize: "24px 24px",
                }}
              />

              <div className="mx-auto w-24 h-4 bg-[#220c4e] rounded-b-xl flex items-center justify-center gap-2 z-10">
                <div className="w-10 h-1 bg-slate-600 rounded-full" />
                <div className="w-2 h-2 bg-slate-700 rounded-full" />
              </div>

              <div className="relative z-10 space-y-6 my-auto py-4">
                {/* User sends Portuguese mix */}
                <div className="flex items-end justify-end gap-2">
                  <div className="bg-[#dcf8c6] text-[#0f2c14] text-xs px-3.5 py-2.5 rounded-2xl rounded-tr-none shadow-sm max-w-[200px] leading-snug">
                    I need to revisar meu currículo.
                  </div>
                  <img
                    src="/images/student_woman.png"
                    alt="Student"
                    className="w-8 h-8 rounded-full border border-purple-900/20 object-cover shadow-sm shrink-0"
                  />
                </div>

                {/* Bot context correction */}
                <div className="flex items-start gap-2">
                  <img
                    src="/images/robot.png"
                    alt="Talk'n'Bit Robot"
                    className="w-8 h-8 rounded-full object-contain shrink-0 mt-1 drop-shadow"
                  />
                  <div className="bg-[#fef9eb] border border-amber-200/60 text-[#1e0a45] text-xs px-3.5 py-2.5 rounded-2xl rounded-tl-none shadow-sm max-w-[210px] leading-snug">
                    <p className="font-medium text-slate-800">
                      You meant: <span className="text-purple-900 font-bold">"I need to review my resumé."</span>
                    </p>
                    <div className="mt-2 pt-1 border-t border-amber-200/50 flex items-center justify-between text-[10px]">
                      <span className="font-semibold text-purple-700 bg-purple-100 px-2 py-0.5 rounded-full">
                        Why? 💡
                      </span>
                      <span className="text-slate-400">Context AI</span>
                    </div>
                  </div>
                </div>
              </div>

              <div className="relative z-10 text-center py-2 text-xs text-slate-400 font-medium">
                Talk'n'Bit Instant Correction
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 5. Transition Banner 1 */}
      <section className="py-24 px-6 text-center bg-purple-50/50">
        <div className="max-w-4xl mx-auto space-y-1">
          <h3 className="text-3xl sm:text-5xl font-extrabold tracking-tight text-[#1e0a45] leading-tight">
            Connect. <br />
            Chat. <br />
            Learn English. <br />
            All at your fingertips.
          </h3>
        </div>
      </section>

      {/* 6. Section: How It Works */}
      <section id="how-it-works" className="py-20 px-6 max-w-6xl mx-auto">
        <div className="grid lg:grid-cols-12 gap-12 items-center">
          {/* Left: Copy */}
          <div className="lg:col-span-6 space-y-8 text-left">
            <h2 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-[#1e0a45]">
              How it works
            </h2>

            <div className="space-y-4">
              <div className="flex items-center gap-3">
                <span className="text-[#fec84d] text-2xl leading-none">✨</span>
                <span className="text-base sm:text-lg font-medium text-slate-800">
                  Chat in groups or with your language partner
                </span>
              </div>
              <div className="flex items-center gap-3">
                <span className="text-[#fec84d] text-2xl leading-none">✨</span>
                <span className="text-base sm:text-lg font-medium text-slate-800">
                  Receive correction
                </span>
              </div>
              <div className="flex items-center gap-3">
                <span className="text-[#fec84d] text-2xl leading-none">✨</span>
                <span className="text-base sm:text-lg font-medium text-slate-800">
                  Improve
                </span>
              </div>
            </div>

            <div>
              <a
                href={WHATSAPP_URL}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center justify-center rounded-full bg-gradient-to-r from-[#240b4a] to-[#170535] px-8 py-3.5 text-sm font-semibold text-white shadow-lg shadow-purple-950/25 transition-all hover:scale-105 hover:shadow-purple-900/40"
              >
                Get Started
              </a>
            </div>
          </div>

          {/* Right: Man with Yellow Star Image */}
          <div className="lg:col-span-6 flex justify-center">
            <div className="relative max-w-md w-full">
              <img
                src="/images/man.png"
                alt="How it works"
                className="w-full h-auto object-contain drop-shadow-xl"
              />
            </div>
          </div>
        </div>
      </section>

      {/* 7. Section: Why It Works */}
      <section className="py-20 px-6 max-w-6xl mx-auto text-center">
        <div className="max-w-3xl mx-auto space-y-4">
          <h2 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-[#1e0a45]">
            Why it works
          </h2>
          <p className="text-slate-600 text-sm sm:text-base leading-relaxed">
            Learning English through conversation and instant feedback isn't just convenient. Our
            methodologies are scientifically proven to be effective. Here's why our method delivers real results:
          </p>
        </div>

        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6 mt-14 text-left">
          {/* Card 1 */}
          <div className="bg-[#fef9eb] border border-amber-200/50 rounded-2xl p-6 space-y-3 shadow-sm hover:shadow-md transition-shadow">
            <h4 className="font-bold text-[#1f0a44] text-base leading-snug">
              Mistakes accelerate learning
            </h4>
            <p className="text-xs sm:text-sm text-slate-700 leading-relaxed">
              Studies show that making errors and receiving feedback right after strengthens memory and understanding.
            </p>
          </div>

          {/* Card 2 */}
          <div className="bg-[#fef9eb] border border-amber-200/50 rounded-2xl p-6 space-y-3 shadow-sm hover:shadow-md transition-shadow">
            <h4 className="font-bold text-[#1f0a44] text-base leading-snug">
              Immediate feedback means deeper learning
            </h4>
            <p className="text-xs sm:text-sm text-slate-700 leading-relaxed">
              Your brain learns best when it gets corrections in the moment. That's why our system sends feedback instantly via WhatsApp.
            </p>
          </div>

          {/* Card 3 */}
          <div className="bg-[#fef9eb] border border-amber-200/50 rounded-2xl p-6 space-y-3 shadow-sm hover:shadow-md transition-shadow">
            <h4 className="font-bold text-[#1f0a44] text-base leading-snug">
              Daily, bite-sized practice beats long study sessions
            </h4>
            <p className="text-xs sm:text-sm text-slate-700 leading-relaxed">
              Practicing a little every day is more effective than cramming. Our WhatsApp-based model fits naturally into your routine.
            </p>
          </div>

          {/* Card 4 */}
          <div className="bg-[#fef9eb] border border-amber-200/50 rounded-2xl p-6 space-y-3 shadow-sm hover:shadow-md transition-shadow">
            <h4 className="font-bold text-[#1f0a44] text-base leading-snug">
              Personalized, autonomous learning
            </h4>
            <p className="text-xs sm:text-sm text-slate-700 leading-relaxed">
              You're in control. Our AI gives feedback tailored to your messages, at your pace, boosting confidence and motivation.
            </p>
          </div>
        </div>
      </section>

      {/* 8. Transition Banner 2 */}
      <section className="py-24 px-6 text-center bg-purple-50/50">
        <div className="max-w-4xl mx-auto">
          <h3 className="text-3xl sm:text-5xl font-extrabold tracking-tight text-[#1e0a45] leading-tight">
            Real conversations. <br />
            Real English. <br />
            Real progress.
          </h3>
        </div>
      </section>

      {/* 9. Section: Plans (Deep Violet Gradient) */}
      <section id="plans" className="py-24 px-6 bg-gradient-to-b from-[#0b0324] via-[#1b084b] to-[#0f042e] text-white text-center">
        <div className="max-w-6xl mx-auto space-y-12">
          <div>
            <h2 className="text-3xl sm:text-5xl font-extrabold tracking-tight text-white">
              Plans
            </h2>
          </div>

          {/* 3 Pricing Cards */}
          <div className="grid md:grid-cols-3 gap-8 max-w-5xl mx-auto items-stretch">
            {/* Monthly */}
            <div className="bg-white text-[#1f0a44] rounded-3xl p-8 flex flex-col justify-between shadow-2xl border border-white/20 transition-transform hover:-translate-y-1">
              <div>
                <h4 className="text-sm font-semibold text-slate-600">Monthly plan</h4>
                <div className="mt-4">
                  <span className="text-4xl sm:text-5xl font-extrabold tracking-tight text-[#1f0a44]">
                    BRL 36
                  </span>
                  <span className="block text-xs text-slate-500 font-medium mt-1">per month</span>
                </div>
                <div className="mt-4 text-xs text-slate-600 space-y-0.5 font-medium">
                  <p>Paid monthly.</p>
                  <p>Total annual cost: BRL 432</p>
                </div>
              </div>
              <div className="mt-8 pt-6 border-t border-slate-100">
                <a
                  href={WHATSAPP_URL}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="block w-full py-3 rounded-full text-xs font-bold uppercase tracking-wider bg-slate-100 text-[#1f0a44] hover:bg-slate-200 transition-colors"
                >
                  Get Monthly
                </a>
              </div>
            </div>

            {/* Semiannual */}
            <div className="bg-white text-[#1f0a44] rounded-3xl p-8 flex flex-col justify-between shadow-2xl border border-white/20 transition-transform hover:-translate-y-1">
              <div>
                <h4 className="text-sm font-semibold text-slate-600">Semiannual plan</h4>
                <div className="mt-4">
                  <span className="text-4xl sm:text-5xl font-extrabold tracking-tight text-[#1f0a44]">
                    BRL 29
                  </span>
                  <span className="block text-xs text-slate-500 font-medium mt-1">per month</span>
                </div>
                <div className="mt-4 text-xs text-slate-600 space-y-0.5 font-medium">
                  <p>Paid semiannually.</p>
                  <p>Total annual cost: BRL 348</p>
                </div>
                <div className="mt-3">
                  <span className="inline-block text-xs font-bold text-emerald-600 bg-emerald-50 px-2.5 py-1 rounded-full">
                    Save R$84 (20%)
                  </span>
                </div>
              </div>
              <div className="mt-8 pt-6 border-t border-slate-100">
                <a
                  href={WHATSAPP_URL}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="block w-full py-3 rounded-full text-xs font-bold uppercase tracking-wider bg-slate-100 text-[#1f0a44] hover:bg-slate-200 transition-colors"
                >
                  Get Semiannual
                </a>
              </div>
            </div>

            {/* Yearly (Highlighted in Green) */}
            <div className="bg-white text-[#1f0a44] rounded-3xl p-8 flex flex-col justify-between shadow-2xl border-2 border-emerald-400 relative transition-transform hover:-translate-y-1">
              <div className="absolute -top-3.5 left-1/2 -translate-x-1/2 bg-emerald-500 text-white text-[10px] font-bold uppercase tracking-widest px-3 py-1 rounded-full shadow-md">
                Best Value
              </div>
              <div>
                <h4 className="text-sm font-semibold text-slate-600">Yearly plan</h4>
                <div className="mt-4">
                  <span className="text-4xl sm:text-5xl font-extrabold tracking-tight text-emerald-600">
                    BRL 21
                  </span>
                  <span className="block text-xs text-slate-500 font-medium mt-1">per month</span>
                </div>
                <div className="mt-4 text-xs text-slate-600 space-y-0.5 font-medium">
                  <p>Paid yearly.</p>
                  <p>Total annual cost: BRL 252</p>
                </div>
                <div className="mt-3">
                  <span className="inline-block text-xs font-bold text-emerald-600 bg-emerald-50 px-2.5 py-1 rounded-full">
                    Save R$180 (40%)
                  </span>
                </div>
              </div>
              <div className="mt-8 pt-6 border-t border-slate-100">
                <a
                  href={WHATSAPP_URL}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="block w-full py-3 rounded-full text-xs font-bold uppercase tracking-wider bg-[#240b4a] text-white hover:bg-purple-900 transition-colors shadow-md"
                >
                  Get Yearly
                </a>
              </div>
            </div>
          </div>

          {/* Guarantee Ribbon & Main CTA */}
          <div className="pt-6 space-y-6">
            <div className="inline-flex items-center gap-2 text-white/90 text-sm font-semibold">
              <Award className="w-5 h-5 text-[#fec84d]" />
              <span>15-day money-back guarantee</span>
            </div>

            <div>
              <a
                href={WHATSAPP_URL}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center justify-center rounded-full bg-gradient-to-r from-[#240b4a] via-[#481885] to-[#170535] border border-white/20 px-10 py-3.5 text-sm font-semibold text-white shadow-xl shadow-purple-950/50 transition-all hover:scale-105 hover:border-white/40"
              >
                Choose a plan
              </a>
            </div>
          </div>
        </div>
      </section>

      {/* 10. Brand Footer (Warm Yellow) */}
      <footer id="contact" className="bg-[#fec84d] text-[#1f0a44] pt-16 pb-12 px-6">
        <div className="max-w-6xl mx-auto">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-10">
            {/* Col 1: Logo & Social */}
            <div className="col-span-2 md:col-span-1 space-y-4">
              <img
                src="/images/logo.png"
                alt="Talk 'n' bit"
                className="h-12 w-auto object-contain brightness-0"
              />
              <div className="flex items-center gap-3 pt-2">
                <a
                  href="/"
                  className="w-8 h-8 rounded-full border border-[#1f0a44]/30 flex items-center justify-center hover:bg-black/10 transition-colors"
                  title="Website"
                >
                  <Globe className="w-4 h-4" />
                </a>
                <a
                  href={WHATSAPP_URL}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-8 h-8 rounded-full border border-[#1f0a44]/30 flex items-center justify-center hover:bg-black/10 transition-colors"
                  title="WhatsApp"
                >
                  <MessageCircle className="w-4 h-4" />
                </a>
              </div>
            </div>

            {/* Col 2 */}
            <div className="space-y-2.5 text-xs sm:text-sm font-medium">
              <p className="cursor-pointer hover:underline">English</p>
              <p className="cursor-pointer hover:underline">Português</p>
              <p className="cursor-pointer hover:underline">Español</p>
              <a href={WHATSAPP_URL} target="_blank" rel="noopener noreferrer" className="block hover:underline">
                Free English Practice
              </a>
            </div>

            {/* Col 3 */}
            <div className="space-y-2.5 text-xs sm:text-sm font-medium">
              <a href={WHATSAPP_URL} target="_blank" rel="noopener noreferrer" className="block hover:underline">
                Book a Lesson
              </a>
              <p className="cursor-pointer hover:underline">Blog</p>
              <p className="cursor-pointer hover:underline">FAQ</p>
              <a href={WHATSAPP_URL} target="_blank" rel="noopener noreferrer" className="block hover:underline">
                One-Day Free Trial
              </a>
            </div>

            {/* Col 4 */}
            <div className="space-y-2.5 text-xs sm:text-sm font-medium">
              <Link to="/privacy" className="block hover:underline">
                Terms of Use
              </Link>
              <Link to="/privacy" className="block hover:underline">
                About
              </Link>
              <a href="mailto:support@talknbit.com" className="block hover:underline">
                Contact
              </a>
              <Link to="/admin" className="block text-purple-950/70 hover:text-purple-950 underline font-semibold">
                Admin Portal →
              </Link>
            </div>
          </div>

          {/* Copyright */}
          <div className="mt-16 pt-8 border-t border-[#1f0a44]/15 text-center text-xs text-[#1f0a44]/80 font-medium">
            Copyright © 2025 Talk'n'Bit All rights reserved.
          </div>
        </div>
      </footer>
    </div>
  );
}