import { getAuthUserDetails } from "@/lib/queries"
import { redirect } from "next/navigation"
import { Suspense } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Skeleton } from "@/components/ui/skeleton"
import { ProductService, AreaService, StockService } from "@/lib/services/inventory-service"
import MovementRegistration from "@/components/inventory/movement-registration"
import { ArrowUpFromLine, Package, ArrowLeft, AlertTriangle } from "lucide-react"
import Link from "next/link"

// Servicio para obtener datos necesarios
export async function getExitPageData(agencyId: string, productId?: string) {
    const user = await getAuthUserDetails()
    if (!user) return { redirect: "/sign-in" }

    if (!user.Agency) {
        return { redirect: "/agency" }
    }

    let products = []
    let areas = []
    let stocks = []
    let lowStockItems = 0

    return {
        user,
        products,
        areas,
        lowStockItems,
        productId,
    }
}

export default async function SalidaPage({
    params,
    searchParams,
}: {
    params: { agencyId: string }
    searchParams: { productId?: string }
}) {
    const user = await getAuthUserDetails()
    if (!user) return redirect("/sign-in")

    const agencyId = params.agencyId
    if (!user.Agency) return redirect("/agency")

    // Obtener datos necesarios
    const pageData = await getExitPageData(agencyId, searchParams.productId)

    return (
        <div className="container mx-auto p-6 space-y-8">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                <div>
                    <h1 className="text-4xl font-bold tracking-tight">Salida de Inventario</h1>
                    <p className="text-muted-foreground mt-1">Registra la salida de productos del inventario</p>
                </div>
                <Button variant="outline" size="sm" asChild>
                    <Link href={`/agency/${agencyId}/(Inventory)?tab=overview`}>
                        <ArrowLeft className="h-4 w-4 mr-2" />
                        Volver al inventario
                    </Link>
                </Button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <Card className="bg-white dark:bg-gray-950 shadow-sm hover:shadow-md transition-shadow">
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
                            Registra la salida de productos de tu inventario. Puedes registrar ventas, consumos internos, pérdidas o
                            cualquier otro tipo de salida.
                        </p>
                    </CardContent>
                </Card>

                <Card className="bg-white dark:bg-gray-950 shadow-sm hover:shadow-md transition-shadow">
                    <CardHeader className="pb-2">
                        <CardTitle className="text-sm font-medium">Total Productos</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="flex items-center justify-between">
                            <div className="text-2xl font-bold">{pageData.products.length}</div>
                            <div className="h-10 w-10 rounded-full bg-blue-100 dark:bg-blue-900 flex items-center justify-center">
                                <Package className="h-5 w-5 text-blue-600 dark:text-blue-400" />
                            </div>
                        </div>
                        <p className="text-xs text-muted-foreground mt-2">Productos disponibles para registrar salidas</p>
                    </CardContent>
                </Card>

                <Card className="bg-white dark:bg-gray-950 shadow-sm hover:shadow-md transition-shadow">
                    <CardHeader className="pb-2">
                        <CardTitle className="text-sm font-medium">Productos Bajo Mínimo</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="flex items-center justify-between">
                            <div className="text-2xl font-bold">{pageData.lowStockItems}</div>
                            <div className="h-10 w-10 rounded-full bg-red-100 dark:bg-red-900 flex items-center justify-center">
                                <AlertTriangle className="h-5 w-5 text-red-600 dark:text-red-400" />
                            </div>
                        </div>
                        <p className="text-xs text-muted-foreground mt-2">Productos que requieren reposición</p>
                    </CardContent>
                </Card>
            </div>

            <Suspense fallback={<MovementRegistrationSkeleton />}>
                <MovementRegistration
                    agencyId={agencyId}
                    type="salida"
                    productId={searchParams.productId}
                    products={pageData.products}
                    areas={pageData.areas}
                />
            </Suspense>
        </div>
    )
}

// Componente Skeleton para carga suspendida
const MovementRegistrationSkeleton = () => (
    <div className="space-y-4">
        <Skeleton className="h-8 w-48" />
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-4">
                <Skeleton className="h-10 w-full" />
                <Skeleton className="h-10 w-full" />
                <Skeleton className="h-10 w-full" />
                <Skeleton className="h-10 w-full" />
            </div>
            <div className="space-y-4">
                <Skeleton className="h-10 w-full" />
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
