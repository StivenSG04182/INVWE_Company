'use client'

import { useEffect } from 'react'
import { gsap } from 'gsap'
import Image from 'next/image'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Linkedin, Mail, Phone } from 'lucide-react'

const teamMembers = [
  {
    id: 1,
    name: 'María González',
    position: 'Fundadora & CEO',
    image: 'https://images.pexels.com/photos/774909/pexels-photo-774909.jpeg',
    bio: 'Apasionada por la alimentación natural y el bienestar. Con más de 15 años de experiencia en el sector de productos orgánicos.',
    skills: ['Liderazgo', 'Nutrición', 'Emprendimiento'],
    email: 'maria@natulanda.com',
    phone: '+57 300 123 4567'
  },
  {
    id: 2,
    name: 'Carlos Rodríguez',
    position: 'Director de Operaciones',
    image: 'https://images.pexels.com/photos/1222271/pexels-photo-1222271.jpeg',
    bio: 'Especialista en cadena de suministro y calidad de productos naturales. Garantiza la excelencia en cada producto.',
    skills: ['Operaciones', 'Calidad', 'Logística'],
    email: 'carlos@natulanda.com',
    phone: '+57 300 123 4568'
  },
  {
    id: 3,
    name: 'Ana Martínez',
    position: 'Especialista en Nutrición',
    image: 'https://images.pexels.com/photos/1239291/pexels-photo-1239291.jpeg',
    bio: 'Nutricionista certificada con especialización en medicina natural y fitoterapia. Asesora en el desarrollo de productos.',
    skills: ['Nutrición', 'Fitoterapia', 'Consultoría'],
    email: 'ana@natulanda.com',
    phone: '+57 300 123 4569'
  },
  {
    id: 4,
    name: 'Luis Herrera',
    position: 'Gerente de Ventas',
    image: 'https://images.pexels.com/photos/1043471/pexels-photo-1043471.jpeg',
    bio: 'Experto en desarrollo comercial y relaciones con clientes. Construye puentes entre Natulanda y la comunidad.',
    skills: ['Ventas', 'Marketing', 'Relaciones Públicas'],
    email: 'luis@natulanda.com',
    phone: '+57 300 123 4570'
  }
]

export default function EquipoPage() {
  useEffect(() => {
    gsap.fromTo('.team-header', 
      { opacity: 0, y: 30 },
      { opacity: 1, y: 0, duration: 0.8, ease: 'power2.out' }
    )

    gsap.fromTo('.team-card', 
      { opacity: 0, y: 50, scale: 0.9 },
      { 
        opacity: 1, 
        y: 0, 
        scale: 1,
        duration: 0.6,
        stagger: 0.2,
        ease: 'power2.out',
        delay: 0.3
      }
    )
  }, [])

  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="container mx-auto px-4">
        {/* Header */}
        <div className="team-header text-center mb-16">
          <h1 className="text-4xl lg:text-5xl font-bold text-[#486283] mb-6 font-['Plus_Jakarta_Sans']">
            Nuestro Equipo
          </h1>
          <p className="text-lg text-gray-600 max-w-3xl mx-auto leading-relaxed">
            Conoce a las personas apasionadas que hacen posible que Natulanda sea tu aliado 
            para una vida más saludable y natural. Cada miembro de nuestro equipo aporta 
            experiencia y dedicación para ofrecerte los mejores productos.
          </p>
        </div>

        {/* Team Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 xl:grid-cols-4 gap-8">
          {teamMembers.map((member) => (
            <Card key={member.id} className="team-card group hover:shadow-xl transition-all duration-300 overflow-hidden">
              <div className="relative h-80 overflow-hidden">
                <Image
                  src={member.image}
                  alt={member.name}
                  fill
                  className="object-cover group-hover:scale-110 transition-transform duration-300"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
                <div className="absolute bottom-4 left-4 text-white">
                  <h3 className="text-xl font-bold">{member.name}</h3>
                  <p className="text-sm opacity-90">{member.position}</p>
                </div>
              </div>
              
              <CardContent className="p-6">
                <p className="text-gray-600 mb-4 text-sm leading-relaxed">
                  {member.bio}
                </p>

                <div className="mb-4">
                  <h4 className="text-sm font-semibold text-[#486283] mb-2">Especialidades:</h4>
                  <div className="flex flex-wrap gap-1">
                    {member.skills.map((skill, index) => (
                      <Badge key={index} variant="secondary" className="text-xs">
                        {skill}
                      </Badge>
                    ))}
                  </div>
                </div>

                <div className="space-y-2">
                  <div className="flex items-center gap-2 text-sm text-gray-600">
                    <Mail className="h-4 w-4" />
                    <span>{member.email}</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm text-gray-600">
                    <Phone className="h-4 w-4" />
                    <span>{member.phone}</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </div>
  )
}