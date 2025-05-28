"use client"

import type { EditorBtns } from "@/lib/constants"
import type React from "react"

const TabsPlaceholder = () => {
  const handleDragStart = (e: React.DragEvent, type: EditorBtns) => {
    if (type === null) return
    e.dataTransfer.setData("componentType", type)
  }

  return (
    <div
      draggable
      onDragStart={(e) => handleDragStart(e, "tabs")}
      className="h-14 w-14 bg-gradient-to-br from-indigo-500/20 to-purple-500/20 rounded-lg flex flex-col items-center justify-center border-2 border-dashed border-indigo-300 hover:border-indigo-500 transition-colors cursor-grab active:cursor-grabbing"
    >
      <div className="flex gap-1 mb-1">
        <div className="w-3 h-1 bg-indigo-600 rounded"></div>
        <div className="w-3 h-1 bg-indigo-400 rounded"></div>
        <div className="w-3 h-1 bg-indigo-400 rounded"></div>
      </div>
      <div className="w-10 h-2 bg-indigo-200 rounded"></div>
    </div>
  )
}

export default TabsPlaceholder
