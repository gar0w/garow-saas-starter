"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";

import { logoutSession } from "@/lib/api";
import { ThemeSwitch } from "@/components/theme/ThemeSwitch";
import { LogOut } from "lucide-react";
import { ActionButton } from "@/components/ui/ActionButton";

type NavbarProps = {
  username?: string;
  tone?: "light" | "dark";
  authenticated?: boolean;
};

export function Navbar({
  username,
  tone = "light",
  authenticated = false,
}: NavbarProps) {
  const router = useRouter();
  const dark = tone === "dark";

  async function handleLogout() {
    await logoutSession();
    router.replace("/login");
  }

  return (
    <nav
      className={dark
        ? "border-b border-zinc-800 bg-zinc-950 text-white"
        : "border-b border-gray-200 bg-white text-gray-950"}
    >
      <div className="mx-auto flex max-w-6xl items-center justify-between px-6 py-4">
        <Link href={authenticated ? "/dashboard" : "/"} className="text-xl font-bold">
          Garow
        </Link>
        {authenticated ? (
          <div className="flex items-center gap-4">
            {username && (
              <span className={dark ? "text-sm text-zinc-300" : "text-sm text-gray-500"}>
                {username}
              </span>
            )}
            <ActionButton
              onClick={handleLogout}
              icon={<LogOut size={16} />}
              className={dark ? "border-zinc-700 bg-zinc-950 text-white hover:bg-zinc-900" : ""}
            >
              Sign out
            </ActionButton>
            <ThemeSwitch />
          </div>
        ) : (
          <div className="flex items-center gap-4">
            <Link
              href="/login"
              className={dark ? "text-sm text-zinc-300 underline underline-offset-4 hover:text-white" : "text-sm text-gray-600 underline underline-offset-4 hover:text-gray-950"}
            >
              Sign in
            </Link>
            <ThemeSwitch />
          </div>
        )}
      </div>
    </nav>
  );
}
