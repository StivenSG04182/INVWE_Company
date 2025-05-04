import BlurPage from '@/components/global/blur-page'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { getFunnel } from '@/lib/queries'
import Link from 'next/link'
import { redirect } from 'next/navigation'
import React from 'react'
import FunnelSettings from './_components/funnel-settings'
import FunnelSteps from './_components/funnel-steps'
// import FunnelSteps from './_components/funnel-steps'
  
type Props = {
  params: { funnelId: string; agencyId: string }
}

const FunnelPage = async ({ params }: Props) => {
  const funnelPages = await getFunnel(params.funnelId)
  if (!funnelPages)
    return redirect(`/agency/${params.agencyId}/funnels`)

  return (
    <BlurPage>
      <Link
        href={`/agency/${params.agencyId}/funnels`}
        className="flex justify-between gap-4 mb-4 text-muted-foreground"
      >
        Volver
      </Link>
      <h1 className="text-3xl mb-8">{funnelPages.name}</h1>
      <Tabs
        defaultValue="steps"
        className="w-full"
      >
        <TabsList className="grid  grid-cols-2 w-[50%] bg-transparent ">
          <TabsTrigger value="steps">Pasos</TabsTrigger>
          <TabsTrigger value="settings">Ajustes</TabsTrigger>
        </TabsList>
        <TabsContent value="steps">
          <FunnelSteps
            funnel={funnelPages}
            subaccountId={params.agencyId}
            pages={funnelPages.FunnelPages}
            funnelId={params.funnelId}
          />
        </TabsContent>
        <TabsContent value="settings">
          <h2>Opciones de Comercio Electrónico</h2>
          <FunnelSettings
            subaccountId={params.agencyId}
            defaultData={funnelPages}
          />
        </TabsContent>
      </Tabs>
    </BlurPage>
  )
}

export default FunnelPage