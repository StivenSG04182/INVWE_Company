import { NextResponse } from 'next/server'
import { paypal } from '@/lib/paypal'
import { db } from '@/lib/db'

export async function POST(req: Request) {
  try {
    const body = await req.json()
    const { subscriptionId, agencyId } = body

    if (!subscriptionId || !agencyId) {
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

    // Cancelar la suscripción en PayPal
    const cancelledSubscription = await paypal.cancelSubscription(subscriptionId)

    // Actualizar la suscripción en la base de datos
    await db.subscription.update({
      where: { id: agency.Subscription?.id },
      data: {
        status: 'CANCELLED',
        currentPeriodEnd: new Date(cancelledSubscription.billing_info.next_billing_time),
      },
    })

    return NextResponse.json({
      success: true,
      subscription: cancelledSubscription,
    })
  } catch (error) {
    console.error('Error cancelling subscription:', error)
    return NextResponse.json(
      { error: 'Failed to cancel subscription' },
      { status: 500 }
    )
  }
} 