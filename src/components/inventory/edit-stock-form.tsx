"use client"

import type React from "react"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { useToast } from "@/components/ui/use-toast"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { AlertTriangle, Package, Save } from "lucide-react"

interface EditStockFormProps {
    agencyId: string
    product: any
    areas: any[]
    stocks: any[]
}

export default function EditStockForm({ agencyId, product, areas, stocks }: EditStockFormProps) {
    const router = useRouter()
    const { toast } = useToast()
    const [loading, setLoading] = useState(false)

    // Calcular stock total
    const totalStock = stocks.reduce((total, stock) => total + stock.quantity, 0)

    // Estado para los valores del formulario
    const [formData, setFormData] = useState({
        minStock: product.minStock || 0,
        maxStock: product.maxStock || 0,
        reorderPoint: product.reorderPoint || 0,
        idealStock: product.idealStock || 0,
    })

    // Calcular el porcentaje de stock actual
    const stockPercentage = formData.maxStock > 0 ? (totalStock / formData.maxStock) * 100 : 0

    // Determinar el estado del stock
    let stockStatus = "normal"
    if (stockPercentage <= 10) {
        stockStatus = "bajo"
    } else if (stockPercentage >= 75) {
        stockStatus = "alto"
    }

    const handleChange = (field: string, value: number) => {
        setFormData((prev) => ({
            ...prev,
            [field]: value,
        }))
    }

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        setLoading(true)

        try {
            // Validar que maxStock sea mayor que minStock
            if (formData.maxStock > 0 && formData.minStock > formData.maxStock) {
                toast({
                    title: "Error de validación",
                    description: "El stock mínimo no puede ser mayor que el stock máximo",
                    variant: "destructive",
                })
                setLoading(false)
                return
            }

            // Validar que reorderPoint esté entre minStock y maxStock
            if (
                formData.reorderPoint > 0 &&
                formData.maxStock > 0 &&
                (formData.reorderPoint < formData.minStock || formData.reorderPoint > formData.maxStock)
            ) {
                toast({
                    title: "Error de validación",
                    description: "El punto de reorden debe estar entre el stock mínimo y máximo",
                    variant: "destructive",
                })
                setLoading(false)
                return
            }

            // Aquí iría la lógica para actualizar los parámetros de stock del producto
            // Por ejemplo: await ProductService.updateStockSettings(agencyId, product.id, formData)

            // Simulamos una espera
            await new Promise((resolve) => setTimeout(resolve, 1000))

            toast({
                title: "Configuración actualizada",
                description: "Los parámetros de stock han sido actualizados correctamente",
            })

            // Redirigir a la página de detalles del producto
            router.push(`/agency/${agencyId}/(Inventory)?tab=product&productId=${product.id}`)
            router.refresh()
        } catch (error) {
            console.error("Error al actualizar configuración:", error)
            toast({
                title: "Error",
                description: "No se pudo actualizar la configuración. Inténtelo de nuevo.",
                variant: "destructive",
            })
        } finally {
            setLoading(false)
        }
    }

    return (
        <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-4">
                    <div className="space-y-2">
                        <Label htmlFor="minStock">Stock Mínimo</Label>
                        <Input
                            id="minStock"
                            type="number"
                            min="0"
                            value={formData.minStock}
                            onChange={(e) => handleChange("minStock", Number(e.target.value))}
                            placeholder="Cantidad mínima recomendada"
                        />
                        <p className="text-xs text-muted-foreground">
                            Nivel de stock por debajo del cual se considera stock bajo (10% o menos)
                        </p>
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="maxStock">Stock Máximo</Label>
                        <Input
                            id="maxStock"
                            type="number"
                            min="0"
                            value={formData.maxStock}
                            onChange={(e) => handleChange("maxStock", Number(e.target.value))}
                            placeholder="Capacidad máxima"
                        />
                        <p className="text-xs text-muted-foreground">
                            Capacidad máxima de almacenamiento para este producto (75% o más se considera stock alto)
                        </p>
                    </div>
                </div>

                <div className="space-y-4">
                    <div className="space-y-2">
                        <Label htmlFor="reorderPoint">Punto de Reorden</Label>
                        <Input
                            id="reorderPoint"
                            type="number"
                            min="0"
                            value={formData.reorderPoint}
                            onChange={(e) => handleChange("reorderPoint", Number(e.target.value))}
                            placeholder="Punto de reorden"
                        />
                        <p className="text-xs text-muted-foreground">Nivel de stock en el que se debe realizar un nuevo pedido</p>
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="idealStock">Stock Ideal</Label>
                        <Input
                            id="idealStock"
                            type="number"
                            min="0"
                            value={formData.idealStock}
                            onChange={(e) => handleChange("idealStock", Number(e.target.value))}
                            placeholder="Nivel ideal de stock"
                        />
                        <p className="text-xs text-muted-foreground">Nivel óptimo de stock para este producto</p>
                    </div>
                </div>
            </div>

            <Card className="mt-6">
                <CardContent className="p-6">
                    <h3 className="text-lg font-medium mb-4">Vista previa de niveles de stock</h3>

                    <div className="space-y-4">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm font-medium">Stock Actual</p>
                                <div className="flex items-center">
                                    <p className="text-2xl font-bold mr-2">{totalStock}</p>
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

                        {formData.maxStock > 0 && (
                            <div className="space-y-2">
                                <div className="w-full bg-muted rounded-full h-4 relative">
                                    {/* Barra de stock actual */}
                                    <div
                                        className={`h-4 rounded-full ${stockStatus === "bajo" ? "bg-red-500" : stockStatus === "alto" ? "bg-green-500" : "bg-blue-500"
                                            }`}
                                        style={{ width: `${Math.min(100, stockPercentage)}%` }}
                                    ></div>

                                    {/* Marcadores */}
                                    {formData.minStock > 0 && (
                                        <div
                                            className="absolute bottom-0 w-0.5 h-6 bg-red-500"
                                            style={{ left: `${(formData.minStock / formData.maxStock) * 100}%` }}
                                        ></div>
                                    )}
                                    {formData.reorderPoint > 0 && (
                                        <div
                                            className="absolute bottom-0 w-0.5 h-6 bg-amber-500"
                                            style={{ left: `${(formData.reorderPoint / formData.maxStock) * 100}%` }}
                                        ></div>
                                    )}
                                    {formData.idealStock > 0 && (
                                        <div
                                            className="absolute bottom-0 w-0.5 h-6 bg-green-500"
                                            style={{ left: `${(formData.idealStock / formData.maxStock) * 100}%` }}
                                        ></div>
                                    )}
                                </div>

                                <div className="flex justify-between text-xs text-muted-foreground">
                                    <span>0</span>
                                    <span className="text-red-500">Min: {formData.minStock}</span>
                                    {formData.reorderPoint > 0 && (
                                        <span className="text-amber-500">Reorden: {formData.reorderPoint}</span>
                                    )}
                                    {formData.idealStock > 0 && <span className="text-green-500">Ideal: {formData.idealStock}</span>}
                                    <span>Max: {formData.maxStock}</span>
                                </div>
                            </div>
                        )}

                        <div className="grid grid-cols-3 gap-2 mt-4">
                            <div className="flex items-center p-2 rounded-md bg-red-50 dark:bg-red-900/20">
                                <div className="w-3 h-3 rounded-full bg-red-500 mr-2"></div>
                                <span className="text-xs">Stock Bajo (≤10%)</span>
                            </div>
                            <div className="flex items-center p-2 rounded-md bg-blue-50 dark:bg-blue-900/20">
                                <div className="w-3 h-3 rounded-full bg-blue-500 mr-2"></div>
                                <span className="text-xs">Stock Normal</span>
                            </div>
                            <div className="flex items-center p-2 rounded-md bg-green-50 dark:bg-green-900/20">
                                <div className="w-3 h-3 rounded-full bg-green-500 mr-2"></div>
                                <span className="text-xs">Stock Alto (≥75%)</span>
                            </div>
                        </div>
                    </div>
                </CardContent>
            </Card>

            <div className="flex justify-end gap-2">
                <Button
                    type="button"
                    variant="outline"
                    onClick={() => router.push(`/agency/${agencyId}/(Inventory)?tab=product&productId=${product.id}`)}
                >
                    Cancelar
                </Button>
                <Button type="submit" disabled={loading}>
                    {loading ? (
                        "Guardando..."
                    ) : (
                        <>
                            <Save className="h-4 w-4 mr-2" />
                            Guardar Configuración
                        </>
                    )}
                </Button>
            </div>
        </form>
    )
}
