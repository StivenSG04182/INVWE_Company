"use client"

import { useState, useEffect, useRef } from 'react'
import { Button } from "@/components/ui/button"
import { Input } from '@/components/ui/input'
import { useRouter } from "next/navigation"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog"
import sdk, { type Project } from "@stackblitz/sdk"

export default function CreateEcommercePage() {
    const router = useRouter()
    const [showCancelDialog, setShowCancelDialog] = useState(false)
    const [showSaveDialog, setShowSaveDialog] = useState(false)

    // Estados y referencias
    const iframeRef = useRef<HTMLIFrameElement>(null)
    const [vm, setVm] = useState<any>(null)
    const [templateName, setTemplateName] = useState('')
    const [description, setDescription] = useState('')
    const [ecommerceType, setEcommerceType] = useState('general')
    const [iframeKey, setIframeKey] = useState(Date.now())

    const loadStackblitz = async () => {
        console.log('Iniciando carga de Stackblitz...')
        if (!iframeRef.current) {
            console.error('iframeRef no se encuentra en el DOM')
            return
        }
        try {
            // Proyecto "vacío": sin estructura de carpetas, solo un package.json mínimo.
            const project: Project = {
                files: {
                    // Se define un package.json básico para que el entorno tenga contexto.
                    'package.json': JSON.stringify({
                        name: "proyecto-vacio",
                        version: "1.0.0",
                        scripts: {},
                        dependencies: {}
                    }, null, 2)
                },
                title: 'Nuevo Proyecto',
                description: 'Proyecto vacío para crear desde la terminal',
                template: 'node'
            }

            const vmInstance = await sdk.embedProject(iframeRef.current, project, {
                // Se oculta el explorador de archivos y se muestra únicamente la terminal.
                view: 'terminal',
                hideExplorer: true,
                terminalHeight: 300,
                theme: 'dark',
                forceNewLayout: true,
                terminal: {
                    enabled: true,
                    waitForStart: true
                },
                // No se define openFile ni startScript para evitar cargar archivos automáticamente.
                devToolsHeight: 50
            })
            console.log('SDK de Stackblitz inicializado correctamente')
            setVm(vmInstance)
        } catch (error) {
            console.error('Error al inicializar Stackblitz:', error)
        }
    }

    useEffect(() => {
        setIframeKey(Date.now())
        // Se incrementa el timeout para asegurarse de que el iframe esté en el DOM.
        const timer = setTimeout(() => {
            loadStackblitz()
        }, 1000)
        return () => clearTimeout(timer)
    }, [])

    const handleSaveTemplate = async () => {
        if (!vm) {
            alert('El editor no está inicializado aún.')
            return
        }
        try {
            // Suponiendo que exportProject sea el método adecuado para obtener los archivos.
            const rawFiles = await vm.exportProject()
            const encodedFiles = Object.entries(rawFiles).reduce((acc, [path, content]) => ({
                ...acc,
                [path]: typeof content === 'string'
                    ? btoa(unescape(encodeURIComponent(content)))
                    : content
            }), {})

            const templateData = {
                name: templateName.trim(),
                description: description.trim(),
                type: ecommerceType,
                files: encodedFiles,
                dependencies: {
                    next: '^14.1.0',
                    react: '^18.2.0',
                    '@clerk/nextjs': '^4.24.0'
                }
            }

            const result = await fetch('/api/admin/(e-commerce)/E_Commerce/create_ecommerce', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(templateData)
            })

            const response = await result.json()
            if (!result.ok) throw new Error(response.error || 'Error al guardar')
            router.push(`/admin/ecommerce/templates/${response.id}`)
        } catch (error: any) {
            console.error('Error:', error)
            alert(error.message || 'Error al guardar la plantilla')
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
                <div className="flex items-center gap-4">
                    <h1 className="text-xl font-bold">Crear Plantilla de E-commerce</h1>
                </div>
                <div className="flex gap-2">
                    <Button onClick={() => setShowSaveDialog(true)} className="bg-green-600 hover:bg-green-700 mr-2">
                        Crear Plantilla
                    </Button>
                    <Button onClick={handleCancel} variant="outline">
                        Cancelar
                    </Button>
                </div>
            </div>

            {/* Área principal: Editor con terminal */}
            <div className="flex-1 overflow-auto min-h-[600px]">
                <iframe
                    key={iframeKey}
                    ref={iframeRef}
                    className="w-full h-[calc(100vh-160px)] border-0"
                    sandbox="allow-scripts allow-same-origin allow-forms allow-modals allow-popups"
                    allow="clipboard-write; microphone; clipboard-read"
                    style={{ minHeight: '700px', display: 'block' }}
                    title="Stackblitz Editor"
                />
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

            {/* Diálogo de confirmación para guardar */}
            <Dialog open={showSaveDialog} onOpenChange={setShowSaveDialog}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Guardar Plantilla</DialogTitle>
                        <DialogDescription>
                            Completa los detalles de la plantilla
                        </DialogDescription>
                    </DialogHeader>
                    <div className="space-y-4">
                        <Input placeholder="Nombre" value={templateName} onChange={(e) => setTemplateName(e.target.value)} required />
                        <Input placeholder="Descripción" value={description} onChange={(e) => setDescription(e.target.value)} required />
                        <select value={ecommerceType} onChange={(e) => setEcommerceType(e.target.value)} className="w-full p-2 border rounded">
                            <option value="general">General</option>
                            <option value="moda">Moda</option>
                            <option value="tecnologia">Tecnología</option>
                        </select>
                    </div>
                    <DialogFooter>
                        <Button variant="outline" onClick={() => setShowSaveDialog(false)}>
                            Cancelar
                        </Button>
                        <Button onClick={handleSaveTemplate} className="bg-blue-600 hover:bg-blue-700">
                            Guardar
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </div>
    )
}
