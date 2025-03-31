import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { connectToEcommerceDb } from '@/lib/e-commerce/database/mongodb';
import { validateTemplate } from '@/lib/e-commerce/templates/validator';

/**
 * GET /api/admin/e-commerce/templates/[templateId]
 * Obtiene una plantilla específica por su ID
 */
export async function GET(req: NextRequest, { params }: { params: { templateId: string } }) {
    try {
        // Verificar autenticación
        const { userId } = auth();
        if (!userId) {
            return NextResponse.json({ error: 'No autorizado' }, { status: 401 });
        }

        const { templateId } = params;

        // Conectar a la base de datos
        const db = await connectToDatabase();
        const templatesCollection = db.collection('templates');

        // Obtener la plantilla
        const template = await templatesCollection.findOne({ _id: templateId });

        if (!template) {
            return NextResponse.json({ error: 'Plantilla no encontrada' }, { status: 404 });
        }

        return NextResponse.json(template);
    } catch (error) {
        console.error('Error al obtener la plantilla:', error);
        return NextResponse.json({
            error: 'Error al procesar la solicitud',
            details: error instanceof Error ? error.message : 'Error desconocido'
        }, { status: 500 });
    }
}

/**
 * PATCH /api/admin/e-commerce/templates/[templateId]
 * Actualiza una plantilla existente
 */
export async function PATCH(req: NextRequest, { params }: { params: { templateId: string } }) {
    try {
        // Verificar autenticación
        const { userId } = auth();
        if (!userId) {
            return NextResponse.json({ error: 'No autorizado' }, { status: 401 });
        }

        const { templateId } = params;

        // Obtener los datos de la solicitud
        const data = await req.json();

        // Conectar a la base de datos
        const db = await connectToDatabase();
        const templatesCollection = db.collection('templates');

        // Verificar que la plantilla existe
        const existingTemplate = await templatesCollection.findOne({ _id: templateId });

        if (!existingTemplate) {
            return NextResponse.json({ error: 'Plantilla no encontrada' }, { status: 404 });
        }

        // Crear la plantilla actualizada
        const updatedTemplate = {
            ...existingTemplate,
            ...data,
            updatedAt: new Date(),
        };

        // Validar la plantilla actualizada
        const validation = validateTemplate(updatedTemplate);
        if (!validation.isValid) {
            return NextResponse.json({
                error: 'La plantilla actualizada no es válida',
                details: validation.errors
            }, { status: 400 });
        }

        // Actualizar la plantilla
        await templatesCollection.updateOne(
            { _id: templateId },
            {
                $set: {
                    ...data,
                    updatedAt: new Date(),
                }
            }
        );

        return NextResponse.json(updatedTemplate);
    } catch (error) {
        console.error('Error al actualizar la plantilla:', error);
        return NextResponse.json({
            error: 'Error al procesar la solicitud',
            details: error instanceof Error ? error.message : 'Error desconocido'
        }, { status: 500 });
    }
}

/**
 * DELETE /api/admin/e-commerce/templates/[templateId]
 * Elimina una plantilla existente
 */
export async function DELETE(req: NextRequest, { params }: { params: { templateId: string } }) {
    try {
        // Verificar autenticación
        const { userId } = auth();
        if (!userId) {
            return NextResponse.json({ error: 'No autorizado' }, { status: 401 });
        }

        const { templateId } = params;

        // Conectar a la base de datos
        const db = await connectToDatabase();
        const templatesCollection = db.collection('templates');

        // Verificar que la plantilla existe
        const existingTemplate = await templatesCollection.findOne({ _id: templateId });

        if (!existingTemplate) {
            return NextResponse.json({ error: 'Plantilla no encontrada' }, { status: 404 });
        }

        // Verificar si la plantilla es predeterminada
        if (existingTemplate.isDefault) {
            return NextResponse.json({
                error: 'No se puede eliminar una plantilla predeterminada'
            }, { status: 400 });
        }

        // Verificar si la plantilla está en uso
        const storesCollection = db.collection('stores');
        const storeUsingTemplate = await storesCollection.findOne({ templateId });

        if (storeUsingTemplate) {
            return NextResponse.json({
                error: 'No se puede eliminar una plantilla que está en uso',
                storeId: storeUsingTemplate._id,
                storeName: storeUsingTemplate.name
            }, { status: 400 });
        }

        // Eliminar la plantilla
        await templatesCollection.deleteOne({ _id: templateId });

        return NextResponse.json({ success: true });
    } catch (error) {
        console.error('Error al eliminar la plantilla:', error);
        return NextResponse.json({
            error: 'Error al procesar la solicitud',
            details: error instanceof Error ? error.message : 'Error desconocido'
        }, { status: 500 });
    }
}