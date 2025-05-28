"use client"

import type { EditorBtns } from "@/lib/constants"
import { Star } from "lucide-react"
import type React from "react"

const HeroPlaceholder = () => {
  const handleDragStart = (e: React.DragEvent, type: EditorBtns) => {
    if (type === null) return
    e.dataTransfer.setData("componentType", type)
  }

  return (
    <div
      draggable
      onDragStart={(e) => handleDragStart(e, "hero")}
      className="h-14 w-14 bg-gradient-to-br from-yellow-500/20 to-orange-500/20 rounded-lg flex items-center justify-center border-2 border-dashed border-yellow-300 hover:border-yellow-500 transition-colors cursor-grab active:cursor-grabbing"
    >
      <Star size={24} className="text-yellow-600" />
    </div>
  )
}

export default HeroPlaceholder
