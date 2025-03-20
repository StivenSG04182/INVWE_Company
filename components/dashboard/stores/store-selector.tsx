'use client';

import { useState } from 'react';
import { Store } from '@prisma/client';
import { useParams, useRouter } from 'next/navigation';

import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';

interface StoreSelectorProps {
    items: Store[];
}

export function StoreSelector({ items = [] }: StoreSelectorProps) {
    const params = useParams();
    const router = useRouter();
    const [loading, setLoading] = useState(false);

    const onStoreSelect = (storeId: string) => {
        setLoading(true);
        router.push(`/${storeId}`);
    };

    return (
        <Select
            disabled={loading}
            value={params.storeId as string}
            onValueChange={onStoreSelect}
        >
            <SelectTrigger className="w-full h-8 border-0 bg-transparent focus:ring-0">
                <SelectValue placeholder="Select a store" />
            </SelectTrigger>
            <SelectContent>
                {items.map((store) => (
                    <SelectItem
                        key={store.id}
                        value={store.id}
                    >
                        {store.name}
                    </SelectItem>
                ))}
            </SelectContent>
        </Select>
    );
}