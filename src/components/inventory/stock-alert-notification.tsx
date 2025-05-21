"use client"

import { useEffect, useState } from "react"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { AlertTriangle, X } from "lucide-react"
import { Button } from "@/components/ui/button"
import Link from "next/link"

interface StockAlertNotificationProps {
    products: any[]
    threshold?: number
    minUnits?: number
}

export default function StockAlertNotification({
    products,
    threshold = 10,
    minUnits = 5,
}: StockAlertNotificationProps) {
    const [showAlert, setShowAlert] = useState(false)
    const [lowStockProducts, setLowStockProducts] = useState<any[]>([])

    useEffect(() => {
        // Identificar productos con stock bajo
        const productsWithLowStock = products.filter((product) => {
            const totalStock = product.quantity || 0
            const minStock = product.minStock || 0

            // Considerar bajo stock si está por debajo del umbral porcentual o unidades mínimas
            if (minStock > 0) {
                const percentage = (totalStock / minStock) * 100
                return percentage <= threshold || totalStock <= minUnits
            }

            return false
        })

        setLowStockProducts(productsWithLowStock)
        setShowAlert(productsWithLowStock.length > 0)
    }, [products, threshold, minUnits])

    if (!showAlert) return null

    return (
        <Alert variant="destructive" className="mb-6">
            <AlertTriangle className="h-4 w-4" />
            <div className="flex-1">
                <AlertTitle>Alerta de Stock Bajo</AlertTitle>
                <AlertDescription>
                    {lowStockProducts.length === 1 ? (
                        <>
                            El producto <strong>{lowStockProducts[0].name}</strong> está por debajo del stock mínimo.
                        </>
                    ) : (
                        <>
                            Hay <strong>{lowStockProducts.length}</strong> productos por debajo del stock mínimo.
                        </>
                    )}
                </AlertDescription>
            </div>
            <div className="flex items-center gap-2">
                <Button variant="outline" size="sm" asChild className="h-8 border-white/20 hover:bg-white/10 hover:text-white">
                    <Link href={`?filter=low-stock`}>Ver productos</Link>
                </Button>
                <Button
                    variant="ghost"
                    size="icon"
                    className="h-8 w-8 text-white hover:bg-white/10 hover:text-white"
                    onClick={() => setShowAlert(false)}
                >
                    <X className="h-4 w-4" />
                    <span className="sr-only">Cerrar</span>
                </Button>
            </div>
        </Alert>
    )
}
