"use client"

import { Card } from "@/components/ui/card"
import { LineChart, BarChart, PieChart } from "lucide-react"

export function Overview() {
    return (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            <Card className="p-6">
                <div className="flex items-center justify-between space-y-2">
                    <h3 className="text-sm font-medium">Total Revenue</h3>
                    <LineChart className="h-4 w-4 text-muted-foreground" />
                </div>
                <div className="flex items-center pt-4">
                    <div className="flex items-center">
                        <p className="text-2xl font-bold">$45,231.89</p>
                        <span className="ml-2 text-xs text-green-500">+20.1%</span>
                    </div>
                </div>
                <p className="text-xs text-muted-foreground">+20.1% from last month</p>
            </Card>
            <Card className="p-6">
                <div className="flex items-center justify-between space-y-2">
                    <h3 className="text-sm font-medium">Subscriptions</h3>
                    <BarChart className="h-4 w-4 text-muted-foreground" />
                </div>
                <div className="flex items-center pt-4">
                    <div className="flex items-center">
                        <p className="text-2xl font-bold">+2350</p>
                        <span className="ml-2 text-xs text-green-500">+180.1%</span>
                    </div>
                </div>
                <p className="text-xs text-muted-foreground">+180.1% from last month</p>
            </Card>
            <Card className="p-6">
                <div className="flex items-center justify-between space-y-2">
                    <h3 className="text-sm font-medium">Sales</h3>
                    <PieChart className="h-4 w-4 text-muted-foreground" />
                </div>
                <div className="flex items-center pt-4">
                    <div className="flex items-center">
                        <p className="text-2xl font-bold">+12,234</p>
                        <span className="ml-2 text-xs text-red-500">-19%</span>
                    </div>
                </div>
                <p className="text-xs text-muted-foreground">-19% from last month</p>
            </Card>
            <Card className="p-6">
                <div className="flex items-center justify-between space-y-2">
                    <h3 className="text-sm font-medium">Active Users</h3>
                    <LineChart className="h-4 w-4 text-muted-foreground" />
                </div>
                <div className="flex items-center pt-4">
                    <div className="flex items-center">
                        <p className="text-2xl font-bold">+573</p>
                        <span className="ml-2 text-xs text-green-500">+201</span>
                    </div>
                </div>
                <p className="text-xs text-muted-foreground">+201 since last hour</p>
            </Card>
        </div>
    )
}