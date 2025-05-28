"use client"

import type { EditorBtns } from "@/lib/constants"
import { DollarSign } from "lucide-react"
import type React from "react"

const PricingPlaceholder = () => {
  const handleDragStart = (e: React.DragEvent, type: EditorBtns) => {
    if (type === null) return
    e.dataTransfer.setData("componentType", type)
  }

  return (
    <div
      draggable
      onDragStart={(e) => handleDragStart(e, "pricing")}
      className="h-14 w-14 bg-gradient-to-br from-green-500/20 to-emerald-500/20 rounded-lg flex items-center justify-center border-2 border-dashed border-green-300 hover:border-green-500 transition-colors cursor-grab active:cursor-grabbing"
    >
      <DollarSign size={24} className="text-green-600" />
    </div>
  )
}

export default PricingPlaceholder
