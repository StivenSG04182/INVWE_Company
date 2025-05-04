import BlurPage from '@/components/global/blur-page'
import React from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Progress } from '@/components/ui/progress'
import { db } from '@/lib/db'

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
      Contact: true,
      Ticket: true,
    },
  })

  // Estadísticas básicas
  const totalContacts = subaccount?.Contact.length || 0
  const totalTickets = subaccount?.Ticket.length || 0
  
  // Calcular valor total de tickets
  const ticketValues = subaccount?.Ticket.map((ticket) => {
    return parseFloat(ticket.value) || 0
  })
  const totalValue = ticketValues?.reduce((acc, curr) => acc + curr, 0) || 0

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

        <div className="mt-8">
          <Card>
            <CardHeader>
              <CardTitle>Rendimiento Mensual</CardTitle>
              <CardDescription>Visualización de métricas a lo largo del tiempo</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="h-[300px] flex items-center justify-center border rounded-md">
                <p className="text-muted-foreground">Los gráficos de análisis detallados estarán disponibles próximamente</p>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </BlurPage>
  )
}

export default AnalyticsPage