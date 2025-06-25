'use client'

import { useState, useEffect } from 'react'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { ArrowUpFromLine, Package, AlertTriangle } from "lucide-react"
import { ProductService, AreaService } from "@/lib/services/inventory-service"
import MovementRegistration from "@/components/inventory/movement-registration"
import { Skeleton } from "@/components/ui/skeleton"

interface SalidaMovementModalProps {
    isOpen: boolean
    onClose: () => void
    agencyId: string
    productId?: string
}

export default function SalidaMovementModal({
    isOpen,
    onClose,
    agencyId,
    productId
}: SalidaMovementModalProps) {
    const [products, setProducts] = useState<any[]>([])
    const [areas, setAreas] = useState<any[]>([])
    const [lowStockItems, setLowStockItems] = useState(0)
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

                // Procesar productos y calcular items con bajo stock
                let lowStock = 0
                const processedProducts = rawProducts.map(product => {
                    const totalStock = (product.Stocks || []).reduce((sum: number, stock: any) =>
                        sum + (Number(stock.quantity) || 0), 0)
                    if (product.minStock && totalStock <= Number(product.minStock)) {
                        lowStock++
                    }
                    return {
                        ...product,
                        price: Number(product.price) || 0,
                        cost: Number(product.cost) || 0,
                        discount: Number(product.discount) || 0,
                        taxRate: Number(product.taxRate) || 0,
                        stocks: (product.Stocks || []).map((stock: any) => ({
                            ...stock,
                            quantity: Number(stock.quantity) || 0
                        }))
                    }
                })

                setProducts(processedProducts)
                setAreas(rawAreas)
                setLowStockItems(lowStock)
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
                    <DialogTitle className="text-2xl font-bold">Salida de Inventario</DialogTitle>
                </DialogHeader>

                <div className="space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <Card className="bg-white dark:bg-gray-950 shadow-sm">
                            <CardHeader className="pb-2">
                                <div className="flex items-center gap-2">
                                    <div className="p-2 rounded-full bg-red-100 dark:bg-red-900/30">
                                        <ArrowUpFromLine className="h-5 w-5 text-red-600 dark:text-red-400" />
                                    </div>
                                    <CardTitle className="text-lg">Salida de Productos</CardTitle>
                                </div>
                            </CardHeader>
                            <CardContent>
                                <p className="text-sm text-muted-foreground">
                                    Registra la salida de productos de tu inventario. Ventas, consumos o pérdidas.
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
                                <CardTitle className="text-sm font-medium">Productos Bajo Mínimo</CardTitle>
                            </CardHeader>
                            <CardContent>
                                <div className="flex items-center justify-between">
                                    <div className="text-2xl font-bold">{lowStockItems}</div>
                                    <div className="h-10 w-10 rounded-full bg-red-100 dark:bg-red-900 flex items-center justify-center">
                                        <AlertTriangle className="h-5 w-5 text-red-600 dark:text-red-400" />
                                    </div>
                                </div>
                                <p className="text-xs text-muted-foreground mt-2">Productos que requieren reposición</p>
                            </CardContent>
                        </Card>
                    </div>

                    {isLoading ? (
                        <MovementRegistrationSkeleton />
                    ) : (
                        <MovementRegistration
                            agencyId={agencyId}
                            type="salida"
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
