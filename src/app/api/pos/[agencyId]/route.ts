import { type NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { POSService } from "@/lib/services/pos-service"

export async function POST(req: NextRequest, { params }: { params: { agencyId: string } }) {
    try {
        const session = await getServerSession(authOptions)
        if (!session?.user) {
            return NextResponse.json({ success: false, error: "No autorizado" }, { status: 401 })
        }

        const { agencyId } = params
        const body = await req.json()
        const { action, data } = body

        let result
        switch (action) {
            case "process-sale":
                result = await POSService.processSale({ ...data, agencyId })
                break
            case "get-product-price":
                result = await POSService.getProductPriceWithDiscount(data.productId)
                break
            case "check-expiring-products":
                result = await POSService.checkExpiringProductsInPOS(agencyId, data.daysThreshold)
                break
            case "save-cart":
                result = await POSService.saveCartState({ ...data, agencyId })
                break
            default:
                return NextResponse.json({ success: false, error: "Acción no válida" }, { status: 400 })
        }

        return NextResponse.json({ success: true, data: result })
    } catch (error: any) {
        console.error("Error en API de POS:", error)
        return NextResponse.json({ success: false, error: error.message || "Error en el servidor" }, { status: 500 })
    }
}

export async function GET(req: NextRequest, { params }: { params: { agencyId: string } }) {
    try {
        const session = await getServerSession(authOptions)
        if (!session?.user) {
            return NextResponse.json({ success: false, error: "No autorizado" }, { status: 401 })
        }

        const { agencyId } = params
        const { searchParams } = new URL(req.url)
        const action = searchParams.get("action")
        const productId = searchParams.get("productId")
        const areaId = searchParams.get("areaId")
        const subAccountId = searchParams.get("subAccountId")
        const categoryId = searchParams.get("categoryId")
        const search = searchParams.get("search")

        let result
        switch (action) {
            case "get-product-price":
                if (!productId) {
                    return NextResponse.json({ success: false, error: "Se requiere productId" }, { status: 400 })
                }
                result = await POSService.getProductPriceWithDiscount(productId)
                break
            case "check-expiring-products":
                const daysThreshold = searchParams.get("daysThreshold")
                    ? Number.parseInt(searchParams.get("daysThreshold") as string)
                    : 30
                result = await POSService.checkExpiringProductsInPOS(agencyId, daysThreshold)
                break
            case "get-products-with-stock":
                result = await POSService.getProductsWithStock(agencyId, {
                    areaId: areaId || undefined,
                    subAccountId: subAccountId || undefined,
                    categoryId: categoryId || undefined,
                    search: search || undefined,
                })
                break
            case "get-saved-sales":
                result = await POSService.getSavedSales(agencyId, {
                    areaId: areaId || undefined,
                    subAccountId: subAccountId || undefined,
                })
                break
            default:
                return NextResponse.json({ success: false, error: "Acción no válida" }, { status: 400 })
        }

        return NextResponse.json({ success: true, data: result })
    } catch (error: any) {
        console.error("Error en API de POS:", error)
        return NextResponse.json({ success: false, error: error.message || "Error en el servidor" }, { status: 500 })
    }
}

export async function DELETE(req: NextRequest, { params }: { params: { agencyId: string } }) {
    try {
        const session = await getServerSession(authOptions)
        if (!session?.user) {
            return NextResponse.json({ success: false, error: "No autorizado" }, { status: 401 })
        }

        const { searchParams } = new URL(req.url)
        const id = searchParams.get("id")

        if (!id) {
            return NextResponse.json({ success: false, error: "Se requiere ID" }, { status: 400 })
        }

        // Eliminar venta guardada
        await POSService.deleteSavedSale(id)

        return NextResponse.json({ success: true })
    } catch (error: any) {
        console.error("Error en API de POS:", error)
        return NextResponse.json({ success: false, error: error.message || "Error en el servidor" }, { status: 500 })
    }
}
