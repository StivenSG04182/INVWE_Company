import { getAuthUserDetails } from "@/lib/queries"
import { redirect } from "next/navigation"
import { Suspense } from "react"
import StockOverview from "@/components/inventory/stock-overview"
import MovementRegistration from "@/components/inventory/movement-registration"
import ProductStockDetails from "@/components/inventory/product-stock-details"
import { getProducts, getAreas } from "@/lib/queries2"

export default async function InventoryPage({
  params,
  searchParams,
}: {
  params: { agencyId: string }
  searchParams: { tab?: string; productId?: string; type?: string }
}) {
  // Validación de autorización
  const user = await getAuthUserDetails()
  if (!user) return redirect("/sign-in")
  if (!user.Agency) return redirect("/agency")

  const agencyId = params.agencyId

  // Obtener datos necesarios
  const [rawProducts, areas] = await Promise.all([
    getProducts(agencyId),
    getAreas(agencyId)
  ])

  // Convertir los valores Decimal a números normales
  const products = rawProducts.map(product => ({
    ...product,
    price: product.price ? Number(product.price) : 0,
    cost: product.cost ? Number(product.cost) : 0,
    discount: product.discount ? Number(product.discount) : 0,
    taxRate: product.taxRate ? Number(product.taxRate) : 0,
    quantity: product.quantity ? Number(product.quantity) : 0,
    discountMinimumPrice: product.discountMinimumPrice ? Number(product.discountMinimumPrice) : null
  }))

  // Crear el mapa de productos y áreas como Map objects
  const productsMap = new Map(products.map(product => [product.id, product]))
  const areasMap = new Map(areas.map(area => [area.id, area]))

  // Determinar la página activa basada en los parámetros de búsqueda
  const activeTab =
    searchParams.tab || (searchParams.productId ? "product" : searchParams.type ? "movement" : "overview")

  const content = {
    overview: (
      <Suspense>
        <StockOverview 
          agencyId={agencyId}
          stocks={products}
          products={products}
          areas={areas}
          productsMap={productsMap}
          areasMap={areasMap}
        />
      </Suspense>
    ),
    movement: (
      <Suspense>
        <MovementRegistration 
          agencyId={agencyId}
          type={searchParams.type as "entrada" | "salida" | "transferencia" | undefined}
          productId={searchParams.productId}
        />
      </Suspense>
    ),
    product: searchParams.productId ? (
      <Suspense>
        <ProductStockDetails
          product={products.find(p => p.id === searchParams.productId)!}
          stocks={products.filter(p => p.id === searchParams.productId)}
        />
      </Suspense>
    ) : null
  }

  return content[activeTab as keyof typeof content] || content.overview
}
