'use client'

import { Card, CardContent } from '@/components/ui/card'
import { Leaf, Heart, Shield, Sparkles } from 'lucide-react'

const benefits = [
    {
        icon: Leaf,
        title: '100% Natural',
        description: 'Todos nuestros productos son completamente naturales, sin químicos ni conservantes artificiales.'
    },
    {
        icon: Heart,
        title: 'Salud Integral',
        description: 'Promovemos el bienestar completo: físico, mental y emocional a través de la alimentación consciente.'
    },
    {
        icon: Shield,
        title: 'Calidad Garantizada',
        description: 'Rigurosos controles de calidad y certificaciones que respaldan la excelencia de nuestros productos.'
    },
    {
        icon: Sparkles,
        title: 'Vida Plena',
        description: 'Te acompañamos en tu transformación hacia un estilo de vida más saludable y equilibrado.'
    }
]

export function BenefitsSection() {
    return (
        <section className="animate-on-scroll py-20 bg-gray-50">
            <div className="container mx-auto px-4">
                <div className="text-center mb-16">
                    <h2 className="text-3xl lg:text-4xl font-bold text-[#486283] mb-4 font-['Plus_Jakarta_Sans']">
                        ¿Por Qué Elegir Natulanda?
                    </h2>
                    <p className="text-lg text-gray-600 max-w-2xl mx-auto">
                        Nuestro compromiso con tu bienestar se refleja en cada producto y servicio que ofrecemos
                    </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
                    {benefits.map((benefit, index) => (
                        <Card key={index} className="group hover:shadow-xl transition-all duration-300 bg-white border-none">
                            <CardContent className="p-8 text-center">
                                <div className="w-16 h-16 bg-[#899735]/10 rounded-full flex items-center justify-center mx-auto mb-6 group-hover:bg-[#899735] transition-colors duration-300">
                                    <benefit.icon className="h-8 w-8 text-[#899735] group-hover:text-white transition-colors duration-300" />
                                </div>
                                <h3 className="text-xl font-bold text-[#486283] mb-4">
                                    {benefit.title}
                                </h3>
                                <p className="text-gray-600 leading-relaxed">
                                    {benefit.description}
                                </p>
                            </CardContent>
                        </Card>
                    ))}
                </div>
            </div>
        </section>
    )
}