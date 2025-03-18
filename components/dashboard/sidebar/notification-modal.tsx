"use client";

import { Bell } from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Dialog, DialogContent, DialogTrigger, DialogTitle } from "@/components/ui/dialog";
import { cn } from "@/lib/utils";

interface NotificationProps {
    hasNewNotification?: boolean;
    hasNewMessage?: boolean;
}

export function NotificationBell({ hasNewNotification = false, hasNewMessage = false }: NotificationProps) {
    return (
        <div className="relative">
            <Bell className="h-4 w-4" />
            {(hasNewNotification || hasNewMessage) && (
                <span className={cn(
                    "absolute -top-1 -right-1 h-2 w-2 rounded-full",
                    hasNewMessage ? "bg-blue-500" : "bg-red-500"
                )} />
            )}
        </div>
    );
}

export function NotificationPanel() {
    return (
        <Dialog>
            <DialogTrigger asChild>
                <button className="flex h-10 w-10 items-center justify-center rounded-lg text-gray-700 hover:bg-gray-100">
                    <NotificationBell />
                </button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[425px]">
                <DialogTitle className="sr-only">Notifications</DialogTitle>
                <Tabs defaultValue="all" className="w-full">
                    <TabsList className="grid w-full grid-cols-3">
                        <TabsTrigger value="all">All</TabsTrigger>
                        <TabsTrigger value="messages">Messages</TabsTrigger>
                        <TabsTrigger value="alerts">Alerts</TabsTrigger>
                    </TabsList>
                    <TabsContent value="all" className="space-y-4">
                        <div className="text-sm text-muted-foreground">
                            No new notifications
                        </div>
                    </TabsContent>
                    <TabsContent value="messages" className="space-y-4">
                        <div className="text-sm text-muted-foreground">
                            No new messages
                        </div>
                    </TabsContent>
                    <TabsContent value="alerts" className="space-y-4">
                        <div className="text-sm text-muted-foreground">
                            No new alerts
                        </div>
                    </TabsContent>
                </Tabs>
            </DialogContent>
        </Dialog>
    );
}