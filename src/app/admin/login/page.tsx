"use client";

import { useState, useTransition } from "react";
import { login } from "./actions/login";

export default function AdminLoginPage() {
  const [password, setPassword] = useState("");
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    startTransition(async () => {
      try {
        const result = await login(password);
        if (result.success) {
          window.location.href = "/admin";
        } else {
          setError(result.error ?? "Incorrect password.");
        }
      } catch (err) {
        console.error("Admin login error:", err);
        setError("Unable to log in. Please try again.");
      }
    });
  };

  return (
    <div className="bg-white min-h-screen flex items-center justify-center p-4">
      <div className="w-full max-w-sm">
        <div className="w-full bg-[#BF0A30] py-6 px-4 mb-6 text-center rounded text-white">
          <h1 className="text-2xl font-bold text-white">Admin Login</h1>
        </div>

        <form className="space-y-4" onSubmit={handleSubmit}>
          {error && (
            <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded text-sm">
              {error}
            </div>
          )}

          <input
            className="w-full border border-gray-300 p-3 rounded text-black text-sm sm:text-base"
            name="password"
            type="password"
            placeholder="Password"
            value={password}
            onChange={(e) => {
              setPassword(e.target.value);
              setError(null);
            }}
            required
            autoFocus
            disabled={isPending}
          />

          <button
            type="submit"
            disabled={isPending}
            className="bg-[#BF0A30] hover:bg-red-800 text-white font-semibold px-6 py-3 rounded shadow w-full disabled:opacity-50 disabled:cursor-not-allowed transition-opacity"
          >
            {isPending ? "Logging in..." : "Log In"}
          </button>
        </form>
      </div>
    </div>
  );
}
