"use client"

import { useState, useEffect } from "react"
import { Badge } from "@/components/ui/badge"
import { Tag, Clock } from "lucide-react"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"

interface DiscountBadgeProps {
    discount: number
    startDate?: Date | string
    endDate?: Date | string
    minimumPrice?: number
    originalPrice: number
    discountedPrice: number
}

export default function DiscountBadge({
    discount,
    startDate,
    endDate,
    minimumPrice,
    originalPrice,
    discountedPrice,
}: DiscountBadgeProps) {
    const [timeLeft, setTimeLeft] = useState<string | null>(null)
    const [isActive, setIsActive] = useState(false)

    useEffect(() => {
        // Verificar si el descuento está activo
        const checkDiscountStatus = () => {
            const now = new Date()
            const start = startDate ? new Date(startDate) : null
            const end = endDate ? new Date(endDate) : null

            const isStarted = !start || start <= now
            const isNotEnded = !end || end >= now

            setIsActive(isStarted && isNotEnded)

            // Calcular tiempo restante si hay fecha de fin
            if (end && end >= now) {
                const diffMs = end.getTime() - now.getTime()
                const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24))
                const diffHours = Math.floor((diffMs % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60))

                if (diffDays > 0) {
                    setTimeLeft(`${diffDays}d ${diffHours}h`)
                } else {
                    setTimeLeft(`${diffHours}h`)
                }
            } else {
                setTimeLeft(null)
            }
        }

        checkDiscountStatus()

        // Actualizar cada hora
        const interval = setInterval(checkDiscountStatus, 1000 * 60 * 60)

        return () => clearInterval(interval)
    }, [startDate, endDate])

    if (!isActive || discount <= 0) return null

    return (
        <TooltipProvider>
            <Tooltip>
                <TooltipTrigger asChild>
                    <Badge className="bg-green-600 hover:bg-green-700 flex items-center gap-1">
                        <Tag className="h-3 w-3" />
                        {discount}% OFF
                        {timeLeft && (
                            <span className="ml-1 flex items-center">
                                <Clock className="h-3 w-3 mr-1" />
                                {timeLeft}
                            </span>
                        )}
                    </Badge>
                </TooltipTrigger>
                <TooltipContent>
                    <div className="space-y-1">
                        <p className="font-medium">Descuento del {discount}%</p>
                        <p className="text-sm">
                            Precio original: ${originalPrice.toFixed(2)} → Precio con descuento: ${discountedPrice.toFixed(2)}
                        </p>
                        {minimumPrice && <p className="text-xs text-muted-foreground">Precio mínimo: ${minimumPrice.toFixed(2)}</p>}
                        {endDate && (
                            <p className="text-xs text-muted-foreground">Finaliza: {new Date(endDate).toLocaleDateString()}</p>
                        )}
                    </div>
                </TooltipContent>
            </Tooltip>
        </TooltipProvider>
    )
}
