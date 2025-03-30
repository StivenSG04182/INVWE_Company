'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

interface Store {
    _id: string;
    name: string;
    companyId: string;
}

export function SelectorStores() {
    const params = useParams();
    const router = useRouter();
    const [loading, setLoading] = useState(false);
    const [stores, setStores] = useState<Store[]>([]);

    useEffect(() => {
        const fetchStores = async () => {
            try {
                const response = await fetch(`/api/stores/${params.companyId}`, {
                    headers: {
                        'Content-Type': 'application/json'
                    }
                });
                if (!response.ok) throw new Error('Failed to fetch stores');
                const data = await response.json();
                setStores(data);
            } catch (error) {
                console.error('Error fetching stores:', error);
            }
        };

        if (params.companyId) {
            fetchStores();
        }
    }, [params.companyId]);

    const onStoreSelect = async (storeId: string) => {
        try {
            setLoading(true);
            router.push(`/${params.companyId}/stores/${storeId}`);
        } catch (error) {
            console.error('Error de navegación:', error);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="px-4 py-2">
            <Select
                disabled={loading}
                value={params.storeId as string}
                onValueChange={onStoreSelect}
            >
                <SelectTrigger className="w-full h-8 border-0 bg-transparent focus:ring-0">
                    <SelectValue>
                        {stores.find(store => store._id === params.storeId)?.name || "Select a store"}
                    </SelectValue>
                </SelectTrigger>
                <SelectContent>
                    {stores.map((store) => (
                        <SelectItem
                            key={store._id}
                            value={store._id}
                        >
                            {store.name}
                        </SelectItem>
                    ))}
                </SelectContent>
            </Select>
        </div>
    );
}