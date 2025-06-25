import { Suspense } from "react"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Separator } from "@/components/ui/separator"
import { Skeleton } from "@/components/ui/skeleton"
import { db } from "@/lib/db"
import { currentUser } from "@clerk/nextjs/server"
import { redirect } from "next/navigation"

// Importamos los componentes de configuración
import CompanySettingsContent from "@/components/settings/company-settings"
import ContactSettingsContent from "@/components/settings/contact-settings"
import PosSettingsContent from "@/components/settings/pos-settings"
import UsersPermissionsContent from "@/components/settings/users-permissions"
import AgencyDetails from "@/components/forms/agency-details"
import UserDetails from "@/components/forms/user-details"
import WhatsAppSettings from "@/components/settings/whatsApp-settings"
import {DIANConfigForm} from "@/components/settings/dian-config-form"

type Props = {
  params: { agencyId: string }
  searchParams: {
    tab?: string
    plan?: string
  }
}

const SettingsPage = async ({ params, searchParams }: Props) => {
  const authUser = await currentUser()
  if (!authUser) return redirect("/sign-in")

  const userDetails = await db.user.findUnique({
    where: {
      email: authUser.emailAddresses[0].emailAddress,
    },
  })

  if (!userDetails) return null

  const agencyDetails = await db.agency.findUnique({
    where: {
      id: params.agencyId,
    },
    include: {
      SubAccount: true,
    },
  })

  if (!agencyDetails) return null

  const subAccounts = agencyDetails.SubAccount
  const activeTab = searchParams.tab || "general"
  const planType = searchParams.plan || "general"

  return (
    <div className="flex flex-col gap-4 p-4">
      <div>
        <h1 className="text-3xl font-bold">Configuración</h1>
        <p className="text-muted-foreground mt-2">
          Administre la configuración de su empresa y personalice su experiencia
        </p>
      </div>
      <Separator />

      <Tabs defaultValue={activeTab} className="w-full">
        <TabsList className="w-full justify-start mb-4 overflow-x-auto">
          <TabsTrigger value="general">General</TabsTrigger>
          <TabsTrigger value="company">Empresa</TabsTrigger>
          <TabsTrigger value="contact">Contacto</TabsTrigger>
          <TabsTrigger value="pos">Punto de Venta</TabsTrigger>
          <TabsTrigger value="users">Usuarios & Permisos</TabsTrigger>
          <TabsTrigger value="whatsapp">WhatsApp</TabsTrigger>
          <TabsTrigger value="dian">DIAN</TabsTrigger>
        </TabsList>

        <TabsContent value="general" className="space-y-4">
          <Suspense fallback={<SettingsSkeleton />}>
            <div className="flex lg:!flex-row flex-col gap-4">
              <AgencyDetails data={agencyDetails} />
              <UserDetails type="agency" id={params.agencyId} subAccounts={subAccounts} userData={userDetails} />
            </div>
          </Suspense>
        </TabsContent>

        <TabsContent value="company" className="space-y-4">
          <Suspense fallback={<SettingsSkeleton />}>
            <CompanySettingsContent agencyId={params.agencyId} agencyDetails={agencyDetails} />
          </Suspense>
        </TabsContent>

        <TabsContent value="contact" className="space-y-4">
          <Suspense fallback={<SettingsSkeleton />}>
            <ContactSettingsContent agencyId={params.agencyId} agencyDetails={agencyDetails} planType={planType} />
          </Suspense>
        </TabsContent>

        <TabsContent value="pos" className="space-y-4">
          <Suspense fallback={<SettingsSkeleton />}>
            <PosSettingsContent agencyId={params.agencyId} />
          </Suspense>
        </TabsContent>

        <TabsContent value="users" className="space-y-4">
          <Suspense fallback={<SettingsSkeleton />}>
            <UsersPermissionsContent agencyId={params.agencyId} />
          </Suspense>
        </TabsContent>

        <TabsContent value="whatsapp" className="space-y-4">
          <Suspense fallback={<SettingsSkeleton />}>
            <WhatsAppSettings params={{ agencyId: params.agencyId }} />
          </Suspense>
        </TabsContent>

        <TabsContent value="dian" className="space-y-4">
          <Suspense fallback={<SettingsSkeleton />}>
            <DIANConfigForm agencyId={params.agencyId} />
          </Suspense>
        </TabsContent>
      </Tabs>
    </div>
  )
}

const SettingsSkeleton = () => {
  return (
    <div className="space-y-4">
      <div className="flex flex-col gap-2">
        <Skeleton className="h-8 w-48" />
        <Skeleton className="h-6 w-full max-w-md" />
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Skeleton className="h-[400px] w-full" />
        <Skeleton className="h-[400px] w-full" />
      </div>
    </div>
  )
}

export default SettingsPage
