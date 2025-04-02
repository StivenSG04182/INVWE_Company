"use client";
import { useEffect, useState } from "react";
import { Settings } from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Dialog, DialogContent, DialogTrigger, DialogTitle } from "@/components/ui/dialog";
import { cn } from "@/lib/utils";
import { useRouter, useSearchParams } from "next/navigation"
import { Button } from "@/components/ui/button"
import { toast } from "sonner"
import { ArcColorPicker } from "@/components/ui/arc-color-picker";
import { useSidebarColor } from "@/hooks/use-sidebar-color";
import PricingTables from "@/components/ui/pricing-tables";


export function SettingsPage({ hasNewNotification = false, hasNewMessage = false }) {
    return (
        <div className="relative">
            <Settings className="h-4 w-4" />
            {(hasNewNotification || hasNewMessage) && (
                <span className={cn(
                    "absolute -top-1 -right-1 h-2 w-2 rounded-full",
                    hasNewMessage ? "bg-blue-500" : "bg-red-500"
                )} />
            )}
        </div>
    );
}

export function SettingsPanel() {
    const [selectedColor, setSelectedColor] = useState("#f6d365");
    const [grainIntensity, setGrainIntensity] = useState(50);
    const [notifications, setNotifications] = useState([]);
    const [, setLoading] = useState(true);
    const router = useRouter();
    const searchParams = useSearchParams();
    const companyId = searchParams.get("companyId");
    const [isLoading, setIsLoading] = useState(false);

    useEffect(() => {
        async function fetchNotifications() {
            try {
                const res = await fetch("/api/control_login/settings?category=all");
                const data = await res.json();
                if (data.notifications) setNotifications(data.notifications);
            } catch (error) {
                console.error("Error fetching settings:", error);
            } finally {
                setLoading(false);
            }
        }
        fetchNotifications();
    }, []);

    return (
        <Dialog>
            <DialogTrigger asChild>
                <button className="flex h-10 w-10 items-center justify-center rounded-lg text-gray-700 hover:bg-gray-100">
                    <SettingsPage hasNewNotification={notifications.length > 0} />
                </button>
            </DialogTrigger>
            <DialogContent className="w-full max-w-6xl max-h-6xl p-4 h-auto min-h-[450px] overflow-y-auto" closeButton={false}>
                <DialogTitle className="sr-only">Configuraciones</DialogTitle>
                <Tabs defaultValue="all" className="w-full h-full flex flex-col">
                    <TabsList className="flex w-full items-center justify-between space-x-2 shrink-0">
                        <TabsTrigger value="templates">Estilos</TabsTrigger>
                        <TabsTrigger value="themes">Color Sidebar</TabsTrigger>
                        <TabsTrigger value="notifications">Notificaciones</TabsTrigger>
                        <TabsTrigger value="subscriptions">Suscripción</TabsTrigger>
                    </TabsList>
                    <div className="border-t border-solid border-gray-400 flex-grow pb-20 pt-20 mt-4">
                        <TabsContent value="subscriptions" className="space-y-2 h-full">
                            <PricingTables />
                        </TabsContent>
                        <TabsContent value="themes" className="space-y-4 h-full">
                            <div className="w-full max-w-md mx-auto">
                                <h2 className="text-2xl font-bold mb-6 text-center">Color del Sidebar</h2>
                                <p className="text-muted-foreground mb-8 text-center">Selecciona un color para personalizar la barra lateral</p>
                                <ArcColorPicker
                                    selectedColor={selectedColor}
                                    setSelectedColor={setSelectedColor}
                                    grainIntensity={grainIntensity}
                                    setGrainIntensity={setGrainIntensity}
                                />
                                <div className="mt-8 flex justify-center">
                                    <Button
                                        onClick={() => {
                                            const sidebarColor = useSidebarColor.getState();
                                            sidebarColor.setSidebarColor(selectedColor);
                                            toast.success("Color del sidebar actualizado");
                                        }}
                                        className="bg-custom-blue hover:bg-custom-blue/90 dark:bg-custom-gold dark:hover:bg-custom-gold/90 dark:text-black"
                                    >
                                        Aplicar Color
                                    </Button>
                                </div>
                            </div>
                        </TabsContent>
                    </div>
                </Tabs>
            </DialogContent>
        </Dialog>
    );
}
