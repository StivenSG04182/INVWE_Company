'use client';

import { useEffect, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import Image from 'next/image';
import { Loader2 } from 'lucide-react';

export default function MercadoPagoAuthMockPage() {
    const router = useRouter();
    const searchParams = useSearchParams();
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState('');

    // Obtener los parámetros de la URL
    const redirectUri = searchParams.get('redirect_uri');
    const state = searchParams.get('state'); // agencyId
    const scope = searchParams.get('scope');

    // Verificar que tenemos los parámetros necesarios
    useEffect(() => {
        if (!redirectUri) {
            setError('Error: Falta el parámetro redirect_uri');
        }
    }, [redirectUri]);

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        setIsLoading(true);
        setError('');

        // Simulamos un proceso de autenticación
        setTimeout(() => {
            // Generamos un código de autorización simulado
            const mockAuthCode = `mock_mp_${Date.now()}_${Math.random().toString(36).substring(2, 15)}`;

            // Construimos la URL de redirección con el código
            let finalRedirectUrl = '';

            try {
                // Decodificar la URL de redirección
                const decodedRedirectUri = decodeURIComponent(redirectUri || '');

                // Añadir el código como parámetro de consulta
                const separator = decodedRedirectUri.includes('?') ? '&' : '?';
                finalRedirectUrl = `${decodedRedirectUri}${separator}code=${mockAuthCode}`;

                // Añadir el estado si existe
                if (state) {
                    finalRedirectUrl += `&state=${state}`;
                }

                // Redirigir al usuario
                window.location.href = finalRedirectUrl;
            } catch (error) {
                console.error('Error al construir la URL de redirección:', error);
                setError('Error al procesar la redirección');
                setIsLoading(false);
            }
        }, 2000); // Simulamos un retraso de 2 segundos
    };

    return (
        <div className="flex items-center justify-center min-h-screen bg-blue-50">
            <Card className="w-full max-w-md">
                <CardHeader className="space-y-1">
                    <div className="flex justify-center mb-4">
                        <div className="w-[150px] h-[60px] bg-[#009ee3] flex items-center justify-center text-white font-bold rounded">
                            MercadoPago
                        </div>
                    </div>
                    <CardTitle className="text-2xl text-center">Iniciar sesión en MercadoPago</CardTitle>
                    <CardDescription className="text-center">
                        Esta es una página de simulación para desarrollo. Ingresa cualquier credencial para continuar.
                    </CardDescription>
                    {error && (
                        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative" role="alert">
                            <span className="block sm:inline">{error}</span>
                        </div>
                    )}
                </CardHeader>
                <CardContent>
                    <form onSubmit={handleSubmit}>
                        <div className="space-y-4">
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
                        </div>
                    </form>
                </CardContent>
                <CardFooter>
                    <Button
                        className="w-full bg-blue-500 hover:bg-blue-600"
                        onClick={handleSubmit}
                        disabled={isLoading}
                    >
                        {isLoading ? (
                            <>
                                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                Procesando...
                            </>
                        ) : (
                            'Iniciar sesión'
                        )}
                    </Button>
                </CardFooter>
            </Card>
        </div>
    );
}