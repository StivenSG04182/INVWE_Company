/**
 * Utilidades para la autenticación de pasarelas de pago
 * Este archivo contiene funciones para obtener tokens de acceso
 * y manejar la autenticación OAuth2 para las diferentes pasarelas
 */

import { db } from '@/lib/db';
import { getGatewayCredentials, shouldUseSandbox, simulateOAuthResponse } from './test-utils';

// Determinar si estamos en modo de desarrollo/sandbox
const IS_SANDBOX = shouldUseSandbox();

// Obtener las credenciales según el entorno
const getCredentials = (gatewayId: string) => {
    if (IS_SANDBOX) {
        return getGatewayCredentials(gatewayId);
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
};


// URL de redirección después de la autenticación
const getRedirectUrl = (agencyId: string) => {
    const baseUrl = process.env.NEXT_PUBLIC_URL || 'http://localhost:3000';
    return `${baseUrl}/agency/${agencyId}/launchpad`;
};

/**
 * Obtiene un token de acceso de PayPal
 */
export async function getPayPalAccessToken(code: string, agencyId: string) {
    try {
        // Si estamos en modo sandbox y es desarrollo, podemos simular la respuesta
        if (IS_SANDBOX && process.env.NODE_ENV !== 'production') {
            console.log('Simulando respuesta OAuth de PayPal en modo desarrollo');
            const simulatedResponse = simulateOAuthResponse('paypal', agencyId);
            return {
                accessToken: simulatedResponse.access_token,
                refreshToken: simulatedResponse.refresh_token,
                expiresIn: simulatedResponse.expires_in,
                accountId: simulatedResponse.user_id || null,
                metadata: {
                    scope: simulatedResponse.scope,
                    tokenType: simulatedResponse.token_type,
                    simulated: true
                },
            };
        }

        // Obtener credenciales según el entorno
        const { clientId, clientSecret, tokenUrl } = getCredentials('paypal');
        const redirectUri = getRedirectUrl(agencyId);
        const credentials = Buffer.from(`${clientId}:${clientSecret}`).toString('base64');

        const response = await fetch(tokenUrl, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/x-www-form-urlencoded',
                'Authorization': `Basic ${credentials}`,
            },
            body: new URLSearchParams({
                grant_type: 'authorization_code',
                code,
                redirect_uri: redirectUri,
            }),
        });

        if (!response.ok) {
            const errorData = await response.json();
            throw new Error(`Error de PayPal: ${errorData.error_description || 'Error desconocido'}`);
        }

        const data = await response.json();

        return {
            accessToken: data.access_token,
            refreshToken: data.refresh_token,
            expiresIn: data.expires_in,
            accountId: data.user_id || null,
            metadata: {
                scope: data.scope,
                tokenType: data.token_type,
            },
        };
    } catch (error) {
        console.error('Error obteniendo token de PayPal:', error);
        throw error;
    }
}

/**
 * Obtiene un token de acceso de MercadoPago
 */
export async function getMercadoPagoAccessToken(code: string, agencyId: string) {
    try {
        // Si estamos en modo sandbox y es desarrollo, podemos simular la respuesta
        if (IS_SANDBOX && process.env.NODE_ENV !== 'production') {
            console.log('Simulando respuesta OAuth de MercadoPago en modo desarrollo');
            const simulatedResponse = simulateOAuthResponse('mercadopago', agencyId);
            return {
                accessToken: simulatedResponse.access_token,
                refreshToken: simulatedResponse.refresh_token,
                expiresIn: simulatedResponse.expires_in,
                accountId: simulatedResponse.user_id || null,
                metadata: {
                    scope: simulatedResponse.scope,
                    tokenType: simulatedResponse.token_type,
                    publicKey: simulatedResponse.public_key,
                    simulated: true
                },
            };
        }

        // Obtener credenciales según el entorno
        const { clientId, clientSecret, tokenUrl } = getCredentials('mercadopago');
        const redirectUri = getRedirectUrl(agencyId);

        const response = await fetch(tokenUrl, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/x-www-form-urlencoded',
            },
            body: new URLSearchParams({
                grant_type: 'authorization_code',
                client_id: clientId,
                client_secret: clientSecret,
                code,
                redirect_uri: redirectUri,
            }),
        });

        if (!response.ok) {
            const errorData = await response.json();
            throw new Error(`Error de MercadoPago: ${errorData.error_description || 'Error desconocido'}`);
        }

        const data = await response.json();

        return {
            accessToken: data.access_token,
            refreshToken: data.refresh_token,
            expiresIn: data.expires_in,
            accountId: data.user_id || null,
            metadata: {
                scope: data.scope,
                tokenType: data.token_type,
                publicKey: data.public_key,
            },
        };
    } catch (error) {
        console.error('Error obteniendo token de MercadoPago:', error);
        throw error;
    }
}



/**
 * Actualiza el token de acceso utilizando el token de actualización
 */
export async function refreshGatewayToken(gatewayId: string, refreshToken: string, agencyId: string) {
    try {
        let tokenResponse;

        switch (gatewayId) {
            case 'paypal':
                tokenResponse = await refreshPayPalToken(refreshToken);
                break;
            case 'mercadopago':
                tokenResponse = await refreshMercadoPagoToken(refreshToken);
                break;
            default:
                throw new Error(`Pasarela de pago no soportada: ${gatewayId}`);
        }

        if (!tokenResponse || !tokenResponse.accessToken) {
            throw new Error('No se pudo actualizar el token de acceso');
        }

        // Calcular la fecha de expiración si se proporciona
        let expiresAt = null;
        if (tokenResponse.expiresIn) {
            expiresAt = new Date();
            expiresAt.setSeconds(expiresAt.getSeconds() + tokenResponse.expiresIn);
        }

        // Actualizar la conexión en la base de datos
        const connection = await db.paymentGatewayConnection.update({
            where: {
                agencyId_gatewayId: {
                    agencyId,
                    gatewayId,
                },
            },
            data: {
                accessToken: tokenResponse.accessToken,
                refreshToken: tokenResponse.refreshToken || refreshToken,
                expiresAt: expiresAt,
                updatedAt: new Date(),
            },
        });

        return connection;
    } catch (error) {
        console.error(`Error actualizando token de ${gatewayId}:`, error);
        throw error;
    }
}

// Funciones específicas para actualizar tokens
async function refreshPayPalToken(refreshToken: string) {
    // Si estamos en modo sandbox y es desarrollo, podemos simular la respuesta
    if (IS_SANDBOX && process.env.NODE_ENV !== 'production') {
        console.log('Simulando actualización de token de PayPal en modo desarrollo');
        return {
            accessToken: `sim_paypal_refresh_access_${Date.now()}`,
            refreshToken: `sim_paypal_refresh_token_${Date.now()}`,
            expiresIn: 3600,
        };
    }

    // Obtener credenciales según el entorno
    const { clientId, clientSecret, tokenUrl } = getCredentials('paypal');
    const credentials = Buffer.from(`${clientId}:${clientSecret}`).toString('base64');

    const response = await fetch(tokenUrl, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/x-www-form-urlencoded',
            'Authorization': `Basic ${credentials}`,
        },
        body: new URLSearchParams({
            grant_type: 'refresh_token',
            refresh_token: refreshToken,
        }),
    });

    if (!response.ok) {
        throw new Error('Error actualizando token de PayPal');
    }

    const data = await response.json();

    return {
        accessToken: data.access_token,
        refreshToken: data.refresh_token,
        expiresIn: data.expires_in,
    };
}

async function refreshMercadoPagoToken(refreshToken: string) {
    // Si estamos en modo sandbox y es desarrollo, podemos simular la respuesta
    if (IS_SANDBOX && process.env.NODE_ENV !== 'production') {
        console.log('Simulando actualización de token de MercadoPago en modo desarrollo');
        return {
            accessToken: `sim_mp_refresh_access_${Date.now()}`,
            refreshToken: `sim_mp_refresh_token_${Date.now()}`,
            expiresIn: 3600,
        };
    }

    // Obtener credenciales según el entorno
    const { clientId, clientSecret, tokenUrl } = getCredentials('mercadopago');

    const response = await fetch(tokenUrl, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/x-www-form-urlencoded',
        },
        body: new URLSearchParams({
            grant_type: 'refresh_token',
            client_id: clientId,
            client_secret: clientSecret,
            refresh_token: refreshToken,
        }),
    });

    if (!response.ok) {
        throw new Error('Error actualizando token de MercadoPago');
    }

    const data = await response.json();

    return {
        accessToken: data.access_token,
        refreshToken: data.refresh_token,
        expiresIn: data.expires_in,
    };
}