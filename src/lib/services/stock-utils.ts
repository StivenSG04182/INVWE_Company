import { getAuthUserDetails } from "@/lib/queries"
import { getProducts, getAreas, getMovements } from "@/lib/queries2"

// Función temporal para getStocks
const getStocks = async (agencyId: string) => {
  console.log('Función getStocks pendiente de implementación')
  return []
}

// Función para obtener datos de stock
export async function getStockPageData(agencyId: string) {
  const user = await getAuthUserDetails()
  if (!user) return { redirect: "/sign-in" }

  if (!user.Agency) {
    return { redirect: "/agency" }
  }

  try {
    // Obtener datos usando las funciones de queries2.ts
    const rawStocks: any[] = await getStocks(agencyId)
    const rawProducts = await getProducts(agencyId)
    const rawAreas = await getAreas(agencyId)
    
    // Convertir valores Decimal a números normales para evitar errores de serialización
    const stocks = rawStocks.map(stock => ({
      ...(typeof stock.toJSON === 'function' ? stock.toJSON() : stock),
      quantity: stock.quantity ? Number(stock.quantity) : 0
    }))
    
    const products = rawProducts.map(product => ({
      ...product,
      price: product.price ? Number(product.price) : 0,
      cost: product.cost ? Number(product.cost) : 0,
      discount: product.discount ? Number(product.discount) : 0,
      taxRate: product.taxRate ? Number(product.taxRate) : 0,
      discountMinimumPrice: product.discountMinimumPrice ? Number(product.discountMinimumPrice) : null
    }))
    
    const areas = rawAreas
    
    // Calcular estadísticas
    const totalItems = stocks.reduce((sum, stock) => sum + stock.quantity, 0)
    const totalValue = stocks.reduce((sum, stock) => {
      const product = products.find(p => p.id === stock.productId)
      return sum + (product?.cost || 0) * stock.quantity
    }, 0)
    
    // Calcular productos con bajo stock
    const lowStockItems = products.filter(product => {
      if (!product.minStock) return false
      const productStocks = stocks.filter(s => s.productId === product.id)
      const totalStock = productStocks.reduce((sum, stock) => sum + stock.quantity, 0)
      return totalStock <= product.minStock
    }).length
    
    // Crear mapas para buscar nombres de productos y áreas
    const productsMap = new Map(products.map((p: any) => [p.id, p]))
    const areasMap = new Map(areas.map((a: any) => [a.id, a]))

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
      subAccounts: user.Agency.SubAccount || [],
    }
  } catch (error) {
    console.error("Error al cargar datos de inventario:", error)
    return {
      user,
      stocks: [],
      products: [],
      areas: [],
      totalItems: 0,
      totalValue: 0,
      lowStockItems: 0,
      productsMap: new Map(),
      areasMap: new Map(),
      subAccounts: user.Agency.SubAccount || [],
    }
  }
} 