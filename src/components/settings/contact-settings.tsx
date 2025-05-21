import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Separator } from "@/components/ui/separator"
import type { Agency } from "@prisma/client"

interface ContactSettingsProps {
    agencyId: string
    agencyDetails: Agency
    planType?: string
}

const ContactSettingsContent = ({ agencyId, agencyDetails, planType = "general" }: ContactSettingsProps) => {
    return (
        <div className="flex flex-col gap-8">
            <div>
                <h1 className="text-2xl font-bold">Contacto</h1>
                <p className="text-muted-foreground mt-2">
                    {planType === "custom"
                        ? "Cuéntanos sobre tus necesidades para crear un plan personalizado"
                        : "Estamos aquí para ayudarte con cualquier pregunta que tengas"}
                </p>
            </div>
            <Separator />
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <Card>
                    <CardHeader>
                        <CardTitle>Envíanos un mensaje</CardTitle>
                        <CardDescription>
                            {planType === "custom"
                                ? "Describe tus necesidades y te contactaremos para crear un plan a medida"
                                : "Responderemos a tu consulta lo antes posible"}
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        <form className="space-y-4">
                            <div className="space-y-2">
                                <Label htmlFor="name">Nombre</Label>
                                <Input id="name" placeholder="Tu nombre" />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="email">Email</Label>
                                <Input id="email" type="email" placeholder="tu@email.com" />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="subject">Asunto</Label>
                                <Input
                                    id="subject"
                                    placeholder="Asunto de tu mensaje"
                                    defaultValue={planType === "custom" ? "Solicitud de plan personalizado" : ""}
                                />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="message">Mensaje</Label>
                                <Textarea
                                    id="message"
                                    placeholder="Tu mensaje"
                                    className="min-h-[150px]"
                                    defaultValue={
                                        planType === "custom" ? "Necesito un plan personalizado con las siguientes características:" : ""
                                    }
                                />
                            </div>
                            <Button type="submit" className="w-full">
                                Enviar mensaje
                            </Button>
                        </form>
                    </CardContent>
                </Card>
                <div className="space-y-6">
                    <Card>
                        <CardHeader>
                            <CardTitle>Información de contacto</CardTitle>
                            <CardDescription>Puedes contactarnos directamente a través de estos medios</CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div>
                                <h3 className="font-medium">Email</h3>
                                <p className="text-muted-foreground">soporte@invwe.com</p>
                            </div>
                            <div>
                                <h3 className="font-medium">Teléfono</h3>
                                <p className="text-muted-foreground">+54 316 252 5652</p>
                            </div>
                            <div>
                                <h3 className="font-medium">Dirección</h3>
                                <p className="text-muted-foreground">
                                    Ejemplo calle
                                    <br />
                                    Medellín
                                    <br />
                                    Colombia
                                </p>
                            </div>
                        </CardContent>
                    </Card>
                    {planType === "custom" && (
                        <Card>
                            <CardHeader>
                                <CardTitle>Planes personalizados</CardTitle>
                                <CardDescription>
                                    Nuestros planes personalizados se adaptan a tus necesidades específicas
                                </CardDescription>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                <div className="space-y-2">
                                    <h3 className="font-medium">Características incluidas</h3>
                                    <ul className="list-disc list-inside text-muted-foreground space-y-1">
                                        <li>Solución a medida para tu negocio</li>
                                        <li>Funcionalidades personalizadas</li>
                                        <li>Soporte dedicado</li>
                                        <li>Integraciones específicas</li>
                                        <li>Precio adaptado a tu presupuesto</li>
                                    </ul>
                                </div>
                            </CardContent>
                        </Card>
                    )}
                </div>
            </div>
        </div>
    )
}

export default ContactSettingsContent
