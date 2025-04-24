/**
 * Configuración de la pasarela de pagos del proyecto (PayPal)
 * Este archivo contiene las credenciales y configuración específica para la pasarela
 * de pagos que utiliza el proyecto para sus propias transacciones.
 */

export const PROJECT_PAYPAL_CONFIG = {
    // Credenciales de la aplicación
    clientId: process.env.PAYPAL_CLIENT_ID,
    clientSecret: process.env.PAYPAL_CLIENT_SECRET,
    
    // URLs de la API
    apiBaseUrl: process.env.NODE_ENV === 'production'
        ? 'https://api-m.paypal.com'
        : 'https://api-m.sandbox.paypal.com',
    
    // Configuración de webhooks
    webhookId: process.env.PAYPAL_WEBHOOK_ID,
    
    // Configuración de planes
    defaultPlanId: process.env.PAYPAL_DEFAULT_PLAN_ID,
    
    // Configuración de moneda
    currency: 'USD',
    
    // Configuración de reintentos
    maxRetries: 3,
    retryDelay: 1000, // ms
}

/**
 * Valida que todas las credenciales necesarias estén configuradas
 */
export function validateProjectPayPalConfig() {
    const requiredFields = [
        'clientId',
        'clientSecret',
        'webhookId',
        'defaultPlanId'
    ]

    const missingFields = requiredFields.filter(
        field => !PROJECT_PAYPAL_CONFIG[field as keyof typeof PROJECT_PAYPAL_CONFIG]
    )

    if (missingFields.length > 0) {
        throw new Error(
            `Missing required PayPal project configuration: ${missingFields.join(', ')}`
        )
    }
}

/**
 * Obtiene las credenciales de PayPal del proyecto
 */
export function getProjectPayPalCredentials() {
    validateProjectPayPalConfig()
    
    return {
        clientId: PROJECT_PAYPAL_CONFIG.clientId!,
        clientSecret: PROJECT_PAYPAL_CONFIG.clientSecret!,
    }
}

/**
 * Obtiene la URL base de la API de PayPal según el entorno
 */
export function getProjectPayPalApiUrl() {
    return PROJECT_PAYPAL_CONFIG.apiBaseUrl
}

/**
 * Obtiene el ID del webhook configurado
 */
export function getProjectPayPalWebhookId() {
    validateProjectPayPalConfig()
    return PROJECT_PAYPAL_CONFIG.webhookId!
}

/**
 * Obtiene el ID del plan por defecto
 */
export function getProjectPayPalDefaultPlanId() {
    validateProjectPayPalConfig()
    return PROJECT_PAYPAL_CONFIG.defaultPlanId!
} 