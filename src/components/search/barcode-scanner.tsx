"use client"

import { useState, useRef, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { Barcode, Camera, AlertTriangle, Check, X } from "lucide-react"
import Image from "next/image"

interface BarcodeScannerProps {
    agencyId: string
    onProductFound?: (product: any) => void
}

export default function BarcodeScanner({ agencyId, onProductFound }: BarcodeScannerProps) {
    const [barcode, setBarcode] = useState("")
    const [isScanning, setIsScanning] = useState(false)
    const [scanResult, setScanResult] = useState<any>(null)
    const [error, setError] = useState<string | null>(null)
    const [activeTab, setActiveTab] = useState("manual")

    const videoRef = useRef<HTMLVideoElement>(null)
    const canvasRef = useRef<HTMLCanvasElement>(null)
    const streamRef = useRef<MediaStream | null>(null)

    // Limpiar stream al desmontar
    useEffect(() => {
        return () => {
            if (streamRef.current) {
                streamRef.current.getTracks().forEach((track) => track.stop())
            }
        }
    }, [])

    // Buscar producto por código de barras
    const searchByBarcode = async (code: string) => {
        try {
            setError(null)

            if (!code) {
                setError("Ingresa un código de barras")
                return
            }

            const response = await fetch(`/api/search/${agencyId}?type=barcode&barcode=${encodeURIComponent(code)}`)
            const result = await response.json()

            if (result.success && result.data) {
                setScanResult(result.data)
                if (onProductFound) onProductFound(result.data)
            } else {
                setError("Producto no encontrado")
                setScanResult(null)
            }
        } catch (error) {
            console.error("Error al buscar producto:", error)
            setError("Error al buscar producto")
            setScanResult(null)
        }
    }

    // Iniciar escaneo con cámara
    const startScanning = async () => {
        try {
            setError(null)
            setScanResult(null)

            if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
                setError("Tu navegador no soporta acceso a la cámara")
                return
            }

            const constraints = {
                video: {
                    facingMode: "environment",
                    width: { ideal: 1280 },
                    height: { ideal: 720 },
                },
            }

            const stream = await navigator.mediaDevices.getUserMedia(constraints)
            streamRef.current = stream

            if (videoRef.current) {
                videoRef.current.srcObject = stream
                videoRef.current.play()
                setIsScanning(true)

                // Comenzar a capturar frames para escanear
                requestAnimationFrame(scanFrame)
            }
        } catch (error) {
            console.error("Error al acceder a la cámara:", error)
            setError("No se pudo acceder a la cámara")
        }
    }

    // Detener escaneo
    const stopScanning = () => {
        if (streamRef.current) {
            streamRef.current.getTracks().forEach((track) => track.stop())
            streamRef.current = null
        }

        setIsScanning(false)
    }

    // Escanear frame de video
    const scanFrame = () => {
        if (!isScanning || !videoRef.current || !canvasRef.current) return

        const video = videoRef.current
        const canvas = canvasRef.current
        const context = canvas.getContext("2d")

        if (context && video.readyState === video.HAVE_ENOUGH_DATA) {
            // Ajustar tamaño del canvas al video
            canvas.width = video.videoWidth
            canvas.height = video.videoHeight

            // Dibujar frame actual en el canvas
            context.drawImage(video, 0, 0, canvas.width, canvas.height)

            // Aquí iría la lógica de detección de códigos de barras
            // En una implementación real, usaríamos una biblioteca como quagga.js o zxing
            // Por simplicidad, simulamos una detección después de un tiempo aleatorio

            // Simulación de detección (en una implementación real, esto sería reemplazado)
            if (Math.random() < 0.01) {
                // 1% de probabilidad por frame
                const simulatedBarcode = "123456789012" // Código de barras simulado
                setBarcode(simulatedBarcode)
                searchByBarcode(simulatedBarcode)
                stopScanning()
                return
            }
        }

        // Continuar escaneando
        requestAnimationFrame(scanFrame)
    }

    // Manejar cambio de pestaña
    const handleTabChange = (value: string) => {
        setActiveTab(value)

        if (value === "camera") {
            startScanning()
        } else {
            stopScanning()
        }
    }

    return (
        <Card>
            <CardHeader>
                <CardTitle>Escanear Código de Barras</CardTitle>
                <CardDescription>Busca productos rápidamente por su código de barras</CardDescription>
            </CardHeader>
            <CardContent>
                <Tabs value={activeTab} onValueChange={handleTabChange}>
                    <TabsList className="grid w-full grid-cols-2">
                        <TabsTrigger value="manual">
                            <Barcode className="h-4 w-4 mr-2" />
                            Manual
                        </TabsTrigger>
                        <TabsTrigger value="camera">
                            <Camera className="h-4 w-4 mr-2" />
                            Cámara
                        </TabsTrigger>
                    </TabsList>

                    <TabsContent value="manual" className="space-y-4">
                        <div className="flex gap-2 mt-4">
                            <Input
                                placeholder="Ingresa el código de barras"
                                value={barcode}
                                onChange={(e) => setBarcode(e.target.value)}
                                onKeyDown={(e) => e.key === "Enter" && searchByBarcode(barcode)}
                            />
                            <Button onClick={() => searchByBarcode(barcode)}>Buscar</Button>
                        </div>
                    </TabsContent>

                    <TabsContent value="camera">
                        <div className="relative mt-4 rounded-md overflow-hidden bg-black aspect-video">
                            <video ref={videoRef} className="w-full h-full object-cover" playsInline muted />
                            <canvas ref={canvasRef} className="absolute top-0 left-0 w-full h-full hidden" />

                            {/* Guía visual para el escaneo */}
                            <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                                <div className="border-2 border-primary w-2/3 h-1/3 rounded-md opacity-70"></div>
                            </div>

                            {isScanning && (
                                <div className="absolute bottom-4 left-0 right-0 flex justify-center">
                                    <Button variant="destructive" onClick={stopScanning}>
                                        <X className="h-4 w-4 mr-2" />
                                        Cancelar
                                    </Button>
                                </div>
                            )}
                        </div>
                    </TabsContent>
                </Tabs>

                {error && (
                    <Alert variant="destructive" className="mt-4">
                        <AlertTriangle className="h-4 w-4" />
                        <AlertTitle>Error</AlertTitle>
                        <AlertDescription>{error}</AlertDescription>
                    </Alert>
                )}

                {scanResult && (
                    <div className="mt-4 p-4 border rounded-md">
                        <div className="flex items-start gap-4">
                            <div className="w-16 h-16 bg-muted rounded-md flex-shrink-0">
                                {scanResult.images && scanResult.images.length > 0 ? (
                                    <Image
                                        src={scanResult.images[0] || "/placeholder.svg"}
                                        alt={scanResult.name}
                                        className="w-full h-full object-cover rounded-md"
                                    />
                                ) : (
                                    <div className="w-full h-full flex items-center justify-center text-muted-foreground">
                                        <Barcode className="h-8 w-8" />
                                    </div>
                                )}
                            </div>

                            <div className="flex-1">
                                <h3 className="font-medium">{scanResult.name}</h3>
                                <p className="text-sm text-muted-foreground">SKU: {scanResult.sku}</p>
                                <div className="flex items-center gap-4 mt-2">
                                    <span className="font-bold">${scanResult.price.toFixed(2)}</span>
                                    <span className="text-sm">
                                        Stock: {scanResult.stock} {scanResult.isLowStock && <span className="text-red-500">(Bajo)</span>}
                                    </span>
                                </div>
                            </div>

                            <div>
                                <Button variant="outline" size="sm" className="text-green-600">
                                    <Check className="h-4 w-4 mr-2" />
                                    Seleccionar
                                </Button>
                            </div>
                        </div>
                    </div>
                )}
            </CardContent>
        </Card>
    )
}
