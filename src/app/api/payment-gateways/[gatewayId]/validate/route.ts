import { NextRequest, NextResponse } from 'next/server';
import { getGatewayById } from '../../payment-gateways';
import { db } from '@/lib/db';
import { PaymentGatewayValidationResponse } from '../../payment-gateway-types';

/**
 * Endpoint para validar la conexión de una pasarela de pago
 * GET /api/payment-gateways/[gatewayId]/validate?agencyId=[agencyId]
 */
export async function GET(
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

        // Si no hay conexión, devolver que no está conectada
        if (!connection) {
            const response: PaymentGatewayValidationResponse = {
                success: true,
                isConnected: false,
                merchantStatus: 'disconnected',
            };
            return NextResponse.json(response);
        }

        // Verificar si el token ha expirado
        const isExpired = connection.expiresAt ? new Date() > connection.expiresAt : false;

        // Preparar la respuesta
        const response: PaymentGatewayValidationResponse = {
            success: true,
            isConnected: !isExpired && connection.status === 'connected',
            merchantStatus: connection.status,
            metadata: connection.metadata as Record<string, any> || {},
        };

        return NextResponse.json(response);
    } catch (error) {
        console.error('Error validating payment gateway:', error);
        return NextResponse.json(
            { success: false, error: 'Error al validar la pasarela de pago' },
            { status: 500 }
        );
    }
}