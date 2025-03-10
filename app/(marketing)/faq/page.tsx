"use client"

import React from "react";
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
        {answer:"respuesta"},
        {answer:""},
        {answer:""},
        {answer:""},
        {answer:""},
        {answer:""},
        {answer:""},
        {answer:""},
        {answer:""},
        {answer:""},

    ]

    return (
        <div className="text-left">
            <h2 className="text-5xl font-bold mt-10 mb-20">
                PREGUNTAS FRECUENTES
            </h2>
            <ul className="space-y-4">
                {(faqData, faqData2).map((faq, index) => (
                    <Card key={index} className="w-[50rem] p-4 border rounded-lg shadow-md hover:translate-x-3 duration-150 ease-in-out">
                            <h3 className="text-l">{faq.question}</h3>
                    </Card>
                ))}

            </ul>

        </div>
    );
}