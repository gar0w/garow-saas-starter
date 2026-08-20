"use client";

import { useEffect, useState, type ReactNode } from "react";
import { useRouter } from "next/navigation";

import { apiFetch } from "@/lib/api";

type RedirectIfAuthenticatedProps = {
  children: ReactNode;
};

type SessionUser = {
  id: number;
  username: string;
  email: string;
};

export function RedirectIfAuthenticated({
  children,
}: RedirectIfAuthenticatedProps) {
  const router = useRouter();
  const [checking, setChecking] = useState(true);

  useEffect(() => {
    const accessToken = localStorage.getItem("access_token");

    if (!accessToken) {
      window.setTimeout(() => setChecking(false), 0);
      return;
    }

    apiFetch<SessionUser>("/api/auth/me/")
      .then(() => router.replace("/dashboard"))
      .catch(() => setChecking(false));
  }, [router]);

  if (checking) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-gray-50 text-sm text-gray-600">
        Checking your session...
      </main>
    );
  }

  return children;
}
