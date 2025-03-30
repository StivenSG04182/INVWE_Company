"use client"

import { BackgroundBeams } from "@/components/ui/background-beams"
import { Card } from "@/components/ui/card"
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from "recharts"

const data = [
    { name: "Empresas", value: 400 },
    { name: "Usuarios", value: 3000 },
    { name: "Productos", value: 2000 },
]

export default function AdminDashboard() {
    return (
        <div className="relative min-h-screen bg-gray-100 p-8">
            <BackgroundBeams />
            <div className="relative z-10">
                <h1 className="text-4xl font-bold mb-8 text-center text-gray-800">Dashboard de Administrador Global</h1>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    <Card className="p-6">
                        <h2 className="text-2xl font-semibold mb-4">Empresas Registradas</h2>
                        <p className="text-4xl font-bold">400</p>
                    </Card>
                    <Card className="p-6">
                        <h2 className="text-2xl font-semibold mb-4">Usuarios Activos</h2>
                        <p className="text-4xl font-bold">3,000</p>
                    </Card>
                    <Card className="p-6">
                        <h2 className="text-2xl font-semibold mb-4">Productos Totales</h2>
                        <p className="text-4xl font-bold">2,000</p>
                    </Card>
                </div>
                <Card className="mt-8 p-6">
                    <h2 className="text-2xl font-semibold mb-4">Estadísticas Generales</h2>
                    <ResponsiveContainer width="100%" height={300}>
                        <BarChart data={data}>
                            <CartesianGrid strokeDasharray="3 3" />
                            <XAxis dataKey="name" />
                            <YAxis />
                            <Tooltip />
                            <Legend />
                            <Bar dataKey="value" fill="#8884d8" />
                        </BarChart>
                    </ResponsiveContainer>
                </Card>
            </div>
        </div>
    )
}

