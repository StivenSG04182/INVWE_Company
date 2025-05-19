import { NextResponse } from "next/server"
import { db } from "@/lib/db"
import { getAuthUserDetails } from "@/lib/queries"

export async function GET(req: Request, { params }: { params: { agencyId: string } }) {
    console.log("API de productos - Iniciando solicitud GET")
    try {
        // Obtener detalles del usuario autenticado
        console.log("API de productos - Verificando autenticación del usuario")
        const user = await getAuthUserDetails()
        console.log("API de productos - Usuario autenticado:", user ? "Sí" : "No")
        if (!user) {
            console.log("API de productos - Error: Usuario no autenticado")
            return NextResponse.json({ error: "No autorizado" }, { status: 401 })
        }

        const { searchParams } = new URL(req.url)
        const categoryId = searchParams.get("categoryId")
        const search = searchParams.get("search")
        const areaId = searchParams.get("areaId")
        const subAccountId = searchParams.get("subAccountId")
        const agencyId = searchParams.get("agencyId")

        console.log("Parámetros de búsqueda:", { categoryId, search, areaId, subAccountId, agencyId })

        // Verificar que el usuario tenga acceso a la agencia
        console.log("API de productos - Verificando acceso a la agencia:", params.agencyId)
        const agency = await db.agency.findUnique({
            where: {
                id: params.agencyId,
            },
        })

        console.log("API de productos - Agencia encontrada:", agency ? "Sí" : "No")
        if (!agency) {
            console.log("API de productos - Error: Agencia no encontrada")
            return NextResponse.json({ error: "Agencia no encontrada" }, { status: 404 })
        }

        // Siempre usar el agencyId de los parámetros de ruta para garantizar consistencia
        // Esto asegura que los productos mostrados correspondan a la agencia correcta
        const queryAgencyId = params.agencyId

        console.log("Consultando productos para agencia ID:", queryAgencyId)

        // Construir la consulta base para productos de manera más simple
        const whereClause: any = {
            agencyId: queryAgencyId,
        }

        // Agregar filtros opcionales solo si están presentes
        if (subAccountId) {
            whereClause.subAccountId = subAccountId
        }

        if (categoryId && categoryId !== "Todos") {
            whereClause.categoryId = categoryId
        }

        if (search) {
            whereClause.OR = [
                { name: { contains: search, mode: "insensitive" } },
                { sku: { contains: search, mode: "insensitive" } },
                { description: { contains: search, mode: "insensitive" } },
            ]
        }

        // Por defecto, mostrar solo productos activos a menos que se especifique lo contrario
        whereClause.active = true

        // Configurar la inclusión de relaciones
        const includeClause: any = {
            Category: true,
        }

        // Incluir stocks con filtro por área si es necesario
        if (areaId) {
            includeClause.Stocks = {
                where: {
                    areaId: areaId,
                },
            }
        } else {
            includeClause.Stocks = true
        }

        console.log("API de productos - Ejecutando consulta con filtros:", JSON.stringify(whereClause))
        console.log("API de productos - Incluyendo relaciones:", JSON.stringify(includeClause))

        // Ejecutar la consulta con los filtros construidos
        const products = await db.product.findMany({
            where: whereClause,
            include: includeClause,
        })

        console.log(
            "API de productos - Resultado de la consulta:",
            products ? `${products.length} productos encontrados` : "Sin resultados",
        )

        console.log("Productos encontrados con filtros:", products.length)

        // Si no hay productos con los filtros aplicados, informar pero seguir con el proceso
        if (products.length === 0) {
            console.log("No se encontraron productos con los filtros aplicados")
        }

        console.log("API de productos - Transformando productos con información de stock")
        // Transformar los productos para incluir información de stock
        const transformedProducts = products.map((product) => {
            // Calcular el stock disponible basado en el área seleccionada
            let stock = 0

            // Verificar que Stocks exista antes de intentar reducirlo
            if (product.Stocks && Array.isArray(product.Stocks)) {
                stock = product.Stocks.reduce((sum, stockItem) => {
                    // Verificar que stockItem.quantity sea un número válido
                    const quantity = typeof stockItem.quantity === "number" ? stockItem.quantity : 0
                    return sum + quantity
                }, 0)
            }

            return {
                id: product.id,
                name: product.name,
                price: product.price ? product.price.toString() : "0",
                sku: product.sku || "",
                description: product.description || "",
                stock,
                categoryId: product.categoryId || null,
                categoryName: product.Category?.name || "Sin categoría",
                images: product.images || [],
                productImage: product.productImage || "",
            }
        })

        console.log("Productos transformados:", transformedProducts.length)

        console.log("API de productos - Enviando respuesta con", transformedProducts.length, "productos")
        // Asegurarse de que la respuesta tenga el formato correcto
        return NextResponse.json({
            success: true,
            data: transformedProducts,
        })
    } catch (error) {
        console.error("Error fetching products:", error)

        // Intentar proporcionar más información sobre el error para depuración
        const errorMessage = error instanceof Error ? error.message : "Error desconocido"
        const errorStack = error instanceof Error ? error.stack : ""

        console.error("Detalles del error:", errorMessage)
        console.error("Stack del error:", errorStack)

        return NextResponse.json(
            {
                error: "Error interno del servidor",
                message: errorMessage,
                success: false,
                data: [], // Devolver un array vacío para evitar errores en el frontend
            },
            { status: 500 },
        )
    }
}
