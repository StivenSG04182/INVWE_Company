"use client"

import { useEffect, useRef } from "react"
import { Chart, registerables } from "chart.js"

// Registrar componentes de Chart.js
Chart.register(...registerables)

interface ChartProps {
    data: {
        labels: string[]
        datasets: {
            label: string
            data: number[]
            backgroundColor?: string | string[]
            borderColor?: string | string[]
            borderWidth?: number
            fill?: boolean
        }[]
    }
    options?: any
}

export function BarChart({ data, options = {} }: ChartProps) {
    const chartRef = useRef<HTMLCanvasElement>(null)
    const chartInstance = useRef<Chart | null>(null)

    useEffect(() => {
        if (!chartRef.current) return

        // Destruir gráfico existente si hay uno
        if (chartInstance.current) {
            chartInstance.current.destroy()
        }

        // Crear nuevo gráfico
        const ctx = chartRef.current.getContext("2d")
        if (!ctx) return

        chartInstance.current = new Chart(ctx, {
            type: "bar",
            data,
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    legend: {
                        position: "top",
                    },
                    tooltip: {
                        mode: "index",
                        intersect: false,
                    },
                },
                scales: {
                    y: {
                        beginAtZero: true,
                    },
                },
                ...options,
            },
        })

        // Limpiar al desmontar
        return () => {
            if (chartInstance.current) {
                chartInstance.current.destroy()
            }
        }
    }, [data, options])

    return <canvas ref={chartRef} />
}

export function LineChart({ data, options = {} }: ChartProps) {
    const chartRef = useRef<HTMLCanvasElement>(null)
    const chartInstance = useRef<Chart | null>(null)

    useEffect(() => {
        if (!chartRef.current) return

        // Destruir gráfico existente si hay uno
        if (chartInstance.current) {
            chartInstance.current.destroy()
        }

        // Crear nuevo gráfico
        const ctx = chartRef.current.getContext("2d")
        if (!ctx) return

        chartInstance.current = new Chart(ctx, {
            type: "line",
            data,
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    legend: {
                        position: "top",
                    },
                    tooltip: {
                        mode: "index",
                        intersect: false,
                    },
                },
                scales: {
                    y: {
                        beginAtZero: true,
                    },
                },
                ...options,
            },
        })

        // Limpiar al desmontar
        return () => {
            if (chartInstance.current) {
                chartInstance.current.destroy()
            }
        }
    }, [data, options])

    return <canvas ref={chartRef} />
}

export function PieChart({ data, options = {} }: ChartProps) {
    const chartRef = useRef<HTMLCanvasElement>(null)
    const chartInstance = useRef<Chart | null>(null)

    useEffect(() => {
        if (!chartRef.current) return

        // Destruir gráfico existente si hay uno
        if (chartInstance.current) {
            chartInstance.current.destroy()
        }

        // Crear nuevo gráfico
        const ctx = chartRef.current.getContext("2d")
        if (!ctx) return

        chartInstance.current = new Chart(ctx, {
            type: "pie",
            data,
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    legend: {
                        position: "top",
                    },
                    tooltip: {
                        mode: "index",
                        intersect: false,
                    },
                },
                ...options,
            },
        })

        // Limpiar al desmontar
        return () => {
            if (chartInstance.current) {
                chartInstance.current.destroy()
            }
        }
    }, [data, options])

    return <canvas ref={chartRef} />
}
