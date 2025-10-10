import Link from "next/link";

export default function Footer() {
  return (
    <footer className="flex flex-col gap-2 sm:flex-row py-6 w-full shrink-0 items-center px-4 md:px-6 border-t dark:border-gray-400 text-xs text-gray-500 dark:text-gray-200">
      <p>© 2025 Rent Golf. All rights reserved.</p>
      <nav className="sm:ml-auto flex gap-4">
        <Link className="hover:underline" href="/privacy">
          Privacy
        </Link>
      </nav>
    </footer>
  );
}
