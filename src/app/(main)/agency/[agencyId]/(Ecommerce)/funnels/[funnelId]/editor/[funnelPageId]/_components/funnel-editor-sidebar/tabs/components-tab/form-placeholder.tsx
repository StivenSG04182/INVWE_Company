"use client"

import type { EditorBtns } from "@/lib/constants"
import { FileText } from "lucide-react"
import type React from "react"

type Props = {}

const FormPlaceholder = (props: Props) => {
  const handleDragStart = (e: React.DragEvent, type: EditorBtns) => {
    if (type === null) return
    e.dataTransfer.setData("componentType", type)
  }

  return (
    <div
      draggable
      onDragStart={(e) => handleDragStart(e, "form")}
      className="h-14 w-14 bg-gradient-to-br from-purple-500/20 to-pink-500/20 rounded-lg flex items-center justify-center border-2 border-dashed border-purple-300 hover:border-purple-500 transition-colors cursor-grab active:cursor-grabbing"
    >
      <FileText size={24} className="text-purple-600" />
    </div>
  )
}

export default FormPlaceholder
