'use client';

import { PrivateThemeProvider } from '@/providers/private-theme-provider';

export default function DashboardLayout({
    children,
}: {
    children: React.ReactNode
}) {
    return (
        <PrivateThemeProvider>
            <div className="flex min-h-screen w-full">
                {children}
            </div>
        </PrivateThemeProvider>
    );
}