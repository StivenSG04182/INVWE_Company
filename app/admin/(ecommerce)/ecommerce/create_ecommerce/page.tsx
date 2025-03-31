"use client"

import { useState } from 'react'
import { Button } from "@/components/ui/button"
import { useRouter } from "next/navigation"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog"
import { SandpackProvider, SandpackLayout, SandpackCodeEditor, SandpackPreview, useSandpack, SandpackFileExplorer, FileTabs } from "@codesandbox/sandpack-react"

export default function CreateEcommercePage() {
    const router = useRouter()
    const [showCancelDialog, setShowCancelDialog] = useState(false)

    // Función para guardar la plantilla
    const handleSaveTemplate = async () => {
        try {
            // Obtenemos el contexto de Sandpack para acceder a los archivos
            const sandpackContext = document.querySelector('iframe')?.contentWindow;
            if (sandpackContext) {
                // En una implementación real, aquí obtendríamos los archivos
                console.log('Preparando archivos para guardar...');
                // Aquí se implementará la lógica para guardar en MongoDB
            }
            
            // Por ahora solo mostramos un mensaje de éxito
            alert('Plantilla guardada con éxito')
            router.push('/admin/ecommerce')
        } catch (error) {
            console.error('Error al guardar la plantilla:', error)
            alert('Error al guardar la plantilla')
        }
    }

    const handleCancel = () => {
        setShowCancelDialog(true)
    }

    const confirmCancel = () => {
        router.push('/admin/ecommerce')
    }

    return (
        <div className="flex flex-col h-screen">
            {/* Barra de herramientas superior */}
            <div className="flex items-center justify-between p-4 border-b">
                <h1 className="text-xl font-bold">Crear Plantilla de E-commerce</h1>
                <div className="flex gap-2">
                    {/* Los botones se manejan fuera de Sandpack */}
                    <Button
                        onClick={handleSaveTemplate}
                        className="bg-green-600 hover:bg-green-700 mr-2"
                    >
                        Crear Plantilla
                    </Button>
                    <Button
                        onClick={handleCancel}
                        variant="outline"
                    >
                        Cancelar
                    </Button>
                </div>
            </div>

            {/* Área principal: Editor y Vista previa con Sandpack */}
            <div className="flex-1 overflow-hidden">
                {/* Contenedor principal de Sandpack */}
                <SandpackProvider template="static" theme="dark">
                    <div className="flex flex-col h-full w-full">
                        <SandpackLayout className="h-full w-full">
                            <div className="flex-1 flex w-full">
                                {/* Explorador de archivos */}
                                <div className="w-48 border-r">
                                    <SandpackFileExplorer />
                                </div>
                                <div className="flex-1 flex flex-col">
                                    <FileTabs />
                                    <div className="flex-1 flex">
                                        <SandpackCodeEditor className="flex-1" showLineNumbers />
                                        <SandpackPreview className="flex-1" showNavigator />
                                    </div>
                                </div>
                            </div>
                        </SandpackLayout>
                    </div>
                </SandpackProvider>
            </div>

            {/* Diálogo de confirmación para cancelar */}
            <Dialog open={showCancelDialog} onOpenChange={setShowCancelDialog}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>¿Estás seguro?</DialogTitle>
                        <DialogDescription>
                            Si cancelas, perderás todos los cambios realizados.
                        </DialogDescription>
                    </DialogHeader>
                    <DialogFooter className="flex justify-end gap-2 mt-4">
                        <Button variant="outline" onClick={() => setShowCancelDialog(false)}>
                            No, continuar editando
                        </Button>
                        <Button variant="destructive" onClick={confirmCancel}>
                            Sí, cancelar
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </div>
    )
}