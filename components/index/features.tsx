"use client";

import React, { useEffect, useState, Suspense } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { BarChart3, Package, TrendingUp, Users, Search, Bell, Settings, ChevronDown, ChevronLeft, ChevronRight } from "lucide-react";
import { useUser } from "@clerk/nextjs";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import dynamic from 'next/dynamic';

const UserButton = dynamic(
    () => import("@clerk/nextjs").then((mod) => mod.UserButton),
    {
        ssr: false,
        loading: () => <div className="w-8 h-8 rounded-full bg-secondary/20 animate-pulse" />
    }
);


export function Features() {
    const { isLoaded, isSignedIn, user } = useUser();
    const [inView, setInView] = useState(false);
    const [selectedTimeframe, setSelectedTimeframe] = useState("weekly");
    const [currentDate, setCurrentDate] = useState(new Date());
    const [currentMonth, setCurrentMonth] = useState(new Date());
    const [currentSlide, setCurrentSlide] = useState(0); // Para Social Media Analytics
    const [featuresSlide, setFeaturesSlide] = useState(0); // Nueva variable para Próximas Funcionalidades
    const [companies, setCompanies] = useState<Array<{
        name: string;
        email: string;
        inventoryCount: number;
        totalValue: number;
    }>>([]);

    // Eventos de ejemplo - en una aplicación real, estos vendrían de una API
    const userEvents = {
        // Formato: "YYYY-MM-DD": ["Evento 1", "Evento 2"]
        "2023-11-08": ["Reunión con cliente a las 10:00", "Entrega de proyecto a las 15:00"],
        "2023-11-15": ["Llamada con equipo de desarrollo", "Revisión de sprint"],
        "2023-11-22": ["Presentación de resultados trimestrales"]
    };
    // Efecto para el carrusel automático
    useEffect(() => {
        const handleCarouselAutoplay = () => {
            const carousel = document.getElementById('socialMediaCarousel');
            const indicators = [
                document.getElementById('indicator-0'),
                document.getElementById('indicator-1'),
                document.getElementById('indicator-2')
            ];

            if (!carousel) return;

            setCurrentSlide((prev) => {
                const next = (prev + 1) % 3;

                carousel.scrollTo({
                    left: next * carousel.offsetWidth,
                    behavior: 'smooth'
                });

                indicators.forEach((indicator, index) => {
                    if (indicator) {
                        indicator.className = `w-1.5 h-1.5 rounded-full ${index === next ? 'bg-primary' : 'bg-secondary/50'}`;
                    }
                });

                return next;
            });
        };

        const interval = setInterval(handleCarouselAutoplay, 3000);
        return () => clearInterval(interval);
    }, []);

    useEffect(() => {
        const section = document.getElementById("features");
        if (!section) return;

        const observer = new IntersectionObserver(
            (entries) => {
                entries.forEach((entry) => {
                    setInView(entry.isIntersecting);
                    window.dispatchEvent(
                        new CustomEvent("featuresInView", { detail: entry.isIntersecting })
                    );
                });
            },
            { threshold: 0.5 }
        );

        observer.observe(section);
        return () => {
            observer.unobserve(section);
        };
    }, []);

    // Función para obtener los días del mes actual
    const getDaysInMonth = (year: number, month: number) => {
        return new Date(year, month + 1, 0).getDate();
    };

    // Función para obtener el primer día de la semana del mes
    const getFirstDayOfMonth = (year: number, month: number) => {
        return new Date(year, month, 1).getDay();
    };

    // Navegar al mes anterior
    const prevMonth = () => {
        setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() - 1, 1));
    };

    // Navegar al mes siguiente
    const nextMonth = () => {
        setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1, 1));
    };

    // Formatear fecha como YYYY-MM-DD para buscar eventos
    const formatDateKey = (date: Date) => {
        return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`;
    };

    // Generar días del calendario
    const generateCalendarDays = () => {
        const year = currentMonth.getFullYear();
        const month = currentMonth.getMonth();
        const daysInMonth = getDaysInMonth(year, month);
        const firstDay = getFirstDayOfMonth(year, month);

        const days = [];

        // Días del mes anterior para completar la primera semana
        for (let i = 0; i < firstDay; i++) {
            days.push({ day: null, isCurrentMonth: false });
        }

        // Días del mes actual
        for (let i = 1; i <= daysInMonth; i++) {
            const date = new Date(year, month, i);
            const dateKey = formatDateKey(date);
            days.push({
                day: i,
                isCurrentMonth: true,
                isToday:
                    date.getDate() === currentDate.getDate() &&
                    date.getMonth() === currentDate.getMonth() &&
                    date.getFullYear() === currentDate.getFullYear(),
                hasEvent: isSignedIn && userEvents[dateKey] ? true : false,
                events: userEvents[dateKey] || [],
                dateKey
            });
        }

        return days;
    };

    // Obtener nombre del mes
    const getMonthName = (date: Date) => {
        return date.toLocaleString('en-US', { month: 'long' });
    };

    return (
        <div className="container mx-auto px-4 md:px-8 lg:px-16 max-w-6xl">
            {/* Header section with title and subtitle */}
            <div className="text-center mb-8 mt-6">
                <h1 className="text-3xl font-bold mb-1">
                    <span className="text-muted-foreground">Powerful dashboard</span> <span className="text-white">for</span>
                </h1>
                <h2 className="text-3xl font-bold bg-gradient-to-r from-indigo-500 to-purple-500 bg-clip-text text-transparent">
                    Sales & Engagement
                </h2>
                <p className="text-muted-foreground mt-3 max-w-xl mx-auto text-sm">
                    Track changes in income over time and access detailed data on
                    each project, sales, and payments received
                </p>
            </div>

            {/* Navigation bar */}
            <div className="flex justify-between items-center mb-6 bg-background/30 rounded-lg p-2">
                <div className="flex items-center gap-1">
                    <div className="w-6 h-6 rounded-full bg-primary/20 flex items-center justify-center">
                        <div className="w-4 h-4 rounded-full bg-primary"></div>
                    </div>
                    <div className="flex items-center gap-4 ml-4">
                        <Button variant="ghost" size="sm" className="flex items-center gap-1 bg-secondary/20 text-xs">
                            <span>Home</span>
                        </Button>
                        <Button variant="ghost" size="sm" className="text-xs">Analytics</Button>                        <Button variant="ghost" size="sm" className="text-xs">Product</Button>
                        <Button variant="ghost" size="sm" className="text-xs">Customers</Button>
                    </div>
                </div>

                <div className="flex items-center gap-3">
                    <div className="relative">
                        <Search className="absolute left-2 top-1/2 transform -translate-y-1/2 h-3 w-3 text-muted-foreground" />
                        <input
                            type="text"
                            className="bg-secondary/20 rounded-md pl-7 pr-3 py-1 text-xs focus:outline-none focus:ring-1 focus:ring-primary w-28"
                        />
                    </div>
                    <Button variant="ghost" size="sm" className="h-7 w-7">
                        <Bell className="h-4 w-4" />
                    </Button>
                    <Button variant="ghost" size="sm" className="h-7 w-7">
                        <Settings className="h-4 w-4" />
                    </Button>
                    {isLoaded && <UserButton afterSignOutUrl="/" />}
                </div>
            </div>

            {/* Main dashboard container */}
            <div className="grid grid-cols-auto grid-rows-auto gap-3">
                {/* Total sales chart section */}
                <div className="col-span-3 row-span-5 col-start-2 row-start-2 bg-background/95 rounded-xl p-4 dark:shadow-container-dark shadow-container-light border dark:border-container-border-dark border-container-border-light">
                    <div className="flex items-center justify-between mb-3">
                        <div className="flex items-center gap-2">
                            <div className="p-1.5 bg-primary/10 rounded-md">
                                <BarChart3 className="h-4 w-4 text-primary" />
                            </div>
                            <h2 className="text-sm font-semibold">Total sales</h2>
                        </div>
                        <div className="flex items-center gap-2">
                            <Button variant="outline" size="sm" className="text-xs h-7 flex items-center gap-1">
                                Weekly <ChevronDown className="h-3 w-3" />
                            </Button>
                            <span className="text-sm font-bold text-primary">${isSignedIn ? "17,495.79" : "0.00"}</span>
                        </div>
                    </div>

                    <div className="mt-4">
                        <div className="text-3xl font-bold">{isSignedIn ? "3.6%" : "0%"}</div>
                        <div className="text-xs text-muted-foreground">This week's Sales is higher than last week's</div>
                    </div>

                    <div className="h-[calc(100%-8rem)] mt-4 relative">
                        {/* Bar chart visualization */}
                        <div className="flex items-end justify-between h-full w-full">
                            {[
                                { week: '01 W', value: 1250, users: 42 },
                                { week: '02 W', value: 1680, users: 56 },
                                { week: '03 W', value: 2100, users: 70 },
                                { week: '04 W', value: 3687, users: 123 },
                                { week: '05 W', value: 2940, users: 98 },
                                { week: '06 W', value: 3210, users: 107 }
                            ].map((data, i) => {
                                // Calcular altura proporcional basada en el valor máximo (3687)
                                const maxValue = 3687;
                                const heightPercentage = isSignedIn ? (data.value / maxValue) * 100 : 0;

                                return (
                                    <div key={i} className="flex flex-col items-center flex-1 mx-1">
                                        <div className="w-full relative group">
                                            <div
                                                className={`w-full rounded-t-md ${i === 3 ? 'bg-primary' : 'bg-secondary/30'}`}
                                                style={{ height: `${heightPercentage}%` }}
                                            ></div>
                                            <div className="absolute opacity-0 group-hover:opacity-100 bottom-full mb-2 left-1/2 transform -translate-x-1/2 bg-background/90 p-1.5 rounded-md shadow-md text-xs transition-opacity duration-200 whitespace-nowrap z-10">
                                                {/* <p className="font-medium">${data.value.toLocaleString()}</p> */}
                                                <p className="text-muted-foreground">{data.users} users</p>
                                            </div>
                                        </div>
                                        <span className="text-xs mt-1 text-muted-foreground">{data.week}</span>
                                    </div>
                                );
                            })}
                        </div>
                        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 text-xs font-medium">
                            ${isSignedIn ? "3,687" : "0"}
                        </div>
                    </div>
                </div>
                {/* Our Performance section */}
                <div className="col-span-3 row-span-2 col-start-2 row-start-7 bg-background/95 rounded-xl p-4 dark:shadow-container-dark shadow-container-light border dark:border-container-border-dark border-container-border-light">
                    <div className="flex items-center justify-between mb-3">
                        <h2 className="text-sm font-semibold">Our Performance</h2>
                        <Button variant="link" size="sm" className="text-xs text-primary p-0">
                            See all
                        </Button>
                    </div>

                    <div className="grid grid-cols-2 gap-3 mt-2 h-[calc(100%-2rem)]">
                        <Card className="p-3 flex flex-col justify-between h-full">
                            <div className="flex items-center gap-2">
                                <div className="p-1.5 bg-primary/10 rounded-md">
                                    <Package className="h-5 w-5 text-primary" />
                                </div>
                                <span className="text-xs font-medium">Total Stores</span>
                            </div>
                            <div className="mt-2">
                                <div className="text-lg font-bold">{isSignedIn ? "18,224" : "0"}</div>
                                <div className="text-xs text-green-500 flex items-center">
                                    +8% <TrendingUp className="h-3 w-3 ml-1" />
                                    <span className="text-muted-foreground ml-1">vs last week</span>
                                </div>
                            </div>
                        </Card>

                        <Card className="p-3 flex flex-col justify-between h-full">
                            <div className="flex items-center gap-2">
                                <div className="p-1.5 bg-primary/10 rounded-md">
                                    <Users className="h-5 w-5 text-primary" />
                                </div>
                                <span className="text-xs font-medium">Active Users</span>
                            </div>
                            <div className="mt-2">
                                <div className="text-lg font-bold">{isSignedIn ? "857" : "0"}</div>
                                <div className="text-xs text-green-500 flex items-center">
                                    +11% <TrendingUp className="h-3 w-3 ml-1" />
                                    <span className="text-muted-foreground ml-1">vs last week</span>
                                </div>
                            </div>
                        </Card>
                    </div>
                </div>

                {/* Customers list section */}
                <div className="col-span-2 row-span-4 col-start-5 row-start-2 bg-background/95 rounded-xl p-4 dark:shadow-container-dark shadow-container-light border dark:border-container-border-dark border-container-border-light">
                    <div className="flex items-center justify-between mb-3">
                        <h2 className="text-sm font-semibold">Empresas con Inventarios</h2>
                        <Button variant="ghost" size="sm" className="h-6 w-6 p-0">
                            <svg width="15" height="15" viewBox="0 0 15 15" fill="none" xmlns="http://www.w3.org/2000/svg">
                                <path d="M3.625 7.5C3.625 8.12 3.12 8.625 2.5 8.625C1.88 8.625 1.375 8.12 1.375 7.5C1.375 6.88 1.88 6.375 2.5 6.375C3.12 6.375 3.625 6.88 3.625 7.5ZM8.625 7.5C8.625 8.12 8.12 8.625 7.5 8.625C6.88 8.625 6.375 8.12 6.375 7.5C6.375 6.88 6.88 6.375 7.5 6.375C8.12 6.375 8.625 6.88 8.625 7.5ZM13.625 7.5C13.625 8.12 13.12 8.625 12.5 8.625C11.88 8.625 11.375 8.12 11.375 7.5C11.375 6.88 11.88 6.375 12.5 6.375C13.12 6.375 13.625 6.88 13.625 7.5Z" fill="currentColor" />
                            </svg>
                        </Button>
                    </div>

                    <div className="flex justify-between text-xs text-muted-foreground mb-2 px-1">
                        <span>Empresa</span>
                        <span>Inventarios</span>
                        <span>Valor Total</span>
                    </div>

                    <div className="space-y-3 mt-3">
                        {isSignedIn ? (
                            companies.length > 0 ? (
                                companies.map((company, i) => (
                                    <div key={i} className="flex items-center justify-between">
                                        <div className="flex items-center gap-2">
                                            <div className="w-7 h-7 rounded-full bg-primary/20 flex items-center justify-center">
                                                <span className="text-xs font-bold text-primary">
                                                    {company.name.charAt(0).toUpperCase()}
                                                </span>
                                            </div>
                                            <div>
                                                <div className="text-xs font-medium">{company.name}</div>
                                                <div className="text-xs text-muted-foreground">{company.email}</div>
                                            </div>
                                        </div>
                                        <div className="text-xs">{company.inventoryCount}</div>
                                        <div className="text-xs">${company.totalValue.toLocaleString()}</div>
                                    </div>
                                ))
                            ) : (
                                <div className="flex flex-col items-center justify-center py-6 text-center">
                                    <Package className="h-8 w-8 text-muted-foreground mb-2" />
                                    <p className="text-sm text-muted-foreground">No hay empresas con inventarios</p>
                                    <p className="text-xs text-muted-foreground mt-1">
                                        Crea tu primer inventario para comenzar
                                    </p>
                                </div>
                            )
                        ) : (
                            <div className="flex flex-col items-center justify-center py-6 text-center">
                                <Package className="h-8 w-8 text-muted-foreground mb-2" />
                                <p className="text-sm text-muted-foreground">Inicia sesión para ver empresas</p>
                            </div>
                        )}
                    </div>
                </div>

                {/* Orders by time section */}
                <div className="col-span-2 row-span-3 col-start-5 row-start-6 bg-background/95 rounded-xl p-4 dark:shadow-container-dark shadow-container-light border dark:border-container-border-dark border-container-border-light">
                    <div className="flex items-center justify-between mb-3">
                        <h2 className="text-sm font-semibold">Orders by time</h2>
                        <div className="flex items-center gap-2">
                            <Button
                                variant="ghost"
                                size="sm"
                                className="h-6 w-6 p-0"
                                onClick={prevMonth}
                            >
                                <ChevronLeft className="h-4 w-4" />
                            </Button>
                            <span className="text-xs">
                                {getMonthName(currentMonth)} {currentMonth.getFullYear()}
                            </span>
                            <Button
                                variant="ghost"
                                size="sm"
                                className="h-6 w-6 p-0"
                                onClick={nextMonth}
                            >
                                <ChevronRight className="h-4 w-4" />
                            </Button>
                        </div>
                    </div>

                    <div className="mt-2">
                        {/* Calendar header */}
                        <div className="grid grid-cols-7 gap-1 text-center text-xs mb-2">
                            {['S', 'M', 'T', 'W', 'T', 'F', 'S'].map((day, i) => (
                                <div key={i} className="font-medium text-muted-foreground">{day}</div>
                            ))}
                        </div>

                        {/* Calendar grid */}
                        <div className="grid grid-cols-7 gap-1">
                            <TooltipProvider>
                                {generateCalendarDays().map((day, i) => (
                                    day.hasEvent ? (
                                        <Tooltip key={i}>
                                            <TooltipTrigger asChild>
                                                <div
                                                    className={`
                                                        aspect-square rounded-sm flex items-center justify-center text-xs cursor-pointer
                                                        ${!day.isCurrentMonth ? 'text-muted-foreground/50' : ''}
                                                        ${day.isToday ? 'bg-[#ce9e50] text-white font-medium' :
                                                            day.hasEvent ? 'bg-[#5080ce]/20 dark:bg-[#5080ce]/40 text-foreground' :
                                                                day.isCurrentMonth ? 'bg-secondary/10 dark:bg-secondary/20' : 'bg-transparent'}
                                                    `}
                                                >
                                                    {day.day}
                                                </div>
                                            </TooltipTrigger>
                                            <TooltipContent>
                                                <div className="p-1">
                                                    <p className="font-medium text-xs mb-1">Eventos para {day.day}/{currentMonth.getMonth() + 1}</p>
                                                    <ul className="text-xs space-y-1">
                                                        {day.events.map((event, idx) => (
                                                            <li key={idx} className="flex items-center">
                                                                <div className="w-1.5 h-1.5 rounded-full bg-[#5080ce] mr-1.5"></div>
                                                                {event}
                                                            </li>
                                                        ))}
                                                    </ul>
                                                </div>
                                            </TooltipContent>
                                        </Tooltip>
                                    ) : (
                                        <div
                                            key={i}
                                            className={`
                                                aspect-square rounded-sm flex items-center justify-center text-xs
                                                ${!day.isCurrentMonth ? 'text-muted-foreground/50' : ''}
                                                ${day.isToday ? 'bg-[#ce9e50] text-white font-medium' :
                                                    day.isCurrentMonth ? 'bg-secondary/10 dark:bg-secondary/20' : 'bg-transparent'}
                                            `}
                                        >
                                            {day.day}
                                        </div>
                                    )
                                ))}
                            </TooltipProvider>
                        </div>

                        {/* Activity indicators */}
                        <div className="mt-4 flex items-center justify-between px-2">
                            <div className="flex items-center gap-2">
                                <div className="w-2 h-2 rounded-full bg-[#ce9e50]"></div>
                                <span className="text-xs text-muted-foreground">Hoy</span>
                            </div>
                            <div className="flex items-center gap-2">
                                <div className="w-2 h-2 rounded-full bg-[#5080ce]/40"></div>
                                <span className="text-xs text-muted-foreground">Eventos</span>
                            </div>
                        </div>
                    </div>
                </div>


                {/* Upcoming Features section (previously Recent Orders) */}
                <div className="col-span-2 row-span-5 col-start-7 row-start-2 bg-background/95 rounded-xl p-4 dark:shadow-container-dark shadow-container-light border dark:border-container-border-dark border-container-border-light">
                    <div className="flex items-center justify-between mb-3">
                        <h2 className="text-sm font-semibold">Próximas Funcionalidades</h2>
                        <Button variant="link" size="sm" className="text-xs text-primary p-0">
                            Ver todas
                        </Button>
                    </div>

                    {/* Carousel container */}
                    <div className="relative mt-2 h-[calc(100%-5.5rem)]">
                        {/* Features cards container */}
                        <div
                            id="featuresCarousel"
                            className="flex overflow-x-hidden h-full snap-x snap-mandatory scrollbar-hide"
                            style={{ scrollBehavior: 'smooth' }}
                        >
                            {/* Page 1 */}
                            <div className="min-w-full snap-center h-full">
                                <div className="space-y-4 h-full overflow-y-auto pr-1 pb-2">
                                    {/* AI-powered Inventory Analysis */}
                                    <div className="flex items-start gap-3 p-2 rounded-lg bg-gradient-to-r from-indigo-500/10 to-purple-500/10 border border-indigo-500/20">
                                        <div className="p-2 bg-indigo-500/20 rounded-md mt-0.5">
                                            <svg className="h-4 w-4 text-indigo-500" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                                                <path d="M12 3C7.02944 3 3 7.02944 3 12C3 16.9706 7.02944 21 12 21C16.9706 21 21 16.9706 21 12C21 7.02944 16.9706 3 12 3Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                                                <path d="M12 8V16" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                                                <path d="M8 12H16" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                                            </svg>
                                        </div>
                                        <div>
                                            <div className="text-xs font-medium">Análisis de Inventario con IA</div>
                                            <div className="text-xs text-muted-foreground mt-1">
                                                Predicción inteligente de stock, detección de patrones de consumo y recomendaciones automáticas de reabastecimiento.
                                            </div>
                                            <div className="mt-2 flex items-center">
                                                <div className="h-1.5 w-1.5 rounded-full bg-amber-500 mr-1.5"></div>
                                                <span className="text-xs text-amber-500">En desarrollo</span>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Smart Dashboard */}
                                    <div className="flex items-start gap-3 p-2 rounded-lg bg-gradient-to-r from-blue-500/10 to-cyan-500/10 border border-blue-500/20">
                                        <div className="p-2 bg-blue-500/20 rounded-md mt-0.5">
                                            <svg className="h-4 w-4 text-blue-500" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                                                <rect x="3" y="3" width="18" height="18" rx="2" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                                                <path d="M3 9H21" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                                                <path d="M9 21V9" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                                            </svg>
                                        </div>
                                        <div>
                                            <div className="text-xs font-medium">Dashboard Inteligente</div>
                                            <div className="text-xs text-muted-foreground mt-1">
                                                Interfaz adaptativa que muestra información relevante según el comportamiento del usuario y prioridades del negocio.
                                            </div>
                                            <div className="mt-2 flex items-center">
                                                <div className="h-1.5 w-1.5 rounded-full bg-green-500 mr-1.5"></div>
                                                <span className="text-xs text-green-500">Próximamente</span>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Page 2 */}
                            <div className="min-w-full snap-center h-full">
                                <div className="space-y-4 h-full overflow-y-auto pr-1 pb-2">
                                    {/* Multi-channel Integration */}
                                    <div className="flex items-start gap-3 p-2 rounded-lg bg-gradient-to-r from-green-500/10 to-emerald-500/10 border border-green-500/20">
                                        <div className="p-2 bg-green-500/20 rounded-md mt-0.5">
                                            <svg className="h-4 w-4 text-green-500" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                                                <path d="M8 10H4V20H8V10Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                                                <path d="M14 4H10V20H14V4Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                                                <path d="M20 15H16V20H20V15Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                                            </svg>
                                        </div>
                                        <div>
                                            <div className="text-xs font-medium">Integración Multicanal</div>
                                            <div className="text-xs text-muted-foreground mt-1">
                                                Conecta tu inventario con múltiples plataformas de venta online y sincroniza automáticamente el stock en tiempo real.
                                            </div>
                                            <div className="mt-2 flex items-center">
                                                <div className="h-1.5 w-1.5 rounded-full bg-amber-500 mr-1.5"></div>
                                                <span className="text-xs text-amber-500">En desarrollo</span>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Advanced Analytics */}
                                    <div className="flex items-start gap-3 p-2 rounded-lg bg-gradient-to-r from-purple-500/10 to-violet-500/10 border border-purple-500/20">
                                        <div className="p-2 bg-purple-500/20 rounded-md mt-0.5">
                                            <svg className="h-4 w-4 text-purple-500" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                                                <path d="M21 21H3V3" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                                                <path d="M21 9L15 3L9 9L3 3" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                                            </svg>
                                        </div>
                                        <div>
                                            <div className="text-xs font-medium">Analítica Avanzada</div>
                                            <div className="text-xs text-muted-foreground mt-1">
                                                Reportes detallados con métricas clave, tendencias de ventas y análisis predictivo para optimizar tu negocio.
                                            </div>
                                            <div className="mt-2 flex items-center">
                                                <div className="h-1.5 w-1.5 rounded-full bg-green-500 mr-1.5"></div>
                                                <span className="text-xs text-green-500">Próximamente</span>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Page 3 */}
                            <div className="min-w-full snap-center h-full">
                                <div className="space-y-4 h-full overflow-y-auto pr-1 pb-2">
                                    {/* Mobile App */}
                                    <div className="flex items-start gap-3 p-2 rounded-lg bg-gradient-to-r from-orange-500/10 to-amber-500/10 border border-orange-500/20">
                                        <div className="p-2 bg-orange-500/20 rounded-md mt-0.5">
                                            <svg className="h-4 w-4 text-orange-500" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                                                <rect x="5" y="2" width="14" height="20" rx="2" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                                                <path d="M12 18H12.01" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                                            </svg>
                                        </div>
                                        <div>
                                            <div className="text-xs font-medium">Aplicación Móvil</div>
                                            <div className="text-xs text-muted-foreground mt-1">
                                                Gestiona tu inventario desde cualquier lugar con nuestra app móvil. Escaneo de códigos de barras y notificaciones en tiempo real.
                                            </div>
                                            <div className="mt-2 flex items-center">
                                                <div className="h-1.5 w-1.5 rounded-full bg-amber-500 mr-1.5"></div>
                                                <span className="text-xs text-amber-500">En desarrollo</span>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Customer Portal */}
                                    <div className="flex items-start gap-3 p-2 rounded-lg bg-gradient-to-r from-teal-500/10 to-cyan-500/10 border border-teal-500/20">
                                        <div className="p-2 bg-teal-500/20 rounded-md mt-0.5">
                                            <svg className="h-4 w-4 text-teal-500" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                                                <path d="M17 21V19C17 16.7909 15.2091 15 13 15H5C2.79086 15 1 16.7909 1 19V21" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                                                <path d="M9 11C11.2091 11 13 9.20914 13 7C13 4.79086 11.2091 3 9 3C6.79086 3 5 4.79086 5 7C5 9.20914 6.79086 11 9 11Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                                                <path d="M23 21V19C22.9986 17.1771 21.765 15.5857 20 15.13" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                                                <path d="M16 3.13C17.7699 3.58317 19.0078 5.17799 19.0078 7.005C19.0078 8.83201 17.7699 10.4268 16 10.88" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                                            </svg>
                                        </div>
                                        <div>
                                            <div className="text-xs font-medium">Portal de Clientes</div>
                                            <div className="text-xs text-muted-foreground mt-1">
                                                Permite a tus clientes realizar pedidos, consultar disponibilidad y seguir el estado de sus compras en un portal personalizado.
                                            </div>
                                            <div className="mt-2 flex items-center">
                                                <div className="h-1.5 w-1.5 rounded-full bg-green-500 mr-1.5"></div>
                                                <span className="text-xs text-green-500">Próximamente</span>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Control Páginación */}
                        <div className="flex justify-center items-center mt-3 gap-1">
                            {/* Indicador de Página */}
                            {[0, 1, 2].map((index) => (
                                <div
                                    key={index}
                                    className={`w-1.5 h-1.5 rounded-full cursor-pointer ${featuresSlide === index ? 'bg-primary' : 'bg-secondary/50'}`}
                                    onClick={() => {
                                        setFeaturesSlide(index);
                                        document.getElementById('featuresCarousel')?.scrollTo({
                                            left: (document.getElementById('featuresCarousel')?.offsetWidth || 0) * index,
                                            behavior: 'smooth'
                                        });
                                    }}
                                ></div>
                            ))}
                        </div>
                    </div>

                    <div className="mt-4 pt-3 border-t border-border">
                        <div className="flex items-center justify-between">
                            <div className="flex items-center gap-2">
                                <div className="w-2 h-2 rounded-full bg-amber-500"></div>
                                <span className="text-xs text-muted-foreground">En desarrollo</span>
                            </div>
                            <div className="flex items-center gap-2">
                                <div className="w-2 h-2 rounded-full bg-green-500"></div>
                                <span className="text-xs text-muted-foreground">Próximamente</span>
                            </div>
                        </div>
                    </div>
                </div>


                {/* Visitors Resources section */}
                <div className="col-span-2 row-span-2 col-start-7 row-start-7 bg-background/95 rounded-xl p-4 dark:shadow-container-dark shadow-container-light border dark:border-container-border-dark border-container-border-light">
                    <div className="flex items-center justify-between mb-2">
                        <h2 className="text-sm font-semibold">Social Media Analytics</h2>
                        <div className="flex items-center gap-2">
                            <Button
                                variant="outline"
                                size="sm"
                                className="text-xs h-6 flex items-center gap-1"
                                onClick={() => setSelectedTimeframe(selectedTimeframe === "weekly" ? "monthly" : "weekly")}
                            >
                                {selectedTimeframe === "weekly" ? "Weekly" : "Monthly"} <ChevronDown className="h-3 w-3" />
                            </Button>
                        </div>
                    </div>

                    {/* Carousel container */}
                    <div className="relative mt-2 h-[calc(100%-3.5rem)]">
                        {/* Social media cards */}
                        <div
                            id="socialMediaCarousel"
                            className="flex overflow-x-hidden pb-3 snap-x snap-mandatory scrollbar-hide"
                            style={{ scrollBehavior: 'smooth' }}
                        >
                            {/* Instagram Card */}
                            <div className="min-w-full snap-center px-1">
                                <div className="bg-gradient-to-br from-purple-500 via-pink-500 to-orange-400 p-0.5 rounded-xl">
                                    <div className="bg-background/95 rounded-lg p-3 h-full">
                                        <div className="flex items-center justify-between mb-2">
                                            <div className="flex items-center gap-2">
                                                <svg className="h-4 w-4 text-pink-500" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                                                    <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.919-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069z" fill="currentColor" />
                                                    <path d="M12 6.865c-2.841 0-5.145 2.303-5.145 5.144 0 2.842 2.304 5.145 5.145 5.145 2.842 0 5.145-2.303 5.145-5.145 0-2.841-2.303-5.144-5.145-5.144zm0 8.485c-1.842 0-3.34-1.498-3.34-3.34s1.498-3.34 3.34-3.34 3.34 1.498 3.34 3.34-1.498 3.34-3.34 3.34z" fill="currentColor" />
                                                    <path d="M17.339 6.656a1.2 1.2 0 100-2.4 1.2 1.2 0 000 2.4z" fill="currentColor" />
                                                </svg>
                                                <span className="font-medium text-xs">Instagram</span>
                                            </div>
                                        </div>
                                        <div className="flex flex-col items-center justify-center mt-1">
                                            <div className="text-2xl font-bold">{isSignedIn ? (selectedTimeframe === "weekly" ? "8.7k" : "32.4k") : "0"}</div>
                                            <div className="text-xs text-muted-foreground">Followers</div>
                                            <div className="w-full bg-secondary/20 h-1 rounded-full mt-3 mb-1">
                                                <div className="bg-pink-500 h-1 rounded-full" style={{ width: isSignedIn ? '65%' : '0%' }}></div>
                                            </div>
                                            <div className="flex justify-between w-full text-xs">
                                                <span className="text-green-500 flex items-center">
                                                    +{isSignedIn ? (selectedTimeframe === "weekly" ? "12%" : "8%") : "0%"} <TrendingUp className="h-3 w-3 ml-1" />
                                                </span>
                                                <span className="text-muted-foreground">vs last {selectedTimeframe === "weekly" ? "week" : "month"}</span>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                            {/* Facebook Card */}
                            <div className="min-w-full snap-center px-1">
                                <div className="bg-gradient-to-br from-blue-600 to-blue-400 p-0.5 rounded-xl">
                                    <div className="bg-background/95 rounded-lg p-3 h-full">
                                        <div className="flex items-center justify-between mb-2">
                                            <div className="flex items-center gap-2">
                                                <svg className="h-4 w-4 text-blue-500" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                                                    <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385h-3.047v-3.47h3.047v-2.642c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953h-1.514c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385c5.737-.9 10.125-5.864 10.125-11.854z" fill="currentColor" />
                                                </svg>
                                                <span className="font-medium text-xs">Facebook</span>
                                            </div>
                                        </div>
                                        <div className="flex flex-col items-center justify-center mt-1">
                                            <div className="text-2xl font-bold">{isSignedIn ? (selectedTimeframe === "weekly" ? "11.3k" : "42.7k") : "0"}</div>
                                            <div className="text-xs text-muted-foreground">Page Likes</div>
                                            <div className="w-full bg-secondary/20 h-1 rounded-full mt-3 mb-1">
                                                <div className="bg-blue-500 h-1 rounded-full" style={{ width: isSignedIn ? '78%' : '0%' }}></div>
                                            </div>
                                            <div className="flex justify-between w-full text-xs">
                                                <span className="text-green-500 flex items-center">
                                                    +{isSignedIn ? (selectedTimeframe === "weekly" ? "15%" : "10%") : "0%"} <TrendingUp className="h-3 w-3 ml-1" />
                                                </span>
                                                <span className="text-muted-foreground">vs last {selectedTimeframe === "weekly" ? "week" : "month"}</span>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                            {/* Twitter/X Card */}
                            <div className="min-w-full snap-center px-1">
                                <div className="bg-gradient-to-br from-black to-gray-700 p-0.5 rounded-xl">
                                    <div className="bg-background/95 rounded-lg p-3 h-full">
                                        <div className="flex items-center justify-between mb-2">
                                            <div className="flex items-center gap-2">
                                                <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                                                    <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" fill="currentColor" />
                                                </svg>
                                                <span className="font-medium text-xs">Twitter/X</span>
                                            </div>
                                        </div>
                                        <div className="flex flex-col items-center justify-center mt-1">
                                            <div className="text-2xl font-bold">{isSignedIn ? (selectedTimeframe === "weekly" ? "6.2k" : "24.8k") : "0"}</div>
                                            <div className="text-xs text-muted-foreground">Followers</div>
                                            <div className="w-full bg-secondary/20 h-1 rounded-full mt-3 mb-1">
                                                <div className="bg-gray-500 h-1 rounded-full" style={{ width: isSignedIn ? '45%' : '0%' }}></div>
                                            </div>
                                            <div className="flex justify-between w-full text-xs">
                                                <span className="text-green-500 flex items-center">
                                                    +{isSignedIn ? (selectedTimeframe === "weekly" ? "9%" : "6%") : "0%"} <TrendingUp className="h-3 w-3 ml-1" />
                                                </span>
                                                <span className="text-muted-foreground">vs last {selectedTimeframe === "weekly" ? "week" : "month"}</span>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                        {/* Indicators */}
                        <div className="flex justify-center mt-2 gap-1">
                            <div
                                id="indicator-0"
                                className={`w-1.5 h-1.5 rounded-full ${currentSlide === 0 ? 'bg-primary' : 'bg-secondary/50'}`}
                                onClick={() => {
                                    setCurrentSlide(0);
                                    document.getElementById('socialMediaCarousel')?.scrollTo({
                                        left: 0,
                                        behavior: 'smooth'
                                    });
                                }}
                            ></div>
                            <div
                                id="indicator-1"
                                className={`w-1.5 h-1.5 rounded-full ${currentSlide === 1 ? 'bg-primary' : 'bg-secondary/50'}`}
                                onClick={() => {
                                    setCurrentSlide(1);
                                    document.getElementById('socialMediaCarousel')?.scrollTo({
                                        left: document.getElementById('socialMediaCarousel')?.offsetWidth || 0,
                                        behavior: 'smooth'
                                    });
                                }}
                            ></div>
                            <div
                                id="indicator-2"
                                className={`w-1.5 h-1.5 rounded-full ${currentSlide === 2 ? 'bg-primary' : 'bg-secondary/50'}`}
                                onClick={() => {
                                    setCurrentSlide(2);
                                    document.getElementById('socialMediaCarousel')?.scrollTo({
                                        left: (document.getElementById('socialMediaCarousel')?.offsetWidth || 0) * 2,
                                        behavior: 'smooth'
                                    });
                                }}
                            ></div>
                        </div>
                    </div>
                </div>
            </div>
        </div>

    );
}
