import { v4 as uuidv4 } from 'uuid';

export interface Functionality {
    id: string;
    nombre: string;
    descripcion: string;
}

export const functionalities: Functionality[] = [
    {
        id: uuidv4(),
        nombre: 'Integración con pasarelas de pago',
        descripcion: 'Implementar integración con múltiples pasarelas de pago para facilitar las transacciones en línea.'
    },
    {
        id: uuidv4(),
        nombre: 'Sistema de notificaciones en tiempo real',
        descripcion: 'Desarrollar un sistema de notificaciones push para alertar sobre cambios en el inventario y ventas.'
    },
    {
        id: uuidv4(),
        nombre: 'Módulo de reportes avanzados',
        descripcion: 'Crear un módulo de reportes personalizables con gráficos interactivos y exportación a múltiples formatos.'
    },
    {
        id: uuidv4(),
        nombre: 'Aplicación móvil para gestión',
        descripcion: 'Desarrollar una aplicación móvil que permita gestionar el inventario y las ventas desde dispositivos móviles.'
    },
    {
        id: uuidv4(),
        nombre: 'Integración con sistemas contables',
        descripcion: 'Implementar integración con software contable para automatizar la sincronización de datos financieros.'
    }
];