'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useTheme } from 'next-themes';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

const COOKIE_CONSENT_KEY = 'invwe-cookie-consent';

export function CookieBanner() {
    const [showBanner, setShowBanner] = useState(false);
    const [animationState, setAnimationState] = useState<'idle' | 'accept' | 'reject'>('idle');
    const { theme } = useTheme();

    useEffect(() => {
        // Check if user has already made a choice
        const consentValue = localStorage.getItem(COOKIE_CONSENT_KEY);
        if (consentValue === null) {
            // Only show banner if no choice has been made
            setShowBanner(true);
        }
    }, []);

    const handleAccept = () => {
        setAnimationState('accept');

        // Delay hiding the banner to allow animation to complete
        setTimeout(() => {
            localStorage.setItem(COOKIE_CONSENT_KEY, 'accepted');
            setShowBanner(false);
        }, 2000);
    };

    const handleReject = () => {
        setAnimationState('reject');

        // Delay hiding the banner to allow animation to complete
        setTimeout(() => {
            localStorage.setItem(COOKIE_CONSENT_KEY, 'rejected');
            setShowBanner(false);
        }, 2000);
    };

    if (!showBanner) return null;

    return (
        <AnimatePresence>
            <motion.div
                initial={{ y: 100, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                exit={{ y: 100, opacity: 0 }}
                transition={{ duration: 0.5 }}
                className={cn(
                    'fixed bottom-4 left-0 right-0 mx-auto max-w-md z-50 p-6 rounded-xl shadow-xl',
                    'bg-white/90 dark:bg-gray-800/90 backdrop-blur-lg border border-gray-200 dark:border-gray-700'
                )}
            >
                <div className="flex flex-col space-y-4">
                    <div className="flex items-center justify-between">
                        <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
                            Política de Cookies
                        </h3>
                        <div className="relative w-16 h-16">
                            {/* Cookie Box */}
                            <motion.div
                                className="absolute bottom-0 w-12 h-10 rounded-md border-2 border-amber-600 dark:border-amber-500 shadow-md"
                                style={{
                                    background: theme === 'dark' ? '#FBBF24' : '#FCD34D',
                                    zIndex: 1,
                                    boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)',
                                }}
                                animate={{
                                    scaleY: animationState === 'reject' ? [1, 0.1, 1] : 1,
                                    rotate: animationState === 'reject' ? [0, -5, 5, 0] : 0,
                                }}
                                transition={{ duration: 0.5 }}
                            >
                                {/* Box texture lines */}
                                <div className="absolute top-2 left-1 right-1 h-0.5 bg-amber-700 opacity-30 rounded-full"></div>
                                <div className="absolute top-5 left-1 right-1 h-0.5 bg-amber-700 opacity-30 rounded-full"></div>
                                <div className="absolute top-8 left-1 right-1 h-0.5 bg-amber-700 opacity-30 rounded-full"></div>
                                
                                {/* Box lid */}
                                <motion.div
                                    className="absolute -top-2 left-0 w-full h-2 rounded-t-md border-2 border-amber-600 dark:border-amber-500"
                                    style={{
                                        background: theme === 'dark' ? '#FBBF24' : '#FCD34D',
                                        borderBottom: 'none',
                                        transformOrigin: 'top',
                                        zIndex: 3,
                                    }}
                                    animate={{
                                        rotateX: animationState === 'accept' ? [0, -110, -110] : 
                                                animationState === 'reject' ? [0, -110, 0] : 0,
                                    }}
                                    transition={{ duration: 0.8 }}
                                />
                            </motion.div>

                            {/* Cookie */}
                            <motion.div
                                className="absolute top-0 right-2 w-8 h-8 rounded-full"
                                style={{
                                    background: theme === 'dark' ? '#D97706' : '#92400E',
                                    border: '2px solid',
                                    borderColor: theme === 'dark' ? '#F59E0B' : '#B45309',
                                    zIndex: 2,
                                }}
                                initial={{ y: 0 }}
                                animate={{
                                    y: animationState === 'accept'
                                        ? [0, 4, 8, 12, 16]
                                        : animationState === 'reject'
                                            ? [0, 4, 0]
                                            : 0,
                                    x: animationState === 'reject' ? [0, -10, -20, -10, 0] : 0,
                                    scale: animationState === 'accept' ? [1, 0.9, 0.8] : 1,
                                    opacity: animationState === 'accept' ? [1, 1, 0.8, 0.5, 0] : 1,
                                }}
                                transition={{ duration: 1.2 }}
                            >
                                {/* Cookie chips */}
                                <motion.div
                                    className="absolute top-1 left-1 w-1 h-1 rounded-full"
                                    style={{ background: theme === 'dark' ? '#78350F' : '#78350F' }}
                                />
                                <motion.div
                                    className="absolute bottom-1 right-1 w-1 h-1 rounded-full"
                                    style={{ background: theme === 'dark' ? '#78350F' : '#78350F' }}
                                />
                                <motion.div
                                    className="absolute top-3 right-2 w-1 h-1 rounded-full"
                                    style={{ background: theme === 'dark' ? '#78350F' : '#78350F' }}
                                />
                            </motion.div>
                        </div>
                    </div>

                    <p className="text-sm text-gray-600 dark:text-gray-300">
                        Utilizamos cookies para mejorar su experiencia en nuestro sitio web. Al continuar navegando, acepta nuestra política de cookies.
                    </p>

                    <div className="flex space-x-3 justify-end">
                        <Button
                            variant="outline"
                            size="sm"
                            onClick={handleReject}
                            className="text-amber-800 dark:text-amber-200 border-amber-400 dark:border-amber-700 hover:bg-amber-50 dark:hover:bg-amber-900/30"
                        >
                            Rechazar
                        </Button>
                        <Button
                            variant="default"
                            size="sm"
                            onClick={handleAccept}
                            className="bg-amber-600 hover:bg-amber-700 text-white dark:bg-amber-700 dark:hover:bg-amber-800"
                        >
                            Aceptar
                        </Button>
                    </div>
                </div>
            </motion.div>
        </AnimatePresence>
    );
}