import SubaccountProductForm from '@/components/inventory/SubaccountProductForm'
import BlurPage from '@/components/global/blur-page'
import React from 'react'
import { ProductService } from '@/lib/services/inventory-service'

type Props = {
    params: { subaccountId: string; productId: string }
}

const EditProductPage = async ({ params }: Props) => {
    const { subaccountId, productId } = params
    
    // Obtener el producto a editar
    let product = null
    try {
        // Importar el serializador para convertir objetos MongoDB a objetos planos
        const { serializeMongoObject } = await import("@/lib/serializers")
        
        // Obtener y serializar producto
        const rawProduct = await ProductService.getProductById(subaccountId, productId)
        
        // Serializar para eliminar métodos y propiedades no serializables
        product = serializeMongoObject(rawProduct)
    } catch (error) {
        console.error("Error al cargar el producto:", error)
    }

    if (!product) {
        return (
            <BlurPage>
                <div className="p-4">
                    <h1 className="text-2xl font-bold">Producto no encontrado</h1>
                    <p className="text-muted-foreground mt-2">
                        No se pudo encontrar el producto solicitado. Por favor, regrese a la lista de productos.
                    </p>
                </div>
            </BlurPage>
        )
    }

    return (
        <BlurPage>
            <SubaccountProductForm
                subaccountId={subaccountId}
                product={product}
                isEditing={true}
            />
        </BlurPage>
    )
}

export default EditProductPage