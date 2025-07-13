"use client"

import { useState, useEffect, useRef } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { ChevronRight, Search, BookOpen, Menu, X, ExternalLink, Copy, Check } from "lucide-react"
import ReactMarkdown from "react-markdown"
import remarkGfm from "remark-gfm"
import { Prism as SyntaxHighlighter } from "react-syntax-highlighter"
import { vscDarkPlus } from "react-syntax-highlighter"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Badge } from "@/components/ui/badge"
import { documentationContent } from "@/data/documentation"
import type { LucideIcon } from "lucide-react"

interface DocumentationSection {
  id: string
  title: string
  icon: LucideIcon
  description: string
  content: string
  color: string
  subsections?: DocumentationSubsection[]
}

interface DocumentationSubsection {
  id: string
  title: string
  content: string
}

interface TableOfContentsItem {
  id: string
  title: string
  level: number
}

interface DocumentationLayoutProps {
  sections: DocumentationSection[]
  initialSection?: string
}

export function DocumentationLayout({ sections, initialSection }: DocumentationLayoutProps) {
  const [activeSection, setActiveSection] = useState(initialSection || sections[0]?.id)
  const [searchQuery, setSearchQuery] = useState("")
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const [tableOfContents, setTableOfContents] = useState<TableOfContentsItem[]>([])
  const [activeHeading, setActiveHeading] = useState("")
  const [copiedCode, setCopiedCode] = useState("")
  const contentRef = useRef<HTMLDivElement>(null)

  const currentSection = sections.find((section) => section.id === activeSection)

  // Extract table of contents from markdown content
  useEffect(() => {
    if (currentSection) {
      const content = documentationContent[currentSection.content as keyof typeof documentationContent] || ""
      const headings = content.match(/^#{1,6}\s+.+$/gm) || []
      const toc = headings.map((heading, index) => {
        const level = heading.match(/^#+/)?.[0].length || 1
        const title = heading.replace(/^#+\s+/, "")
        const id = title
          .toLowerCase()
          .replace(/[^a-z0-9]+/g, "-")
          .replace(/(^-|-$)/g, "")
        return { id: `heading-${index}`, title, level }
      })
      setTableOfContents(toc)
    }
  }, [currentSection])

  // Handle scroll spy for active heading
  useEffect(() => {
    const handleScroll = () => {
      if (!contentRef.current) return

      const headings = contentRef.current.querySelectorAll("h1, h2, h3, h4, h5, h6")
      let current = ""

      headings.forEach((heading) => {
        const rect = heading.getBoundingClientRect()
        if (rect.top <= 100) {
          current = heading.id
        }
      })

      setActiveHeading(current)
    }

    const contentElement = contentRef.current
    if (contentElement) {
      contentElement.addEventListener("scroll", handleScroll)
      return () => contentElement.removeEventListener("scroll", handleScroll)
    }
  }, [currentSection])

  const filteredSections = sections.filter(
    (section) =>
      section.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      section.description.toLowerCase().includes(searchQuery.toLowerCase()),
  )

  const copyToClipboard = async (text: string) => {
    try {
      await navigator.clipboard.writeText(text)
      setCopiedCode(text)
      setTimeout(() => setCopiedCode(""), 2000)
    } catch (err) {
      console.error("Failed to copy text: ", err)
    }
  }

  const scrollToHeading = (headingId: string) => {
    const element = document.getElementById(headingId)
    if (element) {
      element.scrollIntoView({ behavior: "smooth", block: "start" })
    }
  }

  return (
    <div className="flex h-screen bg-gray-50 overflow-hidden">
      {/* Mobile Sidebar Overlay */}
      <AnimatePresence>
        {sidebarOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 backdrop-blur-sm z-40 lg:hidden"
            onClick={() => setSidebarOpen(false)}
          />
        )}
      </AnimatePresence>

      {/* Left Sidebar - Navigation */}
      <motion.aside
        initial={false}
        animate={{ x: sidebarOpen ? 0 : 0 }}
        className="w-80 h-full bg-white border-r border-gray-200 flex-shrink-0 lg:block hidden"
      >
        <div className="flex flex-col h-full">
          {/* Sidebar Header */}
          <div className="p-6 border-b border-gray-200">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-lg bg-[#486283] flex items-center justify-center">
                  <BookOpen className="h-5 w-5 text-white" />
                </div>
                <h2 className="text-lg font-semibold text-[#486283]">Documentación</h2>
              </div>
            </div>

            {/* Search */}
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
              <Input
                placeholder="Buscar documentación..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>
          </div>

          {/* Navigation Menu */}
          <ScrollArea className="flex-1 p-4">
            <nav className="space-y-2">
              {filteredSections.map((section) => {
                const Icon = section.icon
                const isActive = activeSection === section.id

                return (
                  <motion.button
                    key={section.id}
                    whileHover={{ x: 4 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={() => {
                      setActiveSection(section.id)
                      setSidebarOpen(false)
                    }}
                    className={`w-full flex items-center gap-3 p-3 rounded-lg text-left transition-colors ${
                      isActive ? "bg-[#486283] text-white" : "hover:bg-gray-100 text-gray-700"
                    }`}
                  >
                    <div
                      className={`w-8 h-8 rounded-lg flex items-center justify-center ${
                        isActive ? "bg-white/20" : section.color
                      }`}
                    >
                      <Icon className={`h-4 w-4 ${isActive ? "text-white" : ""}`} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="font-medium truncate">{section.title}</div>
                      <div className={`text-xs truncate ${isActive ? "text-white/70" : "text-gray-500"}`}>
                        {section.description}
                      </div>
                    </div>
                    {isActive && <ChevronRight className="h-4 w-4 text-white" />}
                  </motion.button>
                )
              })}
            </nav>
          </ScrollArea>

          {/* Sidebar Footer */}
          <div className="p-4 border-t border-gray-200">
            <div className="flex items-center gap-2 text-sm text-gray-500">
              <Badge variant="secondary" className="text-xs">
                v2.0
              </Badge>
              <span>Última actualización: 11/06/2025</span>
            </div>
          </div>
        </div>
      </motion.aside>

      {/* Mobile Sidebar */}
      <motion.aside
        initial={{ x: "-100%" }}
        animate={{ x: sidebarOpen ? 0 : "-100%" }}
        className="fixed lg:hidden w-80 h-full bg-white border-r border-gray-200 z-50"
      >
        <div className="flex flex-col h-full">
          {/* Mobile Sidebar Header */}
          <div className="p-6 border-b border-gray-200">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-lg bg-[#486283] flex items-center justify-center">
                  <BookOpen className="h-5 w-5 text-white" />
                </div>
                <h2 className="text-lg font-semibold text-[#486283]">Documentación</h2>
              </div>
              <Button variant="ghost" size="sm" onClick={() => setSidebarOpen(false)}>
                <X className="h-4 w-4" />
              </Button>
            </div>

            {/* Mobile Search */}
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
              <Input
                placeholder="Buscar documentación..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>
          </div>

          {/* Mobile Navigation Menu */}
          <ScrollArea className="flex-1 p-4">
            <nav className="space-y-2">
              {filteredSections.map((section) => {
                const Icon = section.icon
                const isActive = activeSection === section.id

                return (
                  <motion.button
                    key={section.id}
                    whileHover={{ x: 4 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={() => {
                      setActiveSection(section.id)
                      setSidebarOpen(false)
                    }}
                    className={`w-full flex items-center gap-3 p-3 rounded-lg text-left transition-colors ${
                      isActive ? "bg-[#486283] text-white" : "hover:bg-gray-100 text-gray-700"
                    }`}
                  >
                    <div
                      className={`w-8 h-8 rounded-lg flex items-center justify-center ${
                        isActive ? "bg-white/20" : section.color
                      }`}
                    >
                      <Icon className={`h-4 w-4 ${isActive ? "text-white" : ""}`} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="font-medium truncate">{section.title}</div>
                      <div className={`text-xs truncate ${isActive ? "text-white/70" : "text-gray-500"}`}>
                        {section.description}
                      </div>
                    </div>
                    {isActive && <ChevronRight className="h-4 w-4 text-white" />}
                  </motion.button>
                )
              })}
            </nav>
          </ScrollArea>
        </div>
      </motion.aside>

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Top Bar */}
        <header className="bg-white border-b border-gray-200 p-4 lg:p-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Button variant="ghost" size="sm" className="lg:hidden" onClick={() => setSidebarOpen(true)}>
                <Menu className="h-4 w-4" />
              </Button>

              {currentSection && (
                <div className="flex items-center gap-3">
                  <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${currentSection.color}`}>
                    <currentSection.icon className="h-5 w-5" />
                  </div>
                  <div>
                    <h1 className="text-xl font-bold text-[#486283]">{currentSection.title}</h1>
                    <p className="text-sm text-gray-600">{currentSection.description}</p>
                  </div>
                </div>
              )}
            </div>

            <div className="flex items-center gap-2">
              <Button variant="outline" size="sm">
                <ExternalLink className="h-4 w-4 mr-2" />
                Compartir
              </Button>
            </div>
          </div>
        </header>

        {/* Content */}
        <div className="flex-1 flex min-h-0">
          {/* Main Content */}
          <ScrollArea className="flex-1 p-6 lg:p-8" ref={contentRef}>
            {currentSection && (
              <motion.div
                key={currentSection.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3 }}
                className="max-w-4xl mx-auto"
              >
                <div className="prose prose-lg max-w-none">
                  <ReactMarkdown
                    remarkPlugins={[remarkGfm]}
                    components={{
                      h1: ({ node, ...props }) => (
                        <h1
                          id={`heading-${tableOfContents.findIndex((item) => item.title === props.children?.[0])}`}
                          className="text-3xl font-bold text-[#486283] mb-6 scroll-mt-20"
                          {...props}
                        />
                      ),
                      h2: ({ node, ...props }) => (
                        <h2
                          id={`heading-${tableOfContents.findIndex((item) => item.title === props.children?.[0])}`}
                          className="text-2xl font-bold text-[#486283] mt-8 mb-4 scroll-mt-20"
                          {...props}
                        />
                      ),
                      h3: ({ node, ...props }) => (
                        <h3
                          id={`heading-${tableOfContents.findIndex((item) => item.title === props.children?.[0])}`}
                          className="text-xl font-bold text-[#486283] mt-6 mb-3 scroll-mt-20"
                          {...props}
                        />
                      ),
                      p: ({ node, ...props }) => <p className="text-gray-700 mb-4 leading-relaxed" {...props} />,
                      ul: ({ node, ...props }) => <ul className="list-disc pl-6 mb-4 space-y-2" {...props} />,
                      ol: ({ node, ...props }) => <ol className="list-decimal pl-6 mb-4 space-y-2" {...props} />,
                      li: ({ node, ...props }) => <li className="text-gray-700" {...props} />,
                      a: ({ node, ...props }) => (
                        <a className="text-[#486283] hover:text-[#899735] underline" {...props} />
                      ),
                      code: ({ node, inline, className, children, ...props }: any) => {
                        const match = /language-(\w+)/.exec(className || "")
                        const codeString = String(children).replace(/\n$/, "")

                        return !inline && match ? (
                          <div className="relative group">
                            <Button
                              variant="ghost"
                              size="sm"
                              className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity z-10"
                              onClick={() => copyToClipboard(codeString)}
                            >
                              {copiedCode === codeString ? (
                                <Check className="h-4 w-4 text-green-500" />
                              ) : (
                                <Copy className="h-4 w-4" />
                              )}
                            </Button>
                            <SyntaxHighlighter
                              style={vscDarkPlus}
                              language={match[1]}
                              PreTag="div"
                              className="rounded-lg my-4"
                              {...props}
                            >
                              {codeString}
                            </SyntaxHighlighter>
                          </div>
                        ) : (
                          <code className="bg-gray-100 rounded px-2 py-1 text-sm font-mono" {...props}>
                            {children}
                          </code>
                        )
                      },
                      blockquote: ({ node, ...props }) => (
                        <blockquote
                          className="border-l-4 border-[#486283] pl-4 italic text-gray-600 my-4 bg-blue-50 py-2 rounded-r"
                          {...props}
                        />
                      ),
                    }}
                  >
                    {documentationContent[currentSection.content as keyof typeof documentationContent] || ""}
                  </ReactMarkdown>
                </div>
              </motion.div>
            )}
          </ScrollArea>

          {/* Right Sidebar - Table of Contents */}
          <aside className="hidden xl:block w-64 border-l border-gray-200 bg-white">
            <div className="sticky top-0 p-6">
              <h3 className="text-sm font-semibold text-gray-900 mb-4">En esta página</h3>
              {tableOfContents.length > 0 ? (
                <nav className="space-y-2">
                  {tableOfContents.map((item, index) => (
                    <button
                      key={index}
                      onClick={() => scrollToHeading(item.id)}
                      className={`block w-full text-left text-sm transition-colors hover:text-[#486283] ${
                        activeHeading === item.id ? "text-[#486283] font-medium" : "text-gray-600"
                      }`}
                      style={{ paddingLeft: `${(item.level - 1) * 12}px` }}
                    >
                      {item.title}
                    </button>
                  ))}
                </nav>
              ) : (
                <p className="text-sm text-gray-500">No hay encabezados disponibles</p>
              )}

              {/* Quick Actions */}
              <div className="mt-8 pt-6 border-t border-gray-200">
                <h4 className="text-sm font-semibold text-gray-900 mb-3">Acciones rápidas</h4>
                <div className="space-y-2">
                  <Button variant="ghost" size="sm" className="w-full justify-start text-sm">
                    <ExternalLink className="h-4 w-4 mr-2" />
                    Editar página
                  </Button>
                  <Button variant="ghost" size="sm" className="w-full justify-start text-sm">
                    <Copy className="h-4 w-4 mr-2" />
                    Copiar enlace
                  </Button>
                </div>
              </div>
            </div>
          </aside>
        </div>
      </div>
    </div>
  )
}
