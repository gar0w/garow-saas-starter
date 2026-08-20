import type { ReactNode } from "react";

import { Footer } from "@/components/navigation/Footer";
import { Navbar } from "@/components/navigation/Navbar";

type SiteLayoutProps = {
  children: ReactNode;
  tone?: "light" | "dark";
  authenticated?: boolean;
  username?: string;
  showFooter?: boolean;
};

export function SiteLayout({
  children,
  tone = "light",
  authenticated = false,
  username,
  showFooter = true,
}: SiteLayoutProps) {
  const dark = tone === "dark";

  return (
    <div className={dark ? "flex min-h-screen flex-col bg-zinc-950" : "flex min-h-screen flex-col bg-gray-50"}>
      <Navbar tone={tone} authenticated={authenticated} username={username} />
      <div className="flex-1">{children}</div>
      {showFooter && <Footer tone={tone} />}
    </div>
  );
}
