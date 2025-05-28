"use client"
import { useState } from "react"
import type React from "react"

import { ScrollArea } from "@/components/ui/scroll-area"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs"
import {
    FileImage,
    FileVideo,
    FileAudio,
    File,
    Upload,
    Search,
    Grid3X3,
    List,
    Download,
    Trash2,
    Eye,
    Copy,
} from "lucide-react"

interface Asset {
    id: string
    name: string
    type: "image" | "video" | "audio" | "document"
    url: string
    size: number
    uploadDate: Date
    tags: string[]
}

const AssetsTab = () => {
    const [viewMode, setViewMode] = useState<"grid" | "list">("grid")
    const [searchTerm, setSearchTerm] = useState("")
    const [selectedType, setSelectedType] = useState("all")

    const [assets, setAssets] = useState<Asset[]>([
        {
            id: "1",
            name: "hero-image.jpg",
            type: "image",
            url: "/placeholder.svg?height=200&width=300",
            size: 245760,
            uploadDate: new Date(Date.now() - 1000 * 60 * 60 * 2),
            tags: ["hero", "banner"],
        },
        {
            id: "2",
            name: "product-demo.mp4",
            type: "video",
            url: "/placeholder.svg?height=200&width=300",
            size: 15728640,
            uploadDate: new Date(Date.now() - 1000 * 60 * 30),
            tags: ["demo", "product"],
        },
        {
            id: "3",
            name: "background-music.mp3",
            type: "audio",
            url: "/placeholder.svg?height=200&width=300",
            size: 5242880,
            uploadDate: new Date(Date.now() - 1000 * 60 * 15),
            tags: ["background", "music"],
        },
        {
            id: "4",
            name: "brand-guidelines.pdf",
            type: "document",
            url: "/placeholder.svg?height=200&width=300",
            size: 1048576,
            uploadDate: new Date(Date.now() - 1000 * 60 * 60),
            tags: ["brand", "guidelines"],
        },
    ])

    const formatFileSize = (bytes: number) => {
        if (bytes === 0) return "0 Bytes"
        const k = 1024
        const sizes = ["Bytes", "KB", "MB", "GB"]
        const i = Math.floor(Math.log(bytes) / Math.log(k))
        return Number.parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i]
    }

    const getFileIcon = (type: Asset["type"]) => {
        switch (type) {
            case "image":
                return <FileImage className="h-5 w-5" />
            case "video":
                return <FileVideo className="h-5 w-5" />
            case "audio":
                return <FileAudio className="h-5 w-5" />
            default:
                return <File className="h-5 w-5" />
        }
    }

    const filteredAssets = assets.filter((asset) => {
        const matchesSearch =
            asset.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
            asset.tags.some((tag) => tag.toLowerCase().includes(searchTerm.toLowerCase()))
        const matchesType = selectedType === "all" || asset.type === selectedType
        return matchesSearch && matchesType
    })

    const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
        const files = event.target.files
        if (files) {
            Array.from(files).forEach((file) => {
                const newAsset: Asset = {
                    id: Date.now().toString() + Math.random(),
                    name: file.name,
                    type: file.type.startsWith("image/")
                        ? "image"
                        : file.type.startsWith("video/")
                            ? "video"
                            : file.type.startsWith("audio/")
                                ? "audio"
                                : "document",
                    url: URL.createObjectURL(file),
                    size: file.size,
                    uploadDate: new Date(),
                    tags: [],
                }
                setAssets((prev) => [newAsset, ...prev])
            })
        }
    }

    const copyAssetUrl = (url: string) => {
        navigator.clipboard.writeText(url)
    }

    const deleteAsset = (id: string) => {
        setAssets((prev) => prev.filter((asset) => asset.id !== id))
    }

    return (
        <div className="h-full flex flex-col">
            <div className="p-6 border-b">
                <h3 className="text-lg font-semibold mb-2">Gestión de Assets</h3>
                <p className="text-sm text-muted-foreground mb-4">Organiza y gestiona todos tus archivos multimedia</p>

                {/* Upload Area */}
                <Card className="mb-4">
                    <CardContent className="p-4">
                        <div className="border-2 border-dashed border-muted-foreground/25 rounded-lg p-6 text-center">
                            <Upload className="h-8 w-8 mx-auto mb-2 text-muted-foreground" />
                            <p className="text-sm text-muted-foreground mb-2">Arrastra archivos aquí o haz clic para subir</p>
                            <Button size="sm" asChild>
                                <label>
                                    Seleccionar Archivos
                                    <input
                                        type="file"
                                        multiple
                                        accept="image/*,video/*,audio/*,.pdf,.doc,.docx"
                                        onChange={handleFileUpload}
                                        className="hidden"
                                    />
                                </label>
                            </Button>
                        </div>
                    </CardContent>
                </Card>

                {/* Search and Filters */}
                <div className="space-y-3">
                    <div className="relative">
                        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                        <Input
                            placeholder="Buscar assets..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="pl-10"
                        />
                    </div>

                    <div className="flex items-center justify-between">
                        <Tabs value={selectedType} onValueChange={setSelectedType}>
                            <TabsList className="grid grid-cols-5 w-fit">
                                <TabsTrigger value="all" className="text-xs">
                                    Todos
                                </TabsTrigger>
                                <TabsTrigger value="image" className="text-xs">
                                    Imágenes
                                </TabsTrigger>
                                <TabsTrigger value="video" className="text-xs">
                                    Videos
                                </TabsTrigger>
                                <TabsTrigger value="audio" className="text-xs">
                                    Audio
                                </TabsTrigger>
                                <TabsTrigger value="document" className="text-xs">
                                    Docs
                                </TabsTrigger>
                            </TabsList>
                        </Tabs>

                        <div className="flex gap-1">
                            <Button
                                size="icon"
                                variant={viewMode === "grid" ? "default" : "outline"}
                                className="h-8 w-8"
                                onClick={() => setViewMode("grid")}
                            >
                                <Grid3X3 className="h-4 w-4" />
                            </Button>
                            <Button
                                size="icon"
                                variant={viewMode === "list" ? "default" : "outline"}
                                className="h-8 w-8"
                                onClick={() => setViewMode("list")}
                            >
                                <List className="h-4 w-4" />
                            </Button>
                        </div>
                    </div>
                </div>
            </div>

            <ScrollArea className="flex-1 p-4">
                {viewMode === "grid" ? (
                    <div className="grid grid-cols-2 gap-3">
                        {filteredAssets.map((asset) => (
                            <Card key={asset.id} className="overflow-hidden hover:shadow-md transition-shadow group">
                                <div className="aspect-video bg-muted relative">
                                    {asset.type === "image" ? (
                                        <img
                                            src={asset.url || "/placeholder.svg"}
                                            alt={asset.name}
                                            className="w-full h-full object-cover"
                                        />
                                    ) : (
                                        <div className="w-full h-full flex items-center justify-center">{getFileIcon(asset.type)}</div>
                                    )}
                                    <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                                        <Button size="icon" variant="secondary" className="h-8 w-8">
                                            <Eye className="h-4 w-4" />
                                        </Button>
                                        <Button size="icon" variant="secondary" className="h-8 w-8" onClick={() => copyAssetUrl(asset.url)}>
                                            <Copy className="h-4 w-4" />
                                        </Button>
                                        <Button size="icon" variant="secondary" className="h-8 w-8">
                                            <Download className="h-4 w-4" />
                                        </Button>
                                        <Button size="icon" variant="destructive" className="h-8 w-8" onClick={() => deleteAsset(asset.id)}>
                                            <Trash2 className="h-4 w-4" />
                                        </Button>
                                    </div>
                                </div>
                                <CardContent className="p-3">
                                    <h4 className="font-medium text-sm truncate mb-1">{asset.name}</h4>
                                    <div className="flex items-center justify-between text-xs text-muted-foreground">
                                        <span>{formatFileSize(asset.size)}</span>
                                        <Badge variant="outline" className="text-xs">
                                            {asset.type}
                                        </Badge>
                                    </div>
                                    {asset.tags.length > 0 && (
                                        <div className="flex flex-wrap gap-1 mt-2">
                                            {asset.tags.slice(0, 2).map((tag, index) => (
                                                <Badge key={index} variant="secondary" className="text-xs">
                                                    {tag}
                                                </Badge>
                                            ))}
                                        </div>
                                    )}
                                </CardContent>
                            </Card>
                        ))}
                    </div>
                ) : (
                    <div className="space-y-2">
                        {filteredAssets.map((asset) => (
                            <Card key={asset.id} className="hover:shadow-sm transition-shadow">
                                <CardContent className="p-3">
                                    <div className="flex items-center gap-3">
                                        <div className="p-2 bg-muted rounded">{getFileIcon(asset.type)}</div>
                                        <div className="flex-1 min-w-0">
                                            <h4 className="font-medium text-sm truncate">{asset.name}</h4>
                                            <div className="flex items-center gap-2 text-xs text-muted-foreground">
                                                <span>{formatFileSize(asset.size)}</span>
                                                <Badge variant="outline" className="text-xs">
                                                    {asset.type}
                                                </Badge>
                                            </div>
                                        </div>
                                        <div className="flex gap-1">
                                            <Button size="icon" variant="ghost" className="h-6 w-6">
                                                <Eye className="h-3 w-3" />
                                            </Button>
                                            <Button size="icon" variant="ghost" className="h-6 w-6" onClick={() => copyAssetUrl(asset.url)}>
                                                <Copy className="h-3 w-3" />
                                            </Button>
                                            <Button size="icon" variant="ghost" className="h-6 w-6">
                                                <Download className="h-3 w-3" />
                                            </Button>
                                            <Button
                                                size="icon"
                                                variant="ghost"
                                                className="h-6 w-6 text-destructive"
                                                onClick={() => deleteAsset(asset.id)}
                                            >
                                                <Trash2 className="h-3 w-3" />
                                            </Button>
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>
                        ))}
                    </div>
                )}
            </ScrollArea>
        </div>
    )
}

export default AssetsTab
