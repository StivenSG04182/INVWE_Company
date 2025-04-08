import { NextResponse } from 'next/server';
import { Server as SocketIOServer } from 'socket.io';
import type { Server as HTTPServer } from 'http';
import type { Socket as NetSocket } from 'net';
import type { NextApiRequest, NextApiResponse } from 'next';
import { createClient } from '@supabase/supabase-js';

// Inicializar cliente de Supabase
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;
const supabase = createClient(supabaseUrl, supabaseKey);

interface SocketServer extends HTTPServer {
    io?: SocketIOServer | undefined;
}

interface SocketWithIO extends NetSocket {
    server: SocketServer;
}

interface NextApiResponseWithSocket extends NextApiResponse {
    socket: SocketWithIO;
}

// Almacenar la instancia de Socket.IO
let io: SocketIOServer;

export async function GET(req: Request, res: NextApiResponseWithSocket) {
    if (res.socket.server.io) {
        // Si ya existe una instancia de Socket.IO, la reutilizamos
        io = res.socket.server.io;
    } else {
        // Crear una nueva instancia de Socket.IO
        io = new SocketIOServer(res.socket.server);
        res.socket.server.io = io;

        // Configurar eventos de Socket.IO
        io.on('connection', (socket) => {
            console.log('Cliente conectado:', socket.id);

            // Escuchar desconexiones
            socket.on('disconnect', () => {
                console.log('Cliente desconectado:', socket.id);
            });
        });

        // Configurar escucha de cambios en Supabase para notificaciones
        const notifications = supabase
            .channel('notifications-changes')
            .on(
                'postgres_changes',
                {
                    event: 'INSERT',
                    schema: 'public',
                    table: 'notifications',
                },
                (payload) => {
                    io.emit('new-notification', payload.new);
                }
            )
            .on(
                'postgres_changes',
                {
                    event: 'UPDATE',
                    schema: 'public',
                    table: 'notifications',
                },
                (payload) => {
                    io.emit('update-notification', payload.new);
                }
            )
            .on(
                'postgres_changes',
                {
                    event: 'DELETE',
                    schema: 'public',
                    table: 'notifications',
                },
                (payload) => {
                    io.emit('delete-notification', payload.old);
                }
            )
            .subscribe();

        // Configurar escucha de cambios en Supabase para functionalities
        const functionalities = supabase
            .channel('functionalities-changes')
            .on(
                'postgres_changes',
                {
                    event: 'INSERT',
                    schema: 'public',
                    table: 'functionalities',
                },
                (payload) => {
                    io.emit('new-functionality', payload.new);
                }
            )
            .on(
                'postgres_changes',
                {
                    event: 'UPDATE',
                    schema: 'public',
                    table: 'functionalities',
                },
                (payload) => {
                    io.emit('update-functionality', payload.new);
                }
            )
            .on(
                'postgres_changes',
                {
                    event: 'DELETE',
                    schema: 'public',
                    table: 'functionalities',
                },
                (payload) => {
                    io.emit('delete-functionality', payload.old);
                }
            )
            .subscribe();
            
        // Configurar escucha de cambios en Supabase para users_companies
        const usersCompanies = supabase
            .channel('users-companies-changes')
            .on(
                'postgres_changes',
                {
                    event: 'INSERT',
                    schema: 'public',
                    table: 'users_companies',
                },
                (payload) => {
                    io.emit('new-user-company', payload.new);
                }
            )
            .on(
                'postgres_changes',
                {
                    event: 'UPDATE',
                    schema: 'public',
                    table: 'users_companies',
                },
                (payload) => {
                    io.emit('update-user-company', payload.new);
                }
            )
            .on(
                'postgres_changes',
                {
                    event: 'DELETE',
                    schema: 'public',
                    table: 'users_companies',
                },
                (payload) => {
                    io.emit('delete-user-company', payload.old);
                }
            )
            .subscribe();
            
        // Configurar escucha de cambios en Supabase para products
        const products = supabase
            .channel('products-changes')
            .on(
                'postgres_changes',
                {
                    event: 'INSERT',
                    schema: 'public',
                    table: 'products',
                },
                (payload) => {
                    io.emit('new-product', payload.new);
                }
            )
            .on(
                'postgres_changes',
                {
                    event: 'UPDATE',
                    schema: 'public',
                    table: 'products',
                },
                (payload) => {
                    io.emit('update-product', payload.new);
                }
            )
            .on(
                'postgres_changes',
                {
                    event: 'DELETE',
                    schema: 'public',
                    table: 'products',
                },
                (payload) => {
                    io.emit('delete-product', payload.old);
                }
            )
            .subscribe();
            
        // Configurar escucha de cambios en Supabase para invoices
        const invoices = supabase
            .channel('invoices-changes')
            .on(
                'postgres_changes',
                {
                    event: 'INSERT',
                    schema: 'public',
                    table: 'invoices',
                },
                (payload) => {
                    io.emit('new-invoice', payload.new);
                }
            )
            .on(
                'postgres_changes',
                {
                    event: 'UPDATE',
                    schema: 'public',
                    table: 'invoices',
                },
                (payload) => {
                    io.emit('update-invoice', payload.new);
                }
            )
            .on(
                'postgres_changes',
                {
                    event: 'DELETE',
                    schema: 'public',
                    table: 'invoices',
                },
                (payload) => {
                    io.emit('delete-invoice', payload.old);
                }
            )
            .subscribe();
            
        // Configurar escucha de cambios en Supabase para payments
        const payments = supabase
            .channel('payments-changes')
            .on(
                'postgres_changes',
                {
                    event: 'INSERT',
                    schema: 'public',
                    table: 'payments',
                },
                (payload) => {
                    io.emit('new-payment', payload.new);
                }
            )
            .on(
                'postgres_changes',
                {
                    event: 'UPDATE',
                    schema: 'public',
                    table: 'payments',
                },
                (payload) => {
                    io.emit('update-payment', payload.new);
                }
            )
            .on(
                'postgres_changes',
                {
                    event: 'DELETE',
                    schema: 'public',
                    table: 'payments',
                },
                (payload) => {
                    io.emit('delete-payment', payload.old);
                }
            )
            .subscribe();
            
        // Configurar escucha de cambios en Supabase para clients
        const clients = supabase
            .channel('clients-changes')
            .on(
                'postgres_changes',
                {
                    event: 'INSERT',
                    schema: 'public',
                    table: 'clients',
                },
                (payload) => {
                    io.emit('new-client', payload.new);
                }
            )
            .on(
                'postgres_changes',
                {
                    event: 'UPDATE',
                    schema: 'public',
                    table: 'clients',
                },
                (payload) => {
                    io.emit('update-client', payload.new);
                }
            )
            .on(
                'postgres_changes',
                {
                    event: 'DELETE',
                    schema: 'public',
                    table: 'clients',
                },
                (payload) => {
                    io.emit('delete-client', payload.old);
                }
            )
            .subscribe();
            
        // Configurar escucha de cambios en Supabase para companies
        const companies = supabase
            .channel('companies-changes')
            .on(
                'postgres_changes',
                {
                    event: 'INSERT',
                    schema: 'public',
                    table: 'companies',
                },
                (payload) => {
                    io.emit('new-company', payload.new);
                }
            )
            .on(
                'postgres_changes',
                {
                    event: 'UPDATE',
                    schema: 'public',
                    table: 'companies',
                },
                (payload) => {
                    io.emit('update-company', payload.new);
                }
            )
            .on(
                'postgres_changes',
                {
                    event: 'DELETE',
                    schema: 'public',
                    table: 'companies',
                },
                (payload) => {
                    io.emit('delete-company', payload.old);
                }
            )
            .subscribe();
            
        // Configurar escucha de cambios en Supabase para faq
        const faq = supabase
            .channel('faq-changes')
            .on(
                'postgres_changes',
                {
                    event: 'INSERT',
                    schema: 'public',
                    table: 'faq',
                },
                (payload) => {
                    io.emit('new-faq', payload.new);
                }
            )
            .on(
                'postgres_changes',
                {
                    event: 'UPDATE',
                    schema: 'public',
                    table: 'faq',
                },
                (payload) => {
                    io.emit('update-faq', payload.new);
                }
            )
            .on(
                'postgres_changes',
                {
                    event: 'DELETE',
                    schema: 'public',
                    table: 'faq',
                },
                (payload) => {
                    io.emit('delete-faq', payload.old);
                }
            )
            .subscribe();
            
        // Configurar escucha de cambios en Supabase para ecommerce_stores
        const ecommerceStores = supabase
            .channel('ecommerce-stores-changes')
            .on(
                'postgres_changes',
                {
                    event: 'INSERT',
                    schema: 'public',
                    table: 'ecommerce_stores',
                },
                (payload) => {
                    io.emit('new-ecommerce-store', payload.new);
                }
            )
            .on(
                'postgres_changes',
                {
                    event: 'UPDATE',
                    schema: 'public',
                    table: 'ecommerce_stores',
                },
                (payload) => {
                    io.emit('update-ecommerce-store', payload.new);
                }
            )
            .on(
                'postgres_changes',
                {
                    event: 'DELETE',
                    schema: 'public',
                    table: 'ecommerce_stores',
                },
                (payload) => {
                    io.emit('delete-ecommerce-store', payload.old);
                }
            )
            .subscribe();
            
        // Configurar escucha de cambios en Supabase para ecommerce_orders
        const ecommerceOrders = supabase
            .channel('ecommerce-orders-changes')
            .on(
                'postgres_changes',
                {
                    event: 'INSERT',
                    schema: 'public',
                    table: 'ecommerce_orders',
                },
                (payload) => {
                    io.emit('new-ecommerce-order', payload.new);
                }
            )
            .on(
                'postgres_changes',
                {
                    event: 'UPDATE',
                    schema: 'public',
                    table: 'ecommerce_orders',
                },
                (payload) => {
                    io.emit('update-ecommerce-order', payload.new);
                }
            )
            .on(
                'postgres_changes',
                {
                    event: 'DELETE',
                    schema: 'public',
                    table: 'ecommerce_orders',
                },
                (payload) => {
                    io.emit('delete-ecommerce-order', payload.old);
                }
            )
            .subscribe();
            
        // Configurar escucha de cambios en Supabase para reports
        const reports = supabase
            .channel('reports-changes')
            .on(
                'postgres_changes',
                {
                    event: 'INSERT',
                    schema: 'public',
                    table: 'reports',
                },
                (payload) => {
                    io.emit('new-report', payload.new);
                }
            )
            .on(
                'postgres_changes',
                {
                    event: 'UPDATE',
                    schema: 'public',
                    table: 'reports',
                },
                (payload) => {
                    io.emit('update-report', payload.new);
                }
            )
            .on(
                'postgres_changes',
                {
                    event: 'DELETE',
                    schema: 'public',
                    table: 'reports',
                },
                (payload) => {
                    io.emit('delete-report', payload.old);
                }
            )
            .subscribe(); 
    }

    return NextResponse.json({ success: true }, { status: 200 });
}