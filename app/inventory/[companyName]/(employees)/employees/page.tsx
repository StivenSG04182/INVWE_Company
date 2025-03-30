'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'

interface Employee {
    id: number
    name: string
    position: string
    email: string
}

export default function EmployeesPage() {
<<<<<<< Updated upstream
    const [employees, setEmployees] = useState<Employee[]>([
=======
    const [isModalOpen, setIsModalOpen] = useState(false);
    const openModal = () => setIsModalOpen(true);
    const closeModal = () => setIsModalOpen(false);

    const [employees,] = useState<Employee[]>([
>>>>>>> Stashed changes
        {
            id: 1,
            name: "John Doe",
            position: "Manager",
            email: "john@example.com"
        }
    ])

    return (
        <div className="p-6">
            <h1 className="text-2xl font-bold mb-4">Employees Management</h1>

            <div className="flex gap-4 mb-6">
                <Input
                    placeholder="Search employees..."
                    className="max-w-sm"
                />
                <Button>Add Employee</Button>
            </div>

            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                {employees.map(employee => (
                    <Card key={employee.id}>
                        <CardHeader>
                            <CardTitle>{employee.name}</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <p className="text-sm text-gray-600">Position: {employee.position}</p>
                            <p className="text-sm text-gray-600">Email: {employee.email}</p>
                            <div className="flex gap-2 mt-4">
                                <Button variant="outline" size="sm">Edit</Button>
                                <Button variant="destructive" size="sm">Delete</Button>
                            </div>
                        </CardContent>
                    </Card>
                ))}
            </div>
        </div>
    )
}
