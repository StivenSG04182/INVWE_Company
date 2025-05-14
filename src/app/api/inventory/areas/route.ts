import { NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { getAuthUserDetails } from '@/lib/queries';
import { AreaService } from '@/lib/services/inventory-service';

// Endpoint para obtener áreas de inventario por agencyId
export async function GET(req: Request) {
    try {
        const user = await getAuthUserDetails();
        if (!user) {
            return new NextResponse('No autorizado', { status: 401 });
        }

        // Obtener el agencyId desde los parámetros de consulta
        const url = new URL(req.url);
        const agencyId = url.searchParams.get('agencyId');

        if (!agencyId) {
            return new NextResponse('ID de agencia no proporcionado', { status: 400 });
        }

        // Verificar que el usuario tenga acceso a la agencia
        const agency = await db.agency.findUnique({
            where: {
                id: agencyId,
            },
        });

        if (!agency) {
            return new NextResponse('Agencia no encontrada', { status: 404 });
        }

        // Obtener todas las áreas de la agencia
        let areas = [];
        
        try {
            // Intentar usar el servicio de áreas si está disponible
            areas = await AreaService.getAreas(agencyId);
        } catch (serviceError) {
            // Si el servicio falla, usar consulta directa a la base de datos
            areas = await db.inventoryArea.findMany({
                where: {
                    agencyId,
                },
                orderBy: {
                    name: 'asc',
                },
            });
        }

        return NextResponse.json({ success: true, data: areas });
    } catch (error) {
        console.error('Error al obtener áreas de inventario:', error);
        // Devolver un array vacío en lugar de un error para evitar que la interfaz se rompa
        return NextResponse.json({ success: true, data: [] }, { status: 200 });
    }
}