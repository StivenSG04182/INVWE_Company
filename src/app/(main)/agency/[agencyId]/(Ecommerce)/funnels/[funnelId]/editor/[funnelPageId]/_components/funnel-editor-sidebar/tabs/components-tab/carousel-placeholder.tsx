"use client"

import type { EditorBtns } from "@/lib/constants"
import { Images } from "lucide-react"
import type React from "react"

const CarouselPlaceholder = () => {
  const handleDragStart = (e: React.DragEvent, type: EditorBtns) => {
    if (type === null) return
    e.dataTransfer.setData("componentType", type)
  }

  return (
    <div
      draggable
      onDragStart={(e) => handleDragStart(e, "carousel")}
      className="h-14 w-14 bg-gradient-to-br from-pink-500/20 to-rose-500/20 rounded-lg flex items-center justify-center border-2 border-dashed border-pink-300 hover:border-pink-500 transition-colors cursor-grab active:cursor-grabbing"
    >
      <Images size={24} className="text-pink-600" />
    </div>
  )
}

export default CarouselPlaceholder
