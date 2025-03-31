import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { connectToEcommerceDb as connectToDatabase } from '@/lib/e-commerce/database/mongodb';
import { generateAITemplate, AITemplateGenerationOptions, generateAITemplatePreview } from '@/lib/e-commerce/ai/template-generator';
import { validateTemplate } from '@/lib/e-commerce/templates/validator';

/**
 * POST /api/admin/e-commerce/ai/generate-template
 * Genera una nueva plantilla utilizando IA
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
        if (!data.storeType) {
            return NextResponse.json({ error: 'Se requiere un tipo de tienda' }, { status: 400 });
        }

        // Configurar las opciones de generación
        const options: AITemplateGenerationOptions = {
            storeType: data.storeType,
            colorScheme: data.colorScheme || 'modern',
            style: data.style || 'modern',
            productFocus: data.productFocus || 'featured',
            targetAudience: data.targetAudience || 'general',
            brandPersonality: data.brandPersonality || 'professional',
            customInstructions: data.customInstructions,
        };

        // Si solo se solicita una vista previa, devolver una versión simplificada
        if (data.previewOnly === true) {
            const preview = generateAITemplatePreview(options);
            return NextResponse.json(preview);
        }

        // Generar la plantilla completa
        const template = await generateAITemplate(options);

        // Validar la plantilla generada
        const validation = validateTemplate(template);
        if (!validation.isValid) {
            return NextResponse.json({
                error: 'La plantilla generada no es válida',
                details: validation.errors
            }, { status: 400 });
        }

        // Si se solicita guardar la plantilla
        if (data.save === true) {
            // Conectar a la base de datos
            const db = await connectToDatabase();
            const templatesCollection = db.collection('templates');

            // Guardar la plantilla en la base de datos
            const result = await templatesCollection.insertOne({
                ...template,
                userId,
                createdAt: new Date(),
                updatedAt: new Date(),
            });

            return NextResponse.json({
                ...template,
                _id: result.insertedId,
                saved: true,
            });
        }

        // Devolver la plantilla generada sin guardar
        return NextResponse.json(template);
    } catch (error) {
        console.error('Error al generar la plantilla:', error);
        return NextResponse.json({
            error: 'Error al procesar la solicitud',
            details: error instanceof Error ? error.message : 'Error desconocido'
        }, { status: 500 });
    }
}

/**
 * GET /api/admin/e-commerce/ai/generate-template
 * Obtiene las opciones disponibles para la generación de plantillas
 */
export async function GET(req: NextRequest) {
    try {
        // Verificar autenticación
        const { userId } = auth();
        if (!userId) {
            return NextResponse.json({ error: 'No autorizado' }, { status: 401 });
        }

        // Devolver las opciones disponibles para la generación de plantillas
        return NextResponse.json({
            storeTypes: [
                { id: 'general', name: 'General' },
                { id: 'fashion', name: 'Moda' },
                { id: 'electronics', name: 'Electrónica' },
                { id: 'home', name: 'Hogar' },
                { id: 'beauty', name: 'Belleza' },
                { id: 'food', name: 'Alimentos' },
            ],
            colorSchemes: [
                { id: 'modern', name: 'Moderno' },
                { id: 'dark', name: 'Oscuro' },
                { id: 'earthy', name: 'Terroso' },
                { id: 'luxury', name: 'Lujo' },
                { id: 'vibrant', name: 'Vibrante' },
                { id: 'minimal', name: 'Minimalista' },
            ],
            styles: [
                { id: 'modern', name: 'Moderno' },
                { id: 'elegant', name: 'Elegante' },
                { id: 'playful', name: 'Divertido' },
                { id: 'minimal', name: 'Minimalista' },
                { id: 'bold', name: 'Audaz' },
            ],
            productFocus: [
                { id: 'featured', name: 'Destacados' },
                { id: 'new', name: 'Nuevos' },
                { id: 'bestsellers', name: 'Más vendidos' },
            ],
            targetAudience: [
                { id: 'general', name: 'General' },
                { id: 'youth', name: 'Jóvenes' },
                { id: 'adults', name: 'Adultos' },
                { id: 'seniors', name: 'Adultos mayores' },
                { id: 'luxury', name: 'Compradores de lujo' },
                { id: 'budget', name: 'Compradores económicos' },
            ],
            brandPersonality: [
                { id: 'professional', name: 'Profesional' },
                { id: 'friendly', name: 'Amigable' },
                { id: 'luxury', name: 'Lujo' },
                { id: 'innovative', name: 'Innovador' },
                { id: 'playful', name: 'Divertido' },
            ],
        });
    } catch (error) {
        console.error('Error al obtener opciones de generación:', error);
        return NextResponse.json({
            error: 'Error al procesar la solicitud',
            details: error instanceof Error ? error.message : 'Error desconocido'
        }, { status: 500 });
    }
}