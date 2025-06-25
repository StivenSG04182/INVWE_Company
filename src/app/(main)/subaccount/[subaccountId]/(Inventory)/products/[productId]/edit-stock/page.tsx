import { getAuthUserDetails } from "@/lib/queries"
import { redirect } from "next/navigation"
import { Suspense } from "react"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Skeleton } from "@/components/ui/skeleton"
import { ProductService, AreaService, StockService } from "@/lib/services/inventory-service"
import { ArrowLeft, Package, Settings } from "lucide-react"
import Link from "next/link"
import EditStockForm from "@/components/inventory/edit-stock-form"
import { getEditStockPageData } from "@/lib/services/edit-stock-utils"

export default async function EditStockPage({
    params,
}: {
    params: { agencyId: string; productId: string }
}) {
    const user = await getAuthUserDetails()
    if (!user) return redirect("/sign-in")

    const { agencyId, productId } = params
    if (!user.Agency) return redirect("/agency")

    // Obtener datos necesarios
    const pageData = await getEditStockPageData(agencyId, productId)

    if (!pageData.product) {
        return (
            <div className="container mx-auto p-6">
                <div className="flex items-center gap-2 mb-6">
                    <Button variant="ghost" size="sm" asChild>
                        <Link href={`/agency/${agencyId}/(Inventory)?tab=overview`}>
                            <ArrowLeft className="h-4 w-4 mr-2" />
                            Volver al inventario
                        </Link>
                    </Button>
                </div>
                <Card>
                    <CardContent className="flex flex-col items-center justify-center p-10">
                        <Package className="h-16 w-16 text-muted-foreground/30 mb-4" />
                        <h3 className="text-xl font-medium mb-2">Producto no encontrado</h3>
                        <p className="text-muted-foreground text-center mb-6">
                            El producto que estás buscando no existe o ha sido eliminado.
                        </p>
                        <Button asChild>
                            <Link href={`/agency/${agencyId}/(Inventory)?tab=overview`}>
                                <ArrowLeft className="h-4 w-4 mr-2" />
                                Volver al inventario
                            </Link>
                        </Button>
                    </CardContent>
                </Card>
            </div>
        )
    }

    return (
        <div className="container mx-auto p-6 space-y-8">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                <div>
                    <h1 className="text-4xl font-bold tracking-tight">Configuración de Stock</h1>
                    <p className="text-muted-foreground mt-1">Configura los parámetros de stock para {pageData.product.name}</p>
                </div>
                <Button variant="outline" size="sm" asChild>
                    <Link href={`/agency/${agencyId}/(Inventory)?tab=product&productId=${productId}`}>
                        <ArrowLeft className="h-4 w-4 mr-2" />
                        Volver al producto
                    </Link>
                </Button>
            </div>

            <Card>
                <CardHeader>
                    <div className="flex items-center gap-2">
                        <div className="p-2 rounded-full bg-blue-100 dark:bg-blue-900/30">
                            <Settings className="h-5 w-5 text-blue-600 dark:text-blue-400" />
                        </div>
                        <div>
                            <CardTitle>Configuración de Stock</CardTitle>
                            <CardDescription>Configura los niveles de stock mínimo y máximo para este producto</CardDescription>
                        </div>
                    </div>
                </CardHeader>
                <CardContent>
                    <Suspense fallback={<EditStockFormSkeleton />}>
                        <EditStockForm
                            agencyId={agencyId}
                            product={pageData.product}
                            areas={pageData.areas}
                            stocks={pageData.stocks}
                        />
                    </Suspense>
                </CardContent>
            </Card>
        </div>
    )
}

// Componente Skeleton para carga suspendida
const EditStockFormSkeleton = () => (
    <div className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-4">
                <Skeleton className="h-10 w-full" />
                <Skeleton className="h-10 w-full" />
                <Skeleton className="h-10 w-full" />
            </div>
            <div className="space-y-4">
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
