"use client"

import Image from "next/image"
import { useState } from "react"
import { Button } from "@/components/ui/button"
import { ImagePlus, Trash } from "lucide-react"

interface ImageUploadProps {
    value: string[]
    onChange: (url: string) => void
    onRemove: () => void
}

export function ImageUpload({
    value,
    onChange,
    onRemove
}: ImageUploadProps) {
    const [preview, setPreview] = useState<string | null>(value[0] || null)

    // For demo purposes, we'll use a random Unsplash image as a placeholder
    const handleUpload = () => {
        const randomId = Math.floor(Math.random() * 1000)
        const imageUrl = `https://images.unsplash.com/photo-1560179707-f14e90ef3623?w=800&h=600&fit=crop&q=80`
        onChange(imageUrl)
        setPreview(imageUrl)
    }

    return (
        <div className="mb-4 flex flex-col items-center justify-center gap-4">
            {preview ? (
                <div className="relative aspect-square w-[200px] h-[200px] rounded-lg overflow-hidden">
                    <div className="absolute top-2 right-2 z-10">
                        <Button
                            type="button"
                            onClick={() => {
                                onRemove()
                                setPreview(null)
                            }}
                            variant="destructive"
                            size="icon"
                        >
                            <Trash className="h-4 w-4" />
                        </Button>
                    </div>
                    <Image
                        src={preview}
                        alt="Company logo"
                        className="object-cover"
                        fill
                        sizes="(max-width: 200px) 100vw, 200px"
                        priority
                    />
                </div>
            ) : (
                <Button
                    type="button"
                    variant="outline"
                    size="lg"
                    className="w-[200px] h-[200px]"
                    onClick={handleUpload}
                >
                    <ImagePlus className="h-6 w-6 mr-2" />
                    Subir Logo
                </Button>
            )}
            <div className="text-xs text-muted-foreground text-center">
                Recomendado: Imagen cuadrada de al menos 800x800px
            </div>
        </div>
    )
}