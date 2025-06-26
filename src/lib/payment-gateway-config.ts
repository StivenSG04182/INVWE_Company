export interface PaymentGateway {
  id: string
  name: string
  description: string
  logo: string
  authUrl: (agencyId: string) => string
  fees: {
    percentage: number
    fixed: number
    currency: string
  }
}

export interface PaymentGatewayValidationResponse {
  success: boolean
  isConnected?: boolean
  error?: string
  status?: string
}

export const paymentGateways: PaymentGateway[] = [
  {
    id: 'paypal',
    name: 'PayPal',
    description: 'Acepta pagos con PayPal de forma segura',
    logo: '/images/payment-gateways/paypal-logo.png',
    authUrl: (agencyId: string) => `/paypal-auth-mock?agencyId=${agencyId}`,
    fees: {
      percentage: 3.5,
      fixed: 0.35,
      currency: 'USD'
    }
  },
  {
    id: 'mercadopago',
    name: 'MercadoPago',
    description: 'Solución de pagos líder en Latinoamérica',
    logo: '/images/payment-gateways/mercadopago-logo.png',
    authUrl: (agencyId: string) => `/mercadopago-auth-mock?agencyId=${agencyId}`,
    fees: {
      percentage: 4.5,
      fixed: 0.50,
      currency: 'USD'
    }
  },
  {
    id: 'epayco',
    name: 'ePayco',
    description: 'Pasarela de pagos colombiana',
    logo: '/images/payment-gateways/epayco-logo.png',
    authUrl: (agencyId: string) => `/epayco-auth-mock?agencyId=${agencyId}`,
    fees: {
      percentage: 3.95,
      fixed: 0.40,
      currency: 'USD'
    }
  }
] 