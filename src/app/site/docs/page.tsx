'use client'

import { useEffect } from 'react'
import { gsap } from 'gsap'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Download, FileText, Image, Video, BookOpen } from 'lucide-react'

const documentCategories = [
  {
    title: 'Certificaciones',
    icon: FileText,
    documents: [
      { name: 'Certificación Orgánica', type: 'PDF', size: '2.3 MB', description: 'Certificación oficial de productos orgánicos' },
      { name: 'Certificación de Calidad ISO', type: 'PDF', size: '1.8 MB', description: 'Certificación ISO 9001:2015' },
      { name: 'Registro Sanitario', type: 'PDF', size: '1.2 MB', description: 'Registro sanitario INVIMA' },
      { name: 'Certificación BPM', type: 'PDF', size: '2.1 MB', description: 'Buenas Prácticas de Manufactura' }
    ]
  },
  {
    title: 'Guías de Productos',
    icon: BookOpen,
    documents: [
      { name: 'Guía de Especias y Hierbas', type: 'PDF', size: '5.2 MB', description: 'Propiedades y usos de especias medicinales' },
      { name: 'Manual de Infusiones', type: 'PDF', size: '3.8 MB', description: 'Preparación y beneficios de infusiones' },
      { name: 'Catálogo de Frutas Deshidratadas', type: 'PDF', size: '4.1 MB', description: 'Información nutricional completa' },
      { name: 'Recetario Saludable', type: 'PDF', size: '6.5 MB', description: 'Recetas con productos naturales' }
    ]
  },
  {
    title: 'Material Educativo',
    icon: Video,
    documents: [
      { name: 'Video: Alimentación Consciente', type: 'MP4', size: '45 MB', description: 'Introducción a la alimentación consciente' },
      { name: 'Webinar: Hierbas Medicinales', type: 'MP4', size: '120 MB', description: 'Taller completo sobre hierbas medicinales' },
      { name: 'Presentación: Vida Saludable', type: 'PDF', size: '8.2 MB', description: 'Principios de vida saludable' },
      { name: 'Infografía: Beneficios Naturales', type: 'PNG', size: '2.8 MB', description: 'Beneficios de productos naturales' }
    ]
  },
  {
    title: 'Documentos Legales',
    icon: FileText,
    documents: [
      { name: 'Términos y Condiciones', type: 'PDF', size: '890 KB', description: 'Términos de uso actualizados' },
      { name: 'Política de Privacidad', type: 'PDF', size: '720 KB', description: 'Política de tratamiento de datos' },
      { name: 'Política de Devoluciones', type: 'PDF', size: '650 KB', description: 'Condiciones de devolución' },
      { name: 'Contrato de Servicios', type: 'PDF', size: '1.1 MB', description: 'Modelo de contrato de servicios' }
    ]
  }
]

export default function DocsPage() {
  useEffect(() => {
    gsap.fromTo('.docs-header', 
      { opacity: 0, y: 30 },
      { opacity: 1, y: 0, duration: 0.8, ease: 'power2.out' }
    )

    gsap.fromTo('.docs-card', 
      { opacity: 0, y: 50, scale: 0.9 },
      { 
        opacity: 1, 
        y: 0, 
        scale: 1,
        duration: 0.6,
        stagger: 0.1,
        ease: 'power2.out',
        delay: 0.3
      }
    )
  }, [])

  const getFileIcon = (type: string) => {
    switch (type.toLowerCase()) {
      case 'pdf':
        return FileText
      case 'mp4':
        return Video
      case 'png':
      case 'jpg':
        return Image
      default:
        return FileText
    }
  }

  const getFileColor = (type: string) => {
    switch (type.toLowerCase()) {
      case 'pdf':
        return 'bg-red-100 text-red-600'
      case 'mp4':
        return 'bg-blue-100 text-blue-600'
      case 'png':
      case 'jpg':
        return 'bg-green-100 text-green-600'
      default:
        return 'bg-gray-100 text-gray-600'
    }
  }

  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="container mx-auto px-4">
        {/* Header */}
        <div className="docs-header text-center mb-16">
          <h1 className="text-4xl lg:text-5xl font-bold text-[#486283] mb-6 font-['Plus_Jakarta_Sans']">
            Centro de Documentos
          </h1>
          <p className="text-lg text-gray-600 max-w-3xl mx-auto leading-relaxed">
            Accede a toda la documentación, certificaciones, guías y material 
            educativo de Natulanda en un solo lugar.
          </p>
        </div>

        {/* Quick Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-12">
          <Card className="docs-card text-center">
            <CardContent className="p-6">
              <div className="text-3xl font-bold text-[#486283] mb-2">25+</div>
              <div className="text-gray-600">Documentos</div>
            </CardContent>
          </Card>
          <Card className="docs-card text-center">
            <CardContent className="p-6">
              <div className="text-3xl font-bold text-[#899735] mb-2">4</div>
              <div className="text-gray-600">Categorías</div>
            </CardContent>
          </Card>
          <Card className="docs-card text-center">
            <CardContent className="p-6">
              <div className="text-3xl font-bold text-[#486283] mb-2">100%</div>
              <div className="text-gray-600">Actualizados</div>
            </CardContent>
          </Card>
          <Card className="docs-card text-center">
            <CardContent className="p-6">
              <div className="text-3xl font-bold text-[#899735] mb-2">24/7</div>
              <div className="text-gray-600">Disponibles</div>
            </CardContent>
          </Card>
        </div>

        {/* Document Categories */}
        <div className="space-y-12">
          {documentCategories.map((category, categoryIndex) => (
            <div key={categoryIndex}>
              <div className="flex items-center gap-4 mb-8">
                <div className="w-12 h-12 bg-[#486283] rounded-lg flex items-center justify-center">
                  <category.icon className="h-6 w-6 text-white" />
                </div>
                <h2 className="text-2xl font-bold text-[#486283]">
                  {category.title}
                </h2>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {category.documents.map((doc, docIndex) => {
                  const FileIcon = getFileIcon(doc.type)
                  return (
                    <Card key={docIndex} className="docs-card group hover:shadow-xl transition-all duration-300">
                      <CardContent className="p-6">
                        <div className="flex items-start gap-4 mb-4">
                          <div className={`w-12 h-12 rounded-lg flex items-center justify-center ${getFileColor(doc.type)}`}>
                            <FileIcon className="h-6 w-6" />
                          </div>
                          <div className="flex-1">
                            <h3 className="font-semibold text-[#486283] mb-1 group-hover:text-[#899735] transition-colors">
                              {doc.name}
                            </h3>
                            <div className="flex items-center gap-2 mb-2">
                              <Badge variant="outline" className="text-xs">
                                {doc.type}
                              </Badge>
                              <span className="text-xs text-gray-500">{doc.size}</span>
                            </div>
                          </div>
                        </div>
                        
                        <p className="text-gray-600 text-sm mb-4 leading-relaxed">
                          {doc.description}
                        </p>

                        <Button 
                          className="w-full bg-[#486283] hover:bg-[#486283]/90 text-white group-hover:bg-[#899735] transition-colors"
                          size="sm"
                        >
                          <Download className="h-4 w-4 mr-2" />
                          Descargar
                        </Button>
                      </CardContent>
                    </Card>
                  )
                })}
              </div>
            </div>
          ))}
        </div>

        {/* Help Section */}
        <Card className="docs-card mt-16 bg-[#486283] text-white">
          <CardContent className="p-12 text-center">
            <h2 className="text-3xl font-bold mb-6">
              ¿Necesitas Ayuda con los Documentos?
            </h2>
            <p className="text-xl mb-8 opacity-90 max-w-2xl mx-auto">
              Nuestro equipo está disponible para ayudarte a encontrar la información 
              que necesitas o resolver cualquier duda sobre nuestros documentos.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button className="bg-[#899735] hover:bg-[#899735]/90 text-white px-8 py-3">
                Contactar Soporte
              </Button>
              <Button variant="outline" className="border-white text-white hover:bg-white hover:text-[#486283] px-8 py-3">
                Ver FAQ
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}