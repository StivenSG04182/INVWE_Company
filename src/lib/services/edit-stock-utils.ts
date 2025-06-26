import { getAuthUserDetails } from "@/lib/queries"
import { getProductById, getAreas } from "@/lib/queries2"

// Servicio para obtener datos necesarios para la página de edición de stock
export async function getEditStockPageData(agencyId: string, productId: string) {
    const user = await getAuthUserDetails()
    if (!user) return { redirect: "/sign-in" }

    if (!user.Agency) {
        return { redirect: "/agency" }
    }

    try {
        // Obtener producto, áreas y stock
        const [product, areas] = await Promise.all([
            getProductById(agencyId, productId),
            getAreas(agencyId)
        ])

        // Si no se encuentra el producto, retornar null
        if (!product) {
            return {
                user,
                product: null,
                areas: areas || [],
                stocks: [],
            }
        }

        // Para stocks, usamos la información del producto mismo ya que no hay tabla separada de stocks
        const stocks = [{
            id: product.id,
            productId: product.id,
            quantity: product.quantity || 0,
            minStock: product.minStock || 0,
        }]

        return {
            user,
            product,
            areas: areas || [],
            stocks,
        }
    } catch (error) {
        console.error("Error fetching edit stock page data:", error)
        return {
            user,
            product: null,
            areas: [],
            stocks: [],
        }
    }
} 