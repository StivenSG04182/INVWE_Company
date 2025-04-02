import { NextResponse } from 'next/server'
import { auth } from '@clerk/nextjs/server'
import { connectToEcommerceDb } from '@/lib/e-commerce/database/mongodb'

type TemplateData = {
    name: string
    description: string
    type: string
    files?: Record<string, string>
    dependencies?: Record<string, string>
}

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017'
const DB_NAME = 'e_commerce_INVWE'
const COLLECTION_NAME = 'theme_ecommerce'

export async function POST(request: Request) {
    let body: TemplateData = {} as TemplateData;
    try {
        console.log('[CREATE ECOMMERCE] Iniciando procesamiento de solicitud');
        
        try {
            body = await request.json();
        } catch (e) {
            return NextResponse.json(
                { error: 'Cuerpo de solicitud inválido', details: 'El JSON proporcionado es incorrecto' },
                { status: 400 }
            );
        }

        const { userId } = auth();
        if (!userId) {
            return NextResponse.json({ error: 'No autorizado' }, { status: 401 });
        }

        console.log('Cuerpo recibido:', JSON.stringify(body, null, 2))

        // Validar campos requeridos
        if (!body.name?.trim() || !body.description?.trim() || !body.type?.trim()) {
            return NextResponse.json(
                {
                    error: 'Campos requeridos faltantes',
                    details: 'Debe proporcionar nombre, descripción y tipo de plantilla'
                },
                { status: 400 }
            )
        }

        console.log('Conectando a MongoDB:', MONGODB_URI)
        const db = await connectToEcommerceDb()
        console.log('Base de datos conectada:', db.databaseName)
        const collection = db.collection('ecommerce')
        console.log('Colección accedida:', collection.collectionName)
        console.log('Estadísticas de conexión:', await db.stats())

        const newTemplate = {
            name: body.name.trim(),
            description: body.description.trim(),
            type: body.type.trim(),
            files: body.files || {},
            dependencies: body.dependencies || {},
            createdAt: new Date(),
            updatedAt: new Date(),
            status: 'draft' as const
        }

        console.log('Insertando documento:', newTemplate)
        const result = await collection.insertOne(newTemplate)
        console.log('Insert result:', result)

        return NextResponse.json({
            ...newTemplate,
            _id: result.insertedId,
            userId
        }, { status: 201 })

    } catch (error) {
        console.error('Error crítico en endpoint:', {
            timestamp: new Date().toISOString(),
            error: error instanceof Error ? {
                name: error.name,
                message: error.message,
                stack: error.stack
            } : error,
            body: body,
            mongoConnection: {
                uri: MONGODB_URI,
                dbName: DB_NAME,
                collection: 'ecommerce'
            }
        })
        return NextResponse.json(
            {
                error: 'Error de servidor',
                details: error instanceof Error ? error.message : 'Error desconocido',
                code: 'DATABASE_SAVE_ERROR',
            collection: 'ecommerce'
            },
            { status: 500 }
        )
    }
}