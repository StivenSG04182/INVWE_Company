import { Header } from "@/components/site/sections/Header";
import { Footer } from "@/components/site/sections/Footer";
import { Button } from "@/components/Button";

export default function Pricing() {
  return (
    <>
      <Header />
      <main className="py-20 md:py-24">
        <div className="container">
          <h1 className="text-4xl md:text-6xl font-semibold tracking-tighter text-center text-[#c0f2d0]">Planes de Gestión de Inventario</h1>
          
          <div className="max-w-3xl mx-auto text-center mt-6 mb-12">
            <p className="text-lg text-[#d9dee4]">
              Elige el plan que mejor se adapte a tus necesidades y comienza a gestionar tu inventario y facturación electrónica hoy mismo.
            </p>
          </div>
          
          <div className="grid md:grid-cols-3 gap-8 mt-12">
            {/* Plan Básico */}
            <div className="border border-[#c0f2d0]/30 rounded-xl p-6 backdrop-blur bg-black/40">
              <div className="mb-4">
                <h3 className="text-xl font-medium text-[#c0f2d0]">Plan Básico</h3>
                <div className="mt-2">
                  <span className="text-3xl font-bold text-white">$0</span>
                  <span className="text-[#d9dee4] ml-1">/ por mes</span>
                </div>
              </div>
              
              <div className="border-t border-[#c0f2d0]/30 my-4 pt-4">
                <h4 className="text-sm font-medium mb-3 text-[#a4c5ec]">Qué está incluido</h4>
                <ul className="space-y-2">
                  <li className="flex items-center gap-2 text-sm text-[#d9dee4]">
                    <span className="text-[#c0f2d0]">✓</span> 1 tienda única
                  </li>
                  <li className="flex items-center gap-2 text-sm text-[#d9dee4]">
                    <span className="text-[#c0f2d0]">✓</span> Hasta 100 productos
                  </li>
                  <li className="flex items-center gap-2 text-sm text-[#d9dee4]">
                    <span className="text-[#c0f2d0]">✓</span> Reportes mensuales básicos
                  </li>
                </ul>
              </div>
              
              <div className="mt-6">
                <Button>Comenzar Gratis</Button>
              </div>
            </div>
            
            {/* Plan Profesional */}
            <div className="border border-[#a4c5ec]/30 rounded-xl p-6 backdrop-blur bg-black/40 relative">
              <div className="absolute -top-3 right-4 bg-black/80 text-xs py-1 px-2 rounded-full border border-[#a4c5ec]/50 text-[#a4c5ec]">
                Más Popular
              </div>
              
              <div className="mb-4">
                <h3 className="text-xl font-medium text-[#a4c5ec]">Plan Profesional</h3>
                <div className="mt-2">
                  <span className="text-3xl font-bold text-white">$80</span>
                  <span className="text-[#d9dee4] ml-1">/ por mes</span>
                </div>
              </div>
              
              <div className="border-t border-[#a4c5ec]/30 my-4 pt-4">
                <h4 className="text-sm font-medium mb-3 text-[#c0f2d0]">Qué está incluido</h4>
                <ul className="space-y-2">
                  <li className="flex items-center gap-2 text-sm text-[#d9dee4]">
                    <span className="text-[#a4c5ec]">✓</span> Hasta 3 tiendas
                  </li>
                  <li className="flex items-center gap-2 text-sm text-[#d9dee4]">
                    <span className="text-[#a4c5ec]">✓</span> Hasta 1,000 productos
                  </li>
                  <li className="flex items-center gap-2 text-sm text-[#d9dee4]">
                    <span className="text-[#a4c5ec]">✓</span> Reportes semanales detallados
                  </li>
                  <li className="flex items-center gap-2 text-sm text-[#d9dee4]">
                    <span className="text-[#a4c5ec]">✓</span> Facturación electrónica básica
                  </li>
                  <li className="flex items-center gap-2 text-sm text-[#d9dee4]">
                    <span className="text-[#a4c5ec]">✓</span> Soporte prioritario
                  </li>
                </ul>
              </div>
              
              <div className="mt-6">
                <Button>Obtener Plan Profesional</Button>
              </div>
            </div>
            
            {/* Plan Empresarial */}
            <div className="border border-[#d9dee4]/30 rounded-xl p-6 backdrop-blur bg-black/40">
              <div className="mb-4">
                <h3 className="text-xl font-medium text-[#d9dee4]">Plan Empresarial</h3>
                <div className="mt-2">
                  <span className="text-3xl font-bold text-white">$15</span>
                  <span className="text-[#d9dee4] ml-1">/ por usuario / mes</span>
                </div>
              </div>
              
              <div className="border-t border-[#d9dee4]/30 my-4 pt-4">
                <h4 className="text-sm font-medium mb-3 text-[#a4c5ec]">Qué está incluido</h4>
                <ul className="space-y-2">
                  <li className="flex items-center gap-2 text-sm text-[#d9dee4]">
                    <span className="text-[#d9dee4]">✓</span> Todo lo del Plan Profesional
                  </li>
                  <li className="flex items-center gap-2 text-sm text-[#d9dee4]">
                    <span className="text-[#d9dee4]">✓</span> Tiendas ilimitadas
                  </li>
                  <li className="flex items-center gap-2 text-sm text-[#d9dee4]">
                    <span className="text-[#d9dee4]">✓</span> Productos ilimitados
                  </li>
                  <li className="flex items-center gap-2 text-sm text-[#d9dee4]">
                    <span className="text-[#d9dee4]">✓</span> Facturación electrónica avanzada
                  </li>
                  <li className="flex items-center gap-2 text-sm text-[#d9dee4]">
                    <span className="text-[#d9dee4]">✓</span> Soporte 24/7 personalizado
                  </li>
                </ul>
              </div>
              
              <div className="mt-6">
                <Button>Obtener Plan Empresarial</Button>
              </div>
            </div>
          </div>
          
          <div className="text-center mt-12 text-[#a4c5ec]">
            <p>Todos los precios incluyen IVA y soporte técnico</p>
          </div>
        </div>
      </main>
      <Footer />
    </>
  );
}