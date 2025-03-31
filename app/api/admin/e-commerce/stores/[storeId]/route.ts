import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { connectToEcommerceDb as connectToDatabase } from '@/lib/e-commerce/database/mongodb';
import { updateStoreSchema, storeSettingsSchema } from '@/lib/e-commerce/store/validation';

/**
 * GET /api/admin/e-commerce/stores/[storeId]
 * Obtiene una tienda específica por su ID
 */
export async function GET(req: NextRequest, { params }: { params: { storeId: string } }) {
    try {
        // Verificar autenticación
        const { userId } = auth();
        if (!userId) {
            return NextResponse.json({ error: 'No autorizado' }, { status: 401 });
        }

        const { storeId } = params;

        // Conectar a la base de datos
        const db = await connectToDatabase();
        const storesCollection = db.collection('stores');

        // Obtener la tienda
        const store = await storesCollection.findOne({ _id: storeId });

        if (!store) {
            return NextResponse.json({ error: 'Tienda no encontrada' }, { status: 404 });
        }

        // Verificar que el usuario tiene acceso a esta tienda
        if (store.userId !== userId) {
            return NextResponse.json({ error: 'No autorizado para acceder a esta tienda' }, { status: 403 });
        }

        return NextResponse.json(store);
    } catch (error) {
        console.error('Error al obtener la tienda:', error);
        return NextResponse.json({
            error: 'Error al procesar la solicitud',
            details: error instanceof Error ? error.message : 'Error desconocido'
        }, { status: 500 });
    }
}

/**
 * PATCH /api/admin/e-commerce/stores/[storeId]
 * Actualiza una tienda existente
 */
export async function PATCH(req: NextRequest, { params }: { params: { storeId: string } }) {
    try {
        // Verificar autenticación
        const { userId } = auth();
        if (!userId) {
            return NextResponse.json({ error: 'No autorizado' }, { status: 401 });
        }

        const { storeId } = params;

        // Obtener los datos de la solicitud
        const data = await req.json();

        // Validar los datos de entrada
        try {
            updateStoreSchema.parse(data);
        } catch (validationError: any) {
            return NextResponse.json({
                error: 'Datos de entrada inválidos',
                details: validationError.errors
            }, { status: 400 });
        }

        // Conectar a la base de datos
        const db = await connectToDatabase();
        const storesCollection = db.collection('stores');

        // Verificar que la tienda existe
        const existingStore = await storesCollection.findOne({ _id: storeId });

        if (!existingStore) {
            return NextResponse.json({ error: 'Tienda no encontrada' }, { status: 404 });
        }

        // Verificar que el usuario tiene acceso a esta tienda
        if (existingStore.userId !== userId) {
            return NextResponse.json({ error: 'No autorizado para modificar esta tienda' }, { status: 403 });
        }

        // Si se está actualizando el nombre, verificar que no exista otra tienda con el mismo nombre
        if (data.name && data.name !== existingStore.name) {
            const storeWithSameName = await storesCollection.findOne({
                _id: { $ne: storeId },
                name: data.name,
                companyId: existingStore.companyId
            });

            if (storeWithSameName) {
                return NextResponse.json({
                    error: 'Ya existe otra tienda con este nombre para esta compañía'
                }, { status: 400 });
            }
        }

        // Actualizar la tienda
        await storesCollection.updateOne(
            { _id: storeId },
            {
                $set: {
                    ...data,
                    updatedAt: new Date(),
                }
            }
        );

        // Obtener la tienda actualizada
        const updatedStore = await storesCollection.findOne({ _id: storeId });

        return NextResponse.json(updatedStore);
    } catch (error) {
        console.error('Error al actualizar la tienda:', error);
        return NextResponse.json({
            error: 'Error al procesar la solicitud',
            details: error instanceof Error ? error.message : 'Error desconocido'
        }, { status: 500 });
    }
}

/**
 * DELETE /api/admin/e-commerce/stores/[storeId]
 * Elimina una tienda existente
 */
export async function DELETE(req: NextRequest, { params }: { params: { storeId: string } }) {
    try {
        // Verificar autenticación
        const { userId } = auth();
        if (!userId) {
            return NextResponse.json({ error: 'No autorizado' }, { status: 401 });
        }

        const { storeId } = params;

        // Conectar a la base de datos
        const db = await connectToDatabase();
        const storesCollection = db.collection('stores');

        // Verificar que la tienda existe
        const existingStore = await storesCollection.findOne({ _id: storeId });

        if (!existingStore) {
            return NextResponse.json({ error: 'Tienda no encontrada' }, { status: 404 });
        }

        // Verificar que el usuario tiene acceso a esta tienda
        if (existingStore.userId !== userId) {
            return NextResponse.json({ error: 'No autorizado para eliminar esta tienda' }, { status: 403 });
        }

        // Eliminar la tienda
        await storesCollection.deleteOne({ _id: storeId });

        // También se deberían eliminar los productos, pedidos y otros datos relacionados
        // Esto podría hacerse aquí o mediante un proceso asíncrono

        return NextResponse.json({ success: true });
    } catch (error) {
        console.error('Error al eliminar la tienda:', error);
        return NextResponse.json({
            error: 'Error al procesar la solicitud',
            details: error instanceof Error ? error.message : 'Error desconocido'
        }, { status: 500 });
    }
}