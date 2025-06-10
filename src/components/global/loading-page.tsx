"use client"

import Loading from "./loading"
import { useState, useEffect } from "react"

export default function Home() {
  const [progress, setProgress] = useState(0)
  const [status, setStatus] = useState("Iniciando sistema...")

  useEffect(() => {
    const loadingStates = [
      { progress: 0, status: "Iniciando sistema...", delay: 1000 },
      { progress: 25, status: "Cargando inventario...", delay: 1500 },
      { progress: 50, status: "Verificando productos...", delay: 1200 },
      { progress: 75, status: "Sincronizando datos...", delay: 1800 },
      { progress: 100, status: "¡Sistema listo!", delay: 1000 },
    ]

    let currentIndex = 0

    const updateProgress = () => {
      if (currentIndex < loadingStates.length) {
        const currentState = loadingStates[currentIndex]
        setProgress(currentState.progress)
        setStatus(currentState.status)

        setTimeout(() => {
          currentIndex++
          if (currentIndex >= loadingStates.length) {
            currentIndex = 0
          }
          updateProgress()
        }, currentState.delay)
      }
    }

    updateProgress()
  }, [])

  return (
    <main className="flex min-h-screen flex-col items-center justify-center p-24 bg-gradient-to-br from-amber-50 to-orange-100">
      <div className="w-full max-w-5xl">
        <h1 className="text-4xl font-bold mb-8 text-center text-gray-800">Sistema de Inventario SaaS</h1>
        <div className="bg-white p-12 rounded-xl shadow-2xl border border-gray-100">
          <div className="text-center mb-6">
            <h2 className="text-xl font-semibold text-gray-700 mb-2">Preparando su plataforma</h2>
            <p className="text-gray-500">Configurando módulos de inventario, POS y facturación electrónica</p>
          </div>
          <Loading progress={progress} status={status} />
        </div>
      </div>
    </main>
  )
}
