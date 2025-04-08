"use client";

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow
} from "@/components/ui/table";

export default function DianControlPage() {
    const [invoiceNumber, setInvoiceNumber] = useState("");
    const [resolutionNumber, setResolutionNumber] = useState("");

    return (
        <div className="p-6 space-y-6">
            <h1 className="text-2xl font-bold">DIAN Control Panel</h1>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <Card>
                    <CardHeader>
                        <CardTitle>Electronic Invoicing Configuration</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div>
                            <label className="text-sm font-medium">Resolution Number</label>
                            <Input
                                value={resolutionNumber}
                                onChange={(e) => setResolutionNumber(e.target.value)}
                                placeholder="Enter DIAN resolution number"
                            />
                        </div>
                        <div>
                            <label className="text-sm font-medium">Current Invoice Number</label>
                            <Input
                                value={invoiceNumber}
                                onChange={(e) => setInvoiceNumber(e.target.value)}
                                placeholder="Enter current invoice number"
                            />
                        </div>
                        <Button className="w-full">Save Configuration</Button>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader>
                        <CardTitle>Invoice History</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead>Invoice #</TableHead>
                                    <TableHead>Date</TableHead>
                                    <TableHead>Status</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                <TableRow>
                                    <TableCell>FE-001</TableCell>
                                    <TableCell>2024-01-20</TableCell>
                                    <TableCell>Approved</TableCell>
                                </TableRow>
                                <TableRow>
                                    <TableCell>FE-002</TableCell>
                                    <TableCell>2024-01-21</TableCell>
                                    <TableCell>Pending</TableCell>
                                </TableRow>
                            </TableBody>
                        </Table>
                    </CardContent>
                </Card>
            </div>
        </div>
    );
}
