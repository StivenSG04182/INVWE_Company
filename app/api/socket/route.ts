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
        const channel = supabase
            .channel('notifications-changes')
            .on(
                'postgres_changes',
                {
                    event: 'INSERT',
                    schema: 'public',
                    table: 'notifications',
                },
                (payload) => {
                    // Emitir evento de nueva notificación a todos los clientes conectados
                    io.emit('new-notification', payload.new);
                }
            )
            .subscribe();
    }

    return NextResponse.json({ success: true }, { status: 200 });
}