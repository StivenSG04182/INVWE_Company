"use client"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../ui/card"
import { Badge } from "../ui/badge"
import { Button } from "../ui/button"
import { Separator } from "../ui/separator"
import { Calendar, CheckCircle, AlertCircle, ArrowUpRight } from "lucide-react"
import { Progress } from "../ui/progress"

type Props = {
    user: any
    details: any
}

const SubscriptionInfo = ({ user, details }: Props) => {
    // Datos de ejemplo - en producción estos vendrían de la base de datos
    const subscriptionData = {
        plan: "Premium",
        status: "Activa",
        nextBillingDate: "15 de junio, 2025",
        price: "$49.99",
        billingCycle: "Mensual",
        features: [
            { name: "Usuarios ilimitados", included: true },
            { name: "Soporte prioritario", included: true },
            { name: "Reportes avanzados", included: true },
            { name: "Integraciones premium", included: false },
        ],
        usageStats: {
            storage: { used: 7.2, total: 10, unit: "GB" },
            projects: { used: 12, total: 20 },
        },
    }

    return (
        <div className="space-y-6">
            {/* Resumen de suscripción */}
            <Card>
                <CardHeader className="pb-3">
                    <div className="flex justify-between items-center">
                        <CardTitle>Plan {subscriptionData.plan}</CardTitle>
                        <Badge variant={subscriptionData.status === "Activa" ? "default" : "destructive"}>
                            {subscriptionData.status}
                        </Badge>
                    </div>
                    <CardDescription>
                        Facturación {subscriptionData.billingCycle.toLowerCase()} de {subscriptionData.price}
                    </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                    <div className="flex items-center gap-2 text-sm">
                        <Calendar className="h-4 w-4 text-muted-foreground" />
                        <span>
                            Próximo cobro: <span className="font-medium">{subscriptionData.nextBillingDate}</span>
                        </span>
                    </div>

                    <Separator />

                    <div className="space-y-2">
                        <h4 className="text-sm font-medium">Características incluidas:</h4>
                        <ul className="space-y-2">
                            {subscriptionData.features.map((feature, index) => (
                                <li key={index} className="flex items-center gap-2 text-sm">
                                    {feature.included ? (
                                        <CheckCircle className="h-4 w-4 text-primary" />
                                    ) : (
                                        <AlertCircle className="h-4 w-4 text-muted-foreground" />
                                    )}
                                    <span className={!feature.included ? "text-muted-foreground" : ""}>{feature.name}</span>
                                </li>
                            ))}
                        </ul>
                    </div>
                </CardContent>
            </Card>

            {/* Uso de recursos */}
            <Card>
                <CardHeader className="pb-2">
                    <CardTitle className="text-base">Uso de recursos</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                    <div className="space-y-2">
                        <div className="flex justify-between text-sm">
                            <span>Almacenamiento</span>
                            <span className="font-medium">
                                {subscriptionData.usageStats.storage.used} / {subscriptionData.usageStats.storage.total}{" "}
                                {subscriptionData.usageStats.storage.unit}
                            </span>
                        </div>
                        <Progress
                            value={(subscriptionData.usageStats.storage.used / subscriptionData.usageStats.storage.total) * 100}
                            className="h-2"
                        />
                    </div>

                    <div className="space-y-2">
                        <div className="flex justify-between text-sm">
                            <span>Proyectos</span>
                            <span className="font-medium">
                                {subscriptionData.usageStats.projects.used} / {subscriptionData.usageStats.projects.total}
                            </span>
                        </div>
                        <Progress
                            value={(subscriptionData.usageStats.projects.used / subscriptionData.usageStats.projects.total) * 100}
                            className="h-2"
                        />
                    </div>
                </CardContent>
            </Card>

            {/* Acciones */}
            <div className="flex flex-col sm:flex-row gap-2">
                <Button className="flex-1">
                    Cambiar plan
                    <ArrowUpRight className="ml-2 h-4 w-4" />
                </Button>
                <Button variant="outline" className="flex-1">
                    Historial de facturación
                </Button>
            </div>
        </div>
    )
}

export default SubscriptionInfo
