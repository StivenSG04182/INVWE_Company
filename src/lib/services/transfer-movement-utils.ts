import { getAuthUserDetails } from "@/lib/queries"

// Servicio para obtener datos necesarios para la página de transferencia de inventario
export async function getTransferPageData(agencyId: string, productId?: string) {
    const user = await getAuthUserDetails()
    if (!user) return { redirect: "/sign-in" }

    if (!user.Agency) {
        return { redirect: "/agency" }
    }

    // Obtener productos y áreas de MongoDB
    let products = []
    let areas = []

    return {
        user,
        products,
        areas,
        productId,
    }
} 