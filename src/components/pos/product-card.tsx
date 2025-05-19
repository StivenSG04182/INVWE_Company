"use client"

import { useState, useEffect } from "react"
import Image from "next/image"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Plus, AlertTriangle, Clock, Tag, Check } from "lucide-react"
import { POSService } from "@/lib/services/pos-service"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"

interface ProductCardProps {
    product: any
    onAddToCart: (product: any, quantity: number) => void
    isSelected?: boolean
}

export default function ProductCard({ product, onAddToCart, isSelected = false }: ProductCardProps) {
    const [priceInfo, setPriceInfo] = useState({
        originalPrice: Number.parseFloat(product.price),
        discountedPrice: Number.parseFloat(product.price),
        discount: 0,
        hasActiveDiscount: false,
    })

    const [isExpiring, setIsExpiring] = useState(false)
    const [stockStatus, setStockStatus] = useState<"normal" | "low" | "out">("normal")
    const [isLoading, setIsLoading] = useState(false)

    useEffect(() => {
        // Obtener precio con descuento
        const fetchPriceInfo = async () => {
            try {
                setIsLoading(true)
                const info = await POSService.getProductPriceWithDiscount(product.id)
                setPriceInfo(info)
            } catch (error) {
                console.error("Error al obtener precio con descuento:", error)
            } finally {
                setIsLoading(false)
            }
        }

        // Verificar si el producto está por vencer
        const checkExpirationDate = () => {
            if (product.expirationDate) {
                const expirationDate = new Date(product.expirationDate)
                const today = new Date()
                const thirtyDaysFromNow = new Date()
                thirtyDaysFromNow.setDate(today.getDate() + 30)

                setIsExpiring(expirationDate > today && expirationDate <= thirtyDaysFromNow)
            }
        }

        // Verificar estado del stock
        const checkStockStatus = () => {
            const totalStock = product.stock || 0
            const minStock = product.minStock || 0

            if (totalStock <= 0) {
                setStockStatus("out")
            } else if (minStock > 0 && totalStock <= minStock) {
                setStockStatus("low")
            } else {
                setStockStatus("normal")
            }
        }

        fetchPriceInfo()
        checkExpirationDate()
        checkStockStatus()
    }, [product])

    const handleAddToCart = () => {
        onAddToCart(
            {
                ...product,
                price: priceInfo.discountedPrice,
                originalPrice: priceInfo.originalPrice,
                discount: priceInfo.discount,
            },
            1,
        )
    }

    // Formatear fecha de vencimiento
    const formatExpirationDate = (dateString) => {
        if (!dateString) return ""
        const date = new Date(dateString)
        return date.toLocaleDateString()
    }

    return (
        <Card
            className={`overflow-hidden h-full flex flex-col transition-all duration-200 ${isSelected ? "ring-2 ring-primary" : ""}`}
        >
            <div className="relative aspect-square">
                {product.images && product.images.length > 0 ? (
                    <Image src={product.images[0] || "/placeholder.svg"} alt={product.name} fill className="object-cover" />
                ) : (
                    <div className="w-full h-full flex items-center justify-center bg-muted">
                        <span className="text-muted-foreground">Sin imagen</span>
                    </div>
                )}

                {/* Badges para descuentos y alertas */}
                <div className="absolute top-2 left-2 flex flex-col gap-1">
                    {priceInfo.hasActiveDiscount && (
                        <Badge className="bg-green-600 hover:bg-green-700">-{priceInfo.discount}%</Badge>
                    )}

                    {isExpiring && (
                        <TooltipProvider>
                            <Tooltip>
                                <TooltipTrigger asChild>
                                    <Badge variant="outline" className="bg-amber-100 text-amber-800 border-amber-300">
                                        <Clock className="h-3 w-3 mr-1" />
                                        Por vencer
                                    </Badge>
                                </TooltipTrigger>
                                <TooltipContent>
                                    <p>Vence el {formatExpirationDate(product.expirationDate)}</p>
                                </TooltipContent>
                            </Tooltip>
                        </TooltipProvider>
                    )}

                    {stockStatus === "low" && (
                        <TooltipProvider>
                            <Tooltip>
                                <TooltipTrigger asChild>
                                    <Badge variant="outline" className="bg-red-100 text-red-800 border-red-300">
                                        <AlertTriangle className="h-3 w-3 mr-1" />
                                        Stock bajo
                                    </Badge>
                                </TooltipTrigger>
                                <TooltipContent>
                                    <p>
                                        Quedan {product.stock} unidades (mínimo: {product.minStock})
                                    </p>
                                </TooltipContent>
                            </Tooltip>
                        </TooltipProvider>
                    )}

                    {stockStatus === "out" && <Badge variant="destructive">Agotado</Badge>}
                </div>

                {/* Badge para producto seleccionado */}
                {isSelected && (
                    <div className="absolute top-2 right-2">
                        <Badge className="bg-primary">
                            <Check className="h-3 w-3 mr-1" />
                            Seleccionado
                        </Badge>
                    </div>
                )}
            </div>

            <CardContent className="p-4 flex-1 flex flex-col">
                <div className="mb-1">
                    <h3 className="font-medium line-clamp-2">{product.name}</h3>
                    {product.sku && <p className="text-xs text-muted-foreground">SKU: {product.sku}</p>}
                </div>

                {product.categoryName && (
                    <Badge variant="outline" className="w-fit mb-2">
                        <Tag className="h-3 w-3 mr-1" />
                        {product.categoryName}
                    </Badge>
                )}

                <div className="mt-auto pt-2">
                    <div className="flex items-center justify-between">
                        <div>
                            {priceInfo.hasActiveDiscount ? (
                                <div className="flex flex-col">
                                    <span className="text-lg font-bold">${priceInfo.discountedPrice.toFixed(2)}</span>
                                    <span className="text-sm text-muted-foreground line-through">
                                        ${priceInfo.originalPrice.toFixed(2)}
                                    </span>
                                </div>
                            ) : (
                                <span className="text-lg font-bold">${priceInfo.originalPrice.toFixed(2)}</span>
                            )}
                        </div>

                        <div className="flex flex-col items-end">
                            <Button
                                size="sm"
                                onClick={handleAddToCart}
                                disabled={stockStatus === "out" || isLoading}
                                className={isSelected ? "bg-green-600 hover:bg-green-700" : ""}
                            >
                                {isLoading ? (
                                    <span className="animate-pulse">Cargando...</span>
                                ) : isSelected ? (
                                    <>
                                        <Check className="h-4 w-4 mr-1" />
                                        Añadido
                                    </>
                                ) : (
                                    <>
                                        <Plus className="h-4 w-4 mr-1" />
                                        Agregar
                                    </>
                                )}
                            </Button>
                            <span className="text-xs text-muted-foreground mt-1">Stock: {product.stock}</span>
                        </div>
                    </div>
                </div>
            </CardContent>
        </Card>
    )
}
