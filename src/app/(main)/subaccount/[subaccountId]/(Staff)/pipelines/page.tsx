import { db } from '@/lib/db'
import { redirect } from 'next/navigation'
import React from 'react'
import BlurPage from '@/components/global/blur-page'
import { Button } from '@/components/ui/button'
import Link from 'next/link'
import { PlusCircleIcon } from 'lucide-react'

type Props = {
  params: { agencyId: string }
}

const Pipelines = async ({ params }: Props) => {
  // Obtener todas las subcuentas de la agencia
  const subAccounts = await db.subAccount.findMany({
    where: {
      agencyId: params.agencyId,
    },
    select: {
      id: true
    }
  })
  
  // Si no hay subcuentas, mostrar mensaje informativo y botón para crear subcuentas
  if (subAccounts.length === 0) {
    return (
      <BlurPage>
        <div className="flex flex-col items-center justify-center h-full p-4 text-center">
          <h2 className="text-2xl font-bold mb-2">No hay subcuentas disponibles</h2>
          <p className="mb-6">Necesita crear al menos una subcuenta para poder gestionar pipelines.</p>
          <Button asChild className="gap-2">
            <Link href={`/agency/${params.agencyId}/stores`}>
              <PlusCircleIcon size={20} />
              Crear Subcuenta
            </Link>
          </Button>
          <p className="mt-4 text-sm text-muted-foreground">
            Al crear una subcuenta, podrá gestionar pipelines y otros recursos asociados a ella.
          </p>
        </div>
      </BlurPage>
    )
  }
  
  // Usar la primera subcuenta para mostrar sus pipelines
  const firstSubAccountId = subAccounts[0].id
  
  const pipelineExists = await db.pipeline.findFirst({
    where: { subAccountId: firstSubAccountId },
  })

  if (pipelineExists) {
    // Redirigir a la vista de pipeline, permitiendo acceso tanto desde la agencia como desde la subcuenta
    const redirectPath = `/subaccount/${firstSubAccountId}/pipelines/${pipelineExists.id}`
    // Añadir parámetro de consulta para indicar que venimos desde la agencia
    const redirectUrl = `${redirectPath}?from=agency&agencyId=${params.agencyId}`
    return redirect(redirectUrl)
  }

  try {
    const response = await db.pipeline.create({
      data: { name: 'First Pipeline', subAccountId: firstSubAccountId },
    })

    // Redirigir a la vista de pipeline, permitiendo acceso tanto desde la agencia como desde la subcuenta
    const redirectPath = `/subaccount/${firstSubAccountId}/pipelines/${response.id}`
    // Añadir parámetro de consulta para indicar que venimos desde la agencia
    const redirectUrl = `${redirectPath}?from=agency&agencyId=${params.agencyId}`
    return redirect(redirectUrl)
  } catch (error) {
    console.error('Error al crear pipeline:', error)
    return (
      <BlurPage>
        <div className="flex flex-col items-center justify-center h-full p-4 text-center">
          <h2 className="text-2xl font-bold mb-2">Error al cargar pipelines</h2>
          <p>No se pudieron cargar los pipelines. Por favor, inténtelo de nuevo más tarde.</p>
        </div>
      </BlurPage>
    )
  }
}

export default Pipelines