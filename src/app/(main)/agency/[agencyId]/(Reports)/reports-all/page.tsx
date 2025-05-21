import { getAuthUserDetails } from "@/lib/queries"
import { redirect } from "next/navigation"
import BlurPage from "@/components/global/blur-page"
import UnifiedReportsDashboard from "@/components/reports/unified-reports-dashboard"

export default async function ReportsPage({ params }: { params: { agencyId: string } }) {
  const user = await getAuthUserDetails()
  if (!user) return redirect("/sign-in")

  const agencyId = params.agencyId
  if (!user.Agency) {
    return redirect("/agency")
  }

  return (
    <BlurPage>
      <UnifiedReportsDashboard agencyId={agencyId} user={user} />
    </BlurPage>
  )
}
