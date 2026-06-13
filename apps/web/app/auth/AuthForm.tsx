"use client";

import { useState, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { toast } from "sonner";
import { Mail, Lock, Eye, EyeOff, ArrowRight, ArrowLeft } from "lucide-react";
import Image from "next/image";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { BRAND } from "@dropthetop/shared";

const loginSchema = z.object({
  email: z.string().trim().email({ message: "Please enter a valid email address" }),
  password: z.string().min(6, { message: "Password must be at least 6 characters" }),
});

const signupSchema = z
  .object({
    email: z.string().trim().email({ message: "Please enter a valid email address" }),
    password: z.string().min(8, { message: "Password must be at least 8 characters" }),
    confirmPassword: z.string().min(1, { message: "Please confirm your password" }),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Passwords don't match",
    path: ["confirmPassword"],
  });

const forgotSchema = z.object({
  email: z.string().trim().email({ message: "Please enter a valid email address" }),
});

const resetSchema = z
  .object({
    password: z.string().min(6, { message: "Password must be at least 6 characters" }),
    confirmPassword: z.string().min(6, { message: "Password must be at least 6 characters" }),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Passwords don't match",
    path: ["confirmPassword"],
  });

function passwordStrength(pw: string): { score: number; label: string; color: string } {
  if (!pw) return { score: 0, label: "", color: "" };
  let score = 0;
  if (pw.length >= 8)  score++;
  if (pw.length >= 12) score++;
  if (/[A-Z]/.test(pw)) score++;
  if (/[0-9]/.test(pw)) score++;
  if (/[^A-Za-z0-9]/.test(pw)) score++;
  if (score <= 1) return { score, label: "Weak",   color: "bg-red-500" };
  if (score <= 3) return { score, label: "Fair",   color: "bg-amber-500" };
  return              { score, label: "Strong", color: "bg-green-500" };
}

type LoginFormData = z.infer<typeof loginSchema>;
type SignupFormData = z.infer<typeof signupSchema>;
type ForgotFormData = z.infer<typeof forgotSchema>;
type ResetFormData = z.infer<typeof resetSchema>;
type AuthMode = "login" | "signup" | "forgot" | "reset";

export function AuthForm() {
  const searchParams = useSearchParams();
  const router = useRouter();

  const rawMode = searchParams.get("mode");
  const initialMode: AuthMode =
    rawMode === "reset" ? "reset" : rawMode === "signup" ? "signup" : "login";
  const redirectUrl = searchParams.get("redirect");
  const errorParam = searchParams.get("error");

  const [mode, setMode] = useState<AuthMode>(initialMode);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const { user, signIn, signUp, resetPassword, updatePassword } = useAuth();

  const loginForm = useForm<LoginFormData>({
    resolver: zodResolver(loginSchema),
  });
  const signupForm = useForm<SignupFormData>({
    resolver: zodResolver(signupSchema),
  });
  const signupPassword = signupForm.watch("password", "");
  const strength = passwordStrength(signupPassword);
  const forgotForm = useForm<ForgotFormData>({
    resolver: zodResolver(forgotSchema),
  });
  const resetForm = useForm<ResetFormData>({
    resolver: zodResolver(resetSchema),
  });

  useEffect(() => {
    if (errorParam === "auth_callback_error") {
      toast.error("Authentication failed. Please try again.");
    }
  }, [errorParam]);

  useEffect(() => {
    if (user && mode !== "reset") {
      handleSuccessRedirect();
    }
  }, [user, mode]);

  const handleSuccessRedirect = () => {
    if (redirectUrl) {
      if (redirectUrl.startsWith("http://") || redirectUrl.startsWith("https://")) {
        window.location.href = redirectUrl;
        return;
      }
      router.push(redirectUrl);
    } else {
      router.push("/");
    }
  };

  const onLoginSubmit = async (data: LoginFormData) => {
    setIsSubmitting(true);
    try {
      const { error } = await signIn(data.email, data.password);
      if (error) {
        toast.error(
          error.message.includes("Invalid login credentials")
            ? "Invalid credentials. Please check your email and password."
            : error.message
        );
      } else {
        handleSuccessRedirect();
      }
    } catch {
      toast.error("An unexpected error occurred. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const onSignupSubmit = async (data: SignupFormData) => {
    setIsSubmitting(true);
    try {
      const { error } = await signUp(data.email, data.password);
      if (error) {
        toast.error(
          error.message.includes("User already registered")
            ? "An account with this email already exists. Please sign in instead."
            : error.message
        );
      } else {
        toast.success("Account created! Check your email to confirm your address.");
        handleSuccessRedirect();
      }
    } catch {
      toast.error("An unexpected error occurred. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const onForgotSubmit = async (data: ForgotFormData) => {
    setIsSubmitting(true);
    try {
      const { error } = await resetPassword(data.email);
      if (error) {
        toast.error(error.message);
      } else {
        toast.success("We sent you a password reset link. Please check your inbox.");
        forgotForm.reset();
      }
    } catch {
      toast.error("An unexpected error occurred. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const onResetSubmit = async (data: ResetFormData) => {
    setIsSubmitting(true);
    try {
      const { error } = await updatePassword(data.password);
      if (error) {
        toast.error(error.message);
      } else {
        toast.success("Password updated. Please sign in.");
        setMode("login");
        router.push("/auth");
      }
    } catch {
      toast.error("An unexpected error occurred. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const subtitle: Record<AuthMode, string> = {
    login: "Sign in to your account",
    signup: "Create your account",
    forgot: "Enter your email to reset your password",
    reset: "Enter your new password",
  };

  return (
    <div className="min-h-screen bg-background flex items-center justify-center px-4 safe-top">
      {/* Background glow */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-primary/10 rounded-full blur-3xl" />
        <div className="absolute bottom-1/4 right-1/4 w-80 h-80 bg-accent/10 rounded-full blur-3xl" />
      </div>

      <div className="relative w-full max-w-md">
        {/* Brand */}
        <div className="text-center mb-8">
          <Image
            src="/logo.png"
            alt={BRAND.name}
            width={200}
            height={40}
            className="h-16 w-auto mx-auto mb-4"
            priority
          />
          <p className="text-muted-foreground">{subtitle[mode]}</p>
        </div>

        {/* Card */}
        <div className="glass-card rounded-lg p-8 glow-primary">

          {/* Login */}
          {mode === "login" && (
            <form onSubmit={loginForm.handleSubmit(onLoginSubmit)} className="space-y-6">
              <div className="space-y-2">
                <Label htmlFor="email" className="text-foreground/80 uppercase tracking-wider text-xs">
                  Email
                </Label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                  <Input
                    id="email"
                    type="email"
                    placeholder="you@example.com"
                    className="pl-10 bg-input border-border focus:border-primary"
                    {...loginForm.register("email")}
                  />
                </div>
                {loginForm.formState.errors.email && (
                  <p className="text-destructive text-sm">{loginForm.formState.errors.email.message}</p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="password" className="text-foreground/80 uppercase tracking-wider text-xs">
                  Password
                </Label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                  <Input
                    id="password"
                    type={showPassword ? "text" : "password"}
                    placeholder="••••••••"
                    className="pl-10 pr-10 bg-input border-border focus:border-primary"
                    {...loginForm.register("password")}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                  >
                    {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                  </button>
                </div>
                {loginForm.formState.errors.password && (
                  <p className="text-destructive text-sm">{loginForm.formState.errors.password.message}</p>
                )}
                <button
                  type="button"
                  onClick={() => setMode("forgot")}
                  className="text-sm text-accent hover:text-foreground transition-colors"
                >
                  Forgot Password?
                </button>
              </div>

              <Button type="submit" disabled={isSubmitting} className="w-full btn-racing h-12 text-lg">
                {isSubmitting ? (
                  <span className="flex items-center gap-2">
                    <div className="w-5 h-5 border-2 border-primary-foreground/30 border-t-primary-foreground rounded-full animate-spin" />
                    Signing in...
                  </span>
                ) : (
                  <span className="flex items-center gap-2">
                    Sign In
                    <ArrowRight className="w-5 h-5" />
                  </span>
                )}
              </Button>
            </form>
          )}

          {/* Sign Up */}
          {mode === "signup" && (
            <form onSubmit={signupForm.handleSubmit(onSignupSubmit)} className="space-y-6">
              <div className="space-y-2">
                <Label htmlFor="signup-email" className="text-foreground/80 uppercase tracking-wider text-xs">
                  Email
                </Label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                  <Input
                    id="signup-email"
                    type="email"
                    placeholder="you@example.com"
                    className="pl-10 bg-input border-border focus:border-primary"
                    {...signupForm.register("email")}
                  />
                </div>
                {signupForm.formState.errors.email && (
                  <p className="text-destructive text-sm">{signupForm.formState.errors.email.message}</p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="signup-password" className="text-foreground/80 uppercase tracking-wider text-xs">
                  Password
                </Label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                  <Input
                    id="signup-password"
                    type={showPassword ? "text" : "password"}
                    placeholder="••••••••"
                    className="pl-10 pr-10 bg-input border-border focus:border-primary"
                    {...signupForm.register("password")}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                  >
                    {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                  </button>
                </div>
                {signupForm.formState.errors.password && (
                  <p className="text-destructive text-sm">{signupForm.formState.errors.password.message}</p>
                )}
                {signupPassword.length > 0 && (
                  <div className="space-y-1">
                    <div className="flex gap-1">
                      {[1, 2, 3, 4].map((i) => (
                        <div
                          key={i}
                          className={`h-1 flex-1 rounded-full transition-colors duration-300 ${
                            strength.score >= i ? strength.color : "bg-muted"
                          }`}
                        />
                      ))}
                    </div>
                    <p className={`text-xs font-medium ${
                      strength.label === "Weak" ? "text-red-500" :
                      strength.label === "Fair" ? "text-amber-500" : "text-green-500"
                    }`}>
                      {strength.label}
                    </p>
                  </div>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="signup-confirm-password" className="text-foreground/80 uppercase tracking-wider text-xs">
                  Confirm Password
                </Label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                  <Input
                    id="signup-confirm-password"
                    type={showConfirmPassword ? "text" : "password"}
                    placeholder="••••••••"
                    className="pl-10 pr-10 bg-input border-border focus:border-primary"
                    {...signupForm.register("confirmPassword")}
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                  >
                    {showConfirmPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                  </button>
                </div>
                {signupForm.formState.errors.confirmPassword && (
                  <p className="text-destructive text-sm">{signupForm.formState.errors.confirmPassword.message}</p>
                )}
              </div>

              <Button type="submit" disabled={isSubmitting} className="w-full btn-racing h-12 text-lg">
                {isSubmitting ? (
                  <span className="flex items-center gap-2">
                    <div className="w-5 h-5 border-2 border-primary-foreground/30 border-t-primary-foreground rounded-full animate-spin" />
                    Creating account...
                  </span>
                ) : (
                  <span className="flex items-center gap-2">
                    Create Account
                    <ArrowRight className="w-5 h-5" />
                  </span>
                )}
              </Button>
            </form>
          )}

          {/* Forgot Password */}
          {mode === "forgot" && (
            <form onSubmit={forgotForm.handleSubmit(onForgotSubmit)} className="space-y-6">
              <div className="space-y-2">
                <Label htmlFor="forgot-email" className="text-foreground/80 uppercase tracking-wider text-xs">
                  Email
                </Label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                  <Input
                    id="forgot-email"
                    type="email"
                    placeholder="you@example.com"
                    className="pl-10 bg-input border-border focus:border-primary"
                    {...forgotForm.register("email")}
                  />
                </div>
                {forgotForm.formState.errors.email && (
                  <p className="text-destructive text-sm">{forgotForm.formState.errors.email.message}</p>
                )}
              </div>

              <Button type="submit" disabled={isSubmitting} className="w-full btn-racing h-12 text-lg">
                {isSubmitting ? (
                  <span className="flex items-center gap-2">
                    <div className="w-5 h-5 border-2 border-primary-foreground/30 border-t-primary-foreground rounded-full animate-spin" />
                    Sending...
                  </span>
                ) : (
                  <span className="flex items-center gap-2">
                    Send Reset Link
                    <ArrowRight className="w-5 h-5" />
                  </span>
                )}
              </Button>

              <button
                type="button"
                onClick={() => setMode("login")}
                className="w-full flex items-center justify-center gap-2 text-muted-foreground hover:text-foreground transition-colors"
              >
                <ArrowLeft className="w-4 h-4" />
                Back to Sign In
              </button>
            </form>
          )}

          {/* Reset Password */}
          {mode === "reset" && (
            <form onSubmit={resetForm.handleSubmit(onResetSubmit)} className="space-y-6">
              <div className="space-y-2">
                <Label htmlFor="new-password" className="text-foreground/80 uppercase tracking-wider text-xs">
                  New Password
                </Label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                  <Input
                    id="new-password"
                    type={showPassword ? "text" : "password"}
                    placeholder="••••••••"
                    className="pl-10 pr-10 bg-input border-border focus:border-primary"
                    {...resetForm.register("password")}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                  >
                    {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                  </button>
                </div>
                {resetForm.formState.errors.password && (
                  <p className="text-destructive text-sm">{resetForm.formState.errors.password.message}</p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="confirm-password" className="text-foreground/80 uppercase tracking-wider text-xs">
                  Confirm Password
                </Label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                  <Input
                    id="confirm-password"
                    type={showConfirmPassword ? "text" : "password"}
                    placeholder="••••••••"
                    className="pl-10 pr-10 bg-input border-border focus:border-primary"
                    {...resetForm.register("confirmPassword")}
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                  >
                    {showConfirmPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                  </button>
                </div>
                {resetForm.formState.errors.confirmPassword && (
                  <p className="text-destructive text-sm">{resetForm.formState.errors.confirmPassword.message}</p>
                )}
              </div>

              <Button type="submit" disabled={isSubmitting} className="w-full btn-racing h-12 text-lg">
                {isSubmitting ? (
                  <span className="flex items-center gap-2">
                    <div className="w-5 h-5 border-2 border-primary-foreground/30 border-t-primary-foreground rounded-full animate-spin" />
                    Updating...
                  </span>
                ) : (
                  <span className="flex items-center gap-2">
                    Set New Password
                    <ArrowRight className="w-5 h-5" />
                  </span>
                )}
              </Button>
            </form>
          )}

          {/* Toggle login/signup */}
          {(mode === "login" || mode === "signup") && (
            <div className="mt-6 pt-6 border-t border-border text-center">
              <p className="text-muted-foreground">
                {mode === "login" ? "Don't have an account?" : "Already have an account?"}
              </p>
              <button
                onClick={() => {
                  setMode(mode === "login" ? "signup" : "login");
                  loginForm.reset();
                }}
                className="mt-2 text-primary hover:text-accent transition-colors font-semibold uppercase tracking-wider text-sm"
              >
                {mode === "login" ? "Create Account" : "Sign In"}
              </button>
            </div>
          )}
        </div>

        <div className="text-center mt-6">
          <a href="/" className="text-muted-foreground hover:text-foreground transition-colors text-sm">
            ← Back to Home
          </a>
        </div>
      </div>
    </div>
  );
}
