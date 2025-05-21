// Utilizamos fetch directamente en lugar del SDK de PayPal
// Esto evita problemas de compatibilidad con Next.js

const PAYPAL_API_URL = process.env.NODE_ENV === 'production'
  ? 'https://api-m.paypal.com'
  : 'https://api-m.sandbox.paypal.com'

// Función para obtener un token de acceso
async function getAccessToken() {
  const clientId = process.env.PAYPAL_CLIENT_ID!
  const clientSecret = process.env.PAYPAL_CLIENT_SECRET!
  
  const auth = Buffer.from(`${clientId}:${clientSecret}`).toString('base64')
  
  const response = await fetch(`${PAYPAL_API_URL}/v1/oauth2/token`, {
    method: 'POST',
    headers: {
      'Authorization': `Basic ${auth}`,
      'Content-Type': 'application/x-www-form-urlencoded',
    },
    body: 'grant_type=client_credentials',
  })
  
  const data = await response.json()
  return data.access_token
}

// Función para hacer peticiones a la API de PayPal
async function paypalRequest(endpoint: string, method: string, body?: any) {
  const accessToken = await getAccessToken()
  
  const response = await fetch(`${PAYPAL_API_URL}${endpoint}`, {
    method,
    headers: {
      'Authorization': `Bearer ${accessToken}`,
      'Content-Type': 'application/json',
    },
    body: body ? JSON.stringify(body) : undefined,
  })
  
  return response.json()
}

// Mapeo de planes a IDs de PayPal
const planMapping: Record<string, string> = {
  'P-0': 'P-0', // Plan gratuito
  'P-1': 'P-1', // Plan Profesional
  'P-2': 'P-2', // Plan Empresarial
  'P-3': 'P-3', // Plan Personalizado
}

export const paypal = {
  // Obtener detalles de una suscripción
  async getSubscription(subscriptionId: string) {
    return paypalRequest(`/v1/billing/subscriptions/${subscriptionId}`, 'GET')
  },

  // Listar planes disponibles
  async listPlans() {
    return paypalRequest('/v1/billing/plans', 'GET')
  },

  // Crear un nuevo plan
  async createPlan(data: {
    name: string
    description: string
    type: string
    payment_definitions: any[]
  }) {
    return paypalRequest('/v1/billing/plans', 'POST', data)
  },

  // Listar transacciones de una suscripción
  async listTransactions(subscriptionId: string) {
    return paypalRequest(`/v1/billing/subscriptions/${subscriptionId}/transactions`, 'GET')
  },

  // Crear una suscripción
  async createSubscription(planId: string, customerId: string) {
    // Obtener el ID de plan de PayPal correspondiente
    const paypalPlanId = planMapping[planId] || planId
    
    return paypalRequest('/v1/billing/subscriptions', 'POST', {
      plan_id: paypalPlanId,
      application_context: {
        shipping_preference: 'NO_SHIPPING',
        user_action: 'SUBSCRIBE_NOW',
        return_url: `${process.env.NEXT_PUBLIC_URL}/agency/${customerId}/pricing?success=true`,
        cancel_url: `${process.env.NEXT_PUBLIC_URL}/agency/${customerId}/pricing?canceled=true`,
      },
      custom_id: customerId,
    })
  },

  // Capturar una suscripción
  async captureSubscription(subscriptionId: string) {
    return paypalRequest(`/v1/billing/subscriptions/${subscriptionId}/capture`, 'POST')
  },

  // Actualizar una suscripción
  async updateSubscription(subscriptionId: string, planId: string) {
    // Obtener el ID de plan de PayPal correspondiente
    const paypalPlanId = planMapping[planId] || planId
    
    return paypalRequest(`/v1/billing/subscriptions/${subscriptionId}`, 'PATCH', [
      {
        op: 'replace',
        path: '/plan_id',
        value: paypalPlanId,
      },
    ])
  },

  // Cancelar una suscripción
  async cancelSubscription(subscriptionId: string) {
    return paypalRequest(`/v1/billing/subscriptions/${subscriptionId}/cancel`, 'POST', {
      reason: 'Customer requested cancellation',
    })
  }
} 