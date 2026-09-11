import { useState } from "react";
import { toast } from "sonner";
import { Link } from "@tanstack/react-router";
import { ArrowLeft, ShieldCheck } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { supabase } from "@/integrations/supabase/client";
import { lovable } from "@/integrations/lovable/index";
import { ADMIN_TRANSLATIONS, type SupportedLang } from "@/lib/admin-translations";

export function AdminAuth() {
  const [selectedLang, setSelectedLang] = useState<SupportedLang>(() => {
    if (typeof window !== "undefined") {
      const saved = localStorage.getItem("talknbit_lang") as SupportedLang;
      if (saved && (saved === "en" || saved === "pt" || saved === "es")) {
        return saved;
      }
      const browserLang = navigator.language?.toLowerCase() || "";
      if (browserLang.startsWith("pt")) return "pt";
      if (browserLang.startsWith("es")) return "es";
    }
    return "en";
  });

  const t = ADMIN_TRANSLATIONS[selectedLang] || ADMIN_TRANSLATIONS.en;

  const handleSelectLanguage = (lang: SupportedLang) => {
    setSelectedLang(lang);
    if (typeof window !== "undefined") {
      localStorage.setItem("talknbit_lang", lang);
    }
    const names = { en: "English", pt: "Português (Brasil)", es: "Español" };
    toast.success(`Language set to ${names[lang]}`);
  };

  const [mode, setMode] = useState<"signin" | "signup">("signin");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [busy, setBusy] = useState(false);

  const handleGoogleSignIn = async () => {
    setBusy(true);
    try {
      const result = await lovable.auth.signInWithOAuth("google", {
        redirect_uri: `${window.location.origin}/admin`,
      });
      if (result.redirected) return;
      if (result.error) {
        // Fallback to direct Supabase OAuth if Lovable Cloud Auth is not active
        const { error } = await supabase.auth.signInWithOAuth({
          provider: "google",
          options: {
            redirectTo: `${window.location.origin}/admin`,
          },
        });
        if (error) throw error;
        return;
      }
    } catch {
      try {
        const { error } = await supabase.auth.signInWithOAuth({
          provider: "google",
          options: {
            redirectTo: `${window.location.origin}/admin`,
          },
        });
        if (error) throw error;
      } catch (fallbackError) {
        toast.error(fallbackError instanceof Error ? fallbackError.message : "Failed to sign in with Google");
      }
    } finally {
      setBusy(false);
    }
  };

  const submit = async (event: React.FormEvent) => {
    event.preventDefault();
    setBusy(true);
    try {
      if (mode === "signin") {
        const { error } = await supabase.auth.signInWithPassword({ email, password });
        if (error) throw error;
      } else {
        const { error } = await supabase.auth.signUp({
          email,
          password,
          options: { emailRedirectTo: `${window.location.origin}/admin` },
        });
        if (error) throw error;
        toast.success("Account created. You can sign in now.");
        setMode("signin");
      }
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Something went wrong");
    } finally {
      setBusy(false);
    }
  };

  return (
    <main className="min-h-screen bg-gradient-to-b from-[#fbf9fe] via-[#f7f3fb] to-[#f0eaf7] text-[#1e0a45] flex items-center justify-center p-4 relative overflow-hidden font-sans selection:bg-[#fec84d] selection:text-[#1e0a45]">
      {/* Decorative ambient background glows matching Canva theme */}
      <div className="absolute -top-32 -left-32 w-96 h-96 bg-purple-200/40 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute -bottom-32 -right-32 w-96 h-96 bg-[#fec84d]/25 rounded-full blur-3xl pointer-events-none" />

      <div className="relative w-full max-w-md rounded-3xl border border-purple-100/90 bg-white/95 p-8 shadow-2xl shadow-purple-950/10 backdrop-blur-md">
        {/* Top bar */}
        <div className="flex items-center justify-between">
          <Link
            to="/"
            className="inline-flex items-center gap-1.5 text-xs font-semibold text-purple-900/70 hover:text-purple-950 transition-colors"
          >
            <ArrowLeft className="w-3.5 h-3.5" /> {t.auth.backToSite}
          </Link>
          <div className="flex items-center gap-2">
            {/* Language Switcher Pills */}
            <div className="flex items-center bg-purple-50/90 p-0.5 rounded-full border border-purple-200/70 text-[11px] font-bold">
              {(["en", "pt", "es"] as const).map((lang) => (
                <button
                  key={lang}
                  type="button"
                  onClick={() => handleSelectLanguage(lang)}
                  className={`px-2 py-0.5 rounded-full transition-all cursor-pointer uppercase ${
                    selectedLang === lang
                      ? "bg-[#240b4a] text-white shadow-xs"
                      : "text-purple-900/80 hover:text-purple-950"
                  }`}
                >
                  {lang}
                </button>
              ))}
            </div>
            <span className="inline-flex items-center gap-1 text-[11px] font-bold uppercase tracking-wider text-purple-900 bg-purple-100/80 px-2.5 py-1 rounded-full border border-purple-200/60">
              <ShieldCheck className="w-3.5 h-3.5 text-purple-700" /> {t.auth.adminBadge}
            </span>
          </div>
        </div>

        {/* Brand identity */}
        <div className="mt-5 text-center">
          <div className="inline-flex items-center justify-center relative">
            <img
              src="/images/logo.png"
              alt="Talk 'n' bit"
              className="h-11 w-auto object-contain mx-auto"
            />
          </div>
          <h1 className="text-2xl font-extrabold text-[#1e0a45] mt-3 tracking-tight">
            {t.auth.heading}
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            {t.auth.subheading}
          </p>
        </div>

        {/* Google OAuth Button */}
        <div className="mt-6">
          <Button
            type="button"
            variant="outline"
            className="w-full flex items-center justify-center gap-3 py-5 rounded-full border-slate-200 bg-white hover:bg-purple-50/50 hover:border-purple-200 text-slate-700 font-semibold text-xs shadow-xs transition-all hover:scale-[1.01] active:scale-[0.99]"
            onClick={handleGoogleSignIn}
            disabled={busy}
          >
            <svg className="w-4 h-4 shrink-0" viewBox="0 0 24 24">
              <path
                fill="#4285F4"
                d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
              />
              <path
                fill="#34A853"
                d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
              />
              <path
                fill="#FBBC05"
                d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
              />
              <path
                fill="#EA4335"
                d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
              />
            </svg>
            <span>{t.auth.googleBtn}</span>
          </Button>
        </div>

        {/* Separator */}
        <div className="relative my-5">
          <div className="absolute inset-0 flex items-center">
            <span className="w-full border-t border-purple-100" />
          </div>
          <div className="relative flex justify-center text-xs uppercase">
            <span className="bg-white px-3 text-slate-400 text-[11px] font-medium tracking-wider">
              {t.auth.orEmail}
            </span>
          </div>
        </div>

        {/* Email/Password form */}
        <form onSubmit={submit} className="space-y-4">
          <div className="space-y-1.5">
            <Label htmlFor="email" className="text-xs font-semibold text-slate-700">
              {t.auth.emailLabel}
            </Label>
            <Input
              id="email"
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="admin@talknbit.com"
              className="rounded-xl border-slate-200 bg-slate-50/50 text-xs px-3.5 py-2 text-[#1e0a45] focus:bg-white focus:border-purple-600 focus:ring-2 focus:ring-purple-600/15 transition-all"
            />
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="password" className="text-xs font-semibold text-slate-700">
              {t.auth.passwordLabel}
            </Label>
            <Input
              id="password"
              type="password"
              required
              minLength={8}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="rounded-xl border-slate-200 bg-slate-50/50 text-xs px-3.5 py-2 text-[#1e0a45] focus:bg-white focus:border-purple-600 focus:ring-2 focus:ring-purple-600/15 transition-all"
            />
          </div>

          <Button
            type="submit"
            className="w-full rounded-full bg-gradient-to-r from-[#240b4a] via-[#35106b] to-[#170535] py-5 text-xs font-semibold text-white shadow-md shadow-purple-950/20 hover:scale-[1.01] active:scale-[0.99] transition-all"
            disabled={busy}
          >
            {mode === "signin" ? t.auth.signInBtn : t.auth.signUpBtn}
          </Button>
        </form>

        {/* Toggle sign in / sign up */}
        <div className="mt-5 text-center">
          <button
            type="button"
            onClick={() => setMode(mode === "signin" ? "signup" : "signin")}
            className="text-xs text-purple-900/70 hover:text-purple-950 font-medium underline underline-offset-4 transition-colors cursor-pointer"
          >
            {mode === "signin"
              ? t.auth.switchToSignUp
              : t.auth.switchToSignIn}
          </button>
        </div>
      </div>
    </main>
  );
}
