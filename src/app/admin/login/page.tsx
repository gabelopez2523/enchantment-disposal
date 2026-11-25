"use client";

import { useState, useTransition } from "react";
import { login } from "./actions/login";
import { verifyMfa } from "./actions/verifyMfa";

export default function AdminLoginPage() {
  const [step, setStep] = useState<"password" | "mfa">("password");
  const [password, setPassword] = useState("");
  const [code, setCode] = useState("");
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);

  const handlePasswordSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    startTransition(async () => {
      try {
        const result = await login(password);
        if (result.success) {
          setStep("mfa");
        } else {
          setError(result.error ?? "Incorrect password.");
        }
      } catch (err) {
        console.error("Admin login error:", err);
        setError("Unable to log in. Please try again.");
      }
    });
  };

  const handleMfaSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    startTransition(async () => {
      try {
        const result = await verifyMfa(code);
        if (result.success) {
          window.location.href = "/admin";
        } else {
          setError(result.error ?? "Incorrect authenticator code.");
        }
      } catch (err) {
        console.error("Admin MFA verification error:", err);
        setError("Unable to verify code. Please try again.");
      }
    });
  };

  const handleStartOver = () => {
    setStep("password");
    setPassword("");
    setCode("");
    setError(null);
  };

  return (
    <div className="bg-white min-h-screen flex items-center justify-center p-4">
      <div className="w-full max-w-sm">
        <div className="w-full bg-[#BF0A30] py-6 px-4 mb-6 text-center rounded text-white">
          <h1 className="text-2xl font-bold text-white">Admin Login</h1>
        </div>

        {step === "password" ? (
          <form className="space-y-4" onSubmit={handlePasswordSubmit}>
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
              {isPending ? "Checking..." : "Continue"}
            </button>
          </form>
        ) : (
          <form className="space-y-4" onSubmit={handleMfaSubmit}>
            <p className="text-sm text-gray-600 text-center">
              Enter the 6-digit code from your authenticator app.
            </p>

            {error && (
              <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded text-sm">
                {error}
              </div>
            )}

            <input
              className="w-full border border-gray-300 p-3 rounded text-black text-sm sm:text-base text-center tracking-widest"
              name="code"
              type="text"
              inputMode="numeric"
              autoComplete="one-time-code"
              maxLength={6}
              placeholder="123456"
              value={code}
              onChange={(e) => {
                setCode(e.target.value.replace(/\D/g, "").slice(0, 6));
                setError(null);
              }}
              required
              autoFocus
              disabled={isPending}
            />

            <button
              type="submit"
              disabled={isPending || code.length !== 6}
              className="bg-[#BF0A30] hover:bg-red-800 text-white font-semibold px-6 py-3 rounded shadow w-full disabled:opacity-50 disabled:cursor-not-allowed transition-opacity"
            >
              {isPending ? "Verifying..." : "Log In"}
            </button>

            <button
              type="button"
              onClick={handleStartOver}
              disabled={isPending}
              className="text-sm text-gray-500 hover:underline w-full text-center"
            >
              Back to password
            </button>
          </form>
        )}
      </div>
    </div>
  );
}
