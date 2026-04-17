"use client";

import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { type SyntheticEvent, useState } from "react";
import { Eye, EyeOff, Hexagon, Lock, Mail, User, Phone } from "lucide-react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { useLogin, useRegister } from "@/api/userApi";

export default function AuthPage() {
  const router = useRouter();
  const [showPassword, setShowPassword] = useState(false);
  const [isSignUp, setIsSignUp] = useState(false);

  // Form states
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [phoneNumber, setPhoneNumber] = useState("");
  const [role, setRole] = useState<"PATIENT" | "DOCTOR">("PATIENT");
  const [errorMsg, setErrorMsg] = useState("");

  const loginMutation = useLogin();
  const registerMutation = useRegister();

  const handleSubmit = (e: SyntheticEvent<HTMLFormElement>) => {
    e.preventDefault();
    setErrorMsg("");

    if (isSignUp) {
      if (password !== confirmPassword) {
        setErrorMsg("Passwords do not match");
        return;
      }
      registerMutation.mutate(
        { name, email, password, phoneNumber, role },
        {
          onSuccess: () => {
            toast.success("Account created successfully");
            setIsSignUp(false);
            setPassword("");
            setConfirmPassword("");
          },
          onError: (err: any) => {
            setErrorMsg(err.message || "Registration failed");
          },
        }
      );
    } else {
      loginMutation.mutate(
        { email, password },
        {
          onSuccess: (res: any) => {
            const userRole = res.data.user.role;
            if (userRole === "DOCTOR") router.push("/doctor");
            else if (userRole === "ADMIN") router.push("/admin");
            else router.push("/patient");
          },
          onError: (err: any) => {
            setErrorMsg(err.message || "Login failed");
          },
        }
      );
    }
  };

  return (
    <div className="h-screen w-full flex overflow-hidden bg-[#f8fbff]">
      <div className="w-full lg:w-1/2 flex flex-col items-center justify-center p-6 bg-white overflow-hidden max-h-screen">
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

          <div className="flex rounded-full bg-gray-100 p-1 mb-8 border border-gray-200 relative">
            <div
              className="absolute top-1 bottom-1 w-[calc(50%-4px)] bg-gray-900 rounded-full transition-transform duration-300 shadow-sm ease-in-out"
              style={{
                transform: isSignUp ? "translateX(100%)" : "translateX(0)",
              }}
            />
            <button
              type="button"
              onClick={() => {
                setIsSignUp(false);
                setErrorMsg("");
              }}
              className={`flex-1 relative z-10 text-center py-2 rounded-full font-medium transition-colors ${isSignUp ? "text-gray-500 hover:text-gray-900" : "text-white"}`}
            >
              Sign In
            </button>
            <button
              type="button"
              onClick={() => {
                setIsSignUp(true);
                setErrorMsg("");
              }}
              className={`flex-1 relative z-10 text-center py-2 rounded-full font-medium transition-colors ${isSignUp ? "text-white" : "text-gray-500 hover:text-gray-900"}`}
            >
              Sign Up
            </button>
          </div>

          {errorMsg && (
            <div className="mb-4 p-3 bg-red-50 text-red-600 border border-red-100 rounded-lg text-sm text-center">
              {errorMsg}
            </div>
          )}

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
                    value={name}
                    onChange={(e) => setName(e.target.value)}
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
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full py-3 px-4 bg-gray-50 border border-gray-200 rounded-full text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-gray-900 transition-all"
                />
                <Mail className="absolute right-4 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
              </div>

              {isSignUp && (
                <div className="relative">
                  <label htmlFor="phone-number" className="sr-only">
                    Phone Number
                  </label>
                  <input
                    id="phone-number"
                    type="tel"
                    placeholder="Phone Number"
                    required
                    value={phoneNumber}
                    onChange={(e) => setPhoneNumber(e.target.value)}
                    className="w-full py-3 px-4 bg-gray-50 border border-gray-200 rounded-full text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-gray-900 transition-all"
                  />
                  <Phone className="absolute right-4 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                </div>
              )}

              <div className="relative">
                <label htmlFor="password" className="sr-only">
                  Password
                </label>
                <input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  placeholder="Enter your password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
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
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    className="w-full py-3 px-4 bg-gray-50 border border-gray-200 rounded-full text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-gray-900 transition-all"
                  />
                  <Lock className="absolute right-4 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                </div>
              )}

              {isSignUp && (
                <div className="flex rounded-full bg-gray-100 p-1 mb-2 border border-gray-200 relative w-full mx-auto">
                  <div
                    className="absolute top-1 bottom-1 w-[calc(50%-4px)] bg-gray-900 rounded-full transition-transform duration-300 shadow-sm ease-in-out"
                    style={{
                      transform: role === "DOCTOR" ? "translateX(100%)" : "translateX(0)",
                    }}
                  />
                  <button
                    type="button"
                    onClick={() => setRole("PATIENT")}
                    className={`flex-1 relative z-10 text-center py-1.5 text-xs rounded-full font-medium transition-colors ${role === "PATIENT" ? "text-white" : "text-gray-500 hover:text-gray-900"}`}
                  >
                    Patient
                  </button>
                  <button
                    type="button"
                    onClick={() => setRole("DOCTOR")}
                    className={`flex-1 relative z-10 text-center py-1.5 text-xs rounded-full font-medium transition-colors ${role === "DOCTOR" ? "text-white" : "text-gray-500 hover:text-gray-900"}`}
                  >
                    Doctor
                  </button>
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
              <div className="mb-8 mt-4">
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
              disabled={loginMutation.isPending || registerMutation.isPending}
              className="w-full bg-blue-600 hover:bg-blue-700 text-white rounded-full py-3 text-base font-medium mb-4 shadow-md disabled:opacity-50"
            >
              {isSignUp ? (registerMutation.isPending ? "Creating..." : "Create Account") : (loginMutation.isPending ? "Logging in..." : "Login")}
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
              className="w-full rounded-full py-3 bg-[#1a1a1a] hover:bg-black text-white hover:text-white border-0 transition-colors"
            >
              Continue with Apple
            </Button>
            <Button
              variant="outline"
              className="w-full rounded-full py-3 bg-white hover:bg-gray-50 border-gray-300 text-gray-700 shadow-sm transition-colors"
            >
              Continue with Google
            </Button>
          </div>
        </div>
      </div>

      <div className="hidden lg:flex w-1/2 border-l border-gray-100 bg-[#111111]">
        <div className="w-full h-full relative">
          <Image src="/banner.webp" alt="Banner" fill className="object-cover grayscale" />
          <div
            className="absolute inset-0 opacity-20 mix-blend-overlay"
            style={{
              backgroundImage:
                "radial-gradient(circle at 100% 0%, #ffffff 0%, transparent 25%), radial-gradient(circle at 0% 100%, #ffffff 0%, transparent 25%)",
            }}
          />

          <div className="absolute bottom-0 right-0 w-64 h-64 bg-blue-500 rounded-full blur-[100px] opacity-20" />

        </div>
      </div>
    </div>
  );
}
