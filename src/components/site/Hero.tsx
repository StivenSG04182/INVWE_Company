'use client'

import { Button } from '@/components/ui/button'
import Image from 'next/image'
import Link from 'next/link'

export function Hero() {
    return (
        <section className="relative w-full h-[680px] flex overflow-hidden">
            {/* Left Content */}
            <div className="flex-1 relative p-8 lg:p-16 flex flex-col justify-center bg-gradient-to-r from-white to-gray-50">
                <div className="max-w-2xl">
                    <h1 className="hero-title font-['Plus_Jakarta_Sans'] font-extrabold text-black text-4xl lg:text-5xl xl:text-6xl tracking-tight leading-tight mb-8">
                        NATULANDA PARA SENTIRSE BIEN
                    </h1>

                    <p className="text-lg text-gray-600 mb-12 max-w-lg leading-relaxed">
                        Productos naturales de la mejor calidad para una alimentación consciente y saludable.
                    </p>

                    <div className="hero-buttons flex flex-col sm:flex-row gap-4">
                        <Link href="/productos">
                            <Button
                                size="lg"
                                className="bg-[#899735] hover:bg-[#899735]/90 text-white px-8 py-3 text-lg font-semibold transition-all duration-300 hover:scale-105"
                            >
                                Compra ya
                            </Button>
                        </Link>

                        <Link href="/sobre-nosotros">
                            <Button
                                variant="outline"
                                size="lg"
                                className="border-[#486283] text-[#486283] hover:bg-[#486283] hover:text-white px-8 py-3 text-lg font-semibold transition-all duration-300"
                            >
                                Escógenos
                            </Button>
                        </Link>
                    </div>
                </div>
            </div>

            {/* Right Image */}
            <div className="flex-1 relative">
                <Image
                    src="https://images.pexels.com/photos/1640777/pexels-photo-1640777.jpeg"
                    alt="Productos naturales Natulanda"
                    fill
                    className="object-cover"
                    priority
                />
                <div className="absolute inset-0 bg-gradient-to-l from-transparent to-white/20" />
            </div>

            {/* Decorative Elements */}
            <div className="absolute bottom-10 right-10 w-20 h-20 bg-[#899735]/20 rounded-full animate-pulse" />
            <div className="absolute top-20 right-1/4 w-12 h-12 bg-[#486283]/20 rounded-full animate-bounce" />
        </section>
    )
}