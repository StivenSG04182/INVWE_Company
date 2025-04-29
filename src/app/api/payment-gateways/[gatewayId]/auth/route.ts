import { NextRequest, NextResponse } from 'next/server';
import { getGatewayById, getGatewayAccessToken } from '../../payment-gateways';
import { db } from '@/lib/db';
import { PaymentGatewayAuthResponse } from '../../payment-gateway-types';

/**
 * Endpoint para autenticar una pasarela de pago mediante OAuth2
 * POST /api/payment-gateways/[gatewayId]/auth
 * Body: { code: string, agencyId: string }
 */
export async function POST(
    req: NextRequest,
    { params }: { params: { gatewayId: string } }
) {
    try {
        const { gatewayId } = params;
        const { code, agencyId } = await req.json();

        if (!code || !agencyId) {
            return NextResponse.json(
                { success: false, error: 'Se requiere el código de autorización y el ID de la agencia' },
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

        // Obtener el token de acceso
        const tokenResponse = await getGatewayAccessToken(code, gatewayId, agencyId);

        if (!tokenResponse || !tokenResponse.accessToken) {
            return NextResponse.json(
                { success: false, error: 'No se pudo obtener el token de acceso' },
                { status: 400 }
            );
        }

        // Calcular la fecha de expiración si se proporciona
        let expiresAt = null;
        if (tokenResponse.expiresIn) {
            expiresAt = new Date();
            expiresAt.setSeconds(expiresAt.getSeconds() + tokenResponse.expiresIn);
        }

        // Guardar o actualizar la conexión en la base de datos
        const connection = await db.paymentGatewayConnection.upsert({
            where: {
                agencyId_gatewayId: {
                    agencyId,
                    gatewayId,
                },
            },
            update: {
                status: 'connected',
                accessToken: tokenResponse.accessToken,
                refreshToken: tokenResponse.refreshToken || null,
                expiresAt: expiresAt,
                accountId: tokenResponse.accountId || null,
                metadata: tokenResponse.metadata || {},
                updatedAt: new Date(),
            },
            create: {
                gatewayId,
                agencyId,
                status: 'connected',
                accessToken: tokenResponse.accessToken,
                refreshToken: tokenResponse.refreshToken || null,
                expiresAt: expiresAt,
                accountId: tokenResponse.accountId || null,
                metadata: tokenResponse.metadata || {},
            },
        });

        // Preparar la respuesta
        const response: PaymentGatewayAuthResponse = {
            success: true,
            connection: {
                id: connection.id,
                gatewayId: connection.gatewayId,
                agencyId: connection.agencyId,
                accessToken: connection.accessToken || '',
                refreshToken: connection.refreshToken || undefined,
                expiresAt: connection.expiresAt || undefined,
                metadata: connection.metadata as Record<string, any> || undefined,
                createdAt: connection.createdAt,
                updatedAt: connection.updatedAt,
            },
        };

        return NextResponse.json(response);
    } catch (error) {
        console.error('Error authenticating payment gateway:', error);
        return NextResponse.json(
            { success: false, error: 'Error al autenticar la pasarela de pago' },
            { status: 500 }
        );
    }
}