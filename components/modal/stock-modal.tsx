'use client'

import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import {
    Dialog,
    DialogContent,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from '@/components/ui/dialog';

interface Stock {
    id?: number;
    name: string;
    type: string;
    stock: number;
    price: number;
    description: string;
}

interface StockModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSubmit: (stockData: Stock) => void;
    onDelete?: () => void;
    initialData?: Stock;
    mode?: 'add' | 'edit';
    categories: string[];
}

export const StockModal: React.FC<StockModalProps> = ({
    isOpen,
    onClose,
    onSubmit,
    onDelete,
    initialData,
    mode = 'add',
    categories = []
}) => {
    const [stockData, setStockData] = useState<Stock>({
        name: '',
        type: '',
        stock: 0,
        price: 0,
        description: '',
    });

    useEffect(() => {
        if (initialData) {
            setStockData(initialData);
        } else {
            setStockData({
                name: '',
                type: '',
                stock: 0,
                price: 0,
                description: '',
            });
        }
    }, [initialData, isOpen]);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
        const { name, value } = e.target;
        setStockData(prev => ({
            ...prev,
            [name]: name === 'stock' || name === 'price' ? Number(value) : value
        }));
    };

    const handleSubmit = () => {
        if (!stockData.name.trim()) {
            alert('El nombre del producto es obligatorio');
            return;
        }
        if (stockData.price <= 0) {
            alert('El precio debe ser mayor que 0');
            return;
        }
        if (stockData.stock < 0) {
            alert('El stock no puede ser negativo');
            return;
        }

        if (mode === 'add' && !stockData.price) {
            setStockData(prev => ({
                ...prev,
                price: 0
            }))
        }
        onSubmit(stockData);
    };

    const handleDelete = () => {
        if (mode === 'edit' && confirm('¿Estás seguro de que deseas eliminar este producto?')) {
            onDelete?.();
            onClose();
        }
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg shadow-lg w-full max-w-md mx-4 overflow-y-auto max-h-screen">
                <div className="p-6">
                    <div className="space-y-4">
                        <div>
                            <Label htmlFor="name">Nombre</Label>
                            <Input
                                id="name"
                                name="name"
                                value={stockData.name}
                                onChange={handleChange}
                                placeholder="Nombre del producto"
                            />
                        </div>

                        <div>
                            <Label htmlFor="description">Descripción</Label>
                            <Textarea
                                id="description"
                                name="description"
                                value={stockData.description}
                                onChange={handleChange}
                                placeholder="Descripción"
                                rows={3}
                            />
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <Label htmlFor="price">Precio Total</Label>
                                <Input
                                    id="price"
                                    name="price"
                                    type="number"
                                    value={stockData.price}
                                    onChange={handleChange}
                                    min="0"
                                    step="0.01"
                                />
                            </div>

                            <div>
                                <Label htmlFor="stock">Stock</Label>
                                <Input
                                    id="stock"
                                    name="stock"
                                    type="number"
                                    value={stockData.stock}
                                    onChange={handleChange}
                                    min="0"
                                />
                            </div>
                        </div>

                        <div>
                            <Label htmlFor="type">Tipo</Label>
                            <select
                                id="type"
                                name="type"
                                value={stockData.type}
                                onChange={handleChange}
                                className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                            >
                                <option value="">Seleccione un tipo</option>
                                {categories.map((cat) => (
                                    <option key={cat} value={cat}>{cat}</option>
                                ))}
                            </select>
                        </div>
                    </div>

                    <div className="flex justify-between mt-6">
                        {mode === 'edit' ? (
                            <Button
                                variant="destructive"
                                onClick={handleDelete}
                            >
                                Eliminar
                            </Button>
                        ) : (
                            <div></div>
                        )}

                        <div className="space-x-2">
                            <Button
                                variant="outline"
                                onClick={onClose}
                            >
                                Cancelar
                            </Button>

                            <Button
                                onClick={handleSubmit}
                            >
                                {mode === 'add' ? 'Añadir producto' : 'Guardar cambios'}
                            </Button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};