import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { paymentGateways } from "@/lib/payment-gateway-config"
import Image from "next/image"
import { Button } from "../ui/button"
import { Card } from "../ui/card"

interface PaymentGatewayModalProps {
    isOpen: boolean
    onClose: () => void
    onSelect: (gatewayId: string) => void
    agencyId: string
}

export const PaymentGatewayModal = ({
    isOpen,
    onClose,
    onSelect,
    agencyId
}: PaymentGatewayModalProps) => {
    return (
        <Dialog open={isOpen} onOpenChange={onClose}>
            <DialogContent className="max-w-4xl">
                <DialogHeader>
                    <DialogTitle>Selecciona una pasarela de pago</DialogTitle>
                </DialogHeader>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mt-4">
                    {paymentGateways.map((gateway) => (
                        <Card key={gateway.id} className="p-4 hover:shadow-lg transition-shadow">
                            <div className="flex flex-col items-center space-y-4">
                                <div className="relative w-32 h-16">
                                    <Image
                                        src={gateway.logo}
                                        alt={gateway.name}
                                        fill
                                        className="object-contain"
                                    />
                                </div>
                                <h3 className="text-lg font-semibold">{gateway.name}</h3>
                                <p className="text-sm text-muted-foreground text-center">
                                    {gateway.description}
                                </p>
                                <div className="text-sm">
                                    <p>Comisión: {gateway.fees.percentage}% + {gateway.fees.fixed} {gateway.fees.currency}</p>
                                </div>
                                <Button
                                    onClick={() => onSelect(gateway.id)}
                                    className="w-full"
                                >
                                    Conectar con {gateway.name}
                                </Button>
                            </div>
                        </Card>
                    ))}
                </div>
            </DialogContent>
        </Dialog>
    )
}

export default PaymentGatewayModal;