import { NextResponse } from "next/server"
import { db } from "@/lib/db"
import { getAuthUserDetails } from "@/lib/queries"

export async function POST(req: Request) {
    try {
        const user = await getAuthUserDetails()
        if (!user) {
            return NextResponse.json({ error: "No autorizado" }, { status: 401 })
        }

        const body = await req.json()
        const { name, sku, description, price, cost, minStock, categoryId, agencyId, subAccountId, active } = body

        // Validar datos requeridos
        if (!name || !sku || !price || !agencyId) {
            return NextResponse.json({ error: "Faltan campos requeridos", success: false }, { status: 400 })
        }

        // Verificar que el usuario tenga acceso a la agencia
        const agency = await db.agency.findUnique({
            where: {
                id: agencyId,
            },
        })

        if (!agency) {
            return NextResponse.json({ error: "Agencia no encontrada", success: false }, { status: 404 })
        }

        // Crear el producto en Prisma
        const product = await db.product.create({
            data: {
                name,
                sku,
                description: description || "",
                price: Number.parseFloat(price),
                cost: cost ? Number.parseFloat(cost) : null,
                minStock: minStock ? Number.parseInt(minStock) : null,
                categoryId: categoryId !== "defaultCategory" ? categoryId : null,
                agencyId,
                subAccountId: subAccountId || null,
                active: active !== false,
            },
        })

        // Si se especificó un área, crear un stock inicial en Prisma
        if (body.areaId && body.quantity) {
            await db.stock.create({
                data: {
                    productId: product.id,
                    areaId: body.areaId,
                    quantity: Number.parseInt(body.quantity),
                    agencyId,
                    subAccountId: subAccountId || null,
                },
            })
        }

        console.log("Producto creado:", product)

        return NextResponse.json({
            success: true,
            data: product,
        })
    } catch (error) {
        console.error("Error creating product:", error)
        return NextResponse.json({ error: "Error interno del servidor", success: false }, { status: 500 })
    }
}

export async function GET(req: Request) {
    try {
        const user = await getAuthUserDetails()
        if (!user) {
            return NextResponse.json({ error: "No autorizado" }, { status: 401 })
        }

        const { searchParams } = new URL(req.url)
        const agencyId = searchParams.get("agencyId")
        const subAccountId = searchParams.get("subAccountId")
        const categoryId = searchParams.get("categoryId")
        const search = searchParams.get("search")

        if (!agencyId) {
            return NextResponse.json({ error: "Se requiere el ID de la agencia", success: false }, { status: 400 })
        }

        // Construir filtro para la consulta
        const whereClause: any = {
            agencyId: agencyId,
            active: true,
        }

        // Agregar filtros opcionales
        if (subAccountId) {
            whereClause.subAccountId = subAccountId
        }

        if (categoryId && categoryId !== "Todos" && categoryId !== "defaultCategory") {
            whereClause.categoryId = categoryId
        }

        if (search) {
            whereClause.OR = [
                { name: { contains: search, mode: "insensitive" } },
                { sku: { contains: search, mode: "insensitive" } },
                { description: { contains: search, mode: "insensitive" } },
            ]
        }

        console.log("Consultando productos con filtros:", whereClause)

        // Obtener productos
        const products = await db.product.findMany({
            where: whereClause,
            include: {
                Category: true,
                Movements: true,
            },
            orderBy: {
                name: "asc",
            },
        })

        console.log(`Encontrados ${products.length} productos en Prisma`)

        let transformedProducts = [];
        
        // Si no hay productos en Prisma, intentar buscar en MongoDB
        if (products.length === 0) {
            try {
                const { connectToDatabase } = await import('@/lib/mongodb');
                const { db: mongodb } = await connectToDatabase();
                
                // Construir filtro para MongoDB
                const mongoFilter: any = {
                    agencyId: agencyId,
                    active: true,
                };
                
                if (subAccountId) {
                    // Corregir: usar el mismo nombre de parámetro que se envía desde el cliente
                    mongoFilter.subaccountId = subAccountId; // Nota: en MongoDB es 'subaccountId' (minúscula)
                    console.log("Buscando productos con subaccountId:", subAccountId);
                }
                
                if (categoryId && categoryId !== "Todos" && categoryId !== "defaultCategory") {
                    mongoFilter.categoryId = categoryId;
                }
                
                if (search) {
                    mongoFilter.$or = [
                        { name: { $regex: search, $options: 'i' } },
                        { sku: { $regex: search, $options: 'i' } },
                        { description: { $regex: search, $options: 'i' } },
                    ];
                }
                
                console.log("Consultando productos en MongoDB con filtros:", mongoFilter);
                
                // Obtener productos de MongoDB
                const mongoProducts = await mongodb.collection('products').find(mongoFilter).toArray();
                console.log(`Encontrados ${mongoProducts.length} productos en MongoDB`);
                
                // Transformar productos de MongoDB
                transformedProducts = mongoProducts.map((product: any) => {
                    return {
                        id: product._id.toString(),
                        name: product.name,
                        price: product.price.toString(),
                        sku: product.sku,
                        description: product.description || "",
                        stock: product.quantity || 0,
                        categoryId: product.categoryId,
                        categoryName: "Sin categoría", // No tenemos acceso a la categoría en esta consulta
                        images: product.images || [],
                        productImage: product.productImage || "",
                    };
                });
            } catch (mongoError) {
            }
        } else {
            // Transformar los productos de Prisma para incluir información de stock
            transformedProducts = products.map((product) => {
                // Calcular el stock disponible basado en movimientos
                let stock = 0
                if (product.Movements && Array.isArray(product.Movements)) {
                    stock = product.Movements.reduce((sum, movement) => {
                        if (movement.type === 'ENTRADA') return sum + movement.quantity
                        if (movement.type === 'SALIDA') return sum - movement.quantity
                        return sum
                    }, 0)
                }

                return {
                    id: product.id,
                    name: product.name,
                    price: product.price.toString(),
                    sku: product.sku,
                    description: product.description || "",
                    stock,
                    categoryId: product.categoryId,
                    categoryName: product.Category?.name || "Sin categoría",
                    images: product.images || [],
                    productImage: product.productImage || "",
                }
            })
        }

        return NextResponse.json({
            success: true,
            data: transformedProducts,
        })
    } catch (error) {
        console.error("Error fetching products:", error)
        return NextResponse.json({ error: "Error interno del servidor", success: false, data: [] }, { status: 500 })
    }
}
