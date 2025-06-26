/**
 * Simulador de webhooks para pruebas de pasarelas de pago
 * Este archivo permite generar eventos de webhook simulados para probar
 * el flujo completo de integración con PayPal y MercadoPago
 */

import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { simulateWebhookEvent } from './test-utils';

// Tipos de eventos disponibles para simulación
export const PAYPAL_EVENT_TYPES = {
    ONBOARDING_COMPLETED: 'MERCHANT.ONBOARDING.COMPLETED',
    ONBOARDING_FAILED: 'MERCHANT.ONBOARDING.FAILED',
    PAYMENT_CAPTURED: 'PAYMENT.CAPTURE.COMPLETED',
    PAYMENT_REFUNDED: 'PAYMENT.REFUND.COMPLETED'
};

export const MERCADOPAGO_EVENT_TYPES = {
    MERCHANT_CREATED: 'merchant.created',
    MERCHANT_DISABLED: 'merchant.disabled',
    PAYMENT_CREATED: 'payment.created',
    PAYMENT_APPROVED: 'payment.approved'
};

/**
 * Simula un webhook para pruebas
 * Esta función permite generar un evento de webhook simulado y procesarlo
 * como si hubiera sido recibido desde la pasarela de pago
 */
export async function simulateWebhook(
    gatewayId: string,
    eventType: string,
    agencyId: string
): Promise<{ success: boolean; eventId?: string; error?: string }> {
    try {
        // Verificar que estamos en entorno de desarrollo
        if (process.env.NODE_ENV === 'production') {
            throw new Error('La simulación de webhooks solo está disponible en entorno de desarrollo');
        }

        // Generar el evento simulado
        const webhookEvent = simulateWebhookEvent(gatewayId, eventType, agencyId);

        // Guardar el evento en la base de datos
        const savedEvent = await db.paymentGatewayWebhookEvent.create({
            data: {
                gatewayId,
                agencyId,
                eventType: webhookEvent.type,
                eventData: webhookEvent.data as any,
                createdAt: new Date(),
            },
        });

        // Procesar el evento según su tipo
        await processSimulatedEvent(gatewayId, webhookEvent.type, webhookEvent.data, agencyId);

        return {
            success: true,
            eventId: savedEvent.id
        };
    } catch (error: any) {
        console.error(`Error simulando webhook para ${gatewayId}:`, error);
        return {
            success: false,
            error: error.message || 'Error desconocido'
        };
    }
}

/**
 * Procesa un evento simulado
 */
async function processSimulatedEvent(
    gatewayId: string,
    eventType: string,
    eventData: Record<string, any>,
    agencyId: string
): Promise<void> {
    // Buscar la conexión de la pasarela para la agencia
    const connection = await db.paymentGatewayConnection.findUnique({
        where: {
            agencyId_gatewayId: {
                agencyId,
                gatewayId,
            },
        },
    });

    // Si no existe la conexión, crearla para eventos de onboarding
    if (!connection && isOnboardingEvent(gatewayId, eventType)) {
        await createSimulatedConnection(gatewayId, eventType, eventData, agencyId);
        return;
    }

    // Actualizar el estado de la conexión según el evento
    if (connection && isStatusChangeEvent(gatewayId, eventType)) {
        await updateConnectionStatus(gatewayId, eventType, connection.id, agencyId);
    }

    // Aquí se implementaría la lógica para procesar otros tipos de eventos
    // como pagos, reembolsos, etc.
}

/**
 * Verifica si el evento es de tipo onboarding
 */
function isOnboardingEvent(gatewayId: string, eventType: string): boolean {
    switch (gatewayId) {
        case 'paypal':
            return eventType === PAYPAL_EVENT_TYPES.ONBOARDING_COMPLETED;
        case 'mercadopago':
            return eventType === MERCADOPAGO_EVENT_TYPES.MERCHANT_CREATED;
        default:
            return false;
    }
}

/**
 * Verifica si el evento implica un cambio de estado
 */
function isStatusChangeEvent(gatewayId: string, eventType: string): boolean {
    switch (gatewayId) {
        case 'paypal':
            return [
                PAYPAL_EVENT_TYPES.ONBOARDING_COMPLETED,
                PAYPAL_EVENT_TYPES.ONBOARDING_FAILED
            ].includes(eventType);
        case 'mercadopago':
            return [
                MERCADOPAGO_EVENT_TYPES.MERCHANT_CREATED,
                MERCADOPAGO_EVENT_TYPES.MERCHANT_DISABLED
            ].includes(eventType);
        default:
            return false;
    }
}

/**
 * Crea una conexión simulada para eventos de onboarding
 */
async function createSimulatedConnection(
    gatewayId: string,
    eventType: string,
    eventData: Record<string, any>,
    agencyId: string
): Promise<void> {
    // Generar tokens simulados
    const accessToken = `sim_${gatewayId}_access_${Date.now()}`;
    const refreshToken = `sim_${gatewayId}_refresh_${Date.now()}`;

    // Calcular fecha de expiración (1 hora)
    const expiresAt = new Date();
    expiresAt.setHours(expiresAt.getHours() + 1);

    // Crear la conexión en la base de datos
    await db.paymentGatewayConnection.create({
        data: {
            gatewayId,
            agencyId,
            accessToken,
            refreshToken,
            expiresAt,
            status: 'ACTIVE',
            metadata: {
                simulatedConnection: true,
                eventType,
                ...eventData
            },
            createdAt: new Date(),
            updatedAt: new Date(),
        },
    });

    // Crear una notificación para el usuario
    await db.notification.create({
        data: {
            agencyId,
            userId: agencyId, // Usar agencyId como userId temporalmente
            notification: `Conexión con ${gatewayId === 'paypal' ? 'PayPal' : 'MercadoPago'} establecida - Tu cuenta ha sido conectada exitosamente en modo de pruebas.`,
        },
    });
}

/**
 * Actualiza el estado de una conexión según el evento
 */
async function updateConnectionStatus(
    gatewayId: string,
    eventType: string,
    connectionId: string,
    agencyId: string
): Promise<void> {
    let isActive = false;
    let statusMessage = '';

    // Determinar el nuevo estado según el tipo de evento
    switch (gatewayId) {
        case 'paypal':
            isActive = eventType === PAYPAL_EVENT_TYPES.ONBOARDING_COMPLETED;
            statusMessage = isActive
                ? 'Tu cuenta de PayPal ha sido verificada y está activa.'
                : 'La verificación de tu cuenta de PayPal ha fallado.';
            break;
        case 'mercadopago':
            isActive = eventType === MERCADOPAGO_EVENT_TYPES.MERCHANT_CREATED;
            statusMessage = isActive
                ? 'Tu cuenta de MercadoPago ha sido verificada y está activa.'
                : 'La verificación de tu cuenta de MercadoPago ha fallado.';
            break;
    }

    // Actualizar la conexión en la base de datos
    await db.paymentGatewayConnection.update({
        where: { id: connectionId },
        data: {
            metadata: {
                isActive,
                lastEventType: eventType,
                lastEventDate: new Date().toISOString()
            },
            updatedAt: new Date(),
        },
    });

    // Crear una notificación para el usuario
    await db.notification.create({
        data: {
            agencyId,
            userId: agencyId, // Usar agencyId como userId temporalmente
            notification: `Estado de ${gatewayId === 'paypal' ? 'PayPal' : 'MercadoPago'} actualizado - ${statusMessage}`,
        },
    });
}

/**
 * Endpoint para simular webhooks desde la interfaz de usuario
 * Esta función se puede exponer como una API solo en entorno de desarrollo
 */
export async function handleSimulationRequest(
    req: NextRequest
): Promise<NextResponse> {
    try {
        // Verificar que estamos en entorno de desarrollo
        if (process.env.NODE_ENV === 'production') {
            return NextResponse.json(
                { success: false, error: 'Esta funcionalidad solo está disponible en entorno de desarrollo' },
                { status: 403 }
            );
        }

        // Obtener los datos de la solicitud
        const { gatewayId, eventType, agencyId } = await req.json();

        // Validar los datos
        if (!gatewayId || !eventType || !agencyId) {
            return NextResponse.json(
                { success: false, error: 'Faltan parámetros requeridos' },
                { status: 400 }
            );
        }

        // Simular el webhook
        const result = await simulateWebhook(gatewayId, eventType, agencyId);

        return NextResponse.json(result);
    } catch (error: any) {
        console.error('Error en la simulación de webhook:', error);
        return NextResponse.json(
            { success: false, error: error.message || 'Error desconocido' },
            { status: 500 }
        );
    }
}