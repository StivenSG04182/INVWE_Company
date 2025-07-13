'use client'

import { useState, useEffect } from 'react'
import { gsap } from 'gsap'
import Image from 'next/image'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { useCart } from '@/components/site/contexts/CartContext'
import { ShoppingCart, Filter } from 'lucide-react'
import { useToast } from '@/hooks/use-toast'

interface Product {
  id: string
  name: string
  price: number
  image: string
  category: string
  description: string
  benefits: string[]
}

const products: Product[] = [
  {
    id: '1',
    name: 'Yogurt de Almendras',
    price: 13600,
    image: '/images/productos/Yogurt_almendras.webp',
    category: 'Lacteos',
    description: 'Yogurt a base de almendras, ideal para suplementar la lactosa.',
    benefits: ['Bajo en grasas', 'Antioxidante']
  },
  {
    id: '2',
    name: 'Mango Deshidratado',
    price: 2500,
    image: '/images/productos/mango_deshidratado.avif',
    category: 'Frutas Secas',
    description: 'Mango deshidratado azucarado, ideal para snacks.',
    benefits: ['Digestivo', 'Rico en antioxidantes']
  },
  {
    id: '3',
    name: 'Quinoa',
    price: 11300,
    image: '/images/productos/quinoa.png',
    category: 'Semillas',
    description: 'Quinoa perfecta para complementar tus comidas y dar un toque nutricional.',
    benefits: ['Digestivo', 'Expectorante']
  },
  {
    id: '4',
    name: 'Seitan',
    price: 50000,
    image: '/images/productos/seitan.webp',
    category: 'Proteinas/Suplementos',
    description: 'alternativa vegana a la carne, suplemento alimentario.',
    benefits: ['Digestiva', 'Antiinflamatoria']
  },
  {
    id: '5',
    name: 'Semillas de Girasol',
    price: 600,
    image: '/images/productos/semillas_girasol.avif',
    category: 'Semillas',
    description: 'Semillas de girasol perfectas para snacks.',
    benefits: ['Rica en fibra', 'Energética']
  },
  {
    id: '6',
    name: 'Tofu',
    price: 5000,
    image: '/images/productos/tofu.webp',
    category: 'Proteinas/Suplementos',
    description: 'suplemento vegetariano, remplazo de la carne.',
    benefits: ['Antioxidante', 'Digestivo']
  }
]

const categories = ['Todas', 'Lacteos', 'Frutas Secas', 'Semillas', 'Proteinas/Suplementos']

export default function ProductosPage() {
  const [selectedCategory, setSelectedCategory] = useState('Todas')
  const [filteredProducts, setFilteredProducts] = useState(products)
  const { addItem } = useCart()
  const { toast } = useToast()

  useEffect(() => {
    // GSAP animations
    gsap.fromTo('.products-header', 
      { opacity: 0, y: 30 },
      { opacity: 1, y: 0, duration: 0.8, ease: 'power2.out' }
    )

    gsap.fromTo('.product-card', 
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
  }, [filteredProducts])

  useEffect(() => {
    if (selectedCategory === 'Todas') {
      setFilteredProducts(products)
    } else {
      setFilteredProducts(products.filter(product => product.category === selectedCategory))
    }
  }, [selectedCategory])

  const handleAddToCart = (product: Product) => {
    addItem({
      id: product.id,
      name: product.name,
      price: product.price,
      image: product.image,
      category: product.category
    })
    
    toast({
      title: "Producto agregado",
      description: `${product.name} se agregó al carrito`,
    })
  }

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
        <div className="products-header text-center mb-12">
          <h1 className="text-4xl lg:text-5xl font-bold text-[#486283] mb-4 font-['Plus_Jakarta_Sans']">
            Nuestros Productos
          </h1>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            Descubre nuestra selección de productos naturales de la mejor calidad para tu bienestar
          </p>
        </div>

        {/* Filters */}
        <div className="flex flex-col sm:flex-row justify-between items-center mb-8 gap-4">
          <div className="flex items-center gap-2">
            <Filter className="h-5 w-5 text-[#486283]" />
            <span className="text-[#486283] font-medium">Filtrar por categoría:</span>
          </div>
          
          <Select value={selectedCategory} onValueChange={setSelectedCategory}>
            <SelectTrigger className="w-48">
              <SelectValue placeholder="Seleccionar categoría" />
            </SelectTrigger>
            <SelectContent>
              {categories.map((category) => (
                <SelectItem key={category} value={category}>
                  {category}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Products Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {filteredProducts.map((product) => (
            <Card key={product.id} className="product-card group hover:shadow-xl transition-all duration-300 overflow-hidden">
              <div className="relative h-64 overflow-hidden">
                <Image
                  src={product.image}
                  alt={product.name}
                  fill
                  className="object-cover group-hover:scale-110 transition-transform duration-300"
                />
                <Badge className="absolute top-4 left-4 bg-[#899735] text-white">
                  {product.category}
                </Badge>
              </div>
              
              <CardContent className="p-6">
                <h3 className="text-xl font-bold text-[#486283] mb-2">
                  {product.name}
                </h3>
                
                <p className="text-gray-600 mb-4 text-sm">
                  {product.description}
                </p>

                <div className="mb-4">
                  <h4 className="text-sm font-semibold text-[#486283] mb-2">Beneficios:</h4>
                  <div className="flex flex-wrap gap-1">
                    {product.benefits.map((benefit, index) => (
                      <Badge key={index} variant="secondary" className="text-xs">
                        {benefit}
                      </Badge>
                    ))}
                  </div>
                </div>

                <div className="flex items-center justify-between">
                  <span className="text-2xl font-bold text-[#899735]">
                    {formatPrice(product.price)}
                  </span>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {filteredProducts.length === 0 && (
          <div className="text-center py-12">
            <p className="text-gray-500 text-lg">
              No se encontraron productos en esta categoría.
            </p>
          </div>
        )}
      </div>
    </div>
  )
}