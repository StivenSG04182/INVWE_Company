import { ColumnDef } from "@tanstack/react-table";
import { Movement } from "../page";

export const columns: ColumnDef<Movement>[] = [
    {
        accessorKey: "name",
        header: "Nombre del Movimiento",
    },
    {
        accessorKey: "date",
        header: "Fecha",
        cell: ({ row }) => row.original.date.toLocaleDateString(),
    },
    {
        accessorKey: "description",
        header: "Descripción",
    },
];