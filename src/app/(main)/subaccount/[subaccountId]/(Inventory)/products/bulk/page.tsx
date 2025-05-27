import { getAuthUserDetails } from "@/lib/queries"
import { redirect } from "next/navigation"
import BulkProductForm from "@/components/inventory/bulk-product-form"

const BulkProductPage = async ({ params }: { params: { agencyId: string } }) => {
    const user = await getAuthUserDetails()
    if (!user) return redirect("/sign-in")

    const agencyId = params.agencyId
    if (!user.Agency) {
        return redirect("/agency")
    }

    return <BulkProductForm agencyId={agencyId} />
}

export default BulkProductPage
