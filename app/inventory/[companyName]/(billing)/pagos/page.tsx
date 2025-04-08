"use client";

import { useState } from "react";
import { Card } from "@/components/ui/card";
import { DataTable } from "@/components/ui/data-table";
import { Heading } from "@/components/ui/heading";
import { Separator } from "@/components/ui/separator";
import { Button } from "@/components/ui/button";
import { Download, Filter, CreditCard } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { DatePickerWithRange } from "@/components/ui/date-range-picker";

// Interface for payment data
interface PaymentData {
    id: string;
    date: string;
    invoiceNumber: string;
    customer: string;
    amount: number;
    method: string;
    status: string;
    reference: string;
}

// Column definition for the data table
const columns = [
    {
        accessorKey: "date",
        header: "Date",
    },
    {
        accessorKey: "invoiceNumber",
        header: "Invoice Number",
    },
    {
        accessorKey: "customer",
        header: "Customer",
    },
    {
        accessorKey: "amount",
        header: "Amount",
        cell: ({ row }) => {
            const amount = parseFloat(row.getValue("amount"));
            const formatted = new Intl.NumberFormat("en-US", {
                style: "currency",
                currency: "USD"
            }).format(amount);
            return formatted;
        }
    },
    {
        accessorKey: "method",
        header: "Payment Method",
        cell: ({ row }) => {
            const method = row.getValue("method") as string;
            return (
                <div className="flex items-center">
                    <CreditCard className="mr-2 h-4 w-4" />
                    {method}
                </div>
            );
        }
    },
    {
        accessorKey: "reference",
        header: "Reference",
    },
    {
        accessorKey: "status",
        header: "Status",
        cell: ({ row }) => {
            const status = row.getValue("status") as string;
            return (
                <Badge
                    className={status === "completed" ? "bg-green-500" : status === "pending" ? "bg-orange-500" : "bg-red-500"}
                >
                    {status}
                </Badge>
            );
        }
    }
];

export default function PaymentsPage() {
    const [date, setDate] = useState<DateRange | undefined>({
        from: new Date(),
        to: new Date(),
    });

    // Mock data - Replace with actual API call
    const paymentsData: PaymentData[] = [
        {
            id: "1",
            date: "2024-01-20",
            invoiceNumber: "FE-001",
            customer: "Cliente Ejemplo 1",
            amount: 150.00,
            method: "Credit Card",
            status: "completed",
            reference: "REF123456"
        },
        {
            id: "2",
            date: "2024-01-21",
            invoiceNumber: "FE-002",
            customer: "Cliente Ejemplo 2",
            amount: 75.50,
            method: "Bank Transfer",
            status: "pending",
            reference: "TRF789012"
        },
        {
            id: "3",
            date: "2024-01-22",
            invoiceNumber: "FE-003",
            customer: "Cliente Ejemplo 3",
            amount: 200.00,
            method: "Cash",
            status: "completed",
            reference: "CASH345678"
        },
        // Add more mock data as needed
    ];

    return (
        <div className="flex-col">
            <div className="flex-1 space-y-4 p-8 pt-6">
                <div className="flex items-center justify-between">
                    <Heading
                        title="Payments Management"
                        description="Track and manage all payment transactions"
                    />
                    <div className="flex space-x-2">
                        <Button size="sm" variant="outline">
                            <Filter className="mr-2 h-4 w-4" />
                            Filter
                        </Button>
                        <Button size="sm">
                            <Download className="mr-2 h-4 w-4" />
                            Export
                        </Button>
                    </div>
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
                        data={paymentsData}
                        searchKey="invoiceNumber"
                        searchPlaceholder="Search by invoice number..."
                    />
                </Card>
            </div>
        </div>
    );
}