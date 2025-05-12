import { getAuthUserDetails } from "@/lib/queries"
import { redirect } from "next/navigation"
import ProviderForm from "@/components/inventory/ProviderForm"
import { ProviderService } from "@/lib/services/inventory-service"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
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

    // Obtener proveedor
    let provider = null

    try {
        // Importar el serializador para convertir objetos MongoDB a objetos planos
        const { serializeMongoObject } = await import('@/lib/serializers')
        
        // Obtener proveedor
        const rawProvider = await ProviderService.getProviderById(providerId)
        if (!rawProvider) {
            return (
                <div className="container mx-auto p-6">
                    <Alert variant="destructive">
                        <AlertTriangle className="h-4 w-4" />
                        <AlertTitle>Error</AlertTitle>
                        <AlertDescription>El proveedor no existe o ha sido eliminado.</AlertDescription>
                    </Alert>
                    <div className="mt-4">
                        <Button variant="outline" asChild>
                            <Link href={`/agency/${agencyId}/providers`}>
                                <ArrowLeft className="h-4 w-4 mr-2" />
                                Volver a proveedores
                            </Link>
                        </Button>
                    </div>
                </div>
            )
        }
        
        // Serializar proveedor
        provider = serializeMongoObject(rawProvider)
    } catch (error) {
        console.error("Error al cargar proveedor:", error)
        return (
            <div className="container mx-auto p-6">
                <Alert variant="destructive">
                    <AlertTriangle className="h-4 w-4" />
                    <AlertTitle>Error</AlertTitle>
                    <AlertDescription>Ocurrió un error al cargar la información del proveedor.</AlertDescription>
                </Alert>
                <div className="mt-4">
                    <Button variant="outline" asChild>
                        <Link href={`/agency/${agencyId}/providers`}>
                            <ArrowLeft className="h-4 w-4 mr-2" />
                            Volver a proveedores
                        </Link>
                    </Button>
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
            
            <ProviderForm agencyId={agencyId} provider={provider} isEditing={true} />
        </div>
    )
}

export default EditProviderPage