'use client';

import { useState, useEffect } from 'react';
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Filter } from "lucide-react";

interface Category {
    _id: string;
    name: string;
}

interface SubAccount {
    id: string;
    name: string;
}

interface ProductFiltersProps {
    agencyId: string;
    categories: Category[];
    subAccounts: SubAccount[];
    onFilterChange: (filters: {
        categories: string[];
        subAccounts: string[];
    }) => void;
}

export function ProductFilters({
    agencyId,
    categories,
    subAccounts,
    onFilterChange,
}: ProductFiltersProps) {
    const [selectedCategories, setSelectedCategories] = useState<string[]>([]);
    const [selectedSubAccounts, setSelectedSubAccounts] = useState<string[]>([]);
    const [allCategoriesSelected, setAllCategoriesSelected] = useState(true);
    const [allSubAccountsSelected, setAllSubAccountsSelected] = useState(true);

    // Manejar cambios en la selección de categorías
    const handleCategoryChange = (categoryId: string, checked: boolean) => {
        if (categoryId === 'all') {
            if (checked) {
                // Si se selecciona "Todas las categorías", limpiar selecciones individuales
                setSelectedCategories([]);
                setAllCategoriesSelected(true);
            } else {
                // Si se deselecciona "Todas las categorías", mantener el estado actual
                setAllCategoriesSelected(false);
            }
        } else {
            setAllCategoriesSelected(false);
            if (checked) {
                // Agregar categoría a la selección
                setSelectedCategories(prev => [...prev, categoryId]);
            } else {
                // Quitar categoría de la selección
                setSelectedCategories(prev => prev.filter(id => id !== categoryId));
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

    // Actualizar filtros cuando cambian las selecciones
    useEffect(() => {
        onFilterChange({
            categories: allCategoriesSelected ? [] : selectedCategories,
            subAccounts: allSubAccountsSelected ? [] : selectedSubAccounts,
        });
    }, [selectedCategories, selectedSubAccounts, allCategoriesSelected, allSubAccountsSelected, onFilterChange]);

    return (
        <div className="flex flex-wrap gap-2">
            {/* Filtro de categorías */}
            <DropdownMenu>
                <DropdownMenuTrigger asChild>
                    <Button variant="outline" size="sm" className="min-w-[180px] justify-between">
                        <span>Categorías {!allCategoriesSelected && `(${selectedCategories.length})`}</span>
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
                    <DropdownMenuLabel>Seleccionar categorías</DropdownMenuLabel>
                    <DropdownMenuSeparator />
                    <div className="p-2 space-y-2 max-h-[300px] overflow-y-auto">
                        <div className="flex items-center space-x-2">
                            <Checkbox
                                id="categoria-todas"
                                checked={allCategoriesSelected}
                                onCheckedChange={(checked) => handleCategoryChange('all', checked === true)}
                            />
                            <label
                                htmlFor="categoria-todas"
                                className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                            >
                                Todas las categorías
                            </label>
                        </div>
                        {categories.map((category) => (
                            <div key={category._id.toString()} className="flex items-center space-x-2">
                                <Checkbox
                                    id={`categoria-${category._id}`}
                                    checked={selectedCategories.includes(category._id.toString())}
                                    onCheckedChange={(checked) => handleCategoryChange(category._id.toString(), checked === true)}
                                />
                                <label
                                    htmlFor={`categoria-${category._id}`}
                                    className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                                >
                                    {category.name}
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