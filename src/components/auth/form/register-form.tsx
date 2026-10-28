"use client";

import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Eye, EyeOff } from "lucide-react";
import { register as registerApi } from "@/lib/api/auth";
import { RegisterFormValues, registerSchema } from "../register-schema";
import { toast } from "sonner";
import { isAuthenticated, saveAuth, syncAuthCookie } from "@/lib/auth";

export default function RegisterForm() {
    const router = useRouter();

    const [serverError, setServerError] = useState("");
    const [showPassword, setShowPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);

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
    } = useForm<RegisterFormValues>({
        resolver: zodResolver(registerSchema),
        defaultValues: {
            fullName: "",
            email: "",
            password: "",
            confirmPassword: "",
        },
    });

    const onSubmit = async (data: RegisterFormValues) => {
        try {
            setServerError("");

            // Backend only expects fullName, email, and password
            const response = await registerApi({
                fullName: data.fullName,
                email: data.email,
                password: data.password,
            });

            saveAuth(response);

            toast.success("Account created successfully", {
                description: `Welcome, ${response.fullName}!`,
            });

            router.push("/dashboard");
        } catch (error: unknown) {
            const err = error as { response?: { data?: { message?: string; title?: string } } };
            const message =
                err?.response?.data?.message ||
                err?.response?.data?.title ||
                "Registration failed. Please try again.";

            setServerError(message);
            toast.error("Registration failed", {
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
                {/* Full Name */}
                <div>
                    <label
                        htmlFor="fullName"
                        className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2"
                    >
                        Full Name
                    </label>
                    <input
                        id="fullName"
                        type="text"
                        autoComplete="name"
                        placeholder="John Doe"
                        {...register("fullName")}
                        className="w-full px-4 py-3 border border-gray-300 dark:border-slate-800 rounded-xl bg-white dark:bg-slate-900 text-gray-900 dark:text-white placeholder:text-gray-400 focus:ring-2 focus:ring-blue-500 outline-none transition"
                    />
                    {errors.fullName && (
                        <p className="mt-1.5 text-xs text-red-500 dark:text-red-400">
                            {errors.fullName.message}
                        </p>
                    )}
                </div>

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
                            autoComplete="new-password"
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

                {/* Confirm Password */}
                <div>
                    <label
                        htmlFor="confirmPassword"
                        className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2"
                    >
                        Confirm Password
                    </label>
                    <div className="relative">
                        <input
                            id="confirmPassword"
                            type={showConfirmPassword ? "text" : "password"}
                            autoComplete="new-password"
                            placeholder="Confirm Password"
                            {...register("confirmPassword")}
                            className="w-full px-4 py-3 pr-12 border border-gray-300 dark:border-slate-800 rounded-xl bg-white dark:bg-slate-900 text-gray-900 dark:text-white placeholder:text-gray-400 focus:ring-2 focus:ring-blue-500 outline-none transition"
                        />
                        <button
                            type="button"
                            onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                            className="absolute right-3 top-1/2 -translate-y-1/2 p-1 text-gray-500 hover:bg-gray-100 dark:hover:bg-slate-800 rounded-full transition"
                            aria-label={showConfirmPassword ? "Hide confirm password" : "Show confirm password"}
                        >
                            {showConfirmPassword ? (
                                <EyeOff className="w-5 h-5 text-gray-500" />
                            ) : (
                                <Eye className="w-5 h-5 text-gray-500" />
                            )}
                        </button>
                    </div>
                    {errors.confirmPassword && (
                        <p className="mt-1.5 text-xs text-red-500 dark:text-red-400">
                            {errors.confirmPassword.message}
                        </p>
                    )}
                </div>

                {/* Submit */}
                <button
                    type="submit"
                    disabled={isSubmitting}
                    className="w-full bg-black dark:bg-white text-white dark:text-black py-3 px-4 rounded-xl font-medium hover:bg-gray-800 dark:hover:bg-gray-200 transition-colors shadow-sm disabled:cursor-not-allowed disabled:opacity-60"
                >
                    {isSubmitting ? "Creating account..." : "Sign Up"}
                </button>
            </form>
        </div>
    );
}
