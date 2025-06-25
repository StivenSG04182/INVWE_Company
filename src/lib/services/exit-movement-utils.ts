import { getAuthUserDetails } from "@/lib/queries"

// Servicio para obtener datos necesarios para la página de salida de inventario
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