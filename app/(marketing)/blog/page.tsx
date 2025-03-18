"use client"

import { Button } from "@/components/ui/button"
import Link from "next/link"
import Link from "next/link"

export default function Page() {
    return (
        <section className="py-12 relative">
            <div className="flex max-w-20xl mx-auto bg-white/200 backdrop-blur-lg p-6 rounded-xl shadow-md border border-gray-300 items-center mb-2">
                <div className="flex-1">
                    <div className="text-center">
                        <h2 className="text-3xl font-bold">¡¡Bienvenido al Blog de INVWE!!</h2>
                        <p className="mt-1">aqui te contaremos sobre el nuestros procesos, productos y servicios</p>
                    </div>
                </div>
                <div className="flex-none ml-4">
                    <img src="/imagen_blog.jpg" alt="" className="w-64 h-50" />
                </div>
            </div>
            <div className="flex gap-4 justify-center">
                <div className="w-full right max-w-20xl mw-full right-0 max-w-sm mx-auto bg-white/200 backdrop-blur-lg p-4 rounded-xl shadow-md border border-gray-300x-auto text-center bg-white/200 backdrop-blur-lg p-25 rounded-xl shadow-md border border-gray-300">
                    <p>Te contamos como va el desarrollo de nuestro inventario interactivo</p>
                    <Link rel="stylesheet" href="/notes">
                    <Button>Ver Nota</Button>
                    </Link>
               </div>
                <div className="w-full right max-w-20xl mw-full right-0 max-w-sm mx-auto bg-white/200 backdrop-blur-lg p-4 rounded-xl shadow-md border border-gray-300x-auto text-center bg-white/200 backdrop-blur-lg p-25 rounded-xl shadow-md border border-gray-300">
                    <p>Sabes que es un inventario interactivo, Conoce un poco sobre ello</p>
                    <Button>Ver Nota</Button>
                </div>
                <div className="w-full right max-w-20xl mw-full right-0 max-w-sm mx-auto bg-white/200 backdrop-blur-lg p-4 rounded-xl shadow-md border border-gray-300x-auto text-center bg-white/200 backdrop-blur-lg p-25 rounded-xl shadow-md border border-gray-300">
                    <p></p>
                    <Button>Ver Nota</Button>
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