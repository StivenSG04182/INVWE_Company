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
  
  let data = null
  try {
    data = await getMedia(params.agencyId, true)
    
    if (!data?.Media || data.Media.length === 0) {
    } else {
    }
  } catch (error) {
    console.error('Error al cargar medios:', error)
  }

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