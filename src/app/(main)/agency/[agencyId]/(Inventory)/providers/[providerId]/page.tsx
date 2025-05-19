import { getAuthUserDetails } from "@/lib/queries"
import { redirect } from "next/navigation"
import ProviderForm from "@/components/inventory/ProviderForm"
import { ProviderService } from "@/lib/services/inventory-service"
import { Button } from "@/components/ui/button"
import Link from "next/link"
import { ArrowLeft, AlertTriangle } from "lucide-react"

const EditProviderPage = async ({ params }: { params: { agencyId: string; providerId: string } }) => {
    const user = await getAuthUserDetails()
    if (!user) return redirect("/sign-in")

    const agencyId = params.agencyId
    const providerId = params.providerId
    
    if (!user.Agency) {
        return redirect("/agency")
    }


    return (
        <div className="container mx-auto p-6">
            <div className="flex items-center mb-6">
                <Button variant="ghost" size="sm" asChild className="mr-4">
                    <Link href={`/agency/${agencyId}/providers`}>
                        <ArrowLeft className="h-4 w-4 mr-2" />
                        Volver
                    </Link>
                </Button>
                <h1 className="text-2xl font-bold">Editar Proveedor</h1>
            </div>
            
            <ProviderForm agencyId={agencyId} provider={provider} isEditing={true} />
        </div>
    )
}

export default EditProviderPage