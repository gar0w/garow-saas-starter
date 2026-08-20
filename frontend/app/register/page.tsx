"use client";

import { FormEvent, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";

import { AuthLayout } from "@/components/layouts/AuthLayout";
import { RedirectIfAuthenticated } from "@/components/auth/RedirectIfAuthenticated";
import { apiFetch } from "@/lib/api";
import { ActionButton } from "@/components/ui/ActionButton";
import { UserPlus } from "lucide-react";

type RegisterResponse = { username: string; email: string };

export default function RegisterPage() {
  const router = useRouter();
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmation, setConfirmation] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (password !== confirmation) {
      setError("Passwords do not match.");
      return;
    }

    setError("");
    setLoading(true);

    try {
      await apiFetch<RegisterResponse>("/api/auth/register/", {
        method: "POST",
        body: JSON.stringify({ username, email, password }),
      });
      router.push("/login?registered=1");
    } catch (requestError) {
      setError(
        requestError instanceof Error
          ? requestError.message
          : "Unable to create your account.",
      );
    } finally {
      setLoading(false);
    }
  }

  return (
    <RedirectIfAuthenticated>
      <AuthLayout
      title="Create your account"
      description="Start managing your projects and tasks."
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        <label className="block text-sm font-medium text-gray-800">
          Username
          <input
            value={username}
            onChange={(event) => setUsername(event.target.value)}
            required
            className="mt-1 w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-gray-950 outline-none focus:border-gray-950 focus:ring-2 focus:ring-gray-200"
          />
        </label>
        <label className="block text-sm font-medium text-gray-800">
          Email
          <input
            type="email"
            value={email}
            onChange={(event) => setEmail(event.target.value)}
            required
            className="mt-1 w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-gray-950 outline-none focus:border-gray-950 focus:ring-2 focus:ring-gray-200"
          />
        </label>
        <label className="block text-sm font-medium text-gray-800">
          Password
          <input
            type="password"
            minLength={8}
            value={password}
            onChange={(event) => setPassword(event.target.value)}
            required
            className="mt-1 w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-gray-950 outline-none focus:border-gray-950 focus:ring-2 focus:ring-gray-200"
          />
        </label>
        <label className="block text-sm font-medium text-gray-800">
          Confirm password
          <input
            type="password"
            minLength={8}
            value={confirmation}
            onChange={(event) => setConfirmation(event.target.value)}
            required
            className="mt-1 w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-gray-950 outline-none focus:border-gray-950 focus:ring-2 focus:ring-gray-200"
          />
        </label>
        {error && <p className="rounded-lg bg-red-50 p-3 text-sm text-red-700">{error}</p>}
        <ActionButton
          type="submit"
          disabled={loading}
          icon={<UserPlus size={17} />}
          variant="primary"
          className="w-full"
        >
          {loading ? "Creating account..." : "Create account"}
        </ActionButton>
        <p className="text-center text-sm text-gray-600">
          Already registered? <Link className="font-medium text-gray-950 underline" href="/login">Sign in</Link>
        </p>
      </form>
      </AuthLayout>
    </RedirectIfAuthenticated>
  );
}