'use client'

import Image from 'next/image'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import Link from 'next/link'

const featuredProducts = [
    {
        name: 'Quinoa',
        description: 'Quinoa perfecta para complementar tus comidas y dar un toque nutricional.',
        image: '/images/productos_destacados/quinoa.png',
        benefits: ['Digestivo', 'Rico en antioxidantes']
    },
    {
        name: 'seitan',
        description: 'alternativa vegana a la carne, suplemento alimentario.',
        image: '/images/productos_destacados/seitan.webp',
        benefits: ['Digestiva', 'Antiinflamatoria']
    },
    {
        name: 'tofu',
        description: 'suplemento vegetariano, remplazo de la carne.',
        image: '/images/productos_destacados/tofu.webp',
        benefits: ['Antioxidante', 'Digestivo']
    }
]

export function ProductShowcase() {
    return (
        <section className="animate-on-scroll py-20 bg-white">
            <div className="container mx-auto px-4">
                <div className="text-center mb-16">
                    <h2 className="text-3xl lg:text-4xl font-bold text-[#486283] mb-4 font-['Plus_Jakarta_Sans']">
                        Productos Destacados
                    </h2>
                    <p className="text-lg text-gray-600 max-w-2xl mx-auto">
                        Descubre algunos de nuestros productos más populares y sus increíbles beneficios
                    </p>
                </div>

                <div className="space-y-16">
                    {featuredProducts.map((product, index) => (
                        <Card key={index} className={`overflow-hidden ${index % 2 === 1 ? 'lg:flex-row-reverse' : ''}`}>
                            <div className={`grid grid-cols-1 lg:grid-cols-2 ${index % 2 === 1 ? 'lg:grid-cols-2' : ''}`}>
                                <div className={`relative h-64 lg:h-96 ${index % 2 === 1 ? 'lg:order-2' : ''}`}>
                                    <Image
                                        src={product.image}
                                        alt={product.name}
                                        fill
                                        className="object-cover"
                                    />
                                </div>
                                <CardContent className={`p-8 lg:p-12 flex flex-col justify-center ${index % 2 === 1 ? 'lg:order-1' : ''}`}>
                                    <h3 className="text-3xl font-bold text-[#486283] mb-6 font-['Poiret_One']">
                                        {product.name}
                                    </h3>
                                    <p className="text-lg text-gray-600 mb-8 leading-relaxed">
                                        {product.description}
                                    </p>
                                    <div className="mb-8">
                                        <h4 className="font-semibold text-[#486283] mb-4">Beneficios principales:</h4>
                                        <div className="flex flex-wrap gap-2">
                                            {product.benefits.map((benefit, benefitIndex) => (
                                                <span
                                                    key={benefitIndex}
                                                    className="px-3 py-1 bg-[#899735]/10 text-[#899735] rounded-full text-sm font-medium"
                                                >
                                                    {benefit}
                                                </span>
                                            ))}
                                        </div>
                                    </div>
                                </CardContent>
                            </div>
                        </Card>
                    ))}
                </div>
            </div>
        </section>
    )
}