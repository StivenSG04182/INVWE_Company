"use client"

import Image from "next/image";
import React from "react";

export default function Page() {
    return (
        <article className="mx-auto my-auto px-auto py-auto">
            <div className="flex flex-col">
                <div id="about" className="my-[10rem] px-auto pb-[5rem] pt-8 border border-gray-200 dark:border-gray-700 rounded-lg shadow-md ">
                    <h2 className="text-[3rem] md:text-[4rem lg:text-[5rem] px-5 font-bold mb-4 text-gray-800]
                    dark:text-white">
                        ¿Quienes Somos?
                    </h2>
                    <p className="px-10 md:px-15 lg:px-20"> 
                    Nos especializamos en desarrollar sistemas de gestión empresarial innovadores. 
                    Combinamos experiencia en liderazgo con perspectivas frescas para crear plataformas adaptables a diversos entornos de negocio. 
                    Nuestra pasión es transformar datos en herramientas estratégicas, definiendo nuestro trabajo colaborativo y los resultados excepcionales que entregamos.
                    </p>
                </div>
                <p className="my-[6rem] text-3xl font-bold mb-4 text-gray-800 dark:text-white">
                    Equipo de Desarrollo
                </p>
                <div id="devs" className="my-[3rem] flex flex-col gap-[2rem]">
                
                    <div className="flex justify-between container mx-auto px-4 py-8 border border-gray-200 dark:border-gray-700 rounded-lg shadow-md max-w-6xl transition transform hover:scale-105 duration-300 ease-in-out">
                        <div className="relative ml-4 md:ml-10 lg:ml-20">
                            <Image
                                src="/dev1.png"
                                width={160}
                                height={160}
                                alt=""
                                className="rounded-lg"
                            />
                        </div>

                        <div className="relative ml-4 md:ml-10 lg:ml-20 pt-1.5 md:pt-3 lg:pt-6 pr-2.5 md:pr-5 lg:pr-10">
                            <h1 className="text-2xl font-bold mb-2 text-gray-800 dark:text-white">
                                Stiven Sanchez
                            </h1>
                            <p className="text-gray-400 max-w-2xl mx-auto">
                            Líder de desarrollo que ha gestionado todo el proceso con excelencia, coordinando equipos y aportando soluciones técnicas innovadoras para superar obstáculos críticos.
                            </p>
                        </div>
                    </div>

                    <div className="flex justify-between container mx-auto px-4 py-8 border border-gray-200 dark:border-gray-700 rounded-lg shadow-md max-w-6xl transition transform hover:scale-105 duration-300 ease-in-out">

                        <div className="relative ml-4 md:ml-10 lg:ml-20 pt-1.5 md:pt-3 lg:pt-6 pr-2.5 md:pr-5 lg:pr-10">
                            <h1 className="text-2xl font-bold mb-2 text-gray-800 dark:text-white">
                                David Piedrahita
                            </h1>
                            <p className="text-gray-400 max-w-2xl mx-auto">
                            Desarrollador junior responsable del módulo de interfaz de usuario, destacando por su meticulosa atención al detalle y capacidad para implementar diseños intuitivos.
                            </p>
                        </div>
        
                        <div className="relative mr-4 md:mr-10 lg:mr-20">
                            <Image
                                src="/dev2.png"
                                width={160}
                                height={160}
                                alt=""
                                className="rounded-lg"
                            />
                        </div>
                    </div>

                    <div className="flex justify-between container mx-auto px-4 py-8 border border-gray-200 dark:border-gray-700 rounded-lg shadow-md max-w-6xl transition transform hover:scale-105 duration-300 ease-in-out">
                        <div className="relative ml-4 md:ml-10 lg:ml-20">
                            <Image
                                src="/dev3.png"
                                width={160}
                                height={160}
                                alt=""
                                className="rounded-lg"
                            />
                        </div>

                        <div className="relative ml-4 md:ml-10 lg:ml-20 pt-1.5 md:pt-3 lg:pt-6 pr-2.5 md:pr-5 lg:pr-10">
                            <h1 className="text-2xl font-bold mb-2 text-gray-800 dark:text-white">
                                Mateo Rios
                            </h1>
                            <p className="text-gray-400 max-w-2xl mx-auto">
                            Desarrollador junior que implementó las funcionalidades de procesamiento de datos, mostrando gran habilidad para optimizar algoritmos complejos y mantener alta calidad de código.
                            </p>
                        </div>
                    </div>

                </div>
            </div>
        </article>
    );
}