import { Suspense } from "react";
import type { Metadata } from "next";
import { BRAND } from "@dropthetop/shared";
import { AuthForm } from "./AuthForm";

const MODE_TITLES: Record<string, string> = {
  signup: "Create Account",
  forgot: "Reset Password",
  reset: "Set New Password",
};

export async function generateMetadata({
  searchParams,
}: {
  searchParams: Promise<{ mode?: string }>;
}): Promise<Metadata> {
  const { mode } = await searchParams;
  const title = MODE_TITLES[mode ?? ""] ?? "Sign In";
  return {
    title: `${title} | ${BRAND.name}`,
    description:
      mode === "signup"
        ? `Create a ${BRAND.name} account to start buying or selling Corvettes.`
        : `Sign in to your ${BRAND.name} account to buy or sell Corvettes.`,
    robots: { index: false, follow: false },
  };
}

export default function AuthPage() {
  return (
    <Suspense>
      <AuthForm />
    </Suspense>
  );
}
