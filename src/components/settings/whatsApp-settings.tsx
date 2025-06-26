"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useToast } from "@/components/ui/use-toast";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { configureWhatsAppBusiness } from "@/lib/client-queries";

interface WhatsAppSettingsProps {
  params: {
    agencyId: string;
  };
}

export default function WhatsAppSettings({ params }: WhatsAppSettingsProps) {
  const { agencyId } = params;
  const router = useRouter();
  const { toast } = useToast();

  const [isLoading, setIsLoading] = useState(false);
  const [formData, setFormData] = useState({
    accessToken: "",
    phoneNumberId: "",
    businessAccountId: "",
    webhookVerifyToken: "",
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const result = await configureWhatsAppBusiness(agencyId, formData);

      if (result.success) {
        toast({
          title: "Configuración guardada",
          description: "La configuración de WhatsApp Business se ha guardado correctamente.",
        });
        router.refresh();
      } else {
        toast({
          variant: "destructive",
          title: "Error",
          description: result.message || "Ha ocurrido un error al guardar la configuración.",
        });
      }
    } catch (error) {
      console.error("Error al guardar configuración:", error);
      toast({
        variant: "destructive",
        title: "Error",
        description: "Ha ocurrido un error al guardar la configuración.",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex-1 space-y-4 p-4 md:p-8 pt-6">
      <div className="flex items-center justify-between">
        <h2 className="text-3xl font-bold tracking-tight">Configuración de WhatsApp Business</h2>
      </div>

      <div className="grid gap-4">
        <Card>
          <CardHeader>
            <CardTitle>Integración con WhatsApp Business Cloud API</CardTitle>
            <CardDescription>
              Configura la integración con la API de WhatsApp Business Cloud para enviar mensajes.
            </CardDescription>
          </CardHeader>
          <form onSubmit={handleSubmit}>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="accessToken">Token de Acceso</Label>
                <Input
                  id="accessToken"
                  name="accessToken"
                  placeholder="Ingresa el token de acceso de la API"
                  value={formData.accessToken}
                  onChange={handleChange}
                  required
                />
                <p className="text-sm text-muted-foreground">
                  El token de acceso permanente para autenticar las solicitudes a la API.
                </p>
              </div>

              <div className="space-y-2">
                <Label htmlFor="phoneNumberId">ID del Número de Teléfono</Label>
                <Input
                  id="phoneNumberId"
                  name="phoneNumberId"
                  placeholder="Ingresa el ID del número de teléfono"
                  value={formData.phoneNumberId}
                  onChange={handleChange}
                  required
                />
                <p className="text-sm text-muted-foreground">
                  El ID del número de teléfono registrado en WhatsApp Business.
                </p>
              </div>

              <div className="space-y-2">
                <Label htmlFor="businessAccountId">ID de la Cuenta de Negocio</Label>
                <Input
                  id="businessAccountId"
                  name="businessAccountId"
                  placeholder="Ingresa el ID de la cuenta de negocio"
                  value={formData.businessAccountId}
                  onChange={handleChange}
                  required
                />
                <p className="text-sm text-muted-foreground">
                  El ID de la cuenta de negocio de Meta asociada a WhatsApp Business.
                </p>
              </div>

              <div className="space-y-2">
                <Label htmlFor="webhookVerifyToken">Token de Verificación del Webhook</Label>
                <Input
                  id="webhookVerifyToken"
                  name="webhookVerifyToken"
                  placeholder="Ingresa el token de verificación para el webhook"
                  value={formData.webhookVerifyToken}
                  onChange={handleChange}
                />
                <p className="text-sm text-muted-foreground">
                  Un token secreto para verificar las solicitudes de webhook entrantes (opcional).
                </p>
              </div>

              <div className="rounded-md bg-blue-50 p-4">
                <div className="flex">
                  <div className="ml-3">
                    <h3 className="text-sm font-medium text-blue-800">Configuración de Mensajes</h3>
                    <div className="mt-2 text-sm text-blue-700">
                      <p>
                        Una vez configurado, podrás enviar mensajes a tus clientes directamente desde el sistema.
                        Los mensajes se enviarán automáticamente cuando respondas a PQRs de clientes.
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
            <CardFooter>
              <Button type="submit" disabled={isLoading}>
                {isLoading ? "Guardando..." : "Guardar configuración"}
              </Button>
            </CardFooter>
          </form>
        </Card>
      </div>
    </div>
  );
}