'use client';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useToast } from '@/components/ui/use-toast';
import Image from 'next/image';
import { useRouter, useSearchParams } from 'next/navigation';
import { useState } from 'react';

export default function PayPalAuthMockPage() {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const router = useRouter();
    const searchParams = useSearchParams();
    const { toast } = useToast();

    // Extraer parámetros de la URL original de PayPal
    const redirectUri = searchParams.get('redirect_uri') || '';
    const state = searchParams.get('state') || ''; // Este es el agencyId
    const gatewayId = 'paypal'; // Fijo para esta simulación

    const handleLogin = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!email || !password) {
            toast({
                title: 'Error',
                description: 'Por favor ingrese su correo y contraseña',
                variant: 'destructive',
            });
            return;
        }

        setIsLoading(true);

        try {
            // Simular proceso de autenticación
            await new Promise(resolve => setTimeout(resolve, 1500));

            // Generar un código de autorización aleatorio
            const mockAuthCode = `AUTH_${Math.random().toString(36).substring(2, 15)}`;

            // Simular llamada a nuestra API mock para registrar la conexión
            const response = await fetch(`/api/payment-gateways/${gatewayId}/auth-mock`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    agencyId: state,
                    code: mockAuthCode,
                }),
            });

            const data = await response.json();

            if (data.success) {
                toast({
                    title: 'Conexión exitosa',
                    description: 'La cuenta de PayPal ha sido conectada correctamente',
                });

                // Redirigir de vuelta a la aplicación con el código de autorización
                // Esto simulará el flujo de OAuth donde el proveedor redirige de vuelta con un código
                const finalRedirectUrl = `${redirectUri}?code=${mockAuthCode}`;
                window.location.href = finalRedirectUrl;
            } else {
                throw new Error(data.error || 'Error al conectar la cuenta');
            }
        } catch (error) {
            console.error('Error en el proceso de autenticación:', error);
            toast({
                title: 'Error de conexión',
                description: 'No se pudo conectar la cuenta de PayPal',
                variant: 'destructive',
            });
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="flex items-center justify-center min-h-screen bg-gray-100">
            <Card className="w-full max-w-md">
                <CardHeader className="space-y-1 flex flex-col items-center">
                    <div className="w-48 h-16 relative mb-4">
                        <Image
                            src="/payment-gateways/paypal-logo.png"
                            alt="PayPal Logo"
                            fill
                            style={{ objectFit: 'contain' }}
                            onError={(e) => {
                                // Fallback si no existe el logo
                                e.currentTarget.src = 'https://www.paypalobjects.com/webstatic/mktg/logo/pp_cc_mark_111x69.jpg';
                            }}
                        />
                    </div>
                    <CardTitle className="text-2xl">Iniciar sesión</CardTitle>
                    <CardDescription>
                        Ingrese sus credenciales de PayPal para conectar su cuenta
                    </CardDescription>
                    <div className="bg-blue-100 text-blue-800 p-2 rounded-md text-sm mt-2 w-full">
                        <p className="font-semibold">Modo de prueba</p>
                        <p>Esta es una simulación para desarrollo. Ingrese cualquier correo y contraseña.</p>
                    </div>
                </CardHeader>
                <form onSubmit={handleLogin}>
                    <CardContent className="space-y-4">
                        <div className="space-y-2">
                            <Label htmlFor="email">Correo electrónico</Label>
                            <Input
                                id="email"
                                type="email"
                                placeholder="correo@ejemplo.com"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                required
                            />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="password">Contraseña</Label>
                            <Input
                                id="password"
                                type="password"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                required
                            />
                        </div>
                    </CardContent>
                    <CardFooter>
                        <Button
                            type="submit"
                            className="w-full bg-[#0070ba] hover:bg-[#003087]"
                            disabled={isLoading}
                        >
                            {isLoading ? 'Conectando...' : 'Iniciar sesión'}
                        </Button>
                    </CardFooter>
                </form>
            </Card>
        </div>
    );
}