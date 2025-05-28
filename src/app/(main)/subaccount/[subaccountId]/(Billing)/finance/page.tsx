import { getAuthUserDetails } from "@/lib/queries"
import { redirect } from "next/navigation"
import { UnifiedFinanceDashboard } from "@/components/finance/unified-finance-dashboard"

const FinancePage = async ({ params }: { params: { agencyId: string } }) => {
    const user = await getAuthUserDetails()
    if (!user) return redirect("/sign-in")

    const agencyId = params.agencyId
    if (!user.Agency) {
        return redirect("/agency")
    }

    return <UnifiedFinanceDashboard agencyId={agencyId} />
}

export default FinancePage
