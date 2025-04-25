import { Header } from "@/components/site/sections/Header";
import { Footer } from "@/components/site/sections/Footer";
import { Button } from "@/components/Button";

export default function Features() {
  return (
    <>
      <Header />
      <main className="py-20 md:py-24">
        <div className="container">
          <h1 className="text-4xl md:text-6xl font-semibold tracking-tighter text-center mb-10">Características</h1>
          
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8 mt-12">
            <div className="border border-white/15 rounded-xl p-6 backdrop-blur">
              <h3 className="text-xl font-medium mb-3">Análisis Inteligente</h3>
              <p className="text-white/70">Nuestro sistema de IA analiza tu sitio web y proporciona recomendaciones personalizadas para mejorar tu SEO.</p>
            </div>
            
            <div className="border border-white/15 rounded-xl p-6 backdrop-blur">
              <h3 className="text-xl font-medium mb-3">Generador de Palabras Clave</h3>
              <p className="text-white/70">Encuentra las mejores palabras clave para tu nicho con nuestro generador impulsado por IA.</p>
            </div>
            
            <div className="border border-white/15 rounded-xl p-6 backdrop-blur">
              <h3 className="text-xl font-medium mb-3">Optimización de Contenido</h3>
              <p className="text-white/70">Mejora tu contenido existente con sugerencias inteligentes basadas en los últimos algoritmos de búsqueda.</p>
            </div>
            
            <div className="border border-white/15 rounded-xl p-6 backdrop-blur">
              <h3 className="text-xl font-medium mb-3">Seguimiento de Posiciones</h3>
              <p className="text-white/70">Monitorea tus posiciones en los motores de búsqueda y recibe alertas cuando hay cambios significativos.</p>
            </div>
            
            <div className="border border-white/15 rounded-xl p-6 backdrop-blur">
              <h3 className="text-xl font-medium mb-3">Análisis de Competencia</h3>
              <p className="text-white/70">Compara tu sitio con la competencia y descubre oportunidades para superarlos.</p>
            </div>
            
            <div className="border border-white/15 rounded-xl p-6 backdrop-blur">
              <h3 className="text-xl font-medium mb-3">Informes Detallados</h3>
              <p className="text-white/70">Recibe informes detallados sobre el rendimiento de tu sitio y las acciones recomendadas.</p>
            </div>
          </div>
          
          <div className="flex justify-center mt-12">
            <Button>Unirse a la Lista</Button>
          </div>
        </div>
      </main>
      <Footer />
    </>
  );
}