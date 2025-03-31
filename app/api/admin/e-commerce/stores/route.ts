import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { connectToEcommerceDb as connectToDatabase } from '@/lib/e-commerce/database/mongodb';
import { createStoreSchema } from '@/lib/e-commerce/store/validation';

/**
 * GET /api/admin/e-commerce/stores
 * Obtiene todas las tiendas del usuario o de una compañía específica
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
        const companyId = searchParams.get('companyId');

        // Conectar a la base de datos
        const db = await connectToDatabase();
        const storesCollection = db.collection('stores');

        // Construir la consulta
        const query: any = { userId };
        if (companyId) {
            query.companyId = companyId;
        }

        // Obtener las tiendas
        const stores = await storesCollection.find(query).toArray();

        return NextResponse.json(stores);
    } catch (error) {
        console.error('Error al obtener las tiendas:', error);
        return NextResponse.json({
            error: 'Error al procesar la solicitud',
            details: error instanceof Error ? error.message : 'Error desconocido'
        }, { status: 500 });
    }
}

/**
 * POST /api/admin/e-commerce/stores
 * Crea una nueva tienda
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
        try {
            createStoreSchema.parse(data);
        } catch (validationError: any) {
            return NextResponse.json({
                error: 'Datos de entrada inválidos',
                details: validationError.errors
            }, { status: 400 });
        }

        // Conectar a la base de datos
        const db = await connectToDatabase();
        const storesCollection = db.collection('stores');

        // Verificar si ya existe una tienda con el mismo nombre para esta compañía
        const existingStore = await storesCollection.findOne({
            name: data.name,
            companyId: data.companyId
        });

        if (existingStore) {
            return NextResponse.json({
                error: 'Ya existe una tienda con este nombre para esta compañía'
            }, { status: 400 });
        }

        // Crear la configuración por defecto
        const defaultSettings = {
            currency: 'COP',
            language: 'es-CO',
            paymentMethods: [
                {
                    id: 'paypal',
                    name: 'PayPal',
                    isEnabled: true,
                    config: {}
                }
            ],
            shippingOptions: [
                {
                    id: 'standard',
                    name: 'Envío Estándar',
                    price: 10000,
                    isEnabled: true,
                    estimatedDeliveryTime: '3-5 días hábiles'
                }
            ],
            taxSettings: {
                isEnabled: true,
                rate: 19, // IVA en Colombia
                includeInPrice: false
            },
            contactInfo: {
                email: '',
                phone: '',
                address: ''
            }
        };

        // Crear la nueva tienda
        const newStore = {
            ...data,
            userId,
            createdAt: new Date(),
            updatedAt: new Date(),
            isPublished: false,
            settings: defaultSettings
        };

        // Guardar la tienda
        const result = await storesCollection.insertOne(newStore);

        return NextResponse.json({
            ...newStore,
            _id: result.insertedId,
        }, { status: 201 });
    } catch (error) {
        console.error('Error al crear la tienda:', error);
        return NextResponse.json({
            error: 'Error al procesar la solicitud',
            details: error instanceof Error ? error.message : 'Error desconocido'
        }, { status: 500 });
    }
}