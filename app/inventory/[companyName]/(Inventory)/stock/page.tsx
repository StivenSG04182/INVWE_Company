'use client'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent,/*  CardHeader, CardTitle */ } from '@/components/ui/card'
import { useState } from 'react'
import { ProductModal } from '@/components/modal/product-modal'
import { ProductProvider, useProducts, Product } from '@/contexts/product-context'
import Image from 'next/image'

// Componente principal que envuelve el contenido con el proveedor de contexto
export default function ProductPage() {
    return (
        <ProductProvider>
            <StockContent />
        </ProductProvider>
    )
}

// Componente que consume el contexto de productos
function StockContent() {
    const { addProduct, updateProduct, deleteProduct, getFilteredProducts } = useProducts()
    const [isModalOpen, setIsModalOpen] = useState(false)
    const [currentProduct, setCurrentProduct] = useState<Product | null>(null)
    const [searchTerm, setSearchTerm] = useState('')

    const categories = ['fruta', 'pasabocas', 'bebida', 'lácteo'] // Ejemplo de categorías

    const handleAddProduct = () => {
        setCurrentProduct(null)
        setIsModalOpen(true)
    }

    const handleEditProduct = (product: Product) => {
        setCurrentProduct(product)
        setIsModalOpen(true)
    }

    const handleDeleteProduct = (productId: number) => {
        deleteProduct(productId)
    }

    const handleSubmitProduct = (productData: Product) => {
        if (currentProduct) {
            // Editar producto existente
            updateProduct(currentProduct.id, productData)
        } else {
            // Añadir nuevo producto
            addProduct(productData)
        }
        setIsModalOpen(false)
    }

    const filteredProducts = getFilteredProducts(searchTerm)

    return (
        <div className='p-6 w-auto'>
            <h1 className="text-2xl font-bold mb-4">Stock</h1>
            <div className="flex gap-4 mb-6">
                <Input
                    placeholder="Search Product..."
                    className="max-w-sm"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                />
                <Button onClick={handleAddProduct}>Add Product</Button>
            </div>
            <div className="border-b border-black my-4" />
            <div className='justify-center gap-8 w-full grid grid-cols-4 flex-grow overflow-y-auto'>
                {filteredProducts.map(product => (
                    <Card key={product.id} className='flex-1 '>
                        <CardContent className='grid grid-cols-1 gap-4'>
                            <p className='font-bold my-4 text-lg flex-grow'>{product.name}</p>
                            <div className='self-center justify-self-center h-24 w-24 max-h-[10rem] max-w-[10rem] rounded-full bg-gray-200 overflow-hidden flex-grow overflow-y-auto'>
                                {product.imagen ? (
                                    <Image
                                        src={product.imagen}
                                        className="w-full h-full object-cover"
                                        alt="Product Image"
                                        width={100}
                                        height={100}
                                    />
                                ) : (
                                    <div className="grid place-self-center text-gray-500">
                                        Sin imagen
                                    </div>

                                )}
                            </div>
                            <div className='justify-stretch self-center text-sm overflow-hidden text-balance'>
                                <p>Tipo: {product.type}</p>
                                <p>Stock: {product.stock}</p>
                                <p>Precio: ${product.price}</p>
                                <p>Descripción: {product.description}</p>
                            </div>
                            <div className="grid grid-cols-2 gap-2 w-full flex-grow self-end">
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
                        </CardContent>
                    </Card>
                ))}
            </div>

            <ProductModal

                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                onSubmit={(productData: Product & { price: number }) => handleSubmitProduct(productData)}
                onDelete={currentProduct ? () => handleDeleteProduct(currentProduct.id) : undefined}
                initialData={currentProduct ? { ...currentProduct, totalPrice: 0 } : undefined}
                mode={currentProduct ? 'edit' : 'add'}
                categories={categories}
            />
        </div>
    )
}