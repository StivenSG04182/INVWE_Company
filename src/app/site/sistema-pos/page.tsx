'use client'

import { useEffect } from 'react'
import { gsap } from 'gsap'
import Image from 'next/image'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Check, ShoppingCart, BarChart3, Users, Zap, Shield, Smartphone, Cloud } from 'lucide-react'

const features = [
  {
    icon: ShoppingCart,
    title: 'Gestión de Ventas',
    description: 'Sistema completo para procesar ventas rápidamente con interfaz intuitiva.'
  },
  {
    icon: BarChart3,
    title: 'Reportes Avanzados',
    description: 'Análisis detallados de ventas, inventario y rendimiento del negocio.'
  },
  {
    icon: Users,
    title: 'Gestión de Clientes',
    description: 'Base de datos de clientes con historial de compras y preferencias.'
  },
  {
    icon: Zap,
    title: 'Procesamiento Rápido',
    description: 'Transacciones ultrarrápidas para mejorar la experiencia del cliente.'
  },
  {
    icon: Shield,
    title: 'Seguridad Garantizada',
    description: 'Protección de datos con los más altos estándares de seguridad.'
  },
  {
    icon: Smartphone,
    title: 'Multiplataforma',
    description: 'Funciona en tablets, smartphones y computadores sin problemas.'
  },
  {
    icon: Cloud,
    title: 'En la Nube',
    description: 'Accede a tu información desde cualquier lugar, en cualquier momento.'
  }
]

const plans = [
  {
    name: 'Básico',
    price: 89000,
    period: 'mes',
    description: 'Perfect para pequeños negocios',
    features: [
      'Hasta 1,000 productos',
      'Reportes básicos',
      'Soporte por email',
      '1 usuario',
      'Backup diario'
    ],
    popular: false
  },
  {
    name: 'Profesional',
    price: 149000,
    period: 'mes',
    description: 'Ideal para negocios en crecimiento',
    features: [
      'Productos ilimitados',
      'Reportes avanzados',
      'Soporte prioritario',
      'Hasta 5 usuarios',
      'Backup en tiempo real',
      'Integración con contabilidad',
      'App móvil incluida'
    ],
    popular: true
  },
  {
    name: 'Empresarial',
    price: 249000,
    period: 'mes',
    description: 'Para grandes operaciones',
    features: [
      'Todo lo del plan Profesional',
      'Usuarios ilimitados',
      'Soporte 24/7',
      'Personalización avanzada',
      'API completa',
      'Capacitación incluida',
      'Gerente de cuenta dedicado'
    ],
    popular: false
  }
]

export default function SistemaPOSPage() {
  useEffect(() => {
    gsap.fromTo('.pos-header', 
      { opacity: 0, y: 30 },
      { opacity: 1, y: 0, duration: 0.8, ease: 'power2.out' }
    )

    gsap.fromTo('.pos-card', 
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

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('es-CO', {
      style: 'currency',
      currency: 'COP',
      minimumFractionDigits: 0
    }).format(price)
  }

  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="container mx-auto px-4">
        {/* Header */}
        <div className="pos-header text-center mb-16">
          <Badge className="mb-4 bg-[#899735] text-white px-4 py-2">
            Sistema POS
          </Badge>
          <h1 className="text-4xl lg:text-5xl font-bold text-[#486283] mb-6 font-['Plus_Jakarta_Sans']">
            Sistema POS Natulanda
          </h1>
          <p className="text-lg text-gray-600 max-w-3xl mx-auto leading-relaxed">
            Potencia tu negocio con nuestro sistema de punto de venta diseñado 
            especialmente para tiendas de productos naturales y saludables.
          </p>
        </div>

        {/* Hero Section */}
        <div className="pos-card mb-20">
          <Card className="overflow-hidden">
            <div className="grid grid-cols-1 lg:grid-cols-2">
              <div className="relative h-64 lg:h-96">
                <Image
                  src="https://images.pexels.com/photos/4386321/pexels-photo-4386321.jpeg"
                  alt="Sistema POS Natulanda"
                  fill
                  className="object-cover"
                />
              </div>
              <CardContent className="p-8 lg:p-12 flex flex-col justify-center">
                <h2 className="text-3xl font-bold text-[#486283] mb-6">
                  Moderniza tu Tienda
                </h2>
                <p className="text-gray-600 mb-8 leading-relaxed">
                  Nuestro sistema POS está diseñado específicamente para negocios 
                  de productos naturales, con funcionalidades que se adaptan a tus 
                  necesidades específicas.
                </p>
                <div className="flex flex-col sm:flex-row gap-4">
                  <Button className="bg-[#899735] hover:bg-[#899735]/90 text-white">
                    Solicitar Demo
                  </Button>
                  <Button variant="outline" className="border-[#486283] text-[#486283]">
                    Ver Precios
                  </Button>
                </div>
              </CardContent>
            </div>
          </Card>
        </div>

        {/* Features */}
        <div className="mb-20">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-[#486283] mb-4">
              Características Principales
            </h2>
            <p className="text-gray-600 max-w-2xl mx-auto">
              Todo lo que necesitas para gestionar tu negocio de manera eficiente
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {features.map((feature, index) => (
              <Card key={index} className="pos-card group hover:shadow-xl transition-all duration-300">
                <CardContent className="p-6 text-center">
                  <div className="w-16 h-16 bg-[#486283]/10 rounded-full flex items-center justify-center mx-auto mb-4 group-hover:bg-[#486283] transition-colors">
                    <feature.icon className="h-8 w-8 text-[#486283] group-hover:text-white transition-colors" />
                  </div>
                  <h3 className="text-xl font-bold text-[#486283] mb-3">
                    {feature.title}
                  </h3>
                  <p className="text-gray-600 leading-relaxed">
                    {feature.description}
                  </p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>

        {/* Pricing */}
        <div className="mb-20">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-[#486283] mb-4">
              Planes y Precios
            </h2>
            <p className="text-gray-600 max-w-2xl mx-auto">
              Elige el plan que mejor se adapte a tu negocio
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {plans.map((plan, index) => (
              <Card key={index} className={`pos-card relative ${plan.popular ? 'ring-2 ring-[#899735] scale-105' : ''}`}>
                {plan.popular && (
                  <Badge className="absolute -top-3 left-1/2 transform -translate-x-1/2 bg-[#899735] text-white">
                    Más Popular
                  </Badge>
                )}
                <CardContent className="p-8 text-center">
                  <h3 className="text-2xl font-bold text-[#486283] mb-2">
                    {plan.name}
                  </h3>
                  <p className="text-gray-600 mb-6">
                    {plan.description}
                  </p>
                  <div className="mb-6">
                    <span className="text-4xl font-bold text-[#486283]">
                      {formatPrice(plan.price)}
                    </span>
                    <span className="text-gray-600">/{plan.period}</span>
                  </div>
                  <ul className="space-y-3 mb-8">
                    {plan.features.map((feature, featureIndex) => (
                      <li key={featureIndex} className="flex items-center gap-3">
                        <Check className="h-5 w-5 text-[#899735] flex-shrink-0" />
                        <span className="text-gray-600">{feature}</span>
                      </li>
                    ))}
                  </ul>
                  <Button 
                    className={`w-full ${plan.popular 
                      ? 'bg-[#899735] hover:bg-[#899735]/90 text-white' 
                      : 'bg-white border border-[#486283] text-[#486283] hover:bg-[#486283] hover:text-white'
                    }`}
                  >
                    Comenzar Ahora
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>

        {/* CTA Section */}
        <Card className="pos-card bg-[#486283] text-white">
          <CardContent className="p-12 text-center">
            <h2 className="text-3xl font-bold mb-6">
              ¿Listo para Modernizar tu Negocio?
            </h2>
            <p className="text-xl mb-8 opacity-90 max-w-2xl mx-auto">
              Únete a cientos de comerciantes que ya confían en nuestro sistema POS 
              para hacer crecer sus negocios.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button className="bg-[#899735] hover:bg-[#899735]/90 text-white px-8 py-3">
                Solicitar Demo Gratuita
              </Button>
              <Button variant="outline" className="border-white text-white hover:bg-white hover:text-[#486283] px-8 py-3">
                Hablar con Ventas
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}