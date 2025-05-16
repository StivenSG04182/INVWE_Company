import { NextResponse } from "next/server"
import { getAuthUser } from "@/lib/auth"
import { ProductService } from "@/lib/services/inventory-service"

export async function DELETE(req: Request, { params }: { params: { agencyId: string; discountId: string } }) {
    try {
        const user = await getAuthUser()
        if (!user) {
            return NextResponse.json({ success: false, error: "No autorizado" }, { status: 401 })
        }

        const { agencyId, discountId } = params

        // Eliminar descuento
        await ProductService.removeDiscount(agencyId, discountId)

        return NextResponse.json({
            success: true,
            message: "Descuento eliminado correctamente",
        })
    } catch (error: any) {
        console.error("Error al eliminar descuento:", error)
        return NextResponse.json({ success: false, error: error.message || "Error al eliminar descuento" }, { status: 500 })
    }
}

export async function GET(req: Request, { params }: { params: { agencyId: string; discountId: string } }) {
    try {
        const user = await getAuthUser()
        if (!user) {
            return NextResponse.json({ success: false, error: "No autorizado" }, { status: 401 })
        }

        const { agencyId, discountId } = params

        // Obtener detalles del descuento
        const discount = await ProductService.getDiscountById(agencyId, discountId)

        if (!discount) {
            return NextResponse.json({ success: false, error: "Descuento no encontrado" }, { status: 404 })
        }

        return NextResponse.json({
            success: true,
            data: discount,
        })
    } catch (error: any) {
        console.error("Error al obtener descuento:", error)
        return NextResponse.json({ success: false, error: error.message || "Error al obtener descuento" }, { status: 500 })
    }
}

export async function PUT(req: Request, { params }: { params: { agencyId: string; discountId: string } }) {
    try {
        const user = await getAuthUser()
        if (!user) {
            return NextResponse.json({ success: false, error: "No autorizado" }, { status: 401 })
        }

        const { agencyId, discountId } = params
        const body = await req.json()

        // Actualizar descuento
        const updatedDiscount = await ProductService.updateDiscount(agencyId, discountId, body)

        return NextResponse.json({
            success: true,
            message: "Descuento actualizado correctamente",
            data: updatedDiscount,
        })
    } catch (error: any) {
        console.error("Error al actualizar descuento:", error)
        return NextResponse.json(
            { success: false, error: error.message || "Error al actualizar descuento" },
            { status: 500 },
        )
    }
}
