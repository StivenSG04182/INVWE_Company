import { getMovements } from "@/lib/queries2"
import { notFound } from "next/navigation"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { ArrowDownToLine, ArrowUpFromLine, ArrowLeftRight, ArrowLeft } from "lucide-react"
import { Button } from "@/components/ui/button"
import Link from "next/link"

interface MovementDetailPageProps {
    params: {
        agencyId: string
        movementId: string
    }
}

export default async function MovementDetailPage({ params }: MovementDetailPageProps) {
    // Obtener los detalles del movimiento
    const movements = await getMovements(params.agencyId)
    const movement = movements.find(m => m.id === params.movementId)

    if (!movement) {
        notFound()
    }

    // Obtener el icono según el tipo de movimiento
    const getMovementIcon = (type: string) => {
        switch (type) {
            case "entrada":
                return <ArrowDownToLine className="h-5 w-5 text-green-500" />
            case "salida":
                return <ArrowUpFromLine className="h-5 w-5 text-red-500" />
            case "transferencia":
                return <ArrowLeftRight className="h-5 w-5 text-blue-500" />
            default:
                return null
        }
    }

    // Obtener la variante de badge según el tipo de movimiento
    const getMovementBadgeVariant = (type: string) => {
        switch (type) {
            case "entrada":
                return "success"
            case "salida":
                return "destructive"
            case "transferencia":
                return "outline"
            default:
                return "default"
        }
    }

    // Formatear fecha
    const formatDate = (date: Date) => {
        return date.toLocaleDateString("es-CO", {
            year: "numeric",
            month: "long",
            day: "numeric",
            hour: "2-digit",
            minute: "2-digit",
        })
    }

    return (
        <div className="container mx-auto py-6 space-y-6">
            <div className="flex items-center gap-4">
                <Button variant="ghost" size="sm" asChild>
                    <Link href={`/agency/${params.agencyId}/(Inventory)?tab=movements`}>
                        <ArrowLeft className="h-4 w-4 mr-2" />
                        Volver
                    </Link>
                </Button>
            </div>

            <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle>Detalle del Movimiento</CardTitle>
                    <Badge
                        variant={getMovementBadgeVariant(movement.type)}
                        className="flex items-center gap-2 px-3 py-1"
                    >
                        {getMovementIcon(movement.type)}
                        {movement.type === "entrada"
                            ? "Entrada"
                            : movement.type === "salida"
                                ? "Salida"
                                : "Transferencia"}
                    </Badge>
                </CardHeader>
                <CardContent className="grid gap-6">
                    <div className="grid md:grid-cols-2 gap-6">
                        <div className="space-y-4">
                            <div>
                                <h3 className="text-sm font-medium text-muted-foreground">Producto</h3>
                                <p className="text-lg font-medium">{movement.Product.name}</p>
                                <p className="text-sm text-muted-foreground">SKU: {movement.Product.sku || "—"}</p>
                            </div>
                            <div>
                                <h3 className="text-sm font-medium text-muted-foreground">Cantidad</h3>
                                <p className="text-lg font-medium">{movement.quantity}</p>
                            </div>
                            <div>
                                <h3 className="text-sm font-medium text-muted-foreground">Área</h3>
                                <p className="text-lg font-medium">{movement.Area.name}</p>
                            </div>
                            {movement.type === "transferencia" && movement.DestinationArea && (
                                <div>
                                    <h3 className="text-sm font-medium text-muted-foreground">Área de Destino</h3>
                                    <p className="text-lg font-medium">{movement.DestinationArea.name}</p>
                                </div>
                            )}
                        </div>

                        <div className="space-y-4">
                            <div>
                                <h3 className="text-sm font-medium text-muted-foreground">Fecha y Hora</h3>
                                <p className="text-lg font-medium">{formatDate(movement.date)}</p>
                            </div>
                            {movement.Provider && (
                                <div>
                                    <h3 className="text-sm font-medium text-muted-foreground">Proveedor</h3>
                                    <p className="text-lg font-medium">{movement.Provider.name}</p>
                                </div>
                            )}
                            {movement.notes && (
                                <div>
                                    <h3 className="text-sm font-medium text-muted-foreground">Notas</h3>
                                    <p className="text-base">{movement.notes}</p>
                                </div>
                            )}
                        </div>
                    </div>

                    <div className="flex gap-4">
                        <Button asChild>
                            <Link href={`/agency/${params.agencyId}/(Inventory)?tab=product&productId=${movement.Product.id}`}>
                                Ver Producto
                            </Link>
                        </Button>
                        <Button variant="outline" asChild>
                            <Link href={`/agency/${params.agencyId}/areas/workspace?areaId=${movement.Area.id}`}>
                                Ver Área
                            </Link>
                        </Button>
                    </div>
                </CardContent>
            </Card>
        </div>
    )
}