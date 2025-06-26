import { getAuthUserDetails } from "@/lib/queries"
import { getProviderById } from "@/lib/queries2"
import { redirect } from "next/navigation"
import ProviderForm from "@/components/inventory/ProviderForm"
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

    // Obtener el proveedor usando la nueva función del servidor
    const provider = await getProviderById(agencyId, providerId)
    
    if (!provider) {
        return (
            <div className="container mx-auto p-6">
                <div className="flex items-center mb-6">
                    <Button variant="ghost" size="sm" asChild className="mr-4">
                        <Link href={`/agency/${agencyId}/providers`}>
                            <ArrowLeft className="h-4 w-4 mr-2" />
                            Volver
                        </Link>
                    </Button>
                    <h1 className="text-2xl font-bold">Proveedor no encontrado</h1>
                </div>
                
                <div className="flex items-center p-4 bg-amber-50 border border-amber-200 rounded-md">
                    <AlertTriangle className="h-5 w-5 text-amber-500 mr-2" />
                    <p>El proveedor solicitado no existe o no tienes permisos para acceder a él.</p>
                </div>
            </div>
        )
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
            
            <ProviderForm agencyId={agencyId} provider={{
              ...provider,
              contactName: provider.contactName ?? undefined,
              email: provider.email ?? undefined,
              phone: provider.phone ?? undefined,
              address: provider.address ?? undefined,
              subAccountId: provider.subAccountId ? provider.subAccountId : undefined,
            }} isEditing={true} isOpen={true} onClose={() => {}} />
        </div>
    )
}

export default EditProviderPage