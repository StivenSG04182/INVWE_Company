import type React from "react"
import { Card, CardContent } from "@/components/ui/card"
import { AlertTriangle, Package } from "lucide-react"
import { Badge } from "@/components/ui/badge"

// Definir tipos localmente para evitar problemas de importación
interface Product {
    id?: string
    name: string
    price?: number
    minStock?: number | null
    maxStock?: number | null
}

interface Stock {
    id?: string
    quantity?: number
    productId?: string
}

interface ProductStockDetailsProps {
    product: Product
    stocks: Stock[]
}

const ProductStockDetails: React.FC<ProductStockDetailsProps> = ({ product, stocks }) => {
    // Calcular stock total y estado del stock
    const totalStock = stocks.reduce((total, stock) => total + (stock.quantity || 0), 0)

    // Nueva lógica para determinar el estado del stock
    let stockStatus = "normal"
    let stockPercentage = 0

    // Si el producto tiene maxStock definido, calculamos el porcentaje
    if (product.maxStock && product.maxStock > 0) {
        stockPercentage = (totalStock / product.maxStock) * 100

        if (stockPercentage <= 10) {
            stockStatus = "bajo"
        } else if (stockPercentage >= 75) {
            stockStatus = "alto"
        } else {
            stockStatus = "normal"
        }
    } else if (product.minStock && product.minStock > 0) {
        // Si no hay maxStock pero hay minStock, usamos la lógica anterior como fallback
        stockStatus = totalStock <= product.minStock ? "bajo" : "normal"
        // Estimamos un porcentaje basado en minStock (asumiendo que minStock es aproximadamente el 20% de la capacidad)
        stockPercentage = (totalStock / (product.minStock * 5)) * 100
    }

    // Calcular valor total del inventario para este producto
    const totalValue = (product.price || 0) * totalStock

    return (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            <Card>
                <CardContent className="p-6">
                    <p className="text-sm font-medium text-muted-foreground">Precio</p>
                    <p className="text-2xl font-bold">${(product.price || 0).toFixed(2)}</p>
                </CardContent>
            </Card>

            <Card>
                <CardContent className="p-6">
                    <p className="text-sm font-medium text-muted-foreground">Stock Total</p>
                    <p className="text-2xl font-bold">{totalStock}</p>
                </CardContent>
            </Card>

            <Card>
                <CardContent className="p-6">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-sm font-medium text-muted-foreground">Estado del Stock</p>
                            <div className="flex items-center">
                                <p className="text-2xl font-bold mr-2">
                                    {stockStatus === "bajo" ? "Bajo" : stockStatus === "alto" ? "Alto" : "Normal"}
                                </p>
                                <Badge
                                    variant={stockStatus === "bajo" ? "destructive" : stockStatus === "alto" ? "default" : "secondary"}
                                >
                                    {Math.round(stockPercentage)}%
                                </Badge>
                            </div>
                        </div>
                        <div
                            className={`h-12 w-12 rounded-full flex items-center justify-center ${stockStatus === "bajo"
                                    ? "bg-red-100 dark:bg-red-900"
                                    : stockStatus === "alto"
                                        ? "bg-green-100 dark:bg-green-900"
                                        : "bg-blue-100 dark:bg-blue-900"
                                }`}
                        >
                            {stockStatus === "bajo" ? (
                                <AlertTriangle className="h-6 w-6 text-red-500 dark:text-red-400" />
                            ) : stockStatus === "alto" ? (
                                <Package className="h-6 w-6 text-green-500 dark:text-green-400" />
                            ) : (
                                <Package className="h-6 w-6 text-blue-500 dark:text-blue-400" />
                            )}
                        </div>
                    </div>
                </CardContent>
            </Card>

            <Card className="col-span-1 md:col-span-2 lg:col-span-3">
                <CardContent className="p-6">
                    <p className="text-sm font-medium text-muted-foreground">Progreso del Stock</p>
                    {product.maxStock && product.maxStock > 0 ? (
                        <div className="mt-2">
                            <div className="w-full bg-muted rounded-full h-2">
                                <div
                                    className={`h-2 rounded-full ${stockStatus === "bajo" ? "bg-destructive" : stockStatus === "alto" ? "bg-green-500" : "bg-blue-500"
                                        }`}
                                    style={{ width: `${Math.min(100, stockPercentage)}%` }}
                                ></div>
                            </div>
                            <div className="flex justify-between text-xs text-muted-foreground mt-1">
                                <span>0</span>
                                <span>{Math.round(product.maxStock * 0.5)}</span>
                                <span>{product.maxStock}</span>
                            </div>
                        </div>
                    ) : (
                        product.minStock && product.minStock > 0 && (
                            <div className="mt-2">
                                <div className="w-full bg-muted rounded-full h-2">
                                    <div
                                        className={`h-2 rounded-full ${stockStatus === "bajo"
                                                ? "bg-destructive"
                                                : stockStatus === "alto"
                                                    ? "bg-green-500"
                                                    : "bg-blue-500"
                                            }`}
                                        style={{ width: `${Math.min(100, (totalStock / (product.minStock * 5)) * 100)}%` }}
                                    ></div>
                                </div>
                                <div className="flex justify-between text-xs text-muted-foreground mt-1">
                                    <span>0</span>
                                    <span>{product.minStock}</span>
                                    <span>{product.minStock * 5}</span>
                                </div>
                            </div>
                        )
                    )}
                </CardContent>
            </Card>

            <Card>
                <CardContent className="p-6">
                    <p className="text-sm font-medium text-muted-foreground">Valor Total del Inventario</p>
                    <p className="text-2xl font-bold">${totalValue.toFixed(2)}</p>
                </CardContent>
            </Card>
        </div>
    )
}

export default ProductStockDetails
