"use client"

import type { EditorBtns } from "@/lib/constants"
import { Zap } from "lucide-react"
import type React from "react"

const FeaturePlaceholder = () => {
  const handleDragStart = (e: React.DragEvent, type: EditorBtns) => {
    if (type === null) return
    e.dataTransfer.setData("componentType", type)
  }

  return (
    <div
      draggable
      onDragStart={(e) => handleDragStart(e, "features")}
      className="h-14 w-14 bg-gradient-to-br from-violet-500/20 to-purple-500/20 rounded-lg flex items-center justify-center border-2 border-dashed border-violet-300 hover:border-violet-500 transition-colors cursor-grab active:cursor-grabbing"
    >
      <Zap size={24} className="text-violet-600" />
    </div>
  )
}

export default FeaturePlaceholder
