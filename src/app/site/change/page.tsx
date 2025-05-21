import { Header } from "@/components/site/sections/Header";
import { Footer } from "@/components/site/sections/Footer";

export default function Change() {
  return (
    <>
      <Header />
      <main className="py-20 md:py-24">
        <div className="container">
          <h1 className="text-4xl md:text-6xl font-semibold tracking-tighter text-center mb-10 text-[#c0f2d0]">Historial de Versiones</h1>
          
          <div className="max-w-3xl mx-auto">
            <div className="space-y-12">
              {/* Versión más reciente */}
              <div className="border border-[#a4c5ec]/30 rounded-xl p-6 backdrop-blur bg-black/40">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-xl font-medium text-[#c0f2d0]">Versión 2.0.0</h3>
                  <span className="text-sm text-[#d9dee4]">15 de Marzo, 2024</span>
                </div>
                
                <div className="space-y-4">
                  <div>
                    <h4 className="text-[#a4c5ec] font-medium mb-2">✨ Nuevas Características</h4>
                    <ul className="list-disc pl-5 space-y-1 text-white/80">
                      <li>Nuevo sistema de gestión multi-tienda con sincronización en tiempo real</li>
                      <li>Integración con plataformas de ecommerce populares</li>
                      <li>Reportes avanzados de inventario y stock</li>
                    </ul>
                  </div>
                  
                  <div>
                    <h4 className="text-[#a4c5ec] font-medium mb-2">🐛 Correcciones</h4>
                    <ul className="list-disc pl-5 space-y-1 text-white/80">
                      <li>Corregido problema con la sincronización de inventario entre tiendas</li>
                      <li>Mejorado el rendimiento en reportes de stock</li>
                    </ul>
                  </div>
                </div>
              </div>
              
              {/* Versión anterior */}
              <div className="border border-[#a4c5ec]/30 rounded-xl p-6 backdrop-blur bg-black/40">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-xl font-medium text-[#c0f2d0]">Versión 1.5.0</h3>
                  <span className="text-sm text-[#d9dee4]">2 de Febrero, 2024</span>
                </div>
                
                <div className="space-y-4">
                  <div>
                    <h4 className="text-[#a4c5ec] font-medium mb-2">🚀 Mejoras</h4>
                    <ul className="list-disc pl-5 space-y-1 text-white/80">
                      <li>Mejoras en la interfaz de gestión de inventario</li>
                      <li>Nuevas opciones de personalización para reportes</li>
                      <li>Sistema de alertas de stock bajo mejorado</li>
                    </ul>
                  </div>
                  
                  <div>
                    <h4 className="text-[#a4c5ec] font-medium mb-2">🐛 Correcciones</h4>
                    <ul className="list-disc pl-5 space-y-1 text-white/80">
                      <li>Solucionado error en la generación de reportes de inventario</li>
                      <li>Corregido problema de visualización en dispositivos móviles</li>
                    </ul>
                  </div>
                </div>
              </div>
              
              {/* Versión más antigua */}
              <div className="border border-[#a4c5ec]/30 rounded-xl p-6 backdrop-blur bg-black/40">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-xl font-medium text-[#c0f2d0]">Versión 3.0.0</h3>
                  <span className="text-sm text-[#d9dee4]">15 de Enero, 2024</span>
                </div>
                
                <div className="space-y-4">
                  <div>
                    <h4 className="text-[#a4c5ec] font-medium mb-2">✨ Nuevas Características</h4>
                    <ul className="list-disc pl-5 space-y-1 text-white/80">
                      <li>Sistema modular de gestión de inventario por tiendas</li>
                      <li>Integración con lectores de códigos de barras y QR</li>
                      <li>API completa para integración con sistemas externos</li>
                    </ul>
                  </div>
                  
                  <div>
                    <h4 className="text-[#a4c5ec] font-medium mb-2">🚀 Mejoras</h4>
                    <ul className="list-disc pl-5 space-y-1 text-white/80">
                      <li>Mayor precisión en el seguimiento de inventario en tiempo real</li>
                      <li>Interfaz más intuitiva para gestión de múltiples tiendas</li>
                      <li>Sistema de reportes avanzados con exportación a múltiples formatos</li>
                    </ul>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>
      <Footer />
    </>
  );
}