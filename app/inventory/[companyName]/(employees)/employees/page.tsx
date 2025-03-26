'use client'

import React, { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'

interface Employee {
    id: number
    name: string
    rol: string
    email: string
    telefono: string

}



export default function EmployeesPage() {
    const [isModalOpen, setIsModalOpen] = useState(false);
    const openModal = () => setIsModalOpen(true);
    const closeModal = () => setIsModalOpen(false);

    const [employees, setEmployees] = useState<Employee[]>([
        {
            id: 1,
            name: "John Doe",
            rol: "Manager",
            email: "john@example.com",
            telefono: "2315621545"
        },
        {
            id: 2,
            name: "Jane Doe",
            rol: "Employee",
            email: "jane@example.com",
            telefono: "2315621545"
        }
    ])

    return (
        <div className="p-6">
            <h1 className="text-2xl font-bold mb-4">Employees Management</h1>

            <div className="flex gap-4 mb-6">
                <Button className='text-3xl'>+</Button>
                <Input
                    placeholder="Search employees..."
                    className="max-w-sm"
                />
            </div>

            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                {employees.map(employee => (
                    <Card key={employee.id}>
                        <CardHeader>
                            <CardTitle>{employee.name}</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <p className="text-sm text-gray-600">Rol: {employee.rol}</p>
                            <p className="text-sm text-gray-600">Email: {employee.email}</p>
                            <p className='text-sm text-gray-600'>Telefono: {employee.telefono}</p>
                            <div className="flex gap-2 mt-4">
                                <Button variant="outline" size="sm" onClick={openModal}>Edit</Button>
                                <Button variant="destructive" size="sm">Delete</Button>
                            </div>
                        </CardContent>
                    </Card>
                ))}
            </div>

            {isModalOpen && (
            <div className="fixed inset-0 flex items-center justify-center z-50 backdrop-blur-sm">
                <div 
                    className="absolute inset-0 bg-black opacity-50"
                    onClick={closeModal}
                />
          
                <div className="bg-white rounded-lg p-8 max-w-md max-h-md relative">
                    <h2 className="text-xl font-bold mb-4">Editar empleado</h2>
                    <p className="mb-6">Datos del empleado</p>
                    <div className='grid gap-6 mb-5'>
                        <input placeholder='nombre' className='rounded-lg border border-gray-400 max-w-sm pl-2' />
                        <input placeholder='rol' className='rounded-lg border border-gray-400 max-w-sm pl-2' />
                        <input placeholder='email' className='rounded-lg border border-gray-400 max-w-sm pl-2' />
                        <input placeholder='telefono' className='rounded-lg border border-gray-400 max-w-sm pl-2' />
                    </div>

                
                    <div className="flex justify-end">
                        <button onClick={closeModal}
                        className="px-4 py-2 bg-gray-300 text-gray-800 rounded hover:bg-gray-400 mr-2">
                            Cancelar</button>
                        <button className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
                        onClick={() => {
                        console.log('Confirmado');
                        closeModal();
                        }}>Aceptar</button>
                    </div>
                </div>
            </div>)}
        </div>
        
    )
}
