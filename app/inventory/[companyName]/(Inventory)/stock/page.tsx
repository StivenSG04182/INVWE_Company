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
    totalPrice: number
    description: string
}

export default function ProductPage(){
    const [products, ] = useState<Product[]>([
        {
            id: 1,
            name: "Banano",
            type: "fruta",
            stock: 200,
            totalPrice: 100,
            description: "es un banano"
        },
        {
            id: 2,
            name: "Manzana",
            type: "fruta",
            stock: 50,
            totalPrice: 102,
            description: "es una manzana"
        },
        {
            id: 3,
            name: "frutos secos",
            type: "pasabocas",
            stock: 100,
            totalPrice: 300,
            description: "Diversa variedad de frutos secos"
        }
    ])

    return(
        <div className='p-6 max-w-4xl'>
            <h1 className="text-2xl font-bold mb-4">Stock</h1>
            <div className="flex gap-4 mb-6">
                <Input
                    placeholder="Search Product..."
                    className="max-w-sm"
                />
                <Button>Add Product</Button>
            </div>

            <div className='grid gap-4 md:grid-cols-2 lg:grid-cols-3'>
                {products.map(Product => (
                    <Card key={Product.id} className='justify-items-center flex-col grid grid-cols-1'>
                        <CardHeader>
                            <CardTitle>{Product.name}</CardTitle>
                        </CardHeader>
                        <CardContent>
                        <div className='max-w-relative h-32 bg-gray-200 rounded-md mb-4 p-4'>
                            *imagen del producto *
                        </div>
                            <p className="text-sm text-gray-600">
                                type: {Product.type}
                                <p>stock: {Product.stock}</p>
                                <p>totalPrice: {Product.totalPrice}</p>
                                <p>description: {Product.description}</p>
                            </p>
                            <div className="grid grid-cols-2 gap-2 mt-4">
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