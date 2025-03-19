"use client";

import { Button } from "@/components/ui/button";
import Link from "next/link";
import { useTheme } from "next-themes";

export default function Page() {
    const { theme } = useTheme();
    return (
        <section className="py-12 relative min-h-screen bg-gradient-to-b">
            {/* Sección de bienvenida */}
            <div className="max-w-7xl mx-auto bg-white/80 dark:bg-gray-800/80 backdrop-blur-lg p-8 rounded-2xl shadow-lg border border-gray-200 dark:border-gray-700 flex flex-col md:flex-row items-center mb-12 transition-all duration-300 hover:shadow-xl">
                <div className="flex-1 text-center md:text-left">
                    <h2 className="text-4xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-[#5080ce] to-[#5080ce] dark:from-[#ce9e50] dark:to-[#ce9e50]">¡¡Bienvenido al Blog de INVWE!!</h2>
                    <p className="mt-4 text-gray-600 dark:text-gray-300 text-lg">
                        Aquí te contaremos sobre nuestros procesos, productos y servicios.
                    </p>
                </div>
                <div className="mt-8 md:mt-0 md:ml-8">
                    <div className="relative overflow-hidden rounded-2xl shadow-2xl transform transition-transform hover:scale-105">
                        <img
                            src="/imagen_blog.jpg"
                            alt="Imagen del blog"
                            className="w-80 h-48 object-cover"
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-black/30 to-transparent"></div>
                    </div>
                </div>
            </div>

            {/* Tarjetas de contenido */}
            <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-8">
                {/* Tarjeta 1 */}
                <div className="group bg-white/80 dark:bg-gray-800/80 backdrop-blur-lg p-8 rounded-2xl shadow-lg border border-gray-200 dark:border-gray-700 text-center transition-all duration-300 hover:shadow-xl hover:scale-105 hover:border-blue-500 dark:hover:border-blue-400">
                    <div className="h-full flex flex-col justify-between">
                        <p className="text-gray-700 dark:text-gray-300 text-lg mb-6">
                            Te contamos cómo va el desarrollo de nuestro inventario interactivo.
                        </p>
                        <Link href="/notes" className="inline-block w-full">
                            <Button className="w-full bg-gradient-to-r from-[#5080ce] to-[#5080ce] dark:from-[#ce9e50] dark:to-[#ce9e50] text-white hover:from-[#4070be] hover:to-[#4070be] dark:hover:from-[#be8e40] dark:hover:to-[#be8e40] transition-all duration-300">
                                Ver más
                            </Button>
                        </Link>
                    </div>
                </div>

                {/* Tarjeta 2 */}
                <div className="group bg-white/80 dark:bg-gray-800/80 backdrop-blur-lg p-8 rounded-2xl shadow-lg border border-gray-200 dark:border-gray-700 text-center transition-all duration-300 hover:shadow-xl hover:scale-105 hover:border-purple-500 dark:hover:border-purple-400">
                    <div className="h-full flex flex-col justify-between">
                        <p className="text-gray-700 dark:text-gray-300 text-lg mb-6">
                            ¿Sabes qué es un inventario interactivo? Conoce un poco sobre ello.
                        </p>
                        <Button className="w-full bg-gradient-to-r from-[#5080ce] to-[#5080ce] dark:from-[#ce9e50] dark:to-[#ce9e50] text-white hover:from-purple-700 hover:to-pink-700 dark:hover:from-purple-600 dark:hover:to-pink-600 transition-all duration-300">
                            Ver más
                        </Button>
                    </div>
                </div>

                {/* Tarjeta 3 */}
                <div className="group bg-white/80 dark:bg-gray-800/80 backdrop-blur-lg p-8 rounded-2xl shadow-lg border border-gray-200 dark:border-gray-700 text-center transition-all duration-300 hover:shadow-xl hover:scale-105 hover:border-pink-500 dark:hover:border-pink-400">
                    <div className="h-full flex flex-col justify-between">
                        <p className="text-gray-700 dark:text-gray-300 text-lg mb-6">
                            Próximamente más contenido interesante.
                        </p>
                        <Button className="w-full bg-gradient-to-r from-[#5080ce] to-[#5080ce] dark:from-[#ce9e50] dark:to-[#ce9e50] text-white hover:from-pink-700 hover:to-red-700 dark:hover:from-pink-600 dark:hover:to-red-600 transition-all duration-300">
                            Ver más
                        </Button>
                    </div>
                </div>
            </div>
        </section>
    );
}