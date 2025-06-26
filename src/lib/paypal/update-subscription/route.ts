import { NextResponse } from 'next/server'
import { paypal } from '@/lib/paypal'
import { db } from '@/lib/db'

export async function PATCH(req: Request) {
  try {
    const body = await req.json()
    const { subscriptionId, agencyId, planId } = body

    if (!subscriptionId || !agencyId || !planId) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      )
    }

    // Obtener la agencia
    const agency = await db.agency.findUnique({
      where: { id: agencyId },
      include: { Subscription: true },
    })

    if (!agency) {
      return NextResponse.json(
        { error: 'Agency not found' },
        { status: 404 }
      )
    }

    // Actualizar la suscripción en PayPal
    const updatedSubscription = await paypal.updateSubscription(subscriptionId, planId)

    // Actualizar la suscripción en la base de datos
    await db.subscription.update({
      where: { id: agency.Subscription?.id },
      data: {
        plan: planId,
        currentPeriodEndDate: new Date(updatedSubscription.billing_info.next_billing_time),
      },
    })

    return NextResponse.json({
      success: true,
      subscription: updatedSubscription,
    })
  } catch (error) {
    console.error('Error updating subscription:', error)
    return NextResponse.json(
      { error: 'Failed to update subscription' },
      { status: 500 }
    )
  }
} 