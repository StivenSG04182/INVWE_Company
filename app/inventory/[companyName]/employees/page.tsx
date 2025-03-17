'use client'

import { useState } from 'react'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Checkbox } from '@/components/ui/checkbox'
import { Label } from '@/components/ui/label'
import { LayoutGrid, List, UserPlus } from 'lucide-react'
import { toast } from "sonner"

interface Employee {
    id: string
    name: string
    role: string
    email: string
    joinDate: string
    permissions?: {
        canManageInventory?: boolean
        canViewReports?: boolean
        canManageEmployees?: boolean
        canProcessOrders?: boolean
        canManageSettings?: boolean
    }
}

// Dummy data for demonstration
const dummyEmployees: Employee[] = [
    {
        id: '1',
        name: 'John Doe',
        role: 'Manager',
        email: 'john@example.com',
        joinDate: '2023-01-15',
    },
    // Add more dummy data as needed
]

export default function EmployeesPage() {
    const [searchQuery, setSearchQuery] = useState('')
    const [roleFilter, setRoleFilter] = useState('all')
    const [viewMode, setViewMode] = useState<'list' | 'grid'>('list')
    const [selectedEmployee, setSelectedEmployee] = useState<Employee | null>(null)
    const [editedPermissions, setEditedPermissions] = useState<Employee['permissions']>({})
    const [editedInfo, setEditedInfo] = useState<Partial<Employee>>({})
    const [inviteEmail, setInviteEmail] = useState('')

    const handlePermissionChange = (permission: keyof Employee['permissions']) => {
        setEditedPermissions(prev => ({
            ...prev,
            [permission]: !prev[permission]
        }))
    }

    const handleInfoChange = (field: keyof Employee, value: string) => {
        setEditedInfo(prev => ({
            ...prev,
            [field]: value
        }))
    }

    const handleSave = () => {
        // Here you would implement the API call to save changes
        console.log('Saving changes:', { permissions: editedPermissions, info: editedInfo })
    }

    const filteredEmployees = dummyEmployees.filter((employee) => {
        const matchesSearch = employee.name
            .toLowerCase()
            .includes(searchQuery.toLowerCase())
        const matchesRole =
            roleFilter === 'all' || employee.role.toLowerCase() === roleFilter

        return matchesSearch && matchesRole
    })

    return (
        <div className="p-6 space-y-6">
            <h1 className="text-2xl font-bold">Employees</h1>

            <div className="flex gap-4 items-center">
                <Input
                    placeholder="Search employees..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="max-w-sm"
                />

                <Select value={roleFilter} onValueChange={setRoleFilter}>
                    <SelectTrigger className="w-[180px]">
                        <SelectValue placeholder="Filter by role" />
                    </SelectTrigger>
                    <SelectContent>
                        <SelectItem value="all">All Roles</SelectItem>
                        <SelectItem value="manager">Manager</SelectItem>
                        <SelectItem value="employee">Employee</SelectItem>
                    </SelectContent>
                </Select>

                <Dialog>
                    <DialogTrigger asChild>
                        <Button variant="outline" size="icon">
                            <UserPlus className="h-4 w-4" />
                        </Button>
                    </DialogTrigger>
                    <DialogContent>
                        <DialogHeader>
                            <DialogTitle>Invite User</DialogTitle>
                            <DialogDescription>
                                Enter the email address of the person you want to invite to the inventory.
                            </DialogDescription>
                        </DialogHeader>
                        <form onSubmit={handleInvite} className="space-y-4">
                            <div className="grid grid-cols-4 items-center gap-4">
                                <Label htmlFor="email" className="text-right">Email</Label>
                                <Input
                                    id="email"
                                    type="email"
                                    value={inviteEmail}
                                    onChange={(e) => setInviteEmail(e.target.value)}
                                    placeholder="user@example.com"
                                    className="col-span-3"
                                    required
                                />
                            </div>
                            <div className="flex justify-end">
                                <Button type="submit">Send Invitation</Button>
                            </div>
                        </form>
                    </DialogContent>
                </Dialog>

                <div className="flex gap-2 ml-auto">
                    <Button
                        variant={viewMode === 'list' ? 'default' : 'outline'}
                        size="icon"
                        onClick={() => setViewMode('list')}
                    >
                        <List className="h-4 w-4" />
                    </Button>
                    <Button
                        variant={viewMode === 'grid' ? 'default' : 'outline'}
                        size="icon"
                        onClick={() => setViewMode('grid')}
                    >
                        <LayoutGrid className="h-4 w-4" />
                    </Button>
                </div>
            </div>

            {viewMode === 'list' ? (
                <Table>
                    <TableHeader>
                        <TableRow>
                            <TableHead>Name</TableHead>
                            <TableHead>Role</TableHead>
                            <TableHead>Email</TableHead>
                            <TableHead>Join Date</TableHead>
                            <TableHead>Actions</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {filteredEmployees.map((employee) => (
                            <TableRow key={employee.id}>
                                <TableCell>{employee.name}</TableCell>
                                <TableCell>{employee.role}</TableCell>
                                <TableCell>{employee.email}</TableCell>
                                <TableCell>{employee.joinDate}</TableCell>
                                <TableCell>
                                    <Dialog>
                                        <DialogTrigger asChild>
                                            <Button variant="outline" size="sm" onClick={() => {
                                                setSelectedEmployee(employee)
                                                setEditedPermissions(employee.permissions || {})
                                                setEditedInfo({
                                                    name: employee.name,
                                                    email: employee.email,
                                                    role: employee.role
                                                })
                                            }}>
                                                Edit
                                            </Button>
                                        </DialogTrigger>
                                        <DialogContent className="sm:max-w-[425px]">
                                            <DialogHeader>
                                                <DialogTitle>Edit Employee</DialogTitle>
                                                <DialogDescription>
                                                    Update employee information and permissions
                                                </DialogDescription>
                                            </DialogHeader>
                                            <div className="grid gap-4 py-6">
                                                <Tabs defaultValue="employees" className="space-y-4">
                                                    <TabsList>
                                                        <TabsTrigger value="employees">Empleado</TabsTrigger>
                                                        <TabsTrigger value="rol">Rol</TabsTrigger>
                                                        <TabsTrigger value="permissions">Permisos</TabsTrigger>
                                                    </TabsList>

                                                    <TabsContent value="employees" className="space-y-4">
                                                        <div className="space-y-4">
                                                            <h4 className="font-medium">Información del Empleado</h4>
                                                            <div className="grid grid-cols-4 items-center gap-4">
                                                                <Label htmlFor="name" className="text-right">Nombre</Label>
                                                                <Input
                                                                    id="name"
                                                                    value={editedInfo.name || ''}
                                                                    onChange={(e) => handleInfoChange('name', e.target.value)}
                                                                    className="col-span-3"
                                                                />
                                                            </div>
                                                            <div className="grid grid-cols-4 items-center gap-4">
                                                                <Label htmlFor="email" className="text-right">Email</Label>
                                                                <Input
                                                                    id="email"
                                                                    type="email"
                                                                    value={editedInfo.email || ''}
                                                                    onChange={(e) => handleInfoChange('email', e.target.value)}
                                                                    className="col-span-3"
                                                                />
                                                            </div>
                                                        </div>
                                                    </TabsContent>

                                                    <TabsContent value="rol" className="space-y-4">
                                                        <div className="space-y-4">
                                                            <h4 className="font-medium">Rol del Empleado</h4>
                                                            <div className="grid grid-cols-4 items-center gap-4">
                                                                <Label htmlFor="role" className="text-right">Role</Label>
                                                                <Select
                                                                    value={editedInfo.role}
                                                                    onValueChange={(value) => handleInfoChange('role', value)}
                                                                >
                                                                    <SelectTrigger className="col-span-3">
                                                                        <SelectValue placeholder="Select role" />
                                                                    </SelectTrigger>
                                                                    <SelectContent>
                                                                        <SelectItem value="manager">Manager</SelectItem>
                                                                        <SelectItem value="employee">Employee</SelectItem>
                                                                    </SelectContent>
                                                                </Select>
                                                            </div>
                                                        </div>
                                                    </TabsContent>

                                                    <TabsContent value="permissions" className="space-y-4">
                                                        <div className="space-y-4">
                                                            <h4 className="font-medium">Permisos del Empleado</h4>
                                                            <div className="space-y-2">
                                                                <div className="flex items-center space-x-2">
                                                                    <Checkbox
                                                                        id="inventory"
                                                                        checked={editedPermissions.canManageInventory}
                                                                        onCheckedChange={() => handlePermissionChange('canManageInventory')}
                                                                    />
                                                                    <Label htmlFor="inventory">Manage Inventory</Label>
                                                                </div>
                                                                <div className="flex items-center space-x-2">
                                                                    <Checkbox
                                                                        id="reports"
                                                                        checked={editedPermissions.canViewReports}
                                                                        onCheckedChange={() => handlePermissionChange('canViewReports')}
                                                                    />
                                                                    <Label htmlFor="reports">View Reports</Label>
                                                                </div>
                                                                <div className="flex items-center space-x-2">
                                                                    <Checkbox
                                                                        id="employees"
                                                                        checked={editedPermissions.canManageEmployees}
                                                                        onCheckedChange={() => handlePermissionChange('canManageEmployees')}
                                                                    />
                                                                    <Label htmlFor="employees">Manage Employees</Label>
                                                                </div>
                                                                <div className="flex items-center space-x-2">
                                                                    <Checkbox
                                                                        id="orders"
                                                                        checked={editedPermissions.canProcessOrders}
                                                                        onCheckedChange={() => handlePermissionChange('canProcessOrders')}
                                                                    />
                                                                    <Label htmlFor="orders">Process Orders</Label>
                                                                </div>
                                                                <div className="flex items-center space-x-2">
                                                                    <Checkbox
                                                                        id="settings"
                                                                        checked={editedPermissions.canManageSettings}
                                                                        onCheckedChange={() => handlePermissionChange('canManageSettings')}
                                                                    />
                                                                    <Label htmlFor="settings">Manage Settings</Label>
                                                                </div>
                                                            </div>
                                                        </div>
                                                    </TabsContent>
                                                </Tabs>
                                            </div>
                                            <div className="flex justify-end">
                                                <Button onClick={handleSave}>Save Changes</Button>
                                            </div>
                                        </DialogContent>
                                    </Dialog>
                                </TableCell>
                            </TableRow>
                        ))}
                    </TableBody>
                </Table>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {filteredEmployees.map((employee) => (
                        <div key={employee.id} className="bg-card rounded-lg shadow p-4 space-y-4">
                            <div className="flex justify-between items-start">
                                <div>
                                    <h3 className="font-semibold text-lg">{employee.name}</h3>
                                    <p className="text-muted-foreground">{employee.role}</p>
                                </div>
                                <Dialog>
                                    <DialogTrigger asChild>
                                        <Button variant="outline" size="sm" onClick={() => {
                                            setSelectedEmployee(employee)
                                            setEditedPermissions(employee.permissions || {})
                                            setEditedInfo({
                                                name: employee.name,
                                                email: employee.email,
                                                role: employee.role
                                            })
                                        }}>
                                            Edit
                                        </Button>
                                    </DialogTrigger>
                                    <DialogContent className="sm:max-w-[425px]">
                                        <DialogHeader>
                                            <DialogTitle>Edit Employee</DialogTitle>
                                            <DialogDescription>
                                                Update employee information and permissions
                                            </DialogDescription>
                                        </DialogHeader>
                                        <div className="grid gap-4 py-6">
                                            <Tabs defaultValue="employees" className="space-y-4">
                                                <TabsList>
                                                    <TabsTrigger value="employees">Empleado</TabsTrigger>
                                                    <TabsTrigger value="rol">Rol</TabsTrigger>
                                                    <TabsTrigger value="permissions">Permisos</TabsTrigger>
                                                </TabsList>

                                                <TabsContent value="employees" className="space-y-4">
                                                    <div className="space-y-4">
                                                        <h4 className="font-medium">Información del Empleado</h4>
                                                        <div className="grid grid-cols-4 items-center gap-4">
                                                            <Label htmlFor="name" className="text-right">Nombre</Label>
                                                            <Input
                                                                id="name"
                                                                value={editedInfo.name || ''}
                                                                onChange={(e) => handleInfoChange('name', e.target.value)}
                                                                className="col-span-3"
                                                            />
                                                        </div>
                                                        <div className="grid grid-cols-4 items-center gap-4">
                                                            <Label htmlFor="email" className="text-right">Email</Label>
                                                            <Input
                                                                id="email"
                                                                type="email"
                                                                value={editedInfo.email || ''}
                                                                onChange={(e) => handleInfoChange('email', e.target.value)}
                                                                className="col-span-3"
                                                            />
                                                        </div>
                                                    </div>
                                                </TabsContent>

                                                <TabsContent value="rol" className="space-y-4">
                                                    <div className="space-y-4">
                                                        <h4 className="font-medium">Rol del Empleado</h4>
                                                        <div className="grid grid-cols-4 items-center gap-4">
                                                            <Label htmlFor="role" className="text-right">Role</Label>
                                                            <Select
                                                                value={editedInfo.role}
                                                                onValueChange={(value) => handleInfoChange('role', value)}
                                                            >
                                                                <SelectTrigger className="col-span-3">
                                                                    <SelectValue placeholder="Select role" />
                                                                </SelectTrigger>
                                                                <SelectContent>
                                                                    <SelectItem value="manager">Manager</SelectItem>
                                                                    <SelectItem value="employee">Employee</SelectItem>
                                                                </SelectContent>
                                                            </Select>
                                                        </div>
                                                    </div>
                                                </TabsContent>

                                                <TabsContent value="permissions" className="space-y-4">
                                                    <div className="space-y-4">
                                                        <h4 className="font-medium">Permisos del Empleado</h4>
                                                        <div className="space-y-2">
                                                            <div className="flex items-center space-x-2">
                                                                <Checkbox
                                                                    id="inventory"
                                                                    checked={editedPermissions.canManageInventory}
                                                                    onCheckedChange={() => handlePermissionChange('canManageInventory')}
                                                                />
                                                                <Label htmlFor="inventory">Manage Inventory</Label>
                                                            </div>
                                                            <div className="flex items-center space-x-2">
                                                                <Checkbox
                                                                    id="reports"
                                                                    checked={editedPermissions.canViewReports}
                                                                    onCheckedChange={() => handlePermissionChange('canViewReports')}
                                                                />
                                                                <Label htmlFor="reports">View Reports</Label>
                                                            </div>
                                                            <div className="flex items-center space-x-2">
                                                                <Checkbox
                                                                    id="employees"
                                                                    checked={editedPermissions.canManageEmployees}
                                                                    onCheckedChange={() => handlePermissionChange('canManageEmployees')}
                                                                />
                                                                <Label htmlFor="employees">Manage Employees</Label>
                                                            </div>
                                                            <div className="flex items-center space-x-2">
                                                                <Checkbox
                                                                    id="orders"
                                                                    checked={editedPermissions.canProcessOrders}
                                                                    onCheckedChange={() => handlePermissionChange('canProcessOrders')}
                                                                />
                                                                <Label htmlFor="orders">Process Orders</Label>
                                                            </div>
                                                            <div className="flex items-center space-x-2">
                                                                <Checkbox
                                                                    id="settings"
                                                                    checked={editedPermissions.canManageSettings}
                                                                    onCheckedChange={() => handlePermissionChange('canManageSettings')}
                                                                />
                                                                <Label htmlFor="settings">Manage Settings</Label>
                                                            </div>
                                                        </div>
                                                    </div>
                                                </TabsContent>
                                            </Tabs>
                                        </div>
                                        <div className="flex justify-end">
                                            <Button onClick={handleSave}>Save Changes</Button>
                                        </div>
                                    </DialogContent>
                                </Dialog>
                            </div>
                            <div className="space-y-2">
                                <p className="text-sm"><span className="font-medium">Email:</span> {employee.email}</p>
                                <p className="text-sm"><span className="font-medium">Join Date:</span> {employee.joinDate}</p>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    )
}


const handleInvite = async (e: React.FormEvent) => {
    e.preventDefault()
    try {
        // Here you would implement the API call to send invitation
        await new Promise(resolve => setTimeout(resolve, 1000)) // Simulating API call
        toast.success('Invitación enviada')
        setInviteEmail('')
    } catch (error) {
        console.error('Error sending invitation:', error)
        toast.error('Error al enviar la invitación')
    }
}
