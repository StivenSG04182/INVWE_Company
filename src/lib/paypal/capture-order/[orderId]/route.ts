import { NextResponse } from 'next/server'

export async function POST(
  req: Request,
  { params }: { params: { orderId: string } }
) {
  try {
    const { orderId } = params

    const response = await fetch(
      `${process.env.PAYPAL_API_URL}/v2/checkout/orders/${orderId}/capture`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${process.env.PAYPAL_ACCESS_TOKEN}`,
        },
      }
    )

    const data = await response.json()

    if (!response.ok) {
      throw new Error(data.message || 'Failed to capture PayPal order')
    }

    return NextResponse.json(data)
  } catch (error) {
    console.error('Error capturing PayPal order:', error)
    return NextResponse.json(
      { error: 'Failed to capture PayPal order' },
      { status: 500 }
    )
  }
} 