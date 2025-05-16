import { getAuthUserDetails } from "@/lib/queries"
import { redirect } from "next/navigation"
import BlurPage from "@/components/global/blur-page"
import UnifiedClientsDashboard from "@/components/clients/unified-clients-dashboard"

export default async function ClientsPage({ params }: { params: { agencyId: string } }) {
  const user = await getAuthUserDetails()
  if (!user) return redirect("/sign-in")

  const agencyId = params.agencyId
  if (!user.Agency) {
    return redirect("/agency")
  }

  return (
    <BlurPage>
      <UnifiedClientsDashboard agencyId={agencyId} user={user} />
    </BlurPage>
  )
}
