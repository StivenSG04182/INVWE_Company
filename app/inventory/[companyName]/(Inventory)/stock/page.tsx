'use client'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { useState } from 'react'
import { ProductModal } from '@/components/modal/product-modal'

interface Product {
    id: number
    name: string
    type: string
    stock: number
    price: number
    description: string
    imagen?: string
}

export default function ProductPage() {
    const [products, setProducts] = useState<Product[]>([
        {
            id: 1,
            name: "Banano",
            type: "fruta",
            stock: 200,
            price: 100,
            description: "es un banano",
            imagen: "https://via.placeholder.com/150"
        },
        {
            id: 2,
            name: "Manzana",
            type: "fruta",
            stock: 50,
            price: 102,
            description: "es una manzana",
            imagen: "https://via.placeholder.com/150"
        },
        {
            id: 3,
            name: "frutos secos",
            type: "pasabocas",
            stock: 100,
            price: 300,
            description: "Diversa variedad de frutos secos",
            imagen: "https://via.placeholder.com/150"
        }
    ])

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
        setProducts(products.filter(p => p.id !== productId))
    }

    const handleSubmitProduct = (productData: Product) => {
        if (currentProduct) {
            // Editar producto existente
            setProducts(products.map(p =>
                p.id === currentProduct.id ? { ...productData, id: currentProduct.id } : p
            ))
        } else {
            // Añadir nuevo producto
            const newProduct = {
                ...productData,
                id: Math.max(...products.map(p => p.id), 0) + 1
            }
            setProducts([...products, newProduct])
        }
        setIsModalOpen(false)
    }

    const filteredProducts = products.filter(product =>
        product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        product.type.toLowerCase().includes(searchTerm.toLowerCase()) ||
        product.description.toLowerCase().includes(searchTerm.toLowerCase())
    )

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
            <div className='flex justify-center gap-8 w-full grid grid-cols-4 flex-grow overflow-y-auto'>
                {filteredProducts.map(product => (
                    <Card key={product.id} className='flex-1 '>
                        <CardContent className='grid grid-cols-1 gap-4'>
                            <p className='font-bold my-4 text-lg flex-grow'>{product.name}</p>
                            <div className='self-center justify-self-center h-24 w-24 max-h-[10rem] max-w-[10rem] rounded-full bg-gray-200 overflow-hidden flex-grow overflow-y-auto'>
                                {product.imagen ? (
                                    <img
                                        src={product.imagen}
                                        className="w-full h-full object-cover"
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
                onSubmit={handleSubmitProduct}
                onDelete={currentProduct ? () => handleDeleteProduct(currentProduct.id) : undefined}
                initialData={currentProduct}
                mode={currentProduct ? 'edit' : 'add'}
                categories={categories}
            />
        </div>
    )
}