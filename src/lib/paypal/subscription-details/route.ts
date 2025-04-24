import { NextResponse } from 'next/server'
import { paypal } from '@/lib/paypal'
import { db } from '@/lib/db'

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url)
    const subscriptionId = searchParams.get('subscriptionId')
    const agencyId = searchParams.get('agencyId')

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

    // Obtener los detalles de la suscripción de PayPal
    const subscriptionDetails = await paypal.getSubscriptionDetails(subscriptionId)

    return NextResponse.json({
      success: true,
      subscriptionDetails,
    })
  } catch (error) {
    console.error('Error getting subscription details:', error)
    return NextResponse.json(
      { error: 'Failed to get subscription details' },
      { status: 500 }
    )
  }
} 