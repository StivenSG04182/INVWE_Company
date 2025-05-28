"use client"

import type { EditorBtns } from "@/lib/constants"
import { ImageIcon } from "lucide-react"
import type React from "react"

type Props = {}

const ImagePlaceholder = (props: Props) => {
  const handleDragStart = (e: React.DragEvent, type: EditorBtns) => {
    if (type === null) return
    e.dataTransfer.setData("componentType", type)
  }

  return (
    <div
      draggable
      onDragStart={(e) => handleDragStart(e, "image")}
      className="h-14 w-14 bg-gradient-to-br from-blue-500/20 to-purple-500/20 rounded-lg flex items-center justify-center border-2 border-dashed border-blue-300 hover:border-blue-500 transition-colors cursor-grab active:cursor-grabbing"
    >
      <ImageIcon size={24} className="text-blue-600" />
    </div>
  )
}

export default ImagePlaceholder
