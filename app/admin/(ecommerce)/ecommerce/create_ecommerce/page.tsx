"use client"

import { useState } from 'react'
import { Button } from "@/components/ui/button"
import { Input } from '@/components/ui/input'
import { useRouter } from "next/navigation"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog"
import { useEffect, useRef } from 'react'
import sdk, { type Project } from "@stackblitz/sdk";

export default function CreateEcommercePage() {
    const router = useRouter()
    const [showCancelDialog, setShowCancelDialog] = useState(false)

    // Función para guardar la plantilla
    const iframeRef = useRef<HTMLIFrameElement>(null)
    const [vm, setVm] = useState<any>(null)
    const [templateName, setTemplateName] = useState('')

    useEffect(() => {
        const loadStackblitz = async () => {
            const project: Project = {
                files: {
                    'pages/_app.js': `import '../styles/globals.css'
import { ClerkProvider } from '@clerk/nextjs'

export default function App({ Component, pageProps }) {
  return (
    <ClerkProvider>
      <Component {...pageProps} />
    </ClerkProvider>
  )
}`,
                    'pages/index.js': `export default function Home() {
  return (
    <div className="container mx-auto p-4">
      <h1 className="text-2xl font-bold mb-4">Tienda Online</h1>
      {/* Componentes de Shadcn aquí */}
    </div>
  )
}`,
                    'tailwind.config.js': `module.exports = {
  content: ['./pages/**/*.{js,ts,jsx,tsx}'],
  theme: { extend: {} },
  plugins: []
}`,
                    'next.config.js': `module.exports = {
  reactStrictMode: true,
  experimental: { appDir: true }
}`,
                    'package.json': JSON.stringify({
                        "name": "ecommerce-template",
                        "version": "1.0.0",
                        "scripts": {
                            "dev": "next dev",
                            "build": "next build",
                            "dev": "next dev",
                            "build": "next build",
                            "start": "next start"
                        },
                        "dependencies": {
                            "next": "^14.1.0",
                            "react": "^18.2.0",
                            "react-dom": "^18.2.0",
                            "@clerk/nextjs": "^4.24.0",
                            "@tailwindcss/forms": "^0.3.0",
                            "@tailwindcss/typography": "^0.5.0",
                            "tailwindcss": "^3.3.0"
                        }
                    }, null, 2)
                },
                title: 'Plantilla E-commerce',
                description: 'Plantilla Next.js con tecnologías requeridas',
                template: 'node',
                dependencies: {
                    "next": "^14.1.0",
                    "@clerk/nextjs": "^4.24.0",
                    "tailwindcss": "^3.3.0",
                    "@tailwindcss/forms": "^0.3.0",
                    "@tailwindcss/typography": "^0.5.0"
                }
            }

            if (iframeRef.current) {
                const vmInstance = await sdk.embedProject(iframeRef.current, project, {
                    openFile: 'index.js',
                    view: 'both',
                    hideExplorer: false,
                    terminalHeight: 300,
                    theme: 'dark',
                    forceNewLayout: true,
                    terminal: {
                        enabled: true,
                        waitForStart: true,
                        shell: true,
                        environmentVariables: {
                            NODE_OPTIONS: '--dns-result-order=ipv4first',
                            SHELL: '/bin/bash'
                        }
                    },
                    startScript: 'dev'
                })
                setVm(vmInstance)
            }
        }
        loadStackblitz()
    }, [])

    const handleSaveTemplate = async () => {
        try {
            if (vm) {
                const rawFiles = await vm.getFiles()
                const encodedFiles = Object.entries(rawFiles).reduce((acc, [path, content]) => ({
                    ...acc,
                    [path]: typeof content === 'string' 
                        ? btoa(unescape(encodeURIComponent(content))) 
                        : content
                }), {})

                const templateData = {
                    name: templateName || 'Sin nombre',
                    stack: ['nextjs', 'react', 'tailwind', 'shadcn'],
                    dependencies: {
                        next: '^14.1.0',
                        react: '^18.2.0',
                        '@clerk/nextjs': '^4.24.0',
                        '@strapi/strapi': '^4.9.2',
                        stripe: '^12.5.0'
                    },
                    files: encodedFiles,
                    vercelConfig: {
                        runtime: 'edge',
                        regions: ['iad1'],
                        maxDuration: 30
                    },
                    createdAt: new Date(),
                    updatedAt: new Date()
                };

                const result = await fetch('/api/ecommerce/templates', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify(templateData)
                });

                if (!result.ok) throw new Error('Error al guardar en la base de datos');
            }

            // Por ahora solo mostramos un mensaje de éxito
            // toast.success('Plantilla guardada exitosamente en MongoDB')
                router.push(`/admin/ecommerce/templates/${(await result.json()).id}`)
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
                <div className="flex items-center gap-4">
                    <h1 className="text-xl font-bold">Crear Plantilla de E-commerce</h1>
                    <Input
                        placeholder="Nombre de la plantilla"
                        value={templateName}
                        onChange={(e) => setTemplateName(e.target.value)}
                        className="max-w-xs"
                    />
                </div>
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
            <div className="flex-1 overflow-auto min-h-[600px]">
                <iframe
                    ref={iframeRef}
                    className="w-full h-[calc(100vh-160px)] border-0"
                    sandbox="allow-scripts allow-same-origin allow-popups allow-modals allow-forms allow-presentation allow-top-navigation allow-downloads allow-top-navigation-by-user-activation allow-pointer-lock"
                    allow="accelerometer; clipboard-write; encrypted-media; geolocation; gyroscope; microphone; midi; monetization; payment; usb; vr; allow-popups; allow-modals; web-share"
                    style={{ minHeight: '700px' }}
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
        </div>
    )
}