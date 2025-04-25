import { NextResponse } from 'next/server'

// Simulación de la API de Wompi para OAuth
export const wompi = {
    oauth: {
        token: async ({ grant_type, code }: { grant_type: string; code: string }) => {
            // En un entorno real, aquí se haría la llamada a la API de Wompi
            // Por ahora, simulamos una respuesta exitosa
            return {
                wompi_user_id: `wompi_${Date.now()}`, // Generamos un ID único
                access_token: 'simulated_access_token',
                refresh_token: 'simulated_refresh_token'
            }
        }
    }
}

// Exportamos también funciones para otras pasarelas de pago
export const epayco = {
    oauth: {
        token: async ({ grant_type, code }: { grant_type: string; code: string }) => {
            return {
                epayco_user_id: `epayco_${Date.now()}`,
                access_token: 'simulated_access_token',
                refresh_token: 'simulated_refresh_token'
            }
        }
    }
}

export const mercadopago = {
    oauth: {
        token: async ({ grant_type, code }: { grant_type: string; code: string }) => {
            return {
                mercadopago_user_id: `mp_${Date.now()}`,
                access_token: 'simulated_access_token',
                refresh_token: 'simulated_refresh_token'
            }
        }
    }
}

export const paypal = {
    oauth: {
        token: async ({ grant_type, code }: { grant_type: string; code: string }) => {
            return {
                paypal_user_id: `paypal_${Date.now()}`,
                access_token: 'simulated_access_token',
                refresh_token: 'simulated_refresh_token'
            }
        }
    }
}

export const payu = {
    oauth: {
        token: async ({ grant_type, code }: { grant_type: string; code: string }) => {
            return {
                payu_user_id: `payu_${Date.now()}`,
                access_token: 'simulated_access_token',
                refresh_token: 'simulated_refresh_token'
            }
        }
    }
}