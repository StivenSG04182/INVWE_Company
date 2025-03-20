'use client'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { useState } from 'react'

interface Product{
    id: number
    name: string
    type: string
    stock: number
}

export default function ProductPage(){
    const [products, setProducts] = useState<Product[]>([
        {
            id: 1,
            name: "Banano",
            type: "fruta",
            stock: "50"
        }
    ])

    return(
        <div className='p-6 max-w-4xl'>
            <h1 className="text-2xl font-bold mb-4">Inventario</h1>
            <div className="flex gap-4 mb-6">
                <Input
                    placeholder="Search Product..."
                    className="max-w-sm"
                />
                <Button>Add Product</Button>
            </div>

            <div className='grid gap-4 md:grid-cols-2 lg:grid-cols-3'>
                {products.map(Product => (
                    <Card key={Product.id}>
                        <CardHeader>
                            <CardTitle>{Product.name}</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <p className="text-sm text-gray-600">
                                type: {Product.type}
                                <p>stock: {Product.stock}</p>
                            </p>
                            <div className="flex gap-2 mt-4">
                                <Button variant="outline" size="sm">Edit</Button>
                                <Button variant="destructive" size="sm">Delete</Button>
                            </div>
                        </CardContent>
                    </Card>
                ))}
            </div>
        </div>
    )
}