import { type NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { SearchService, type SearchFilter } from "@/lib/services/search-service"

export async function GET(req: NextRequest, { params }: { params: { agencyId: string } }) {
    try {
        const session = await getServerSession(authOptions)
        if (!session?.user) {
            return NextResponse.json({ success: false, error: "No autorizado" }, { status: 401 })
        }

        const { agencyId } = params
        const { searchParams } = new URL(req.url)

        // Determinar el tipo de búsqueda
        const searchType = searchParams.get("type") || "advanced"

        if (searchType === "barcode") {
            const barcode = searchParams.get("barcode")
            if (!barcode) {
                return NextResponse.json({ success: false, error: "Se requiere código de barras" }, { status: 400 })
            }

            const product = await SearchService.searchByBarcode(agencyId, barcode)
            return NextResponse.json({ success: true, data: product })
        } else if (searchType === "tags") {
            const tagsParam = searchParams.get("tags")
            if (!tagsParam) {
                return NextResponse.json({ success: false, error: "Se requieren etiquetas" }, { status: 400 })
            }

            const tags = tagsParam.split(",")
            const results = await SearchService.searchByTags(agencyId, tags)
            return NextResponse.json({ success: true, data: results })
        } else if (searchType === "suggest") {
            const query = searchParams.get("query")
            if (!query) {
                return NextResponse.json({ success: false, error: "Se requiere consulta" }, { status: 400 })
            }

            const limit = searchParams.get("limit") ? Number.parseInt(searchParams.get("limit")) : 5
            const suggestions = await SearchService.suggestSearchTerms(agencyId, query, limit)
            return NextResponse.json({ success: true, data: suggestions })
        } else {
            // Búsqueda avanzada
            const filter: SearchFilter = {}

            // Aplicar filtros de búsqueda
            if (searchParams.get("query")) filter.query = searchParams.get("query")
            if (searchParams.get("categoryId")) filter.categoryId = searchParams.get("categoryId")
            if (searchParams.get("minPrice")) filter.minPrice = Number.parseFloat(searchParams.get("minPrice"))
            if (searchParams.get("maxPrice")) filter.maxPrice = Number.parseFloat(searchParams.get("maxPrice"))
            if (searchParams.get("inStock") === "true") filter.inStock = true
            if (searchParams.get("hasDiscount") === "true") filter.hasDiscount = true
            if (searchParams.get("isExpiring") === "true") filter.isExpiring = true
            if (searchParams.get("tags")) filter.tags = searchParams.get("tags").split(",")

            // Aplicar ordenamiento
            if (searchParams.get("sortBy")) filter.sortBy = searchParams.get("sortBy") as any
            if (searchParams.get("sortOrder")) filter.sortOrder = searchParams.get("sortOrder") as any

            // Aplicar paginación
            if (searchParams.get("limit")) filter.limit = Number.parseInt(searchParams.get("limit"))
            if (searchParams.get("offset")) filter.offset = Number.parseInt(searchParams.get("offset"))

            const results = await SearchService.searchProducts(agencyId, filter)
            return NextResponse.json({ success: true, data: results })
        }
    } catch (error: any) {
        console.error("Error en búsqueda:", error)
        return NextResponse.json({ success: false, error: error.message || "Error en el servidor" }, { status: 500 })
    }
}
