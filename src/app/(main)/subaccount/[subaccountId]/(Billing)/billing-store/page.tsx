import { redirect } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import { db } from '@/lib/db';
import { getAuthUserDetails } from '@/lib/queries';
import { formatPrice } from '@/lib/utils';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

import { ShoppingCart, Filter, Search, Tag, ArrowUpDown, Grid3X3, List } from 'lucide-react';

const BillingStorePage = async ({ params }: { params: { subaccountId: string } }) => {
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

    // Obtener productos disponibles para esta subcuenta
    const products = await db.product.findMany({
        where: {
            subaccountId: subaccountId,
            active: true,
        },
        include: {
            Category: true,
        },
        orderBy: {
            createdAt: 'desc',
        },
    });

    // Obtener categorías para filtrado
    const categories = await db.category.findMany({
        where: {
            subaccountId: subaccountId,
        },
        orderBy: {
            name: 'asc',
        },
    });

    return (
        <div className="flex flex-col gap-4 p-4">
            <div className="flex justify-between items-center">
                <h1 className="text-2xl font-bold">Tienda de Productos</h1>
                <div className="flex gap-2">
                    <Link href={`/subaccount/${subaccountId}/cart`}>
                        <Button variant="outline" className="flex items-center gap-2">
                            <ShoppingCart className="h-4 w-4" />
                            Carrito (0)
                        </Button>
                    </Link>
                </div>
            </div>

            <div className="bg-card rounded-lg p-4 shadow-sm">
                <div className="mb-4">
                    <h2 className="text-xl font-semibold mb-2">Catálogo de Productos</h2>
                    <p className="text-muted-foreground">
                        Explore todos los productos disponibles para su negocio. Seleccione los productos que desea adquirir.
                    </p>
                </div>

                <div className="flex flex-col md:flex-row gap-4 mb-6">
                    <div className="flex-1 flex gap-2">
                        <div className="relative w-full">
                            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                            <input
                                type="text"
                                placeholder="Buscar productos..."
                                className="pl-10 pr-4 py-2 border rounded-md w-full"
                            />
                        </div>
                        <Button variant="outline" className="flex items-center gap-2">
                            <Filter className="h-4 w-4" />
                            Filtros
                        </Button>
                    </div>
                    <div className="flex gap-2">
                        <Button variant="ghost" size="icon">
                            <Grid3X3 className="h-4 w-4" />
                        </Button>
                        <Button variant="ghost" size="icon">
                            <List className="h-4 w-4" />
                        </Button>
                        <select className="px-3 py-2 border rounded-md">
                            <option value="newest">Más recientes</option>
                            <option value="price-asc">Precio: menor a mayor</option>
                            <option value="price-desc">Precio: mayor a menor</option>
                            <option value="name-asc">Nombre: A-Z</option>
                            <option value="name-desc">Nombre: Z-A</option>
                        </select>
                    </div>
                </div>

                <Tabs defaultValue="all" className="w-full">
                    <TabsList className="mb-4">
                        <TabsTrigger value="all">Todos</TabsTrigger>
                        {categories.map((category) => (
                            <TabsTrigger key={category.id} value={category.id}>
                                {category.name}
                            </TabsTrigger>
                        ))}
                    </TabsList>

                    <TabsContent value="all">
                        {products.length === 0 ? (
                            <div className="text-center py-10">
                                <p className="text-muted-foreground">No hay productos disponibles en este momento.</p>
                            </div>
                        ) : (
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                                {products.map((product) => (
                                    <Card key={product.id} className="overflow-hidden flex flex-col h-full">
                                        <div className="relative aspect-video overflow-hidden bg-muted">
                                            {product.images && product.images.length > 0 ? (
                                                <Image
                                                    src={product.images[0]}
                                                    alt={product.name}
                                                    fill
                                                    className="object-cover transition-transform hover:scale-105"
                                                />
                                            ) : (
                                                <div className="w-full h-full flex items-center justify-center bg-muted">
                                                    <span className="text-muted-foreground">Sin imagen</span>
                                                </div>
                                            )}
                                            {product.Category && (
                                                <Badge className="absolute top-2 right-2">
                                                    {product.Category.name}
                                                </Badge>
                                            )}
                                        </div>
                                        <CardHeader className="pb-2">
                                            <CardTitle className="text-lg">{product.name}</CardTitle>
                                            <CardDescription className="line-clamp-2">
                                                {product.description || 'Sin descripción'}
                                            </CardDescription>
                                        </CardHeader>
                                        <CardContent className="pb-2 flex-grow">
                                            <div className="flex justify-between items-center">
                                                <span className="text-xl font-bold">{formatPrice(Number(product.price))}</span>
                                                {Number(product.minStock) > 0 && (
                                                    <span className="text-sm text-muted-foreground">
                                                        Stock mínimo: {product.minStock}
                                                    </span>
                                                )}
                                            </div>
                                        </CardContent>
                                        <CardFooter>
                                            <Button className="w-full">Agregar al carrito</Button>
                                        </CardFooter>
                                    </Card>
                                ))}
                            </div>
                        )}
                    </TabsContent>

                    {categories.map((category) => (
                        <TabsContent key={category.id} value={category.id}>
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                                {products
                                    .filter((product) => product.categoryId === category.id)
                                    .map((product) => (
                                        <Card key={product.id} className="overflow-hidden flex flex-col h-full">
                                            <div className="relative aspect-video overflow-hidden bg-muted">
                                                {product.images && product.images.length > 0 ? (
                                                    <Image
                                                        src={product.images[0]}
                                                        alt={product.name}
                                                        fill
                                                        className="object-cover transition-transform hover:scale-105"
                                                    />
                                                ) : (
                                                    <div className="w-full h-full flex items-center justify-center bg-muted">
                                                        <span className="text-muted-foreground">Sin imagen</span>
                                                    </div>
                                                )}
                                            </div>
                                            <CardHeader className="pb-2">
                                                <CardTitle className="text-lg">{product.name}</CardTitle>
                                                <CardDescription className="line-clamp-2">
                                                    {product.description || 'Sin descripción'}
                                                </CardDescription>
                                            </CardHeader>
                                            <CardContent className="pb-2 flex-grow">
                                                <div className="flex justify-between items-center">
                                                    <span className="text-xl font-bold">{formatPrice(Number(product.price))}</span>
                                                    {Number(product.minStock) > 0 && (
                                                        <span className="text-sm text-muted-foreground">
                                                            Stock mínimo: {product.minStock}
                                                        </span>
                                                    )}
                                                </div>
                                            </CardContent>
                                            <CardFooter>
                                                <Button className="w-full">Agregar al carrito</Button>
                                            </CardFooter>
                                        </Card>
                                    ))}
                            </div>
                            {products.filter((product) => product.categoryId === category.id).length === 0 && (
                                <div className="text-center py-10">
                                    <p className="text-muted-foreground">No hay productos disponibles en esta categoría.</p>
                                </div>
                            )}
                        </TabsContent>
                    ))}
                </Tabs>
            </div>
        </div>
    );
};

export default BillingStorePage;