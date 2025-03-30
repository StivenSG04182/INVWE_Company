import { clerkMiddleware, createRouteMatcher } from '@clerk/nextjs/server';
import { NextResponse } from 'next/server';

const isPublicRoute = createRouteMatcher([
    "/",
    "/enterprise",
    "/nots",
    "/about",
    "/nots",
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
    const { userId } = await auth();
    console.log("[Middleware] Request URL:", request.url);
    if (request.nextUrl.pathname.startsWith('/api')) {
        return NextResponse.next();
    }

    if (!userId) {
        if (isPublicRoute(request)) {
            console.log("[Middleware] Ruta pública sin autenticación, permitiendo acceso");
            return NextResponse.next();
        }
        (await auth());
        return;
    }
    return NextResponse.next();
});
export const config = {
    matcher: [
        '/((?!_next|trpc|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)'
    ],
};