"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useState } from "react";
import { Eye, EyeOff } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { registerSchema, type RegisterFormValues } from "@/features/auth/schemas";
import { useRegisterMutation } from "@/features/auth/auth-api";
import { useAppDispatch } from "@/store/hooks";
import { setToken } from "@/store/auth-slice";
import { normalizeError } from "@/store/base-api";

export default function RegisterPage() {
  const router = useRouter();
  const dispatch = useAppDispatch();
  const [register, { isLoading }] = useRegisterMutation();
  const [showPassword, setShowPassword] = useState(false);
  const [serverError, setServerError] = useState<string | null>(null);

  const form = useForm<RegisterFormValues>({
    resolver: zodResolver(registerSchema),
    defaultValues: {
      fullName: "",
      email: "",
      password: "",
    },
    mode: "onChange",
  });

  const password = form.watch("password") || "";
  const hasMinLength = password.length >= 10;

  const onSubmit = async (values: RegisterFormValues) => {
    setServerError(null);
    try {
      const result = await register(values).unwrap();
      const token = (result as any)?.accessToken || (result as any)?.token;
      if (token) {
        dispatch(setToken(token));
      }
      router.replace("/onboarding");
    } catch (err: any) {
      const apiErr = normalizeError(err);
      if (apiErr.status === 0) {
        setServerError("Network error. Please try again.");
        return;
      }
      setServerError(apiErr.message || "Registration failed. Please try again.");
      // Try to map field errors if present
      if (Array.isArray((apiErr as any).details)) {
        const details = (apiErr as any).details as Array<Record<string, any>>;
        for (const d of details) {
          if (d.field && typeof d.message === "string") {
            form.setError(d.field as keyof RegisterFormValues, { type: "server", message: d.message });
          }
        }
      }
    }
  };

  return (
    <div className="space-y-6">
      <div className="space-y-2 text-center lg:text-left">
        <h1 className="text-2xl font-semibold tracking-tight">Create your account</h1>
        <p className="text-sm text-muted-foreground">Start understanding your business data</p>
      </div>
      {serverError ? (
        <div className="rounded-md border border-destructive/50 bg-destructive/10 px-3 py-2 text-sm text-destructive">
          {serverError}
        </div>
      ) : null}
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4" noValidate>
          <FormField
            control={form.control}
            name="fullName"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Full name</FormLabel>
                <FormControl>
                  <Input {...field} autoComplete="name" autoFocus placeholder="Your name" />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="email"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Work email</FormLabel>
                <FormControl>
                  <Input {...field} type="email" autoComplete="email" placeholder="you@company.com" />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="password"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Password</FormLabel>
                <FormControl>
                  <div className="relative">
                    <Input
                      {...field}
                      type={showPassword ? "text" : "password"}
                      autoComplete="new-password"
                      placeholder="••••••••••••"
                      className="pr-10"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword((v) => !v)}
                      className="absolute right-2 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                      aria-label={showPassword ? "Hide password" : "Show password"}
                    >
                      {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                    </button>
                  </div>
                </FormControl>
                <div className="flex items-center gap-2 text-xs text-muted-foreground">
                  <span className={hasMinLength ? "text-green-600 dark:text-green-400" : ""}>
                    {hasMinLength ? "✓" : "( )"}
                  </span>
                  <span>At least 10 characters</span>
                </div>
                <FormMessage />
              </FormItem>
            )}
          />
          <Button type="submit" className="w-full" disabled={isLoading}>
            {isLoading ? "Creating account..." : "Create account"}
          </Button>
        </form>
      </Form>
      <div className="text-center text-xs text-muted-foreground">
        By creating an account you agree to the Terms and Privacy Policy.
      </div>
      <div className="text-center text-sm text-muted-foreground">
        Already have an account?{" "}
        <Link href="/login" className="text-primary hover:underline">
          Log in
        </Link>
      </div>
    </div>
  );
}
