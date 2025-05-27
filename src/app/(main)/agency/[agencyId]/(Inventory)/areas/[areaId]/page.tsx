import { getAuthUserDetails } from "@/lib/queries"
import { redirect } from "next/navigation"
import { AreaService } from "@/lib/services/inventory-service"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { ArrowLeft } from "lucide-react"
import { AreaVisualEditorWrapper } from "./components"

const WorkspaceEditorPage = async ({ params }: { params: { agencyId: string, areaId: string } }) => {
  const user = await getAuthUserDetails()
  if (!user) return redirect("/sign-in")

  const agencyId = params.agencyId
  const areaId = params.areaId

  if (!user.Agency) {
    return redirect("/agency")
  }


  // Obtener el área específica
  let area = null
  try {
    const areas = await AreaService.getAreas(agencyId)
    area = areas.find((a: any) => a._id === areaId)
  } catch (error) {
    console.error("Error al cargar el área:", error)
  }

  if (!area) {
    return redirect(`/agency/${agencyId}/areas`)
  }

  return (
    <div className="container mx-auto p-4">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-2">
          <Link href={`/agency/${agencyId}/areas`}>
            <Button variant="outline" size="icon">
              <ArrowLeft className="h-4 w-4" />
            </Button>
          </Link>
          <h1 className="text-2xl font-bold">Editor Visual de Espacios - {area.name}</h1>
        </div>
      </div>

      <AreaVisualEditorWrapper 
        areaId={areaId} 
        agencyId={agencyId} 
        initialLayout={area.layout || { items: [] }} 
      />

      <div className="mt-6">
        <Card>
          <CardHeader>
            <CardTitle>🧠 Funcionalidades No-Code</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
              <Button variant="outline" className="h-auto py-4 flex flex-col items-center justify-center">
                <div className="text-2xl mb-2">🔧</div>
                <h3 className="font-medium text-sm">Constructor Drag-and-Drop</h3>
                <p className="text-xs text-muted-foreground text-center mt-1">Crea áreas, mueve productos, redimensiona espacios</p>
              </Button>
              
              <Button variant="outline" className="h-auto py-4 flex flex-col items-center justify-center">
                <div className="text-2xl mb-2">🧩</div>
                <h3 className="font-medium text-sm">Componentes Personalizables</h3>
                <p className="text-xs text-muted-foreground text-center mt-1">Define tipos de contenedor, productos y reglas</p>
              </Button>
              
              <Button variant="outline" className="h-auto py-4 flex flex-col items-center justify-center">
                <div className="text-2xl mb-2">📐</div>
                <h3 className="font-medium text-sm">Escala Real</h3>
                <p className="text-xs text-muted-foreground text-center mt-1">Define medidas reales para representación fiel</p>
              </Button>
              
              <Button variant="outline" className="h-auto py-4 flex flex-col items-center justify-center">
                <div className="text-2xl mb-2">🧠</div>
                <h3 className="font-medium text-sm">Lógica de Validación</h3>
                <p className="text-xs text-muted-foreground text-center mt-1">Reglas para evitar sobrecarga y validar tipos</p>
              </Button>
              
              <Button variant="outline" className="h-auto py-4 flex flex-col items-center justify-center">
                <div className="text-2xl mb-2">🗃️</div>
                <h3 className="font-medium text-sm">Versionado</h3>
                <p className="text-xs text-muted-foreground text-center mt-1">Guarda cambios y vuelve a configuraciones anteriores</p>
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

export default WorkspaceEditorPage