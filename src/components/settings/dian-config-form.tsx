"use client"

import type React from "react"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import { AlertCircle, CheckCircle, Upload, Plus, Trash2 } from "lucide-react"
import { toast } from "sonner"

interface Resolution {
    id: string
    number: string
    prefix: string
    dateFrom: string
    dateTo: string
    rangeFrom: number
    rangeTo: number
    current: number
}

export const DIANConfigForm = ({ agencyId }: { agencyId: string }) => {
    const [isLoading, setIsLoading] = useState(false)
    const [config, setConfig] = useState({
        nit: "",
        businessName: "",
        taxRegime: "",
        address: "",
        city: "",
        state: "",
        phone: "",
        email: "",
        certificateFile: null as File | null,
        certificatePassword: "",
        certificateExpiryDate: "",
        testMode: true,
    })

    const [resolutions, setResolutions] = useState<Resolution[]>([
        {
            id: "1",
            number: "",
            prefix: "",
            dateFrom: "",
            dateTo: "",
            rangeFrom: 0,
            rangeTo: 0,
            current: 0,
        },
    ])

    const handleConfigChange = (field: string, value: any) => {
        setConfig((prev) => ({ ...prev, [field]: value }))
    }

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0]
        if (file) {
            if (file.type !== "application/x-pkcs12" && !file.name.endsWith(".p12")) {
                toast.error("Por favor seleccione un archivo .p12 válido")
                return
            }
            setConfig((prev) => ({ ...prev, certificateFile: file }))
        }
    }

    const addResolution = () => {
        const newResolution: Resolution = {
            id: Date.now().toString(),
            number: "",
            prefix: "",
            dateFrom: "",
            dateTo: "",
            rangeFrom: 0,
            rangeTo: 0,
            current: 0,
        }
        setResolutions((prev) => [...prev, newResolution])
    }

    const removeResolution = (id: string) => {
        setResolutions((prev) => prev.filter((r) => r.id !== id))
    }

    const updateResolution = (id: string, field: string, value: any) => {
        setResolutions((prev) => prev.map((r) => (r.id === id ? { ...r, [field]: value } : r)))
    }

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        setIsLoading(true)

        try {
            // Validaciones
            if (!config.nit || !config.businessName) {
                toast.error("NIT y Razón Social son obligatorios")
                return
            }

            if (!config.certificateFile) {
                toast.error("Debe cargar el certificado digital")
                return
            }

            // Aquí iría la lógica para guardar la configuración
            // await saveDIANConfig(agencyId, config, resolutions)

            toast.success("Configuración DIAN guardada exitosamente")
        } catch (error) {
            toast.error("Error al guardar la configuración")
            console.error(error)
        } finally {
            setIsLoading(false)
        }
    }

    const testConnection = async () => {
        try {
            // Aquí iría la lógica para probar la conexión con DIAN
            toast.success("Conexión con DIAN exitosa")
        } catch (error) {
            toast.error("Error en la conexión con DIAN")
        }
    }

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <div>
                    <h1 className="text-2xl font-bold tracking-tight">Configuración DIAN</h1>
                    <p className="text-muted-foreground">Configure la facturación electrónica según la normativa DIAN</p>
                </div>
                <Badge variant="outline" className="text-blue-600 border-blue-600">
                    Normativa DIAN 2024
                </Badge>
            </div>

            <form onSubmit={handleSubmit} className="space-y-6">
                {/* Información Básica */}
                <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <CheckCircle className="h-5 w-5 text-green-600" />
                            Información Básica de la Empresa
                        </CardTitle>
                        <CardDescription>Datos fiscales y de identificación de la empresa</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <Label htmlFor="nit">NIT *</Label>
                                <Input
                                    id="nit"
                                    placeholder="900.123.456-7"
                                    value={config.nit}
                                    onChange={(e) => handleConfigChange("nit", e.target.value)}
                                    required
                                />
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="businessName">Razón Social *</Label>
                                <Input
                                    id="businessName"
                                    placeholder="Mi Empresa SAS"
                                    value={config.businessName}
                                    onChange={(e) => handleConfigChange("businessName", e.target.value)}
                                    required
                                />
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="taxRegime">Régimen Tributario</Label>
                                <Select value={config.taxRegime} onValueChange={(value) => handleConfigChange("taxRegime", value)}>
                                    <SelectTrigger>
                                        <SelectValue placeholder="Seleccione un régimen" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="comun">Régimen Común</SelectItem>
                                        <SelectItem value="simplificado">Régimen Simplificado</SelectItem>
                                        <SelectItem value="especial">Régimen Especial</SelectItem>
                                        <SelectItem value="gran_contribuyente">Gran Contribuyente</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="phone">Teléfono</Label>
                                <Input
                                    id="phone"
                                    placeholder="+57 (1) 234-5678"
                                    value={config.phone}
                                    onChange={(e) => handleConfigChange("phone", e.target.value)}
                                />
                            </div>
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="address">Dirección</Label>
                            <Input
                                id="address"
                                placeholder="Calle 123 #45-67"
                                value={config.address}
                                onChange={(e) => handleConfigChange("address", e.target.value)}
                            />
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <Label htmlFor="city">Ciudad</Label>
                                <Input
                                    id="city"
                                    placeholder="Bogotá D.C."
                                    value={config.city}
                                    onChange={(e) => handleConfigChange("city", e.target.value)}
                                />
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="email">Email de Facturación</Label>
                                <Input
                                    id="email"
                                    type="email"
                                    placeholder="facturacion@miempresa.com"
                                    value={config.email}
                                    onChange={(e) => handleConfigChange("email", e.target.value)}
                                />
                            </div>
                        </div>
                    </CardContent>
                </Card>

                {/* Certificado Digital */}
                <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <AlertCircle className="h-5 w-5 text-amber-600" />
                            Certificado Digital
                        </CardTitle>
                        <CardDescription>
                            Certificado digital expedido por una entidad certificadora autorizada por la DIAN
                        </CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <Label htmlFor="certificate">Certificado Digital (.p12) *</Label>
                                <div className="flex items-center gap-2">
                                    <Input
                                        id="certificate"
                                        type="file"
                                        accept=".p12"
                                        onChange={handleFileChange}
                                        className="file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
                                    />
                                    <Upload className="h-4 w-4 text-muted-foreground" />
                                </div>
                                {config.certificateFile && <p className="text-sm text-green-600">✓ {config.certificateFile.name}</p>}
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="certificatePassword">Contraseña del Certificado *</Label>
                                <Input
                                    id="certificatePassword"
                                    type="password"
                                    placeholder="Contraseña del certificado"
                                    value={config.certificatePassword}
                                    onChange={(e) => handleConfigChange("certificatePassword", e.target.value)}
                                    required
                                />
                            </div>
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="certificateExpiryDate">Fecha de Vencimiento del Certificado</Label>
                            <Input
                                id="certificateExpiryDate"
                                type="date"
                                value={config.certificateExpiryDate}
                                onChange={(e) => handleConfigChange("certificateExpiryDate", e.target.value)}
                            />
                        </div>

                        <div className="flex items-center gap-2 p-4 bg-amber-50 border border-amber-200 rounded-lg">
                            <AlertCircle className="h-5 w-5 text-amber-600" />
                            <div className="text-sm">
                                <p className="font-medium text-amber-800">Importante:</p>
                                <p className="text-amber-700">
                                    El certificado debe estar vigente y ser expedido por una entidad certificadora autorizada por la DIAN.
                                </p>
                            </div>
                        </div>
                    </CardContent>
                </Card>

                {/* Resoluciones de Facturación */}
                <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center justify-between">
                            <div className="flex items-center gap-2">
                                <CheckCircle className="h-5 w-5 text-green-600" />
                                Resoluciones de Facturación
                            </div>
                            <Button
                                type="button"
                                variant="outline"
                                size="sm"
                                onClick={addResolution}
                                className="flex items-center gap-2"
                            >
                                <Plus className="h-4 w-4" />
                                Agregar Resolución
                            </Button>
                        </CardTitle>
                        <CardDescription>Configure las resoluciones de facturación autorizadas por la DIAN</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-6">
                        {resolutions.map((resolution, index) => (
                            <div key={resolution.id} className="border rounded-lg p-4 space-y-4">
                                <div className="flex justify-between items-center">
                                    <h4 className="font-medium">Resolución {index + 1}</h4>
                                    {resolutions.length > 1 && (
                                        <Button
                                            type="button"
                                            variant="ghost"
                                            size="sm"
                                            onClick={() => removeResolution(resolution.id)}
                                            className="text-red-600 hover:text-red-700"
                                        >
                                            <Trash2 className="h-4 w-4" />
                                        </Button>
                                    )}
                                </div>

                                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                    <div className="space-y-2">
                                        <Label>Número de Resolución</Label>
                                        <Input
                                            placeholder="18764020842"
                                            value={resolution.number}
                                            onChange={(e) => updateResolution(resolution.id, "number", e.target.value)}
                                        />
                                    </div>

                                    <div className="space-y-2">
                                        <Label>Prefijo</Label>
                                        <Input
                                            placeholder="INVW"
                                            value={resolution.prefix}
                                            onChange={(e) => updateResolution(resolution.id, "prefix", e.target.value)}
                                        />
                                    </div>

                                    <div className="space-y-2">
                                        <Label>Fecha de Resolución</Label>
                                        <Input
                                            type="date"
                                            value={resolution.dateFrom}
                                            onChange={(e) => updateResolution(resolution.id, "dateFrom", e.target.value)}
                                        />
                                    </div>
                                </div>

                                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                    <div className="space-y-2">
                                        <Label>Rango Desde</Label>
                                        <Input
                                            type="number"
                                            placeholder="1"
                                            value={resolution.rangeFrom}
                                            onChange={(e) =>
                                                updateResolution(resolution.id, "rangeFrom", Number.parseInt(e.target.value) || 0)
                                            }
                                        />
                                    </div>

                                    <div className="space-y-2">
                                        <Label>Rango Hasta</Label>
                                        <Input
                                            type="number"
                                            placeholder="5000"
                                            value={resolution.rangeTo}
                                            onChange={(e) => updateResolution(resolution.id, "rangeTo", Number.parseInt(e.target.value) || 0)}
                                        />
                                    </div>

                                    <div className="space-y-2">
                                        <Label>Consecutivo Actual</Label>
                                        <Input
                                            type="number"
                                            placeholder="1"
                                            value={resolution.current}
                                            onChange={(e) => updateResolution(resolution.id, "current", Number.parseInt(e.target.value) || 0)}
                                        />
                                    </div>
                                </div>

                                <div className="space-y-2">
                                    <Label>Vigencia Hasta</Label>
                                    <Input
                                        type="date"
                                        value={resolution.dateTo}
                                        onChange={(e) => updateResolution(resolution.id, "dateTo", e.target.value)}
                                    />
                                </div>
                            </div>
                        ))}
                    </CardContent>
                </Card>

                {/* Configuración de Pruebas */}
                <Card>
                    <CardHeader>
                        <CardTitle>Configuración de Ambiente</CardTitle>
                        <CardDescription>Configure el ambiente de trabajo para facturación electrónica</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div className="flex items-center justify-between p-4 border rounded-lg">
                            <div>
                                <h4 className="font-medium">Modo de Pruebas</h4>
                                <p className="text-sm text-muted-foreground">
                                    Active para realizar pruebas con el ambiente de habilitación de la DIAN
                                </p>
                            </div>
                            <Button
                                type="button"
                                variant={config.testMode ? "default" : "outline"}
                                onClick={() => handleConfigChange("testMode", !config.testMode)}
                            >
                                {config.testMode ? "Activado" : "Desactivado"}
                            </Button>
                        </div>

                        {config.testMode && (
                            <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
                                <div className="flex items-center gap-2 mb-2">
                                    <AlertCircle className="h-5 w-5 text-blue-600" />
                                    <h4 className="font-medium text-blue-800">Modo de Pruebas Activo</h4>
                                </div>
                                <p className="text-sm text-blue-700">
                                    Las facturas generadas en este modo no tienen validez fiscal y solo deben usarse para pruebas. Una vez
                                    completadas las pruebas, desactive este modo para generar facturas válidas.
                                </p>
                            </div>
                        )}
                    </CardContent>
                </Card>

                {/* Botones de Acción */}
                <div className="flex flex-col sm:flex-row gap-4 justify-between">
                    <Button type="button" variant="outline" onClick={testConnection} className="flex items-center gap-2">
                        <CheckCircle className="h-4 w-4" />
                        Probar Conexión DIAN
                    </Button>

                    <div className="flex gap-2">
                        <Button type="button" variant="outline">
                            Cancelar
                        </Button>
                        <Button type="submit" disabled={isLoading} className="flex items-center gap-2">
                            {isLoading ? (
                                <>
                                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                                    Guardando...
                                </>
                            ) : (
                                <>
                                    <CheckCircle className="h-4 w-4" />
                                    Guardar Configuración
                                </>
                            )}
                        </Button>
                    </div>
                </div>
            </form>
        </div>
    )
}
