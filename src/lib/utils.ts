import { type ClassValue, clsx } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

// Función para generar enlaces OAuth para Wompi
export function getWompiOAuthLink(entityType: string, state: string) {
  const clientId = process.env.WOMPI_CLIENT_ID || 'test_client_id'
  const redirectUri = `${process.env.NEXT_PUBLIC_URL || 'http://localhost:3000'}/${entityType}/${entityType === 'agency' ? state.split('___')[1] : state.split('___')[1]}/launchpad`
  
  return `https://id.wompi.co/connect/authorize?client_id=${clientId}&response_type=code&scope=read_merchant&redirect_uri=${redirectUri}&state=${state}`
}

// Función para generar enlaces OAuth para cualquier pasarela de pago
export function getPaymentGatewayOAuthLink(gateway: string, entityType: string, entityId: string) {
  const state = `launchpad___${entityId}`
  const redirectUri = `${process.env.NEXT_PUBLIC_URL || 'http://localhost:3000'}/${entityType}/${entityId}/launchpad?gateway=${gateway}`
  
  // Cada pasarela tiene su propia URL y parámetros
  switch(gateway) {
    case 'wompi':
      return getWompiOAuthLink(entityType, state)
    case 'epayco':
      return `https://secure.epayco.co/oauth2/authorize?client_id=test_client_id&response_type=code&redirect_uri=${redirectUri}&state=${state}`
    case 'mercadopago':
      return `https://auth.mercadopago.com/authorization?client_id=test_client_id&response_type=code&platform_id=mp&redirect_uri=${redirectUri}&state=${state}`
    case 'paypal':
      return `https://www.sandbox.paypal.com/connect?flowEntry=static&client_id=test_client_id&scope=openid&redirect_uri=${redirectUri}&state=${state}`
    case 'payu':
      return `https://api.payulatam.com/oauth/authorize?client_id=test_client_id&response_type=code&redirect_uri=${redirectUri}&state=${state}`
    default:
      return getWompiOAuthLink(entityType, state)
  }
}