"use client";

import Link from "next/link";

export default function Header() {
  return (
    <header className="bg-background sticky top-0 z-50 w-full border-b">
      <div className="container flex h-14 items-center">
        <Link href="/" className="font-bold">
          Boilerplate
        </Link>
        {/* Add navigation, theme switcher, etc. here */}
      </div>
    </header>
  );
} 