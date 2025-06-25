'use client'

import React, { useEffect, useState } from 'react'
// import { getSubAccountSidebarOptions, getUserSidebarPermissions, changeSidebarOptionPermission, saveActivityLogsNotification } from '@/lib/queries'
import { SubAccountSidebarOption } from '@prisma/client'
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion'
import { Checkbox } from '@/components/ui/checkbox'
import { useToast } from '@/components/ui/use-toast'

// Funciones temporales mientras se implementan las reales
const getSubAccountSidebarOptions = async (subAccountId: string) => {
  console.log('Función getSubAccountSidebarOptions pendiente de implementación')
  return []
}

const getUserSidebarPermissions = async (permissionId: string) => {
  console.log('Función getUserSidebarPermissions pendiente de implementación')
  return []
}

const changeSidebarOptionPermission = async (permissionId: string, sidebarOptionId: string, checked: boolean) => {
  console.log('Función changeSidebarOptionPermission pendiente de implementación')
  return { success: true }
}

const saveActivityLogsNotification = async (data: any) => {
  console.log('Función saveActivityLogsNotification pendiente de implementación')
  return { success: true }
}

type Props = {
    subAccountId: string
    permissionId: string
}

type SidebarPermission = {
    id: string
    permissionId: string
    sidebarOptionId: string
    access: boolean
}

const SidebarOptionsPermissions = ({ subAccountId, permissionId }: Props) => {
    const [sidebarOptions, setSidebarOptions] = useState<SubAccountSidebarOption[]>([])
    const [sidebarPermissions, setSidebarPermissions] = useState<SidebarPermission[]>([])
    const [loading, setLoading] = useState(true)
    const { toast } = useToast()

    // Función auxiliar para determinar a qué categoría pertenece una opción
    const getCategoryForOption = (optionName: string): string | null => {
        // Mapeo de opciones a sus categorías principales
        const categoryMap: Record<string, string> = {
            // Dashboard & Visión general
            'Dashboard': 'Dashboard & Visión general',
            'Análisis': 'Dashboard & Visión general',
            'Actividad': 'Dashboard & Visión general',
            'Visión general': 'Dashboard & Visión general',
            'Integraciones': 'Dashboard & Visión general',

            // Gestión de Inventario
            'Productos': 'Gestión de Inventario',
            'Stock': 'Gestión de Inventario',
            'Movimientos': 'Gestión de Inventario',
            'Proveedores': 'Gestión de Inventario',
            'Áreas de Inventario': 'Gestión de Inventario',

            // Tienda & E-Commerce
            'Tiendas': 'Tienda & E-Commerce',
            'E-Commerce': 'Tienda & E-Commerce',
            'Envíos': 'Tienda & E-Commerce',

            // Ventas & Facturación
            'Transacciones': 'Ventas & Facturación',
            'Facturas': 'Ventas & Facturación',
            'Notas Crédito/Débito': 'Ventas & Facturación',
            'Configuración DIAN': 'Ventas & Facturación',
            'Reportes': 'Ventas & Facturación',
            'Pagos': 'Ventas & Facturación',
            'Billing': 'Ventas & Facturación',

            // Clientes & CRM
            'Clientes': 'Clientes & CRM',
            'CRM': 'Clientes & CRM',
            'All Sub-Accounts': 'Clientes & CRM',

            // Personal & RRHH
            'Empleados': 'Personal & RRHH',
            'Horarios & Nómina': 'Personal & RRHH',
            'Contactos': 'Personal & RRHH',
            'Pipelines': 'Personal & RRHH',

            // Comunicaciones
            'Campañas': 'Comunicaciones',
            'Bandeja de entrada': 'Comunicaciones',
            'Medios': 'Comunicaciones',
            'Chat': 'Comunicaciones',

            // Reportes & Analíticas
            'Ventas': 'Reportes & Analíticas',
            'Inventario': 'Reportes & Analíticas',
            'Desempeño': 'Reportes & Analíticas',
            'Finanzas': 'Reportes & Analíticas',
            'Reportes Productos': 'Reportes & Analíticas',

            // Configuración & Administración
            'Ajustes de Empresa': 'Configuración & Administración',
            'Usuarios & Permisos': 'Configuración & Administración',
            'Facturación': 'Configuración & Administración',
            'Configuración Inicial': 'Configuración & Administración',
            'General Settings': 'Configuración & Administración',
        };

        return categoryMap[optionName] || null;
    };

    // Función para organizar las opciones en una estructura jerárquica
    const organizeSidebarOptions = () => {
        // Definimos el orden específico de las categorías
        const categoryOrder: Record<string, number> = {
            'Dashboard & Visión general': 1,
            'Gestión de Inventario': 2,
            'Tienda & E-Commerce': 3,
            'Ventas & Facturación': 4,
            'Personal & RRHH': 5,
            'Clientes & CRM': 6,
            'Comunicaciones': 7,
            'Reportes & Analíticas': 8,
            'Configuración & Administración': 9,
        };

        // Identificamos las categorías principales y las subopciones
        const mainCategories: Record<string, any> = {};
        const subOptions: SubAccountSidebarOption[] = [];

        // Inicializamos las categorías principales
        Object.keys(categoryOrder).forEach(category => {
            mainCategories[category] = {
                name: category,
                options: [],
                order: categoryOrder[category]
            };
        });

        // Añadimos la categoría "Otros" al final
        mainCategories['Otros'] = {
            name: 'Otros',
            options: [],
            order: 999
        };

        // Separamos las opciones en categorías principales y subopciones
        sidebarOptions.forEach(option => {
            if (option.link === '#') {
                // Es una categoría principal, pero la ignoramos porque ya tenemos nuestras categorías predefinidas
            } else {
                // Es una subopción
                subOptions.push(option);
            }
        });

        // Asignamos las subopciones a sus categorías correspondientes
        subOptions.forEach(option => {
            const categoryName = getCategoryForOption(option.name);
            
            if (categoryName && mainCategories[categoryName]) {
                mainCategories[categoryName].options.push(option);
            } else {
                // Si no tiene categoría asociada, la ponemos en "Otros"
                mainCategories['Otros'].options.push(option);
            }
        });

        // Convertimos el objeto de categorías a un array y ordenamos por el campo order
        const sortedCategories = Object.values(mainCategories)
            .filter(category => category.options.length > 0) // Solo incluimos categorías con opciones
            .sort((a, b) => a.order - b.order);

        // Creamos el objeto final con el formato esperado por el componente
        const result: Record<string, SubAccountSidebarOption[]> = {};
        sortedCategories.forEach(category => {
            result[category.name] = category.options;
        });

        return result;
    };

    // Obtenemos las opciones organizadas
    const groupedOptions = organizeSidebarOptions();

    useEffect(() => {
        const fetchData = async () => {
            try {
                setLoading(true)
                const options = await getSubAccountSidebarOptions(subAccountId)
                const permissions = await getUserSidebarPermissions(permissionId)

                setSidebarOptions(options)
                setSidebarPermissions(permissions)
            } catch (error) {
                console.error('Error al cargar opciones del sidebar:', error)
                toast({
                    variant: 'destructive',
                    title: 'Error',
                    description: 'No se pudieron cargar las opciones del sidebar',
                })
            } finally {
                setLoading(false)
            }
        }

        fetchData()
    }, [subAccountId, permissionId, toast])

    const handlePermissionChange = async (sidebarOptionId: string, checked: boolean) => {
        try {
            const response = await changeSidebarOptionPermission(
                permissionId,
                sidebarOptionId,
                checked
            )

            if (response) {
                // Actualizar el estado local
                setSidebarPermissions(prev => {
                    const exists = prev.find(p => p.sidebarOptionId === sidebarOptionId)

                    if (exists) {
                        return prev.map(p =>
                            p.sidebarOptionId === sidebarOptionId ? { ...p, access: checked } : p
                        )
                    } else {
                        return [...prev, {
                            id: response.id,
                            permissionId,
                            sidebarOptionId,
                            access: checked
                        }]
                    }
                })

                await saveActivityLogsNotification({
                    description: `Permisos de opciones del sidebar actualizados`,
                    subaccountId: subAccountId,
                })

                toast({
                    title: 'Éxito',
                    description: 'Permisos actualizados correctamente',
                })
            }
        } catch (error) {
            console.error('Error al cambiar permisos:', error)
            toast({
                variant: 'destructive',
                title: 'Error',
                description: 'No se pudieron actualizar los permisos',
            })
        }
    }

    const isOptionChecked = (optionId: string) => {
        const permission = sidebarPermissions.find(p => p.sidebarOptionId === optionId)
        return permission?.access || false
    }

    if (loading) {
        return <div className="text-sm text-muted-foreground">Cargando opciones...</div>
    }

    return (
        <div className="mt-2 space-y-4">
            <h4 className="text-sm font-medium">Opciones del Menú Lateral</h4>
            <p className="text-xs text-muted-foreground mb-2">
                Seleccione las opciones del menú lateral a las que este usuario tendrá acceso cuando ingrese a esta tienda
            </p>

            <Accordion type="multiple" className="w-full">
                {Object.entries(groupedOptions).map(([category, options]) => (
                    <AccordionItem key={category} value={category}>
                        <AccordionTrigger className="text-sm">{category}</AccordionTrigger>
                        <AccordionContent>
                            <div className="space-y-2 ml-2">
                                {options.map(option => (
                                    <div key={option.id} className="flex items-center space-x-2">
                                        <Checkbox
                                            id={option.id}
                                            checked={isOptionChecked(option.id)}
                                            onCheckedChange={(checked) => {
                                                handlePermissionChange(option.id, checked as boolean)
                                            }}
                                        />
                                        <label
                                            htmlFor={option.id}
                                            className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                                        >
                                            {option.name}
                                        </label>
                                    </div>
                                ))}
                            </div>
                        </AccordionContent>
                    </AccordionItem>
                ))}
            </Accordion>
        </div>
    )
}

export default SidebarOptionsPermissions