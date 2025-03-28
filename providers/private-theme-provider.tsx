"use client";

import { ThemeProvider } from 'next-themes';
import { useEffect, useState } from 'react';
import { useUser } from '@clerk/nextjs';

export function PrivateThemeProvider({ children }: { children: React.ReactNode }) {
    const { isSignedIn } = useUser();
    const [mounted, setMounted] = useState(false);

    useEffect(() => {
        setMounted(true);
    }, []);

    if (!mounted) return null;

    return (
        <ThemeProvider
            attribute="class"
            forcedTheme="light"
            disableTransitionOnChange
        >
            {children}
        </ThemeProvider>
    );
}