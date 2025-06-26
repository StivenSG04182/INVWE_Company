import { getAuthUserDetails } from "@/lib/queries"
import { ProductService, AreaService } from "@/lib/services/inventory-service"

// Servicio para obtener datos necesarios para la página de entrada de inventario
export async function getEntryPageData(agencyId: string, productId?: string) {
  const user = await getAuthUserDetails()
  if (!user) return { redirect: "/sign-in" }

  if (!user.Agency) {
    return { redirect: "/agency" }
  }

  try {
    // Obtener productos y áreas usando los servicios de Prisma
    const rawProducts = await ProductService.getProducts(agencyId)
    const rawAreas = await AreaService.getAreas(agencyId)
    
    // Convertir valores Decimal a números normales para evitar errores de serialización
    const products = rawProducts.map(product => ({
      ...product,
      price: product.price ? Number(product.price) : 0,
      cost: product.cost ? Number(product.cost) : 0,
      discount: product.discount ? Number(product.discount) : 0,
      taxRate: product.taxRate ? Number(product.taxRate) : 0,
      discountMinimumPrice: product.discountMinimumPrice ? Number(product.discountMinimumPrice) : null,
      minStock: product.minStock ? Number(product.minStock) : undefined
    }))
    
    const areas = rawAreas
    
    return {
      user,
      products,
      areas,
      productId
    }
  } catch (error) {
    console.error("Error al cargar datos para la página de entrada:", error)
    return {
      user,
      products: [],
      areas: [],
      productId
    }
  }
} 