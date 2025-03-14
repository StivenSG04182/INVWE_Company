import { clerkMiddleware, createRouteMatcher } from '@clerk/nextjs/server';
import { NextResponse } from 'next/server';

// Definimos las rutas públicas (páginas de prelogin)
const isPublicRoute = createRouteMatcher([
    "/",
    "/enterprise",
    "/nots",
    "/about",
    "/blog",
    "/contact",
    "/faq",
    "/features",
    "/pricing",
    "/privacy",
    "/service",
    "/terms",
    "/sign-in(.*)",
    "/sign-up(.*)"
]);

export default clerkMiddleware(async (auth, request) => {
    console.log("[Middleware] Request URL:", request.url);

    // Si la petición es para una ruta API, no hacemos nada (se deja pasar)
    if (request.nextUrl.pathname.startsWith('/api')) {
        return NextResponse.next();
    }

    // Si el usuario no está autenticado y se accede a una ruta pública, se permite el acceso.
    if (!auth.userId) {
        if (isPublicRoute(request)) {
            console.log("[Middleware] Ruta pública sin autenticación, permitiendo acceso");
            return NextResponse.next();
        }
        // Para rutas privadas, podemos protegerlas (esto se adapta a tu lógica)
        await auth.protect();
        return NextResponse.next();
    }

    // Para rutas protegidas (no aplicamos redirecciones para /select_inventory, ya que la lógica se hará en el cliente)
    return NextResponse.next();
});

export const config = {
    matcher: [
        // Se aplicará a todas las páginas que no sean archivos estáticos
        '/((?!_next|trpc|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)'
    ],
};
