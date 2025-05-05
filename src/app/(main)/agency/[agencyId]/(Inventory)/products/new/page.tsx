import { getAuthUserDetails } from "@/lib/queries"
import { redirect } from "next/navigation"
import ProductForm from "@/components/inventory/ProductForm"

const NewProductPage = async ({ params }: { params: { agencyId: string } }) => {
  const user = await getAuthUserDetails()
  if (!user) return redirect("/sign-in")

  const agencyId = params.agencyId
  if (!user.Agency) {
    return redirect("/agency")
  }

  return <ProductForm agencyId={agencyId} />
}

export default NewProductPage
