import { NextRequest, NextResponse } from "next/server";
import { ProductService } from "@/lib/services/inventory-service";
import { getAuthUserDetails } from "@/lib/queries";

// Función para verificar acceso a la agencia
async function hasAccessToAgency(agencyId: string) {
    const user = await getAuthUserDetails();
    if (!user) {
        return false;
    }

    // Verificar si el usuario tiene acceso a la agencia
    if (!user.Agency) {
        return false;
    }

    // Verificar si la agencia del usuario coincide con la agencia solicitada
    return user.Agency.id === agencyId;
}

// GET: Obtener un producto específico
export async function GET(req: NextRequest, { params }: { params: { agencyId: string; productId: string } }) {
    const { agencyId, productId } = params;

    // Verificar acceso
    const hasAccess = await hasAccessToAgency(agencyId);
    if (!hasAccess) {
        return NextResponse.json({ success: false, error: "No autorizado" }, { status: 401 });
    }

    try {
        const product = await ProductService.getProductById(agencyId, productId);
        if (!product) {
            return NextResponse.json({ success: false, error: "Producto no encontrado" }, { status: 404 });
        }

        return NextResponse.json({ success: true, data: product });
    } catch (error) {
        console.error("Error al obtener producto:", error);
        return NextResponse.json({ success: false, error: "Error al obtener producto" }, { status: 500 });
    }
}

// DELETE: Eliminar un producto específico
export async function DELETE(req: NextRequest, { params }: { params: { agencyId: string; productId: string } }) {
    const { agencyId, productId } = params;

    // Verificar acceso
    const hasAccess = await hasAccessToAgency(agencyId);
    if (!hasAccess) {
        return NextResponse.json({ success: false, error: "No autorizado" }, { status: 401 });
    }

    try {
        // Verificar que el producto existe y pertenece a la agencia
        const product = await ProductService.getProductById(agencyId, productId);
        if (!product) {
            return NextResponse.json({ success: false, error: "Producto no encontrado" }, { status: 404 });
        }

        // Eliminar el producto
        const result = await ProductService.deleteProduct(productId);
        return NextResponse.json({ success: true, data: result });
    } catch (error) {
        console.error("Error al eliminar producto:", error);
        return NextResponse.json({ success: false, error: "Error al eliminar producto" }, { status: 500 });
    }
}

// PATCH: Actualizar un producto específico
export async function PATCH(req: NextRequest, { params }: { params: { agencyId: string; productId: string } }) {
    const { agencyId, productId } = params;

    // Verificar acceso
    const hasAccess = await hasAccessToAgency(agencyId);
    if (!hasAccess) {
        return NextResponse.json({ success: false, error: "No autorizado" }, { status: 401 });
    }

    try {
        // Verificar que el producto existe y pertenece a la agencia
        const existingProduct = await ProductService.getProductById(agencyId, productId);
        if (!existingProduct) {
            return NextResponse.json({ success: false, error: "Producto no encontrado" }, { status: 404 });
        }

        // Obtener datos del cuerpo de la solicitud
        const data = await req.json();

        // Actualizar el producto
        const updatedProduct = await ProductService.updateProduct(productId, data);
        return NextResponse.json({ success: true, data: updatedProduct });
    } catch (error) {
        console.error("Error al actualizar producto:", error);
        return NextResponse.json({ success: false, error: "Error al actualizar producto" }, { status: 500 });
    }
}