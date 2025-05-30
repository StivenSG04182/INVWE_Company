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

        return (
            <div className="container mx-auto p-6">
                <ProductForm 
                    agencyId={agencyId}
                    product={product}
                    mode="edit"
                />
            </div>
        );
    } catch (error) {
        console.error('Error al cargar el producto para editar:', error);
        return redirect(`/agency/${agencyId}/products`);
    }
}
