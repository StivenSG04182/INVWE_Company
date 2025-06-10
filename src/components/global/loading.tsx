"use client"

import { useEffect, useRef, useState } from "react"

interface LoadingProps {
  progress?: number
  status?: string
}

const Loading = ({ progress = 0, status = "Procesando inventario..." }: LoadingProps) => {
  const [currentProgress, setCurrentProgress] = useState(0)
  const [currentStatus, setCurrentStatus] = useState(status)

  const containerRef = useRef(null)
  const boxRef = useRef(null)
  const flapsRef = useRef(null)
  const tapeRef = useRef(null)
  const shadowRef = useRef(null)
  const progressBarRef = useRef(null)
  const barcodeRef = useRef(null)
  const labelRef = useRef(null)

  const loadingStates = [
    { progress: 0, status: "Iniciando sistema..." },
    { progress: 20, status: "Cargando inventario..." },
    { progress: 40, status: "Verificando productos..." },
    { progress: 60, status: "Sincronizando datos..." },
    { progress: 80, status: "Preparando interfaz..." },
    { progress: 100, status: "¡Listo!" },
  ]

  useEffect(() => {
    const animateBox = () => {
      const box = boxRef.current
      const flaps = flapsRef.current
      const tape = tapeRef.current
      const barcode = barcodeRef.current
      const label = labelRef.current
      const shadow = shadowRef.current
      const progressBar = progressBarRef.current

      if (!box) return

      const applyStyles = (element, styles, transition = "all 0.3s ease") => {
        if (!element) return
        element.style.transition = transition
        Object.assign(element.style, styles)
      }

      // FASE 1: Estado inicial - Caja fuera de pantalla
      applyStyles(
        box,
        {
          transform: "translateX(-300px) scale(0.8)",
          opacity: "0",
        },
        "none",
      )

      applyStyles(
        flaps,
        {
          opacity: "0",
        },
        "none",
      )

      applyStyles(
        tape,
        {
          opacity: "0",
          transform: "scaleX(0)",
        },
        "none",
      )

      applyStyles(
        shadow,
        {
          opacity: "0",
          transform: "scale(0.5)",
        },
        "none",
      )

      applyStyles(
        barcode,
        {
          opacity: "0",
          transform: "scale(0)",
        },
        "none",
      )

      applyStyles(
        label,
        {
          opacity: "0",
          transform: "scale(0)",
        },
        "none",
      )

      applyStyles(
        progressBar,
        {
          transform: "scaleX(0)",
        },
        "none",
      )

      // FASE 2: Entrada de la caja con aletas abiertas
      setTimeout(() => {
        applyStyles(
          box,
          {
            transform: "translateX(0px) scale(1)",
            opacity: "1",
          },
          "all 1.2s cubic-bezier(0.4, 0, 0.2, 1)",
        )

        applyStyles(
          shadow,
          {
            opacity: "0.3",
            transform: "scale(1)",
          },
          "all 0.8s ease-out",
        )

        // Mostrar aletas abiertas
        setTimeout(() => {
          applyStyles(
            flaps,
            {
              opacity: "1",
            },
            "all 0.5s ease-out",
          )
        }, 600)
      }, 100)

      // FASE 3: Mostrar detalles de la caja abierta
      setTimeout(() => {
        applyStyles(
          barcode,
          {
            opacity: "1",
            transform: "scale(1)",
          },
          "all 0.5s cubic-bezier(0.68, -0.55, 0.265, 1.55)",
        )

        setTimeout(() => {
          applyStyles(
            label,
            {
              opacity: "1",
              transform: "scale(1)",
            },
            "all 0.5s cubic-bezier(0.68, -0.55, 0.265, 1.55)",
          )
        }, 200)
      }, 1800)

      // FASE 4: Cerrar las aletas - solo la superior
      setTimeout(() => {
        // Cerrar aletas laterales primero
        const leftFlap = flaps?.querySelector(".left-flap")
        const rightFlap = flaps?.querySelector(".right-flap")
        const backFlap = flaps?.querySelector(".back-flap")
        const frontFlap = flaps?.querySelector(".front-flap")

        if (leftFlap) {
          leftFlap.style.transition = "all 0.6s cubic-bezier(0.4, 0, 0.2, 1)"
          leftFlap.style.transform = "scaleX(0)"
        }
        if (rightFlap) {
          rightFlap.style.transition = "all 0.6s cubic-bezier(0.4, 0, 0.2, 1)"
          rightFlap.style.transform = "scaleX(0)"
        }

        // Cerrar aleta inferior primero
        setTimeout(() => {
          if (frontFlap) {
            frontFlap.style.transition = "all 0.8s cubic-bezier(0.4, 0, 0.2, 1)"
            frontFlap.style.transform = "scaleY(0)"
          }
        }, 400)

        // Cerrar aleta superior al final (como tapa)
        setTimeout(() => {
          if (backFlap) {
            backFlap.style.transition = "all 0.8s cubic-bezier(0.4, 0, 0.2, 1)"
            backFlap.style.transform = "scaleY(0)"
          }
        }, 800)
      }, 2800)

      // FASE 5: Aplicar cinta
      setTimeout(() => {
        applyStyles(
          tape,
          {
            opacity: "1",
            transform: "scaleX(1)",
          },
          "all 0.8s cubic-bezier(0.68, -0.55, 0.265, 1.55)",
        )
      }, 4400)

      // FASE 6: Barra de progreso
      setTimeout(() => {
        applyStyles(
          progressBar,
          {
            transform: "scaleX(1)",
          },
          "all 1.5s cubic-bezier(0.4, 0, 0.2, 1)",
        )
      }, 5400)

      // FASE 7: Salida de la caja
      setTimeout(() => {
        applyStyles(
          box,
          {
            transform: "translateX(300px) scale(0.8)",
            opacity: "0",
          },
          "all 1.2s cubic-bezier(0.4, 0, 0.6, 1)",
        )

        applyStyles(
          shadow,
          {
            opacity: "0",
            transform: "scale(0.5)",
          },
          "all 0.8s cubic-bezier(0.4, 0, 0.6, 1)",
        )
      }, 7200)

      // FASE 8: Reiniciar
      setTimeout(() => {
        animateBox()
      }, 8800)
    }

    // Simular progreso automático
    let progressInterval
    if (progress === 0) {
      let currentIndex = 0
      progressInterval = setInterval(() => {
        const state = loadingStates[currentIndex]
        setCurrentProgress(state.progress)
        setCurrentStatus(state.status)
        currentIndex = (currentIndex + 1) % loadingStates.length
      }, 1400)
    }

    animateBox()

    return () => {
      if (progressInterval) {
        clearInterval(progressInterval)
      }
    }
  }, [])

  useEffect(() => {
    if (progress > 0) {
      setCurrentProgress(progress)
      setCurrentStatus(status)
    }
  }, [progress, status])

  return (
    <div className="flex flex-col items-center justify-center h-60 w-full" role="status" aria-label="Cargando">
      <div ref={containerRef} className="relative w-40 h-40 mb-6">
        {/* Sombra */}
        <div
          ref={shadowRef}
          className="absolute -bottom-8 left-1/2 transform -translate-x-1/2 w-36 h-16 bg-gray-400/20 rounded-full blur-sm"
          style={{ opacity: 0 }}
        />

        {/* Caja principal */}
        <div ref={boxRef} className="relative transform-gpu w-32 h-32 mx-auto">
          {/* Caja base (cerrada) */}
          <div className="relative w-full h-full">
            {/* Base de la caja */}
            <div className="absolute inset-0 bg-gradient-to-br from-orange-300 to-orange-500 rounded-lg shadow-lg border border-orange-600">
              {/* Cara frontal más oscura para dar profundidad */}
              <div className="absolute inset-0 bg-gradient-to-b from-transparent to-orange-600/20 rounded-lg" />
              
              {/* Lado derecho más oscuro */}
              <div className="absolute top-0 right-0 w-3 h-full bg-orange-600/30 rounded-r-lg" />
              
              {/* Parte superior */}
              <div className="absolute top-0 left-0 right-3 h-3 bg-gradient-to-r from-orange-200 to-orange-300 rounded-t-lg" />
            </div>

            {/* Símbolos en la caja */}
            <div className="absolute inset-0 flex flex-col justify-center items-center space-y-2">
              {/* Flechas hacia arriba */}
              <div className="flex space-x-2">
                <svg width="16" height="16" viewBox="0 0 16 16" className="text-gray-700">
                  <path d="M8 2 L12 6 L10 6 L10 12 L6 12 L6 6 L4 6 Z" fill="currentColor" />
                </svg>
                <svg width="16" height="16" viewBox="0 0 16 16" className="text-gray-700">
                  <path d="M8 2 L12 6 L10 6 L10 12 L6 12 L6 6 L4 6 Z" fill="currentColor" />
                </svg>
              </div>

              {/* Símbolo de reciclaje */}
              <div className="w-6 h-6 border-2 border-green-700 rounded-full flex items-center justify-center">
                <svg width="12" height="12" viewBox="0 0 12 12" className="text-green-700">
                  <path d="M2 4 L6 2 L10 4 L8 6 L6 5 L4 6 Z" fill="currentColor" />
                  <path d="M2 8 L4 6 L6 7 L8 6 L10 8 L6 10 Z" fill="currentColor" />
                </svg>
              </div>
            </div>
          </div>

          {/* Aletas de la caja (estado abierto) */}
          <div ref={flapsRef} className="absolute inset-0" style={{ opacity: 0 }}>
            {/* Aleta izquierda */}
            <div 
              className="left-flap absolute top-0 -left-8 w-8 h-32 bg-gradient-to-r from-orange-400 to-orange-500 border border-orange-600 transform-gpu origin-right"
              style={{ transformOrigin: "right center" }}
            />
            
            {/* Aleta derecha */}
            <div 
              className="right-flap absolute top-0 -right-8 w-8 h-32 bg-gradient-to-l from-orange-400 to-orange-500 border border-orange-600 transform-gpu origin-left"
              style={{ transformOrigin: "left center" }}
            />
            
            {/* Aleta superior */}
            <div 
              className="back-flap absolute -top-8 left-0 w-32 h-8 bg-gradient-to-b from-orange-300 to-orange-400 border border-orange-600 transform-gpu origin-bottom"
              style={{ transformOrigin: "center bottom" }}
            />
            
            {/* Aleta inferior */}
            <div 
              className="front-flap absolute -bottom-8 left-0 w-32 h-8 bg-gradient-to-t from-orange-300 to-orange-400 border border-orange-600 transform-gpu origin-top"
              style={{ transformOrigin: "center top" }}
            />
          </div>

          {/* Cinta de embalaje - movida a la parte superior */}
          <div
            ref={tapeRef}
            className="absolute top-0 left-0 w-full h-3 bg-gradient-to-b from-amber-600 to-amber-800 shadow-md rounded-t-lg"
            style={{
              opacity: 0,
              transformOrigin: "left center",
            }}
          >
            <div className="absolute inset-0 bg-amber-500/30 rounded-t-lg" />
          </div>

          {/* Código de barras */}
          <div
            ref={barcodeRef}
            className="absolute top-4 left-4 bg-white p-1 rounded shadow-md"
            style={{ opacity: 0 }}
          >
            <div className="flex space-x-0.5">
              {[1, 2, 1, 1, 2, 1, 1, 2, 1, 2, 1, 2].map((width, i) => (
                <div
                  key={i}
                  className="bg-black"
                  style={{ width: `${width}px`, height: '8px' }}
                />
              ))}
            </div>
          </div>

          {/* Etiqueta de envío */}
          <div
            ref={labelRef}
            className="absolute bottom-4 right-4 bg-white p-1.5 rounded shadow-md text-xs border"
            style={{ opacity: 0 }}
          >
            <div className="text-[8px] font-mono text-gray-700 leading-tight">
              <div className="font-bold text-red-600">FRÁGIL</div>
              <div className="text-blue-600">INV-2024</div>
              <div className="text-gray-500">QTY: 50</div>
            </div>
          </div>
        </div>
      </div>

      {/* Información de estado */}
      <div className="text-center space-y-3 w-full max-w-xs">
        <div className="text-sm font-medium text-gray-700">{currentStatus}</div>

        {/* Barra de progreso */}
        <div className="w-full bg-gray-200 rounded-full h-2.5 overflow-hidden shadow-inner">
          <div
            ref={progressBarRef}
            className="h-full bg-gradient-to-r from-blue-500 via-blue-600 to-blue-700 rounded-full origin-left transition-all duration-300 shadow-sm"
            style={{
              width: `${currentProgress}%`,
              transform: "scaleX(0)",
            }}
          />
        </div>

        {/* Porcentaje */}
        <div className="text-xs text-gray-500 font-mono tabular-nums">{currentProgress}% completado</div>
      </div>
    </div>
  )
}

export default Loading