/**
 * Implementación de pasarelas de pago para el sistema multi-merchant
 * Este archivo define las configuraciones y funciones para integrar con:
 * - PayPal
 * - MercadoPago
 */

import { PaymentGatewayValidationResponse } from './payment-gateway-types';

// Interfaz para definir una pasarela de pago
export interface PaymentGateway {
    id: string;
    name: string;
    logo: string;
    description: string;
    fees: {
        percentage: number;
        fixed: number;
        currency: string;
    };
    authUrl: (agencyId: string) => string;
    validateConnection: (agencyId: string) => Promise<PaymentGatewayValidationResponse>;
}

// Configuración de PayPal
const PAYPAL_CLIENT_ID = process.env.PAYPAL_CLIENT_ID || '';
const PAYPAL_CLIENT_SECRET = process.env.PAYPAL_CLIENT_SECRET || '';
const PAYPAL_OAUTH_URL = 'https://www.paypal.com/signin/authorize';
const PAYPAL_API_URL = 'https://api-m.paypal.com';

// Configuración de MercadoPago
const MERCADOPAGO_CLIENT_ID = process.env.MERCADOPAGO_CLIENT_ID || '';
const MERCADOPAGO_CLIENT_SECRET = process.env.MERCADOPAGO_CLIENT_SECRET || '';
const MERCADOPAGO_OAUTH_URL = 'https://auth.mercadopago.com/authorization';
const MERCADOPAGO_API_URL = 'https://api.mercadopago.com';


// URL de redirección después de la autenticación
const getRedirectUrl = (agencyId: string) => {
    const baseUrl = process.env.NEXT_PUBLIC_URL || 'http://localhost:3000';
    return `${baseUrl}/agency/${agencyId}/launchpad`;
};

// Implementación de PayPal
const paypalGateway: PaymentGateway = {
    id: 'paypal',
    name: 'PayPal',
    logo: '/payment-gateways/paypal-logo.png',
    description: 'Conecta tu cuenta de PayPal para recibir pagos de tus clientes',
    fees: {
        percentage: 3.5,
        fixed: 0.30,
        currency: 'USD'
    },
    authUrl: (agencyId: string) => {
        // Usar nuestra página de simulación en lugar de la URL real de PayPal
        const baseUrl = process.env.NEXT_PUBLIC_URL || 'http://localhost:3000';
        const redirectUri = encodeURIComponent(getRedirectUrl(agencyId));
        
        // Redirigir a nuestra página de simulación con los parámetros necesarios
        return `${baseUrl}/paypal-auth-mock?redirect_uri=${redirectUri}&state=${agencyId}`;
    },
    validateConnection: async (agencyId: string) => {
        try {
            // Esta función será implementada en la ruta de validación
            // Aquí solo definimos la interfaz
            return {
                success: true,
                isConnected: false,
                merchantStatus: 'pending'
            };
        } catch (error) {
            console.error('Error validating PayPal connection:', error);
            return {
                success: false,
                error: 'Error validating PayPal connection',
                isConnected: false
            };
        }
    }
};

// Implementación de MercadoPago
const mercadoPagoGateway: PaymentGateway = {
    id: 'mercadopago',
    name: 'MercadoPago',
    logo: '/payment-gateways/mercadopago-logo.png',
    description: 'Conecta tu cuenta de MercadoPago para recibir pagos de tus clientes',
    fees: {
        percentage: 3.99,
        fixed: 0.40,
        currency: 'USD'
    },
    authUrl: (agencyId: string) => {
        // Usar nuestra página de simulación en lugar de la URL real de MercadoPago
        const baseUrl = process.env.NEXT_PUBLIC_URL || 'http://localhost:3000';
        const redirectUri = encodeURIComponent(getRedirectUrl(agencyId));
        const scope = encodeURIComponent('read write payments');
        
        // Redirigir a nuestra página de simulación con los parámetros necesarios
        return `${baseUrl}/mercadopago-auth-mock?redirect_uri=${redirectUri}&state=${agencyId}&scope=${scope}`;
    },
    validateConnection: async (agencyId: string) => {
        try {
            return {
                success: true,
                isConnected: false,
                merchantStatus: 'pending'
            };
        } catch (error) {
            console.error('Error validating MercadoPago connection:', error);
            return {
                success: false,
                error: 'Error validating MercadoPago connection',
                isConnected: false
            };
        }
    }
};

// Lista de todas las pasarelas disponibles
export const paymentGateways: PaymentGateway[] = [
    paypalGateway,
    mercadoPagoGateway,
];

// Función para obtener una pasarela por su ID
export const getGatewayById = (gatewayId: string): PaymentGateway | undefined => {
    return paymentGateways.find(gateway => gateway.id === gatewayId);
};

// Importar las funciones de autenticación desde utils
import {
    getPayPalAccessToken,
    getMercadoPagoAccessToken,
    refreshGatewayToken
} from './utils/auth-utils';

// Función para obtener el token de acceso de una pasarela
export const getGatewayAccessToken = async (code: string, gatewayId: string, agencyId: string): Promise<any> => {
    try {
        switch (gatewayId) {
            case 'paypal':
                return await getPayPalAccessToken(code, agencyId);
            case 'mercadopago':
                return await getMercadoPagoAccessToken(code, agencyId);
            default:
                throw new Error(`Pasarela de pago no soportada: ${gatewayId}`);
        }
    } catch (error) {
        console.error(`Error obteniendo token para ${gatewayId}:`, error);
        throw error;
    }
};

// Función para actualizar un token expirado
export const refreshAccessToken = async (gatewayId: string, refreshToken: string, agencyId: string): Promise<any> => {
    try {
        return await refreshGatewayToken(gatewayId, refreshToken, agencyId);
    } catch (error) {
        console.error(`Error actualizando token para ${gatewayId}:`, error);
        throw error;
    }
}