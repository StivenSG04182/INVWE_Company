import { getAuthUserDetails } from "@/lib/queries"
import { redirect } from "next/navigation"
import ProductForm from "@/components/inventory/ProductForm"
import { ProductService } from "@/lib/services/inventory-service"

const EditProductPage = async ({ params }: { params: { agencyId: string; productId: string } }) => {
  const user = await getAuthUserDetails()
  if (!user) return redirect("/sign-in")

  const agencyId = params.agencyId
  const productId = params.productId
  
  if (!user.Agency) {
    return redirect("/agency")
  }

  // Obtener el producto a editar
  let product = null
  try {
    // Importar el serializador para convertir objetos MongoDB a objetos planos
    const { serializeMongoObject } = await import('@/lib/serializers')
    
    // Obtener y serializar el producto
    const rawProduct = await ProductService.getProductById(productId)
    if (!rawProduct) {
      return redirect(`/agency/${agencyId}/products`)
    }
    
    // Serializar para eliminar métodos y propiedades no serializables
    product = serializeMongoObject(rawProduct)
  } catch (error) {
    console.error("Error al cargar producto:", error)
    return redirect(`/agency/${agencyId}/products`)
  }

  return <ProductForm agencyId={agencyId} product={product} isEditing={true} />
}

export default EditProductPage