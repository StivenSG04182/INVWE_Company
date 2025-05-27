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
  subaccountId: string // Mantenemos por compatibilidad
  agencyId?: string // Agregamos agencyId explícitamente
  defaultData: Funnel
}

const FunnelSettings: React.FC<FunnelSettingsProps> = async ({
  subaccountId,
  agencyId,
  defaultData,
}) => {
  //Conecta tu pasarela de pagos para vender productos
  console.log('=== INICIO FunnelSettings ===');
  console.log('Props recibidas:', { subaccountId, agencyId, defaultDataId: defaultData?.id });
  
  // Usamos agencyId si está disponible, de lo contrario subaccountId
  const effectiveId = agencyId || subaccountId;
  console.log('ID efectivo a utilizar:', effectiveId);
  
  // Intentamos buscar primero como agencia
  let accountDetails = null;
  try {
    accountDetails = await db.agency.findUnique({
      where: {
        id: effectiveId,
      },
    });
    
    if (accountDetails) {
      console.log('Encontrados detalles de agencia');
    } else {
      // Si no encontramos como agencia, buscamos como subaccount
      console.log('No se encontró como agencia, buscando como subcuenta...');
      accountDetails = await db.subAccount.findUnique({
        where: {
          id: effectiveId,
        },
      });
    }
  } catch (error) {
    console.error('Error al buscar detalles de cuenta:', error);
  }

  if (!accountDetails) {
    console.error('Detalles de la cuenta no encontrados');
    return <h1>Detalles de la cuenta no encontrados</h1>;
  }
  
  // Verificamos si tiene connectAccountId (puede estar en diferentes lugares según el tipo)
  const connectAccountId = 'connectAccountId' in accountDetails 
    ? accountDetails.connectAccountId 
    : null;
    
  if (!connectAccountId) {
    console.log('No se encontró connectAccountId');
    return;
  }
  
  console.log('Detalles de cuenta encontrados:', accountDetails);
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
            {connectAccountId ? (
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
        agencyId={agencyId}
        subAccountId={subaccountId}
        defaultData={defaultData}
      />
    </div>
  )
}

export default FunnelSettings