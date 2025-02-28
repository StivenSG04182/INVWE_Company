import { clerkMiddleware } from '@clerk/nextjs/server';
import { createRouteMatcher } from '@clerk/nextjs/server'
import { NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';

const isPublicRoute = createRouteMatcher([
    "/",
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
])

export default clerkMiddleware({
    publicRoutes: ["/"],
    async afterAuth(auth, req) {
        if (!auth.userId) {
            return;
        }

        // Skip middleware for API routes and non-inventory routes
        if (req.nextUrl.pathname.startsWith("/api")) {
            return;
        }

        // Check if user has a default inventory
        const { data: defaultInventory, error } = await supabase
            .from("users_companies")
            .select("company:companies(name), is_default_inventory")
            .eq("user_id", auth.userId)
            .eq("is_default_inventory", true)
            .single();

        const isSelectInventoryPage = req.nextUrl.pathname === "/select_inventory";
        const isInventoryRoute = req.nextUrl.pathname.startsWith("/inventory");

        // If user is not accessing inventory routes, skip middleware
        if (!isInventoryRoute && !isSelectInventoryPage) {
            return;
        }

        // Redirect based on default inventory status
        if (defaultInventory?.company?.name) {
            // If user has default inventory and tries to access select_inventory, redirect to dashboard
            if (isSelectInventoryPage) {
                return NextResponse.redirect(new URL(
                    `/inventory/${encodeURIComponent(defaultInventory.company.name)}/dashboard`,
                    req.nextUrl.origin
                ));
            }
        } else if (isInventoryRoute && !isSelectInventoryPage) {
            // If user has no default inventory and tries to access inventory routes,
            // redirect to select_inventory
            return NextResponse.redirect(new URL("/select_inventory", req.nextUrl.origin));
        }
    }
})

export const config = {
    matcher: [
        // Skip Next.js internals and all static files, unless found in search params
        '/((?!_next|[^?]*\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)',
        // Always run for API routes
        '/(api|trpc)(.*)',
    ],
}