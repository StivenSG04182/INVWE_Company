import BlurPage from '@/components/global/blur-page'
import MediaComponent from '@/components/media'
import { getMedia } from '@/lib/queries'
import { db } from '@/lib/db'
import React from 'react'

type Props = {
  params: { agencyId: string }
}

const MediaPage = async ({ params }: Props) => {
  console.log('MediaPage: Renderizando con agencyId:', params.agencyId);
  
  if (!params.agencyId) {
    console.error('MediaPage: No se proporcionó agencyId');
    return (
      <BlurPage>
        <div className="flex items-center justify-center w-full h-full">
          <p className="text-destructive">Error: No se proporcionó ID de agencia</p>
        </div>
      </BlurPage>
    )
  }
  
  // Obtener todas las tiendas de la agencia
  const subAccounts = await db.subAccount.findMany({
    where: {
      agencyId: params.agencyId,
    },
    select: {
      id: true
    }
  })
  
  console.log(`MediaPage: Encontradas ${subAccounts.length} tiendas para la agencia`);
  const firstSubAccountId = subAccounts.length > 0 ? subAccounts[0].id : ''
  console.log('MediaPage: Primera tienda ID:', firstSubAccountId);
  
  // Intentar obtener los datos de media, pero no fallar si no hay datos
  let data = null
  try {
    console.log('MediaPage: Llamando a getMedia con agencyId:', params.agencyId, 'isAgencyId:', true);
    // Usamos el agencyId directamente con el nuevo parámetro isAgencyId
    data = await getMedia(params.agencyId, true)
    console.log('MediaPage: Datos recibidos de getMedia:', {
      dataExists: !!data,
      mediaLength: data?.Media?.length || 0
    });
    
    // Verificamos si realmente tenemos archivos multimedia
    if (!data?.Media || data.Media.length === 0) {
      console.log('MediaPage: No se encontraron archivos multimedia para la agencia');
    } else {
      console.log(`MediaPage: Se encontraron ${data.Media.length} archivos multimedia`);
      // Mostramos información del primer archivo para depuración
      console.log('MediaPage: Primer archivo multimedia:', {
        id: data.Media[0].id,
        name: data.Media[0].name,
        subAccountId: data.Media[0].subAccountId,
        agencyId: data.Media[0].agencyId
      });
    }
  } catch (error) {
    console.error('Error al cargar medios:', error)
    // Continuamos con data = null
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