import { Header } from "@/sections/Header";
import { Footer } from "@/sections/Footer";
import { Button } from "@/components/Button";
import { DocsSidebar } from "@/components/DocsSidebar";
import Image from "next/image";

export default function SEODocs() {
  return (
    <>
      <Header />
      <div className="flex">
        <DocsSidebar />
        <main className="flex-1 py-10 px-6 max-w-4xl">
          <div className="mb-10">
            <div className="flex items-center gap-2 text-sm text-white/60 mb-4">
              <span>Documentación</span>
              <span>/</span>
              <span>Guías</span>
              <span>/</span>
              <span className="text-white">Optimización SEO</span>
            </div>
            
            <h1 className="text-3xl md:text-4xl font-semibold tracking-tight mb-6">Optimización SEO</h1>
            
            <p className="text-lg text-white/80 mb-8">
              Nuestra plataforma de IA SEO proporciona herramientas avanzadas para optimizar el posicionamiento de tu sitio web en los motores de búsqueda de manera eficiente y efectiva.
            </p>

            <div className="border border-white/15 rounded-lg overflow-hidden mb-10">
              <div className="bg-[#1F1F1F] p-3 border-b border-white/10">
                <div className="flex space-x-1.5">
                  <div className="w-3 h-3 rounded-full bg-red-500"></div>
                  <div className="w-3 h-3 rounded-full bg-yellow-500"></div>
                  <div className="w-3 h-3 rounded-full bg-green-500"></div>
                </div>
              </div>
              <div className="p-4 bg-[#121212]">
                <div className="h-[300px] w-full bg-[#1F1F1F]/70 rounded-md flex items-center justify-center">
                  <div className="text-center">
                    <div className="inline-flex items-center justify-center h-16 w-16 rounded-lg bg-[#8c44ff]/20 mb-4">
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-[#8c44ff]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                      </svg>
                    </div>
                    <p className="text-white/70">Vista previa del panel de optimización SEO</p>
                  </div>
                </div>
              </div>
            </div>

            <div className="grid md:grid-cols-2 gap-6 mb-12">
              <div className="border border-white/15 rounded-lg p-5 bg-[#1F1F1F]/50 hover:border-[#8c44ff]/50 transition-colors">
                <h3 className="text-xl font-medium mb-2">Análisis de palabras clave</h3>
                <p className="text-white/70">
                  Identifica las palabras clave más relevantes para tu nicho y descubre oportunidades de posicionamiento con nuestro análisis impulsado por IA.
                </p>
              </div>
              
              <div className="border border-white/15 rounded-lg p-5 bg-[#1F1F1F]/50 hover:border-[#8c44ff]/50 transition-colors">
                <h3 className="text-xl font-medium mb-2">Optimización de contenido</h3>
                <p className="text-white/70">
                  Recibe recomendaciones precisas para mejorar tu contenido y hacerlo más relevante para los motores de búsqueda y tus usuarios.
                </p>
              </div>
              
              <div className="border border-white/15 rounded-lg p-5 bg-[#1F1F1F]/50 hover:border-[#8c44ff]/50 transition-colors">
                <h3 className="text-xl font-medium mb-2">Análisis de competencia</h3>
                <p className="text-white/70">
                  Compara tu sitio con tus competidores y descubre estrategias efectivas para superarlos en los resultados de búsqueda.
                </p>
              </div>
              
              <div className="border border-white/15 rounded-lg p-5 bg-[#1F1F1F]/50 hover:border-[#8c44ff]/50 transition-colors">
                <h3 className="text-xl font-medium mb-2">Seguimiento de posiciones</h3>
                <p className="text-white/70">
                  Monitorea tus posiciones en los motores de búsqueda y recibe alertas sobre cambios importantes en tu visibilidad.
                </p>
              </div>
            </div>

            <div className="mb-12">
              <h2 className="text-2xl font-medium mb-4">Cómo funciona</h2>
              
              <div className="space-y-6">
                <div className="flex gap-4">
                  <div className="h-8 w-8 rounded-full bg-[#8c44ff] flex items-center justify-center shrink-0">
                    <span className="text-black font-medium">1</span>
                  </div>
                  <div>
                    <h3 className="text-xl font-medium mb-1">Análisis inicial</h3>
                    <p className="text-white/70">
                      Nuestra IA analiza tu sitio web y recopila datos sobre su estructura, contenido y rendimiento actual en los motores de búsqueda.
                    </p>
                  </div>
                </div>
                
                <div className="flex gap-4">
                  <div className="h-8 w-8 rounded-full bg-[#8c44ff] flex items-center justify-center shrink-0">
                    <span className="text-black font-medium">2</span>
                  </div>
                  <div>
                    <h3 className="text-xl font-medium mb-1">Identificación de oportunidades</h3>
                    <p className="text-white/70">
                      Basándose en el análisis, la plataforma identifica oportunidades de mejora y áreas que requieren atención inmediata.
                    </p>
                  </div>
                </div>
                
                <div className="flex gap-4">
                  <div className="h-8 w-8 rounded-full bg-[#8c44ff] flex items-center justify-center shrink-0">
                    <span className="text-black font-medium">3</span>
                  </div>
                  <div>
                    <h3 className="text-xl font-medium mb-1">Recomendaciones personalizadas</h3>
                    <p className="text-white/70">
                      Recibes recomendaciones específicas y accionables para mejorar tu SEO, adaptadas a tu industria y objetivos.
                    </p>
                  </div>
                </div>
                
                <div className="flex gap-4">
                  <div className="h-8 w-8 rounded-full bg-[#8c44ff] flex items-center justify-center shrink-0">
                    <span className="text-black font-medium">4</span>
                  </div>
                  <div>
                    <h3 className="text-xl font-medium mb-1">Implementación y seguimiento</h3>
                    <p className="text-white/70">
                      Implementa las recomendaciones y monitorea los resultados en tiempo real a través de nuestro panel de control intuitivo.
                    </p>
                  </div>
                </div>
              </div>
            </div>

            <div className="mb-12">
              <h2 className="text-2xl font-medium mb-4">Ejemplos de código</h2>
              
              <div className="border border-white/15 rounded-lg overflow-hidden mb-6">
                <div className="bg-[#1F1F1F] p-3 border-b border-white/10 flex justify-between items-center">
                  <span className="text-white/70">Ejemplo de meta etiquetas optimizadas</span>
                  <button className="text-white/50 hover:text-white">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                    </svg>
                  </button>
                </div>
                <div className="p-4 bg-[#121212] overflow-x-auto">
                  <pre className="text-white/80 font-mono text-sm">
                    <code>{`<head>
  <title>Título optimizado con palabras clave principales | Marca</title>
  <meta name="description" content="Descripción concisa y atractiva que incluye palabras clave relevantes y llamada a la acción." />
  <meta name="keywords" content="palabra clave 1, palabra clave 2, palabra clave 3" />
  <meta property="og:title" content="Título optimizado para compartir en redes sociales" />
  <meta property="og:description" content="Descripción atractiva para compartir en redes sociales" />
  <meta property="og:image" content="https://ejemplo.com/imagen-optimizada.jpg" />
  <meta property="og:url" content="https://ejemplo.com/pagina-optimizada" />
  <meta name="twitter:card" content="summary_large_image" />
</head>`}</code>
                  </pre>
                </div>
              </div>
              
              <div className="border border-white/15 rounded-lg overflow-hidden">
                <div className="bg-[#1F1F1F] p-3 border-b border-white/10 flex justify-between items-center">
                  <span className="text-white/70">Ejemplo de estructura de URL optimizada</span>
                  <button className="text-white/50 hover:text-white">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                    </svg>
                  </button>
                </div>
                <div className="p-4 bg-[#121212] overflow-x-auto">
                  <pre className="text-white/80 font-mono text-sm">
                    <code>{`// Estructura de URL no optimizada
https://ejemplo.com/p=123

// Estructura de URL optimizada
https://ejemplo.com/categoria/subcategoria/palabra-clave-principal

// Implementación en Next.js
// pages/[categoria]/[subcategoria]/[slug].js`}</code>
                  </pre>
                </div>
              </div>
            </div>

            <div className="border-t border-white/10 pt-8">
              <h2 className="text-2xl font-medium mb-4">¿Necesitas ayuda?</h2>
              
              <div className="flex flex-col md:flex-row gap-4">
                <a href="#" className="text-[#8c44ff] hover:text-[#a369ff] flex items-center gap-2">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  <span>Preguntas frecuentes</span>
                </a>
                
                <a href="#" className="text-[#8c44ff] hover:text-[#a369ff] flex items-center gap-2">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                  </svg>
                  <span>Contactar soporte</span>
                </a>
                
                <a href="#" className="text-[#8c44ff] hover:text-[#a369ff] flex items-center gap-2">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8h2a2 2 0 012 2v6a2 2 0 01-2 2h-2v4l-4-4H9a1.994 1.994 0 01-1.414-.586m0 0L11 14h4a2 2 0 002-2V6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2v4l.586-.586z" />
                  </svg>
                  <span>Comunidad</span>
                </a>
              </div>
            </div>
          </div>
        </main>
      </div>
      <Footer />
    </>
  );
}