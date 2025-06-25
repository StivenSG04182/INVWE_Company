"use client"

import type React from "react"
import { useCallback, useMemo } from "react"
import { useEmailEditorStore } from "@/providers/email-editor/email-editor-provider"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Button } from "@/components/ui/button"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Slider } from "@/components/ui/slider"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Separator } from "@/components/ui/separator"
import {
  AlignLeft,
  AlignCenter,
  AlignRight,
  AlignJustify,
  Type,
  Palette,
  BracketsIcon as Spacing,
  Settings,
} from "lucide-react"

export const PropertiesPanel: React.FC = () => {
  const { selectedElement, updateElement } = useEmailEditorStore()

  // Hooks SIEMPRE se llaman, usan selectedElement (puede ser null)
  const handleStyleChange = useCallback((property: string, value: any) => {
    if (!selectedElement || !selectedElement.id) return;
    updateElement(selectedElement.id, {
      ...selectedElement,
      styles: {
        ...selectedElement.styles,
        [property]: value,
      },
    })
  }, [selectedElement, updateElement])

  const handleContentChange = useCallback((value: any) => {
    if (!selectedElement || !selectedElement.id) return;
    updateElement(selectedElement.id, {
      ...selectedElement,
      content: value,
    })
  }, [selectedElement, updateElement])

  const handleNestedContentChange = useCallback((key: string, value: any) => {
    if (!selectedElement || !selectedElement.id) return;
    if (typeof selectedElement.content === "object" && !Array.isArray(selectedElement.content)) {
      updateElement(selectedElement.id, {
        ...selectedElement,
        content: {
          ...selectedElement.content,
          [key]: value,
        },
      })
    }
  }, [selectedElement, updateElement])

  const contentControls = useMemo(() => {
    if (!selectedElement) return null;
    switch (selectedElement.type) {
      case "header":
      case "text":
        return (
          <div className="space-y-4">
            <div className="space-y-2">
              <Label className="text-sm font-medium">Content</Label>
              <Textarea
                value={selectedElement.content || ""}
                onChange={(e) => handleContentChange(e.target.value)}
                rows={4}
                className="resize-none"
              />
            </div>
            <div className="space-y-2">
              <Label className="text-sm font-medium">Text Alignment</Label>
              <div className="grid grid-cols-4 gap-1">
                {[
                  { value: "left", icon: AlignLeft },
                  { value: "center", icon: AlignCenter },
                  { value: "right", icon: AlignRight },
                  { value: "justify", icon: AlignJustify },
                ].map(({ value, icon: Icon }) => (
                  <Button
                    key={value}
                    variant={selectedElement.styles?.textAlign === value ? "default" : "outline"}
                    size="sm"
                    onClick={() => handleStyleChange("textAlign", value)}
                    className="h-8"
                  >
                    <Icon size={14} />
                  </Button>
                ))}
              </div>
            </div>
          </div>
        )
      case "image":
        return (
          <div className="space-y-4">
            <div className="space-y-2">
              <Label className="text-sm font-medium">Image URL</Label>
              <Input
                value={selectedElement.content?.src || ""}
                onChange={(e) => handleNestedContentChange("src", e.target.value)}
                placeholder="https://example.com/image.jpg"
              />
            </div>
            <div className="space-y-2">
              <Label className="text-sm font-medium">Alt Text</Label>
              <Input
                value={selectedElement.content?.alt || ""}
                onChange={(e) => handleNestedContentChange("alt", e.target.value)}
                placeholder="Image description"
              />
            </div>
          </div>
        )
      case "button":
        return (
          <div className="space-y-4">
            <div className="space-y-2">
              <Label className="text-sm font-medium">Button Text</Label>
              <Input
                value={selectedElement.content?.text || ""}
                onChange={(e) => handleNestedContentChange("text", e.target.value)}
                placeholder="Click here"
              />
            </div>
            <div className="space-y-2">
              <Label className="text-sm font-medium">Link URL</Label>
              <Input
                value={selectedElement.content?.url || ""}
                onChange={(e) => handleNestedContentChange("url", e.target.value)}
                placeholder="https://example.com"
              />
            </div>
          </div>
        )
      default:
        return null
    }
  }, [selectedElement, handleContentChange, handleNestedContentChange, handleStyleChange])

  if (!selectedElement) {
    return (
      <div className="flex items-center justify-center h-full p-8 text-center">
        <div>
          <Settings className="h-12 w-12 mx-auto mb-4 text-muted-foreground/50" />
          <h3 className="font-semibold mb-2">No Element Selected</h3>
          <p className="text-sm text-muted-foreground">Select an element from the canvas to edit its properties</p>
        </div>
      </div>
    )
  }

  return (
    <ScrollArea className="h-full">
      <div className="p-1">
        <div className="mb-4">
          <h3 className="font-semibold text-sm mb-1">
            {selectedElement.type.charAt(0).toUpperCase() + selectedElement.type.slice(1)}
          </h3>
          <p className="text-xs text-muted-foreground">ID: {selectedElement.id.slice(0, 8)}...</p>
        </div>

        <Tabs defaultValue="content" className="w-full">
          <TabsList className="grid w-full grid-cols-3 mb-4">
            <TabsTrigger value="content" className="text-xs">
              <Type className="h-3 w-3 mr-1" />
              Content
            </TabsTrigger>
            <TabsTrigger value="style" className="text-xs">
              <Palette className="h-3 w-3 mr-1" />
              Style
            </TabsTrigger>
            <TabsTrigger value="spacing" className="text-xs">
              <Spacing className="h-3 w-3 mr-1" />
              Layout
            </TabsTrigger>
          </TabsList>

          <TabsContent value="content" className="space-y-4 mt-0">
            {contentControls}
          </TabsContent>

          <TabsContent value="style" className="space-y-4 mt-0">
            {/* Typography */}
            {(selectedElement.type === "header" || selectedElement.type === "text") && (
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label className="text-sm font-medium">Font Size</Label>
                  <div className="flex items-center space-x-2">
                    <Slider
                      value={[Number.parseInt(selectedElement.styles?.fontSize) || 16]}
                      min={8}
                      max={72}
                      step={1}
                      onValueChange={(value) => handleStyleChange("fontSize", `${value[0]}px`)}
                      className="flex-1"
                    />
                    <span className="w-12 text-center text-sm">
                      {Number.parseInt(selectedElement.styles?.fontSize) || 16}px
                    </span>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label className="text-sm font-medium">Font Weight</Label>
                  <Select
                    value={selectedElement.styles?.fontWeight || "normal"}
                    onValueChange={(value) => handleStyleChange("fontWeight", value)}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="normal">Normal</SelectItem>
                      <SelectItem value="bold">Bold</SelectItem>
                      <SelectItem value="lighter">Light</SelectItem>
                      <SelectItem value="600">Semi Bold</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label className="text-sm font-medium">Line Height</Label>
                  <div className="flex items-center space-x-2">
                    <Slider
                      value={[Number.parseFloat(selectedElement.styles?.lineHeight) || 1.5]}
                      min={1}
                      max={3}
                      step={0.1}
                      onValueChange={(value) => handleStyleChange("lineHeight", value[0].toString())}
                      className="flex-1"
                    />
                    <span className="w-12 text-center text-sm">
                      {Number.parseFloat(selectedElement.styles?.lineHeight) || 1.5}
                    </span>
                  </div>
                </div>
              </div>
            )}

            <Separator />

            {/* Colors */}
            <div className="space-y-4">
              <div className="space-y-2">
                <Label className="text-sm font-medium">Text Color</Label>
                <div className="flex items-center space-x-2">
                  <div
                    className="w-8 h-8 border rounded"
                    style={{ backgroundColor: selectedElement.styles?.color || "#000000" }}
                  />
                  <Input
                    value={selectedElement.styles?.color || ""}
                    onChange={(e) => handleStyleChange("color", e.target.value)}
                    placeholder="#000000"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label className="text-sm font-medium">Background Color</Label>
                <div className="flex items-center space-x-2">
                  <div
                    className="w-8 h-8 border rounded"
                    style={{ backgroundColor: selectedElement.styles?.backgroundColor || "transparent" }}
                  />
                  <Input
                    value={selectedElement.styles?.backgroundColor || ""}
                    onChange={(e) => handleStyleChange("backgroundColor", e.target.value)}
                    placeholder="#ffffff"
                  />
                </div>
              </div>
            </div>

            <Separator />

            {/* Border */}
            <div className="space-y-4">
              <div className="space-y-2">
                <Label className="text-sm font-medium">Border Radius</Label>
                <div className="flex items-center space-x-2">
                  <Slider
                    value={[Number.parseInt(selectedElement.styles?.borderRadius) || 0]}
                    min={0}
                    max={50}
                    step={1}
                    onValueChange={(value) => handleStyleChange("borderRadius", `${value[0]}px`)}
                    className="flex-1"
                  />
                  <span className="w-12 text-center text-sm">
                    {Number.parseInt(selectedElement.styles?.borderRadius) || 0}px
                  </span>
                </div>
              </div>
            </div>
          </TabsContent>

          <TabsContent value="spacing" className="space-y-4 mt-0">
            {/* Padding */}
            <div className="space-y-4">
              <Label className="text-sm font-medium">Padding</Label>
              <div className="grid grid-cols-2 gap-2">
                <div className="space-y-1">
                  <Label className="text-xs">Top</Label>
                  <Input
                    value={selectedElement.styles?.paddingTop || ""}
                    onChange={(e) => handleStyleChange("paddingTop", e.target.value)}
                    placeholder="0px"
                    className="h-8"
                  />
                </div>
                <div className="space-y-1">
                  <Label className="text-xs">Right</Label>
                  <Input
                    value={selectedElement.styles?.paddingRight || ""}
                    onChange={(e) => handleStyleChange("paddingRight", e.target.value)}
                    placeholder="0px"
                    className="h-8"
                  />
                </div>
                <div className="space-y-1">
                  <Label className="text-xs">Bottom</Label>
                  <Input
                    value={selectedElement.styles?.paddingBottom || ""}
                    onChange={(e) => handleStyleChange("paddingBottom", e.target.value)}
                    placeholder="0px"
                    className="h-8"
                  />
                </div>
                <div className="space-y-1">
                  <Label className="text-xs">Left</Label>
                  <Input
                    value={selectedElement.styles?.paddingLeft || ""}
                    onChange={(e) => handleStyleChange("paddingLeft", e.target.value)}
                    placeholder="0px"
                    className="h-8"
                  />
                </div>
              </div>
            </div>

            <Separator />

            {/* Margin */}
            <div className="space-y-4">
              <Label className="text-sm font-medium">Margin</Label>
              <div className="grid grid-cols-2 gap-2">
                <div className="space-y-1">
                  <Label className="text-xs">Top</Label>
                  <Input
                    value={selectedElement.styles?.marginTop || ""}
                    onChange={(e) => handleStyleChange("marginTop", e.target.value)}
                    placeholder="0px"
                    className="h-8"
                  />
                </div>
                <div className="space-y-1">
                  <Label className="text-xs">Right</Label>
                  <Input
                    value={selectedElement.styles?.marginRight || ""}
                    onChange={(e) => handleStyleChange("marginRight", e.target.value)}
                    placeholder="0px"
                    className="h-8"
                  />
                </div>
                <div className="space-y-1">
                  <Label className="text-xs">Bottom</Label>
                  <Input
                    value={selectedElement.styles?.marginBottom || ""}
                    onChange={(e) => handleStyleChange("marginBottom", e.target.value)}
                    placeholder="0px"
                    className="h-8"
                  />
                </div>
                <div className="space-y-1">
                  <Label className="text-xs">Left</Label>
                  <Input
                    value={selectedElement.styles?.marginLeft || ""}
                    onChange={(e) => handleStyleChange("marginLeft", e.target.value)}
                    placeholder="0px"
                    className="h-8"
                  />
                </div>
              </div>
            </div>

            <Separator />

            {/* Dimensions */}
            <div className="space-y-4">
              <div className="space-y-2">
                <Label className="text-sm font-medium">Width</Label>
                <Input
                  value={selectedElement.styles?.width || ""}
                  onChange={(e) => handleStyleChange("width", e.target.value)}
                  placeholder="auto, 100%, 300px"
                />
              </div>
              <div className="space-y-2">
                <Label className="text-sm font-medium">Height</Label>
                <Input
                  value={selectedElement.styles?.height || ""}
                  onChange={(e) => handleStyleChange("height", e.target.value)}
                  placeholder="auto, 100px"
                />
              </div>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </ScrollArea>
  )
}

export default PropertiesPanel
