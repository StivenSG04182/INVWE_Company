import { getAuthUserDetails } from "@/lib/queries"
import { redirect } from "next/navigation"
import { ProductService } from "@/lib/services/inventory-service"
import ProductForm from "@/components/inventory/product-form"

interface PageProps {
    params: {
        productId: string;
        agencyId: string;
    }
}

export default async function EditProductPage({ params }: PageProps) {
    const { productId, agencyId } = params;
    
    try {
        const user = await getAuthUserDetails();
        if (!user) return redirect("/sign-in");

        if (!user.Agency) {
            return redirect("/agency");
        }

        const product = await ProductService.getProductById(agencyId, productId);
        
        if (!product) {
            return redirect(`/agency/${agencyId}/products`);
        }

        // Normalizar campos null a undefined y quitar relaciones
        const { Movements, Category, ...plainProduct } = product;
        const normalizedProduct = {
            ...plainProduct,
            description: product.description ?? undefined,
            sku: product.sku ?? undefined,
            barcode: product.barcode ?? undefined,
            cost: typeof product.cost === 'object' && product.cost !== null && 'toNumber' in product.cost ? product.cost.toNumber() : (product.cost ?? undefined),
            price: typeof product.price === 'object' && product.price !== null && 'toNumber' in product.price ? product.price.toNumber() : (product.price ?? undefined),
            minStock: product.minStock ?? undefined,
            subAccountId: product.subAccountId ?? undefined,
            categoryId: product.categoryId ?? undefined,
            brand: product.brand ?? undefined,
            model: product.model ?? undefined,
            unit: product.unit ?? undefined,
            quantity: product.quantity ?? undefined,
            locationId: product.locationId ?? undefined,
            warehouseId: product.warehouseId ?? undefined,
            batchNumber: product.batchNumber ?? undefined,
            expirationDate: product.expirationDate ? product.expirationDate.toISOString() : undefined,
            serialNumber: product.serialNumber ?? undefined,
            warrantyMonths: product.warrantyMonths ?? undefined,
            discount: typeof product.discount === 'object' && product.discount !== null && 'toNumber' in product.discount ? product.discount.toNumber() : (product.discount ?? undefined),
            discountStartDate: product.discountStartDate ? product.discountStartDate.toISOString() : undefined,
            discountEndDate: product.discountEndDate ? product.discountEndDate.toISOString() : undefined,
            discountMinimumPrice: typeof product.discountMinimumPrice === 'object' && product.discountMinimumPrice !== null && 'toNumber' in product.discountMinimumPrice ? product.discountMinimumPrice.toNumber() : (product.discountMinimumPrice ?? undefined),
            taxRate: typeof product.taxRate === 'object' && product.taxRate !== null && 'toNumber' in product.taxRate ? product.taxRate.toNumber() : (product.taxRate ?? undefined),
            supplierId: product.supplierId ?? undefined,
            variants: Array.isArray(product.variants) ? (product.variants as Array<{ name: string; value: string; }>) : undefined,
            documents: Array.isArray(product.documents) ? (product.documents as string[]) : undefined,
            externalIntegrations: product.externalIntegrations ? (product.externalIntegrations as Record<string, string>) : undefined,
            customFields: product.customFields ? (product.customFields as Record<string, any>) : undefined,
        };

        return (
            <div className="container mx-auto p-6">
                <ProductForm 
                    agencyId={agencyId}
                    product={normalizedProduct}
                    isEditing={true}
                />
            </div>
        );
    } catch (error) {
        console.error('Error al cargar el producto para editar:', error);
        return redirect(`/agency/${agencyId}/products`);
    }
}
