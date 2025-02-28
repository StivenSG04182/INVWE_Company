"use client";

import { useParams } from "next/navigation";

export default function InventoryDashboard() {
    const params = useParams();
    
    return (
        <div className="p-6">
            <h1 className="text-3xl font-bold mb-6">Inventory Dashboard</h1>
            <p className="text-muted-foreground">
                Welcome to {params.companyName}"s inventory dashboard
            </p>
        </div>
    );
}