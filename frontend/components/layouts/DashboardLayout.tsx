"use client";

import type { ReactNode } from "react";
import { SiteLayout } from "@/components/layouts/SiteLayout";

type DashboardLayoutProps = {
  username?: string;
  children: ReactNode;
};

export function DashboardLayout({
  username,
  children,
}: DashboardLayoutProps) {
  return (
    <SiteLayout authenticated username={username}>
      <section className="mx-auto max-w-6xl px-6 py-10">{children}</section>
    </SiteLayout>
  );
}
