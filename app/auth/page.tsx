"use client";

import { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { ArrowLeft, Eye, EyeOff, Mail, Lock, User } from "lucide-react";

export default function AuthPage() {
  const [mode,     setMode]     = useState<"signin" | "signup">("signin");
  const [showPass, setShowPass] = useState(false);
  const [email,    setEmail]    = useState("");
  const [password, setPassword] = useState("");
  const [name,     setName]     = useState("");

  const isSignUp = mode === "signup";

  const form = (
    <div className="flex flex-col gap-6 w-full max-w-sm">

      {/* Heading */}
      <div className="flex flex-col gap-1">
        <h1 className="font-display text-3xl text-foreground">
          {isSignUp ? "Create account" : "Welcome back"}
        </h1>
        <p className="text-sm text-muted-foreground">
          {isSignUp ? "Join CLASSIQ and start your edit." : "Sign in to your CLASSIQ account."}
        </p>
      </div>

      {/* Toggle pills */}
      <div className="flex gap-1 p-1 rounded-full bg-muted">
        {(["signin", "signup"] as const).map((m) => (
          <button
            key={m}
            onClick={() => setMode(m)}
            className={`flex-1 py-2 rounded-full text-[10px] uppercase tracking-[0.16em] transition-all duration-200 ${
              mode === m ? "bg-primary text-primary-foreground shadow-sm" : "text-muted-foreground hover:text-foreground"
            }`}
          >
            {m === "signin" ? "Sign in" : "Sign up"}
          </button>
        ))}
      </div>

      {/* Form */}
      <form className="flex flex-col gap-4" onSubmit={(e) => e.preventDefault()}>
        {isSignUp && (
          <div className="flex items-center gap-3 border border-border rounded-full px-5 py-3.5 bg-background focus-within:border-primary transition-colors">
            <User size={15} strokeWidth={1.4} className="text-muted-foreground shrink-0" />
            <input type="text" value={name} onChange={(e) => setName(e.target.value)} placeholder="Full name" className="flex-1 bg-transparent text-sm text-foreground placeholder:text-muted-foreground outline-none" />
          </div>
        )}

        <div className="flex items-center gap-3 border border-border rounded-full px-5 py-3.5 bg-background focus-within:border-primary transition-colors">
          <Mail size={15} strokeWidth={1.4} className="text-muted-foreground shrink-0" />
          <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="Email address" className="flex-1 bg-transparent text-sm text-foreground placeholder:text-muted-foreground outline-none" />
        </div>

        <div className="flex items-center gap-3 border border-border rounded-full px-5 py-3.5 bg-background focus-within:border-primary transition-colors">
          <Lock size={15} strokeWidth={1.4} className="text-muted-foreground shrink-0" />
          <input type={showPass ? "text" : "password"} value={password} onChange={(e) => setPassword(e.target.value)} placeholder="Password" className="flex-1 bg-transparent text-sm text-foreground placeholder:text-muted-foreground outline-none" />
          <button type="button" onClick={() => setShowPass((s) => !s)} className="text-muted-foreground hover:text-foreground transition-colors shrink-0">
            {showPass ? <EyeOff size={15} strokeWidth={1.4} /> : <Eye size={15} strokeWidth={1.4} />}
          </button>
        </div>

        {!isSignUp && (
          <div className="text-right -mt-1">
            <button type="button" className="text-[10px] uppercase tracking-[0.16em] text-muted-foreground hover:text-primary transition-colors">
              Forgot password?
            </button>
          </div>
        )}

        <button type="submit" className="w-full py-4 rounded-full bg-primary text-primary-foreground text-[11px] uppercase tracking-[0.18em] hover:bg-accent transition-colors duration-300 mt-1">
          {isSignUp ? "Create account" : "Sign in"}
        </button>
      </form>

      {/* Divider */}
      <div className="flex items-center gap-3">
        <div className="flex-1 h-px bg-border" />
        <span className="text-[10px] uppercase tracking-[0.16em] text-muted-foreground">or</span>
        <div className="flex-1 h-px bg-border" />
      </div>

      {/* Social */}
      <div className="flex flex-col gap-3">
        {["Continue with Google", "Continue with Apple"].map((label) => (
          <button key={label} className="w-full py-3.5 rounded-full border border-border text-sm text-foreground hover:border-primary hover:text-primary transition-colors duration-200">
            {label}
          </button>
        ))}
      </div>

      {/* Switch */}
      <p className="text-center text-sm text-muted-foreground">
        {isSignUp ? "Already have an account?" : "Don't have an account?"}{" "}
        <button onClick={() => setMode(isSignUp ? "signin" : "signup")} className="text-primary hover:text-accent transition-colors font-medium">
          {isSignUp ? "Sign in" : "Sign up"}
        </button>
      </p>

      {/* Terms */}
      <p className="text-center text-[10px] text-muted-foreground leading-relaxed">
        By continuing you agree to our{" "}
        <Link href="/" className="underline hover:text-foreground transition-colors">Terms of Service</Link>
        {" "}and{" "}
        <Link href="/" className="underline hover:text-foreground transition-colors">Privacy Policy</Link>.
      </p>
    </div>
  );

  return (
    <>
      {/* ═══════════ DESKTOP — two column split ═══════════ */}
      <div className="hidden lg:grid grid-cols-2 min-h-screen">

        {/* Left: editorial image */}
        <div className="relative overflow-hidden">
          <Image src="/hero-1.jpg" alt="CLASSIQ" fill className="object-cover object-top" sizes="50vw" priority />
          <div className="absolute inset-0 bg-foreground/45" />
          {/* Content over image */}
          <div className="absolute inset-0 flex flex-col justify-between p-14">
            <Link href="/" className="inline-flex items-center gap-2 text-[10px] uppercase tracking-[0.18em] text-white/60 hover:text-white transition-colors">
              <ArrowLeft size={13} strokeWidth={1.5} />
              Back to store
            </Link>
            <div className="flex flex-col gap-4">
              <Link href="/" className="font-display text-5xl tracking-[0.22em] text-white">CLASSIQ</Link>
              <blockquote className="font-display text-2xl text-white/70 leading-snug max-w-xs">
                "Dress like the woman<br />you are becoming."
              </blockquote>
            </div>
          </div>
        </div>

        {/* Right: form on plain bg */}
        <div className="flex flex-col items-center justify-center px-12 py-16 bg-secondary">
          <div className="w-full max-w-sm mb-8">
            <Link href="/" className="inline-flex items-center gap-2 text-[10px] uppercase tracking-[0.18em] text-muted-foreground hover:text-foreground transition-colors lg:hidden">
              <ArrowLeft size={13} strokeWidth={1.5} />
              Back
            </Link>
          </div>
          {form}
        </div>
      </div>

      {/* ═══════════ MOBILE — blurred full-bleed image ═══════════ */}
      <div className="lg:hidden relative min-h-screen flex items-center justify-center px-5 py-16">

        {/* Full-bleed blurred background */}
        <div className="absolute inset-0 overflow-hidden">
          <Image src="/hero-1.jpg" alt="CLASSIQ" fill className="object-cover object-top scale-110" sizes="100vw" priority />
          <div className="absolute inset-0 backdrop-blur-xl bg-foreground/40" />
        </div>

        {/* Glass card on top */}
        <div className="relative z-10 w-full flex flex-col items-center gap-6">
          {/* Back + wordmark */}
          <div className="w-full max-w-sm flex items-center justify-between">
            <Link href="/" className="inline-flex items-center gap-2 text-[10px] uppercase tracking-[0.16em] text-white/60 hover:text-white transition-colors">
              <ArrowLeft size={13} strokeWidth={1.5} />
              Back
            </Link>
            <Link href="/" className="font-display text-xl tracking-[0.22em] text-white">
              CLASSIQ
            </Link>
            <div className="w-12" />
          </div>

          {/* Glass form card */}
          <div className="glass rounded-3xl p-7 w-full max-w-sm">
            {form}
          </div>
        </div>
      </div>
    </>
  );
}
