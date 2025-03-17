"use client"

import React, { useState } from "react";

import { Card } from "@/components/ui/card";

export default function Page() {
    interface FAQquestions {
        question: string;
    }
    interface FAQanswers {
        answer: string;
    }

    const faqData: FAQquestions[] = [
        {question:"¿Cómo garantiza la precisión del inventario en tiempo real?"},
        {question:"¿Qué nivel de capacitación requieren los empleados para usar el sistema?"},
        {question:"¿Es compatible con nuestros sistemas actuales?"},
        {question:"¿Cómo maneja las fluctuaciones estacionales de inventario?"},
        {question:"¿Cúal es el tiempo promedio de implementación?"},
        {question:"¿Incluye pronósticos automatizados de demanda?"},
        {question:"¿Qué medidas de seguridad protegen nuestros datos?"},
        {question:"¿Ofrece visualizaciones personalizables?"},
        {question:"¿Funciona sin conexión a internet?"},
        {question:"¿Cómo se maneja el soporte técnico y actualizaciones?"}
    ]

    const faqData2: FAQanswers[] = [
        {answer:"La precisión del inventario en tiempo real se garantiza mediante varios sistemas y procesos integrados, incluyendo escáneres de códigos de barras y tecnología RFID, actualizaciones automáticas de stock al realizar ventas o recepciones, y auditorías periódicas para verificar la exactitud."},
        {answer:"Los empleados reciben una capacitación inicial completa sobre el sistema, que se complementa con manuales y tutoriales. Además, ofrecemos sesiones de actualización según sea necesario."},
        {answer:"El sistema está diseñado para integrarse fácilmente con una variedad de plataformas, incluyendo sistemas ERP, CRM y contables. Ofrecemos asistencia para configurar y probar las integraciones para asegurar una transición sin problemas."},
        {answer:"El sistema está diseñado para adaptarse a las fluctuaciones estacionales mediante algoritmos que analizan tendencias históricas y patrones de demanda, permitiendo ajustes dinámicos en los niveles de inventario."},
        {answer:"Nuestro tiempo promedio de implementación es de 4 a 6 semanas, dependiendo de la complejidad de la integración y la cantidad de datos a migrar. Este plazo incluye configuraciones, pruebas y la capacitación del personal."},
        {answer:"Sí, el sistema incluye algoritmos de pronóstico de demanda que, utilizando datos históricos y patrones de consumo, predicen la demanda futura y optimizan los niveles de stock."},
        {answer:"Implementamos cifrado de datos, autenticación de usuarios de múltiples factores y auditorías de seguridad periódicas para garantizar la seguridad de la información."},
        {answer:"Sí, el sistema permite generar informes y dashboards personalizados para visualizar los datos de inventario de la manera más útil para cada usuario."},
        {answer:"Aunque el sistema está diseñado para funcionar de manera óptima con conexión a internet, se pueden activar las funciones básicas de control de stock sin conexión. Al restablecer la conexión, todos los datos se sincronizan automáticamente."},
        {answer:"Ofrecemos soporte técnico continuo y actualizaciones regulares del sistema. El soporte se puede obtener a través de correo electrónico, teléfono o chat en vivo, y las actualizaciones se implementan de forma remota."},

    ]
    const [openAnswer, setOpenAnswer] = useState<number | null>(null);

    const toggleAnswer = (index: number) => {
        if (openAnswer === index) {
            setOpenAnswer(null);
        } else {
            setOpenAnswer(index);
        }
    };

    return (
        <div className="text-left">
            <h2 className="text-5xl font-bold mt-10 mb-20">
                PREGUNTAS FRECUENTES
            </h2>
            <div className="space-y-4 mb-20">
                {faqData.map((faq, index) => {
                    const {question} = faq;
                    const {answer} = faqData2[index];
                    return (
                        <Card key={index} className="w-[50rem] p-4 border rounded-lg shadow-md">
                            <button
                                onClick={()=>toggleAnswer(index)}
                                className={`w-full text-left transition-all hover:translate-x-5 ${
                                    openAnswer === index ? 'translate-x-5' : ''
                                }`}>
                                <h3 className="text-lg cursor-pointer">{question}</h3>
                            </button>
                            {openAnswer === index && (
                                <div className="text-sm mt-2 overflow-hidden transition-all duration-300 ease-in-out animate-slide-down">
                                    {answer}
                                </div>
                            )}
                        </Card>
                    )
                })}
            </div>
        </div>
    );
}