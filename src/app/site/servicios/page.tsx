'use client'

import { useEffect } from 'react'
import { gsap } from 'gsap'
import Image from 'next/image'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Truck, Users, GraduationCap, Stethoscope, ShoppingBag, Headphones } from 'lucide-react'

const services = [
  {
    icon: ShoppingBag,
    title: 'Venta de Productos Naturales',
    description: 'Amplio catálogo de productos naturales, orgánicos y saludables cuidadosamente seleccionados.',
    features: [
      'Especias y hierbas aromáticas',
      'Frutas deshidratadas sin azúcar',
      'Infusiones y tés naturales',
      'Productos a granel',
      'Certificación de calidad'
    ],
    image: 'https://images.pexels.com/photos/1640777/pexels-photo-1640777.jpeg'
  },
  {
    icon: Truck,
    title: 'Entrega a Domicilio',
    description: 'Servicio de entrega rápida y segura para que recibas tus productos naturales en casa.',
    features: [
      'Entrega en 24-48 horas',
      'Empaque ecológico',
      'Seguimiento en tiempo real',
      'Entrega gratuita en pedidos grandes',
      'Horarios flexibles'
    ],
    image: 'https://images.pexels.com/photos/4386321/pexels-photo-4386321.jpeg'
  },
  {
    icon: GraduationCap,
    title: 'Educación y Talleres',
    description: 'Talleres educativos sobre alimentación consciente, uso de hierbas medicinales y vida saludable.',
    features: [
      'Talleres presenciales y virtuales',
      'Guías de uso de productos',
      'Recetas saludables',
      'Consultas nutricionales',
      'Material educativo gratuito'
    ],
    image: 'https://images.pexels.com/photos/1181534/pexels-photo-1181534.jpeg'
  },
  {
    icon: Stethoscope,
    title: 'Asesoría Nutricional',
    description: 'Consultas personalizadas con nuestros especialistas en nutrición y medicina natural.',
    features: [
      'Evaluación nutricional completa',
      'Planes alimentarios personalizados',
      'Seguimiento continuo',
      'Recomendaciones de productos',
      'Consultas virtuales disponibles'
    ],
    image: 'https://images.pexels.com/photos/5327585/pexels-photo-5327585.jpeg'
  },
  {
    icon: Users,
    title: 'Ventas Corporativas',
    description: 'Soluciones especiales para empresas que quieren promover la alimentación saludable.',
    features: [
      'Descuentos por volumen',
      'Productos personalizados',
      'Programas de bienestar empresarial',
      'Entrega programada',
      'Facturación empresarial'
    ],
    image: 'https://images.pexels.com/photos/3184291/pexels-photo-3184291.jpeg'
  },
  {
    icon: Headphones,
    title: 'Atención al Cliente',
    description: 'Soporte especializado para resolver dudas sobre productos y acompañarte en tu proceso.',
    features: [
      'Atención personalizada',
      'Chat en línea',
      'Soporte telefónico',
      'Seguimiento post-venta',
      'Garantía de satisfacción'
    ],
    image: 'https://images.pexels.com/photos/3760263/pexels-photo-3760263.jpeg'
  }
]

export default function ServiciosPage() {
  useEffect(() => {
    gsap.fromTo('.services-header', 
      { opacity: 0, y: 30 },
      { opacity: 1, y: 0, duration: 0.8, ease: 'power2.out' }
    )

    gsap.fromTo('.service-card', 
      { opacity: 0, y: 50, scale: 0.9 },
      { 
        opacity: 1, 
        y: 0, 
        scale: 1,
        duration: 0.6,
        stagger: 0.1,
        ease: 'power2.out',
        delay: 0.3
      }
    )
  }, [])

  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="container mx-auto px-4">
        {/* Header */}
        <div className="services-header text-center mb-16">
          <h1 className="text-4xl lg:text-5xl font-bold text-[#486283] mb-6 font-['Plus_Jakarta_Sans']">
            Nuestros Servicios
          </h1>
          <p className="text-lg text-gray-600 max-w-3xl mx-auto leading-relaxed">
            Descubre todos los servicios que ofrecemos para acompañarte en tu 
            camino hacia una vida más saludable y consciente.
          </p>
        </div>

        {/* Services Grid */}
        <div className="space-y-16">
          {services.map((service, index) => (
            <Card key={index} className={`service-card overflow-hidden ${index % 2 === 1 ? 'lg:flex-row-reverse' : ''}`}>
              <div className={`grid grid-cols-1 lg:grid-cols-2 ${index % 2 === 1 ? 'lg:grid-cols-2' : ''}`}>
                <div className={`relative h-64 lg:h-96 ${index % 2 === 1 ? 'lg:order-2' : ''}`}>
                  <Image
                    src={service.image}
                    alt={service.title}
                    fill
                    className="object-cover"
                  />
                </div>
                <CardContent className={`p-8 lg:p-12 flex flex-col justify-center ${index % 2 === 1 ? 'lg:order-1' : ''}`}>
                  <div className="flex items-center gap-4 mb-6">
                    <div className="w-12 h-12 bg-[#486283] rounded-lg flex items-center justify-center">
                      <service.icon className="h-6 w-6 text-white" />
                    </div>
                    <Badge className="bg-[#899735] text-white">
                      Servicio Premium
                    </Badge>
                  </div>
                  
                  <h2 className="text-3xl font-bold text-[#486283] mb-4">
                    {service.title}
                  </h2>
                  
                  <p className="text-gray-600 mb-6 leading-relaxed">
                    {service.description}
                  </p>

                  <div className="mb-8">
                    <h3 className="font-semibold text-[#486283] mb-3">
                      Incluye:
                    </h3>
                    <ul className="space-y-2">
                      {service.features.map((feature, featureIndex) => (
                        <li key={featureIndex} className="flex items-center gap-3">
                          <div className="w-2 h-2 bg-[#899735] rounded-full"></div>
                          <span className="text-gray-600">{feature}</span>
                        </li>
                      ))}
                    </ul>
                  </div>

                  <div className="flex flex-col sm:flex-row gap-4">
                    <Button className="bg-[#899735] hover:bg-[#899735]/90 text-white">
                      Solicitar Información
                    </Button>
                    <Button variant="outline" className="border-[#486283] text-[#486283]">
                      Ver Detalles
                    </Button>
                  </div>
                </CardContent>
              </div>
            </Card>
          ))}
        </div>

        {/* Process Section */}
        <div className="mt-20">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-[#486283] mb-4">
              ¿Cómo Trabajamos?
            </h2>
            <p className="text-gray-600 max-w-2xl mx-auto">
              Nuestro proceso está diseñado para brindarte la mejor experiencia
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            {[
              { step: '01', title: 'Consulta', description: 'Conversamos sobre tus necesidades y objetivos de salud' },
              { step: '02', title: 'Recomendación', description: 'Te sugerimos los productos más adecuados para ti' },
              { step: '03', title: 'Entrega', description: 'Recibe tus productos con la máxima calidad y frescura' },
              { step: '04', title: 'Seguimiento', description: 'Te acompañamos en tu proceso de bienestar' }
            ].map((item, index) => (
              <Card key={index} className="service-card text-center">
                <CardContent className="p-6">
                  <div className="w-16 h-16 bg-[#486283] text-white rounded-full flex items-center justify-center mx-auto mb-4 text-xl font-bold">
                    {item.step}
                  </div>
                  <h3 className="text-xl font-bold text-[#486283] mb-3">
                    {item.title}
                  </h3>
                  <p className="text-gray-600 text-sm leading-relaxed">
                    {item.description}
                  </p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>

        {/* CTA Section */}
        <Card className="service-card mt-20 bg-[#486283] text-white">
          <CardContent className="p-12 text-center">
            <h2 className="text-3xl font-bold mb-6">
              ¿Listo para Comenzar tu Transformación?
            </h2>
            <p className="text-xl mb-8 opacity-90 max-w-2xl mx-auto">
              Nuestro equipo de expertos está listo para acompañarte en tu 
              camino hacia una vida más saludable y plena.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button className="bg-[#899735] hover:bg-[#899735]/90 text-white px-8 py-3">
                Agendar Consulta Gratuita
              </Button>
              <Button variant="outline" className="border-white text-white hover:bg-white hover:text-[#486283] px-8 py-3">
                Ver Productos
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}