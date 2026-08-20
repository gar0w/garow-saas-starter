"use client";

import { FormEvent, useState } from "react";
import { useRouter } from "next/navigation";

import { apiFetch } from "@/lib/api";
import { AuthLayout } from "@/components/layouts/AuthLayout";
import Link from "next/link";
import { RedirectIfAuthenticated } from "@/components/auth/RedirectIfAuthenticated";
import { ActionButton } from "@/components/ui/ActionButton";
import { LogIn } from "lucide-react";

type LoginResponse = {
  access: string;
  refresh: string;
};

export default function LoginPage() {
  const router = useRouter();

  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    setError("");
    setLoading(true);

    try {
      const data = await apiFetch<LoginResponse>("/api/auth/login/", {
        method: "POST",
        body: JSON.stringify({
          username,
          password,
        }),
      });

      localStorage.setItem("access_token", data.access);
      localStorage.setItem("refresh_token", data.refresh);

      router.push("/dashboard");
    } catch (error) {
      setError(
        error instanceof Error
          ? error.message
          : "Unable to sign in.",
      );
    } finally {
      setLoading(false);
    }
  }

  return (
    <RedirectIfAuthenticated>
      <AuthLayout
        title="Sign in"
        description="Sign in to your SaaS dashboard."
      >
        <form
          onSubmit={handleSubmit}
          className="space-y-4"
        >
          <div>
            <label
              htmlFor="username"
              className="mb-1 block text-sm font-medium text-gray-800"
            >
              Username
            </label>

            <input
              id="username"
              type="text"
              value={username}
              onChange={(event) =>
                setUsername(event.target.value)
              }
              required
              className="w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-gray-950 outline-none placeholder:text-gray-400 focus:border-gray-950 focus:ring-2 focus:ring-gray-200"
            />
          </div>

          <div>
            <label
              htmlFor="password"
              className="mb-1 block text-sm font-medium text-gray-800"
            >
              Password
            </label>

            <input
              id="password"
              type="password"
              value={password}
              onChange={(event) =>
                setPassword(event.target.value)
              }
              required
              className="w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-gray-950 outline-none placeholder:text-gray-400 focus:border-gray-950 focus:ring-2 focus:ring-gray-200"
            />
          </div>

          {error && (
            <p className="rounded-lg bg-red-50 p-3 text-sm text-red-600">
              {error}
            </p>
          )}

          <ActionButton
            type="submit"
            disabled={loading}
            icon={<LogIn size={17} />}
            variant="primary"
            className="w-full"
          >
            {loading ? "Signing in..." : "Sign in"}
          </ActionButton>
          <p className="text-center text-sm text-gray-600">
            Need an account? <Link className="font-medium text-gray-950 underline" href="/register">Create one</Link>
          </p>
        </form>
      </AuthLayout>
    </RedirectIfAuthenticated>
  );
}