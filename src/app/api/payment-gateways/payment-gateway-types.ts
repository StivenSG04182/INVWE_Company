/**
 * Tipos relacionados con las pasarelas de pagos
 * Este archivo contiene las definiciones de tipos para:
 * 1. La pasarela de pagos del proyecto (PayPal)
 * 2. Las pasarelas de pagos de los usuarios
 */

// ============================================================================
// Tipos para la pasarela de pagos del proyecto (PayPal)
// ============================================================================

export interface ProjectPayPalSubscription {
    id: string
    status: 'ACTIVE' | 'CANCELLED' | 'EXPIRED' | 'PAST_DUE'
    planId: string
    startDate: Date
    endDate?: Date
    cancelAtPeriodEnd: boolean
    currentPeriodStart: Date
    currentPeriodEnd: Date
}

export interface ProjectPayPalPlan {
    id: string
    name: string
    description: string
    price: number
    currency: string
    interval: 'MONTH' | 'YEAR'
    features: string[]
}

// ============================================================================
// Tipos para las pasarelas de pagos de los usuarios
// ============================================================================

export class PaymentGatewayError extends Error {
    code: string;
    
    constructor({ code, message }: { code: string; message: string }) {
        super(message);
        this.code = code;
        this.name = 'PaymentGatewayError';
    }
}

export interface PaymentGatewayConnection {
    id: string
    gatewayId: string
    agencyId: string
    accessToken: string
    refreshToken?: string
    expiresAt?: Date
    metadata?: Record<string, any>
    createdAt: Date
    updatedAt: Date
}

export interface PaymentGatewayAuthResponse {
    success: boolean
    error?: string
    connection?: PaymentGatewayConnection
}

export interface PaymentGatewayValidationResponse {
    success: boolean
    error?: string
    isConnected: boolean
    merchantStatus?: string
    metadata?: Record<string, any>
}

export interface PaymentGatewayTransaction {
    id: string
    gatewayId: string
    agencyId: string
    amount: number
    currency: string
    status: 'pending' | 'completed' | 'failed' | 'refunded'
    metadata?: Record<string, any>
    createdAt: Date
    updatedAt: Date
}

// ============================================================================
// Tipos comunes
// ============================================================================

export interface PaymentGatewayWebhookEvent {
    id: string
    type: string
    data: Record<string, any>
    createdAt: Date
} 