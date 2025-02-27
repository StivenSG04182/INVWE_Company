"use client"

import { type ChartConfig } from "@/components/ui/chart"

const config: ChartConfig = {
    desktop: {
        label: "Desktop",
        color: "bg-primary"
    }
}

export default function Page() {
    return (
        <div className="grid md:grid-cols-2 gap-12 items-center">
            <p>Este formulario es para consultar de planes empresariales dirigidas a empresas
            en crecimiento, No abordamos las preocupaciones relacionadas con el soporte aquí,
            por favor envíe un ticket de soporte para asistencia más detallada.
            <h1>Nombre de la empresa</h1>
            <h1>Su nombre</h1>
            </p>
        </div>
        
    );
}