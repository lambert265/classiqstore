"use client";

import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";

export default function TestAdminPage() {
  const [result, setResult] = useState<any>(null);
  const [error, setError] = useState<any>(null);

  useEffect(() => {
    async function test() {
      const sb = createClient();
      
      const { data: { user }, error: userError } = await sb.auth.getUser();
      
      if (userError || !user) {
        setError({ step: "auth", error: userError });
        return;
      }

      console.log("User ID:", user.id);
      console.log("User Email:", user.email);

      const { data: profile, error: profileError } = await sb
        .from("profiles")
        .select("*")
        .eq("id", user.id)
        .single();

      console.log("Profile data:", profile);
      console.log("Profile error:", profileError);

      if (profileError) {
        setError({ step: "profile", error: profileError, userId: user.id });
        return;
      }

      setResult({
        userId: user.id,
        email: user.email,
        profile: profile,
        isAdmin: profile?.is_admin
      });
    }

    test();
  }, []);

  return (
    <div className="min-h-screen bg-slate-100 p-8">
      <div className="max-w-2xl mx-auto bg-white rounded-lg shadow p-6">
        <h1 className="text-2xl font-bold mb-4">Admin Access Debug</h1>
        
        {error && (
          <div className="bg-red-50 border border-red-200 rounded p-4 mb-4">
            <p className="font-semibold text-red-800">Error: {error.step}</p>
            <pre className="text-xs mt-2 overflow-auto">{JSON.stringify(error, null, 2)}</pre>
          </div>
        )}

        {result && (
          <div className="bg-green-50 border border-green-200 rounded p-4">
            <p className="font-semibold text-green-800">Success!</p>
            <pre className="text-xs mt-2 overflow-auto">{JSON.stringify(result, null, 2)}</pre>
            {result.isAdmin ? (
              <p className="text-green-600 font-bold mt-2">✓ You ARE an admin</p>
            ) : (
              <p className="text-red-600 font-bold mt-2">✗ You are NOT an admin</p>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
