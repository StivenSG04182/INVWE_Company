"use client";

import { Card } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { BarChart, LineChart, PieChart } from "lucide-react";

export default function AnalyticsPage() {
    return (
        <div className="flex-1 space-y-4 p-8 pt-6">
            <div className="flex items-center justify-between space-y-2">
                <h2 className="text-3xl font-bold tracking-tight">Analytics</h2>
                <div className="flex items-center space-x-2">
                    <select className="h-9 rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring">
                        <option>Last 7 days</option>
                        <option>Last 30 days</option>
                        <option>Last 3 months</option>
                        <option>Last year</option>
                    </select>
                </div>
            </div>
            <Tabs defaultValue="sales" className="space-y-4">
                <TabsList>
                    <TabsTrigger value="sales">Sales Analytics</TabsTrigger>
                    <TabsTrigger value="inventory">Inventory Analytics</TabsTrigger>
                    <TabsTrigger value="customers">Customer Analytics</TabsTrigger>
                </TabsList>

                <TabsContent value="sales" className="space-y-4">
                    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                        <Card className="p-6">
                            <div className="flex items-center gap-2">
                                <BarChart className="h-4 w-4" />
                                <h3 className="text-sm font-medium">Sales Growth</h3>
                            </div>
                            <div className="mt-3">
                                <div className="text-2xl font-bold">34.7%</div>
                                <p className="text-xs text-muted-foreground">+18.4% from last month</p>
                            </div>
                            <div className="h-[200px] mt-4">
                                {/* Add chart component here */}
                            </div>
                        </Card>

                        <Card className="p-6">
                            <div className="flex items-center gap-2">
                                <LineChart className="h-4 w-4" />
                                <h3 className="text-sm font-medium">Revenue Trends</h3>
                            </div>
                            <div className="mt-3">
                                <div className="text-2xl font-bold">$68,493</div>
                                <p className="text-xs text-muted-foreground">+8.2% from last month</p>
                            </div>
                            <div className="h-[200px] mt-4">
                                {/* Add chart component here */}
                            </div>
                        </Card>

                        <Card className="p-6">
                            <div className="flex items-center gap-2">
                                <PieChart className="h-4 w-4" />
                                <h3 className="text-sm font-medium">Sales Distribution</h3>
                            </div>
                            <div className="mt-3">
                                <div className="text-2xl font-bold">1,204 orders</div>
                                <p className="text-xs text-muted-foreground">Across 3 main categories</p>
                            </div>
                            <div className="h-[200px] mt-4">
                                {/* Add chart component here */}
                            </div>
                        </Card>
                    </div>

                    <Card className="p-6">
                        <h3 className="text-lg font-medium mb-4">Detailed Analytics</h3>
                        <div className="h-[400px]">
                        </div>
                    </Card>
                </TabsContent>

                <TabsContent value="inventory" className="space-y-4">
                    {/* Add inventory analytics content */}
                    <Card className="p-6">
                        <h3 className="text-lg font-medium">Inventory Analytics Coming Soon</h3>
                    </Card>
                </TabsContent>

                <TabsContent value="customers" className="space-y-4">
                    {/* Add customer analytics content */}
                    <Card className="p-6">
                        <h3 className="text-lg font-medium">Customer Analytics Coming Soon</h3>
                    </Card>
                </TabsContent>
            </Tabs>
        </div>
    );
}