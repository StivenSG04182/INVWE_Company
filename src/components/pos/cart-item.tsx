"use client"

import type React from "react"

import { useState, useEffect } from "react"
import Image from "next/image"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Minus, Plus, Trash2, AlertTriangle } from "lucide-react"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"
import { Badge } from "@/components/ui/badge"

interface CartItemProps {
    item: {
        id: string
        productId: string
        name: string
        price: number
        originalPrice: number
        quantity: number
        discount?: number
        image?: string
        stock?: number
        minStock?: number
    }
    onUpdateQuantity: (id: string, quantity: number) => void
    onRemove: (id: string) => void
}

export default function CartItem({ item, onUpdateQuantity, onRemove }: CartItemProps) {
    const [quantity, setQuantity] = useState(item.quantity)
    const [isLowStock, setIsLowStock] = useState(false)
    const [isNearMaxStock, setIsNearMaxStock] = useState(false)

    useEffect(() => {
        // Verificar si el stock está bajo
        if (item.minStock && item.stock) {
            setIsLowStock(item.stock <= item.minStock)
        }

        // Verificar si la cantidad está cerca del stock máximo disponible
        if (item.stock) {
            setIsNearMaxStock(quantity >= item.stock * 0.8)
        }
    }, [item, quantity])

    const handleQuantityChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const newQuantity = Number.parseInt(e.target.value)
        if (!isNaN(newQuantity) && newQuantity > 0) {
            // Verificar que no exceda el stock disponible
            if (item.stock && newQuantity > item.stock) {
                setQuantity(item.stock)
                onUpdateQuantity(item.id, item.stock)
                return
            }

            setQuantity(newQuantity)
            onUpdateQuantity(item.id, newQuantity)
        }
    }

    const incrementQuantity = () => {
        // Verificar que no exceda el stock disponible
        if (item.stock && quantity >= item.stock) {
            return
        }

        const newQuantity = quantity + 1
        setQuantity(newQuantity)
        onUpdateQuantity(item.id, newQuantity)
    }

    const decrementQuantity = () => {
        if (quantity > 1) {
            const newQuantity = quantity - 1
            setQuantity(newQuantity)
            onUpdateQuantity(item.id, newQuantity)
        }
    }

    const handleRemove = () => {
        onRemove(item.id)
    }

    const subtotal = item.price * quantity
    const hasDiscount = item.originalPrice > item.price
    const stockWarning = item.stock && quantity > item.stock * 0.7

    return (
        <div className="flex items-center py-3 border-b">
            <div className="w-16 h-16 relative flex-shrink-0 mr-3">
                {item.image ? (
                    <Image src={item.image || "/placeholder.svg"} alt={item.name} fill className="object-cover rounded-md" />
                ) : (
                    <div className="w-full h-full bg-muted rounded-md flex items-center justify-center">
                        <span className="text-xs text-muted-foreground">Sin imagen</span>
                    </div>
                )}
            </div>

            <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between">
                    <h4 className="font-medium text-sm line-clamp-1">{item.name}</h4>

                    {hasDiscount && <Badge className="bg-green-600 text-xs">-{item.discount}%</Badge>}
                </div>

                <div className="flex items-center mt-1">
                    {hasDiscount ? (
                        <div className="flex flex-col">
                            <span className="text-sm font-medium">${item.price.toFixed(2)}</span>
                            <span className="text-xs text-muted-foreground line-through">${item.originalPrice.toFixed(2)}</span>
                        </div>
                    ) : (
                        <span className="text-sm font-medium">${item.price.toFixed(2)}</span>
                    )}

                    <div className="flex items-center ml-auto">
                        <Button variant="outline" size="icon" className="h-7 w-7" onClick={decrementQuantity}>
                            <Minus className="h-3 w-3" />
                        </Button>

                        <div className="relative">
                            <Input
                                type="number"
                                value={quantity}
                                onChange={handleQuantityChange}
                                className={`h-7 w-12 text-center mx-1 ${isNearMaxStock ? "border-amber-500" : ""}`}
                                min="1"
                                max={item.stock}
                            />

                            {stockWarning && (
                                <TooltipProvider>
                                    <Tooltip>
                                        <TooltipTrigger asChild>
                                            <div className="absolute -right-2 -top-2">
                                                <AlertTriangle className="h-3 w-3 text-amber-500" />
                                            </div>
                                        </TooltipTrigger>
                                        <TooltipContent>
                                            <p>Quedan {item.stock - quantity} unidades disponibles</p>
                                        </TooltipContent>
                                    </Tooltip>
                                </TooltipProvider>
                            )}
                        </div>

                        <Button
                            variant="outline"
                            size="icon"
                            className="h-7 w-7"
                            onClick={incrementQuantity}
                            disabled={item.stock && quantity >= item.stock}
                        >
                            <Plus className="h-3 w-3" />
                        </Button>
                    </div>
                </div>

                <div className="flex items-center justify-between mt-1">
                    <span className="text-xs text-muted-foreground">Subtotal: ${subtotal.toFixed(2)}</span>

                    <div className="flex items-center">
                        {item.stock && <span className="text-xs mr-2 text-muted-foreground">Stock: {item.stock}</span>}
                        <Button
                            variant="ghost"
                            size="icon"
                            className="h-6 w-6 text-destructive hover:text-destructive hover:bg-destructive/10"
                            onClick={handleRemove}
                        >
                            <Trash2 className="h-3 w-3" />
                        </Button>
                    </div>
                </div>
            </div>
        </div>
    )
}
