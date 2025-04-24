import { NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { auth } from '@clerk/nextjs/server'

export async function GET() {
  try {
    const { userId } = auth()
    if (!userId) {
      return NextResponse.json(
        { error: 'No autorizado' },
        { status: 401 }
      )
    }

    // Obtener las agencias a las que pertenece el usuario
    const userAgencies = await db.user.findUnique({
      where: { id: userId },
      select: {
        Agency: {
          select: {
            id: true,
            name: true,
            agencyLogo: true,
          }
        }
      }
    })

    if (!userAgencies?.Agency) {
      return NextResponse.json({
        success: true,
        agencies: []
      })
    }

    return NextResponse.json({
      success: true,
      agencies: [userAgencies.Agency]
    })
  } catch (error) {
    console.error('Error fetching agencies:', error)
    return NextResponse.json(
      { error: 'Error interno del servidor' },
      { status: 500 }
    )
  }
} 