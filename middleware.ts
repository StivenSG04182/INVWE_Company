import { clerkMiddleware, createRouteMatcher } from '@clerk/nextjs/server';
import { NextResponse } from 'next/server';

const isPublicRoute = createRouteMatcher([
    "/",
    "/enterprise",
    "/nots",
    "/about",
    "/notes",
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

    // Petición es para una ruta API
    if (request.nextUrl.pathname.startsWith('/api/control_login')) {
        return NextResponse.next();
    }

    if (!auth.userId) {
        if (isPublicRoute(request)) {
            console.log("[Middleware] Ruta pública sin autenticación, permitiendo acceso");
            return NextResponse.next();
        }
        // Para rutas privadas, podemos protegerlas
        await auth.protect();
        return NextResponse.next();
    }

    // Para rutas protegidas
    return NextResponse.next();
});

export const config = {
    matcher: [
        // Se aplicará a todas las páginas que no sean archivos estáticos
        '/((?!_next|trpc|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)'
    ],
};
