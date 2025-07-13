'use client'

import { Card, CardContent } from '@/components/ui/card'
import { Truck, Users, GraduationCap, Stethoscope } from 'lucide-react'

const services = [
    {
        icon: Users,
        title: 'Asesoría Personalizada',
        description: 'Nuestros expertos te guían para elegir los productos más adecuados según tus necesidades de salud.'
    },
    {
        icon: GraduationCap,
        title: 'Educación y Talleres',
        description: 'Aprende sobre alimentación consciente y el uso correcto de productos naturales en nuestros talleres.'
    },
    {
        icon: Stethoscope,
        title: 'Consulta Nutricional',
        description: 'Consultas especializadas con nutricionistas expertos en medicina natural y alimentación saludable.'
    }
]

export function ServicesSection() {
    return (
        <section className="animate-on-scroll py-20 bg-white">
            <div className="container mx-auto px-4">
                <div className="text-center mb-16">
                    <h2 className="text-3xl lg:text-4xl font-bold text-[#486283] mb-4 font-['Plus_Jakarta_Sans']">
                        Nuestros Servicios
                    </h2>
                    <p className="text-lg text-gray-600 max-w-2xl mx-auto">
                        Ofrecemos servicios integrales para acompañarte en tu camino hacia una vida más saludable
                    </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
                    {services.map((service, index) => (
                        <Card key={index} className="group hover:shadow-xl transition-all duration-300 border-none">
                            <CardContent className="p-8 text-center">
                                <div className="w-16 h-16 bg-[#486283]/10 rounded-full flex items-center justify-center mx-auto mb-6 group-hover:bg-[#486283] transition-colors duration-300">
                                    <service.icon className="h-8 w-8 text-[#486283] group-hover:text-white transition-colors duration-300" />
                                </div>
                                <h3 className="text-xl font-bold text-[#486283] mb-4">
                                    {service.title}
                                </h3>
                                <p className="text-gray-600 leading-relaxed">
                                    {service.description}
                                </p>
                            </CardContent>
                        </Card>
                    ))}
                </div>
            </div>
        </section>
    )
}