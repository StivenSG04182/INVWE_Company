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
    if (request.nextUrl.pathname.startsWith('/api')) {
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

    // Validar acceso al inventario solicitado
    const pathSegments = request.nextUrl.pathname.split('/');
    
    // Validar formato de companyId en rutas API
    const companyIdIndex = pathSegments.findIndex(segment => segment === 'companyId');
    if (companyIdIndex !== -1 && pathSegments.length > companyIdIndex + 1) {
        const companyId = pathSegments[companyIdIndex + 1];
        if (!/^[0-9a-fA-F]{24}$/.test(companyId)) {
            console.log(`[Middleware] Formato inválido de companyId: ${companyId}`);
            return NextResponse.json(
                { error: 'Formato de ID de empresa inválido' },
                { status: 400 }
            );
        }

        // Verificar ownership del inventario
        const { sessionClaims } = auth();
        const userCompanies = await (await import('./lib/mongodb')).db(process.env.MONGODB_DB)
            .collection('users_companies')
            .findOne({
                userId: auth.userId,
                companyId: companyId,
                status: 'approved'
            });

        // Obtener nombre real de la empresa desde MongoDB
        const companyData = await (await import('./lib/mongodb')).db(process.env.MONGODB_DB)
            .collection('companies')
            .findOne({ _id: new (await import('mongodb')).ObjectId(companyId) });

        // Obtener organizaciones autorizadas del usuario desde Clerk
        const userOrgs = sessionClaims.publicMetadata?.organizations || [];

        // Normalizar nombres para comparación
        const normalizeName = (name: string) => 
            name.toLowerCase().trim().replace(/[\s%20]/g, '-');

        const urlCompanyName = pathSegments[pathSegments.indexOf('inventory') + 1];
        const realCompanyName = companyData?.name || companyData?.values?.nombreEmpresa;

        if (!realCompanyName || 
            normalizeName(decodeURIComponent(urlCompanyName)) !== normalizeName(realCompanyName) ||
            !userOrgs.some((org: string) => normalizeName(org) === normalizeName(realCompanyName))
        ) {
            console.log('[Middleware] Redireccionando a 404 por nombre de empresa inválido');
            return NextResponse.redirect(new URL('/not-found', request.url));
        }

        if (!userCompanies) {
            console.log('[Middleware] Usuario no tiene acceso al inventario:', companyId);
            return NextResponse.redirect(new URL('/404', request.url));
        }
    }

    const inventoryIdIndex = pathSegments.findIndex(segment => segment === 'inventory') + 1;

    if (inventoryIdIndex > 0 && pathSegments.length > inventoryIdIndex) {
        const inventoryId = pathSegments[inventoryIdIndex];
        const hasAccess = await validateInventoryAccess(auth.orgId, inventoryId);

        if (!hasAccess) {
            console.log(`[Middleware] Acceso denegado al inventario ${inventoryId}`);
            return NextResponse.redirect(new URL('/select_inventory', request.url));
        }
    }

    // Para rutas protegidas
    return NextResponse.next();
});

export const config = {
    matcher: [
        // Se aplicará a todas las páginas que no sean archivos estáticos
        '/((?!_next|trpc|api/users_data|api/forms|api/validate-inventory|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)'
    ],
};
