import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { connectToEcommerceDb as connectToDatabase } from '@/lib/e-commerce/database/mongodb';
import { Template } from '@/lib/e-commerce/store/types';
import { validateTemplate } from '@/lib/e-commerce/templates/validator';
import { generateTemplate, getTemplatePresets } from '@/lib/e-commerce/templates/generator';

/**
 * GET /api/admin/e-commerce/templates
 * Obtiene todas las plantillas disponibles
 */
export async function GET(req: NextRequest) {
    try {
        // Verificar autenticación
        const { userId } = auth();
        if (!userId) {
            return NextResponse.json({ error: 'No autorizado' }, { status: 401 });
        }

        // Obtener parámetros de consulta
        const { searchParams } = new URL(req.url);
        const category = searchParams.get('category');
        const presetsOnly = searchParams.get('presetsOnly') === 'true';

        // Si solo se solicitan los presets predefinidos
        if (presetsOnly) {
            const presets = getTemplatePresets();
            return NextResponse.json(presets);
        }

        // Conectar a la base de datos
        const db = await connectToDatabase('e_commerce_INVWE');
        const templatesCollection = db.collection('ecommerce');

        // Construir la consulta
        const query: any = {};
        if (category) {
            query.category = category;
        }

        // Obtener las plantillas
        const templates = await templatesCollection.find(query).toArray();

        // Transformar datos para el frontend
        const transformed = templates.map(t => ({
            id: t._id.toString(),
            name: t.name || 'Plantilla sin nombre',
            description: t.description || '',
            previewUrl: t.previewUrl || '/default-template-preview.jpg',
            category: t.category || 'General'
        }));

        return NextResponse.json(transformed);
    } catch (error) {
        console.error('Error al obtener las plantillas:', error);
        return NextResponse.json({
            error: 'Error al procesar la solicitud',
            details: error instanceof Error ? error.message : 'Error desconocido'
        }, { status: 500 });
    }
}

/**
 * POST /api/admin/e-commerce/templates
 * Crea una nueva plantilla
 */
export async function POST(req: NextRequest) {
    try {
        // Verificar autenticación
        const { userId } = auth();
        if (!userId) {
            return NextResponse.json({ error: 'No autorizado' }, { status: 401 });
        }

        // Obtener los datos de la solicitud
        const data = await req.json();

        let template: Template;

        // Si se proporciona un preset, generar la plantilla a partir de él
        if (data.preset) {
            template = generateTemplate(data.preset);

            // Aplicar personalizaciones si se proporcionan
            if (data.name) template.name = data.name;
            if (data.description) template.description = data.description;
        } else {
            // Usar la plantilla proporcionada
            template = data.template;
        }

        // Validar la plantilla
        const validation = validateTemplate(template);
        if (!validation.isValid) {
            return NextResponse.json({
                error: 'La plantilla no es válida',
                details: validation.errors
            }, { status: 400 });
        }

        // Conectar a la base de datos
        const db = await connectToDatabase('e_commerce_INVWE');
        const templatesCollection = db.collection('ecommerce');

        // Guardar la plantilla
        const result = await templatesCollection.insertOne({
            ...template,
            userId,
            createdAt: new Date(),
            updatedAt: new Date(),
        });

        return NextResponse.json({
            ...template,
            _id: result.insertedId,
        }, { status: 201 });
    } catch (error) {
        console.error('Error al crear la plantilla:', error);
        return NextResponse.json({
            error: 'Error al procesar la solicitud',
            details: error instanceof Error ? error.message : 'Error desconocido'
        }, { status: 500 });
    }
}