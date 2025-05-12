'use client';

import { useState, useEffect } from 'react';
import { MovementFilters } from './movement-filters';
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Search, ArrowDownToLine, ArrowUpFromLine, ArrowLeftRight } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { format } from 'date-fns';
import { es } from 'date-fns/locale';

interface Movement {
    _id: string;
    type: 'entrada' | 'salida' | 'transferencia';
    productId: string;
    productName?: string;
    productSku?: string;
    areaId: string;
    areaName?: string;
    quantity: number;
    providerId?: string;
    providerName?: string;
    notes?: string;
    createdAt?: Date;
    subaccountId: string;
    agencyId: string;
}

interface Area {
    _id: string;
    name: string;
}

interface SubAccount {
    id: string;
    name: string;
}

interface FilteredMovementsProps {
    agencyId: string;
    movements: Movement[];
    areas: Area[];
    subAccounts: SubAccount[];
}

export function FilteredMovements({
    agencyId,
    movements,
    areas,
    subAccounts,
}: FilteredMovementsProps) {
    const [searchTerm, setSearchTerm] = useState('');
    const [filters, setFilters] = useState({
        areas: [] as string[],
        subAccounts: [] as string[],
        types: [] as string[],
    });
    const [filteredMovements, setFilteredMovements] = useState<Movement[]>(movements);

    // Aplicar filtros cuando cambian los criterios
    useEffect(() => {
        let result = [...movements];

        // Filtrar por término de búsqueda
        if (searchTerm) {
            const term = searchTerm.toLowerCase();
            result = result.filter(
                (movement) =>
                    (movement.productName && movement.productName.toLowerCase().includes(term)) ||
                    (movement.productSku && movement.productSku.toLowerCase().includes(term)) ||
                    (movement.notes && movement.notes.toLowerCase().includes(term))
            );
        }

        // Filtrar por áreas seleccionadas
        if (filters.areas.length > 0) {
            result = result.filter((movement) =>
                filters.areas.includes(movement.areaId)
            );
        }

        // Filtrar por subcuentas seleccionadas
        if (filters.subAccounts.length > 0) {
            result = result.filter((movement) =>
                filters.subAccounts.includes(movement.subaccountId)
            );
        }

        // Filtrar por tipos de movimiento seleccionados
        if (filters.types.length > 0) {
            result = result.filter((movement) =>
                filters.types.includes(movement.type)
            );
        }

        setFilteredMovements(result);
    }, [searchTerm, filters, movements]);

    // Manejar cambios en los filtros
    const handleFilterChange = (newFilters: {
        areas: string[];
        subAccounts: string[];
        types: string[];
    }) => {
        setFilters(newFilters);
    };

    // Obtener el nombre del área
    const getAreaName = (areaId: string) => {
        const area = areas.find(area => area._id.toString() === areaId);
        return area ? area.name : 'Área desconocida';
    };

    // Obtener el nombre de la subcuenta
    const getSubAccountName = (subaccountId: string) => {
        const subAccount = subAccounts.find(sub => sub.id === subaccountId);
        return subAccount ? subAccount.name : 'Agencia principal';
    };

    // Renderizar icono según el tipo de movimiento
    const renderTypeIcon = (type: 'entrada' | 'salida' | 'transferencia') => {
        switch (type) {
            case 'entrada':
                return <ArrowDownToLine className="h-4 w-4 text-green-500" />;
            case 'salida':
                return <ArrowUpFromLine className="h-4 w-4 text-red-500" />;
            case 'transferencia':
                return <ArrowLeftRight className="h-4 w-4 text-blue-500" />;
        }
    };

    // Formatear fecha
    const formatDate = (date?: Date) => {
        if (!date) return 'Fecha desconocida';
        return format(new Date(date), 'dd MMM yyyy, HH:mm', { locale: es });
    };

    return (
        <div>
            <div className="flex flex-col md:flex-row gap-4 mb-6">
                <div className="relative flex-1">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input
                        placeholder="Buscar movimientos por producto, SKU o notas..."
                        className="pl-10"
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                    />
                </div>
                <MovementFilters
                    agencyId={agencyId}
                    areas={areas}
                    subAccounts={subAccounts}
                    onFilterChange={handleFilterChange}
                />
            </div>

            <Card>
                <CardContent className="p-0">
                    {filteredMovements.length === 0 ? (
                        <div className="flex flex-col items-center justify-center p-10">
                            <h3 className="text-xl font-medium mb-2">No se encontraron movimientos</h3>
                            <p className="text-muted-foreground text-center mb-6">
                                No hay movimientos que coincidan con los criterios de búsqueda.
                            </p>
                        </div>
                    ) : (
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead>Tipo</TableHead>
                                    <TableHead>Producto</TableHead>
                                    <TableHead>Área</TableHead>
                                    <TableHead>Cantidad</TableHead>
                                    <TableHead>Subcuenta</TableHead>
                                    <TableHead>Fecha</TableHead>
                                    <TableHead>Notas</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {filteredMovements.map((movement) => (
                                    <TableRow key={movement._id.toString()}>
                                        <TableCell>
                                            <div className="flex items-center gap-2">
                                                {renderTypeIcon(movement.type)}
                                                <Badge
                                                    variant={movement.type === 'entrada' ? 'default' : movement.type === 'salida' ? 'destructive' : 'outline'}
                                                    className="capitalize"
                                                >
                                                    {movement.type}
                                                </Badge>
                                            </div>
                                        </TableCell>
                                        <TableCell>
                                            <div>
                                                <p className="font-medium">{movement.productName || 'Producto desconocido'}</p>
                                                <p className="text-xs text-muted-foreground">{movement.productSku || 'Sin SKU'}</p>
                                            </div>
                                        </TableCell>
                                        <TableCell>{getAreaName(movement.areaId)}</TableCell>
                                        <TableCell className="font-medium">{movement.quantity}</TableCell>
                                        <TableCell>{getSubAccountName(movement.subaccountId)}</TableCell>
                                        <TableCell>{formatDate(movement.createdAt)}</TableCell>
                                        <TableCell>
                                            <p className="text-sm text-muted-foreground truncate max-w-[200px]">
                                                {movement.notes || '-'}
                                            </p>
                                        </TableCell>
                                    </TableRow>
                                ))}
                            </TableBody>
                        </Table>
                    )}
                </CardContent>
            </Card>
        </div>
    );
}