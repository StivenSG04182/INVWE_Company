import Link from "next/link";
import Image from "next/image";
import { UserButton } from "@clerk/nextjs";

export const Header = () => {
  return (
    <header className="border-b border-white/10 backdrop-blur-md sticky top-0 z-50">
      <div className="container flex items-center justify-between h-16">
        <Link href="/" className="flex items-center gap-2">
          <span className="text-xl font-semibold">INVWE</span>
        </Link>

        <nav className="hidden md:flex items-center gap-6">
          <Link
            href="/features"
            className="text-white hover:text-white transition-colors"
          >
            Características
          </Link>
          <Link
            href="/pricing"
            className="text-white hover:text-white transition-colors"
          >
            Precios
          </Link>
          <Link
            href="/docs"
            className="text-white hover:text-white transition-colors"
          >
            Documentación
          </Link>
          <Link
            href="/change"
            className="text-white hover:text-white transition-colors"
          >
            Actualizaciones
          </Link>
        </nav>

        <div className="flex items-center gap-3">
          <Link
            href={"/agency"}
            className="bg-primary text-white p-2 px-4 rounded-md"
          >
            Login
          </Link>
          <UserButton />
        </div>
      </div>
    </header>
  );
};
