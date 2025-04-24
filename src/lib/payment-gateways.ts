/**
 * Configuración de las pasarelas de pago disponibles para los usuarios
 * Este archivo contiene la configuración de las diferentes pasarelas de pago
 * que los usuarios pueden conectar a sus agencias.
 */

import { PaymentGatewayError } from './payment-gateway-types'

export interface PaymentGateway {
    id: string
    name: string
    logo: string
    description: string
    fees: {
        percentage: number
        fixed: number
        currency: string
    }
    /**
     * Genera la URL de autenticación para la pasarela de pago
     * @param agencyId ID de la agencia que está conectando la pasarela
     * @returns URL de autenticación para redirigir al usuario
     */
    authUrl(agencyId: string): string
}

/**
 * Lista de pasarelas de pago disponibles para los usuarios
 * Cada pasarela debe implementar la interfaz PaymentGateway
 */
export const paymentGateways: PaymentGateway[] = [
    {
        id: 'paypal',
        name: 'PayPal',
        logo: '/images/payment-gateways/paypal-logo.png',
        description: 'Conecta tu cuenta de PayPal para aceptar pagos internacionales',
        fees: {
            percentage: 3.4,
            fixed: 0.30,
            currency: 'USD'
        },
        authUrl: (agencyId: string) => {
            const clientId = process.env.NEXT_PUBLIC_PAYPAL_CLIENT_ID;
            const redirectUri = encodeURIComponent(`${process.env.NEXT_PUBLIC_URL}/agency/${agencyId}/launchpad`);
            return `https://www.sandbox.paypal.com/connect?flowEntry=static&client_id=${clientId}&scope=openid email&redirect_uri=${redirectUri}&response_type=code`;
        }
    },
    {
        id: 'payu',
        name: 'PayU Colombia',
        logo: '/images/payment-gateways/payu-logo.png',
        description: 'Acepta pagos con tarjetas de crédito y débito en Colombia',
        fees: {
            percentage: 2.5,
            fixed: 0.50,
            currency: 'COP'
        },
        authUrl: (agencyId: string) => {
            const clientId = process.env.NEXT_PUBLIC_PAYU_CLIENT_ID;
            const redirectUri = encodeURIComponent(`${process.env.NEXT_PUBLIC_URL}/agency/${agencyId}/launchpad`);
            return `https://secure.payulatam.com/oauth/authorize?client_id=${clientId}&response_type=code&redirect_uri=${redirectUri}`;
        }
    },
    {
        id: 'mercadopago',
        name: 'Mercado Pago',
        logo: '/images/payment-gateways/mercadopago-logo.png',
        description: 'Solución de pagos líder en Latinoamérica',
        fees: {
            percentage: 2.9,
            fixed: 0.40,
            currency: 'COP'
        },
        authUrl: (agencyId: string) => {
            const clientId = process.env.NEXT_PUBLIC_MERCADOPAGO_CLIENT_ID;
            const redirectUri = encodeURIComponent(`${process.env.NEXT_PUBLIC_URL}/agency/${agencyId}/launchpad`);
            return `https://auth.mercadopago.com.co/authorization?client_id=${clientId}&response_type=code&platform_id=mp&redirect_uri=${redirectUri}`;
        }
    },
    {
        id: 'epayco',
        name: 'ePayco',
        logo: '/images/payment-gateways/epayco-logo.png',
        description: 'Plataforma de pagos en línea para Colombia',
        fees: {
            percentage: 2.2,
            fixed: 0.35,
            currency: 'COP'
        },
        authUrl: (agencyId: string) => {
            const clientId = process.env.NEXT_PUBLIC_EPAYCO_CLIENT_ID;
            const redirectUri = encodeURIComponent(`${process.env.NEXT_PUBLIC_URL}/agency/${agencyId}/launchpad`);
            return `https://secure.epayco.co/oauth2/authorize?client_id=${clientId}&response_type=code&redirect_uri=${redirectUri}`;
        }
    },
    {
        id: 'wompi',
        name: 'Wompi',
        logo: '/images/payment-gateways/wompi-logo.png',
        description: 'Procesamiento de pagos con tarjetas y PSE',
        fees: {
            percentage: 2.8,
            fixed: 0.45,
            currency: 'COP'
        },
        authUrl: (agencyId: string) => {
            const clientId = process.env.NEXT_PUBLIC_WOMPI_CLIENT_ID;
            const redirectUri = encodeURIComponent(`${process.env.NEXT_PUBLIC_URL}/agency/${agencyId}/launchpad`);
            return `https://id.wompi.co/connect/authorize?client_id=${clientId}&response_type=code&redirect_uri=${redirectUri}`;
        }
    }
]

/**
 * Obtiene una pasarela de pago por su ID
 */
export function getPaymentGateway(gatewayId: string): PaymentGateway {
    const gateway = paymentGateways.find(g => g.id === gatewayId)
    if (!gateway) {
        throw new PaymentGatewayError({
            code: 'GATEWAY_NOT_FOUND',
            message: `Payment gateway ${gatewayId} not found`
        })
    }
    return gateway
}

/**
 * Valida que todas las pasarelas de pago estén correctamente configuradas
 */
export function validatePaymentGatewaysConfig() {
    for (const gateway of paymentGateways) {
        try {
            // Verificar que la URL de autenticación se puede generar
            gateway.authUrl('test')
        } catch (error) {
            console.error(`Configuration error for ${gateway.name}:`, error)
            throw error
        }
    }
}