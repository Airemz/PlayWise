export function Footer() {
  return (
    <footer className="border-t border-border/60 py-8 text-sm text-muted-foreground">
      <div className="container flex flex-col items-center justify-between gap-2 sm:flex-row">
        <p>PlayWise — game discovery powered by RAWG, CheapShark, and Gemini.</p>
        <p className="text-xs">Built with Next.js · Tailwind · MongoDB</p>
      </div>
    </footer>
  );
}
