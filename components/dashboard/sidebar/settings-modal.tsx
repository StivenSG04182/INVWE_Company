"use client";
import { useEffect, useState } from "react";
import { Settings, FolderCode, ThumbsUp } from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Dialog, DialogContent, DialogTrigger, DialogTitle } from "@/components/ui/dialog";
import { cn } from "@/lib/utils";
import { toast } from "sonner"
import { useSidebarColor } from "@/hooks/use-sidebar-color";
import PricingTables from "@/components/ui/pricing-tables";
import { Button } from '@/components/ui/button';
import { SkeletonShinyGradient } from "@/components/ui/skeleton-shiny-gradient";

interface Functionality {
    id: string;
    nombre: string;
    descripcion: string;
}

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
    const [selectedPosition, setSelectedPosition] = useState('left');
    const [notifications, setNotifications] = useState([]);
    const [, setLoading] = useState(true);

    const [isModalOpen, setIsModalOpen] = useState(false);
    const [currentfunctionality, setCurrentFunctionality] = useState<Functionality | null>(null);
    const [modalMode, setModalMode] = useState<'add' | 'edit'>('add');

    const filteredFunctionality = functionality.filter(functionality => 
        functionality.nombre.toLowerCase().includes(FolderCodeTerm.toLowerCase()) ||
        functionality.descripcion.toLowerCase().includes(FolderCodeTerm.toLowerCase())
      );

    // Función para abrir el modal en modo añadir
    const handleAddFunctionality = () => {
        setCurrentFunctionality(null);
        setModalMode('add');
        setIsModalOpen(true);
    };

    // Función para abrir el modal en modo editar
    const handleEditFunctionality = (functionality: Functionality) => {
        setCurrentEmployee(functionality);
        setModalMode('edit');
        setIsModalOpen(true);
    };


    // Mover la declaración del hook antes del useEffect
    const { sidebarColor, setSidebarColor, sidebarPosition, setSidebarPosition } = useSidebarColor();
    const [FolderCodeTerm, setFolderCodeTerm] = useState("");

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

        // Inicializar el estado con los valores actuales del sidebar
        setSelectedPosition(sidebarPosition);
    }, [sidebarColor, sidebarPosition]);

    return (
        <Dialog>
            <DialogTrigger asChild>
                <button className="flex h-10 w-10 items-center justify-center rounded-lg text-gray-700 hover:bg-gray-100">
                    <SettingsPage hasNewNotification={notifications.length > 0} />
                </button>
            </DialogTrigger>
            <DialogContent
                className="w-full max-w-6xl max-h-6xl p-4 h-auto min-h-[450px] overflow-y-auto"
                closeButton={false}>
                <DialogTitle className="sr-only">Configuraciones</DialogTitle>
                <Tabs defaultValue="all" className="w-full h-full flex flex-col">
                    <TabsList
                        className="flex w-full items-center justify-between space-x-2 shrink-0">
                        <TabsTrigger
                            value="templates"
                            className="bg-white text-black hover:bg-white/90"
                        >Estilos</TabsTrigger>
                        <TabsTrigger
                            value="themes"
                            className="bg-white text-black hover:bg-white/90"
                        >Posición Sidebar</TabsTrigger>
                        <TabsTrigger
                            value="notifications"
                            className="bg-white text-black hover:bg-white/90"
                        >Notificaciones</TabsTrigger>
                        <TabsTrigger
                            value="subscriptions"
                            className="bg-white text-black hover:bg-white/90"
                        >Suscripción</TabsTrigger>
                        <TabsTrigger
                            value="functionality"
                            className="bg-white text-black hover:bg-white/90"
                        >Funcionalidad</TabsTrigger>
                    </TabsList>
                    <div className="border-t border-solid border-gray-400 flex-grow pb-20 pt-20 mt-4">
                        <TabsContent value="subscriptions" className="space-y-2 h-full">
                            <PricingTables />
                        </TabsContent>
                        <TabsContent value="themes" className="space-y-4 h-full">
                            <h2 className="text-2xl font-bold mb-6 text-center">Posición del Sidebar</h2>
                            <p className="text-muted-foreground mb-4 text-center">Selecciona la posición y el color para personalizar la barra lateral</p>

                            {/* Contenedor principal con dos columnas */}
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">

                                {/* Columna derecha: Posición del sidebar */}
                                <div className="bg-white p-6 rounded-lg shadow-md">
                                    <h3 className="text-lg font-semibold mb-4">Posición del Sidebar</h3>
                                    <div className="flex flex-col space-y-4">
                                        <div
                                            className={`p-4 border rounded-lg cursor-pointer ${selectedPosition === 'left' ? 'border-blue-500 bg-blue-50' : 'border-gray-300'}`}
                                            onClick={() => {
                                                setSelectedPosition('left');
                                                setSidebarPosition('left');
                                                toast.success("Sidebar posicionado a la izquierda");
                                            }}
                                        >
                                            <div className="flex items-center">
                                                <div className="w-8 h-16 bg-gray-300 rounded-r-lg mr-4"></div>
                                                <div className="flex-1">
                                                    <div className="h-4 w-full bg-gray-200 rounded mb-2"></div>
                                                    <div className="h-4 w-3/4 bg-gray-200 rounded"></div>
                                                </div>
                                            </div>
                                            <p className="mt-2 text-center font-medium">Izquierda</p>
                                        </div>

                                        <div
                                            className={`p-4 border rounded-lg cursor-pointer ${selectedPosition === 'right' ? 'border-blue-500 bg-blue-50' : 'border-gray-300'}`}
                                            onClick={() => {
                                                setSelectedPosition('right');
                                                setSidebarPosition('right');
                                                toast.success("Sidebar posicionado a la derecha");
                                            }}
                                        >
                                            <div className="flex items-center">
                                                <div className="flex-1">
                                                    <div className="h-4 w-full bg-gray-200 rounded mb-2"></div>
                                                    <div className="h-4 w-3/4 bg-gray-200 rounded"></div>
                                                </div>
                                                <div className="w-8 h-16 bg-gray-300 rounded-l-lg ml-4"></div>
                                            </div>
                                            <p className="mt-2 text-center font-medium">Derecha</p>
                                        </div>

                                        <div
                                            className={`p-4 border rounded-lg cursor-pointer ${selectedPosition === 'top' ? 'border-blue-500 bg-blue-50' : 'border-gray-300'}`}
                                            onClick={() => {
                                                setSelectedPosition('top');
                                                setSidebarPosition('top');
                                                toast.success("Sidebar posicionado en la parte superior");
                                            }}
                                        >
                                            <div className="flex flex-col items-center">
                                                <div className="w-full h-8 bg-gray-300 rounded-b-lg mb-4"></div>
                                                <div className="w-full">
                                                    <div className="h-4 w-full bg-gray-200 rounded mb-2"></div>
                                                    <div className="h-4 w-3/4 bg-gray-200 rounded"></div>
                                                </div>
                                            </div>
                                            <p className="mt-2 text-center font-medium">Superior</p>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </TabsContent>
                        <TabsContent value="notifications" className="space-y-4 h-full">
                            <h2 className="text-2xl font-bold mb-6 text-center">Notificaciones</h2>
                            <div className="bg-white p-6 rounded-lg shadow-md">
                                <div className="flex justify-between items-center mb-4">
                                    <h3 className="text-lg font-semibold">Notificaciones por correo</h3>
                                    <div className="relative inline-block w-12 h-6 rounded-full bg-gray-300">
                                        <input
                                            type="checkbox"
                                            className="sr-only"
                                            id="email-toggle"
                                        />
                                        <span className="block w-6 h-6 rounded-full bg-white shadow-md transform transition-transform duration-300 ease-in-out"></span>
                                    </div>
                                </div>
                                <p className="text-gray-600 mb-6">Recibe notificaciones importantes sobre tu cuenta y actividad en tu correo electrónico.</p>

                                <div className="flex justify-between items-center mb-4">
                                    <h3 className="text-lg font-semibold">Notificaciones push</h3>
                                    <div className="relative inline-block w-12 h-6 rounded-full bg-gray-300">
                                        <input
                                            type="checkbox"
                                            className="sr-only"
                                            id="push-toggle"
                                        />
                                        <span className="block w-6 h-6 rounded-full bg-white shadow-md transform transition-transform duration-300 ease-in-out"></span>
                                    </div>
                                </div>
                                <p className="text-gray-600">Recibe notificaciones en tiempo real directamente en tu navegador.</p>
                            </div>
                        </TabsContent>
                        <TabsContent value="templates" className="space-y-4 h-full">
                            <h2 className="text-2xl font-bold mb-6 text-center">Tema del Sidebar</h2>
                            <div className="bg-white p-6 rounded-lg shadow-md">
                                <h3 className="text-lg font-semibold mb-4">Selecciona un tema para el sidebar</h3>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8">
                                    <div
                                        className="border p-4 rounded-lg cursor-pointer hover:border-blue-500 transition-colors"
                                        onClick={() => {
                                            setSidebarColor('#ffffff');
                                            toast.success("Tema claro aplicado al sidebar");
                                        }}
                                    >
                                        <div className="h-24 bg-white border rounded-lg mb-2 flex items-center justify-center">
                                            <div className="w-3/4 h-3/4 bg-gray-100 rounded-lg flex items-center justify-center">
                                                <span className="text-xs text-gray-500">Claro</span>
                                            </div>
                                        </div>
                                        <p className="text-center font-medium">Tema Claro</p>
                                    </div>

                                    <div
                                        className="border p-4 rounded-lg cursor-pointer hover:border-blue-500 transition-colors"
                                        onClick={() => {
                                            setSidebarColor('#1f2937');
                                            toast.success("Tema oscuro aplicado al sidebar");
                                        }}
                                    >
                                        <div className="h-24 bg-gray-900 border rounded-lg mb-2 flex items-center justify-center">
                                            <div className="w-3/4 h-3/4 bg-gray-800 rounded-lg flex items-center justify-center">
                                                <span className="text-xs text-gray-400">Oscuro</span>
                                            </div>
                                        </div>
                                        <p className="text-center font-medium">Tema Oscuro</p>
                                    </div>
                                </div>
                            </div>
                        </TabsContent>
                        <TabsContent value="functionality" className="space-y-4 h-full">
                            <h1 className="text-2xl font-bold mb-6 text-center">Lista de mejoras por hacer </h1>
                            <div className="bg-white p-6 rounded-lg shadow-md overflow-auto">
                                <div className="flex flex-col sm:flex-row gap-4 mb-8">
                                    <div className="relative flex-grow">
                                        <input
                                            type="text"
                                            value={FolderCodeTerm}
                                            onChange={(e) => setFolderCodeTerm(e.target.value)}
                                            placeholder="Buscar trabajadores..."
                                            className="w-full pl-10 pr-10 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                                        />
                                        <FolderCode className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                                        {FolderCodeTerm && (
                                            <button
                                                onClick={clearFolderCode}
                                                className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                                            >
                                                <XCircle className="w-5 h-5" />
                                            </button>
                                        )}
                                    </div>
                                    <button
                                        onClick={handleAddEmployee}
                                        className="flex items-center justify-center gap-2 bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-lg transition-colors"
                                    >
                                        <Plus className="w-5 h-5" />
                                        <span>Añadir trabajador</span>
                                    </button>
                                </div>
                                <div className="h-full rounded-lg border border-gray-400 flex-grow pb-20 pt-20 mt-4">
                                    {[1].map((index) => (
                                        <SkeletonShinyGradient
                                            key={index}
                                            className="flex flex-col gap-5 rounded-2xl bg-black/5 p-4 dark:bg-white/5">
                                            <div className="h-24 w-full rounded-lg bg-neutral-200 dark:bg-rose-100/10" />
                                            <div className="space-y-3">
                                                <div className="h-3 w-3/5 rounded-lg bg-neutral-200 dark:bg-rose-100/10" />
                                                <h1 className="text-base lg:text-lg">Nombre del elemento a agregar {index}</h1>
                                                <p>Descripción del elemento que se desea agregar o mejorar</p>
                                                <div className="grid grid-cols-2 gap-2">
                                                    <ThumbsUp />
                                                </div>
                                            </div>
                                        </SkeletonShinyGradient>
                                    ))}
                                </div>
                            </div>
                        </TabsContent>
                    </div>
                </Tabs>
            </DialogContent>
        </Dialog>
    );
}
