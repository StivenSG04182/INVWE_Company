import { getAuthUserDetails } from "@/lib/queries"
import { redirect } from "next/navigation"
import ProviderForm from "@/components/inventory/ProviderForm"

const NewProviderPage = async ({ params }: { params: { agencyId: string } }) => {
    const user = await getAuthUserDetails()
    if (!user) return redirect("/sign-in")

    const agencyId = params.agencyId
    if (!user.Agency) {
        return redirect("/agency")
    }

    return <ProviderForm agencyId={agencyId} isOpen={true} onClose={() => {}} />
}

export default NewProviderPage
