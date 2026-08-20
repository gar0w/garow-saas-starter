import Link from "next/link";

import { RedirectIfAuthenticated } from "@/components/auth/RedirectIfAuthenticated";
import { SiteLayout } from "@/components/layouts/SiteLayout";

export default function Home() {
  return (
    <RedirectIfAuthenticated>
      <SiteLayout>
        <main className="mx-auto flex min-h-[calc(100vh-9rem)] max-w-5xl flex-col justify-center px-6 text-gray-950">
        <section className="max-w-2xl py-20">
          <p className="mb-5 text-sm font-medium uppercase tracking-[0.2em] text-emerald-700">
            Project workspace
          </p>
          <h1 className="text-5xl font-semibold tracking-tight sm:text-7xl">
            Turn plans into progress.
          </h1>
          <p className="mt-6 max-w-xl text-lg leading-8 text-gray-600">
            Keep projects, tasks and the next important action in one focused workspace.
          </p>
          <div className="mt-10 flex flex-col gap-3 sm:flex-row">
            <Link href="/register" className="rounded-lg bg-emerald-600 px-5 py-3 text-center font-semibold text-white hover:bg-emerald-700">
              Create free workspace
            </Link>
            <Link href="/login" className="rounded-lg border border-gray-300 px-5 py-3 text-center font-semibold text-gray-900 hover:bg-gray-100">
              Sign in
            </Link>
          </div>
        </section>
        </main>
      </SiteLayout>
    </RedirectIfAuthenticated>
  );
}
