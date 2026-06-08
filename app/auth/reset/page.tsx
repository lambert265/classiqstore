"use client";

export const dynamic = "force-dynamic";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import { ArrowLeft, Eye, EyeOff, Lock, CheckCircle, AlertCircle } from "lucide-react";
import { createClient } from "@/lib/supabase/client";

export default function ResetPasswordPage() {
  const router = useRouter();
  const supabase = createClient();

  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [showPass, setShowPass] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [done, setDone] = useState(false);

  // Supabase sends the user back here with a session via URL hash —
  // the SSR client handles the exchange automatically on mount.
  useEffect(() => {
    supabase.auth.onAuthStateChange((event) => {
      if (event === "PASSWORD_RECOVERY") {
        // session is now active, user can set a new password
      }
    });
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    if (password !== confirm) {
      setError("Passwords do not match.");
      return;
    }
    setLoading(true);
    const { error } = await supabase.auth.updateUser({ password });
    setLoading(false);
    if (error) {
      setError(error.message);
    } else {
      setDone(true);
      setTimeout(() => router.push("/"), 3000);
    }
  }

  const form = (
    <div className="flex flex-col gap-6 w-full max-w-sm">
      <div className="flex flex-col gap-1">
        <h1 className="font-heading text-3xl text-foreground">Set new password</h1>
        <p className="text-sm text-muted-foreground">Choose a strong password for your CLASSIQ account.</p>
      </div>

      {error && (
        <div className="flex items-start gap-2 text-sm text-destructive bg-destructive/10 border border-destructive/20 rounded-xl px-4 py-3">
          <AlertCircle size={15} className="shrink-0 mt-0.5" />
          <span>{error}</span>
        </div>
      )}

      {done ? (
        <div className="flex flex-col items-center gap-4 py-6 text-center">
          <div className="w-14 h-14 rounded-full bg-emerald-100 flex items-center justify-center">
            <CheckCircle size={24} strokeWidth={1.4} className="text-emerald-600" />
          </div>
          <div className="flex flex-col gap-1">
            <p className="font-heading text-xl text-foreground">Password updated!</p>
            <p className="text-sm text-muted-foreground">Redirecting you to the store…</p>
          </div>
        </div>
      ) : (
        <form className="flex flex-col gap-4" onSubmit={handleSubmit}>
          <div className="flex flex-col gap-1.5">
            <label className="text-[10px] uppercase tracking-[0.18em] text-muted-foreground">New password</label>
            <div className="flex items-center gap-3 border border-border rounded-full px-5 py-3.5 bg-background focus-within:border-primary transition-colors">
              <Lock size={15} strokeWidth={1.4} className="text-muted-foreground shrink-0" />
              <input
                type={showPass ? "text" : "password"}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Min. 6 characters"
                required
                minLength={6}
                className="flex-1 bg-transparent text-sm text-foreground placeholder:text-muted-foreground outline-none"
              />
              <button type="button" onClick={() => setShowPass((s) => !s)} className="text-muted-foreground hover:text-foreground transition-colors shrink-0">
                {showPass ? <EyeOff size={15} strokeWidth={1.4} /> : <Eye size={15} strokeWidth={1.4} />}
              </button>
            </div>
          </div>

          <div className="flex flex-col gap-1.5">
            <label className="text-[10px] uppercase tracking-[0.18em] text-muted-foreground">Confirm password</label>
            <div className="flex items-center gap-3 border border-border rounded-full px-5 py-3.5 bg-background focus-within:border-primary transition-colors">
              <Lock size={15} strokeWidth={1.4} className="text-muted-foreground shrink-0" />
              <input
                type={showPass ? "text" : "password"}
                value={confirm}
                onChange={(e) => setConfirm(e.target.value)}
                placeholder="Repeat new password"
                required
                minLength={6}
                className="flex-1 bg-transparent text-sm text-foreground placeholder:text-muted-foreground outline-none"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-4 rounded-full bg-primary text-primary-foreground text-[11px] uppercase tracking-[0.18em] hover:bg-accent transition-colors duration-300 mt-1 disabled:opacity-60 disabled:cursor-not-allowed"
          >
            {loading ? "Updating…" : "Update password"}
          </button>
        </form>
      )}

      <Link href="/auth" className="inline-flex items-center justify-center gap-2 text-[10px] uppercase tracking-[0.16em] text-muted-foreground hover:text-primary transition-colors">
        <ArrowLeft size={12} strokeWidth={1.5} />
        Back to sign in
      </Link>
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
            <Link href="/" className="font-heading text-5xl tracking-[0.22em] text-white">CLASSIQ</Link>
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
              <ArrowLeft size={13} strokeWidth={1.5} />Back
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
