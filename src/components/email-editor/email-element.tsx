"use client"

import type React from "react"
import { useRef, useCallback, memo } from "react"
import { useDrag, useDrop } from "react-dnd"
import { useEmailEditorStore } from "@/providers/email-editor/email-editor-provider"
import { Button } from "@/components/ui/button"
import { Trash2, Copy, Move, Settings } from "lucide-react"
import Image from "next/image"

interface EmailElementProps {
  element: any
  index?: number
  parentId?: string
}

const EmailElement: React.FC<EmailElementProps> = memo(({ element, index, parentId }) => {
  const ref = useRef<HTMLDivElement>(null)
  const { selectedElement, selectElement, moveElement, deleteElement, duplicateElement } = useEmailEditorStore()

  const isSelected = selectedElement?.id === element.id

  const [{ isDragging }, drag] = useDrag(() => ({
    type: "EMAIL_ELEMENT",
    item: { id: element.id, index, parentId },
    collect: (monitor) => ({
      isDragging: !!monitor.isDragging(),
    }),
  }))

  const [{ isOver }, drop] = useDrop(() => ({
    accept: "EMAIL_ELEMENT",
    hover(item: any, monitor) {
      if (!ref.current) return

      const dragIndex = item.index
      const hoverIndex = index

      if (dragIndex === hoverIndex && item.parentId === parentId) return

      const hoverBoundingRect = ref.current.getBoundingClientRect()
      const hoverMiddleY = (hoverBoundingRect.bottom - hoverBoundingRect.top) / 2
      const clientOffset = monitor.getClientOffset()
      const hoverClientY = clientOffset!.y - hoverBoundingRect.top

      if (dragIndex < hoverIndex && hoverClientY < hoverMiddleY) return
      if (dragIndex > hoverIndex && hoverClientY > hoverMiddleY) return

      moveElement(item.id, item.parentId, parentId, hoverIndex)
      item.index = hoverIndex
      item.parentId = parentId
    },
    collect: (monitor) => ({
      isOver: !!monitor.isOver(),
    }),
  }))

  drag(drop(ref))

  const handleClick = useCallback((e: React.MouseEvent) => {
    e.stopPropagation()
    selectElement(element)
  }, [element, selectElement])

  const handleDelete = useCallback((e: React.MouseEvent) => {
    e.stopPropagation()
    deleteElement(element.id, parentId)
  }, [element.id, parentId, deleteElement])

  const handleDuplicate = useCallback((e: React.MouseEvent) => {
    e.stopPropagation()
    duplicateElement(element, parentId)
  }, [element, parentId, duplicateElement])

  const renderElementContent = () => {
    switch (element.type) {
      case "header":
        return <h1 style={element.styles}>{element.content}</h1>
      case "text":
        return <p style={element.styles}>{element.content}</p>
      case "image":
        return (
          <Image src={element.content?.src || "/placeholder.svg"} alt={element.content?.alt} style={element.styles} />
        )
      case "button":
        return (
          <a href={element.content?.url} style={element.styles} onClick={(e) => e.preventDefault()}>
            {element.content?.text}
          </a>
        )
      case "divider":
        return <hr style={element.styles} />
      case "spacer":
        return <div style={element.styles}></div>
      case "section":
        return (
          <div style={element.styles}>
            {Array.isArray(element.content) && element.content.length > 0 ? (
              element.content.map((childElement: any, childIndex: number) => (
                <EmailElement key={childElement.id} element={childElement} index={childIndex} parentId={element.id} />
              ))
            ) : (
              <div className="text-center text-muted-foreground p-8 border border-dashed rounded-md">
                <Settings className="h-6 w-6 mx-auto mb-2 opacity-50" />
                <p className="text-sm">Drop components here</p>
              </div>
            )}
          </div>
        )
      case "columns":
        return (
          <div style={element.styles}>
            {Array.isArray(element.content) &&
              element.content.map((column: any) => (
                <div key={column.id} style={column.styles}>
                  {Array.isArray(column.content) && column.content.length > 0 ? (
                    column.content.map((childElement: any, childIndex: number) => (
                      <EmailElement
                        key={childElement.id}
                        element={childElement}
                        index={childIndex}
                        parentId={column.id}
                      />
                    ))
                  ) : (
                    <div className="text-center text-muted-foreground p-4 border border-dashed rounded-md">
                      <Settings className="h-4 w-4 mx-auto mb-1 opacity-50" />
                      <p className="text-xs">Drop here</p>
                    </div>
                  )}
                </div>
              ))}
          </div>
        )
      default:
        return <div>Unsupported element: {element.type}</div>
    }
  }

  return (
    <div
      ref={ref}
      className={`relative group transition-all duration-200 ${
        isDragging ? "opacity-50" : ""
      } ${isSelected ? "ring-2 ring-primary ring-offset-2" : ""} ${isOver ? "bg-primary/5" : ""}`}
      onClick={handleClick}
    >
      {/* Element Toolbar */}
      <div
        className={`absolute top-0 right-0 z-10 bg-background border shadow-sm rounded-md opacity-0 group-hover:opacity-100 transition-opacity ${
          isSelected ? "opacity-100" : ""
        }`}
      >
        <div className="flex items-center">
          <Button variant="ghost" size="icon" className="h-8 w-8" onClick={handleDuplicate}>
            <Copy size={12} />
          </Button>
          <Button variant="ghost" size="icon" className="h-8 w-8 cursor-move" onMouseDown={(e) => e.stopPropagation()}>
            <Move size={12} />
          </Button>
          <Button variant="ghost" size="icon" className="h-8 w-8 text-destructive" onClick={handleDelete}>
            <Trash2 size={12} />
          </Button>
        </div>
      </div>

      {/* Element Content */}
      <div className="relative">{renderElementContent()}</div>
    </div>
  )
})

EmailElement.displayName = "EmailElement"

export { EmailElement }
export default EmailElement
