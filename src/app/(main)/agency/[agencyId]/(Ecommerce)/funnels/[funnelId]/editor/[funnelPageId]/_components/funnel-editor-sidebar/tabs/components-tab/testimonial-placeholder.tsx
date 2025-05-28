"use client"

import type { EditorBtns } from "@/lib/constants"
import { Quote } from "lucide-react"
import type React from "react"

const TestimonialPlaceholder = () => {
  const handleDragStart = (e: React.DragEvent, type: EditorBtns) => {
    if (type === null) return
    e.dataTransfer.setData("componentType", type)
  }

  return (
    <div
      draggable
      onDragStart={(e) => handleDragStart(e, "testimonial")}
      className="h-14 w-14 bg-gradient-to-br from-emerald-500/20 to-teal-500/20 rounded-lg flex items-center justify-center border-2 border-dashed border-emerald-300 hover:border-emerald-500 transition-colors cursor-grab active:cursor-grabbing"
    >
      <Quote size={24} className="text-emerald-600" />
    </div>
  )
}

export default TestimonialPlaceholder
