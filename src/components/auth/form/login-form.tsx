"use client";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Eye, EyeOff } from "lucide-react";
import { login } from "@/lib/api/auth";

import { LoginFormValues, loginSchema } from "../login-schema";
import { toast } from "sonner";
import { isAuthenticated, saveAuth, syncAuthCookie } from "@/lib/auth";

export default function LoginForm() {
  const router = useRouter();

  const [serverError, setServerError] = useState("");
  const [showPassword, setShowPassword] = useState(false);

  useEffect(() => {
    if (isAuthenticated()) {
      syncAuthCookie();
      router.replace("/dashboard");
    }
  }, [router]);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<LoginFormValues>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: "",
      password: "",
    },
  });

  const onSubmit = async (data: LoginFormValues) => {
    try {
      setServerError("");
      const response = await login(data);

      saveAuth(response);

      toast.success("Login successful", {
        description: `Welcome back, ${response.fullName}!`,
      });

      router.push("/dashboard");
    } catch (error: unknown) {
      const err = error as { response?: { data?: { message?: string; title?: string } } };
      const message =
        err?.response?.data?.message ||
        err?.response?.data?.title ||
        "Invalid email or password.";

      setServerError(message);
      toast.error("Login failed", {
        description: message,
      });
    }
  };

  return (
    <div>
      {serverError && (
        <div className="mb-6 rounded-xl border border-red-200 dark:border-red-900/60 bg-red-50 dark:bg-red-950/40 px-4 py-3 text-sm text-red-600 dark:text-red-400">
          {serverError}
        </div>
      )}

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
        {/* Email */}
        <div>
          <label
            htmlFor="email"
            className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2"
          >
            Email Address
          </label>
          <input
            id="email"
            type="email"
            autoComplete="email"
            placeholder="Email Address"
            {...register("email")}
            className="w-full px-4 py-3 border border-gray-300 dark:border-slate-800 rounded-xl bg-white dark:bg-slate-900 text-gray-900 dark:text-white placeholder:text-gray-400 focus:ring-2 focus:ring-blue-500 outline-none transition"
          />
          {errors.email && (
            <p className="mt-1.5 text-xs text-red-500 dark:text-red-400">
              {errors.email.message}
            </p>
          )}
        </div>

        {/* Password */}
        <div>
          <label
            htmlFor="password"
            className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2"
          >
            Password
          </label>
          <div className="relative">
            <input
              id="password"
              type={showPassword ? "text" : "password"}
              autoComplete="current-password"
              placeholder="Password"
              {...register("password")}
              className="w-full px-4 py-3 pr-12 border border-gray-300 dark:border-slate-800 rounded-xl bg-white dark:bg-slate-900 text-gray-900 dark:text-white placeholder:text-gray-400 focus:ring-2 focus:ring-blue-500 outline-none transition"
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-3 top-1/2 -translate-y-1/2 p-1 text-gray-500 hover:bg-gray-100 dark:hover:bg-slate-800 rounded-full transition"
              aria-label={showPassword ? "Hide password" : "Show password"}
            >
              {showPassword ? (
                <EyeOff className="w-5 h-5 text-gray-500" />
              ) : (
                <Eye className="w-5 h-5 text-gray-500" />
              )}
            </button>
          </div>
          {errors.password && (
            <p className="mt-1.5 text-xs text-red-500 dark:text-red-400">
              {errors.password.message}
            </p>
          )}
        </div>

        {/* Submit */}
        <button
          type="submit"
          disabled={isSubmitting}
          className="w-full bg-black dark:bg-white text-white dark:text-black py-3 px-4 rounded-xl font-medium hover:bg-gray-800 dark:hover:bg-gray-200 transition-colors shadow-sm disabled:cursor-not-allowed disabled:opacity-60"
        >
          {isSubmitting ? "Signing in..." : "Sign In"}
        </button>

      </form>
    </div>
  );
}