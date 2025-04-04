import { NextResponse } from 'next/server';
import { Server as SocketIOServer } from 'socket.io';
import type { NextApiRequest } from 'next';
import { createClient } from '@supabase/supabase-js';

// Inicializar cliente de Supabase
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;
const supabase = createClient(supabaseUrl, supabaseKey);

// Variable para almacenar la instancia de Socket.IO
let io: SocketIOServer;

export async function GET(req: Request, res: any) {
  if (!res.socket.server.io) {
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