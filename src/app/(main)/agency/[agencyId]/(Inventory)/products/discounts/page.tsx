import { getAuthUserDetails } from "@/lib/queries"
import { getProducts, getCategories, getActiveDiscounts } from "@/lib/queries2"
import { redirect } from "next/navigation"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { ArrowLeft, Calendar, Clock, Package, Tag } from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { DiscountManager } from "@/components/inventory/discount-manager"
import { ActiveDiscounts } from "@/components/inventory/active-discounts"

const DiscountsPage = async ({ params }: { params: { agencyId: string } }) => {
    const user = await getAuthUserDetails()
    if (!user) return redirect("/sign-in")

    const agencyId = params.agencyId
    if (!user.Agency) {
        return redirect("/agency")
    }

    // Obtener productos y categorías
    let products = []
    let categories = []
    let activeDiscounts = []

    try {
        // Obtener productos, categorías y descuentos directamente
        products = await getProducts(agencyId)
        categories = await getCategories(agencyId)
        activeDiscounts = await getActiveDiscounts(agencyId)
    } catch (error) {
        console.error("Error al cargar datos:", error)
    }

    // Calcular estadísticas
    const productsWithDiscount = products.filter(
        product => product.discount > 0 && product.discountEndDate && new Date(product.discountEndDate) > new Date(),
    ).length

    const categoriesWithDiscount = categories.filter(
        category =>
            category.discount > 0 && category.discountEndDate && new Date(category.discountEndDate) > new Date(),
    ).length

    const expiringSoonCount = activeDiscounts.filter(discount => {
        if (!discount.discountEndDate) return false
        const endDate = new Date(discount.discountEndDate)
        const today = new Date()
        const threeDaysFromNow = new Date()
        threeDaysFromNow.setDate(today.getDate() + 3)
        return endDate > today && endDate <= threeDaysFromNow
    }).length

    return (
        <div className="container mx-auto p-6">
            <div className="flex items-center mb-6">
                <Button variant="ghost" size="sm" asChild className="mr-4">
                    <Link href={`/agency/${agencyId}/products`}>
                        <ArrowLeft className="h-4 w-4 mr-2" />
                        Volver a Productos
                    </Link>
                </Button>
                <h1 className="text-2xl font-bold">Gestión de Descuentos</h1>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                <Card>
                    <CardContent className="p-6">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm font-medium text-muted-foreground">Productos con Descuento</p>
                                <p className="text-2xl font-bold">{productsWithDiscount}</p>
                            </div>
                            <div className="h-12 w-12 rounded-full bg-green-100 dark:bg-green-900/30 flex items-center justify-center">
                                <Package className="h-6 w-6 text-green-600 dark:text-green-500" />
                            </div>
                        </div>
                    </CardContent>
                </Card>

                <Card>
                    <CardContent className="p-6">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm font-medium text-muted-foreground">Categorías con Descuento</p>
                                <p className="text-2xl font-bold">{categoriesWithDiscount}</p>
                            </div>
                            <div className="h-12 w-12 rounded-full bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center">
                                <Tag className="h-6 w-6 text-blue-600 dark:text-blue-500" />
                            </div>
                        </div>
                    </CardContent>
                </Card>

                <Card>
                    <CardContent className="p-6">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm font-medium text-muted-foreground">Descuentos por Vencer</p>
                                <p className="text-2xl font-bold">{expiringSoonCount}</p>
                                <p className="text-xs text-muted-foreground mt-1">En los próximos 3 días</p>
                            </div>
                            <div className="h-12 w-12 rounded-full bg-amber-100 dark:bg-amber-900/30 flex items-center justify-center">
                                <Clock className="h-6 w-6 text-amber-600 dark:text-amber-500" />
                            </div>
                        </div>
                    </CardContent>
                </Card>
            </div>

            <Tabs defaultValue="active" className="w-full">
                <TabsList className="mb-4">
                    <TabsTrigger value="active">Descuentos Activos</TabsTrigger>
                    <TabsTrigger value="create">Crear Descuento</TabsTrigger>
                    <TabsTrigger value="history">Historial</TabsTrigger>
                </TabsList>

                <TabsContent value="active">
                    <ActiveDiscounts
                        agencyId={agencyId}
                        activeDiscounts={activeDiscounts}
                        products={products}
                        categories={categories}
                    />
                </TabsContent>

                <TabsContent value="create">
                    <DiscountManager agencyId={agencyId} products={products} categories={categories} />
                </TabsContent>

                <TabsContent value="history">
                    <Card>
                        <CardHeader>
                            <CardTitle>Historial de Descuentos</CardTitle>
                            <CardDescription>Consulta el historial de descuentos aplicados anteriormente</CardDescription>
                        </CardHeader>
                        <CardContent>
                            <div className="text-center py-8">
                                <Calendar className="h-12 w-12 text-muted-foreground/30 mx-auto mb-4" />
                                <h3 className="text-lg font-medium mb-2">Historial de Descuentos</h3>
                                <p className="text-muted-foreground mb-6">
                                    Aquí podrás ver un registro de todos los descuentos aplicados anteriormente.
                                </p>
                            </div>
                        </CardContent>
                    </Card>
                </TabsContent>
            </Tabs>
        </div>
    )
}

export default DiscountsPage
