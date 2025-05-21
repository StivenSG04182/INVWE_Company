import { redirect } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import { db } from '@/lib/db';
import { getAuthUserDetails } from '@/lib/queries';
import { formatPrice } from '@/lib/utils';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { Input } from '@/components/ui/input';

import { ShoppingCart, Trash2, ArrowLeft, CreditCard } from 'lucide-react';

const CartPage = async ({ params }: { params: { subaccountId: string } }) => {
    const user = await getAuthUserDetails();
    if (!user) return redirect('/sign-in');

    const subaccountId = params.subaccountId;

    // Verificar que el usuario tenga acceso a esta subcuenta
    const subaccount = await db.subAccount.findUnique({
        where: {
            id: subaccountId,
        },
        include: {
            Agency: true,
        },
    });

    if (!subaccount) return redirect('/subaccount');

    // En una implementación real, aquí obtendríamos los productos del carrito desde la base de datos
    // Por ahora, usaremos datos de ejemplo
    const cartItems = [
        // Estos serían los productos que el usuario ha agregado al carrito
        // En una implementación real, esto vendría de la base de datos
    ];

    return (
        <div className="flex flex-col gap-4 p-4">
            <div className="flex items-center mb-6">
                <Link href={`/subaccount/${subaccountId}/billing-store`}>
                    <Button variant="ghost" size="sm" className="mr-4">
                        <ArrowLeft className="h-4 w-4 mr-2" />
                        Volver a la tienda
                    </Button>
                </Link>
                <h1 className="text-2xl font-bold">Carrito de Compras</h1>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Columna principal - Lista de productos */}
                <div className="lg:col-span-2">
                    <Card>
                        <CardHeader>
                            <CardTitle className="flex items-center">
                                <ShoppingCart className="h-5 w-5 mr-2" />
                                Productos en el carrito
                            </CardTitle>
                            <CardDescription>Revise los productos que desea adquirir</CardDescription>
                        </CardHeader>
                        <CardContent>
                            {cartItems.length === 0 ? (
                                <div className="text-center py-10">
                                    <ShoppingCart className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
                                    <p className="text-muted-foreground">Su carrito está vacío</p>
                                    <Link href={`/subaccount/${subaccountId}/billing-store`}>
                                        <Button className="mt-4">Explorar productos</Button>
                                    </Link>
                                </div>
                            ) : (
                                <div className="space-y-4">
                                    {/* Aquí iría el mapeo de los productos en el carrito */}
                                    {/* Ejemplo de cómo se vería un producto en el carrito */}
                                    <div className="flex items-center space-x-4 border-b pb-4">
                                        <div className="relative h-16 w-16 overflow-hidden rounded-md bg-muted">
                                            <Image
                                                src="/placeholder.svg"
                                                alt="Producto"
                                                fill
                                                className="object-cover"
                                            />
                                        </div>
                                        <div className="flex-1">
                                            <h3 className="font-medium">Nombre del Producto</h3>
                                            <p className="text-sm text-muted-foreground">Descripción corta</p>
                                        </div>
                                        <div className="flex items-center space-x-2">
                                            <div className="flex items-center">
                                                <Button variant="outline" size="icon" className="h-8 w-8 rounded-r-none">
                                                    -
                                                </Button>
                                                <Input
                                                    type="number"
                                                    min="1"
                                                    value="1"
                                                    className="h-8 w-12 rounded-none text-center"
                                                />
                                                <Button variant="outline" size="icon" className="h-8 w-8 rounded-l-none">
                                                    +
                                                </Button>
                                            </div>
                                            <div className="w-20 text-right">
                                                <p className="font-medium">$99.99</p>
                                            </div>
                                            <Button variant="ghost" size="icon" className="h-8 w-8 text-destructive">
                                                <Trash2 className="h-4 w-4" />
                                            </Button>
                                        </div>
                                    </div>
                                </div>
                            )}
                        </CardContent>
                    </Card>
                </div>

                {/* Columna lateral - Resumen */}
                <div className="lg:col-span-1">
                    <Card>
                        <CardHeader>
                            <CardTitle>Resumen del pedido</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="space-y-4">
                                <div className="flex justify-between">
                                    <span>Subtotal</span>
                                    <span>{formatPrice(0)}</span>
                                </div>
                                <div className="flex justify-between">
                                    <span>Impuestos</span>
                                    <span>{formatPrice(0)}</span>
                                </div>
                                <Separator />
                                <div className="flex justify-between font-bold">
                                    <span>Total</span>
                                    <span>{formatPrice(0)}</span>
                                </div>
                            </div>
                        </CardContent>
                        <CardFooter>
                            <Button className="w-full" disabled={cartItems.length === 0}>
                                <CreditCard className="h-4 w-4 mr-2" />
                                Proceder al pago
                            </Button>
                        </CardFooter>
                    </Card>

                    <Card className="mt-4">
                        <CardHeader>
                            <CardTitle>Código promocional</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="flex space-x-2">
                                <Input placeholder="Ingrese su código" />
                                <Button variant="outline">Aplicar</Button>
                            </div>
                        </CardContent>
                    </Card>
                </div>
            </div>
        </div>
    );
};

export default CartPage;