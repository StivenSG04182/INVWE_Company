'use client';

import { useState, useEffect } from 'react';
import { ProductFilters } from './product-filters';
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Search, Edit, Trash2, BarChart3 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import Link from "next/link";
import Image from "next/image";

interface Product {
    _id: string;
    name: string;
    sku: string;
    price: number;
    cost?: number;
    minStock?: number;
    images?: string[];
    productImage?: string;
    categoryId?: string;
    subaccountId: string;
    agencyId: string;
}

interface Category {
    _id: string;
    name: string;
}

interface SubAccount {
    id: string;
    name: string;
}

interface FilteredProductsProps {
    agencyId: string;
    products: Product[];
    categories: Category[];
    subAccounts: SubAccount[];
}

export function FilteredProducts({
    agencyId,
    products,
    categories,
    subAccounts,
}: FilteredProductsProps) {
    const [searchTerm, setSearchTerm] = useState('');
    const [filters, setFilters] = useState({
        categories: [] as string[],
        subAccounts: [] as string[],
    });
    const [filteredProducts, setFilteredProducts] = useState<Product[]>(products);

    // Aplicar filtros cuando cambian los criterios
    useEffect(() => {
        let result = [...products];

        // Filtrar por término de búsqueda
        if (searchTerm) {
            const term = searchTerm.toLowerCase();
            result = result.filter(
                (product) =>
                    product.name.toLowerCase().includes(term) ||
                    product.sku.toLowerCase().includes(term)
            );
        }

        // Filtrar por categorías seleccionadas
        if (filters.categories.length > 0) {
            result = result.filter((product) =>
                product.categoryId ? filters.categories.includes(product.categoryId) : false
            );
        }

        // Filtrar por subcuentas seleccionadas
        if (filters.subAccounts.length > 0) {
            result = result.filter((product) =>
                filters.subAccounts.includes(product.subaccountId)
            );
        }

        setFilteredProducts(result);
    }, [searchTerm, filters, products]);

    // Manejar cambios en los filtros
    const handleFilterChange = (newFilters: {
        categories: string[];
        subAccounts: string[];
    }) => {
        setFilters(newFilters);
    };

    // Obtener el nombre de la categoría
    const getCategoryName = (categoryId?: string) => {
        if (!categoryId) return 'Sin categoría';
        const category = categories.find(cat => cat._id.toString() === categoryId);
        return category ? category.name : 'Sin categoría';
    };

    // Obtener el nombre de la subcuenta
    const getSubAccountName = (subaccountId: string) => {
        const subAccount = subAccounts.find(sub => sub.id === subaccountId);
        return subAccount ? subAccount.name : 'Agencia principal';
    };

    return (
        <div>
            <div className="flex flex-col md:flex-row gap-4 mb-6">
                <div className="relative flex-1">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input
                        placeholder="Buscar productos por nombre, SKU o código de barras..."
                        className="pl-10"
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                    />
                </div>
                <ProductFilters
                    agencyId={agencyId}
                    categories={categories}
                    subAccounts={subAccounts}
                    onFilterChange={handleFilterChange}
                />
            </div>

            <Tabs defaultValue="grid" className="w-full">
                <div className="flex justify-between items-center mb-4">
                    <TabsList>
                        <TabsTrigger value="grid">
                            <div className="flex items-center">
                                <svg
                                    xmlns="http://www.w3.org/2000/svg"
                                    width="16"
                                    height="16"
                                    viewBox="0 0 24 24"
                                    fill="none"
                                    stroke="currentColor"
                                    strokeWidth="2"
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    className="mr-2"
                                >
                                    <rect width="7" height="7" x="3" y="3" rx="1" />
                                    <rect width="7" height="7" x="14" y="3" rx="1" />
                                    <rect width="7" height="7" x="14" y="14" rx="1" />
                                    <rect width="7" height="7" x="3" y="14" rx="1" />
                                </svg>
                                Cuadrícula
                            </div>
                        </TabsTrigger>
                        <TabsTrigger value="table">
                            <div className="flex items-center">
                                <svg
                                    xmlns="http://www.w3.org/2000/svg"
                                    width="16"
                                    height="16"
                                    viewBox="0 0 24 24"
                                    fill="none"
                                    stroke="currentColor"
                                    strokeWidth="2"
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    className="mr-2"
                                >
                                    <path d="M3 3h18v18H3z" />
                                    <path d="M3 9h18" />
                                    <path d="M3 15h18" />
                                    <path d="M9 3v18" />
                                    <path d="M15 3v18" />
                                </svg>
                                Tabla
                            </div>
                        </TabsTrigger>
                    </TabsList>
                    <div className="text-sm text-muted-foreground">
                        {filteredProducts.length} productos encontrados
                    </div>
                </div>

                <TabsContent value="grid" className="mt-0">
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                        {filteredProducts.map((product) => (
                            <Card key={product._id.toString()} className="overflow-hidden">
                                <div className="relative aspect-square">
                                    {(product.productImage || (product.images && product.images.length > 0)) ? (
                                        <Image
                                            src={product.productImage || product.images?.[0]}
                                            alt={product.name}
                                            fill
                                            className="object-cover"
                                        />
                                    ) : (
                                        <div className="w-full h-full bg-muted flex items-center justify-center">
                                            <span className="text-muted-foreground">Sin imagen</span>
                                        </div>
                                    )}
                                </div>
                                <CardContent className="p-4">
                                    <div className="flex justify-between items-start mb-2">
                                        <h3 className="font-semibold truncate">{product.name}</h3>
                                        <Badge variant="outline">{getCategoryName(product.categoryId)}</Badge>
                                    </div>
                                    <div className="flex justify-between items-center mb-2">
                                        <span className="text-sm text-muted-foreground">SKU: {product.sku}</span>
                                        <span className="font-medium">${product.price.toFixed(2)}</span>
                                    </div>
                                    <div className="text-xs text-muted-foreground mb-4">
                                        {getSubAccountName(product.subaccountId)}
                                    </div>
                                    <div className="flex gap-2 justify-end">
                                        <Link href={`/agency/${agencyId}/products/${product._id}`} className="flex-1">
                                            <Button variant="outline" size="sm" className="w-full">
                                                <Edit className="h-4 w-4 mr-2" />
                                                Editar
                                            </Button>
                                        </Link>
                                        <Link href={`/agency/${agencyId}/products/${product._id}/stock`} className="flex-1">
                                            <Button variant="outline" size="sm" className="w-full">
                                                <BarChart3 className="h-4 w-4 mr-2" />
                                                Stock
                                            </Button>
                                        </Link>
                                    </div>
                                </CardContent>
                            </Card>
                        ))}
                    </div>
                </TabsContent>

                <TabsContent value="table" className="mt-0">
                    <div className="rounded-md border">
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead>Producto</TableHead>
                                    <TableHead>SKU</TableHead>
                                    <TableHead>Categoría</TableHead>
                                    <TableHead>Subcuenta</TableHead>
                                    <TableHead>Precio</TableHead>
                                    <TableHead>Acciones</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {filteredProducts.map((product) => (
                                    <TableRow key={product._id.toString()}>
                                        <TableCell>
                                            <div className="flex items-center gap-3">
                                                <div className="h-10 w-10 rounded-md overflow-hidden bg-muted">
                                                    {(product.productImage || (product.images && product.images.length > 0)) ? (
                                                        <Image
                                                            src={product.productImage || product.images?.[0]}
                                                            alt={product.name}
                                                            width={40}
                                                            height={40}
                                                            className="object-cover"
                                                        />
                                                    ) : (
                                                        <div className="w-full h-full flex items-center justify-center">
                                                            <span className="text-xs text-muted-foreground">Sin img</span>
                                                        </div>
                                                    )}
                                                </div>
                                                <span className="font-medium">{product.name}</span>
                                            </div>
                                        </TableCell>
                                        <TableCell>{product.sku}</TableCell>
                                        <TableCell>
                                            <Badge variant="outline">{getCategoryName(product.categoryId)}</Badge>
                                        </TableCell>
                                        <TableCell>{getSubAccountName(product.subaccountId)}</TableCell>
                                        <TableCell>${product.price.toFixed(2)}</TableCell>
                                        <TableCell className="text-right">
                                            <div className="flex justify-end gap-2">
                                                <Button variant="ghost" size="icon" asChild>
                                                    <Link href={`/agency/${agencyId}/products/${product._id}`}>
                                                        <Edit className="h-4 w-4" />
                                                    </Link>
                                                </Button>
                                                <Button variant="ghost" size="icon" asChild>
                                                    <Link href={`/agency/${agencyId}/products/${product._id}/stock`}>
                                                        <BarChart3 className="h-4 w-4" />
                                                    </Link>
                                                </Button>
                                            </div>
                                        </TableCell>
                                    </TableRow>
                                ))}
                            </TableBody>
                        </Table>
                    </div>
                </TabsContent>
            </Tabs>
        </div>
    );
}