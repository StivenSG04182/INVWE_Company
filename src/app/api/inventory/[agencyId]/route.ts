import { NextRequest, NextResponse } from 'next/server';
import { getAuthUserDetails } from '@/lib/queries';
import { ProductService, AreaService, ProviderService, StockService, MovementService } from '@/lib/services/inventory-service';

// Función para verificar si el usuario tiene acceso a la agencia
async function hasAgencyAccess(agencyId: string) {
    const user = await getAuthUserDetails();
    if (!user) return false;

    // Verificar si el usuario tiene acceso a esta agencia
    return user.Agency?.id === agencyId;
}

// GET: Obtener datos de inventario (productos, áreas, proveedores, stock, movimientos)
export async function GET(req: NextRequest, { params }: { params: { agencyId: string } }) {
    try {
        const agencyId = params.agencyId;

        // Verificar acceso
        const hasAccess = await hasAgencyAccess(agencyId);
        if (!hasAccess) {
            return NextResponse.json({ success: false, error: 'No tienes acceso a esta agencia' }, { status: 403 });
        }

        // Obtener tipo de datos solicitados desde query params
        const url = new URL(req.url);
        const type = url.searchParams.get('type');

        let data;
        switch (type) {
            case 'products':
                data = await ProductService.getProducts(agencyId);
                break;
            case 'areas':
                data = await AreaService.getAreas(agencyId);
                break;
            case 'providers':
                data = await ProviderService.getProviders(agencyId);
                break;
            case 'stock':
                data = await StockService.getStocks(agencyId);
                break;
            case 'movements':
                data = await MovementService.getMovements(agencyId);
                break;
            default:
                return NextResponse.json({ success: false, error: 'Tipo de datos no válido' }, { status: 400 });
        }

        return NextResponse.json({ success: true, data });
    } catch (error: any) {
        console.error('Error en GET inventory:', error);
        return NextResponse.json({ success: false, error: error.message }, { status: 500 });
    }
}

// POST: Crear nuevos elementos (productos, áreas, proveedores, movimientos)
export async function POST(req: NextRequest, { params }: { params: { agencyId: string } }) {
    try {
        const agencyId = params.agencyId;

        // Verificar acceso
        const hasAccess = await hasAgencyAccess(agencyId);
        if (!hasAccess) {
            return NextResponse.json({ success: false, error: 'No tienes acceso a esta agencia' }, { status: 403 });
        }

        const body = await req.json();
        const { type, data } = body;

        // Agregar agencyId a los datos
        const dataWithAgencyId = { ...data, agencyId };

        let result;
        switch (type) {
            case 'product':
                result = await ProductService.createProduct(dataWithAgencyId);
                break;
            case 'area':
                result = await AreaService.createArea(dataWithAgencyId);
                break;
            case 'provider':
                result = await ProviderService.createProvider(dataWithAgencyId);
                break;
            case 'movement':
                // Para movimientos, también actualizamos el stock
                result = await MovementService.createMovement(dataWithAgencyId);

                // Actualizar stock según el tipo de movimiento
                const { productId, areaId, quantity, type: movementType } = dataWithAgencyId;
                const stockData = {
                    agencyId,
                    productId,
                    areaId,
                    quantity: movementType === 'entrada' ? quantity : -quantity,
                };

                await StockService.updateStock(stockData);
                break;
            default:
                return NextResponse.json({ success: false, error: 'Tipo de operación no válido' }, { status: 400 });
        }

        return NextResponse.json({ success: true, data: result });
    } catch (error: any) {
        console.error('Error en POST inventory:', error);
        return NextResponse.json({ success: false, error: error.message }, { status: 500 });
    }
}

// PUT: Actualizar elementos existentes
export async function PUT(req: NextRequest, { params }: { params: { agencyId: string } }) {
    try {
        const agencyId = params.agencyId;

        // Verificar acceso
        const hasAccess = await hasAgencyAccess(agencyId);
        if (!hasAccess) {
            return NextResponse.json({ success: false, error: 'No tienes acceso a esta agencia' }, { status: 403 });
        }

        const body = await req.json();
        const { type, id, data } = body;

        if (!id) {
            return NextResponse.json({ success: false, error: 'ID no proporcionado' }, { status: 400 });
        }

        // Verificar que el elemento pertenezca a esta agencia
        let existingItem;
        switch (type) {
            case 'product':
                existingItem = await ProductService.getProductById(agencyId, id);
                break;
            case 'area':
                existingItem = await AreaService.getAreaById(agencyId, id);
                break;
            case 'provider':
                existingItem = await ProviderService.getProviderById(agencyId, id);
                break;
            default:
                return NextResponse.json({ success: false, error: 'Tipo de operación no válido' }, { status: 400 });
        }

        if (!existingItem || existingItem.agencyId !== agencyId) {
            return NextResponse.json({ success: false, error: 'Elemento no encontrado o sin acceso' }, { status: 404 });
        }

        // Actualizar el elemento
        let result;
        switch (type) {
            case 'product':
                result = await ProductService.updateProduct(id, data);
                break;
            case 'area':
                result = await AreaService.updateArea(id, data);
                break;
            case 'provider':
                result = await ProviderService.updateProvider(id, data);
                break;
            default:
                return NextResponse.json({ success: false, error: 'Tipo de operación no válido' }, { status: 400 });
        }

        return NextResponse.json({ success: true, data: result });
    } catch (error: any) {
        console.error('Error en PUT inventory:', error);
        return NextResponse.json({ success: false, error: error.message }, { status: 500 });
    }
}

// DELETE: Eliminar elementos
export async function DELETE(req: NextRequest, { params }: { params: { agencyId: string } }) {
    try {
        const agencyId = params.agencyId;

        // Verificar acceso
        const hasAccess = await hasAgencyAccess(agencyId);
        if (!hasAccess) {
            return NextResponse.json({ success: false, error: 'No tienes acceso a esta agencia' }, { status: 403 });
        }

        const url = new URL(req.url);
        const type = url.searchParams.get('type');
        const id = url.searchParams.get('id');

        if (!id) {
            return NextResponse.json({ success: false, error: 'ID no proporcionado' }, { status: 400 });
        }

        // Verificar que el elemento pertenezca a esta agencia
        let existingItem;
        switch (type) {
            case 'product':
                existingItem = await ProductService.getProductById(agencyId, id);
                break;
            case 'area':
                existingItem = await AreaService.getAreaById(agencyId, id);
                break;
            case 'provider':
                existingItem = await ProviderService.getProviderById(agencyId, id);
                break;
            default:
                return NextResponse.json({ success: false, error: 'Tipo de operación no válido' }, { status: 400 });
        }

        if (!existingItem || existingItem.agencyId !== agencyId) {
            return NextResponse.json({ success: false, error: 'Elemento no encontrado o sin acceso' }, { status: 404 });
        }

        // Eliminar el elemento
        let result;
        switch (type) {
            case 'product':
                result = await ProductService.deleteProduct(id);
                break;
            case 'area':
                result = await AreaService.deleteArea(id);
                break;
            case 'provider':
                result = await ProviderService.deleteProvider(id);
                break;
            default:
                return NextResponse.json({ success: false, error: 'Tipo de operación no válido' }, { status: 400 });
        }

        return NextResponse.json({ success: true, data: result });
    } catch (error: any) {
        console.error('Error en DELETE inventory:', error);
        return NextResponse.json({ success: false, error: error.message }, { status: 500 });
    }
}