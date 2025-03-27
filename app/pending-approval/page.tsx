"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Loader2 } from "lucide-react";

export default function PendingApprovalPage() {
    const router = useRouter();
    const [loading, setLoading] = useState(false);

    const handleGoBack = () => {
        setLoading(true);
        router.push("/select_inventory");
    };

    return (
        <div className="flex items-center justify-center min-h-screen bg-gray-100">
            <Card className="w-full max-w-md shadow-lg">
                <CardHeader className="text-center">
                    <CardTitle className="text-2xl font-bold">Solicitud Pendiente</CardTitle>
                    <CardDescription>
                        Tu solicitud para unirte al inventario está en proceso de revisión
                    </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                    <div className="bg-yellow-50 p-4 rounded-md border border-yellow-200">
                        <p className="text-yellow-800 text-sm">
                            Un administrador debe aprobar tu solicitud antes de que puedas acceder al inventario.
                            Recibirás una notificación cuando tu solicitud sea aprobada.
                        </p>
                    </div>
                    <div className="text-sm text-gray-500">
                        <p>Si tienes alguna pregunta o necesitas asistencia, por favor contacta al administrador del inventario.</p>
                    </div>
                </CardContent>
                <CardFooter>
                    <Button 
                        onClick={handleGoBack} 
                        className="w-full" 
                        variant="outline"
                        disabled={loading}
                    >
                        {loading ? (
                            <>
                                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                Cargando...
                            </>
                        ) : (
                            "Volver a Selección de Inventario"
                        )}
                    </Button>
                </CardFooter>
            </Card>
        </div>
    );
}