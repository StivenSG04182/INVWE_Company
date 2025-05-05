import { getAuthUserDetails } from "@/lib/queries"
import { redirect } from "next/navigation"
import MovementForm from "@/components/inventory/MovementForm"

const MovementPage = async ({
  params,
}: {
  params: { agencyId: string; type: string }
}) => {
  const user = await getAuthUserDetails()
  if (!user) return redirect("/sign-in")

  const agencyId = params.agencyId
  if (!user.Agency) {
    return redirect("/agency")
  }

  // Validar que el tipo sea válido
  const type = params.type
  if (type !== "entrada" && type !== "salida" && type !== "transferencia") {
    return redirect(`/agency/${agencyId}/movements`)
  }

  return <MovementForm agencyId={agencyId} type={type as "entrada" | "salida"} />
}

export default MovementPage
