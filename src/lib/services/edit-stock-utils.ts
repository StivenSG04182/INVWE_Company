import { getAuthUserDetails } from "@/lib/queries"

// Servicio para obtener datos necesarios para la página de edición de stock
export async function getEditStockPageData(agencyId: string, productId: string) {
    const user = await getAuthUserDetails()
    if (!user) return { redirect: "/sign-in" }

    if (!user.Agency) {
        return { redirect: "/agency" }
    }

    // Obtener productos, áreas y stock de MongoDB
    let product = null
    let areas = []
    let stocks = []

    return {
        user,
        product,
        areas,
        stocks,
    }
} 