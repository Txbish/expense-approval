import Link from "next/link";
import { BrandMark } from "@/components/brand-mark";

export default function NotFound() {
  return (
    <main className="grid min-h-screen place-items-center bg-cream px-4">
      <div className="w-full max-w-sm text-center text-ink">
        <BrandMark className="mx-auto h-12 w-12" />
        <p className="mt-6 text-2xs font-medium uppercase tracking-[0.18em] text-storm/55">Error 404</p>
        <h1 className="mt-2 text-heading-sm lowercase text-ink">page not found.</h1>
        <p className="mt-2 text-caption text-storm/70">
          This page doesn&apos;t exist, or you don&apos;t have access to it.
        </p>
        <Link
          href="/dashboard"
          className="mt-7 inline-flex h-11 items-center justify-center rounded-full bg-ink px-6 text-field font-medium text-cream transition-colors hover:bg-storm"
        >
          Back to dashboard
        </Link>
      </div>
    </main>
  );
}
