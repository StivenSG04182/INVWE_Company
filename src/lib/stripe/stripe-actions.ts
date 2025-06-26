'use server'
import Stripe from 'stripe'
import { db } from '../db'
import { stripe } from '.'

export const subscriptionCreated = async (
  subscription: Stripe.Subscription,
  customerId: string
) => {
  try {
    const agency = await db.agency.findFirst({
      where: {
        customerId,
      },
      include: {
        SubAccount: true,
      },
    })
    if (!agency) {
      throw new Error('Could not find and agency to upsert the subscription')
    }

    // Nota: Stripe API v2025-05-28.basil no expone current_period ni current_period_end directamente.
    // Si necesitas la fecha de fin de periodo, revisa la documentación de Stripe para la nueva estructura.
    const data: any = {
      active: subscription.status === 'active',
      agencyId: agency.id,
      customerId,
      //@ts-ignore
      priceId: subscription.plan?.id,
      subscritiptionId: subscription.id,
      //@ts-ignore
      plan: subscription.plan?.id,
      // currentPeriodEndDate: ...
    };

    const res = await db.subscription.upsert({
      where: {
        agencyId: agency.id,
      },
      create: data,
      update: data,
    })
    console.log(`🟢 Created Subscription for ${subscription.id}`)
  } catch (error) {
    console.log('🔴 Error from Create action', error)
  }
}

export const getConnectAccountProducts = async (stripeAccount: string) => {
  // Only call Stripe API if secret key is available and stripe instance exists
  if (!process.env.STRIPE_SECRET_KEY || !stripe) {
    console.warn('STRIPE_SECRET_KEY not available or stripe instance not created, returning empty products array')
    return []
  }

  try {
    const products = await stripe.products.list(
      {
        limit: 50,
        expand: ['data.default_price'],
      },
      {
        stripeAccount,
      }
    )
    return products.data
  } catch (error) {
    console.error('Error fetching Stripe products:', error)
    return []
  }
}