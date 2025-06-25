"use client"

import type React from "react"
import { useState, useEffect, useTransition, useCallback, useMemo } from "react"
import { DndProvider } from "react-dnd"
import { HTML5Backend } from "react-dnd-html5-backend"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Button } from "@/components/ui/button"
import { Separator } from "@/components/ui/separator"
import { ArrowLeft, Save, Undo, Redo, Code, Download, Settings, Loader2 } from "lucide-react"
import Link from "next/link"
import { ComponentSidebar } from "./component-sidebar"
import { EmailCanvas } from "./email-canvas"
import { PropertiesPanel } from "./properties-panel"
import { PreviewPanel } from "./preview-panel"
import { useEmailEditorStore } from "@/providers/email-editor/email-editor-provider"
import { getEmailTemplateById } from "@/lib/email-template-queries"
import { useRouter } from "next/navigation"
import { toast } from "sonner"
import { saveTemplate } from "@/lib/template-actions"
import { generateEmailHTML, generateTemplateThumbnail } from "@/lib/utils/email-utils"

interface EmailTemplateEditorProps {
  agencyId: string
  templateId: string
  isNewTemplate: boolean
}

const EmailTemplateEditor: React.FC<EmailTemplateEditorProps> = ({ agencyId, templateId, isNewTemplate }) => {
  const router = useRouter()
  const [isPending, startTransition] = useTransition()
  const [templateName, setTemplateName] = useState(isNewTemplate ? "Nueva Plantilla" : "")
  const [templateDescription, setTemplateDescription] = useState("")
  const [activeTab, setActiveTab] = useState<"editor" | "preview" | "code">("editor")
  const [isLoading, setIsLoading] = useState(!isNewTemplate)

  const { selectedElement, elements, undo, redo, canUndo, canRedo, loadTemplate } = useEmailEditorStore()

  // Memoizar el HTML generado para evitar recálculos innecesarios
  const generatedHTML = useMemo(() => {
    return generateEmailHTML(elements, templateName)
  }, [elements, templateName])

  // Cargar plantilla existente
  useEffect(() => {
    if (!isNewTemplate && templateId) {
      const loadExistingTemplate = async () => {
        try {
          setIsLoading(true)
          const template = await getEmailTemplateById(templateId)
          setTemplateName(template.name)
          setTemplateDescription(template.description || "")
          loadTemplate(template.content, templateId)
        } catch (error) {
          toast.error("Error al cargar la plantilla")
          console.error(error)
        } finally {
          setIsLoading(false)
        }
      }

      loadExistingTemplate()
    }
  }, [isNewTemplate, templateId, loadTemplate])

  // Optimizar el guardado con useTransition
  const handleSave = useCallback(() => {
    startTransition(async () => {
      try {
        const thumbnail = await generateTemplateThumbnail(elements)

        const templateData = {
          name: templateName,
          description: templateDescription,
          content: elements,
          thumbnail,
          status: "DRAFT" as const,
          category: "Email",
          agencyId,
        }

        const result = await saveTemplate(templateData, isNewTemplate, templateId)

        if (result.success) {
          toast.success(isNewTemplate ? "Plantilla creada correctamente" : "Plantilla actualizada correctamente")
          if (isNewTemplate) {
            router.push(`/agency/${agencyId}/email-templates`)
          }
        } else {
          toast.error(result.error || "Error al guardar la plantilla")
        }
      } catch (error) {
        console.error("Error al guardar la plantilla:", error)
        toast.error("Error al guardar la plantilla")
      }
    })
  }, [templateName, templateDescription, elements, agencyId, isNewTemplate, templateId, router])

  // Optimizar la exportación
  const handleExport = useCallback(() => {
    try {
      const blob = new Blob([generatedHTML], { type: "text/html" })
      const url = URL.createObjectURL(blob)
      const link = document.createElement("a")

      link.href = url
      link.download = `${templateName.toLowerCase().replace(/\s+/g, "-")}.html`
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)
      URL.revokeObjectURL(url)

      toast.success("Plantilla exportada correctamente")
    } catch (error) {
      console.error("Error al exportar la plantilla:", error)
      toast.error("Error al exportar la plantilla")
    }
  }, [generatedHTML, templateName])

  // Memoizar los handlers para evitar re-renders innecesarios
  const handleUndo = useCallback(() => undo(), [undo])
  const handleRedo = useCallback(() => redo(), [redo])

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="flex items-center gap-2">
          <Loader2 className="h-6 w-6 animate-spin" />
          <span>Cargando plantilla...</span>
        </div>
      </div>
    )
  }

  return (
    <DndProvider backend={HTML5Backend}>
      <div className="flex flex-col h-screen bg-background">
        {/* Header optimizado */}
        <header className="flex justify-between items-center p-4 border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
          <div className="flex items-center gap-4">
            <Link href={`/agency/${agencyId}/email-templates`}>
              <Button variant="ghost" size="icon">
                <ArrowLeft className="h-5 w-5" />
              </Button>
            </Link>
            <div>
              <input
                type="text"
                value={templateName}
                onChange={(e) => setTemplateName(e.target.value)}
                className="text-xl font-semibold bg-transparent border-none focus:outline-none focus:ring-1 focus:ring-primary rounded px-2"
                placeholder="Nombre de la plantilla"
              />
              <p className="text-sm text-muted-foreground">Editor de plantillas de email</p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <Button variant="outline" size="sm" onClick={handleUndo} disabled={!canUndo || isPending}>
              <Undo className="h-4 w-4 mr-1" />
              Deshacer
            </Button>
            <Button variant="outline" size="sm" onClick={handleRedo} disabled={!canRedo || isPending}>
              <Redo className="h-4 w-4 mr-1" />
              Rehacer
            </Button>
            <Separator orientation="vertical" className="h-6" />
            <Button variant="outline" size="sm" onClick={handleExport} disabled={isPending}>
              <Download className="h-4 w-4 mr-1" />
              Exportar
            </Button>
            <Button onClick={handleSave} disabled={isPending || !templateName.trim()}>
              {isPending ? (
                <>
                  <Loader2 className="h-4 w-4 mr-1 animate-spin" />
                  Guardando...
                </>
              ) : (
                <>
                  <Save className="h-4 w-4 mr-1" />
                  Guardar
                </>
              )}
            </Button>
          </div>
        </header>

        {/* Contenido principal optimizado */}
        <Tabs value={activeTab} onValueChange={(value) => setActiveTab(value as any)} className="flex-1 flex flex-col">
          <div className="px-4 pt-2 border-b">
            <TabsList>
              <TabsTrigger value="editor">Editor</TabsTrigger>
              <TabsTrigger value="preview">Vista Previa</TabsTrigger>
              <TabsTrigger value="code">Código</TabsTrigger>
            </TabsList>
          </div>

          <TabsContent value="editor" className="flex-1 flex overflow-hidden m-0">
            <div className="flex h-full w-full">
              {/* Sidebar de componentes */}
              <aside className="w-64 border-r bg-muted/30 overflow-y-auto">
                <div className="p-4">
                  <h3 className="font-semibold mb-4 flex items-center gap-2">
                    <Settings className="h-4 w-4" />
                    Componentes
                  </h3>
                  <ComponentSidebar />
                </div>
              </aside>

              {/* Canvas principal */}
              <main className="flex-1 overflow-hidden">
                <EmailCanvas />
              </main>

              {/* Panel de propiedades */}
              <aside className="w-80 border-l bg-muted/30 overflow-y-auto">
                <div className="p-4">
                  <h3 className="font-semibold mb-4">Propiedades</h3>
                  {selectedElement ? (
                    <PropertiesPanel />
                  ) : (
                    <div className="text-center text-muted-foreground p-8">
                      <Settings className="h-8 w-8 mx-auto mb-2 opacity-50" />
                      <p>Selecciona un elemento para editar sus propiedades</p>
                    </div>
                  )}
                </div>
              </aside>
            </div>
          </TabsContent>

          <TabsContent value="preview" className="flex-1 m-0">
            <PreviewPanel />
          </TabsContent>

          <TabsContent value="code" className="flex-1 p-4">
            <div className="h-full bg-muted/30 rounded-lg p-4">
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-semibold">Código HTML</h3>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    navigator.clipboard.writeText(generatedHTML)
                    toast.success("Código copiado al portapapeles")
                  }}
                >
                  <Code className="h-4 w-4 mr-1" />
                  Copiar Código
                </Button>
              </div>
              <pre className="bg-background p-4 rounded-md overflow-auto h-[calc(100%-60px)] text-sm">
                <code>{generatedHTML}</code>
              </pre>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </DndProvider>
  )
}

export default EmailTemplateEditor
