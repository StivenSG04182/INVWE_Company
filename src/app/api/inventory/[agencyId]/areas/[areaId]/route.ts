import { NextRequest, NextResponse } from 'next/server'
import { getAuthUserDetails } from '@/lib/queries'
import { AreaService } from '@/lib/services/inventory-service'

// Manejador para actualizar un área específica
export async function PUT(
  req: NextRequest,
  { params }: { params: { agencyId: string; areaId: string } }
) {
  try {
    const user = await getAuthUserDetails()
    if (!user) {
      return new NextResponse('Unauthorized', { status: 401 })
    }

    const { agencyId, areaId } = params
    const body = await req.json()

    // Verificar que el usuario tenga acceso a la agencia
    const userAgency = user.Agency?.id === agencyId ? user.Agency : undefined
    if (!userAgency) {
      return new NextResponse('Unauthorized', { status: 401 })
    }

    // Actualizar el área con el nuevo layout
    const updatedArea = await AreaService.updateArea(areaId, {
      layout: body.layout,
    })

    return NextResponse.json(updatedArea)
  } catch (error) {
    console.error('Error al actualizar el área:', error)
    return new NextResponse('Error al actualizar el área', { status: 500 })
  }
}

// Manejador para obtener un área específica
export async function GET(
  req: NextRequest,
  { params }: { params: { agencyId: string; areaId: string } }
) {
  try {
    const user = await getAuthUserDetails()
    if (!user) {
      return new NextResponse('Unauthorized', { status: 401 })
    }

    const { agencyId, areaId } = params

    // Verificar que el usuario tenga acceso a la agencia
    const userAgency = user.Agency?.id === agencyId ? user.Agency : undefined
    if (!userAgency) {
      return new NextResponse('Unauthorized', { status: 401 })
    }

    // Obtener todas las áreas
    const areas = await AreaService.getAreas(agencyId)
    
    // Encontrar el área específica
    const area = areas.find((a: any) => a._id === areaId)
    
    if (!area) {
      return new NextResponse('Área no encontrada', { status: 404 })
    }

    return NextResponse.json(area)
  } catch (error) {
    console.error('Error al obtener el área:', error)
    return new NextResponse('Error al obtener el área', { status: 500 })
  }
}