"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { createBrowserClient } from "@supabase/ssr";
import { Eye, EyeOff } from "lucide-react";

export default function AdminLoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPw, setShowPw] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleLogin(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError("");
    const supabase = createBrowserClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
    );
    const { error: authError } = await supabase.auth.signInWithPassword({ email, password });
    if (authError) { setError(authError.message); setLoading(false); return; }
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) { setError("Authentication failed."); setLoading(false); return; }
    const { data: profile } = await supabase.from("profiles").select("is_admin").eq("id", user.id).single();
    if (!profile?.is_admin) {
      await supabase.auth.signOut();
      setError("You don't have admin access.");
      setLoading(false);
      return;
    }
    router.push("/admin/dashboard");
    router.refresh();
  }

  return (
    <div className="admin-theme min-h-screen bg-[#0f0d0b] flex items-center justify-center px-4 relative overflow-hidden">
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-[#C9A84C]/8 rounded-full blur-[120px]" />
      </div>

      <div className="relative w-full max-w-sm">
        <div className="text-center mb-10">
          <h1 className="font-heading text-4xl font-bold text-white tracking-[0.15em] mb-1">CLASSIQ</h1>
          <p className="text-sm text-[#C9A84C]/60 font-body tracking-[0.2em] uppercase">Admin Dashboard</p>
        </div>

        <div className="bg-[#0a0806] border border-white/8 rounded-2xl p-7 shadow-2xl shadow-black/40">
          <h2 className="font-heading text-xl font-semibold text-white mb-1">Welcome back</h2>
          <p className="text-sm text-white/40 font-body mb-6">Sign in to your admin account</p>

          <form onSubmit={handleLogin} className="space-y-4">
            <div>
              <label className="text-[10px] tracking-[0.15em] uppercase text-white/40 font-body block mb-1.5">Email</label>
              <input type="email" value={email} onChange={e => setEmail(e.target.value)} required
                className="w-full bg-white/5 border border-white/8 text-white text-sm px-4 py-3 rounded-xl focus:outline-none focus:border-[#C9A84C]/40 focus:bg-white/8 transition-all font-body placeholder-white/20" />
            </div>
            <div>
              <label className="text-[10px] tracking-[0.15em] uppercase text-white/40 font-body block mb-1.5">Password</label>
              <div className="relative">
                <input type={showPw ? "text" : "password"} value={password} onChange={e => setPassword(e.target.value)} required
                  className="w-full bg-white/5 border border-white/8 text-white text-sm px-4 py-3 pr-11 rounded-xl focus:outline-none focus:border-[#C9A84C]/40 focus:bg-white/8 transition-all font-body" />
                <button type="button" onClick={() => setShowPw(!showPw)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-white/25 hover:text-white/60 transition-colors">
                  {showPw ? <EyeOff size={15} /> : <Eye size={15} />}
                </button>
              </div>
            </div>

            {error && <p className="text-red-400 text-xs bg-red-500/10 border border-red-500/20 rounded-xl px-4 py-2.5 font-body">{error}</p>}

            <button type="submit" disabled={loading}
              className="w-full bg-[#C9A84C] text-[#0f0d0b] font-semibold text-sm py-3 rounded-xl hover:bg-[#a8891e] transition-all disabled:opacity-50 font-body mt-2 btn-3d btn-3d-gold">
              {loading ? "Signing in..." : "Sign In"}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
