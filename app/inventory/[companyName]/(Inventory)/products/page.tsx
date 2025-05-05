'use client'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card'
import { useState } from 'react'
import { StockModal } from '@/components/modal/stock-modal'

interface Product {
  id: number
  name: string
  type: string
  price: number
  imagen?: string
}

export default function ProductsPage() {
  const [products, setProducts] = useState<Product[]>([
    {
      id: 1,
      name: "Banano",
      type: "fruta",
      price: 100,
      imagen: "https://via.placeholder.com/150"
    },
    {
      id: 2,
      name: "Manzana",
      type: "fruta",
      price: 100,
      imagen: "https://via.placeholder.com/150"
    }
  ])
  
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [currentProduct, setCurrentProduct] = useState<Product | null>(null)
  const [searchTerm, setSearchTerm] = useState('')

  const handleAddProduct = () => {
    setCurrentProduct(null)
    setIsModalOpen(true)
  }

  const handleEditProduct = (product: Product) => {
    setCurrentProduct(product)
    setIsModalOpen(true)
  }

  const handleDeleteProduct = (id: number) => {
    setProducts(products.filter(product => product.id !== id))
  }

  const handleSubmitProduct = (productData: Product) => {
    if (currentProduct) {
      // Edit existing product
      setProducts(products.map(p => 
        p.id === currentProduct.id ? { ...p, ...productData } : p
      ))
    } else {
      // Add new product
      const newId = Math.max(...products.map(p => p.id), 0) + 1
      setProducts([...products, { ...productData, id: newId}])
    }
    setIsModalOpen(false)
  }

  const filteredProducts = products.filter(product =>
    product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    product.type.toLowerCase().includes(searchTerm.toLowerCase())
  )

  return (
    <div className='p-6 w-auto'>
      <h1 className="text-2xl font-bold mb-4">Productos</h1>
      <div className="flex gap-4 mb-6">
        <Input
          placeholder="Search Product..."
          className="max-w-sm"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
        <Button onClick={handleAddProduct}>Add Product</Button>
      </div>
      <div className="border-b border-black my-4 w-auto"/>
      <div className='flex justify-center gap-8 w-full grid grid-cols-4 flex-grow overflow-y-auto'>
        {filteredProducts.map(product => (
          <Card key={product.id} className='flex grid grid-cols-1 gap-4'>
            <CardHeader>
              <CardTitle>{product.name}</CardTitle>
              <CardDescription>type: {product.type}</CardDescription>
            </CardHeader>
            <CardContent className='grid grid-cols-1 gap-4'>
            <div className='justify-self-center justify-center items-center h-24 w-24 max-h-[10rem] max-w-[10rem] rounded-full bg-gray-200 overflow-hidden flex flex-grow overflow-y-auto'>
                {product.imagen ? (
                <img
                 src={product.imagen}
                />
                ) : (
                <div className='text-sm text-gray-400'>
                  Sin imagen
                </div>

                )}
                </div>
              <p>price: {product.price}</p>
            </CardContent>
            <CardFooter className='flex justify-between self-end'>
              <div className="grid grid-cols-2 gap-2 w-full self-end">
                <Button
                 variant="outline"
                 size="sm"
                 onClick={() => handleEditProduct(product)}
                 >
                 Edit
                </Button>
                <Button
                 variant="destructive"
                 size="sm"
                 onClick={() => handleDeleteProduct(product.id)}
                >
                Delete
                </Button>
                </div>                            
                </CardFooter>
          </Card>
        ))}
      </div>

      <StockModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSubmit={handleSubmitProduct}
        initialData={currentProduct || undefined}
        onDelete={currentProduct ? () => handleDeleteProduct(currentProduct.id) : undefined}
      />
    </div>
  )
}