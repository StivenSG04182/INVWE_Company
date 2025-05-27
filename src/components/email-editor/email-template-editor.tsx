"use client"

import type React from "react"
import { useState, useEffect } from "react"
import { DndProvider } from "react-dnd"
import { HTML5Backend } from "react-dnd-html5-backend"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Button } from "@/components/ui/button"
import { Separator } from "@/components/ui/separator"
import { ArrowLeft, Save, Undo, Redo, Code, Download, Settings } from "lucide-react"
import Link from "next/link"
import { ComponentSidebar } from "./component-sidebar"
import { EmailCanvas } from "./email-canvas"
import { PropertiesPanel } from "./properties-panel"
import { PreviewPanel } from "./preview-panel"
import { useEmailEditorStore } from "@/providers/email-editor/email-editor-provider"

interface EmailTemplateEditorProps {
  agencyId: string
  templateId: string
  isNewTemplate: boolean
}

const EmailTemplateEditor: React.FC<EmailTemplateEditorProps> = ({ agencyId, templateId, isNewTemplate }) => {
  const [activeTab, setActiveTab] = useState<"editor" | "preview" | "code">("editor")
  const [templateName, setTemplateName] = useState(isNewTemplate ? "Nueva Plantilla" : "Plantilla Existente")

  const { selectedElement, elements, undo, redo, canUndo, canRedo, loadTemplate } = useEmailEditorStore()

  useEffect(() => {
    if (!isNewTemplate) {
      // Cargar plantilla existente
      loadTemplate(
        [
          {
            id: "header-1",
            type: "header",
            content: "Encabezado de ejemplo",
            styles: {
              backgroundColor: "#f0f0f0",
              padding: "20px",
              textAlign: "center",
              color: "#333333",
            },
          },
        ],
        templateId,
      )
    }
  }, [isNewTemplate, templateId, loadTemplate])

  const handleSave = async () => {
    console.log("Guardando plantilla:", { templateId, templateName, elements })
    alert("Plantilla guardada correctamente")
  }

  const handleExport = () => {
    console.log("Exportando plantilla:", { templateId, templateName, elements })
    alert("Plantilla exportada correctamente")
  }

  return (
    <DndProvider backend={HTML5Backend}>
      <div className="flex flex-col h-screen bg-background">
        {/* Header */}
        <div className="flex justify-between items-center p-4 border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
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
              />
              <p className="text-sm text-muted-foreground">Editor de plantillas de email</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Button variant="outline" size="sm" onClick={() => undo()} disabled={!canUndo}>
              <Undo className="h-4 w-4 mr-1" />
              Deshacer
            </Button>
            <Button variant="outline" size="sm" onClick={() => redo()} disabled={!canRedo}>
              <Redo className="h-4 w-4 mr-1" />
              Rehacer
            </Button>
            <Separator orientation="vertical" className="h-6" />
            <Button variant="outline" size="sm" onClick={handleExport}>
              <Download className="h-4 w-4 mr-1" />
              Exportar
            </Button>
            <Button onClick={handleSave}>
              <Save className="h-4 w-4 mr-1" />
              Guardar
            </Button>
          </div>
        </div>

        {/* Main Content */}
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
              {/* Components Sidebar */}
              <div className="w-64 border-r bg-muted/30 overflow-y-auto">
                <div className="p-4">
                  <h3 className="font-semibold mb-4 flex items-center gap-2">
                    <Settings className="h-4 w-4" />
                    Componentes
                  </h3>
                  <ComponentSidebar />
                </div>
              </div>

              {/* Canvas */}
              <div className="flex-1 overflow-hidden">
                <EmailCanvas />
              </div>

              {/* Properties Panel */}
              <div className="w-80 border-l bg-muted/30 overflow-y-auto">
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
              </div>
            </div>
          </TabsContent>

          <TabsContent value="preview" className="flex-1 m-0">
            <PreviewPanel />
          </TabsContent>

          <TabsContent value="code" className="flex-1 p-4">
            <div className="h-full bg-muted/30 rounded-lg p-4">
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-semibold">Código MJML</h3>
                <Button variant="outline" size="sm">
                  <Code className="h-4 w-4 mr-1" />
                  Copiar Código
                </Button>
              </div>
              <pre className="bg-background p-4 rounded-md overflow-auto h-[calc(100%-60px)] text-sm">
                <code>
                  {`<mjml>
  <mj-body>
    <mj-section background-color="#f0f0f0" padding="20px">
      <mj-column>
        <mj-text align="center" color="#333333">Encabezado de ejemplo</mj-text>
      </mj-column>
    </mj-section>
  </mj-body>
</mjml>`}
                </code>
              </pre>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </DndProvider>
  )
}

export default EmailTemplateEditor
