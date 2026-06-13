import Link from "next/link";
import { BrandMark } from "@/components/brand-mark";

export default function NotFound() {
  return (
    <main className="grid min-h-screen place-items-center bg-bg px-4">
      <div className="w-full max-w-sm text-center">
        <BrandMark className="mx-auto h-12 w-12" />
        <p className="mt-6 font-mono text-sm font-medium tabular text-accent-ink">404</p>
        <h1 className="mt-1 text-2xl font-semibold tracking-tight text-ink">Page not found</h1>
        <p className="mt-2 text-sm text-muted">
          This page doesn&apos;t exist, or you don&apos;t have access to it.
        </p>
        <Link
          href="/dashboard"
          className="mt-6 inline-flex h-9 items-center justify-center rounded-md bg-accent px-4 text-sm font-medium text-accent-contrast shadow-sm transition-colors hover:bg-accent-hover"
        >
          Back to dashboard
        </Link>
      </div>
    </main>
  );
}
