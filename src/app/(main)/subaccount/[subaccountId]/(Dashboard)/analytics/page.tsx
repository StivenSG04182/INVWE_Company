import BlurPage from '@/components/global/blur-page'
import React from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Progress } from '@/components/ui/progress'
import { db } from '@/lib/db'
import AnalyticsCharts from './analytics-charts'
import { AnalyticsService } from '@/lib/services/analytics-service'

type Props = {
  params: { subaccountId: string }
}

const AnalyticsPage = async ({ params }: Props) => {
  // Obtener datos de la subcuenta
  const subaccount = await db.subAccount.findUnique({
    where: {
      id: params.subaccountId,
    },
    include: {
      Agency: true,
    },
  })

  if (!subaccount) {
    return (
      <BlurPage>
        <div className="flex flex-col gap-4 p-4">
          <h1 className="text-4xl font-bold">Análisis de Rendimiento</h1>
          <p className="text-muted-foreground">No se encontró la subcuenta</p>
        </div>
      </BlurPage>
    )
  }

  // Obtener estadísticas generales
  const stats = await AnalyticsService.getGeneralStats(params.subaccountId)
  
  // Obtener datos para gráficos
  const monthlyData = await AnalyticsService.getMonthlySalesData(params.subaccountId)
  const categoryData = await AnalyticsService.getCategorySalesData(params.subaccountId)
  const topProducts = await AnalyticsService.getTopProducts(params.subaccountId, 5)
  
  // Extraer estadísticas
  const { totalContacts, totalTickets, totalProducts, totalValue } = stats

  return (
    <BlurPage>
      <div className="flex flex-col gap-4 p-4">
        <h1 className="text-4xl font-bold">Análisis de Rendimiento</h1>
        <p className="text-muted-foreground">
          Visualiza el rendimiento y las métricas clave de tu negocio
        </p>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-4">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium">Total de Contactos</CardTitle>
              <CardDescription>Clientes y prospectos registrados</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{totalContacts}</div>
              <Progress className="mt-2" value={totalContacts > 100 ? 100 : totalContacts} />
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium">Tickets Activos</CardTitle>
              <CardDescription>Oportunidades de venta en proceso</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{totalTickets}</div>
              <Progress className="mt-2" value={totalTickets > 100 ? 100 : totalTickets} />
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium">Valor Total</CardTitle>
              <CardDescription>Valor acumulado de oportunidades</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">${totalValue.toFixed(2)}</div>
              <Progress className="mt-2" value={totalValue > 10000 ? 100 : (totalValue/100)} />
            </CardContent>
          </Card>
        </div>

        <AnalyticsCharts 
          monthlyData={monthlyData}
          categoryData={categoryData}
          topProducts={topProducts}
        />
      </div>
    </BlurPage>
  )
}

export default AnalyticsPage