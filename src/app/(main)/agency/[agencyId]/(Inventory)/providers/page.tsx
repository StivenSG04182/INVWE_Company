import { getAuthUserDetails } from "@/lib/queries"
import { getProviders } from "@/lib/queries2"
import { redirect } from "next/navigation"
import ProvidersPage from "@/components/providers/providers-page"

const ProvidersPageWrapper = async ({ params }: { params: { agencyId: string } }) => {
  const user = await getAuthUserDetails()
  if (!user) return redirect("/sign-in")

  const agencyId = params.agencyId
  if (!user.Agency) {
    return redirect("/agency")
  }

  const providers = await getProviders(agencyId)

  return <ProvidersPage agencyId={agencyId} />
}

export default ProvidersPageWrapper
