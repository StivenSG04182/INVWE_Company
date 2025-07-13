'use client'

import { useEffect } from 'react'
import { gsap } from 'gsap'
import Image from 'next/image'
import Link from 'next/link'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Calendar, User, ArrowRight } from 'lucide-react'

const blogPosts = [
  {
    id: 1,
    title: 'Los Beneficios de la Caléndula para tu Salud',
    excerpt: 'Descubre todas las propiedades medicinales de esta maravillosa flor y cómo puede mejorar tu bienestar.',
    image: '/images/blog/seitan.webp',
    category: 'Salud Natural',
    author: 'María González',
    date: '15 Enero 2024',
    readTime: '5 min'
  },
  {
    id: 2,
    title: 'Orégano: Más que una Especia',
    excerpt: 'Conoce los usos medicinales del orégano y cómo incorporarlo en tu rutina diaria de bienestar.',
    image: 'https://images.pexels.com/photos/4198015/pexels-photo-4198015.jpeg',
    category: 'Especias',
    author: 'Ana Martínez',
    date: '12 Enero 2024',
    readTime: '4 min'
  },
  {
    id: 3,
    title: 'Alimentación Consciente: Una Guía Completa',
    excerpt: 'Aprende los principios básicos de la alimentación consciente y cómo transformar tu relación con la comida.',
    image: 'https://images.pexels.com/photos/1132047/pexels-photo-1132047.jpeg',
    category: 'Nutrición',
    author: 'Carlos Rodríguez',
    date: '10 Enero 2024',
    readTime: '8 min'
  },
  {
    id: 4,
    title: 'Infusiones para Cada Momento del Día',
    excerpt: 'Descubre qué infusiones son perfectas para energizarte por la mañana o relajarte por la noche.',
    image: 'https://images.pexels.com/photos/1640777/pexels-photo-1640777.jpeg',
    category: 'Infusiones',
    author: 'Luis Herrera',
    date: '8 Enero 2024',
    readTime: '6 min'
  },
  {
    id: 5,
    title: 'Frutas Deshidratadas: Snacks Saludables',
    excerpt: 'Todo lo que necesitas saber sobre las frutas deshidratadas y sus beneficios nutricionales.',
    image: 'https://images.pexels.com/photos/1132047/pexels-photo-1132047.jpeg',
    category: 'Nutrición',
    author: 'María González',
    date: '5 Enero 2024',
    readTime: '7 min'
  },
  {
    id: 6,
    title: 'Cómo Crear tu Huerto de Hierbas Medicinales',
    excerpt: 'Guía paso a paso para cultivar tus propias hierbas medicinales en casa.',
    image: 'https://images.pexels.com/photos/4198015/pexels-photo-4198015.jpeg',
    category: 'Cultivo',
    author: 'Ana Martínez',
    date: '3 Enero 2024',
    readTime: '10 min'
  }
]

const categories = ['Todas', 'Salud Natural', 'Especias', 'Nutrición', 'Infusiones', 'Cultivo']

export default function BlogPage() {
  useEffect(() => {
    gsap.fromTo('.blog-header', 
      { opacity: 0, y: 30 },
      { opacity: 1, y: 0, duration: 0.8, ease: 'power2.out' }
    )

    gsap.fromTo('.blog-card', 
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
        <div className="blog-header text-center mb-16">
          <h1 className="text-4xl lg:text-5xl font-bold text-[#486283] mb-6 font-['Plus_Jakarta_Sans']">
            Blog Natulanda
          </h1>
          <p className="text-lg text-gray-600 max-w-3xl mx-auto leading-relaxed">
            Descubre consejos, recetas y conocimientos sobre vida saludable, 
            productos naturales y bienestar integral.
          </p>
        </div>

        {/* Categories */}
        <div className="flex flex-wrap justify-center gap-4 mb-12">
          {categories.map((category) => (
            <Badge 
              key={category} 
              variant="outline" 
              className="px-4 py-2 cursor-pointer hover:bg-[#486283] hover:text-white transition-colors"
            >
              {category}
            </Badge>
          ))}
        </div>

        {/* Featured Post */}
        <Card className="blog-card mb-12 overflow-hidden">
          <div className="grid grid-cols-1 lg:grid-cols-2">
            <div className="relative h-64 lg:h-auto">
              <Image
                src={blogPosts[0].image}
                alt={blogPosts[0].title}
                fill
                className="object-cover"
              />
            </div>
            <CardContent className="p-8 flex flex-col justify-center">
              <Badge className="w-fit mb-4 bg-[#899735]">
                {blogPosts[0].category}
              </Badge>
              <h2 className="text-2xl lg:text-3xl font-bold text-[#486283] mb-4">
                {blogPosts[0].title}
              </h2>
              <p className="text-gray-600 mb-6 leading-relaxed">
                {blogPosts[0].excerpt}
              </p>
              <div className="flex items-center gap-4 text-sm text-gray-500 mb-6">
                <div className="flex items-center gap-2">
                  <User className="h-4 w-4" />
                  {blogPosts[0].author}
                </div>
                <div className="flex items-center gap-2">
                  <Calendar className="h-4 w-4" />
                  {blogPosts[0].date}
                </div>
                <span>{blogPosts[0].readTime} lectura</span>
              </div>
              <Link 
                href={`/blog/${blogPosts[0].id}`}
                className="inline-flex items-center gap-2 text-[#486283] hover:text-[#899735] font-medium transition-colors"
              >
                Leer más
                <ArrowRight className="h-4 w-4" />
              </Link>
            </CardContent>
          </div>
        </Card>

        {/* Blog Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {blogPosts.slice(1).map((post) => (
            <Card key={post.id} className="blog-card group hover:shadow-xl transition-all duration-300 overflow-hidden">
              <div className="relative h-48 overflow-hidden">
                <Image
                  src={post.image}
                  alt={post.title}
                  fill
                  className="object-cover group-hover:scale-110 transition-transform duration-300"
                />
                <Badge className="absolute top-4 left-4 bg-[#899735] text-white">
                  {post.category}
                </Badge>
              </div>
              
              <CardContent className="p-6">
                <h3 className="text-xl font-bold text-[#486283] mb-3 group-hover:text-[#899735] transition-colors">
                  {post.title}
                </h3>
                
                <p className="text-gray-600 mb-4 text-sm leading-relaxed">
                  {post.excerpt}
                </p>

                <div className="flex items-center gap-4 text-xs text-gray-500 mb-4">
                  <div className="flex items-center gap-1">
                    <User className="h-3 w-3" />
                    {post.author}
                  </div>
                  <div className="flex items-center gap-1">
                    <Calendar className="h-3 w-3" />
                    {post.date}
                  </div>
                  <span>{post.readTime}</span>
                </div>

                <Link 
                  href={`/blog/${post.id}`}
                  className="inline-flex items-center gap-2 text-[#486283] hover:text-[#899735] font-medium transition-colors text-sm"
                >
                  Leer más
                  <ArrowRight className="h-3 w-3" />
                </Link>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Newsletter Subscription */}
        <Card className="mt-16 bg-[#486283] text-white">
          <CardContent className="p-8 text-center">
            <h2 className="text-2xl font-bold mb-4">
              Suscríbete a nuestro newsletter
            </h2>
            <p className="mb-6 opacity-90">
              Recibe los últimos artículos y consejos sobre vida saludable directamente en tu correo.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 max-w-md mx-auto">
              <input
                type="email"
                placeholder="Tu correo electrónico"
                className="flex-1 px-4 py-2 rounded-lg text-black"
              />
              <button className="bg-[#899735] hover:bg-[#899735]/90 px-6 py-2 rounded-lg font-medium transition-colors">
                Suscribirse
              </button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}