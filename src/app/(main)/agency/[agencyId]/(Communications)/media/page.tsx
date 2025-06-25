import BlurPage from '@/components/global/blur-page'
import MediaComponent from '@/components/media'
import { getMedia } from '@/lib/queries'
import { db } from '@/lib/db'
import React from 'react'

type Props = {
  params: { agencyId: string }
}

const MediaPage = async ({ params }: Props) => {
  
  if (!params.agencyId) {
    return (
      <BlurPage>
        <div className="flex items-center justify-center w-full h-full">
          <p className="text-destructive">Error: No se proporcionó ID de agencia</p>
        </div>
      </BlurPage>
    )
  }
  
  const subAccounts = await db.subAccount.findMany({
    where: {
      agencyId: params.agencyId,
    },
    select: {
      id: true
    }
  })
  
  const firstSubAccountId = subAccounts.length > 0 ? subAccounts[0].id : ''
  
  // Call getMedia function to get the proper data structure
  const data = await getMedia(params.agencyId, true) // true indicates it's an agencyId

  return (
    <BlurPage>
      <MediaComponent
        data={data}
        subaccountId={firstSubAccountId}
        agencyId={params.agencyId}
      />
    </BlurPage>
  )
}

export default MediaPage