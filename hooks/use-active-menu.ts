import { useState, useEffect } from 'react';

const STORAGE_KEY = 'activeMenuItem';

export const useActiveMenu = (defaultItem: string | null = 'Overview') => {
    const [activeItem, setActiveItem] = useState<string | null>(defaultItem);

    useEffect(() => {
        const stored = localStorage.getItem(STORAGE_KEY);
        if (stored) {
            setActiveItem(JSON.parse(stored));
        }
    }, []);

    useEffect(() => {
        if (activeItem) {
            localStorage.setItem(STORAGE_KEY, JSON.stringify(activeItem));
        } else {
            localStorage.removeItem(STORAGE_KEY);
        }
    }, [activeItem]);

    return [activeItem, setActiveItem] as const;
};