"use client";

import { useState } from "react";
import { signIn } from "next-auth/react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Mail, Lock, ArrowRight, Loader2 } from "lucide-react";
import Link from "next/link";

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [focusedField, setFocusedField] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    const result = await signIn("credentials", {
      email,
      password,
      redirect: false,
    });
    setLoading(false);
    if (result?.error) {
      toast.error("Invalid credentials");
    } else {
      router.push("/dashboard");
    }
  };

  return (
    <div className="relative min-h-screen w-full overflow-hidden bg-[#030305] flex items-center justify-center p-4">
      {/* Animated background gradients */}
      <div className="pointer-events-none absolute inset-0 overflow-hidden">
        <div
          className="absolute -top-[40%] -left-[20%] w-[90vw] h-[90vw] rounded-full opacity-30"
          style={{
            background:
              "radial-gradient(circle at center, rgba(99,102,241,0.35) 0%, transparent 60%)",
            animation: "aurora 24s ease-in-out infinite",
            transformOrigin: "center center",
          }}
        />
        <div
          className="absolute top-[20%] -right-[20%] w-[70vw] h-[70vw] rounded-full opacity-25"
          style={{
            background:
              "radial-gradient(circle at center, rgba(168,85,247,0.35) 0%, transparent 60%)",
            animation: "aurora 28s ease-in-out infinite reverse",
            transformOrigin: "center center",
          }}
        />
        <div
          className="absolute -bottom-[30%] left-[10%] w-[80vw] h-[80vw] rounded-full opacity-20"
          style={{
            background:
              "radial-gradient(circle at center, rgba(59,130,246,0.3) 0%, transparent 60%)",
            animation: "aurora 32s ease-in-out infinite",
            transformOrigin: "center center",
          }}
        />
        {/* Noise texture overlay */}
        <div
          className="absolute inset-0 opacity-[0.03]"
          style={{
            backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noise'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.85' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noise)'/%3E%3C/svg%3E")`,
          }}
        />
      </div>

      {/* Glass card */}
      <div
        className="relative z-10 w-full max-w-md"
        style={{
          animation: "fade-in-up 0.8s cubic-bezier(0.22, 1, 0.36, 1) forwards",
        }}
      >
        <div className="relative overflow-hidden rounded-3xl border border-white/[0.08] bg-white/[0.03] backdrop-blur-xl shadow-2xl shadow-black/40">
          {/* Top gradient line */}
          <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-indigo-500/50 to-transparent" />

          <div className="px-8 py-10 sm:px-10 sm:py-12">
            {/* Logo / Title */}
            <div className="text-center mb-10">
              <div
                className="inline-flex items-center justify-center w-12 h-12 rounded-2xl mb-5 bg-gradient-to-br from-indigo-500 to-violet-600 shadow-lg shadow-indigo-500/20"
                style={{
                  animation:
                    "fade-in-up 0.8s cubic-bezier(0.22, 1, 0.36, 1) 0.1s forwards",
                  opacity: 0,
                }}
              >
                <svg
                  className="w-6 h-6 text-white"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                  strokeWidth={2}
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M13 10V3L4 14h7v7l9-11h-7z"
                  />
                </svg>
              </div>
              <h1
                className="text-3xl font-semibold tracking-tight text-white mb-2"
                style={{
                  animation:
                    "fade-in-up 0.8s cubic-bezier(0.22, 1, 0.36, 1) 0.15s forwards",
                  opacity: 0,
                }}
              >
                Welcome back
              </h1>
              <p
                className="text-sm text-white/50"
                style={{
                  animation:
                    "fade-in-up 0.8s cubic-bezier(0.22, 1, 0.36, 1) 0.2s forwards",
                  opacity: 0,
                }}
              >
                Sign in to continue to your CRM dashboard
              </p>
            </div>

            {/* Form */}
            <form onSubmit={handleSubmit} className="space-y-5">
              {/* Email field */}
              <div
                className="space-y-1.5"
                style={{
                  animation:
                    "fade-in-up 0.8s cubic-bezier(0.22, 1, 0.36, 1) 0.25s forwards",
                  opacity: 0,
                }}
              >
                <label
                  htmlFor="email"
                  className="block text-xs font-medium text-white/70 ml-1"
                >
                  Email
                </label>
                <div
                  className={`relative flex items-center rounded-xl border transition-all duration-300 ${
                    focusedField === "email"
                      ? "border-indigo-400/60 bg-white/[0.06] shadow-[0_0_20px_-5px_rgba(99,102,241,0.25)]"
                      : "border-white/[0.08] bg-white/[0.03] hover:border-white/[0.15]"
                  }`}
                >
                  <div className="pl-4 text-white/40">
                    <Mail className="w-4 h-4" />
                  </div>
                  <input
                    id="email"
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    onFocus={() => setFocusedField("email")}
                    onBlur={() => setFocusedField(null)}
                    required
                    placeholder="you@company.com"
                    className="w-full bg-transparent px-3 py-3 text-sm text-white placeholder:text-white/25 outline-none"
                  />
                </div>
              </div>

              {/* Password field */}
              <div
                className="space-y-1.5"
                style={{
                  animation:
                    "fade-in-up 0.8s cubic-bezier(0.22, 1, 0.36, 1) 0.3s forwards",
                  opacity: 0,
                }}
              >
                <label
                  htmlFor="password"
                  className="block text-xs font-medium text-white/70 ml-1"
                >
                  Password
                </label>
                <div
                  className={`relative flex items-center rounded-xl border transition-all duration-300 ${
                    focusedField === "password"
                      ? "border-indigo-400/60 bg-white/[0.06] shadow-[0_0_20px_-5px_rgba(99,102,241,0.25)]"
                      : "border-white/[0.08] bg-white/[0.03] hover:border-white/[0.15]"
                  }`}
                >
                  <div className="pl-4 text-white/40">
                    <Lock className="w-4 h-4" />
                  </div>
                  <input
                    id="password"
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    onFocus={() => setFocusedField("password")}
                    onBlur={() => setFocusedField(null)}
                    required
                    placeholder="••••••••"
                    className="w-full bg-transparent px-3 py-3 text-sm text-white placeholder:text-white/25 outline-none"
                  />
                </div>
              </div>

              {/* Submit button */}
              <div
                style={{
                  animation:
                    "fade-in-up 0.8s cubic-bezier(0.22, 1, 0.36, 1) 0.35s forwards",
                  opacity: 0,
                }}
              >
                <button
                  type="submit"
                  disabled={loading}
                  className="group relative w-full overflow-hidden rounded-xl bg-gradient-to-r from-indigo-500 to-violet-600 px-4 py-3 text-sm font-medium text-white shadow-lg shadow-indigo-500/20 transition-all duration-300 hover:shadow-indigo-500/30 hover:-translate-y-0.5 active:translate-y-0 disabled:opacity-60 disabled:hover:translate-y-0 disabled:cursor-not-allowed"
                >
                  {/* Shimmer overlay */}
                  <div
                    className="absolute inset-0 -translate-x-full group-hover:animate-[shimmer_1.5s_infinite] bg-gradient-to-r from-transparent via-white/20 to-transparent"
                    style={{
                      backgroundSize: "200% 100%",
                    }}
                  />
                  <span className="relative flex items-center justify-center gap-2">
                    {loading ? (
                      <>
                        <Loader2 className="w-4 h-4 animate-spin" />
                        Signing in...
                      </>
                    ) : (
                      <>
                        Sign in
                        <ArrowRight className="w-4 h-4 transition-transform duration-300 group-hover:translate-x-0.5" />
                      </>
                    )}
                  </span>
                </button>
              </div>
            </form>

            {/* Footer */}
            <div
              className="mt-8 text-center space-y-3"
              style={{
                animation:
                  "fade-in-up 0.8s cubic-bezier(0.22, 1, 0.36, 1) 0.4s forwards",
                opacity: 0,
              }}
            >
              <p className="text-sm text-white/40">
                Don&apos;t have an account?{" "}
                <Link
                  href="/signup"
                  className="text-indigo-400 hover:text-indigo-300 transition-colors"
                >
                  Sign up
                </Link>
              </p>
              <p className="text-xs text-white/30">
                CRM MVP — Built for modern sales teams
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
