'use client';

import { useState, useEffect } from 'react';
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger, } from "@/components/ui/dropdown-menu";
import { Filter, ArrowDownToLine, ArrowUpFromLine, ArrowLeftRight } from "lucide-react";

interface Area {
    _id: string;
    name: string;
}

interface SubAccount {
    id: string;
    name: string;
}

interface MovementFiltersProps {
    agencyId: string;
    areas: Area[];
    subAccounts: SubAccount[];
    onFilterChange: (filters: {
        areas: string[];
        subAccounts: string[];
        types: string[];
    }) => void;
}

export function MovementFilters({
    agencyId,
    areas,
    subAccounts,
    onFilterChange,
}: MovementFiltersProps) {
    const [selectedAreas, setSelectedAreas] = useState<string[]>([]);
    const [selectedSubAccounts, setSelectedSubAccounts] = useState<string[]>([]);
    const [selectedTypes, setSelectedTypes] = useState<string[]>([]);
    const [allAreasSelected, setAllAreasSelected] = useState(true);
    const [allSubAccountsSelected, setAllSubAccountsSelected] = useState(true);
    const [allTypesSelected, setAllTypesSelected] = useState(true);

    // Manejar cambios en la selección de áreas
    const handleAreaChange = (areaId: string, checked: boolean) => {
        if (areaId === 'all') {
            if (checked) {
                // Si se selecciona "Todas las áreas", limpiar selecciones individuales
                setSelectedAreas([]);
                setAllAreasSelected(true);
            } else {
                // Si se deselecciona "Todas las áreas", mantener el estado actual
                setAllAreasSelected(false);
            }
        } else {
            setAllAreasSelected(false);
            if (checked) {
                // Agregar área a la selección
                setSelectedAreas(prev => [...prev, areaId]);
            } else {
                // Quitar área de la selección
                setSelectedAreas(prev => prev.filter(id => id !== areaId));
            }
        }
    };

    // Manejar cambios en la selección de tiendas
    const handleSubAccountChange = (subAccountId: string, checked: boolean) => {
        if (subAccountId === 'all') {
            if (checked) {
                // Si se selecciona "Todas las tiendas", limpiar selecciones individuales
                setSelectedSubAccounts([]);
                setAllSubAccountsSelected(true);
            } else {
                // Si se deselecciona "Todas las tiendas", mantener el estado actual
                setAllSubAccountsSelected(false);
            }
        } else {
            setAllSubAccountsSelected(false);
            if (checked) {
                // Agregar tienda a la selección
                setSelectedSubAccounts(prev => [...prev, subAccountId]);
            } else {
                // Quitar tienda de la selección
                setSelectedSubAccounts(prev => prev.filter(id => id !== subAccountId));
            }
        }
    };

    // Manejar cambios en la selección de tipos de movimiento
    const handleTypeChange = (type: string, checked: boolean) => {
        if (type === 'all') {
            if (checked) {
                // Si se selecciona "Todos los tipos", limpiar selecciones individuales
                setSelectedTypes([]);
                setAllTypesSelected(true);
            } else {
                // Si se deselecciona "Todos los tipos", mantener el estado actual
                setAllTypesSelected(false);
            }
        } else {
            setAllTypesSelected(false);
            if (checked) {
                // Agregar tipo a la selección
                setSelectedTypes(prev => [...prev, type]);
            } else {
                // Quitar tipo de la selección
                setSelectedTypes(prev => prev.filter(t => t !== type));
            }
        }
    };

    // Actualizar filtros cuando cambian las selecciones
    useEffect(() => {
        onFilterChange({
            types: allTypesSelected ? [] : selectedTypes,
            areas: allAreasSelected ? [] : selectedAreas,
            subAccounts: allSubAccountsSelected ? [] : selectedSubAccounts,
        });
    }, [selectedAreas, selectedSubAccounts, selectedTypes, allAreasSelected, allSubAccountsSelected, allTypesSelected, onFilterChange]);

    return (
        <div className="flex flex-wrap gap-2">
            {/* Filtro de tipos de movimiento */}
            <DropdownMenu>
                <DropdownMenuTrigger asChild>
                    <Button variant="outline" size="sm" className="min-w-[180px] justify-between">
                        <span>Tipos {!allTypesSelected && `(${selectedTypes.length})`}</span>
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
                            className="ml-2"
                        >
                            <path d="m6 9 6 6 6-6" />
                        </svg>
                    </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-56">
                    <DropdownMenuLabel>Filtrar por tipo</DropdownMenuLabel>
                    <DropdownMenuSeparator />
                    <div className="p-2 space-y-2">
                        <div className="flex items-center space-x-2">
                            <Checkbox
                                id="tipo-todos"
                                checked={allTypesSelected}
                                onCheckedChange={(checked) => handleTypeChange('all', checked === true)}
                            />
                            <label
                                htmlFor="tipo-todos"
                                className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                            >
                                Todos los tipos
                            </label>
                        </div>
                        <div className="flex items-center space-x-2">
                            <Checkbox
                                id="tipo-entrada"
                                checked={selectedTypes.includes('entrada')}
                                onCheckedChange={(checked) => handleTypeChange('entrada', checked === true)}
                            />
                            <label
                                htmlFor="tipo-entrada"
                                className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 flex items-center"
                            >
                                <ArrowDownToLine className="h-4 w-4 mr-2 text-green-500" />
                                Entradas
                            </label>
                        </div>
                        <div className="flex items-center space-x-2">
                            <Checkbox
                                id="tipo-salida"
                                checked={selectedTypes.includes('salida')}
                                onCheckedChange={(checked) => handleTypeChange('salida', checked === true)}
                            />
                            <label
                                htmlFor="tipo-salida"
                                className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 flex items-center"
                            >
                                <ArrowUpFromLine className="h-4 w-4 mr-2 text-red-500" />
                                Salidas
                            </label>
                        </div>
                        <div className="flex items-center space-x-2">
                            <Checkbox
                                id="tipo-transferencia"
                                checked={selectedTypes.includes('transferencia')}
                                onCheckedChange={(checked) => handleTypeChange('transferencia', checked === true)}
                            />
                            <label
                                htmlFor="tipo-transferencia"
                                className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 flex items-center"
                            >
                                <ArrowLeftRight className="h-4 w-4 mr-2 text-blue-500" />
                                Transferencias
                            </label>
                        </div>
                    </div>
                </DropdownMenuContent>
            </DropdownMenu>

            {/* Filtro de áreas */}
            <DropdownMenu>
                <DropdownMenuTrigger asChild>
                    <Button variant="outline" size="sm" className="min-w-[180px] justify-between">
                        <span>Áreas {!allAreasSelected && `(${selectedAreas.length})`}</span>
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
                            className="ml-2"
                        >
                            <path d="m6 9 6 6 6-6" />
                        </svg>
                    </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-56">
                    <DropdownMenuLabel>Seleccionar áreas</DropdownMenuLabel>
                    <DropdownMenuSeparator />
                    <div className="p-2 space-y-2 max-h-[300px] overflow-y-auto">
                        <div className="flex items-center space-x-2">
                            <Checkbox
                                id="area-todas"
                                checked={allAreasSelected}
                                onCheckedChange={(checked) => handleAreaChange('all', checked === true)}
                            />
                            <label
                                htmlFor="area-todas"
                                className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                            >
                                Todas las áreas
                            </label>
                        </div>
                        {areas.map((area) => (
                            <div key={area._id.toString()} className="flex items-center space-x-2">
                                <Checkbox
                                    id={`area-${area._id}`}
                                    checked={selectedAreas.includes(area._id.toString())}
                                    onCheckedChange={(checked) => handleAreaChange(area._id.toString(), checked === true)}
                                />
                                <label
                                    htmlFor={`area-${area._id}`}
                                    className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                                >
                                    {area.name}
                                </label>
                            </div>
                        ))}
                    </div>
                </DropdownMenuContent>
            </DropdownMenu>

            {/* Filtro de tiendas */}
            <DropdownMenu>
                <DropdownMenuTrigger asChild>
                    <Button variant="outline" size="sm" className="min-w-[180px] justify-between">
                        <span>Tiendas {!allSubAccountsSelected && `(${selectedSubAccounts.length})`}</span>
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
                            className="ml-2"
                        >
                            <path d="m6 9 6 6 6-6" />
                        </svg>
                    </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-56">
                    <DropdownMenuLabel>Seleccionar tiendas</DropdownMenuLabel>
                    <DropdownMenuSeparator />
                    <div className="p-2 space-y-2 max-h-[300px] overflow-y-auto">
                        <div className="flex items-center space-x-2">
                            <Checkbox
                                id="tienda-todas"
                                checked={allSubAccountsSelected}
                                onCheckedChange={(checked) => handleSubAccountChange('all', checked === true)}
                            />
                            <label
                                htmlFor="tienda-todas"
                                className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                            >
                                Todas las tiendas
                            </label>
                        </div>
                        {subAccounts.map((subAccount) => (
                            <div key={subAccount.id} className="flex items-center space-x-2">
                                <Checkbox
                                    id={`tienda-${subAccount.id}`}
                                    checked={selectedSubAccounts.includes(subAccount.id)}
                                    onCheckedChange={(checked) => handleSubAccountChange(subAccount.id, checked === true)}
                                />
                                <label
                                    htmlFor={`tienda-${subAccount.id}`}
                                    className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                                >
                                    {subAccount.name}
                                </label>
                            </div>
                        ))}
                    </div>
                </DropdownMenuContent>
            </DropdownMenu>
        </div>
    );
}