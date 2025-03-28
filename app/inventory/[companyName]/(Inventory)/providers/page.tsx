'use client'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { useState } from 'react'

interface providers {
    id: number
    name: string
    product: string
    phone: number
    email: string
}
	
export default function providersPage(){
    const [providers, setProviders] = useState<providers[]>([
        {
            id: 1,
            name: "cocacola",
            product: "gaseosa",
            phone: 3145895621,
            email: "provedores@gmail.com"
        }
        ])

    return(
        <div className='p-6 max-w-4xl'>
            <h1 className="text-2xl font-bold mb-4">Providers</h1>
            <div className="flex gap-4 mb-6">
                <Input
                    placeholder="Search Provider..."
                    className="max-w-sm"
                />
                <Button>Add Provider</Button>
            </div>
            
            <div className='grid gap-4 md:grid-cols-2 lg:grid-cols-3'>
                {providers.map(provider => (
                    <Card key={provider.id} className='flex justify-items-center flex-col grid grid-cols-1'>
                        <CardHeader>
                            <CardTitle>{provider.name}</CardTitle>
                        </CardHeader>
                        <CardContent>
                        <div className='max-w-relative h-32 bg-gray-200 rounded-md mb-4 p-4'>
                            *imagen del producto *
                        </div>
                            <p className="text-sm text-gray-600">
                                product: {provider.product}
                                <p>phone: {provider.phone}</p>
                                <p>email: {provider.email}</p>
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