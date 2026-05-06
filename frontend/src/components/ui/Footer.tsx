import Link from "next/link";

export default function Footer() {
  return (
    <footer className="flex flex-col gap-2 sm:flex-row py-5 w-full shrink-0 items-center px-5 md:px-8 border-t border-border text-xs text-muted-foreground">
      <p>© 2025 Rent Golf</p>
      <nav className="sm:ml-auto flex gap-4">
        <Link className="hover:text-foreground transition-colors" href="/privacy">
          Privacy
        </Link>
      </nav>
    </footer>
  );
}
