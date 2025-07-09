import Stripe from 'stripe'

// Only initialize Stripe if secret key is available
const createStripeInstance = () => {
  const secretKey = process.env.STRIPE_SECRET_KEY
  if (!secretKey) {
    console.warn('STRIPE_SECRET_KEY not available, Stripe instance not created')
    return null
  }
  
  return new Stripe(secretKey, {
    apiVersion: '2025-06-30.basil',
    appInfo: {
      name: 'INVWE App',
      version: '0.1.0',
    },
  })
}

export const stripe = createStripeInstance()