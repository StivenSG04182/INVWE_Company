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
    title: 'Quinoa: El Grano de Oro para tu Bienestar',
    excerpt: 'Descubre cómo la quinoa puede aportar proteínas completas y nutrientes esenciales a tu dieta diaria, mejorando tu energía y vitalidad.',
    image: '/images/blog/quinoa.png',
    category: 'Salud Natural',
    author: 'María González',
    date: '15 Enero 2024',
    readTime: '5 min'
  },
  {
    id: 2,
    title: 'Seitán: Proteína Vegetal para una Dieta Equilibrada',
    excerpt: 'Conoce los beneficios del seitán, cómo prepararlo en casa y disfrutarlo como alternativa deliciosa a la carne.',
    image: '/images/blog/seitan.webp',
    category: 'Especias',
    author: 'Ana Martínez',
    date: '12 Enero 2024',
    readTime: '4 min'
  },
  {
    id: 3,
    title: 'Tofu: Versatilidad y Nutrición en tu Cocina',
    excerpt: 'Aprende a incorporar tofu en tus recetas diarias para aprovechar sus propiedades nutritivas y su gran capacidad de adaptación a cualquier plato.',
    image: '/images/blog/tofu.webp',
    category: 'Nutrición',
    author: 'Carlos Rodríguez',
    date: '10 Enero 2024',
    readTime: '8 min'
  },
  {
    id: 4,
    title: 'Semillas de Girasol: Pequeñas pero Poderosas',
    excerpt: 'Todo lo que necesitas saber para incluir semillas de girasol en tu alimentación y beneficiarte de sus nutrientes esenciales.',
    image: '/images/blog/semillas_girasol.avif',
    category: 'Infusiones',
    author: 'Luis Herrera',
    date: '8 Enero 2024',
    readTime: '6 min'
  },
  {
    id: 5,
    title: 'Mango Deshidratado: Un Snack Natural y Energético',
    excerpt: 'Descubre por qué el mango deshidratado es una excelente opción para un snack saludable y lleno de sabor.',
    image: '/images/blog/mango_deshidratado.avif',
    category: 'Nutrición',
    author: 'María González',
    date: '5 Enero 2024',
    readTime: '7 min'
  },
  {
    id: 6,
    title: 'Yogurt de Almendras: Alternativa Vegetal y Deliciosa',
    excerpt: 'Aprende los beneficios del yogurt de almendras y cómo incluirlo en desayunos, postres o snacks nutritivos.',
    image: '/images/blog/Yogurt_almendras.webp',
    category: 'Cultivo',
    author: 'Ana Martínez',
    date: '3 Enero 2024',
    readTime: '10 min'
  }
]
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
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </div>
  )
}