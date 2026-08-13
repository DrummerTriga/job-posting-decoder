"use client";

import { useState } from "react";
import { createClient } from "@/lib/supabase/client";

export default function SignupPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleSignup = async () => {
    setLoading(true);
    setError("");

    const supabase = createClient();
    const { error } = await supabase.auth.signUp({
      email,
      password,
    });

    if (error) {
      setError(error.message);
      setLoading(false);
      return;
    }

    setSuccess(true);
    setLoading(false);
  };

  if (success) {
    return (
      <main className="min-h-screen bg-neutral-950 text-neutral-100 flex items-center justify-center p-8">
        <p className="text-center max-w-sm">
          Check your email to confirm your account before logging in.
        </p>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-neutral-950 text-neutral-100 flex items-center justify-center p-8">
      <div className="w-full max-w-sm space-y-4">
        <h1 className="text-2xl font-bold">Sign up</h1>

        <input
          type="email"
          placeholder="Email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className="w-full p-3 rounded-lg bg-neutral-900 border border-neutral-700 focus:outline-none focus:border-neutral-500"
        />

        <input
          type="password"
          placeholder="Password (min 6 characters)"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          className="w-full p-3 rounded-lg bg-neutral-900 border border-neutral-700 focus:outline-none focus:border-neutral-500"
        />

        {error && <p className="text-red-400 text-sm">{error}</p>}

        <button
          onClick={handleSignup}
          disabled={loading}
          className="w-full px-4 py-2 rounded-lg bg-neutral-100 text-neutral-900 font-medium disabled:opacity-50"
        >
          {loading ? "Creating account..." : "Sign up"}
        </button>

        <p className="text-sm text-neutral-400 text-center">
          Already have an account?{" "}
          <a href="/login" className="underline">
            Log in
          </a>
        </p>
      </div>
    </main>
  );
}