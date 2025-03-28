"use client";

import { ThemeProvider } from 'next-themes';
import { useEffect, useState } from 'react';
import { useUser } from '@clerk/nextjs';

export function PublicThemeProvider({ children }: { children: React.ReactNode }) {
    const { isSignedIn } = useUser();
    const [mounted, setMounted] = useState(false);

    useEffect(() => {
        setMounted(true);
    }, []);

    if (!mounted) return null;

    return (
        <ThemeProvider
            attribute="class"
            defaultTheme="system"
            enableSystem
            disableTransitionOnChange
        >
            {children}
        </ThemeProvider>
    );
}