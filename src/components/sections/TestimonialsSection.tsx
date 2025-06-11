'use client'

import { Card, CardContent } from '@/components/ui/card'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Star } from 'lucide-react'

const testimonials = [
    {
        name: 'María Rodríguez',
        location: 'Bogotá',
        rating: 5,
        comment: 'Los productos de Natulanda han transformado mi alimentación. La calidad es excepcional y el servicio al cliente es maravilloso.',
        avatar: 'https://images.pexels.com/photos/774909/pexels-photo-774909.jpeg'
    },
    {
        name: 'Carlos Mendoza',
        location: 'Medellín',
        rating: 5,
        comment: 'Excelente calidad en todos sus productos. Las infusiones son deliciosas y realmente se nota la diferencia en mi bienestar.',
        avatar: 'https://images.pexels.com/photos/1222271/pexels-photo-1222271.jpeg'
    },
    {
        name: 'Ana Gómez',
        location: 'Cali',
        rating: 5,
        comment: 'Me encanta la variedad de productos naturales que ofrecen. Todo llega fresco y bien empacado. Totalmente recomendado.',
        avatar: 'https://images.pexels.com/photos/1239291/pexels-photo-1239291.jpeg'
    }
]

export function TestimonialsSection() {
    return (
        <section className="animate-on-scroll py-20 bg-gray-50">
            <div className="container mx-auto px-4">
                <div className="text-center mb-16">
                    <h2 className="text-3xl lg:text-4xl font-bold text-[#486283] mb-4 font-['Plus_Jakarta_Sans']">
                        Lo Que Dicen Nuestros Clientes
                    </h2>
                    <p className="text-lg text-gray-600 max-w-2xl mx-auto">
                        La satisfacción de nuestros clientes es nuestra mayor recompensa
                    </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                    {testimonials.map((testimonial, index) => (
                        <Card key={index} className="group hover:shadow-xl transition-all duration-300 bg-white border-none">
                            <CardContent className="p-8">
                                <div className="flex items-center mb-4">
                                    {[...Array(testimonial.rating)].map((_, i) => (
                                        <Star key={i} className="h-5 w-5 text-yellow-400 fill-current" />
                                    ))}
                                </div>

                                <p className="text-gray-600 mb-6 leading-relaxed italic">
                                    "{testimonial.comment}"
                                </p>

                                <div className="flex items-center gap-4">
                                    <Avatar className="h-12 w-12">
                                        <AvatarImage src={testimonial.avatar} alt={testimonial.name} />
                                        <AvatarFallback>{testimonial.name.split(' ').map(n => n[0]).join('')}</AvatarFallback>
                                    </Avatar>
                                    <div>
                                        <h4 className="font-semibold text-[#486283]">{testimonial.name}</h4>
                                        <p className="text-sm text-gray-500">{testimonial.location}</p>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                    ))}
                </div>
            </div>
        </section>
    )
}