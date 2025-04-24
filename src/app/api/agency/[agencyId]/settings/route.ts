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
      include: {
        Settings: true,
      },
    })

    if (!agency) {
      return NextResponse.json(
        { error: 'Agencia no encontrada' },
        { status: 404 }
      )
    }

    // Verificar si el usuario pertenece a la agencia
    const userAgency = await db.user.findFirst({
      where: {
        id: userId,
        agencyId: params.agencyId,
      },
    })

    if (!userAgency) {
      return NextResponse.json(
        { error: 'No autorizado para esta agencia' },
        { status: 403 }
      )
    }

    const settings = {
      agencyName: agency.name,
      agencyDescription: agency.description || '',
      contactEmail: agency.companyEmail,
      supportEmail: agency.supportEmail || agency.companyEmail,
      notificationsEnabled: agency.Settings?.notificationsEnabled ?? true,
      emailNotificationsEnabled: agency.Settings?.emailNotificationsEnabled ?? true,
    }

    return NextResponse.json({
      success: true,
      settings,
    })
  } catch (error) {
    console.error('Error fetching agency settings:', error)
    return NextResponse.json(
      { error: 'Error interno del servidor' },
      { status: 500 }
    )
  }
}

export async function PATCH(
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

    const body = await req.json()
    const {
      agencyName,
      agencyDescription,
      contactEmail,
      supportEmail,
      notificationsEnabled,
      emailNotificationsEnabled,
    } = body

    // Verificar si el usuario pertenece a la agencia
    const userAgency = await db.user.findFirst({
      where: {
        id: userId,
        agencyId: params.agencyId,
      },
    })

    if (!userAgency) {
      return NextResponse.json(
        { error: 'No autorizado para esta agencia' },
        { status: 403 }
      )
    }

    // Actualizar la agencia y sus configuraciones
    const [updatedAgency] = await Promise.all([
      db.agency.update({
        where: { id: params.agencyId },
        data: {
          name: agencyName,
          description: agencyDescription,
          companyEmail: contactEmail,
          supportEmail,
          Settings: {
            upsert: {
              create: {
                notificationsEnabled,
                emailNotificationsEnabled,
              },
              update: {
                notificationsEnabled,
                emailNotificationsEnabled,
              },
            },
          },
        },
        include: {
          Settings: true,
        },
      }),
    ])

    return NextResponse.json({
      success: true,
      settings: {
        agencyName: updatedAgency.name,
        agencyDescription: updatedAgency.description || '',
        contactEmail: updatedAgency.companyEmail,
        supportEmail: updatedAgency.supportEmail || updatedAgency.companyEmail,
        notificationsEnabled: updatedAgency.Settings?.notificationsEnabled ?? true,
        emailNotificationsEnabled: updatedAgency.Settings?.emailNotificationsEnabled ?? true,
      },
    })
  } catch (error) {
    console.error('Error updating agency settings:', error)
    return NextResponse.json(
      { error: 'Error interno del servidor' },
      { status: 500 }
    )
  }
} 