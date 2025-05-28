"use client"

import type { EditorBtns } from "@/lib/constants"
import { Minus } from "lucide-react"
import type React from "react"

const FooterPlaceholder = () => {
  const handleDragStart = (e: React.DragEvent, type: EditorBtns) => {
    if (type === null) return
    e.dataTransfer.setData("componentType", type)
  }

  return (
    <div
      draggable
      onDragStart={(e) => handleDragStart(e, "footer")}
      className="h-14 w-14 bg-gradient-to-br from-gray-500/20 to-slate-500/20 rounded-lg flex flex-col items-center justify-end border-2 border-dashed border-gray-300 hover:border-gray-500 transition-colors cursor-grab active:cursor-grabbing p-2"
    >
      <div className="w-8 h-1 bg-gray-600 rounded mb-1"></div>
      <div className="w-6 h-1 bg-gray-400 rounded mb-1"></div>
      <Minus size={16} className="text-gray-600" />
    </div>
  )
}

export default FooterPlaceholder
