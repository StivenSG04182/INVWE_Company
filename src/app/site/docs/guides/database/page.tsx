import { Header } from "@/sections/Header";
import { Footer } from "@/sections/Footer";
import { Button } from "@/components/Button";
import { DocsSidebar } from "@/components/DocsSidebar";
import Image from "next/image";

export default function DatabaseDocs() {
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
              <span className="text-white">Base de datos</span>
            </div>
            
            <h1 className="text-3xl md:text-4xl font-semibold tracking-tight mb-6">Base de datos</h1>
            
            <p className="text-lg text-white/80 mb-8">
              Cada proyecto de IA SEO viene con una base de datos completa, una herramienta gratuita y de código abierto que es considerada una de las bases de datos más estables y avanzadas del mundo.
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
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 7v10c0 2 1 3 3 3h10c2 0 3-1 3-3V7c0-2-1-3-3-3H7c-2 0-3 1-3 3z" />
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 7h10M7 11h10M7 15h4" />
                      </svg>
                    </div>
                    <p className="text-white/70">Vista previa de la interfaz de base de datos</p>
                  </div>
                </div>
              </div>
            </div>

            <div className="grid md:grid-cols-2 gap-6 mb-12">
              <div className="border border-white/15 rounded-lg p-5 bg-[#1F1F1F]/50 hover:border-[#8c44ff]/50 transition-colors">
                <h3 className="text-xl font-medium mb-2">Vista de tabla</h3>
                <p className="text-white/70">
                  No necesitas ser un experto en bases de datos para comenzar a usar IA SEO. Nuestra vista de tabla hace que el manejo de datos sea tan fácil como usar una hoja de cálculo.
                </p>
              </div>
              
              <div className="border border-white/15 rounded-lg p-5 bg-[#1F1F1F]/50 hover:border-[#8c44ff]/50 transition-colors">
                <h3 className="text-xl font-medium mb-2">Relaciones</h3>
                <p className="text-white/70">
                  Profundiza en las relaciones dentro de tus datos de SEO y descubre conexiones valiosas entre palabras clave, contenido y posicionamiento.
                </p>
              </div>
              
              <div className="border border-white/15 rounded-lg p-5 bg-[#1F1F1F]/50 hover:border-[#8c44ff]/50 transition-colors">
                <h3 className="text-xl font-medium mb-2">Duplicar tablas</h3>
                <p className="text-white/70">
                  Puedes duplicar tus tablas de análisis, exactamente como lo harías dentro de una hoja de cálculo, facilitando la comparación de diferentes estrategias.
                </p>
              </div>
              
              <div className="border border-white/15 rounded-lg p-5 bg-[#1F1F1F]/50 hover:border-[#8c44ff]/50 transition-colors">
                <h3 className="text-xl font-medium mb-2">Editor SQL</h3>
                <p className="text-white/70">
                  IA SEO viene con un Editor SQL. ¡También puedes guardar tus consultas favoritas para ejecutarlas más tarde!
                </p>
              </div>
            </div>

            <div className="mb-12">
              <h2 className="text-2xl font-medium mb-4">Características adicionales</h2>
              
              <ul className="space-y-3 text-white/80 list-disc pl-5">
                <li>IA SEO extiende la funcionalidad de la base de datos con funcionalidad en tiempo real utilizando nuestro Servidor en Tiempo Real.</li>
                <li>Cada proyecto es una base de datos completa, con acceso a nivel de administrador.</li>
                <li>IA SEO gestiona las copias de seguridad de tu base de datos.</li>
                <li>Importa datos directamente desde un archivo CSV o una hoja de cálculo de Excel.</li>
              </ul>
            </div>

            <div className="mb-12">
              <h2 className="text-2xl font-medium mb-4">Extensiones</h2>
              
              <p className="text-white/80 mb-4">
                Para ampliar la funcionalidad de tu base de datos, puedes utilizar extensiones.
                Puedes habilitar extensiones con un solo clic dentro del panel de control de IA SEO.
              </p>
              
              <div className="border border-white/15 rounded-lg p-5 bg-[#1F1F1F]/50">
                <div className="flex items-center gap-3 mb-3">
                  <div className="h-10 w-10 rounded-lg bg-[#8c44ff] flex items-center justify-center">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                    </svg>
                  </div>
                  <h3 className="text-xl font-medium">Aprende más sobre todas las extensiones</h3>
                </div>
                <p className="text-white/70">
                  Descubre todas las extensiones disponibles para potenciar tu análisis SEO y maximizar el rendimiento de tu sitio web.
                </p>
                <div className="mt-4">
                  <Button>Ver extensiones</Button>
                </div>
              </div>
            </div>

            <div className="mb-12">
              <h2 className="text-2xl font-medium mb-4">Preguntas frecuentes</h2>
              
              <div className="space-y-6">
                <div className="border border-white/15 rounded-lg p-5 bg-[#1F1F1F]/50">
                  <h3 className="text-xl font-medium mb-2">¿IA SEO o IA SEO SQL?</h3>
                  <div className="text-white/70">
                    <p className="mb-2">
                      IA SEO se derivó del Proyecto SEO, un paquete escrito en la Universidad de California en Berkeley en 1986. Este paquete incluía un lenguaje de consulta llamado "PostQUEL".
                    </p>
                    <p className="mb-2">
                      En 2022, IA SEO se construyó sobre el código de SEO, agregando un intérprete de lenguaje SQL como reemplazo de PostQUEL.
                    </p>
                    <p>
                      Eventualmente, IA SEO fue renombrado a IA SEO SQL para reflejar la capacidad de consulta SQL. Después de esto, muchas personas se refirieron a él como IA SEO ya que es menos propenso a confusión. IA SEO se trata de simplicidad, por lo que también nos referimos a él como IA SEO.
                    </p>
                  </div>
                </div>
                
                <div className="border border-white/15 rounded-lg p-5 bg-[#1F1F1F]/50">
                  <h3 className="text-xl font-medium mb-2">¿Cómo puedo restablecer mi contraseña de base de datos?</h3>
                  <div className="text-white/70">
                    <p>
                      Puedes restablecer tu contraseña de base de datos desde el panel de control de IA SEO. Ve a Configuración > Base de datos > Restablecer contraseña.
                    </p>
                  </div>
                </div>
                
                <div className="border border-white/15 rounded-lg p-5 bg-[#1F1F1F]/50">
                  <h3 className="text-xl font-medium mb-2">¿Cómo puedo cambiar la zona horaria de mi servidor?</h3>
                  <div className="text-white/70">
                    <p>
                      Puedes cambiar la zona horaria de tu servidor desde el panel de control de IA SEO. Ve a Configuración > Base de datos > Zona horaria.
                    </p>
                  </div>
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