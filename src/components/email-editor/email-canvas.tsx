"use client"

import type React from "react"
import { useRef, useCallback, useMemo } from "react"
import { useDrop } from "react-dnd"
import { useEmailEditorStore } from "@/providers/email-editor/email-editor-provider"
import { EmailElement } from "./email-element"
import { ScrollArea } from "@/components/ui/scroll-area"
import { v4 as uuidv4 } from "uuid"
import { Plus, MousePointer } from "lucide-react"

const EmailCanvas: React.FC = () => {
  const { elements, addElement, previewMode, selectedElement, selectElement } = useEmailEditorStore()
  const canvasRef = useRef<HTMLDivElement>(null)

  // Memoizar la función createElementByType para evitar recreaciones innecesarias
  const createElementByType = useCallback((type: string) => {
    const baseId = uuidv4()

    switch (type) {
      case "header":
        return {
          id: baseId,
          type,
          content: "Your Email Heading",
          styles: {
            fontSize: "32px",
            fontWeight: "bold",
            color: "#1a1a1a",
            textAlign: "center",
            padding: "24px 20px",
            lineHeight: "1.2",
          },
        }
      case "text":
        return {
          id: baseId,
          type,
          content:
            "Add your email content here. This text block is fully customizable and supports rich formatting options.",
          styles: {
            fontSize: "16px",
            color: "#4a4a4a",
            lineHeight: "1.6",
            padding: "16px 20px",
          },
        }
      case "image":
        return {
          id: baseId,
          type,
          content: {
            src: "/placeholder.svg?height=200&width=600",
            alt: "Email image",
          },
          styles: {
            width: "100%",
            maxWidth: "600px",
            height: "auto",
            margin: "16px auto",
            display: "block",
            borderRadius: "8px",
          },
        }
      case "button":
        return {
          id: baseId,
          type,
          content: {
            text: "Call to Action",
            url: "#",
          },
          styles: {
            backgroundColor: "#3B82F6",
            color: "#ffffff",
            padding: "14px 28px",
            borderRadius: "6px",
            textAlign: "center",
            textDecoration: "none",
            display: "inline-block",
            margin: "16px auto",
            fontSize: "16px",
            fontWeight: "600",
            border: "none",
            cursor: "pointer",
          },
        }
      case "divider":
        return {
          id: baseId,
          type,
          content: null,
          styles: {
            borderTop: "1px solid #e5e7eb",
            margin: "24px 20px",
            width: "calc(100% - 40px)",
          },
        }
      case "spacer":
        return {
          id: baseId,
          type,
          content: null,
          styles: {
            height: "40px",
            width: "100%",
          },
        }
      case "section":
        return {
          id: baseId,
          type,
          content: [],
          styles: {
            padding: "32px 20px",
            backgroundColor: "#ffffff",
            border: "2px dashed #d1d5db",
            borderRadius: "8px",
            margin: "16px 0",
          },
        }
      case "column2":
        return {
          id: baseId,
          type: "columns",
          content: [
            {
              id: uuidv4(),
              type: "column",
              content: [],
              styles: {
                width: "50%",
                padding: "16px",
                border: "1px dashed #d1d5db",
                borderRadius: "4px",
                minHeight: "100px",
              },
            },
            {
              id: uuidv4(),
              type: "column",
              content: [],
              styles: {
                width: "50%",
                padding: "16px",
                border: "1px dashed #d1d5db",
                borderRadius: "4px",
                minHeight: "100px",
              },
            },
          ],
          styles: {
            display: "flex",
            gap: "16px",
            margin: "16px 0",
          },
        }
      case "column3":
        return {
          id: baseId,
          type: "columns",
          content: [
            {
              id: uuidv4(),
              type: "column",
              content: [],
              styles: {
                width: "33.33%",
                padding: "16px",
                border: "1px dashed #d1d5db",
                borderRadius: "4px",
                minHeight: "100px",
              },
            },
            {
              id: uuidv4(),
              type: "column",
              content: [],
              styles: {
                width: "33.33%",
                padding: "16px",
                border: "1px dashed #d1d5db",
                borderRadius: "4px",
                minHeight: "100px",
              },
            },
            {
              id: uuidv4(),
              type: "column",
              content: [],
              styles: {
                width: "33.33%",
                padding: "16px",
                border: "1px dashed #d1d5db",
                borderRadius: "4px",
                minHeight: "100px",
              },
            },
          ],
          styles: {
            display: "flex",
            gap: "12px",
            margin: "16px 0",
          },
        }
      default:
        return null
    }
  }, [])

  // Memoizar el hook useDrop para evitar recreaciones innecesarias
  const [{ isOver, canDrop }, drop] = useDrop(() => ({
    accept: "EMAIL_COMPONENT",
    drop: (item: any, monitor) => {
      if (monitor.didDrop()) return

      const componentType = item.componentType
      if (!componentType) return

      const newElement = createElementByType(componentType)
      if (newElement) {
        addElement(newElement as any)
      }
    },
    collect: (monitor) => ({
      isOver: !!monitor.isOver({ shallow: true }),
      canDrop: !!monitor.canDrop(),
    }),
  }), [addElement, createElementByType])

  const handleCanvasClick = useCallback((e: React.MouseEvent) => {
    if (e.target === e.currentTarget) {
      selectElement(null)
    }
  }, [selectElement])

  // Memoizar los elementos renderizados para evitar recreaciones innecesarias
  const renderedElements = useMemo(() => {
    return elements.length > 0 ? (
      elements.map((element, index) => <EmailElement key={element.id} element={element} index={index} />)
    ) : (
      <div className="flex flex-col items-center justify-center h-[400px] text-center p-8">
        <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center mb-4">
          <Plus className="h-8 w-8 text-primary" />
        </div>
        <h3 className="text-lg font-semibold mb-2">Start Building Your Email</h3>
        <p className="text-muted-foreground max-w-sm">
          Drag components from the sidebar to start creating your email template. You can customize every
          element to match your brand.
        </p>
      </div>
    )
  }, [elements])

  return (
    <div className="h-full flex flex-col bg-muted/30">
      {/* Canvas Header */}
      <div className="flex items-center justify-between p-4 border-b bg-background/95">
        <div className="flex items-center gap-2">
          <MousePointer className="h-4 w-4 text-muted-foreground" />
          <span className="text-sm font-medium">Email Canvas</span>
        </div>
        <div className="flex items-center gap-2 text-xs text-muted-foreground">
          <span>{elements.length} elements</span>
          {selectedElement && (
            <>
              <span>•</span>
              <span>{selectedElement.type} selected</span>
            </>
          )}
        </div>
      </div>

      {/* Canvas Area */}
      <ScrollArea className="flex-1">
        <div className="p-8">
          <div
            ref={drop as any}
            className={`mx-auto transition-all duration-200 ${isOver && canDrop ? "ring-2 ring-primary ring-offset-2" : ""
              }`}
            style={{ maxWidth: "600px" }}
            onClick={handleCanvasClick}
          >
            <div
              ref={canvasRef}
              className={`bg-white shadow-lg rounded-lg overflow-hidden min-h-[400px] ${previewMode ? "" : "border-2 border-dashed border-muted-foreground/20"
                }`}
            >
              {renderedElements}
            </div>
          </div>
        </div>
      </ScrollArea>
    </div>
  )
}

export { EmailCanvas }
export default EmailCanvas
