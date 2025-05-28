"use client"

import type { EditorBtns } from "@/lib/constants"
import { ChevronDown } from "lucide-react"
import type React from "react"

const AccordionPlaceholder = () => {
  const handleDragStart = (e: React.DragEvent, type: EditorBtns) => {
    if (type === null) return
    e.dataTransfer.setData("componentType", type)
  }

  return (
    <div
      draggable
      onDragStart={(e) => handleDragStart(e, "accordion")}
      className="h-14 w-14 bg-gradient-to-br from-amber-500/20 to-orange-500/20 rounded-lg flex flex-col items-center justify-center border-2 border-dashed border-amber-300 hover:border-amber-500 transition-colors cursor-grab active:cursor-grabbing gap-1"
    >
      <div className="w-8 h-1 bg-amber-600 rounded"></div>
      <ChevronDown size={12} className="text-amber-600" />
      <div className="w-6 h-1 bg-amber-600/50 rounded"></div>
    </div>
  )
}

export default AccordionPlaceholder
