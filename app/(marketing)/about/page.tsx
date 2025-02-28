"use client"

import Image from "next/image";
import React from "react";

export default function Page() {
    return (
        <section className="">
            <div className="flex flex-col gap-20 text-center">
                <div id="about" className="container mx-auto px-4 py-8 border border-gray-200 rounded-lg shadow-md max-w-4xl">
                    <h2 className="text-3xl font-bold mb-4 text-gray-800"> ¿Quienes Somos? </h2>
                    <p className="max-w-2xl mx-auto"> Somos un grupo de desarrolladores Junior que se ha interesado en los sistemas de gestión de inventarios digitales
                        y que tienen como objetivo optimizar y automatizar procesos de gestión de inventarios.
                    </p>
                </div>
                <p className="text-3xl font-bold mb-4 text-gray-800"> Equipo de Desarrollo </p>
                <div id="devs" className="flex flex-col gap-20">
                    <div className="flex justify-between container mx-auto px-4 py-8 border border-gray-200 rounded-lg shadow-md max-w-6xl">
                        <div className="relative ml-20">
                            <Image
                                src=""
                                width={150}
                                height={150}
                                alt=""
                                className="rounded-full"
                            />
                        </div>
                        <div className="relative mr-20">
                            <h1 className="text-2xl font-bold mb-2 text-gray-800">Nombre</h1>
                            <p className="text-gray-400 max-w-2xl mx-auto">Aqui se pone un texto contandonos un poco acerca de su papel dentro del desarrollo del proyecto</p>
                        </div>
                    </div>

                    <div className="flex justify-between container mx-auto px-4 py-8 border border-gray-200 rounded-lg shadow-md max-w-6xl">
                        <div className="relative ml-20">
                            <h1 className="text-2xl font-bold mb-2 text-gray-800">Nombre</h1>
                            <p className="text-gray-400 max-w-2xl mx-auto">Aqui se pone un texto contandonos un poco acerca de su papel dentro del desarrollo del proyecto</p>
                        </div>
                        <div className="relative mr-20">
                            <Image
                                src=""
                                width={150}
                                height={150}
                                alt=""
                                className="rounded-full"
                            />
                        </div>
                    </div>

                    <div className="flex justify-between container mx-auto px-4 py-8 border border-gray-200 rounded-lg shadow-md max-w-6xl">
                        <div className="relative ml-20">
                            <Image
                                src=""
                                width={150}
                                height={150}
                                alt=""
                                className="rounded-full"
                            />
                        </div>
                        <div className="relative mr-20">
                            <h1 className="text-2xl font-bold mb-2 text-gray-800">Nombre</h1>
                            <p className="text-gray-400 max-w-2xl mx-auto">Aqui se pone un texto contandonos un poco acerca de su papel dentro del desarrollo del proyecto</p>
                        </div>
                    </div>
                </div>
            </div>
        </section>
    );
}