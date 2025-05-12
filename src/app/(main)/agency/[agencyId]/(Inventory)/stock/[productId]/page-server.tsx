import { getAuthUserDetails } from "@/lib/queries"
import { redirect } from "next/navigation"
import { ProductService, StockService, AreaService } from "@/lib/services/inventory-service"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { Button } from "@/components/ui/button"
import Link from "next/link"
import { ArrowLeft, AlertTriangle } from "lucide-react"

export async function getProductStockData(agencyId: string, productId: string) {
    const user = await getAuthUserDetails()
    if (!user) return { redirect: "/sign-in" }

    if (!user.Agency) {
        return { redirect: "/agency" }
    }

    // Obtener producto
    let product = null
    let stocks = []
    let areas = []

    try {
        // Importar el serializador para convertir objetos MongoDB a objetos planos
        const { serializeMongoObject, serializeMongoArray } = await import('@/lib/serializers')
        
        // Obtener producto
        const rawProduct = await ProductService.getProductById(productId)
        if (!rawProduct) {
            return {
                error: true,
                errorComponent: (
                    <div className="container mx-auto p-6">
                        <Alert variant="destructive">
                            <AlertTriangle className="h-4 w-4" />
                            <AlertTitle>Error</AlertTitle>
                            <AlertDescription>El producto no existe o ha sido eliminado.</AlertDescription>
                        </Alert>
                        <div className="mt-4">
                            <Button variant="outline" asChild>
                                <Link href={`/agency/${agencyId}/stock`}>
                                    <ArrowLeft className="h-4 w-4 mr-2" />
                                    Volver al inventario
                                </Link>
                            </Button>
                        </div>
                    </div>
                )
            }
        }
        
        // Serializar producto
        product = serializeMongoObject(rawProduct)

        // Obtener stock del producto y serializar
        const rawStocks = await StockService.getStockByProductId(productId)
        stocks = serializeMongoArray(rawStocks)

        // Obtener áreas para mostrar nombres y serializar
        const rawAreas = await AreaService.getAreas(agencyId)
        areas = serializeMongoArray(rawAreas)
    } catch (error) {
        console.error("Error al cargar producto o stock:", error)
        return {
            error: true,
            errorComponent: (
                <div className="container mx-auto p-6">
                    <Alert variant="destructive">
                        <AlertTriangle className="h-4 w-4" />
                        <AlertTitle>Error</AlertTitle>
                        <AlertDescription>Ocurrió un error al cargar la información del producto.</AlertDescription>
                    </Alert>
                    <div className="mt-4">
                        <Button variant="outline" asChild>
                            <Link href={`/agency/${agencyId}/stock`}>
                                <ArrowLeft className="h-4 w-4 mr-2" />
                                Volver al inventario
                            </Link>
                        </Button>
                    </div>
                </div>
            )
        }
    }

    // Calcular stock total
    const totalStock = stocks.reduce((total, stock) => total + stock.quantity, 0)
    const stockStatus = product.minStock && totalStock <= product.minStock ? "bajo" : "normal"

    // Crear mapa para buscar nombres de áreas
    const areasMap = new Map(areas.map((a: any) => [a._id, a]))

    // Calcular valor total del inventario para este producto
    const totalValue = product.price * totalStock

    return {
        user,
        product,
        stocks,
        areas,
        totalStock,
        stockStatus,
        areasMap,
        totalValue,
        error: false,
        errorComponent: null
    }
}