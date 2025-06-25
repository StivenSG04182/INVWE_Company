'use client'

import { useEffect } from 'react'
import { gsap } from 'gsap'
import Image from 'next/image'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Heart, Leaf, Users, Award, Target, Eye } from 'lucide-react'

const values = [
  {
    icon: Heart,
    title: 'Pasión por la Salud',
    description: 'Creemos firmemente en el poder de la naturaleza para mejorar la calidad de vida de las personas.'
  },
  {
    icon: Leaf,
    title: 'Sostenibilidad',
    description: 'Trabajamos con prácticas sostenibles que respetan el medio ambiente y apoyan a las comunidades locales.'
  },
  {
    icon: Users,
    title: 'Comunidad',
    description: 'Construimos relaciones duraderas con nuestros clientes, proveedores y la comunidad en general.'
  },
  {
    icon: Award,
    title: 'Calidad Premium',
    description: 'Nos comprometemos a ofrecer solo productos de la más alta calidad, cuidadosamente seleccionados.'
  }
]

const timeline = [
  {
    year: '2018',
    title: 'Los Inicios',
    description: 'Natulanda nace como un sueño de promover la alimentación consciente y saludable en Colombia.'
  },
  {
    year: '2019',
    title: 'Primera Tienda',
    description: 'Abrimos nuestra primera tienda física en Bogotá, ofreciendo productos naturales de calidad premium.'
  },
  {
    year: '2020',
    title: 'Expansión Digital',
    description: 'Lanzamos nuestra plataforma online para llegar a más personas en todo el país.'
  },
  {
    year: '2021',
    title: 'Red de Proveedores',
    description: 'Establecemos alianzas con más de 50 productores locales comprometidos con la agricultura orgánica.'
  },
  {
    year: '2022',
    title: 'Certificaciones',
    description: 'Obtenemos certificaciones de calidad y sostenibilidad que respaldan nuestro compromiso.'
  },
  {
    year: '2023',
    title: 'Crecimiento Nacional',
    description: 'Expandimos nuestros servicios a las principales ciudades de Colombia.'
  },
  {
    year: '2024',
    title: 'Innovación Continua',
    description: 'Lanzamos nuevos productos y servicios, incluyendo nuestro sistema POS especializado.'
  }
]

export default function SobreNosotrosPage() {
  useEffect(() => {
    gsap.fromTo('.about-header', 
      { opacity: 0, y: 30 },
      { opacity: 1, y: 0, duration: 0.8, ease: 'power2.out' }
    )

    gsap.fromTo('.about-card', 
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

    gsap.fromTo('.timeline-item', 
      { opacity: 0, x: -50 },
      { 
        opacity: 1, 
        x: 0,
        duration: 0.6,
        stagger: 0.1,
        ease: 'power2.out',
        delay: 0.5
      }
    )
  }, [])

  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="container mx-auto px-4">
        {/* Header */}
        <div className="about-header text-center mb-16">
          <h1 className="text-4xl lg:text-5xl font-bold text-[#486283] mb-6 font-['Plus_Jakarta_Sans']">
            Sobre Nosotros
          </h1>
          <p className="text-lg text-gray-600 max-w-3xl mx-auto leading-relaxed">
            Conoce la historia detrás de Natulanda y nuestro compromiso con 
            promover un estilo de vida saludable y consciente.
          </p>
        </div>

        {/* Hero Section */}
        <Card className="about-card mb-20 overflow-hidden">
          <div className="grid grid-cols-1 lg:grid-cols-2">
            <div className="relative h-64 lg:h-96">
              <Image
                src="https://images.pexels.com/photos/1640777/pexels-photo-1640777.jpeg"
                alt="Natulanda - Productos naturales"
                fill
                className="object-cover"
              />
            </div>
            <CardContent className="p-8 lg:p-12 flex flex-col justify-center">
              <Badge className="w-fit mb-4 bg-[#899735] text-white">
                Nuestra Historia
              </Badge>
              <h2 className="text-3xl font-bold text-[#486283] mb-6">
                Para Sentirse Bien
              </h2>
              <p className="text-gray-600 mb-6 leading-relaxed">
                Natulanda nació de la convicción de que la naturaleza nos ofrece 
                todo lo que necesitamos para vivir de manera saludable y plena. 
                Desde nuestros inicios, hemos trabajado incansablemente para 
                acercar los mejores productos naturales a las familias colombianas.
              </p>
              <p className="text-gray-600 leading-relaxed">
                Nuestro compromiso va más allá de vender productos; queremos 
                educar, inspirar y acompañar a nuestros clientes en su camino 
                hacia un estilo de vida más consciente y saludable.
              </p>
            </CardContent>
          </div>
        </Card>

        {/* Mission & Vision */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-20">
          <Card className="about-card">
            <CardContent className="p-8 text-center">
              <div className="w-16 h-16 bg-[#486283] rounded-full flex items-center justify-center mx-auto mb-6">
                <Target className="h-8 w-8 text-white" />
              </div>
              <h3 className="text-2xl font-bold text-[#486283] mb-4">
                Nuestra Misión
              </h3>
              <p className="text-gray-600 leading-relaxed">
                Crear equilibrio entre todos para sentirse bien y vivir mejor, 
                ofreciendo productos naturales de la más alta calidad que 
                promuevan una alimentación consciente y un estilo de vida saludable.
              </p>
            </CardContent>
          </Card>

          <Card className="about-card">
            <CardContent className="p-8 text-center">
              <div className="w-16 h-16 bg-[#899735] rounded-full flex items-center justify-center mx-auto mb-6">
                <Eye className="h-8 w-8 text-white" />
              </div>
              <h3 className="text-2xl font-bold text-[#486283] mb-4">
                Nuestra Visión
              </h3>
              <p className="text-gray-600 leading-relaxed">
                Ser la empresa líder en Colombia en productos naturales y 
                alimentación consciente, reconocida por nuestra calidad, 
                compromiso social y contribución al bienestar de las personas.
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Values */}
        <div className="mb-20">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-[#486283] mb-4">
              Nuestros Valores
            </h2>
            <p className="text-gray-600 max-w-2xl mx-auto">
              Los principios que guían cada una de nuestras decisiones y acciones
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {values.map((value, index) => (
              <Card key={index} className="about-card group hover:shadow-xl transition-all duration-300">
                <CardContent className="p-6 text-center">
                  <div className="w-16 h-16 bg-[#486283]/10 rounded-full flex items-center justify-center mx-auto mb-4 group-hover:bg-[#486283] transition-colors">
                    <value.icon className="h-8 w-8 text-[#486283] group-hover:text-white transition-colors" />
                  </div>
                  <h3 className="text-xl font-bold text-[#486283] mb-3">
                    {value.title}
                  </h3>
                  <p className="text-gray-600 leading-relaxed text-sm">
                    {value.description}
                  </p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>

        {/* Timeline */}
        <div className="mb-20">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-[#486283] mb-4">
              Nuestra Trayectoria
            </h2>
            <p className="text-gray-600 max-w-2xl mx-auto">
              Un recorrido por los momentos más importantes de nuestra historia
            </p>
          </div>

          <div className="relative">
            {/* Timeline line */}
            <div className="absolute left-8 top-0 bottom-0 w-0.5 bg-[#486283]/20"></div>

            <div className="space-y-8">
              {timeline.map((item, index) => (
                <div key={index} className="timeline-item relative flex items-start gap-8">
                  <div className="w-16 h-16 bg-[#486283] rounded-full flex items-center justify-center text-white font-bold text-sm flex-shrink-0 relative z-10">
                    {item.year}
                  </div>
                  <Card className="flex-1">
                    <CardContent className="p-6">
                      <h3 className="text-xl font-bold text-[#486283] mb-2">
                        {item.title}
                      </h3>
                      <p className="text-gray-600 leading-relaxed">
                        {item.description}
                      </p>
                    </CardContent>
                  </Card>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Stats */}
        <Card className="about-card bg-[#486283] text-white">
          <CardContent className="p-12">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-8 text-center">
              <div>
                <div className="text-4xl font-bold mb-2">6+</div>
                <div className="text-lg opacity-90">Años de Experiencia</div>
              </div>
              <div>
                <div className="text-4xl font-bold mb-2">10,000+</div>
                <div className="text-lg opacity-90">Clientes Satisfechos</div>
              </div>
              <div>
                <div className="text-4xl font-bold mb-2">50+</div>
                <div className="text-lg opacity-90">Proveedores Locales</div>
              </div>
              <div>
                <div className="text-4xl font-bold mb-2">200+</div>
                <div className="text-lg opacity-90">Productos Naturales</div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}