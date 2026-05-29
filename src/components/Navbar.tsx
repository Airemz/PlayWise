import Link from "next/link";
import { Gamepad2 } from "lucide-react";

const links = [
  { href: "/search", label: "Search" },
  { href: "/saved", label: "Saved" },
  { href: "/recommend", label: "Recommend" },
  { href: "/recommend/history", label: "History" },
];

export function Navbar() {
  return (
    <header className="sticky top-0 z-40 border-b border-border/60 glass">
      <div className="container flex h-16 items-center justify-between">
        <Link href="/" className="flex items-center gap-2 font-semibold tracking-tight">
          <Gamepad2 className="h-5 w-5 text-primary" />
          <span>PlayWise</span>
        </Link>
        <nav className="flex items-center gap-1 text-sm">
          {links.map((l) => (
            <Link
              key={l.href}
              href={l.href}
              className="rounded-md px-3 py-1.5 text-muted-foreground transition-colors hover:bg-secondary hover:text-foreground"
            >
              {l.label}
            </Link>
          ))}
        </nav>
      </div>
    </header>
  );
}
