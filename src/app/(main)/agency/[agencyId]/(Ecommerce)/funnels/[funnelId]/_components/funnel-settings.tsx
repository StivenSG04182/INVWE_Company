import React from 'react'

import { Funnel, SubAccount } from '@prisma/client'
import { db } from '@/lib/db'
import FunnelForm from '@/components/forms/funnel-form'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import FunnelProductsTable from './funnel-products-table'

interface FunnelSettingsProps {
  subaccountId: string
  defaultData: Funnel
}

const FunnelSettings: React.FC<FunnelSettingsProps> = async ({
  subaccountId,
  defaultData,
}) => {
  //Conecta tu pasarela de pagos para vender productos

  const subaccountDetails = await db.subAccount.findUnique({
    where: {
      id: subaccountId,
    },
  })

  if (!subaccountDetails) return <h1>Detalles de la agencia no encontrados</h1>
  if (!subaccountDetails.connectAccountId) return

  console.log(subaccountDetails)
  return (
    <div className="flex gap-4 flex-col xl:!flex-row">
      <Card className="flex-1 flex-shrink">
        <CardHeader>
          <CardTitle>Productos de Comercio Electrónico</CardTitle>
          <CardDescription>
          Seleccione los productos y servicios que desea vender en este comercio electrónico.
          Usted puede vender productos de una sola vez y productos recurrentes también.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <>
            {subaccountDetails.connectAccountId ? (
              <FunnelProductsTable
                defaultData={defaultData}
              />
            ) : (
              'Conecta tu pasarela de pagos para vender productos.'
            )}
          </>
        </CardContent>
      </Card>
      <FunnelForm
        subAccountId={subaccountId}
        defaultData={defaultData}
      />
    </div>
  )
}

export default FunnelSettings