import { db } from '@/lib/db'
import { redirect } from 'next/navigation'
import React from 'react'

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
  
  // Si no hay subcuentas, no hay pipelines
  if (subAccounts.length === 0) return null
  
  // Usar la primera subcuenta para mostrar sus pipelines
  const firstSubAccountId = subAccounts[0].id
  
  const pipelineExists = await db.pipeline.findFirst({
    where: { subAccountId: firstSubAccountId },
  })

  if (pipelineExists)
    return redirect(
      `/subaccount/${firstSubAccountId}/pipelines/${pipelineExists.id}`
    )

  try {
    const response = await db.pipeline.create({
      data: { name: 'First Pipeline', subAccountId: firstSubAccountId },
    })

    return redirect(
      `/subaccount/${firstSubAccountId}/pipelines/${response.id}`
    )
  } catch (error) {
    console.log()
  }
}

export default Pipelines