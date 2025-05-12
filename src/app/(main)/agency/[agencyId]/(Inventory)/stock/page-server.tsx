import { getAuthUserDetails } from "@/lib/queries"
import { redirect } from "next/navigation"
import { StockService, ProductService, AreaService } from "@/lib/services/inventory-service"

export async function getStockPageData(agencyId: string) {
  const user = await getAuthUserDetails()
  if (!user) return { redirect: "/sign-in" }

  if (!user.Agency) {
    return { redirect: "/agency" }
  }

  // Obtener datos de stock, productos y áreas de MongoDB
  let stocks = []
  let products = []
  let areas = []
  let totalItems = 0
  let totalValue = 0
  let lowStockItems = 0

  try {
    // Obtener stock
    stocks = await StockService.getStocks(agencyId)

    // Obtener productos y áreas para mostrar nombres
    products = await ProductService.getProducts(agencyId)
    areas = await AreaService.getAreas(agencyId)

    // Calcular estadísticas
    totalItems = stocks.reduce((sum: number, item: any) => sum + item.quantity, 0)

    // Calcular valor total del inventario
    const productsMap = new Map(products.map((p: any) => [p._id.toString(), p]))
    totalValue = stocks.reduce((sum: number, item: any) => {
      const product = productsMap.get(item.productId)
      return sum + (product ? product.price * item.quantity : 0)
    }, 0)

    // Contar productos bajo mínimo
    lowStockItems = stocks.filter((item: any) => {
      const product = productsMap.get(item.productId)
      return product && product.minStock && item.quantity <= product.minStock
    }).length
  } catch (error) {
    console.error("Error al cargar datos de inventario:", error)
  }

  // Crear mapas para buscar nombres de productos y áreas
  const productsMap = new Map(products.map((p: any) => [p._id.toString(), p]))
  const areasMap = new Map(areas.map((a: any) => [a._id.toString(), a]))

  return {
    user,
    stocks,
    products,
    areas,
    totalItems,
    totalValue,
    lowStockItems,
    productsMap,
    areasMap,
    subAccounts: user.Agency.SubAccount || []
  }
}