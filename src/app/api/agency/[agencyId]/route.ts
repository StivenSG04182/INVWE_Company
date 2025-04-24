import { NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { auth } from '@clerk/nextjs/server'

export async function GET(
  req: Request,
  { params }: { params: { agencyId: string } }
) {
  try {
    const { userId } = auth()
    if (!userId) {
      return NextResponse.json(
        { error: 'No autorizado' },
        { status: 401 }
      )
    }

    const agency = await db.agency.findUnique({
      where: { id: params.agencyId },
      select: {
        name: true,
        agencyLogo: true,
      },
    })

    if (!agency) {
      return NextResponse.json(
        { error: 'Agencia no encontrada' },
        { status: 404 }
      )
    }

    return NextResponse.json({
      success: true,
      agency,
    })
  } catch (error) {
    console.error('Error fetching agency:', error)
    return NextResponse.json(
      { error: 'Error interno del servidor' },
      { status: 500 }
    )
  }
} 