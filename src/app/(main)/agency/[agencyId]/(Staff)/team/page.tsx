import { db } from "@/lib/db"
import DataTable from "./data-table"
import { Plus } from "lucide-react"
import { currentUser } from "@clerk/nextjs/server"
import { columns } from "./columns"
import SendInvitation from "@/components/forms/send-invitation"

type Props = {
  params: { agencyId: string }
}

const TeamPage = async ({ params }: Props) => {
  const authUser = await currentUser()
  const teamMembers = await db.user.findMany({
    where: {
      Agency: {
        id: params.agencyId,
      },
    },
    include: {
      Agency: { include: { SubAccount: true } },
      Permissions: { include: { SubAccount: true } },
    },
  })

  if (!authUser) return null
  const agencyDetails = await db.agency.findUnique({
    where: {
      id: params.agencyId,
    },
    include: {
      SubAccount: true,
    },
  })

  if (!agencyDetails) return

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Equipo</h1>
          <p className="text-muted-foreground">Administra los miembros del equipo y sus permisos</p>
        </div>
      </div>
      <div className="rounded-xl px-4 border bg-card shadow-sm">
        <DataTable
          actionButtonText={
            <>
              <Plus size={15} />
              Añadir Miembro
            </>
          }
          modalChildren={<SendInvitation agencyId={agencyDetails.id} />}
          filterValue="name"
          columns={columns}
          data={teamMembers}
        />
      </div>
    </div>
  )
}

export default TeamPage
