import Link from "next/link";
import Image from "next/image";

export const Header = () => {
    return (
        <header className="border-b border-white/10 backdrop-blur-md sticky top-0 z-50">
            <div className="container flex items-center justify-between h-16">
                <Link href="/" className="flex items-center gap-2">
                    <span className="text-xl font-semibold">InventarioSaaS</span>
                </Link>

                <nav className="hidden md:flex items-center gap-6">
                    <Link href="/features" className="text-[#c0f2d0] hover:text-white transition-colors">
                        Características
                    </Link>
                    <Link href="/pricing" className="text-[#a4c5ec] hover:text-white transition-colors">
                        Precios
                    </Link>
                    <Link href="/docs" className="text-[#d9dee4] hover:text-white transition-colors">
                        Documentación
                    </Link>
                    <Link href="/change" className="text-white/70 hover:text-white transition-colors">
                        Actualizaciones
                    </Link>
                </nav>

                <div className="flex items-center gap-3">
                    <Link
                        href="/login"
                        className="hidden md:block px-4 py-2 text-sm text-[#a4c5ec] hover:text-white transition-colors"
                    >
                        Iniciar Sesión
                    </Link>
                    <Link
                        href="/register"
                        className="px-4 py-2 text-sm bg-[#c0f2d0] text-black rounded-md hover:bg-[#a4c5ec] transition-colors"
                    >
                        Registrarse
                    </Link>
                </div>
            </div>
        </header>
    );
};