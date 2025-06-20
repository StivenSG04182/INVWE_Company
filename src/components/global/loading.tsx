"use client"

import { useEffect, useRef, useState } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { gsap } from "gsap"
import { Package, BarChart3, Users, ShoppingCart, TrendingUp, Database, Activity } from "lucide-react"

const loadingMessages = [
  "Sincronizando inventario...",
  "Actualizando productos...",
  "Conectando con POS...",
  "Cargando datos de personal...",
  "Procesando transacciones...",
  "Optimizando rendimiento...",
  "Finalizando configuración...",
]

const floatingIcons = [
  { Icon: Package, delay: 0 },
  { Icon: BarChart3, delay: 0.2 },
  { Icon: Users, delay: 0.4 },
  { Icon: ShoppingCart, delay: 0.6 },
  { Icon: TrendingUp, delay: 0.8 },
  { Icon: Database, delay: 1.0 },
]

export default function Loading() {
  const containerRef = useRef<HTMLDivElement>(null)
  const progressRef = useRef<HTMLDivElement>(null)
  const circleRef = useRef<HTMLDivElement>(null)
  const particlesRef = useRef<HTMLDivElement>(null)

  const [currentMessage, setCurrentMessage] = useState(0)
  const [progress, setProgress] = useState(0)

  useEffect(() => {
    const container = containerRef.current
    const progressBar = progressRef.current
    const circle = circleRef.current
    const particles = particlesRef.current

    if (!container || !progressBar || !circle || !particles) return

    // GSAP Timeline principal
    const tl = gsap.timeline({ repeat: -1 })

    // Animación del círculo principal
    gsap.set(circle, { rotation: 0 })
    gsap.to(circle, {
      rotation: 360,
      duration: 3,
      ease: "none",
      repeat: -1,
    })

    // Crear partículas flotantes
    for (let i = 0; i < 20; i++) {
      const particle = document.createElement("div")
      particle.className = "absolute w-1 h-1 bg-blue-400 rounded-full opacity-60"
      particles.appendChild(particle)

      gsap.set(particle, {
        x: Math.random() * 400,
        y: Math.random() * 400,
        scale: Math.random() * 0.5 + 0.5,
      })

      gsap.to(particle, {
        y: "-=50",
        x: `+=${Math.random() * 40 - 20}`,
        opacity: 0,
        duration: Math.random() * 2 + 1,
        repeat: -1,
        delay: Math.random() * 2,
        ease: "power2.out",
      })
    }

    // Animación de la barra de progreso
    const progressAnimation = gsap.to(progressBar, {
      width: "100%",
      duration: 6,
      ease: "power2.inOut",
      onUpdate: () => {
        const prog = Math.round(progressAnimation.progress() * 100)
        setProgress(prog)
      },
    })

    // Cambiar mensajes
    const messageInterval = setInterval(() => {
      setCurrentMessage((prev) => (prev + 1) % loadingMessages.length)
    }, 800)

    return () => {
      clearInterval(messageInterval)
      tl.kill()
      progressAnimation.kill()
    }
  }, [])

  return (
    <div
      ref={containerRef}
      className="fixed inset-0 bg-gradient-to-br from-slate-900 via-blue-900 to-slate-900 flex items-center justify-center overflow-hidden"
    >
      {/* Partículas de fondo */}
      <div ref={particlesRef} className="absolute inset-0 pointer-events-none" />

      {/* Grid de fondo animado */}
      <div className="absolute inset-0 opacity-10">
        <div className="absolute inset-0 bg-[linear-gradient(rgba(59,130,246,0.1)_1px,transparent_1px),linear-gradient(90deg,rgba(59,130,246,0.1)_1px,transparent_1px)] bg-[size:50px_50px] animate-pulse" />
      </div>

      {/* Contenedor principal */}
      <div className="relative z-10 text-center">
        {/* Logo/Círculo principal */}
        <div className="relative mb-8">
          <div ref={circleRef} className="w-24 h-24 mx-auto relative">
            <div className="absolute inset-0 rounded-full border-4 border-blue-500/30" />
            <div className="absolute inset-2 rounded-full border-2 border-blue-400/50 border-dashed" />
            <div className="absolute inset-4 rounded-full bg-gradient-to-r from-blue-500 to-cyan-500 flex items-center justify-center">
              <Activity className="w-6 h-6 text-white" />
            </div>
          </div>

          {/* Iconos flotantes alrededor */}
          {floatingIcons.map(({ Icon, delay }, index) => (
            <motion.div
              key={index}
              className="absolute w-8 h-8 bg-blue-500/20 rounded-full flex items-center justify-center backdrop-blur-sm border border-blue-400/30"
              initial={{ scale: 0, opacity: 0 }}
              animate={{
                scale: [0, 1.2, 1],
                opacity: [0, 1, 0.7],
                rotate: [0, 360],
                x: [0, Math.cos((index * 60 * Math.PI) / 180) * 80],
                y: [0, Math.sin((index * 60 * Math.PI) / 180) * 80],
              }}
              transition={{
                duration: 2,
                delay: delay,
                repeat: Number.POSITIVE_INFINITY,
                repeatType: "reverse",
                ease: "easeInOut",
              }}
              style={{
                left: "50%",
                top: "50%",
                transform: "translate(-50%, -50%)",
              }}
            >
              <Icon className="w-4 h-4 text-blue-300" />
            </motion.div>
          ))}
        </div>

        {/* Título */}
        <motion.h1
          className="text-3xl font-bold text-white mb-2"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
          InventoryPro
        </motion.h1>

        <motion.p
          className="text-blue-200 mb-8 text-lg"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
        >
          Sistema de Gestión Inteligente
        </motion.p>

        {/* Barra de progreso */}
        <div className="w-80 mx-auto mb-6">
          <div className="flex justify-between items-center mb-2">
            <span className="text-sm text-blue-200">Progreso</span>
            <span className="text-sm text-blue-200 font-mono">{progress}%</span>
          </div>
          <div className="w-full bg-slate-700/50 rounded-full h-2 overflow-hidden backdrop-blur-sm">
            <div
              ref={progressRef}
              className="h-full bg-gradient-to-r from-blue-500 to-cyan-400 rounded-full relative overflow-hidden"
              style={{ width: "0%" }}
            >
              <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent animate-pulse" />
            </div>
          </div>
        </div>

        {/* Mensaje dinámico */}
        <div className="h-6 mb-8">
          <AnimatePresence mode="wait">
            <motion.p
              key={currentMessage}
              className="text-blue-100 text-sm"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.3 }}
            >
              {loadingMessages[currentMessage]}
            </motion.p>
          </AnimatePresence>
        </div>

        {/* Indicadores de estado */}
        <div className="flex justify-center space-x-6">
          {[
            { icon: Database, label: "Base de Datos", active: progress > 20 },
            { icon: Package, label: "Inventario", active: progress > 40 },
            { icon: ShoppingCart, label: "POS", active: progress > 60 },
            { icon: Users, label: "Personal", active: progress > 80 },
          ].map(({ icon: Icon, label, active }, index) => (
            <motion.div
              key={label}
              className={`flex flex-col items-center space-y-2 transition-all duration-500 ${
                active ? "text-green-400" : "text-slate-500"
              }`}
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{
                opacity: 1,
                scale: active ? 1.1 : 1,
                color: active ? "#4ade80" : "#64748b",
              }}
              transition={{ duration: 0.3, delay: index * 0.1 }}
            >
              <div
                className={`p-2 rounded-full border-2 transition-all duration-500 ${
                  active ? "border-green-400 bg-green-400/10" : "border-slate-600 bg-slate-600/10"
                }`}
              >
                <Icon className="w-4 h-4" />
              </div>
              <span className="text-xs font-medium">{label}</span>
            </motion.div>
          ))}
        </div>

        {/* Pulso de fondo */}
        <motion.div
          className="absolute inset-0 rounded-full bg-blue-500/5"
          animate={{
            scale: [1, 1.5, 1],
            opacity: [0.3, 0, 0.3],
          }}
          transition={{
            duration: 2,
            repeat: Number.POSITIVE_INFINITY,
            ease: "easeInOut",
          }}
        />
      </div>

      {/* Efectos de luz */}
      <div className="absolute top-1/4 left-1/4 w-32 h-32 bg-blue-500/10 rounded-full blur-xl animate-pulse" />
      <div className="absolute bottom-1/4 right-1/4 w-24 h-24 bg-cyan-500/10 rounded-full blur-xl animate-pulse delay-1000" />
    </div>
  )
}
