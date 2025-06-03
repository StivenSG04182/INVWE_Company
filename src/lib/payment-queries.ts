"use server";

import { db } from "./db";
import { revalidatePath } from 'next/cache';
import { PaymentGatewayConnection } from "@prisma/client";

// Crear o actualizar conexión de pasarela
export const upsertPaymentGateway = async (
    agencyId: string,
    gatewayData: Partial<PaymentGatewayConnection>
) => {
    try {
        const response = await db.paymentGatewayConnection.upsert({
            where: {
                agencyId_gatewayId: {
                    agencyId,
                    gatewayId: gatewayData.gatewayId!
                }
            },
            update: gatewayData,
            create: {
                ...gatewayData,
                agencyId,
                gatewayId: gatewayData.gatewayId!,
                status: gatewayData.status || 'PENDING'
            }
        });

        revalidatePath(`/agency/${agencyId}/settings/launchpad`);
        return response;
    } catch (error) {
        console.error('Error en upsertPaymentGateway:', error);
        throw error;
    }
}

// Obtener conexión de pasarela
export async function getPaymentGateway(agencyId: string, gatewayId: string) {
    try {
        return await db.paymentGatewayConnection.findUnique({
            where: {
                agencyId_gatewayId: {
                    gatewayId,
                    agencyId
                }
            }
        })
    } catch (error) {
        console.error('Error en getPaymentGateway:', error)
        throw error
    }
}

// Actualizar tokens de acceso
export const updatePaymentGatewayTokens = async (
    agencyId: string,
    gatewayId: string,
    tokens: {
        accessToken: string;
        refreshToken?: string;
        expiresAt?: Date;
    }
) => {
    try {
        const response = await db.paymentGatewayConnection.update({
            where: {
                agencyId_gatewayId: {
                    agencyId,
                    gatewayId
                }
            },
            data: {
                accessToken: tokens.accessToken,
                refreshToken: tokens.refreshToken,
                expiresAt: tokens.expiresAt,
            }
        });
        return response;
    } catch (error) {
        console.error('Error en updatePaymentGatewayTokens:', error);
        throw error;
    }
}

// Eliminar conexión de pasarela
export const deletePaymentGateway = async (agencyId: string, gatewayId: string) => {
    try {
        const response = await db.paymentGatewayConnection.delete({
            where: {
                agencyId_gatewayId: {
                    agencyId,
                    gatewayId
                }
            }
        });

        revalidatePath(`/agency/${agencyId}/settings/launchpad`);
        return response;
    } catch (error) {
        console.error('Error en deletePaymentGateway:', error);
        throw error;
    }
}

// Verificar estado de conexión
export const verifyPaymentGatewayStatus = async (agencyId: string, gatewayId: string) => {
    try {
        const connection = await db.paymentGatewayConnection.findUnique({
            where: {
                agencyId_gatewayId: {
                    agencyId,
                    gatewayId
                }
            },
            select: {
                status: true,
                accessToken: true,
                expiresAt: true
            }
        });

        if (!connection) {
            return {
                isConnected: false,
                status: 'NOT_CONNECTED',
                needsReauth: false
            };
        }

        const needsReauth = connection.expiresAt ? new Date() > connection.expiresAt : false;

        return {
            isConnected: connection.status === 'ACTIVE' && !needsReauth,
            status: connection.status,
            needsReauth
        };
    } catch (error) {
        console.error('Error en verifyPaymentGatewayStatus:', error);
        return {
            isConnected: false,
            status: 'ERROR',
            needsReauth: false
        };
    }
}

// Obtener conexión de pasarela específica (ejemplo con PayPal)
export const getPaypalConnection = async (agencyId: string) => {
    try {
        const response = await db.paymentGatewayConnection.findUnique({
            where: {
                agencyId_gatewayId: {
                    gatewayId: "paypal",
                    agencyId: agencyId // Este valor falta
                }
            }
        });
        return response;
    } catch (error) {
        console.error('Error en getPaypalConnection:', error);
        return null;
    }
}

// Verificar conexión con pasarela de pagos
export const checkPaymentGatewayConnection = async (agencyId: string) => {
    if (!agencyId) {
        console.error('agencyId es requerido para getPaymentGateway');
        throw new Error('agencyId es requerido');
    }
    
    const paymentGateway = await getPaymentGateway(agencyId, 'paypal');

    if (!paymentGateway) {
        return {
            isConnected: false,
            status: 'NOT_CONNECTED',
            needsReauth: false
        };
    }

    const needsReauth = paymentGateway.expiresAt ? new Date() > paymentGateway.expiresAt : false;

    return {
        isConnected: paymentGateway.status === 'ACTIVE' && !needsReauth,
        status: paymentGateway.status,
        needsReauth
    };
}
