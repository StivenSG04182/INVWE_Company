import React from 'react'
import { Funnel } from '@prisma/client'
import FunnelForm from '@/components/forms/funnel-form'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import FunnelProductsTable from './funnel-products-table'
import { getPaymentGateway } from '@/lib/payment-queries'
import { getProducts, getCategories } from '@/lib/queries2'

interface FunnelSettingsProps {
  agencyId: string
  defaultData: Funnel
}

const FunnelSettings: React.FC<FunnelSettingsProps> = async ({
  agencyId,
  defaultData,
}) => {
  // Obtener productos y categorías
  const products = await getProducts(agencyId)
  const categories = await getCategories(agencyId)
  
  // Logs para depuración
  console.log('Products fetched:', products?.length || 0)
  console.log('Categories fetched:', categories?.length || 0)

  // Validar que tengamos datos
  if (!products || products.length === 0) {
    return (
      <div className="flex gap-4 flex-col xl:!flex-row">
        <Card className="flex-1 flex-shrink">
          <CardHeader>
            <CardTitle>Productos del Embudo</CardTitle>
            <CardDescription>
              No hay productos disponibles. Por favor, agrega algunos productos primero.
            </CardDescription>
          </CardHeader>
        </Card>
        <FunnelForm
          agencyId={agencyId}
          defaultData={defaultData}
        />
      </div>
    )
  }
  
  // Verificar conexión con pasarela de pagos
  const paymentGateway = await getPaymentGateway(agencyId, 'paypal')

  if (!paymentGateway || paymentGateway.status !== 'ACTIVE') {
    return (
      <div className="flex gap-4 flex-col xl:!flex-row">
        <Card className="flex-1 flex-shrink">
          <CardHeader>
            <CardTitle>Productos del Embudo</CardTitle>
            <CardDescription>
              Conecta una pasarela de pagos para poder vender productos en este embudo.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <p>No hay una pasarela de pagos conectada. Por favor, configura una en la sección de configuración.</p>
          </CardContent>
        </Card>
        <FunnelForm
          agencyId={agencyId}
          defaultData={defaultData}
        />
      </div>
    )
  }
  
  return (
    <div className="flex gap-4 flex-col xl:!flex-row">
      <Card className="flex-1 flex-shrink">
        <CardHeader>
          <CardTitle>Productos del Embudo</CardTitle>
          <CardDescription>
            Selecciona los productos y servicios que deseas vender en este embudo.
            Puedes vender productos de un solo pago y recurrentes.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <FunnelProductsTable
            defaultData={defaultData}
            products={products}
            categories={categories}
            agencyId={agencyId}
          />
        </CardContent>
      </Card>
      <FunnelForm
        agencyId={agencyId}
        defaultData={defaultData}
      />
    </div>
  )
}

export default FunnelSettings
