"use client";

import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Functionality } from "@/data/functionalities";
import { toast } from "sonner";
import { v4 as uuidv4 } from 'uuid';

interface FunctionalityModalProps {
    isOpen: boolean;
    onClose: () => void;
    functionality: Functionality | null;
    mode: 'add' | 'edit';
    onSave: (functionality: Functionality) => void;
    currentUserId: string;
}

const CATEGORIAS = [
    "UX/UI",
    "Seguridad",
    "Rendimiento",
    "Funcionalidad",
    "Integración",
    "Análisis",
    "Pagos",
    "Móvil",
    "Finanzas",
    "Otro"
];

export function FunctionalityModal({
    isOpen,
    onClose,
    functionality,
    mode,
    onSave,
    currentUserId
}: FunctionalityModalProps) {
    const [nombre, setNombre] = useState("");
    const [descripcion, setDescripcion] = useState("");
    const [categoria, setCategoria] = useState(CATEGORIAS[0]);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [errors, setErrors] = useState({
        nombre: false,
        descripcion: false,
        categoria: false
    });

    useEffect(() => {
        if (functionality && mode === 'edit') {
            setNombre(functionality.nombre);
            setDescripcion(functionality.descripcion);
            setCategoria(functionality.categoria);
        } else {
            // Reset form for add mode
            setNombre("");
            setDescripcion("");
            setCategoria(CATEGORIAS[0]);
        }
        setErrors({
            nombre: false,
            descripcion: false,
            categoria: false
        });
    }, [functionality, mode, isOpen]);

    const validateForm = () => {
        const newErrors = {
            nombre: nombre.trim() === "",
            descripcion: descripcion.trim() === "",
            categoria: categoria === ""
        };

        setErrors(newErrors);
        return !Object.values(newErrors).some(error => error);
    };

    const handleSubmit = async () => {
        if (!validateForm()) {
            toast.error("Por favor completa todos los campos requeridos");
            return;
        }

        setIsSubmitting(true);

        try {
            const functionalityData: Functionality = {
                id: functionality?.id || uuidv4(),
                nombre,
                descripcion,
                categoria,
                creadorId: functionality?.creadorId || currentUserId,
                votos: functionality?.votos || 0,
                progreso: functionality?.progreso || 0,
                tareas: functionality?.tareas || []
            };

            // Llamar a la API para guardar la funcionalidad
            const response = await fetch('/api/client/control_dash/functionality/write', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    functionality: functionalityData,
                    mode
                }),
            });

            if (!response.ok) {
                throw new Error('Error al guardar la funcionalidad');
            }

            const data = await response.json();

            onSave(data.functionality);
            toast.success(mode === 'add' ? "Funcionalidad añadida correctamente" : "Funcionalidad actualizada correctamente");
            onClose();
        } catch (error) {
            console.error('Error:', error);
            toast.error("Ocurrió un error al guardar la funcionalidad");
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <Dialog open={isOpen} onOpenChange={onClose}>
            <DialogContent className="sm:max-w-[500px]">
                <DialogHeader>
                    <DialogTitle>
                        {mode === 'add' ? 'Añadir nueva funcionalidad' : 'Editar funcionalidad'}
                    </DialogTitle>
                </DialogHeader>
                <div className="grid gap-4 py-4">
                    <div className="grid grid-cols-4 items-center gap-4">
                        <label htmlFor="nombre" className="text-right font-medium">
                            Nombre
                        </label>
                        <Input
                            id="nombre"
                            value={nombre}
                            onChange={(e) => setNombre(e.target.value)}
                            className={`col-span-3 ${errors.nombre ? 'border-red-500' : ''}`}
                            placeholder="Nombre de la funcionalidad"
                        />
                        {errors.nombre && (
                            <p className="col-span-3 col-start-2 text-sm text-red-500">El nombre es requerido</p>
                        )}
                    </div>
                    <div className="grid grid-cols-4 items-center gap-4">
                        <label htmlFor="categoria" className="text-right font-medium">
                            Categoría
                        </label>
                        <Select
                            value={categoria}
                            onValueChange={setCategoria}
                        >
                            <SelectTrigger className={`col-span-3 ${errors.categoria ? 'border-red-500' : ''}`}>
                                <SelectValue placeholder="Selecciona una categoría" />
                            </SelectTrigger>
                            <SelectContent>
                                {CATEGORIAS.map((cat) => (
                                    <SelectItem key={cat} value={cat}>
                                        {cat}
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                        {errors.categoria && (
                            <p className="col-span-3 col-start-2 text-sm text-red-500">La categoría es requerida</p>
                        )}
                    </div>
                    <div className="grid grid-cols-4 items-start gap-4">
                        <label htmlFor="descripcion" className="text-right font-medium">
                            Descripción
                        </label>
                        <Textarea
                            id="descripcion"
                            value={descripcion}
                            onChange={(e) => setDescripcion(e.target.value)}
                            className={`col-span-3 min-h-[100px] ${errors.descripcion ? 'border-red-500' : ''}`}
                            placeholder="Describe la funcionalidad que deseas implementar"
                        />
                        {errors.descripcion && (
                            <p className="col-span-3 col-start-2 text-sm text-red-500">La descripción es requerida</p>
                        )}
                    </div>
                </div>
                <DialogFooter>
                    <Button variant="outline" onClick={onClose} disabled={isSubmitting}>
                        Cancelar
                    </Button>
                    <Button onClick={handleSubmit} disabled={isSubmitting}>
                        {isSubmitting ? 'Guardando...' : mode === 'add' ? 'Añadir' : 'Actualizar'}
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}