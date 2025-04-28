import BlurPage from '@/components/global/blur-page'
import MediaComponent from '@/components/media'
import { getMedia } from '@/lib/queries'
import React from 'react'

type Props = {
  params: { subaccountId: string }
}

const MediaPage = async ({ params }: Props) => {
  // Intentar obtener los datos de media, pero no fallar si no hay datos
  let data = null
  try {
    data = await getMedia(params.subaccountId, false)
  } catch (error) {
    console.error('Error al cargar medios:', error)
    // Continuamos con data = null
  }

  return (
    <BlurPage>
      <MediaComponent
        data={data}
        subaccountId={params.subaccountId}
      />
    </BlurPage>
  )
}

export default MediaPage