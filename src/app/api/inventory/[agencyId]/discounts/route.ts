import { NextResponse } from "next/server"
import { getAuthUser } from "@/lib/auth"
import { ProductService, CategoryService } from "@/lib/services/inventory-service"

export async function POST(req: Request, { params }: { params: { agencyId: string } }) {
    try {
        const user = await getAuthUser()
        if (!user) {
            return NextResponse.json({ success: false, error: "No autorizado" }, { status: 401 })
        }

        const agencyId = params.agencyId
        const body = await req.json()

        const {
            discountType,
            itemIds,
            applyToAll,
            discount,
            startDate,
            endDate,
            minimumPrice,
            name,
            description,
            showOriginalPrice,
            highlightInCatalog,
        } = body

        // Validar datos
        if (!discount || discount <= 0 || discount >= 100) {
            return NextResponse.json({ success: false, error: "Descuento inválido" }, { status: 400 })
        }

        if (!startDate || !endDate) {
            return NextResponse.json({ success: false, error: "Fechas requeridas" }, { status: 400 })
        }

        // Crear objeto de descuento
        const discountData = {
            discount,
            discountStartDate: startDate,
            discountEndDate: endDate,
            discountMinimumPrice: minimumPrice,
            discountName: name,
            discountDescription: description,
            showOriginalPrice,
            highlightInCatalog,
        }

        let affectedItems = 0

        // Aplicar descuento según el tipo
        if (discountType === "product") {
            if (applyToAll) {
                // Aplicar a todos los productos
                affectedItems = await ProductService.applyDiscountToAllProducts(agencyId, discountData)
            } else if (itemIds && itemIds.length > 0) {
                // Aplicar a productos seleccionados
                affectedItems = await ProductService.applyDiscountToProducts(agencyId, itemIds, discountData)
            } else {
                return NextResponse.json({ success: false, error: "No se seleccionaron productos" }, { status: 400 })
            }
        } else if (discountType === "category") {
            if (applyToAll) {
                // Aplicar a todas las categorías
                affectedItems = await CategoryService.applyDiscountToAllCategories(agencyId, discountData)
            } else if (itemIds && itemIds.length > 0) {
                // Aplicar a categorías seleccionadas
                affectedItems = await CategoryService.applyDiscountToCategories(agencyId, itemIds, discountData)
            } else {
                return NextResponse.json({ success: false, error: "No se seleccionaron categorías" }, { status: 400 })
            }
        } else {
            return NextResponse.json({ success: false, error: "Tipo de descuento inválido" }, { status: 400 })
        }

        // Guardar registro del descuento
        const discountRecord = await ProductService.createDiscountRecord(agencyId, {
            discountType,
            itemIds: applyToAll ? [] : itemIds,
            applyToAll,
            ...discountData,
        })

        return NextResponse.json({
            success: true,
            message: "Descuento aplicado correctamente",
            affectedItems,
            discountId: discountRecord._id,
        })
    } catch (error: any) {
        console.error("Error al aplicar descuento:", error)
        return NextResponse.json({ success: false, error: error.message || "Error al aplicar descuento" }, { status: 500 })
    }
}

export async function GET(req: Request, { params }: { params: { agencyId: string } }) {
    try {
        const user = await getAuthUser()
        if (!user) {
            return NextResponse.json({ success: false, error: "No autorizado" }, { status: 401 })
        }

        const agencyId = params.agencyId

        // Obtener descuentos activos
        const activeDiscounts = await ProductService.getActiveDiscounts(agencyId)

        return NextResponse.json({
            success: true,
            data: activeDiscounts,
        })
    } catch (error: any) {
        console.error("Error al obtener descuentos:", error)
        return NextResponse.json({ success: false, error: error.message || "Error al obtener descuentos" }, { status: 500 })
    }
}
