"use client"

import Image from "next/image";
import React from "react";

export default function Page() {
    return (
        <article className="mx-auto my-auto px-auto py-auto">
            <div className="flex flex-col">
                <div id="about" className="my-[15rem] px-auto pb-[5rem] pt-8 border border-gray-200 rounded-lg shadow-md">
                    <h2 className="text-[5rem] font-bold mb-4 text-gray-800">
                        ¿Quienes Somos?
                    </h2>
                    <p className="px-20"> 
                        Somos un grupo de desarrolladores Junior que se ha interesado en los sistemas de gestión de inventarios digitales
                        y que tienen como objetivo optimizar y automatizar procesos de gestión de inventarios.
                    </p>
                </div>
                <p className="my-[6rem] text-3xl font-bold mb-4 text-gray-800">
                    Equipo de Desarrollo
                </p>
                <div id="devs" className="my-[3rem] flex flex-col gap-[2rem]">
                
                    <div className="flex justify-between container mx-auto px-4 py-8 border border-gray-200 rounded-lg shadow-md max-w-6xl transition transform hover:scale-105 duration-300 ease-in-out">
                        <div className="relative ml-4 md:ml-10 lg:ml-20">
                            <Image
                                src="/dev1.png"
                                width={160}
                                height={160}
                                alt=""
                                className=""
                            />
                        </div>

                        <div className="relative ml-4 md:ml-10 lg:ml-20 pt-1.5 md:pt-3 lg:pt-6 pr-2.5 md:pr-5 lg:pr-10">
                            <h1 className="text-2xl font-bold mb-2 text-gray-800">
                                Nombre
                            </h1>
                            <p className="text-gray-400 max-w-2xl mx-auto">
                                Aqui se pone un texto contandonos un poco acerca de su papel dentro del desarrollo del proyecto
                            </p>
                        </div>
                    </div>

                    <div className="flex justify-between container mx-auto px-4 py-8 border border-gray-200 rounded-lg shadow-md max-w-6xl transition transform hover:scale-105 duration-300 ease-in-out">

                        <div className="relative ml-4 md:ml-10 lg:ml-20 pt-1.5 md:pt-3 lg:pt-6 pr-2.5 md:pr-5 lg:pr-10">
                            <h1 className="text-2xl font-bold mb-2 text-gray-800">
                                Nombre
                            </h1>
                            <p className="text-gray-400 max-w-2xl mx-auto">
                                Aqui se pone un texto contandonos un poco acerca de su papel dentro del desarrollo del proyecto
                            </p>
                        </div>
        
                        <div className="relative mr-4 md:mr-10 lg:mr-20">
                            <Image
                                src="/dev2.png"
                                width={160}
                                height={160}
                                alt=""
                                className=""
                            />
                        </div>
                    </div>

                    <div className="flex justify-between container mx-auto px-4 py-8 border border-gray-200 rounded-lg shadow-md max-w-6xl transition transform hover:scale-105 duration-300 ease-in-out">
                        <div className="relative ml-4 md:ml-10 lg:ml-20">
                            <Image
                                src="/dev3.png"
                                width={160}
                                height={160}
                                alt=""
                                className=""
                            />
                        </div>

                        <div className="relative ml-4 md:ml-10 lg:ml-20 pt-1.5 md:pt-3 lg:pt-6 pr-2.5 md:pr-5 lg:pr-10">
                            <h1 className="text-2xl font-bold mb-2 text-gray-800">
                                Nombre
                            </h1>
                            <p className="text-gray-400 max-w-2xl mx-auto">
                                Aqui se pone un texto contandonos un poco acerca de su papel dentro del desarrollo del proyecto
                            </p>
                        </div>
                    </div>

                </div>
            </div>
        </article>
    );
}