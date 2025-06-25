import { db } from '@/lib/db'
import { redirect } from 'next/navigation'
import React from 'react'

type Props = {
  params: { subaccountId: string }
}

const Pipelines = async ({ params }: Props) => {
  const pipelineExists = await db.pipeline.findFirst({
    where: { subAccountId: params.subaccountId },
  })

  if (pipelineExists)
    return redirect(
      `/subaccount/${params.subaccountId}/pipelines/${pipelineExists.id}`
    )

  try {
    const response = await db.pipeline.create({
      data: { name: 'First Pipeline', subAccountId: params.subaccountId },
    })

    return redirect(
      `/subaccount/${params.subaccountId}/pipelines/${response.id}`
    )
  } catch (error) {
    console.error("Error creating pipeline:", error)
    return redirect(`/subaccount/${params.subaccountId}`)
  }
}

export default Pipelines