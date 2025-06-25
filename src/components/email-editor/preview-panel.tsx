"use client"

import type React from "react"
import { useState } from "react"
import { useEmailEditorStore } from "@/providers/email-editor/email-editor-provider"
import { Button } from "@/components/ui/button"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Eye, Smartphone, Tablet, Monitor, Copy, Download } from "lucide-react"
import Image from "next/image"

export const PreviewPanel: React.FC = () => {
  const { elements } = useEmailEditorStore()
  const [viewMode, setViewMode] = useState<"desktop" | "tablet" | "mobile">("desktop")
  const [activeTab, setActiveTab] = useState<"preview" | "code">("preview")

  const renderPreviewElement = (element: any): React.ReactNode => {
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
            {Array.isArray(element.content) &&
              element.content.map((childElement: any) => (
                <div key={childElement.id}>{renderPreviewElement(childElement)}</div>
              ))}
          </div>
        )
      case "columns":
        return (
          <div style={element.styles}>
            {Array.isArray(element.content) &&
              element.content.map((column: any) => (
                <div key={column.id} style={column.styles}>
                  {Array.isArray(column.content) &&
                    column.content.map((childElement: any) => (
                      <div key={childElement.id}>{renderPreviewElement(childElement)}</div>
                    ))}
                </div>
              ))}
          </div>
        )
      default:
        return <div>Unsupported element: {element.type}</div>
    }
  }

  const generateHtml = () => {
    const renderElementToHtml = (element: any): string => {
      const styleString = Object.entries(element.styles || {})
        .map(([key, value]) => `${key}: ${value};`)
        .join(" ")

      switch (element.type) {
        case "header":
          return `<h1 style="${styleString}">${element.content}</h1>`
        case "text":
          return `<p style="${styleString}">${element.content}</p>`
        case "image":
          return `<Image src="${element.content?.src}" alt="${element.content?.alt || ""}" style="${styleString}" />`
        case "button":
          return `<a href="${element.content?.url || "#"}" style="${styleString}">${element.content?.text || "Button"}</a>`
        case "divider":
          return `<hr style="${styleString}" />`
        case "spacer":
          return `<div style="${styleString}"></div>`
        case "section":
          return `<div style="${styleString}">
            ${Array.isArray(element.content) ? element.content.map((child: any) => renderElementToHtml(child)).join("") : ""}
          </div>`
        case "columns":
          return `<table width="100%" cellpadding="0" cellspacing="0" border="0" style="${styleString}">
            <tr>
              ${
                Array.isArray(element.content)
                  ? element.content
                      .map(
                        (column: any) =>
                          `<td style="${Object.entries(column.styles || {})
                            .map(([key, value]) => `${key}: ${value};`)
                            .join(" ")}">
                  ${Array.isArray(column.content) ? column.content.map((child: any) => renderElementToHtml(child)).join("") : ""}
                </td>`,
                      )
                      .join("")
                  : ""
              }
            </tr>
          </table>`
        default:
          return `<div>Unsupported element: ${element.type}</div>`
      }
    }

    const bodyContent = elements.map((element) => renderElementToHtml(element)).join("")

    return `<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Email Template</title>
</head>
<body style="margin: 0; padding: 0; font-family: Arial, sans-serif;">
  <div style="max-width: 600px; margin: 0 auto; background-color: #ffffff;">
    ${bodyContent}
  </div>
</body>
</html>`
  }

  const copyHtmlToClipboard = () => {
    const html = generateHtml()
    navigator.clipboard.writeText(html)
  }

  const downloadHtml = () => {
    const html = generateHtml()
    const blob = new Blob([html], { type: "text/html" })
    const url = URL.createObjectURL(blob)
    const a = document.createElement("a")
    a.href = url
    a.download = "email-template.html"
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    URL.revokeObjectURL(url)
  }

  return (
    <div className="h-full flex flex-col">
      {/* Preview Header */}
      <div className="flex items-center justify-between p-4 border-b">
        <div className="flex items-center gap-2">
          <Eye className="h-4 w-4" />
          <span className="font-medium">Preview</span>
        </div>
        <div className="flex items-center gap-2">
          <Button
            variant={viewMode === "desktop" ? "default" : "outline"}
            size="sm"
            onClick={() => setViewMode("desktop")}
          >
            <Monitor size={14} />
          </Button>
          <Button
            variant={viewMode === "tablet" ? "default" : "outline"}
            size="sm"
            onClick={() => setViewMode("tablet")}
          >
            <Tablet size={14} />
          </Button>
          <Button
            variant={viewMode === "mobile" ? "default" : "outline"}
            size="sm"
            onClick={() => setViewMode("mobile")}
          >
            <Smartphone size={14} />
          </Button>
        </div>
      </div>

      {/* Preview Content */}
      <div className="flex-1">
        <Tabs value={activeTab} onValueChange={(value) => setActiveTab(value as any)} className="h-full flex flex-col">
          <div className="px-4 pt-2">
            <TabsList>
              <TabsTrigger value="preview">Preview</TabsTrigger>
              <TabsTrigger value="code">HTML Code</TabsTrigger>
            </TabsList>
          </div>

          <TabsContent value="preview" className="flex-1 m-0">
            <ScrollArea className="h-full">
              <div className="p-4">
                <div
                  className="mx-auto border rounded-lg overflow-hidden bg-white shadow-sm"
                  style={{
                    width: viewMode === "desktop" ? "600px" : viewMode === "tablet" ? "768px" : "375px",
                    maxWidth: "100%",
                  }}
                >
                  {elements.length > 0 ? (
                    elements.map((element) => <div key={element.id}>{renderPreviewElement(element)}</div>)
                  ) : (
                    <div className="flex items-center justify-center h-64 text-muted-foreground">
                      <div className="text-center">
                        <Eye className="h-8 w-8 mx-auto mb-2 opacity-50" />
                        <p>No elements to preview</p>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </ScrollArea>
          </TabsContent>

          <TabsContent value="code" className="flex-1 m-0">
            <div className="h-full flex flex-col">
              <div className="flex justify-end gap-2 p-4 border-b">
                <Button variant="outline" size="sm" onClick={copyHtmlToClipboard}>
                  <Copy size={14} className="mr-2" />
                  Copy
                </Button>
                <Button variant="outline" size="sm" onClick={downloadHtml}>
                  <Download size={14} className="mr-2" />
                  Download
                </Button>
              </div>
              <ScrollArea className="flex-1">
                <pre className="p-4 text-xs">
                  <code>{generateHtml()}</code>
                </pre>
              </ScrollArea>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  )
}

export default PreviewPanel
