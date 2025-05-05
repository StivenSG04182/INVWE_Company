'use client'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card'
import { useState } from 'react'
import { ProviderModal } from '@/components/modal/providerModal'

interface Provider {
    id: number
    name: string
    product: string
    phone: number
    email: string
    imagen?: string
}

export default function ProvidersPage() {
    const [providers, setProviders] = useState<Provider[]>([
        {
            id: 1,
            name: "cocacola",
            product: "gaseosa",
            phone: 3145895621,
            email: "provedores@gmail.com",
            imagen: ""
        }
    ])

    const [isModalOpen, setIsModalOpen] = useState(false)
    const [currentProvider, setCurrentProvider] = useState<Provider | null>(null)
    const [searchTerm, setSearchTerm] = useState('')

    const handleAddProvider = () => {
        setCurrentProvider(null)
        setIsModalOpen(true)
    }

    const handleEditProvider = (provider: Provider) => {
        setCurrentProvider(provider)
        setIsModalOpen(true)
    }

    const handleDeleteProvider = (providerId: number) => {
        setProviders(providers.filter(p => p.id !== providerId))
    }

    const handleSubmitProvider = (providerData: Provider) => {
        if (currentProvider) {
            // Editar proveedor existente
            setProviders(providers.map(p => 
                p.id === currentProvider.id ? { ...providerData, id: currentProvider.id } as Provider : p
            ))
        } else {
            // Añadir nuevo proveedor
            const newProvider = {
                ...providerData,
                id: Math.max(...providers.map(p => p.id), 0) + 1,
                phone: Number(providerData.phone)
            } as Provider
            setProviders([...providers, newProvider])
        }
        setIsModalOpen(false)
    }

    const filteredProviders = providers.filter(provider =>
        provider.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        provider.product.toLowerCase().includes(searchTerm.toLowerCase()) ||
        provider.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
        provider.phone.toString().includes(searchTerm)
    )

    return(
        <div className='p-6 w-auto'>
            <h1 className="text-2xl font-bold mb-4">Providers</h1>
            <div className="flex gap-4 mb-6">
              <Input
                  placeholder="Search Provider..."
                  className="max-w-sm"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
              />
              <Button onClick={handleAddProvider}>Add Provider</Button>
            </div>
            <div className="border-b border-black my-4 w-auto"/>
            <div className='flex justify-center gap-8 w-full grid grid-cols-4 flex-grow overflow-y-auto'>
                {filteredProviders.map(provider => (
                    <Card key={provider.id} className='flex grid grid-cols-1'>
                        <CardHeader>
                            <CardTitle>{provider.name}</CardTitle>
                            <CardDescription>Product: {provider.product}</CardDescription>
                        </CardHeader>
                        <CardContent className='grid grid-cols-1 gap-4'>
                            <div className='justify-self-center justify-center items-center h-24 w-24 max-h-[10rem] max-w-[10rem] rounded-full bg-gray-200 overflow-hidden flex flex-grow overflow-y-auto pb-4'>
                            {provider.imagen ? (
                            <img
                             src={provider.imagen}
                            />
                            ) : (
                            <div className='text-sm text-gray-400'>
                             Sin imagen
                            </div>

                            )}
                            </div>
                            <div className="text-sm text-gray-600">
                                <p>Phone: {provider.phone}</p>
                                <p>Email: {provider.email}</p>
                            </div>
                        </CardContent>
                        <CardFooter className='flex justify-between self-end'>
                            <div className="grid grid-cols-2 gap-2 mt-4 w-full">
                                    <Button 
                                        variant="outline" 
                                        size="sm"
                                        onClick={() => handleEditProvider(provider)}
                                    >
                                        Edit
                                    </Button>
                                    <Button 
                                        variant="destructive" 
                                        size="sm"
                                        onClick={() => handleDeleteProvider(provider.id)}
                                    >
                                        Delete
                                    </Button>
                                </div>                      
                        </CardFooter>
                    </Card>
                ))}
            </div>

            <ProviderModal
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                onSubmit={handleSubmitProvider}
                onDelete={currentProvider ? () => handleDeleteProvider(currentProvider.id) : undefined}
                initialData={currentProvider}
                mode={currentProvider ? 'edit' : 'add'}
            />
        </div>
    )
}