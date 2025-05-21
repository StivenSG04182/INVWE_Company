import { getFunnels } from '@/lib/queries'
import React from 'react'
import { Plus } from 'lucide-react'
import { columns } from './columns'
import FunnelForm from '@/components/forms/funnel-form'
import BlurPage from '@/components/global/blur-page'
import FunnelsDataTable from './data-table'

const Funnels = async ({ params }: { params: { agencyId: string } }) => {
  const funnels = await getFunnels(params.agencyId)
  if (!funnels) return null

  return (
    <BlurPage>
      <FunnelsDataTable
        actionButtonText={
          <>
            <Plus size={15} />
            Crear comercio electrónico
          </>
        }
        modalChildren={
          <FunnelForm subAccountId={params.agencyId}></FunnelForm>
        }
        filterValue="nombre"
        columns={columns}
        data={funnels}
      />
    </BlurPage>
  )
}

export default Funnels