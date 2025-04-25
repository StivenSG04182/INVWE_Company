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
  
  // Si no hay subcuentas, no hay embudos
  if (subAccounts.length === 0) return null
  
  // Usar la primera subcuenta para mostrar sus embudos
  const firstSubAccountId = subAccounts[0].id
  const funnels = await getFunnels(firstSubAccountId)
  if (!funnels) return null

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