import { getAuthUserDetails } from "@/lib/queries"
import { redirect } from "next/navigation"
import { Suspense } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Skeleton } from "@/components/ui/skeleton"
import { ProductService, AreaService } from "@/lib/services/inventory-service"
import MovementRegistration from "@/components/inventory/movement-registration"
import { ArrowLeftRight, Package, ArrowLeft } from "lucide-react"
import Link from "next/link"
import { getTransferPageData } from "@/lib/services/transfer-movement-utils"

export default async function TransferenciaPage({
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
    const pageData = await getTransferPageData(agencyId, searchParams.productId)

    return (
        <div className="container mx-auto p-6 space-y-8">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                <div>
                    <h1 className="text-4xl font-bold tracking-tight">Transferencia de Inventario</h1>
                    <p className="text-muted-foreground mt-1">Mueve productos entre diferentes áreas de almacenamiento</p>
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
                            <div className="p-2 rounded-full bg-blue-100 dark:bg-blue-900/30">
                                <ArrowLeftRight className="h-5 w-5 text-blue-600 dark:text-blue-400" />
                            </div>
                            <CardTitle className="text-lg">Transferencia de Productos</CardTitle>
                        </div>
                    </CardHeader>
                    <CardContent>
                        <p className="text-sm text-muted-foreground">
                            Transfiere productos entre diferentes áreas de almacenamiento sin afectar el stock total.
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
                        <p className="text-xs text-muted-foreground mt-2">Productos disponibles para transferir</p>
                    </CardContent>
                </Card>

                <Card className="bg-white dark:bg-gray-950 shadow-sm hover:shadow-md transition-shadow">
                    <CardHeader className="pb-2">
                        <CardTitle className="text-sm font-medium">Áreas de Almacenamiento</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="flex items-center justify-between">
                            <div className="text-2xl font-bold">{pageData.areas.length}</div>
                            <div className="h-10 w-10 rounded-full bg-purple-100 dark:bg-purple-900 flex items-center justify-center">
                                <Package className="h-5 w-5 text-purple-600 dark:text-purple-400" />
                            </div>
                        </div>
                        <p className="text-xs text-muted-foreground mt-2">Áreas disponibles para transferencias</p>
                    </CardContent>
                </Card>
            </div>

            <Suspense fallback={<MovementRegistrationSkeleton />}>
                <MovementRegistration
                    agencyId={agencyId}
                    type="transferencia"
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
