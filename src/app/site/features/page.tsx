import { Header } from "@/components/site/sections/Header";
import { Footer } from "@/components/site/sections/Footer";
import { Button } from "@/components/Button";

export default function Features() {
  return (
    <>
      <Header />
      <main className="py-20 md:py-24">
        <div className="container">
          <h1 className="text-4xl md:text-6xl font-semibold tracking-tighter text-center mb-10 text-[#c0f2d0]">Funcionalidades de INVWE</h1>
          
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8 mt-12">
            <div className="border border-white/15 rounded-xl p-6 backdrop-blur">
              <h3 className="text-xl font-medium mb-3">Gestión Multi-Tienda</h3>
              <p className="text-white/70">Control centralizado de inventarios para múltiples tiendas con sincronización en tiempo real.</p>
            </div>
            
            <div className="border border-white/15 rounded-xl p-6 backdrop-blur">
              <h3 className="text-xl font-medium mb-3">Integración Ecommerce</h3>
              <p className="text-white/70">Conexión con plataformas de comercio electrónico para sincronización automática de inventario.</p>
            </div>
            
            <div className="border border-white/15 rounded-xl p-6 backdrop-blur">
              <h3 className="text-xl font-medium mb-3">Control de Personal</h3>
              <p className="text-white/70">Gestión de usuarios con roles y permisos configurables para cada tienda.</p>
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