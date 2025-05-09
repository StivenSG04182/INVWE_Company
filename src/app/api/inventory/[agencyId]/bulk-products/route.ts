import { NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { getAuthUserDetails } from '@/lib/queries';

// Endpoint para la carga masiva de productos
export async function POST(
    req: Request,
    { params }: { params: { agencyId: string } }
) {
    try {
        const user = await getAuthUserDetails();
        if (!user) {
            return new NextResponse('No autorizado', { status: 401 });
        }

        const agencyId = params.agencyId;
        if (!agencyId) {
            return new NextResponse('ID de agencia no proporcionado', { status: 400 });
        }

        // Verificar que el usuario tenga acceso a la agencia
        const agency = await db.agency.findUnique({
            where: {
                id: agencyId,
                userId: user.id,
            },
        });

        if (!agency) {
            return new NextResponse('No autorizado', { status: 401 });
        }

        const { products } = await req.json();

        if (!products || !Array.isArray(products) || products.length === 0) {
            return new NextResponse('No se proporcionaron productos válidos', { status: 400 });
        }

        // Validar que todos los productos tengan los campos requeridos
        const invalidProducts = products.filter(p => !p.name || !p.sku || !p.price || !p.subaccountId);
        if (invalidProducts.length > 0) {
            return NextResponse.json(
                {
                    success: false,
                    error: 'Todos los productos deben tener nombre, SKU, precio y subaccountId'
                },
                { status: 400 }
            );
        }

        // Verificar que no haya SKUs duplicados
        const skus = products.map(p => p.sku);
        const uniqueSkus = new Set(skus);
        if (skus.length !== uniqueSkus.size) {
            return NextResponse.json(
                { success: false, error: 'Hay SKUs duplicados en la lista de productos' },
                { status: 400 }
            );
        }

        // Verificar que no existan SKUs duplicados en la base de datos
        const existingProducts = await db.product.findMany({
            where: {
                sku: { in: skus },
                agencyId,
            },
            select: { sku: true },
        });

        if (existingProducts.length > 0) {
            const existingSkus = existingProducts.map(p => p.sku);
            return NextResponse.json(
                {
                    success: false,
                    error: `Los siguientes SKUs ya existen: ${existingSkus.join(', ')}`
                },
                { status: 400 }
            );
        }

        // Crear los productos en la base de datos
        const createdProducts = await db.product.createMany({
            data: products.map(p => ({
                name: p.name,
                description: p.description || '',
                sku: p.sku,
                barcode: p.barcode || '',
                price: parseFloat(p.price.toString()),
                cost: p.cost ? parseFloat(p.cost.toString()) : null,
                minStock: p.minStock ? parseInt(p.minStock.toString()) : null,
                categoryId: p.categoryId || null,
                subaccountId: p.subaccountId,
                agencyId,
            })),
        });

        return NextResponse.json({
            success: true,
            message: `Se han creado ${products.length} productos exitosamente.`
        });
    } catch (error) {
        console.error('Error al crear productos en masa:', error);
        return new NextResponse('Error interno del servidor', { status: 500 });
    }
}