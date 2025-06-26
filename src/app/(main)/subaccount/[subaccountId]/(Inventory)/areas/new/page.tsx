import { getAuthUserDetails } from "@/lib/queries"
import { redirect } from "next/navigation"
import AreaForm from "@/components/inventory/AreaForm"

const NewAreaPage = async ({ params }: { params: { agencyId: string } }) => {
  const user = await getAuthUserDetails()
  if (!user) return redirect("/sign-in")

  const agencyId = params.agencyId
  if (!user.Agency) {
    return redirect("/agency")
  }

  return <AreaForm agencyId={agencyId} isOpen={true} onClose={() => {}} />
}

export default NewAreaPage
