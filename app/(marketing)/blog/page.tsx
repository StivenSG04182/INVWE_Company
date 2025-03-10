"use client"

import { Button } from "@/components/ui/button"
import Link from "next/link"

export default function Page() {
    return (
        <section className="py-24 relative">
            <div className="flex max-w-20xl mx-auto text-center bg-white/200 backdrop-blur-lg p-25 rounded-xl shadow-md border border-gray-300">
                <h2>¡¡Bienvenido al Blog de INVWE!!</h2>
                <p>aqui te contaremos sobre el nuestros procesos, productos y servicios</p>
                <div className="flex justify-end">
                    <img src="/imagen_blog.jpg" alt="" className="w-64 h-48" />
                </div>
            </div>
            <div className="w-full right
             max-w-20xl mx-auto text-center bg-white/200 backdrop-blur-lg p-25 rounded-xl shadow-md border border-gray-300">
                <h2>
                    te contamos como va el desarrollo de nuestro inventario interactivo
                </h2>
                <Link rel="stylesheet" href="/nots">
                    <button>
                        <Button>Ver Inventario</Button>
                    </button>
                </Link>
            </div>
        </section >
    );
}