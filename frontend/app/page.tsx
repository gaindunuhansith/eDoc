"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { type SyntheticEvent, useState } from "react";
import { Eye, EyeOff, Hexagon, Lock, Mail, User } from "lucide-react";

import { Button } from "@/components/ui/button";

export default function AuthPage() {
  const router = useRouter();
  const [role, setRole] = useState("doctor");
  const [showPassword, setShowPassword] = useState(false);
  const [isSignUp, setIsSignUp] = useState(false);

  const handleSubmit = (e: SyntheticEvent<HTMLFormElement>) => {
    e.preventDefault();
    router.push(`/${role}`);
  };

  return (
    <div className="min-h-screen w-full flex bg-[#f8fbff]">
      <div className="w-full lg:w-1/2 flex flex-col items-center justify-center p-8 bg-white">
        <div className="w-full max-w-sm">
          <div className="flex items-center gap-2 mb-8 font-semibold text-2xl tracking-tight text-gray-900">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-gray-900 text-white">
              <Hexagon className="h-5 w-5 fill-current" />
            </div>
            eDoc
          </div>

          <h2 className="text-2xl font-bold text-gray-900 mb-1">
            {isSignUp ? "Create an Account" : "Welcome Back!"}
          </h2>
          <p className="text-gray-500 mb-8 text-sm">
            {isSignUp
              ? "Join eDoc today to manage everything seamlessly"
              : "We Are Happy To See You Again"}
          </p>

          <div className="mb-6 bg-gray-50 p-3 rounded-lg text-sm border border-gray-200">
            <label
              htmlFor="role-select"
              className="block text-gray-800 font-medium mb-1"
            >
              Mock Role Login (Test Redirects)
            </label>
            <select
              id="role-select"
              value={role}
              onChange={(e) => setRole(e.target.value)}
              className="w-full p-2 bg-white border border-gray-300 rounded-md focus:outline-none"
            >
              <option value="admin">Admin</option>
              <option value="doctor">Doctor</option>
              <option value="patient">Patient</option>
            </select>
          </div>

          <div className="flex rounded-full bg-gray-100 p-1 mb-8 border border-gray-200 relative">
            <div
              className="absolute top-1 bottom-1 w-[calc(50%-4px)] bg-gray-900 rounded-full transition-transform duration-300 shadow-sm ease-in-out"
              style={{
                transform: isSignUp ? "translateX(100%)" : "translateX(0)",
              }}
            />
            <button
              type="button"
              onClick={() => setIsSignUp(false)}
              className={`flex-1 relative z-10 text-center py-2 rounded-full font-medium transition-colors ${isSignUp ? "text-gray-500 hover:text-gray-900" : "text-white"}`}
            >
              Sign In
            </button>
            <button
              type="button"
              onClick={() => setIsSignUp(true)}
              className={`flex-1 relative z-10 text-center py-2 rounded-full font-medium transition-colors ${isSignUp ? "text-white" : "text-gray-500 hover:text-gray-900"}`}
            >
              Sign Up
            </button>
          </div>

          <form onSubmit={handleSubmit}>
            <div className="space-y-4 mb-6">
              {isSignUp && (
                <div className="relative">
                  <label htmlFor="full-name" className="sr-only">
                    Full Name
                  </label>
                  <input
                    id="full-name"
                    type="text"
                    placeholder="Full Name"
                    required
                    className="w-full py-3 px-4 bg-gray-50 border border-gray-200 rounded-full text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-gray-900 transition-all"
                  />
                  <User className="absolute right-4 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                </div>
              )}

              <div className="relative">
                <label htmlFor="email" className="sr-only">
                  Email
                </label>
                <input
                  id="email"
                  type="email"
                  placeholder="Enter your email"
                  required
                  className="w-full py-3 px-4 bg-gray-50 border border-gray-200 rounded-full text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-gray-900 transition-all"
                />
                <Mail className="absolute right-4 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
              </div>

              <div className="relative">
                <label htmlFor="password" className="sr-only">
                  Password
                </label>
                <input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  placeholder="Enter your password"
                  required
                  className="w-full py-3 px-4 bg-gray-50 border border-gray-200 rounded-full text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-gray-900 transition-all"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword((prev) => !prev)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-900 transition-colors"
                  aria-label={showPassword ? "Hide password" : "Show password"}
                >
                  {showPassword ? (
                    <EyeOff className="h-4 w-4" />
                  ) : (
                    <Eye className="h-4 w-4" />
                  )}
                </button>
              </div>

              {isSignUp && (
                <div className="relative">
                  <label htmlFor="confirm-password" className="sr-only">
                    Confirm Password
                  </label>
                  <input
                    id="confirm-password"
                    type="password"
                    placeholder="Confirm your password"
                    required
                    className="w-full py-3 px-4 bg-gray-50 border border-gray-200 rounded-full text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-gray-900 transition-all"
                  />
                  <Lock className="absolute right-4 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                </div>
              )}
            </div>

            {!isSignUp && (
              <div className="flex items-center justify-between mb-8">
                <label className="flex items-center gap-2 cursor-pointer group">
                  <input
                    type="checkbox"
                    name="remember"
                    defaultChecked
                    className="text-gray-900 focus:ring-gray-900 rounded border-gray-300"
                  />
                  <span className="text-sm text-gray-600 group-hover:text-gray-900 transition-colors">
                    Remember me
                  </span>
                </label>
                <Link
                  href="/forgot-password"
                  className="text-sm text-gray-900 font-medium hover:underline"
                >
                  Forgot Password?
                </Link>
              </div>
            )}

            {isSignUp && (
              <div className="mb-8">
                <label className="flex items-start gap-2 cursor-pointer group">
                  <input
                    type="checkbox"
                    required
                    className="mt-1 text-gray-900 focus:ring-gray-900 rounded border-gray-300"
                  />
                  <span className="text-sm text-gray-600">
                    I agree to the{" "}
                    <Link
                      href="/terms"
                      className="text-gray-900 font-medium hover:underline"
                    >
                      Terms of Service
                    </Link>{" "}
                    and{" "}
                    <Link
                      href="/privacy"
                      className="text-gray-900 font-medium hover:underline"
                    >
                      Privacy Policy
                    </Link>
                  </span>
                </label>
              </div>
            )}

            <Button
              type="submit"
              className="w-full bg-blue-600 hover:bg-blue-700 text-white rounded-full py-6 text-base font-medium mb-8 shadow-md"
            >
              {isSignUp ? "Create Account" : "Login"}
            </Button>
          </form>

          <div className="relative mb-8">
            <div className="absolute inset-0 flex items-center">
              <span className="w-full border-t border-gray-200" />
            </div>
            <div className="relative flex justify-center text-xs">
              <span className="bg-white px-4 text-gray-400 uppercase">Or</span>
            </div>
          </div>

          <div className="space-y-3">
            <Button
              variant="outline"
              className="w-full rounded-full py-6 bg-[#1a1a1a] hover:bg-black text-white hover:text-white border-0 transition-colors"
            >
              Continue with Apple
            </Button>
            <Button
              variant="outline"
              className="w-full rounded-full py-6 bg-white hover:bg-gray-50 border-gray-300 text-gray-700 shadow-sm transition-colors"
            >
              Continue with Google
            </Button>
          </div>
        </div>
      </div>

      <div className="hidden lg:flex w-1/2 bg-gray-900 p-4">
        <div
          className="w-full h-full rounded-3xl overflow-hidden relative"
          style={{
            background:
              "linear-gradient(135deg, #111111 0%, #2a2a2a 50%, #444444 100%)",
          }}
        >
          <div
            className="absolute inset-0 opacity-20 mix-blend-overlay"
            style={{
              backgroundImage:
                "radial-gradient(circle at 100% 0%, #ffffff 0%, transparent 25%), radial-gradient(circle at 0% 100%, #ffffff 0%, transparent 25%)",
            }}
          />

          <div className="absolute bottom-0 right-0 w-64 h-64 bg-blue-500 rounded-full blur-[100px] opacity-20" />

          <div className="absolute bottom-8 left-1/2 -translate-x-1/2 w-[80%] max-w-md bg-black/40 backdrop-blur-xl border border-white/10 p-4 rounded-2xl text-center text-white/70 text-xs font-light shadow-2xl">
            (c) 2026 eDoc. All rights reserved.
            <br />
            Unauthorized use or reproduction of any content of this platform is
            prohibited. For more information, visit our Terms of service and
            Privacy Policy.
          </div>
        </div>
      </div>
    </div>
  );
}
