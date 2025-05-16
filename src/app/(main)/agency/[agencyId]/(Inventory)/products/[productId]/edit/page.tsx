import { getAuthUserDetails } from "@/lib/queries"
import { redirect } from "next/navigation"
import { ProductService } from "@/lib/services/inventory-service"
import ProductForm from "@/components/inventory/product-form"

const EditProductPage = async ({ params }: { params: { agencyId: string; productId: string } }) => {
    const user = await getAuthUserDetails()
    if (!user) return redirect("/sign-in")

    const { agencyId, productId } = params
    if (!user.Agency) {
        return redirect("/agency")
    }

    // Obtener producto de MongoDB
    let product = null
    try {
        // Importar el serializador para convertir objetos MongoDB a objetos planos
        const { serializeMongoObject } = await import("@/lib/serializers")

        // Obtener y serializar producto
        const rawProduct = await ProductService.getProductById(agencyId, productId)

        // Serializar para eliminar métodos y propiedades no serializables
        product = serializeMongoObject(rawProduct)
    } catch (error) {
        console.error("Error al cargar datos del producto:", error)
        return redirect(`/agency/${agencyId}/products`)
    }

    if (!product) {
        return redirect(`/agency/${agencyId}/products`)
    }

    return (
        <div className="flex-1 flex flex-col">
            <div className="flex-1">
                <ProductForm agencyId={agencyId} product={product} isEditing={true} />
            </div>
        </div>
    )
}

export default EditProductPage
