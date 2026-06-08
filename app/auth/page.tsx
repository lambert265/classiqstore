"use client";

export const dynamic = "force-dynamic";

import { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { ArrowLeft, Eye, EyeOff, Mail, Lock, User, AlertCircle, CheckCircle } from "lucide-react";
import { createClient } from "@/lib/supabase/client";

type Mode = "signin" | "signup" | "forgot";

export default function AuthPage() {
  const router = useRouter();
  const supabase = createClient();

  const [mode, setMode] = useState<Mode>("signin");
  const [showPass, setShowPass] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  function reset() { setError(null); setSuccess(null); }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    reset();
    setLoading(true);

    try {
      if (mode === "forgot") {
        const { error } = await supabase.auth.resetPasswordForEmail(email, {
          redirectTo: "https://classiqstore.pxxl.click/auth/reset",
        });
        if (error) throw error;
        setSuccess("Check your email for the password reset link.");
      } else if (mode === "signup") {
        const { error } = await supabase.auth.signUp({
          email,
          password,
          options: { data: { full_name: name } },
        });
        if (error) throw error;
        setSuccess("Account created! Check your email to confirm before signing in.");
      } else {
        const { error } = await supabase.auth.signInWithPassword({ email, password });
        if (error) throw error;
        router.push("/");
        router.refresh();
      }
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  async function handleGoogle() {
    reset();
    await supabase.auth.signInWithOAuth({
      provider: "google",
      options: { redirectTo: "https://classiqstore.pxxl.click/auth/callback" },
    });
  }

  const form = (
    <div className="flex flex-col gap-6 w-full max-w-sm">
      {/* Heading */}
      <div className="flex flex-col gap-1">
        <h1 className="font-heading text-3xl text-foreground">
          {mode === "forgot" ? "Reset password" : mode === "signup" ? "Create account" : "Welcome back"}
        </h1>
        <p className="text-sm text-muted-foreground">
          {mode === "forgot"
            ? "Enter your email and we'll send a reset link."
            : mode === "signup"
            ? "Join CLASSIQ and start your edit."
            : "Sign in to your CLASSIQ account."}
        </p>
      </div>

      {/* Toggle pills — not shown on forgot */}
      {mode !== "forgot" && (
        <div className="flex gap-1 p-1 rounded-full bg-muted">
          {(["signin", "signup"] as const).map((m) => (
            <button
              key={m}
              type="button"
              onClick={() => { setMode(m); reset(); }}
              className={`flex-1 py-2 rounded-full text-[10px] uppercase tracking-[0.16em] transition-all duration-200 ${
                mode === m ? "bg-primary text-primary-foreground shadow-sm" : "text-muted-foreground hover:text-foreground"
              }`}
            >
              {m === "signin" ? "Sign in" : "Sign up"}
            </button>
          ))}
        </div>
      )}

      {/* Feedback banners */}
      {error && (
        <div className="flex items-start gap-2 text-sm text-destructive bg-destructive/10 border border-destructive/20 rounded-xl px-4 py-3">
          <AlertCircle size={15} className="shrink-0 mt-0.5" />
          <span>{error}</span>
        </div>
      )}
      {success && (
        <div className="flex items-start gap-2 text-sm text-green-700 bg-green-50 border border-green-200 rounded-xl px-4 py-3">
          <CheckCircle size={15} className="shrink-0 mt-0.5" />
          <span>{success}</span>
        </div>
      )}

      {/* Form */}
      <form className="flex flex-col gap-4" onSubmit={handleSubmit}>
        {mode === "signup" && (
          <div className="flex items-center gap-3 border border-border rounded-full px-5 py-3.5 bg-background focus-within:border-primary transition-colors">
            <User size={15} strokeWidth={1.4} className="text-muted-foreground shrink-0" />
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Full name"
              required
              className="flex-1 bg-transparent text-sm text-foreground placeholder:text-muted-foreground outline-none"
            />
          </div>
        )}

        <div className="flex items-center gap-3 border border-border rounded-full px-5 py-3.5 bg-background focus-within:border-primary transition-colors">
          <Mail size={15} strokeWidth={1.4} className="text-muted-foreground shrink-0" />
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="Email address"
            required
            className="flex-1 bg-transparent text-sm text-foreground placeholder:text-muted-foreground outline-none"
          />
        </div>

        {mode !== "forgot" && (
          <div className="flex items-center gap-3 border border-border rounded-full px-5 py-3.5 bg-background focus-within:border-primary transition-colors">
            <Lock size={15} strokeWidth={1.4} className="text-muted-foreground shrink-0" />
            <input
              type={showPass ? "text" : "password"}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Password"
              required
              minLength={6}
              className="flex-1 bg-transparent text-sm text-foreground placeholder:text-muted-foreground outline-none"
            />
            <button type="button" onClick={() => setShowPass((s) => !s)} className="text-muted-foreground hover:text-foreground transition-colors shrink-0">
              {showPass ? <EyeOff size={15} strokeWidth={1.4} /> : <Eye size={15} strokeWidth={1.4} />}
            </button>
          </div>
        )}

        {mode === "signin" && (
          <div className="text-right -mt-1">
            <button
              type="button"
              onClick={() => { setMode("forgot"); reset(); }}
              className="text-[10px] uppercase tracking-[0.16em] text-muted-foreground hover:text-primary transition-colors"
            >
              Forgot password?
            </button>
          </div>
        )}

        <button
          type="submit"
          disabled={loading}
          className="w-full py-4 rounded-full bg-primary text-primary-foreground text-[11px] uppercase tracking-[0.18em] hover:bg-accent transition-colors duration-300 mt-1 disabled:opacity-60 disabled:cursor-not-allowed"
        >
          {loading
            ? "Please wait…"
            : mode === "forgot"
            ? "Send reset link"
            : mode === "signup"
            ? "Create account"
            : "Sign in"}
        </button>
      </form>

      {mode === "forgot" && (
        <button
          type="button"
          onClick={() => { setMode("signin"); reset(); }}
          className="text-sm text-center text-muted-foreground hover:text-primary transition-colors"
        >
          ← Back to sign in
        </button>
      )}

      {mode !== "forgot" && (
        <>
          <div className="flex items-center gap-3">
            <div className="flex-1 h-px bg-border" />
            <span className="text-[10px] uppercase tracking-[0.16em] text-muted-foreground">or</span>
            <div className="flex-1 h-px bg-border" />
          </div>

          <button
            type="button"
            onClick={handleGoogle}
            className="w-full py-3.5 rounded-full border border-border text-sm text-foreground hover:border-primary hover:text-primary transition-colors duration-200"
          >
            Continue with Google
          </button>

          <p className="text-center text-sm text-muted-foreground">
            {mode === "signup" ? "Already have an account?" : "Don't have an account?"}{" "}
            <button
              type="button"
              onClick={() => { setMode(mode === "signup" ? "signin" : "signup"); reset(); }}
              className="text-primary hover:text-accent transition-colors font-medium"
            >
              {mode === "signup" ? "Sign in" : "Sign up"}
            </button>
          </p>
        </>
      )}

      <p className="text-center text-[10px] text-muted-foreground leading-relaxed">
        By continuing you agree to our{" "}
        <Link href="/terms" className="underline hover:text-foreground transition-colors">Terms of Service</Link>
        {" "}and{" "}
        <Link href="/privacy" className="underline hover:text-foreground transition-colors">Privacy Policy</Link>.
      </p>
    </div>
  );

  return (
    <>
      {/* Desktop */}
      <div className="hidden lg:grid grid-cols-2 min-h-screen">
        <div className="relative overflow-hidden">
          <Image src="/hero-1.jpg" alt="CLASSIQ" fill className="object-cover object-top" sizes="50vw" priority />
          <div className="absolute inset-0 bg-foreground/45" />
          <div className="absolute inset-0 flex flex-col justify-between p-14">
            <Link href="/" className="inline-flex items-center gap-2 text-[10px] uppercase tracking-[0.18em] text-white/60 hover:text-white transition-colors">
              <ArrowLeft size={13} strokeWidth={1.5} />
              Back to store
            </Link>
            <div className="flex flex-col gap-4">
              <Link href="/" className="font-heading text-5xl tracking-[0.22em] text-white">CLASSIQ</Link>
              <blockquote className="font-heading text-2xl text-white/70 leading-snug max-w-xs">
                "Dress like the woman<br />you are becoming."
              </blockquote>
            </div>
          </div>
        </div>
        <div className="flex flex-col items-center justify-center px-12 py-16 bg-secondary">
          {form}
        </div>
      </div>

      {/* Mobile */}
      <div className="lg:hidden relative min-h-screen flex items-center justify-center px-5 py-16">
        <div className="absolute inset-0 overflow-hidden">
          <Image src="/hero-1.jpg" alt="CLASSIQ" fill className="object-cover object-top scale-110" sizes="100vw" priority />
          <div className="absolute inset-0 backdrop-blur-xl bg-foreground/40" />
        </div>
        <div className="relative z-10 w-full flex flex-col items-center gap-6">
          <div className="w-full max-w-sm flex items-center justify-between">
            <Link href="/" className="inline-flex items-center gap-2 text-[10px] uppercase tracking-[0.16em] text-white/60 hover:text-white transition-colors">
              <ArrowLeft size={13} strokeWidth={1.5} />
              Back
            </Link>
            <Link href="/" className="font-heading text-xl tracking-[0.22em] text-white">CLASSIQ</Link>
            <div className="w-12" />
          </div>
          <div className="glass rounded-3xl p-7 w-full max-w-sm">{form}</div>
        </div>
      </div>
    </>
  );
}
