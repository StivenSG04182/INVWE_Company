/**
 * Utilidades para pruebas de pasarelas de pago
 * Este archivo contiene funciones para simular respuestas de las pasarelas
 * y probar el flujo completo de autenticación y registro sin necesidad de URLs HTTPS
 */

import { PaymentGatewayWebhookEvent } from '../payment-gateway-types';

// Constantes para el entorno de pruebas
const IS_DEVELOPMENT = process.env.NODE_ENV !== 'production';
const USE_SANDBOX = process.env.USE_PAYMENT_SANDBOX === 'true' || IS_DEVELOPMENT;

// URLs de sandbox para las pasarelas
const PAYPAL_SANDBOX_TOKEN_URL = 'https://api-m.sandbox.paypal.com/v1/oauth2/token';
const MERCADOPAGO_SANDBOX_TOKEN_URL = 'https://api.mercadopago.com/oauth/token';

// Credenciales de sandbox para las pasarelas
const PAYPAL_SANDBOX_CLIENT_ID = process.env.PAYPAL_SANDBOX_CLIENT_ID || 'sandbox_client_id';
const PAYPAL_SANDBOX_CLIENT_SECRET = process.env.PAYPAL_SANDBOX_CLIENT_SECRET || 'sandbox_client_secret';
const MERCADOPAGO_SANDBOX_CLIENT_ID = process.env.MERCADOPAGO_SANDBOX_CLIENT_ID || 'sandbox_client_id';
const MERCADOPAGO_SANDBOX_CLIENT_SECRET = process.env.MERCADOPAGO_SANDBOX_CLIENT_SECRET || 'sandbox_client_secret';

/**
 * Determina si se debe usar el entorno de sandbox
 */
export function shouldUseSandbox(): boolean {
    return USE_SANDBOX;
}

/**
 * Obtiene las credenciales de la pasarela según el entorno
 */
export function getGatewayCredentials(gatewayId: string): { clientId: string; clientSecret: string; tokenUrl: string } {
    if (shouldUseSandbox()) {
        switch (gatewayId) {
            case 'paypal':
                return {
                    clientId: PAYPAL_SANDBOX_CLIENT_ID,
                    clientSecret: PAYPAL_SANDBOX_CLIENT_SECRET,
                    tokenUrl: PAYPAL_SANDBOX_TOKEN_URL
                };
            case 'mercadopago':
                return {
                    clientId: MERCADOPAGO_SANDBOX_CLIENT_ID,
                    clientSecret: MERCADOPAGO_SANDBOX_CLIENT_SECRET,
                    tokenUrl: MERCADOPAGO_SANDBOX_TOKEN_URL
                };
            default:
                throw new Error(`Pasarela de pago no soportada: ${gatewayId}`);
        }
    } else {
        // En producción, usar las credenciales reales
        switch (gatewayId) {
            case 'paypal':
                return {
                    clientId: process.env.PAYPAL_CLIENT_ID || '',
                    clientSecret: process.env.PAYPAL_CLIENT_SECRET || '',
                    tokenUrl: 'https://api-m.paypal.com/v1/oauth2/token'
                };
            case 'mercadopago':
                return {
                    clientId: process.env.MERCADOPAGO_CLIENT_ID || '',
                    clientSecret: process.env.MERCADOPAGO_CLIENT_SECRET || '',
                    tokenUrl: 'https://api.mercadopago.com/oauth/token'
                };
            default:
                throw new Error(`Pasarela de pago no soportada: ${gatewayId}`);
        }
    }
}

/**
 * Simula un evento de webhook para pruebas
 */
export function simulateWebhookEvent(gatewayId: string, eventType: string, agencyId: string): PaymentGatewayWebhookEvent {
    const timestamp = new Date();

    let eventData: Record<string, any> = {};

    switch (gatewayId) {
        case 'paypal':
            eventData = createPayPalWebhookEvent(eventType, agencyId);
            break;
        case 'mercadopago':
            eventData = createMercadoPagoWebhookEvent(eventType, agencyId);
            break;
        default:
            throw new Error(`Pasarela de pago no soportada: ${gatewayId}`);
    }

    return {
        id: `sim_${gatewayId}_${Date.now()}`,
        type: eventType,
        data: eventData,
        createdAt: timestamp
    };
}

/**
 * Crea un evento simulado de PayPal
 */
function createPayPalWebhookEvent(eventType: string, agencyId: string): Record<string, any> {
    const merchantId = `PAYPAL_MERCHANT_${agencyId}`;

    switch (eventType) {
        case 'MERCHANT.ONBOARDING.COMPLETED':
            return {
                merchant_id: merchantId,
                merchant_status: 'ACTIVE',
                agency_id: agencyId,
                timestamp: new Date().toISOString(),
                capabilities: ['DIRECT_PAYMENTS', 'REFUNDS', 'RECURRING_PAYMENTS']
            };
        case 'MERCHANT.ONBOARDING.FAILED':
            return {
                merchant_id: merchantId,
                merchant_status: 'REJECTED',
                agency_id: agencyId,
                timestamp: new Date().toISOString(),
                reason: 'VERIFICATION_FAILED'
            };
        default:
            return {
                merchant_id: merchantId,
                agency_id: agencyId,
                event_type: eventType,
                timestamp: new Date().toISOString()
            };
    }
}

/**
 * Crea un evento simulado de MercadoPago
 */
function createMercadoPagoWebhookEvent(eventType: string, agencyId: string): Record<string, any> {
    const userId = `MP_USER_${agencyId}`;

    switch (eventType) {
        case 'merchant.created':
            return {
                user_id: userId,
                status: 'active',
                agency_id: agencyId,
                date_created: new Date().toISOString(),
                capabilities: ['payments', 'refunds', 'subscriptions']
            };
        case 'merchant.disabled':
            return {
                user_id: userId,
                status: 'disabled',
                agency_id: agencyId,
                date_created: new Date().toISOString(),
                reason: 'verification_failed'
            };
        default:
            return {
                user_id: userId,
                agency_id: agencyId,
                type: eventType,
                date_created: new Date().toISOString()
            };
    }
}

/**
 * Simula una respuesta de autenticación OAuth
 */
export function simulateOAuthResponse(gatewayId: string, agencyId: string): Record<string, any> {
    const timestamp = new Date();
    const expiresIn = 3600; // 1 hora

    switch (gatewayId) {
        case 'paypal':
            return {
                access_token: `sim_paypal_access_${agencyId}_${Date.now()}`,
                refresh_token: `sim_paypal_refresh_${agencyId}_${Date.now()}`,
                expires_in: expiresIn,
                token_type: 'Bearer',
                user_id: `PAYPAL_USER_${agencyId}`,
                scope: 'openid email profile payments',
            };
        case 'mercadopago':
            return {
                access_token: `sim_mp_access_${agencyId}_${Date.now()}`,
                refresh_token: `sim_mp_refresh_${agencyId}_${Date.now()}`,
                expires_in: expiresIn,
                token_type: 'Bearer',
                user_id: `MP_USER_${agencyId}`,
                scope: 'read write payments',
                public_key: `TEST-${agencyId}-public-key`,
            };
        default:
            throw new Error(`Pasarela de pago no soportada: ${gatewayId}`);
    }
}

/**
 * Simula una respuesta de validación de conexión
 */
export function simulateConnectionValidation(gatewayId: string, agencyId: string, isConnected: boolean = true): Record<string, any> {
    switch (gatewayId) {
        case 'paypal':
            return {
                success: true,
                isConnected,
                merchantStatus: isConnected ? 'active' : 'pending',
                metadata: {
                    merchant_id: `PAYPAL_MERCHANT_${agencyId}`,
                    capabilities: ['DIRECT_PAYMENTS', 'REFUNDS'],
                    country: 'US',
                    email: `merchant_${agencyId}@example.com`,
                }
            };
        case 'mercadopago':
            return {
                success: true,
                isConnected,
                merchantStatus: isConnected ? 'active' : 'pending',
                metadata: {
                    user_id: `MP_USER_${agencyId}`,
                    capabilities: ['payments', 'refunds'],
                    country: 'AR',
                    email: `merchant_${agencyId}@example.com`,
                }
            };
        default:
            throw new Error(`Pasarela de pago no soportada: ${gatewayId}`);
    }
}