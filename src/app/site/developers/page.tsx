import { Header } from "@/components/site/sections/Header";
import { Footer } from "@/components/site/sections/Footer";
import { Button } from "@/components/Button";

export default function Developers() {
  return (
    <>
      <Header />
      <main className="py-20 md:py-24">
        <div className="container">
          <h1 className="text-4xl md:text-6xl font-semibold tracking-tighter text-center mb-10 text-[#c0f2d0]">API de Gestión de Inventario</h1>
          
          <div className="max-w-3xl mx-auto text-center mb-12">
            <p className="text-lg text-white/70 mb-6">
              Conecta tus sistemas con nuestra API RESTful para controlar inventarios, stock, proveedores y sincronización multi-tienda en tiempo real.
            </p>
          </div>
          
          <div className="grid md:grid-cols-2 gap-8 mt-12">
            <div className="border border-white/15 rounded-xl p-6 backdrop-blur">
              <h3 className="text-xl font-medium mb-3">API de Inventario</h3>
              <p className="text-white/70 mb-4">Consulta y actualiza inventarios, productos y stock a través de endpoints RESTful.</p>
              <pre className="bg-black/30 p-3 rounded-lg overflow-x-auto text-sm">
                <code>{
`// Consultar stock de producto
fetch('https://api.invwe.com/v1/inventory', {
  method: 'GET',
  headers: {
    'Content-Type': 'application/json',
    'Authorization': 'Bearer TU_API_KEY'
  },
  params: {
    product_id: 'PROD-123'
  }
})`
                }</code>
              </pre>
            </div>
            
            <div className="border border-white/15 rounded-xl p-6 backdrop-blur">
              <h3 className="text-xl font-medium mb-3">SDK de Inventario</h3>
              <p className="text-white/70 mb-4">Bibliotecas para JavaScript, Python y otros lenguajes para integrar fácilmente la gestión de inventario.</p>
              <pre className="bg-black/30 p-3 rounded-lg overflow-x-auto text-sm">
                <code>{
`// Actualizar stock con SDK
import { INVWE } from 'invwe-sdk';

const invwe = new INVWE('TU_API_KEY');
await invwe.updateStock({
  product_id: 'PROD-123',
  quantity: 50,
  store_id: 'STORE-456'
});`
                }</code>
              </pre>
            </div>
          </div>
          
          <div className="mt-16 border border-white/15 rounded-xl p-8 backdrop-blur">
            <h3 className="text-2xl font-medium mb-6 text-center">Documentación para Gestión de Inventarios</h3>
            <p className="text-white/70 text-center mb-8">
              Explora nuestra documentación detallada para gestión de inventarios con ejemplos prácticos y referencias de API.
            </p>
            <div className="flex justify-center">
              <Button>Acceder a la Documentación</Button>
            </div>
          </div>
        </div>
      </main>
      <Footer />
    </>
  );
}