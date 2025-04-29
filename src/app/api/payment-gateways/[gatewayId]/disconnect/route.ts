import { NextRequest, NextResponse } from 'next/server';
import { getGatewayById } from '../../payment-gateways';
import { db } from '@/lib/db';

/**
 * Endpoint para desconectar una pasarela de pago
 * DELETE /api/payment-gateways/[gatewayId]/disconnect?agencyId=[agencyId]
 */
export async function DELETE(
    req: NextRequest,
    { params }: { params: { gatewayId: string } }
) {
    try {
        const { gatewayId } = params;
        const searchParams = req.nextUrl.searchParams;
        const agencyId = searchParams.get('agencyId');

        if (!agencyId) {
            return NextResponse.json(
                { success: false, error: 'Se requiere el ID de la agencia' },
                { status: 400 }
            );
        }

        // Verificar si la pasarela existe
        const gateway = getGatewayById(gatewayId);
        if (!gateway) {
            return NextResponse.json(
                { success: false, error: 'Pasarela de pago no encontrada' },
                { status: 404 }
            );
        }

        // Buscar la conexión en la base de datos
        const connection = await db.paymentGatewayConnection.findUnique({
            where: {
                agencyId_gatewayId: {
                    agencyId,
                    gatewayId,
                },
            },
        });

        // Si no hay conexión, devolver éxito (ya está desconectada)
        if (!connection) {
            return NextResponse.json({ success: true, message: 'La pasarela ya estaba desconectada' });
        }

        // Actualizar el estado de la conexión a 'disconnected'
        await db.paymentGatewayConnection.update({
            where: {
                id: connection.id,
            },
            data: {
                status: 'disconnected',
                updatedAt: new Date(),
            },
        });

        return NextResponse.json({
            success: true,
            message: 'Pasarela de pago desconectada correctamente',
        });
    } catch (error) {
        console.error('Error desconectando pasarela de pago:', error);
        return NextResponse.json(
            { success: false, error: 'Error al desconectar la pasarela de pago' },
            { status: 500 }
        );
    }
}