"use client";

import { useState } from "react";
import { Card } from "@/components/ui/card";
import { DataTable } from "@/components/ui/data-table";
import { Heading } from "@/components/ui/heading";
import { Separator } from "@/components/ui/separator";
import { columns } from "./components/columns";
import { DatePickerWithRange } from "@/components/ui/date-range-picker";
import { Button } from "@/components/ui/button";
import { Download } from "lucide-react";

// Interface for sales data
interface SalesData {
    id: string;
    date: string;
    store: string;
    product: string;
    quantity: number;
    total: number;
    paymentMethod: string;
    status: string;
}

export default function SalesPage() {
    const [date, setDate] = useState<DateRange | undefined>({
        from: new Date(),
        to: new Date(),
    });

    // Mock data - Replace with actual API call
    const salesData: SalesData[] = [
        {
            id: "1",
            date: "2024-01-20",
            store: "Main Store",
            product: "Product 1",
            quantity: 2,
            total: 100.00,
            paymentMethod: "Credit Card",
            status: "completed"
        },
        // Add more mock data as needed
    ];

    return (
        <div className="flex-col">
            <div className="flex-1 space-y-4 p-8 pt-6">
                <div className="flex items-center justify-between">
                    <Heading
                        title="Sales Overview"
                        description="Manage and view your company's sales across all stores"
                    />
                    <Button size="sm">
                        <Download className="mr-2 h-4 w-4" />
                        Download Report
                    </Button>
                </div>
                <Separator />
                <div className="flex items-center gap-x-4">
                    <DatePickerWithRange
                        date={date}
                        setDate={setDate}
                    />
                </div>
                <Card className="p-4">
                    <DataTable
                        columns={columns}
                        data={salesData}
                        searchKey="product"
                        searchPlaceholder="Search by product..."
                    />
                </Card>
            </div>
        </div>
    );
}
