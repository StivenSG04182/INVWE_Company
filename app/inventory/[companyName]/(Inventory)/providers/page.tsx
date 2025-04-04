'use client'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { useState } from 'react'
import { ProviderModal } from '@/components/modal/providerModal'

interface Provider {
    id: number
    name: string
    product: string
    phone: number
    email: string
}

export default function ProvidersPage() {
    const [providers, setProviders] = useState<Provider[]>([
        {
            id: 1,
            name: "cocacola",
            product: "gaseosa",
            phone: 3145895621,
            email: "provedores@gmail.com"
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
        <div className='p-6 w-screen'>
            <h1 className="text-2xl font-bold mb-4">Providers</h1>
            <div className="w-full flex gap-4 mb-6">
              <Input
                  placeholder="Search Provider..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
              />
              <Button onClick={handleAddProvider}>Add Provider</Button>
            </div>
            <div className="w-full border-b border-black my-4"/>
            <div className='grid gap-4 md:grid-cols-2 lg:grid-cols-3'>
                {filteredProviders.map(provider => (
                    <Card key={provider.id} className='justify-items-center flex-col grid grid-cols-1'>
                        <CardHeader>
                            <CardTitle>{provider.name}</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className='max-w-relative h-32 bg-gray-200 rounded-md mb-4 p-4 flex items-center justify-center'>
                                <span className="text-gray-500">Logo del proveedor</span>
                            </div>
                            <div className="text-sm text-gray-600 space-y-1">
                                <div><strong>Producto:</strong> {provider.product}</div>
                                <div><strong>Teléfono:</strong> {provider.phone}</div>
                                <div><strong>Email:</strong> {provider.email}</div>
                            </div>
                            <div className="grid grid-cols-2 gap-2 mt-4">
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
                        </CardContent>
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