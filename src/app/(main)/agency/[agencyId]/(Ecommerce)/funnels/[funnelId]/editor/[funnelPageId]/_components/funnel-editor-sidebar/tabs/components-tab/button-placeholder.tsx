"use client"

import type { EditorBtns } from "@/lib/constants"
import { MousePointer } from "lucide-react"
import type React from "react"

type Props = {}

const ButtonPlaceholder = (props: Props) => {
  const handleDragStart = (e: React.DragEvent, type: EditorBtns) => {
    if (type === null) return
    e.dataTransfer.setData("componentType", type)
  }

  return (
    <div
      draggable
      onDragStart={(e) => handleDragStart(e, "button")}
      className="h-14 w-14 bg-gradient-to-br from-green-500/20 to-emerald-500/20 rounded-lg flex items-center justify-center border-2 border-dashed border-green-300 hover:border-green-500 transition-colors cursor-grab active:cursor-grabbing"
    >
      <MousePointer size={24} className="text-green-600" />
    </div>
  )
}

export default ButtonPlaceholder
