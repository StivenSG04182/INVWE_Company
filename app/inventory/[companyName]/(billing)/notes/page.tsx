"use client";

import { useState } from "react";
import { Card } from "@/components/ui/card";
import { DataTable } from "@/components/ui/data-table";
import { Heading } from "@/components/ui/heading";
import { Separator } from "@/components/ui/separator";
import { Button } from "@/components/ui/button";
import { Plus, Download, FileText } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { DatePickerWithRange } from "@/components/ui/date-range-picker";

// Interface for credit/debit notes data
interface NoteData {
    id: string;
    date: string;
    invoiceNumber: string;
    type: "credit" | "debit";
    amount: number;
    reason: string;
    status: string;
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
        accessorKey: "type",
        header: "Type",
        cell: ({ row }) => {
            const type = row.getValue("type") as string;
            return (
                <Badge
                    className={type === "credit" ? "bg-blue-500" : "bg-purple-500"}
                >
                    {type === "credit" ? "Credit Note" : "Debit Note"}
                </Badge>
            );
        }
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
        accessorKey: "reason",
        header: "Reason",
    },
    {
        accessorKey: "status",
        header: "Status",
        cell: ({ row }) => {
            const status = row.getValue("status") as string;
            return (
                <Badge
                    className={status === "approved" ? "bg-green-500" : status === "pending" ? "bg-orange-500" : "bg-red-500"}
                >
                    {status}
                </Badge>
            );
        }
    },
    {
        id: "actions",
        cell: ({ row }) => {
            return (
                <Button variant="ghost" size="sm">
                    <FileText className="h-4 w-4" />
                </Button>
            );
        }
    }
];

export default function NotesPage() {
    const [date, setDate] = useState<DateRange | undefined>({
        from: new Date(),
        to: new Date(),
    });

    // Mock data - Replace with actual API call
    const notesData: NoteData[] = [
        {
            id: "1",
            date: "2024-01-22",
            invoiceNumber: "FE-001",
            type: "credit",
            amount: 50.00,
            reason: "Product return",
            status: "approved"
        },
        {
            id: "2",
            date: "2024-01-25",
            invoiceNumber: "FE-002",
            type: "debit",
            amount: 25.00,
            reason: "Additional charge",
            status: "pending"
        },
        // Add more mock data as needed
    ];

    return (
        <div className="flex-col">
            <div className="flex-1 space-y-4 p-8 pt-6">
                <div className="flex items-center justify-between">
                    <Heading
                        title="Credit & Debit Notes"
                        description="Manage credit and debit notes for your invoices"
                    />
                    <div className="flex space-x-2">
                        <Button size="sm">
                            <Plus className="mr-2 h-4 w-4" />
                            Create Note
                        </Button>
                        <Button size="sm" variant="outline">
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
                        data={notesData}
                        searchKey="invoiceNumber"
                        searchPlaceholder="Search by invoice number..."
                    />
                </Card>
            </div>
        </div>
    );
}