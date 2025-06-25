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
    name: 'Flor de Caléndula',
    price: 15000,
    image: 'https://images.pexels.com/photos/1640777/pexels-photo-1640777.jpeg',
    category: 'Flores',
    description: 'Flor de caléndula natural, perfecta para infusiones y uso medicinal.',
    benefits: ['Antiinflamatoria', 'Cicatrizante', 'Antioxidante']
  },
  {
    id: '2',
    name: 'Orégano Premium',
    price: 12000,
    image: 'https://images.pexels.com/photos/4198015/pexels-photo-4198015.jpeg',
    category: 'Especias',
    description: 'Orégano de la mejor calidad, ideal para condimentar tus comidas.',
    benefits: ['Antibacteriano', 'Digestivo', 'Rico en antioxidantes']
  },
  {
    id: '3',
    name: 'Anís Estrellado',
    price: 18000,
    image: 'https://images.pexels.com/photos/4198015/pexels-photo-4198015.jpeg',
    category: 'Especias',
    description: 'Anís estrellado aromático y delicioso para infusiones.',
    benefits: ['Digestivo', 'Expectorante', 'Aromático']
  },
  {
    id: '4',
    name: 'Manzanilla Orgánica',
    price: 14000,
    image: 'https://images.pexels.com/photos/1640777/pexels-photo-1640777.jpeg',
    category: 'Flores',
    description: 'Manzanilla orgánica para relajación y bienestar.',
    benefits: ['Relajante', 'Digestiva', 'Antiinflamatoria']
  },
  {
    id: '5',
    name: 'Frutas Deshidratadas Mix',
    price: 25000,
    image: 'https://images.pexels.com/photos/1132047/pexels-photo-1132047.jpeg',
    category: 'Frutas',
    description: 'Mezcla de frutas deshidratadas naturales sin azúcar añadida.',
    benefits: ['Rica en fibra', 'Energética', 'Sin conservantes']
  },
  {
    id: '6',
    name: 'Té Verde Orgánico',
    price: 20000,
    image: 'https://images.pexels.com/photos/1640777/pexels-photo-1640777.jpeg',
    category: 'Tés',
    description: 'Té verde orgánico de alta calidad con propiedades antioxidantes.',
    benefits: ['Antioxidante', 'Energizante', 'Quema grasa']
  }
]

const categories = ['Todas', 'Flores', 'Especias', 'Frutas', 'Tés']

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
                  
                  <Button
                    onClick={() => handleAddToCart(product)}
                    className="bg-[#486283] hover:bg-[#486283]/90 text-white transition-all duration-300 hover:scale-105"
                  >
                    <ShoppingCart className="h-4 w-4 mr-2" />
                    Agregar
                  </Button>
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