import { getFunnels } from '@/lib/queries'
import React from 'react'
import { Plus } from 'lucide-react'
import { columns } from './columns'
import FunnelForm from '@/components/forms/funnel-form'
import BlurPage from '@/components/global/blur-page'
import FunnelsDataTable from './data-table'
import { db } from '@/lib/db'
import { getAgencyDetails } from '@/lib/queries'
import { redirect } from 'next/navigation'

const Funnels = async ({ params }: { params: { agencyId: string } }) => {
  // Verificar configuraciones requeridas
  const agencyDetails = await getAgencyDetails(params.agencyId)
  const requiredSettings = [
    agencyDetails?.paymentGatewayConfigured,
    agencyDetails?.address,
    agencyDetails?.phone
  ]

  if (requiredSettings.some(setting => !setting)) {
    redirect(`/agency/${params.agencyId}/launchpad`)
  }

  // Obtener todas las subcuentas de la agencia
  const subAccounts = await db.subAccount.findMany({
    where: {
      agencyId: params.agencyId,
    },
    select: {
      id: true
    }
  })
  
  // Si no hay subcuentas, mostrar mensaje informativo
  if (subAccounts.length === 0) {
    return (
      <BlurPage>
        <div className="flex flex-col items-center justify-center h-full p-4 text-center">
          <h2 className="text-2xl font-bold mb-2">No hay subcuentas disponibles</h2>
          <p>Necesita crear al menos una subcuenta para poder gestionar embudos.</p>
        </div>
      </BlurPage>
    )
  }
  
  // Usar la primera subcuenta para mostrar sus embudos
  const firstSubAccountId = subAccounts[0].id
  const funnels = await getFunnels(firstSubAccountId)
  if (!funnels) {
    return (
      <BlurPage>
        <div className="flex flex-col items-center justify-center h-full p-4 text-center">
          <h2 className="text-2xl font-bold mb-2">No hay embudos disponibles</h2>
          <p>No se encontraron embudos para esta subcuenta.</p>
        </div>
      </BlurPage>
    )
  }

  return (
    <BlurPage>
      <FunnelsDataTable
        actionButtonText={
          <>
            <Plus size={15} />
            Create Funnel
          </>
        }
        modalChildren={
          <FunnelForm subAccountId={firstSubAccountId}></FunnelForm>
        }
        filterValue="name"
        columns={columns}
        data={funnels}
      />
    </BlurPage>
  )
}

export default Funnels