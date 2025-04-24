import BlurPage from '@/components/global/blur-page'
import MediaComponent from '@/components/media'
import { getMedia } from '@/lib/queries'
import { db } from '@/lib/db'
import React from 'react'

type Props = {
  params: { agencyId: string }
}

const MediaPage = async ({ params }: Props) => {
  // Obtener todas las subcuentas de la agencia
  const subAccounts = await db.subAccount.findMany({
    where: {
      agencyId: params.agencyId,
    },
    select: {
      id: true
    }
  })
  
  // Si no hay subcuentas, no hay medios
  if (subAccounts.length === 0) return null
  
  // Usar la primera subcuenta para mostrar sus medios
  const firstSubAccountId = subAccounts[0].id
  const data = await getMedia(firstSubAccountId)

  return (
    <BlurPage>
      <MediaComponent
        data={data}
        subaccountId={firstSubAccountId}
      />
    </BlurPage>
  )
}

export default MediaPage