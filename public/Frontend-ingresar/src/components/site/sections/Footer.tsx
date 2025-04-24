import Link from "next/link";

export const Footer = () => {
    return (
        <footer className="border-t border-white/10 py-12 mt-20">
            <div className="container">
                <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
                    <div>
                        <h3 className="text-lg font-medium mb-4 text-[#c0f2d0]">InventarioSaaS</h3>
                        <p className="text-sm text-white/60 mb-4">
                            Solución integral para gestión de inventario y facturación electrónica.
                        </p>
                    </div>

                    <div>
                        <h4 className="text-sm font-medium mb-4 text-[#a4c5ec]">Producto</h4>
                        <ul className="space-y-2 text-sm text-white/60">
                            <li>
                                <Link href="/features" className="hover:text-white transition-colors">
                                    Características
                                </Link>
                            </li>
                            <li>
                                <Link href="/pricing" className="hover:text-white transition-colors">
                                    Precios
                                </Link>
                            </li>
                            <li>
                                <Link href="/change" className="hover:text-white transition-colors">
                                    Actualizaciones
                                </Link>
                            </li>
                        </ul>
                    </div>

                    <div>
                        <h4 className="text-sm font-medium mb-4 text-[#d9dee4]">Recursos</h4>
                        <ul className="space-y-2 text-sm text-white/60">
                            <li>
                                <Link href="/docs" className="hover:text-white transition-colors">
                                    Documentación
                                </Link>
                            </li>
                            <li>
                                <Link href="/docs/guides/database" className="hover:text-white transition-colors">
                                    Guías
                                </Link>
                            </li>
                            <li>
                                <Link href="/developers" className="hover:text-white transition-colors">
                                    API
                                </Link>
                            </li>
                        </ul>
                    </div>

                    <div>
                        <h4 className="text-sm font-medium mb-4 text-[#c0f2d0]">Empresa</h4>
                        <ul className="space-y-2 text-sm text-white/60">
                            <li>
                                <Link href="/about" className="hover:text-white transition-colors">
                                    Sobre Nosotros
                                </Link>
                            </li>
                            <li>
                                <Link href="/contact" className="hover:text-white transition-colors">
                                    Contacto
                                </Link>
                            </li>
                            <li>
                                <Link href="/legal" className="hover:text-white transition-colors">
                                    Legal
                                </Link>
                            </li>
                        </ul>
                    </div>
                </div>

                <div className="border-t border-white/10 mt-12 pt-6 flex flex-col md:flex-row justify-between items-center">
                    <p className="text-sm text-white/40 mb-4 md:mb-0">
                        © 2023 InventarioSaaS. Todos los derechos reservados.
                    </p>

                    <div className="flex items-center gap-4">
                        <Link href="/privacy" className="text-sm text-white/40 hover:text-white transition-colors">
                            Privacidad
                        </Link>
                        <Link href="/terms" className="text-sm text-white/40 hover:text-white transition-colors">
                            Términos
                        </Link>
                    </div>
                </div>
            </div>
        </footer>
    );
};