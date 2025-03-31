import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { connectToEcommerceDb as connectToDatabase } from '@/lib/e-commerce/database/mongodb';
import { applyCustomDesign, DesignCustomizationOptions } from '@/lib/e-commerce/ai/design-processor';
import { validateTemplate } from '@/lib/e-commerce/templates/validator';

/**
 * POST /api/admin/e-commerce/ai/customize
 * Personaliza una plantilla existente
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

        // Validar los datos de entrada
        if (!data.templateId && !data.template) {
            return NextResponse.json({
                error: 'Se requiere un templateId o un objeto template completo'
            }, { status: 400 });
        }

        if (!data.customization) {
            return NextResponse.json({
                error: 'Se requieren opciones de personalización'
            }, { status: 400 });
        }

        let template;

        // Si se proporciona un ID de plantilla, obtenerla de la base de datos
        if (data.templateId) {
            // Conectar a la base de datos
            const db = await connectToDatabase();
            const templatesCollection = db.collection('templates');

            // Obtener la plantilla
            template = await templatesCollection.findOne({ _id: data.templateId });

            if (!template) {
                return NextResponse.json({ error: 'Plantilla no encontrada' }, { status: 404 });
            }
        } else {
            // Usar la plantilla proporcionada
            template = data.template;
        }

        // Aplicar las personalizaciones
        const customizationOptions: DesignCustomizationOptions = data.customization;
        const customizedTemplate = applyCustomDesign(template, customizationOptions);

        // Validar la plantilla personalizada
        const validation = validateTemplate(customizedTemplate);
        if (!validation.isValid) {
            return NextResponse.json({
                error: 'La plantilla personalizada no es válida',
                details: validation.errors
            }, { status: 400 });
        }

        // Si se solicita guardar la plantilla personalizada
        if (data.save === true) {
            // Conectar a la base de datos
            const db = await connectToDatabase();
            const templatesCollection = db.collection('templates');

            // Determinar si crear una nueva plantilla o actualizar la existente
            if (data.createNew === true) {
                // Crear una nueva plantilla basada en la personalizada
                const newTemplate = {
                    ...customizedTemplate,
                    id: `template_${Date.now()}`,
                    name: data.name || `${customizedTemplate.name} (Personalizada)`,
                    createdAt: new Date(),
                    updatedAt: new Date()
                };

                // Guardar la nueva plantilla
                const result = await templatesCollection.insertOne(newTemplate);

                return NextResponse.json({
                    ...newTemplate,
                    _id: result.insertedId,
                    saved: true,
                    isNew: true
                });
            } else if (data.templateId) {
                // Actualizar la plantilla existente
                await templatesCollection.updateOne(
                    { _id: data.templateId },
                    {
                        $set: {
                            ...customizedTemplate,
                            updatedAt: new Date()
                        }
                    }
                );

                return NextResponse.json({
                    ...customizedTemplate,
                    saved: true,
                    isNew: false
                });
            }
        }

        // Devolver la plantilla personalizada sin guardar
        return NextResponse.json(customizedTemplate);
    } catch (error) {
        console.error('Error al personalizar la plantilla:', error);
        return NextResponse.json({
            error: 'Error al procesar la solicitud',
            details: error instanceof Error ? error.message : 'Error desconocido'
        }, { status: 500 });
    }
}