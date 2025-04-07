"use client";
import { useEffect, useState } from "react";
import { Settings, FolderCode, ThumbsUp, XCircle, Plus, Pencil, CheckCircle2 } from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Dialog, DialogContent, DialogTrigger, DialogTitle } from "@/components/ui/dialog";
import { toast } from "sonner"
import { useSidebarColor } from "@/hooks/use-sidebar-color";
import PricingTables from "@/components/ui/pricing-tables";
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Functionality, functionalities } from "@/data/functionalities";
import { FunctionalityModal } from "./functionality-modal";
import { useAuth } from "@clerk/nextjs";

export function SettingsPanel() {
    const [selectedPosition, setSelectedPosition] = useState('left');
    const [, setNotifications] = useState([]);
    const [loading, setLoading] = useState(true);

    const [isModalOpen, setIsModalOpen] = useState(false);
    const [currentFunctionality, setCurrentFunctionality] = useState<Functionality | null>(null);
    const [modalMode, setModalMode] = useState<'add' | 'edit'>('add');
    const [FolderCodeTerm, setFolderCodeTerm] = useState("");
    const [functionality, setFunctionality] = useState<Functionality[]>([]);
    const [currentUserId, setCurrentUserId] = useState("user-1"); // Simulamos un ID de usuario

    const filteredFunctionality = functionality.filter(functionality =>
        functionality.nombre.toLowerCase().includes(FolderCodeTerm.toLowerCase()) ||
        functionality.descripcion.toLowerCase().includes(FolderCodeTerm.toLowerCase()) ||
        functionality.categoria?.toLowerCase().includes(FolderCodeTerm.toLowerCase())
    );

    // Función para cargar las funcionalidades desde la API
    const fetchFunctionalities = async () => {
        setLoading(true);
        try {
            const response = await fetch('/api/client/control_dash/functionality/read');
            if (!response.ok) {
                // Si la API aún no está implementada, usamos los datos locales
                setFunctionality(functionalities);
                return;
            }
            const data = await response.json();
            setFunctionality(data.functionalities);
        } catch (error) {
            console.error('Error fetching functionalities:', error);
            // Fallback a datos locales si hay un error
            setFunctionality(functionalities);
        } finally {
            setLoading(false);
        }
    };

    // Función para abrir el modal en modo añadir
    const handleAddFunctionality = () => {
        setCurrentFunctionality(null);
        setModalMode('add');
        setIsModalOpen(true);
    };

    // Función para abrir el modal en modo editar
    const handleEditFunctionality = (functionality: Functionality) => {
        setCurrentFunctionality(functionality);
        setModalMode('edit');
        setIsModalOpen(true);
    };

    // Función para guardar una funcionalidad (nueva o editada)
    const handleSaveFunctionality = (savedFunctionality: Functionality) => {
        if (modalMode === 'add') {
            setFunctionality(prev => [...prev, savedFunctionality]);
        } else {
            setFunctionality(prev => 
                prev.map(item => item.id === savedFunctionality.id ? savedFunctionality : item)
            );
        }
    };

    // Función para votar por una funcionalidad
    const handleVote = async (functionality: Functionality) => {
        try {
            const updatedFunctionality = {
                ...functionality,
                votos: functionality.votos + 1
            };
            
            const response = await fetch('/api/client/control_dash/functionality/write', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    functionality: updatedFunctionality,
                    mode: 'edit'
                }),
            });

            if (!response.ok) {
                throw new Error('Error al votar por la funcionalidad');
            }

            const data = await response.json();
            
            // Actualizar el estado local
            setFunctionality(prev => 
                prev.map(item => item.id === updatedFunctionality.id ? updatedFunctionality : item)
            );
            
            toast.success("Voto registrado correctamente");
        } catch (error) {
            console.error('Error:', error);
            toast.error("Ocurrió un error al registrar tu voto");
        }
    };

    // Función para limpiar el término de búsqueda
    const clearFolderCode = () => {
        setFolderCodeTerm("");
    };

    // Cargar funcionalidades al montar el componente
    useEffect(() => {
        fetchFunctionalities();
    }, []);


    // Obtener todas las propiedades y métodos del hook useSidebarColor
    const {
        sidebarColor,
        setSidebarColor,
        sidebarPosition,
        setSidebarPosition,
        sidebarDesign,
        setSidebarDesign,
        iconSize,
        setIconSize,
        fontStyle,
        setFontStyle,
        menuOrder,
        setMenuOrder,
    } = useSidebarColor();

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
                <button className={`flex h-10 w-10 items-center justify-center rounded-lg ${sidebarColor.toLowerCase() === '#1f2937' ? 'text-white hover:bg-gray-700' : 'text-gray-700 hover:bg-gray-100'}`}>
                    <Settings className={`h-4 w-4 ${sidebarColor.toLowerCase() === '#ffffff' ? 'text-gray-900' : sidebarColor.toLowerCase() === '#1f2937' ? 'group-hover:text-gray-900 hover:text-gray-900 text-white active:text-gray-900' : 'text-white'}`} />
                </button>
            </DialogTrigger>
            <DialogContent
                className="w-full max-w-6xl max-h-[80vh] p-4 h-auto min-h-[450px] overflow-y-auto"
                closeButton={false}>
                <DialogTitle className="sr-only">Configuraciones</DialogTitle>
                <Tabs defaultValue="all" className="w-full h-full flex flex-col">
                    <TabsList
                        className="flex w-full items-center justify-between space-x-2 shrink-0">
                        <TabsTrigger
                            value="templates_dashboard"
                            className="bg-white text-black hover:bg-white/90"
                        >Estilos Dashboard</TabsTrigger>
                        <TabsTrigger
                            value="templates_sidebar"
                            className="bg-white text-black hover:bg-white/90"
                        >Estilos Sidebar</TabsTrigger>
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
                        <TabsContent value="templates_bashboard" className="space-y-4 h-full">

                        </TabsContent>
                        <TabsContent value="templates_sidebar" className="space-y-4 h-full">
                            <h2 className="text-2xl font-bold mb-6 text-center">Personalización del Sidebar</h2>

                            {/* Sección de Temas/Colores */}
                            <div className="bg-white p-6 rounded-lg shadow-md mb-6">
                                <h3 className="text-lg font-semibold mb-4">Temas y Colores</h3>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8">
                                    <div
                                        className="border p-4 rounded-lg cursor-pointer hover:border-blue-500 transition-colors"
                                        onClick={() => {
                                            setSidebarColor('#ffffff');
                                            toast.success("Tema claro aplicado al sidebar - Iconos en negro");
                                        }}
                                    >
                                        <div className="h-24 bg-white border rounded-lg mb-2 flex items-center justify-center">
                                            <div className="w-3/4 h-3/4 bg-gray-100 rounded-lg flex items-center justify-center">
                                                <span className="text-xs text-gray-500">Claro</span>
                                            </div>
                                        </div>
                                        <p className="text-center font-medium">Tema Claro</p>
                                        <p className="text-center text-xs text-gray-500">Iconos en negro</p>
                                    </div>

                                    <div
                                        className="border p-4 rounded-lg cursor-pointer hover:border-blue-500 transition-colors"
                                        onClick={() => {
                                            setSidebarColor('#1f2937');
                                            toast.success("Tema oscuro aplicado al sidebar - Iconos en blanco");
                                        }}
                                    >
                                        <div className="h-24 bg-gray-900 border rounded-lg mb-2 flex items-center justify-center">
                                            <div className="w-3/4 h-3/4 bg-gray-800 rounded-lg flex items-center justify-center">
                                                <span className="text-xs text-gray-400">Oscuro</span>
                                            </div>
                                        </div>
                                        <p className="text-center font-medium">Tema Oscuro</p>
                                        <p className="text-center text-xs text-gray-500">Iconos en blanco</p>
                                    </div>
                                </div>

                                {/* Selector de color personalizado */}
                                <div className="mt-4">
                                    <h4 className="text-md font-medium mb-2">Color personalizado</h4>
                                    <div className="flex items-center gap-4">
                                        <input
                                            type="color"
                                            className="h-10 w-20 cursor-pointer rounded border p-1"
                                            onChange={(e) => {
                                                setSidebarColor(e.target.value);
                                                const isWhite = e.target.value.toLowerCase() === '#ffffff';
                                                toast.success(`Color personalizado aplicado - Iconos en ${isWhite ? 'negro' : 'blanco'}`);
                                            }}
                                        />
                                        <span className="text-sm text-gray-600">Selecciona un color específico</span>
                                    </div>
                                    <p className="text-xs text-gray-500 mt-2">Nota: Los iconos serán negros con fondo blanco y blancos con cualquier otro color.</p>
                                </div>
                            </div>

                            {/* Sección de Diseño/Estructura */}
                            <div className="bg-white p-6 rounded-lg shadow-md mb-6">
                                <h3 className="text-lg font-semibold mb-4">Diseño y Estructura</h3>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div
                                        className={`border p-4 rounded-lg cursor-pointer hover:border-blue-500 transition-colors ${sidebarDesign === 'compact' ? 'border-blue-500 bg-blue-50' : ''}`}
                                        onClick={() => {
                                            setSidebarDesign('compact');
                                            toast.success("Diseño compacto aplicado al sidebar");
                                        }}
                                    >
                                        <div className="h-24 border rounded-lg mb-2 flex items-center justify-center">
                                            <div className="w-1/4 h-full bg-gray-200 rounded-l-lg"></div>
                                            <div className="w-3/4 h-full flex items-center justify-center">
                                                <span className="text-xs text-gray-500">Compacto</span>
                                            </div>
                                        </div>
                                        <p className="text-center font-medium">Diseño Compacto</p>
                                    </div>

                                    <div
                                        className={`border p-4 rounded-lg cursor-pointer hover:border-blue-500 transition-colors ${sidebarDesign === 'expanded' ? 'border-blue-500 bg-blue-50' : ''}`}
                                        onClick={() => {
                                            setSidebarDesign('expanded');
                                            toast.success("Diseño expandido aplicado al sidebar");
                                        }}
                                    >
                                        <div className="h-24 border rounded-lg mb-2 flex items-center justify-center">
                                            <div className="w-1/3 h-full bg-gray-200 rounded-l-lg"></div>
                                            <div className="w-2/3 h-full flex items-center justify-center">
                                                <span className="text-xs text-gray-500">Expandido</span>
                                            </div>
                                        </div>
                                        <p className="text-center font-medium">Diseño Expandido</p>
                                    </div>
                                </div>
                            </div>

                            {/* Sección de Iconografía/Tipografía */}
                            <div className="bg-white p-6 rounded-lg shadow-md mb-6">
                                <h3 className="text-lg font-semibold mb-4">Iconografía y Tipografía</h3>
                                <div className="space-y-4">
                                    <div>
                                        <h4 className="text-md font-medium mb-2">Tamaño de iconos</h4>
                                        <div className="flex flex-col gap-4">
                                            <input
                                                type="range"
                                                min="1"
                                                max="3"
                                                step="1"
                                                value={iconSize === 'small' ? 1 : iconSize === 'medium' ? 2 : 3}
                                                onChange={(e) => {
                                                    const value = parseInt(e.target.value);
                                                    const size = value === 1 ? 'small' : value === 2 ? 'medium' : 'large';
                                                    setIconSize(size);
                                                    toast.success(`Tamaño de iconos: ${size}`);
                                                }}
                                                className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer"
                                            />
                                            <div className="flex justify-between w-full">
                                                <span className={`text-sm ${iconSize === 'small' ? 'text-blue-600 font-medium' : 'text-gray-600'}`}>Pequeño</span>
                                                <span className={`text-sm ${iconSize === 'medium' ? 'text-blue-600 font-medium' : 'text-gray-600'}`}>Mediano</span>
                                                <span className={`text-sm ${iconSize === 'large' ? 'text-blue-600 font-medium' : 'text-gray-600'}`}>Grande</span>
                                            </div>
                                        </div>
                                    </div>

                                    <div>
                                        <h4 className="text-md font-medium mb-2">Estilo de fuente</h4>
                                        <div className="grid grid-cols-2 gap-2">
                                            <div
                                                className={`border p-2 rounded-lg cursor-pointer hover:border-blue-500 transition-colors ${fontStyle === 'regular' ? 'border-blue-500 bg-blue-50' : ''}`}
                                                onClick={() => {
                                                    setFontStyle('regular');
                                                    toast.success("Estilo de fuente: Regular");
                                                }}
                                            >
                                                <p className="text-center font-normal">Regular</p>
                                            </div>
                                            <div
                                                className={`border p-2 rounded-lg cursor-pointer hover:border-blue-500 transition-colors ${fontStyle === 'medium' ? 'border-blue-500 bg-blue-50' : ''}`}
                                                onClick={() => {
                                                    setFontStyle('medium');
                                                    toast.success("Estilo de fuente: Medium");
                                                }}
                                            >
                                                <p className="text-center font-medium">Medium</p>
                                            </div>
                                            <div
                                                className={`border p-2 rounded-lg cursor-pointer hover:border-blue-500 transition-colors ${fontStyle === 'semibold' ? 'border-blue-500 bg-blue-50' : ''}`}
                                                onClick={() => {
                                                    setFontStyle('semibold');
                                                    toast.success("Estilo de fuente: Semibold");
                                                }}
                                            >
                                                <p className="text-center font-semibold">Semibold</p>
                                            </div>
                                            <div
                                                className={`border p-2 rounded-lg cursor-pointer hover:border-blue-500 transition-colors ${fontStyle === 'bold' ? 'border-blue-500 bg-blue-50' : ''}`}
                                                onClick={() => {
                                                    setFontStyle('bold');
                                                    toast.success("Estilo de fuente: Bold");
                                                }}
                                            >
                                                <p className="text-center font-bold">Bold</p>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Sección de Orden/Visibilidad */}
                            <div className="bg-white p-6 rounded-lg shadow-md">
                                <h3 className="text-lg font-semibold mb-4">Orden de Elementos del Menú</h3>
                                <p className="text-sm text-gray-500 mb-4">Puedes cambiar el orden de los elementos del menú usando los botones de arriba y abajo.</p>

                                {/* Lista de elementos del menú con controles de ordenamiento */}
                                <div className="space-y-4">
                                    {menuOrder.map((item, index) => (
                                        <div key={item} className="flex justify-between items-center p-3 border rounded-lg hover:bg-gray-50 transition-colors">
                                            <div className="flex items-center gap-2">
                                                <div className="w-6 h-6 bg-blue-100 text-blue-700 rounded-full flex items-center justify-center font-medium">{index + 1}</div>
                                                <span className="font-medium">{item}</span>
                                            </div>
                                            <div className="flex items-center gap-2">
                                                <button
                                                    className={`p-2 rounded-full ${index === 0 ? 'text-gray-300 cursor-not-allowed' : 'text-blue-600 hover:bg-blue-100'}`}
                                                    onClick={() => {
                                                        if (index > 0) {
                                                            const newOrder = [...menuOrder];
                                                            [newOrder[index], newOrder[index - 1]] = [newOrder[index - 1], newOrder[index]];
                                                            setMenuOrder(newOrder);
                                                            toast.success(`${item} movido hacia arriba`);
                                                        }
                                                    }}
                                                    disabled={index === 0}
                                                    aria-label="Mover hacia arriba"
                                                    title="Mover hacia arriba"
                                                >
                                                    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m18 15-6-6-6 6" /></svg>
                                                </button>
                                                <button
                                                    className={`p-2 rounded-full ${index === menuOrder.length - 1 ? 'text-gray-300 cursor-not-allowed' : 'text-blue-600 hover:bg-blue-100'}`}
                                                    onClick={() => {
                                                        if (index < menuOrder.length - 1) {
                                                            const newOrder = [...menuOrder];
                                                            [newOrder[index], newOrder[index + 1]] = [newOrder[index + 1], newOrder[index]];
                                                            setMenuOrder(newOrder);
                                                            toast.success(`${item} movido hacia abajo`);
                                                        }
                                                    }}
                                                    disabled={index === menuOrder.length - 1}
                                                    aria-label="Mover hacia abajo"
                                                    title="Mover hacia abajo"
                                                >
                                                    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m6 9 6 6 6-6" /></svg>
                                                </button>
                                            </div>
                                        </div>
                                    ))}
                                </div>

                                {/* Mensaje informativo */}
                                <div className="mt-6 p-4 bg-blue-50 rounded-lg border border-blue-100">
                                    <p className="text-sm text-blue-700">
                                        <strong>Nota:</strong> Los cambios en el orden se aplicarán inmediatamente al sidebar.
                                        Todos los elementos del menú se mostrarán según el orden establecido.
                                    </p>
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
                                            placeholder="Buscar funcionalidades..."
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
                                        onClick={handleAddFunctionality}
                                        className="flex items-center justify-center gap-2 bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-lg transition-colors"
                                    >
                                        <Plus className="w-5 h-5" />
                                        <span>Añadir funcionalidad</span>
                                    </button>
                                </div>
                                <div className="h-full rounded-lg border border-gray-400 flex-grow pb-10 pt-10 mt-4 overflow-y-auto">
                                    {loading ? (
                                        <div className="flex items-center justify-center h-40">
                                            <p className="text-gray-500">Cargando funcionalidades...</p>
                                        </div>
                                    ) : filteredFunctionality.length === 0 ? (
                                        <div className="flex flex-col items-center justify-center h-full p-8">
                                            <p className="text-gray-500 mb-4">No se encontraron funcionalidades</p>
                                            <Button onClick={handleAddFunctionality} variant="outline">
                                                <Plus className="mr-2 h-4 w-4" />
                                                Añadir nueva funcionalidad
                                            </Button>
                                        </div>
                                    ) : (
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 p-4">
                                            {filteredFunctionality.map((item) => (
                                                <div
                                                    key={item.id}
                                                    className="bg-white border rounded-xl shadow-sm p-5 hover:shadow-md transition-shadow"
                                                >
                                                    <div className="flex justify-between items-start mb-2">
                                                        <h3 className="text-lg font-semibold">{item.nombre}</h3>
                                                        {item.creadorId === currentUserId && (
                                                            <Button 
                                                                variant="ghost" 
                                                                size="sm"
                                                                onClick={(e) => {
                                                                    e.stopPropagation();
                                                                    handleEditFunctionality(item);
                                                                }}
                                                            >
                                                                <Pencil className="h-4 w-4" />
                                                            </Button>
                                                        )}
                                                    </div>
                                                    <div className="flex items-center gap-2 mb-2">
                                                        <span className="text-xs px-2 py-1 bg-blue-100 text-blue-800 rounded-full">
                                                            {item.categoria || 'Sin categoría'}
                                                        </span>
                                                        <span className="text-xs text-gray-500">
                                                            {item.votos} {item.votos === 1 ? 'voto' : 'votos'}
                                                        </span>
                                                    </div>
                                                    <p className="text-gray-600 mb-4">{item.descripcion}</p>
                                                    
                                                    <div className="mb-4">
                                                        <div className="flex justify-between items-center mb-1">
                                                            <span className="text-sm font-medium">Progreso</span>
                                                            <span className="text-sm font-medium">{item.progreso}%</span>
                                                        </div>
                                                        <Progress value={item.progreso} className="h-2" />
                                                    </div>
                                                    
                                                    {item.tareas && item.tareas.length > 0 && (
                                                        <div className="mb-4">
                                                            <h4 className="text-sm font-semibold mb-2">Tareas</h4>
                                                            <ul className="space-y-1">
                                                                {item.tareas.map(tarea => (
                                                                    <li key={tarea.id} className="flex items-start gap-2">
                                                                        <div className="mt-0.5">
                                                                            {tarea.completada ? (
                                                                                <CheckCircle2 className="h-4 w-4 text-green-500" />
                                                                            ) : (
                                                                                <div className="h-4 w-4 rounded-full border border-gray-300" />
                                                                            )}
                                                                        </div>
                                                                        <span className={`text-sm ${tarea.completada ? 'line-through text-gray-400' : 'text-gray-700'}`}>
                                                                            {tarea.descripcion}
                                                                        </span>
                                                                    </li>
                                                                ))}
                                                            </ul>
                                                        </div>
                                                    )}
                                                    
                                                    <div className="flex justify-end">
                                                        <Button 
                                                            variant="outline" 
                                                            size="sm"
                                                            onClick={(e) => {
                                                                e.stopPropagation();
                                                                handleVote(item);
                                                            }}
                                                        >
                                                            <ThumbsUp className="h-4 w-4 mr-2" />
                                                            Votar
                                                        </Button>
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    )}
                                </div>
                            </div>
                            
                            {/* Modal para añadir/editar funcionalidades */}
                            <FunctionalityModal 
                                isOpen={isModalOpen}
                                onClose={() => setIsModalOpen(false)}
                                functionality={currentFunctionality}
                                mode={modalMode}
                                onSave={handleSaveFunctionality}
                                currentUserId={currentUserId}
                            />
                        </TabsContent>
                    </div>
                </Tabs>
            </DialogContent>
        </Dialog>
    );
}
