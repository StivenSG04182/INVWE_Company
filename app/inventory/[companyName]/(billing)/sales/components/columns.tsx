"use client";

import { ColumnDef } from "@tanstack/react-table";
import { Badge } from "@/components/ui/badge";

export type SalesColumn = {
    id: string;
    date: string;
    store: string;
    product: string;
    quantity: number;
    total: number;
    paymentMethod: string;
    status: string;
}

export const columns: ColumnDef<SalesColumn>[] = [
    {
        accessorKey: "date",
        header: "Date",
    },
    {
        accessorKey: "store",
        header: "Store",
    },
    {
        accessorKey: "product",
        header: "Product",
    },
    {
        accessorKey: "quantity",
        header: "Quantity",
    },
    {
        accessorKey: "total",
        header: "Total",
        cell: ({ row }) => {
            const amount = parseFloat(row.getValue("total"));
            const formatted = new Intl.NumberFormat("en-US", {
                style: "currency",
                currency: "USD"
            }).format(amount);
            return formatted;
        }
    },
    {
        accessorKey: "paymentMethod",
        header: "Payment Method",
    },
    {
        accessorKey: "status",
        header: "Status",
        cell: ({ row }) => {
            const status = row.getValue("status") as string;
            return (
                <Badge
                    className={status === "completed" ? "bg-green-500" : "bg-orange-500"}
                >
                    {status}
                </Badge>
            );
        }
    }
];