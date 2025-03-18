"use client"

import { useState } from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Progress } from "@/components/ui/progress"
import { Button } from "@/components/ui/button"
import { ImageIcon, Upload } from "lucide-react"

interface LogoUploadModalProps {
    isOpen: boolean
    onClose: () => void
    onUpload: (file: File) => Promise<void>
    companyName: string
}

export function LogoUploadModal({ isOpen, onClose, onUpload, companyName }: LogoUploadModalProps) {
    const [selectedFile, setSelectedFile] = useState<File | null>(null)
    const [uploadProgress, setUploadProgress] = useState(0)
    const [isUploading, setIsUploading] = useState(false)

    const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0]
        if (file) {
            setSelectedFile(file)
        }
    }

    const handleUpload = async () => {
        if (!selectedFile) return

        setIsUploading(true)
        setUploadProgress(0)

        try {
            // Simulate upload progress
            const interval = setInterval(() => {
                setUploadProgress((prev) => {
                    if (prev >= 95) {
                        clearInterval(interval)
                        return prev
                    }
                    return prev + 5
                })
            }, 100)

            await onUpload(selectedFile)
            setUploadProgress(100)
            setTimeout(() => {
                onClose()
                setSelectedFile(null)
                setUploadProgress(0)
                setIsUploading(false)
            }, 500)
        } catch (error) {
            console.error("Upload failed:", error)
            setIsUploading(false)
            setUploadProgress(0)
        }
    }

    const getInitialLetter = () => {
        return companyName.charAt(0).toUpperCase()
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