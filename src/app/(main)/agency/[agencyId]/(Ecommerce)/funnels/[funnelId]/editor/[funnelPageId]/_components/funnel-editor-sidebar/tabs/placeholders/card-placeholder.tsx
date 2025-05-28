"use client"

import type { EditorBtns } from "@/lib/constants"
import { CreditCard } from "lucide-react"
import type React from "react"

const CardPlaceholder = () => {
  const handleDragStart = (e: React.DragEvent, type: EditorBtns) => {
    if (type === null) return
    e.dataTransfer.setData("componentType", type)
  }

  return (
    <div
      draggable
      onDragStart={(e) => handleDragStart(e, "card")}
      className="h-14 w-14 bg-gradient-to-br from-slate-500/20 to-gray-500/20 rounded-lg flex items-center justify-center border-2 border-dashed border-slate-300 hover:border-slate-500 transition-colors cursor-grab active:cursor-grabbing"
    >
      <CreditCard size={24} className="text-slate-600" />
    </div>
  )
}

export default CardPlaceholder
