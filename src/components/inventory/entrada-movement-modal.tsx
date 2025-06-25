'use client'

import { useState, useEffect } from 'react'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { ArrowDownToLine, Package } from "lucide-react"
import MovementRegistration from "@/components/inventory/movement-registration"
import { Skeleton } from "@/components/ui/skeleton"

interface EntradaMovementModalProps {
    isOpen: boolean
    onClose: () => void
    agencyId: string
    productId?: string
}

export default function EntradaMovementModal({
    isOpen,
    onClose,
    agencyId,
    productId
}: EntradaMovementModalProps) {
    const [products, setProducts] = useState<any[]>([])
    const [areas, setAreas] = useState<any[]>([])
    const [isLoading, setIsLoading] = useState(true)

    useEffect(() => {
        const loadData = async () => {
            if (!isOpen) return

            setIsLoading(true)
            try {
                const [rawProducts, rawAreas] = await Promise.all([
                    ProductService.getProducts(agencyId),
                    AreaService.getAreas(agencyId)
                ])

                // Convertir valores Decimal a números normales
                const processedProducts = rawProducts.map(product => ({
                    ...product,
                    price: product.price ? Number(product.price) : 0,
                    cost: product.cost ? Number(product.cost) : 0,
                    discount: product.discount ? Number(product.discount) : 0,
                    taxRate: product.taxRate ? Number(product.taxRate) : 0,
                    discountMinimumPrice: product.discountMinimumPrice ? Number(product.discountMinimumPrice) : null,
                    minStock: product.minStock ? Number(product.minStock) : undefined,
                    stocks: product.Stocks ? product.Stocks.map((stock: any) => ({
                        ...stock,
                        quantity: stock.quantity ? Number(stock.quantity) : 0
                    })) : []
                }))

                setProducts(processedProducts)
                setAreas(rawAreas)
            } catch (error) {
                console.error("Error al cargar datos:", error)
            } finally {
                setIsLoading(false)
            }
        }

        loadData()
    }, [isOpen, agencyId])

    return (
        <Dialog open={isOpen} onOpenChange={onClose}>
            <DialogContent className="max-w-4xl">
                <DialogHeader>
                    <DialogTitle className="text-2xl font-bold">Entrada de Inventario</DialogTitle>
                </DialogHeader>

                <div className="space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <Card className="bg-white dark:bg-gray-950 shadow-sm">
                            <CardHeader className="pb-2">
                                <div className="flex items-center gap-2">
                                    <div className="p-2 rounded-full bg-green-100 dark:bg-green-900/30">
                                        <ArrowDownToLine className="h-5 w-5 text-green-600 dark:text-green-400" />
                                    </div>
                                    <CardTitle className="text-lg">Entrada de Productos</CardTitle>
                                </div>
                            </CardHeader>
                            <CardContent>
                                <p className="text-sm text-muted-foreground">
                                    Registra la entrada de productos a tu inventario. Puedes añadir nuevos productos o aumentar el stock.
                                </p>
                            </CardContent>
                        </Card>

                        <Card className="bg-white dark:bg-gray-950 shadow-sm">
                            <CardHeader className="pb-2">
                                <CardTitle className="text-sm font-medium">Total Productos</CardTitle>
                            </CardHeader>
                            <CardContent>
                                <div className="flex items-center justify-between">
                                    <div className="text-2xl font-bold">{products.length}</div>
                                    <div className="h-10 w-10 rounded-full bg-blue-100 dark:bg-blue-900 flex items-center justify-center">
                                        <Package className="h-5 w-5 text-blue-600 dark:text-blue-400" />
                                    </div>
                                </div>
                                <p className="text-xs text-muted-foreground mt-2">Productos disponibles</p>
                            </CardContent>
                        </Card>

                        <Card className="bg-white dark:bg-gray-950 shadow-sm">
                            <CardHeader className="pb-2">
                                <CardTitle className="text-sm font-medium">Áreas de Almacenamiento</CardTitle>
                            </CardHeader>
                            <CardContent>
                                <div className="flex items-center justify-between">
                                    <div className="text-2xl font-bold">{areas.length}</div>
                                    <div className="h-10 w-10 rounded-full bg-purple-100 dark:bg-purple-900 flex items-center justify-center">
                                        <Package className="h-5 w-5 text-purple-600 dark:text-purple-400" />
                                    </div>
                                </div>
                                <p className="text-xs text-muted-foreground mt-2">Áreas disponibles</p>
                            </CardContent>
                        </Card>
                    </div>

                    {isLoading ? (
                        <MovementRegistrationSkeleton />
                    ) : (
                        <MovementRegistration
                            agencyId={agencyId}
                            type="entrada"
                            productId={productId}
                            products={products}
                            areas={areas}
                            onComplete={onClose}
                        />
                    )}
                </div>
            </DialogContent>
        </Dialog>
    )
}

const MovementRegistrationSkeleton = () => (
    <div className="space-y-4">
        <Skeleton className="h-8 w-48" />
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-4">
                <Skeleton className="h-10 w-full" />
                <Skeleton className="h-10 w-full" />
                <Skeleton className="h-10 w-full" />
            </div>
            <div className="space-y-4">
                <Skeleton className="h-10 w-full" />
                <Skeleton className="h-10 w-full" />
                <Skeleton className="h-10 w-full" />
            </div>
        </div>
        <div className="flex justify-end">
            <Skeleton className="h-10 w-32" />
        </div>
    </div>
)
