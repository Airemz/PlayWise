import Link from "next/link";

export default function NotFound() {
  return (
    <div className="container flex min-h-[60vh] flex-col items-center justify-center text-center">
      <h1 className="text-5xl font-bold tracking-tight">404</h1>
      <p className="mt-3 text-muted-foreground">That game or page doesn&apos;t exist.</p>
      <Link
        href="/"
        className="mt-6 inline-flex h-10 items-center rounded-md bg-primary px-4 text-sm font-medium text-primary-foreground hover:bg-primary/90"
      >
        Back home
      </Link>
    </div>
  );
}
