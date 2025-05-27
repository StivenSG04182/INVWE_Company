"use client"

import { useEffect, useRef } from "react"

interface RosenChartProps {
    config: any
    className?: string
}

export function RosenChart({ config, className = "" }: RosenChartProps) {
    const chartRef = useRef<HTMLCanvasElement>(null)
    const chartInstance = useRef<any>(null)

    useEffect(() => {
        if (!chartRef.current) return

        // Importar Chart.js dinámicamente
        import("chart.js/auto").then((Chart) => {
            if (chartInstance.current) {
                chartInstance.current.destroy()
            }

            const ctx = chartRef.current?.getContext("2d")
            if (ctx) {
                chartInstance.current = new Chart.default(ctx, config)
            }
        })

        return () => {
            if (chartInstance.current) {
                chartInstance.current.destroy()
            }
        }
    }, [config])

    return (
        <div className={`w-full h-full ${className}`}>
            <canvas ref={chartRef} />
        </div>
    )
}
