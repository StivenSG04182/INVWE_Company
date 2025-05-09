import { type ClassValue, clsx } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

// Función para formatear precios en formato de moneda
export function formatPrice(amount: number | string) {
  const numericAmount = typeof amount === 'string' ? parseFloat(amount) : amount;
  
  return new Intl.NumberFormat('es-CO', {
    style: 'currency',
    currency: 'COP',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0
  }).format(numericAmount);
}

// Función para generar enlaces OAuth para cualquier pasarela de pago
export function getPaymentGatewayOAuthLink(gateway: string, entityType: string, entityId: string) {
  const state = `launchpad___${entityId}`
  const redirectUri = `${process.env.NEXT_PUBLIC_URL || 'http://localhost:3000'}/${entityType}/${entityId}/launchpad?gateway=${gateway}`
  
  // Cada pasarela tiene su propia URL y parámetros
  switch(gateway) {
    case 'mercadopago':
      return `https://auth.mercadopago.com/authorization?client_id=test_client_id&response_type=code&platform_id=mp&redirect_uri=${redirectUri}&state=${state}`
    case 'paypal':
      return `https://www.sandbox.paypal.com/connect?flowEntry=static&client_id=test_client_id&scope=openid&redirect_uri=${redirectUri}&state=${state}`
  }
}