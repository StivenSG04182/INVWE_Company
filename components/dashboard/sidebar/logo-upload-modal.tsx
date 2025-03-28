"use client"

import { useState } from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Progress } from "@/components/ui/progress"
import { Button } from "@/components/ui/button"
import { ImageIcon, Upload } from "lucide-react"
import axios from "axios"
import { useToast } from "@/components/ui/use-toast"
import { useCompany } from "@/hooks/use-company"

interface LogoUploadModalProps {
    isOpen: boolean
    onClose: () => void
}

export function LogoUploadModal({ isOpen, onClose }: LogoUploadModalProps) {
    const [selectedFile, setSelectedFile] = useState<File | null>(null)
    const [uploadProgress, setUploadProgress] = useState(0)
    const [isUploading, setIsUploading] = useState(false)
    const { toast } = useToast()
    const { company, loading } = useCompany()

    const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0]
        if (file) {
            setSelectedFile(file)
        }
    }

    const handleUpload = async () => {
        if (!selectedFile || !company?._id) return

        setIsUploading(true)
        setUploadProgress(0)

        try {
            // Configurar FormData para la carga
            const formData = new FormData()
            formData.append('file', selectedFile)
            formData.append('companyId', company._id)

            // Simular progreso de carga
            const interval = setInterval(() => {
                setUploadProgress((prev) => {
                    if (prev >= 95) {
                        clearInterval(interval)
                        return prev
                    }
                    return prev + 5
                })
            }, 100)

            // Enviar la imagen al servidor
            const response = await axios.post('/api/(users_data)/companies/logo', formData, {
                headers: {
                    'Content-Type': 'multipart/form-data',
                },
            })

            setUploadProgress(100)
            
            // Mostrar mensaje de éxito
            toast({
                title: "Logo actualizado",
                description: "El logo de la empresa se ha actualizado correctamente",
                variant: "default",
            })

            // Cerrar el modal después de un breve retraso
            setTimeout(() => {
                onClose()
                setSelectedFile(null)
                setUploadProgress(0)
                setIsUploading(false)
                // Recargar la página para mostrar el nuevo logo
                window.location.reload()
            }, 500)
        } catch (error) {
            console.error("Error al subir el logo:", error)
            toast({
                title: "Error",
                description: "No se pudo subir el logo. Inténtalo de nuevo.",
                variant: "destructive",
            })
            setIsUploading(false)
            setUploadProgress(0)
        }
    }

    const getInitialLetter = () => {
        return company?.name?.charAt(0).toUpperCase() || 'C'
    }

    return (
        <Dialog open={isOpen} onOpenChange={onClose}>
            <DialogContent>
                <DialogHeader>
                    <DialogTitle>Cargar el logo de la compañia</DialogTitle>
                </DialogHeader>
                <div className="flex flex-col items-center justify-center space-y-4 p-4">
                    <div className="relative h-32 w-32 rounded-lg border-2 border-dashed border-gray-300 p-2">
                        {selectedFile ? (
                            <img
                                src={URL.createObjectURL(selectedFile)}
                                alt="Preview"
                                className="h-full w-full rounded object-contain"
                            />
                        ) : (
                            <div className="flex h-full w-full items-center justify-center bg-gray-50 text-4xl font-bold text-gray-300">
                                {getInitialLetter()}
                            </div>
                        )}
                    </div>
                    <input
                        type="file"
                        accept="image/*"
                        onChange={handleFileSelect}
                        className="hidden"
                        id="logo-upload"
                        disabled={isUploading}
                    />
                    <label
                        htmlFor="logo-upload"
                        className="flex cursor-pointer items-center gap-2 rounded-md border border-gray-300 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50"
                    >
                        <ImageIcon className="h-5 w-5" />
                        Choose Image
                    </label>
                    {selectedFile && (
                        <div className="w-full space-y-4">
                            {isUploading && (
                                <div className="space-y-2">
                                    <Progress value={uploadProgress} className="h-2 w-full" />
                                    <p className="text-center text-sm text-gray-500">{uploadProgress}% uploaded</p>
                                </div>
                            )}
                            <Button
                                onClick={handleUpload}
                                disabled={isUploading}
                                className="w-full"
                            >
                                <Upload className="mr-2 h-4 w-4" />
                                {isUploading ? "Uploading..." : "Upload Logo"}
                            </Button>
                        </div>
                    )}
                </div>
            </DialogContent>
        </Dialog>
    )
}