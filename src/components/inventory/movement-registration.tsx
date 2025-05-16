"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { useToast } from "@/components/ui/use-toast"
import { ArrowLeft, ArrowDownToLine, ArrowUpFromLine, ArrowLeftRight, Save, Package } from "lucide-react"

interface MovementRegistrationProps {
    agencyId: string
    type?: "entrada" | "salida" | "transferencia"
    productId?: string
    products: any[]
    areas: any[]
}

export default function MovementRegistration({
    agencyId,
    type = "entrada",
    productId,
    products,
    areas,
}: MovementRegistrationProps) {
    const router = useRouter()
    const { toast } = useToast()

    const [formData, setFormData] = useState({
        type: type,
        productId: productId || "",
        areaId: "",
        destinationAreaId: "",
        quantity: 1,
        notes: "",
        date: new Date().toISOString().split("T")[0],
    })

    const [loading, setLoading] = useState(false)

    // Actualizar el tipo de movimiento cuando cambia el prop
    useEffect(() => {
        setFormData((prev) => ({ ...prev, type }))
    }, [type])

    // Actualizar el producto cuando cambia el prop
    useEffect(() => {
        if (productId) {
            setFormData((prev) => ({ ...prev, productId }))
        }
    }, [productId])

    const handleChange = (field: string, value: any) => {
        setFormData((prev) => ({ ...prev, [field]: value }))
    }

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()

        if (!formData.productId) {
            toast({
                title: "Error",
                description: "Debe seleccionar un producto",
                variant: "destructive",
            })
            return
        }

        if (!formData.areaId) {
            toast({
                title: "Error",
                description: "Debe seleccionar un área",
                variant: "destructive",
            })
            return
        }

        if (formData.type === "transferencia" && !formData.destinationAreaId) {
            toast({
                title: "Error",
                description: "Debe seleccionar un área de destino",
                variant: "destructive",
            })
            return
        }

        if (formData.quantity <= 0) {
            toast({
                title: "Error",
                description: "La cantidad debe ser mayor a cero",
                variant: "destructive",
            })
            return
        }

        setLoading(true)

        try {
            // Aquí iría la lógica para guardar el movimiento
            // Por ejemplo: await MovementService.createMovement(agencyId, formData)

            // Simulamos una espera
            await new Promise((resolve) => setTimeout(resolve, 1000))

            toast({
                title: "Movimiento registrado",
                description: `Se ha registrado correctamente la ${formData.type} de ${formData.quantity} unidades.`,
            })

            // Redirigir a la página de inventario
            router.push(`/agency/${agencyId}/(Inventory)?tab=overview`)
        } catch (error) {
            console.error("Error al registrar movimiento:", error)
            toast({
                title: "Error",
                description: "No se pudo registrar el movimiento. Inténtelo de nuevo.",
                variant: "destructive",
            })
        } finally {
            setLoading(false)
        }
    }

    // Obtener el título y el icono según el tipo de movimiento
    const getMovementInfo = () => {
        switch (formData.type) {
            case "entrada":
                return {
                    title: "Registrar Entrada de Inventario",
                    description: "Añadir productos al inventario",
                    icon: <ArrowDownToLine className="h-5 w-5 text-green-500" />,
                    color: "text-green-500",
                }
            case "salida":
                return {
                    title: "Registrar Salida de Inventario",
                    description: "Retirar productos del inventario",
                    icon: <ArrowUpFromLine className="h-5 w-5 text-red-500" />,
                    color: "text-red-500",
                }
            case "transferencia":
                return {
                    title: "Registrar Transferencia de Inventario",
                    description: "Mover productos entre áreas",
                    icon: <ArrowLeftRight className="h-5 w-5 text-blue-500" />,
                    color: "text-blue-500",
                }
            default:
                return {
                    title: "Registrar Movimiento de Inventario",
                    description: "Gestionar el inventario",
                    icon: <Package className="h-5 w-5" />,
                    color: "text-primary",
                }
        }
    }

    const movementInfo = getMovementInfo()

    return (
        <div className="space-y-6">
            <div className="flex items-center gap-2">
                <Button variant="ghost" size="sm" asChild>
                    <Link href={`/agency/${agencyId}/(Inventory)?tab=overview`}>
                        <ArrowLeft className="h-4 w-4 mr-2" />
                        Volver al inventario
                    </Link>
                </Button>
            </div>

            <Card>
                <CardHeader>
                    <div className="flex items-center gap-2">
                        <div className={`p-2 rounded-full bg-muted ${movementInfo.color}`}>{movementInfo.icon}</div>
                        <div>
                            <CardTitle>{movementInfo.title}</CardTitle>
                            <CardDescription>{movementInfo.description}</CardDescription>
                        </div>
                    </div>
                </CardHeader>
                <CardContent>
                    <form onSubmit={handleSubmit} className="space-y-6">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div className="space-y-4">
                                <div className="space-y-2">
                                    <Label htmlFor="type">Tipo de Movimiento</Label>
                                    <Select value={formData.type} onValueChange={(value) => handleChange("type", value)}>
                                        <SelectTrigger id="type">
                                            <SelectValue placeholder="Seleccione un tipo" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="entrada">Entrada</SelectItem>
                                            <SelectItem value="salida">Salida</SelectItem>
                                            <SelectItem value="transferencia">Transferencia</SelectItem>
                                        </SelectContent>
                                    </Select>
                                </div>

                                <div className="space-y-2">
                                    <Label htmlFor="productId">Producto</Label>
                                    <Select value={formData.productId} onValueChange={(value) => handleChange("productId", value)}>
                                        <SelectTrigger id="productId">
                                            <SelectValue placeholder="Seleccione un producto" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            {products.map((product) => (
                                                <SelectItem key={product._id.toString()} value={product._id.toString()}>
                                                    {product.name} {product.sku ? `(${product.sku})` : ""}
                                                </SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                </div>

                                <div className="space-y-2">
                                    <Label htmlFor="areaId">{formData.type === "transferencia" ? "Área de Origen" : "Área"}</Label>
                                    <Select value={formData.areaId} onValueChange={(value) => handleChange("areaId", value)}>
                                        <SelectTrigger id="areaId">
                                            <SelectValue placeholder="Seleccione un área" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            {areas.map((area) => (
                                                <SelectItem key={area._id.toString()} value={area._id.toString()}>
                                                    {area.name}
                                                </SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                </div>

                                {formData.type === "transferencia" && (
                                    <div className="space-y-2">
                                        <Label htmlFor="destinationAreaId">Área de Destino</Label>
                                        <Select
                                            value={formData.destinationAreaId}
                                            onValueChange={(value) => handleChange("destinationAreaId", value)}
                                        >
                                            <SelectTrigger id="destinationAreaId">
                                                <SelectValue placeholder="Seleccione un área de destino" />
                                            </SelectTrigger>
                                            <SelectContent>
                                                {areas
                                                    .filter((area) => area._id.toString() !== formData.areaId)
                                                    .map((area) => (
                                                        <SelectItem key={area._id.toString()} value={area._id.toString()}>
                                                            {area.name}
                                                        </SelectItem>
                                                    ))}
                                            </SelectContent>
                                        </Select>
                                    </div>
                                )}
                            </div>

                            <div className="space-y-4">
                                <div className="space-y-2">
                                    <Label htmlFor="quantity">Cantidad</Label>
                                    <Input
                                        id="quantity"
                                        type="number"
                                        min="1"
                                        value={formData.quantity}
                                        onChange={(e) => handleChange("quantity", Number.parseInt(e.target.value) || 0)}
                                    />
                                </div>

                                <div className="space-y-2">
                                    <Label htmlFor="date">Fecha</Label>
                                    <Input
                                        id="date"
                                        type="date"
                                        value={formData.date}
                                        onChange={(e) => handleChange("date", e.target.value)}
                                    />
                                </div>

                                <div className="space-y-2">
                                    <Label htmlFor="notes">Notas</Label>
                                    <Textarea
                                        id="notes"
                                        placeholder="Detalles adicionales sobre este movimiento..."
                                        value={formData.notes}
                                        onChange={(e) => handleChange("notes", e.target.value)}
                                        rows={4}
                                    />
                                </div>
                            </div>
                        </div>

                        <div className="flex justify-end gap-2">
                            <Button
                                type="button"
                                variant="outline"
                                onClick={() => router.push(`/agency/${agencyId}/(Inventory)?tab=overview`)}
                            >
                                Cancelar
                            </Button>
                            <Button type="submit" disabled={loading}>
                                {loading ? (
                                    "Guardando..."
                                ) : (
                                    <>
                                        <Save className="h-4 w-4 mr-2" />
                                        Guardar Movimiento
                                    </>
                                )}
                            </Button>
                        </div>
                    </form>
                </CardContent>
            </Card>
        </div>
    )
}
