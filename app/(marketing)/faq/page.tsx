"use client"

import React, { useState } from "react";
import { Card } from "@/components/ui/card";
import { motion, AnimatePresence } from "framer-motion";

export default function Page() {
    const [faqs, setFaqs] = useState<{ question: string; answer: string; isOpen: boolean }[]>([]);

    React.useEffect(() => {
        setFaqs([
            { question: "¿Cómo garantiza la precisión del inventario en tiempo real?", answer: "Nuestro sistema utiliza tecnología de sincronización en tiempo real y validación automática para mantener la precisión del inventario. Además, implementamos verificaciones periódicas y alertas automáticas.", isOpen: false },
            { question: "¿Qué nivel de capacitación requieren los empleados para usar el sistema?", answer: "El sistema es intuitivo y fácil de usar. Ofrecemos capacitación inicial de 2-3 horas y recursos de aprendizaje en línea. La mayoría de los usuarios dominan las funciones básicas en la primera semana.", isOpen: false },
            { question: "¿Es compatible con nuestros sistemas actuales?", answer: "Sí, nuestro sistema está diseñado para integrarse con la mayoría de los sistemas empresariales comunes. Ofrecemos APIs y conectores para facilitar la integración con ERP, CRM y otros sistemas.", isOpen: false },
            { question: "¿Cómo maneja las fluctuaciones estacionales de inventario?", answer: "El sistema incluye herramientas de planificación estacional y análisis predictivo para ayudar a gestionar las fluctuaciones. Permite ajustes automáticos basados en patrones históricos.", isOpen: false },
            { question: "¿Cúal es el tiempo promedio de implementación?", answer: "El tiempo promedio de implementación es de 2-4 semanas, dependiendo de la complejidad de su operación y los requisitos de integración específicos.", isOpen: false },
            { question: "¿Incluye pronósticos automatizados de demanda?", answer: "Sí, el sistema incluye capacidades de pronóstico automatizado utilizando algoritmos de aprendizaje automático que consideran datos históricos, tendencias y factores estacionales.", isOpen: false },
            { question: "¿Qué medidas de seguridad protegen nuestros datos?", answer: "Implementamos encriptación de extremo a extremo, autenticación de dos factores, y cumplimos con los estándares de seguridad más recientes. Realizamos auditorías regulares de seguridad.", isOpen: false },
            { question: "¿Ofrece visualizaciones personalizables?", answer: "Sí, el sistema incluye un conjunto completo de herramientas de visualización personalizables, incluyendo dashboards, gráficos y reportes que pueden adaptarse a sus necesidades específicas.", isOpen: false },
            { question: "¿Funciona sin conexión a internet?", answer: "Sí, el sistema tiene capacidades offline que permiten continuar operando durante interrupciones de internet. Los datos se sincronizan automáticamente cuando se restablece la conexión.", isOpen: false },
            { question: "¿Cómo se maneja el soporte técnico y actualizaciones?", answer: "Ofrecemos soporte técnico 24/7 a través de múltiples canales. Las actualizaciones son automáticas y programadas durante horas de bajo uso para minimizar interrupciones.", isOpen: false }
        ]);
    }, []);

    const toggleFAQ = (index: number) => {
        setFaqs(faqs.map((faq, i) => {
            if (i === index) {
                return { ...faq, isOpen: !faq.isOpen };
            }
            return { ...faq, isOpen: false };
        }));
    };

    return (
        <div className="text-left px-4 md:px-8 lg:px-16 max-w-7xl mx-auto">
            <h2 className="text-5xl font-bold mt-10 mb-20 text-center text-foreground">
                PREGUNTAS FRECUENTES
            </h2>
            <ul className="space-y-4 mb-8">
                {faqs.map((faq, index) => (
                    <Card 
                        key={index} 
                        className="w-full md:w-[50rem] mx-auto p-4 border rounded-lg shadow-md cursor-pointer transition-all duration-300 ease-in-out hover:shadow-lg bg-card hover:bg-accent/10"
                        onClick={() => toggleFAQ(index)}
                    >
                        <h3 className="text-lg font-semibold text-foreground">{faq.question}</h3>
                        <AnimatePresence>
                            {faq.isOpen && (
                                <motion.div 
                                    initial={{ x: -100, opacity: 0 }}
                                    animate={{ x: 0, opacity: 1 }}
                                    exit={{ x: 100, opacity: 0 }}
                                    transition={{ 
                                        type: "spring",
                                        stiffness: 100,
                                        damping: 20,
                                        duration: 0.8
                                    }}
                                    className="mt-4"
                                >
                                    <p className="text-muted-foreground">{faq.answer}</p>
                                </motion.div>
                            )}
                        </AnimatePresence>
                    </Card>
                ))}
            </ul>
        </div>
    );
}