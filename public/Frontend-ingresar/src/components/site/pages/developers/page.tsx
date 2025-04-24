import { Header } from "@/components/site/sections/Header";
import { Footer } from "@/components/site/sections/Footer";
import { Button } from "@/components/Button";

export default function Developers() {
  return (
    <>
      <Header />
      <main className="py-20 md:py-24">
        <div className="container">
          <h1 className="text-4xl md:text-6xl font-semibold tracking-tighter text-center mb-10">Desarrolladores</h1>
          
          <div className="max-w-3xl mx-auto text-center mb-12">
            <p className="text-lg text-white/70 mb-6">
              Nuestra API y herramientas para desarrolladores te permiten integrar nuestras potentes funciones de SEO con IA en tus propias aplicaciones.
            </p>
          </div>
          
          <div className="grid md:grid-cols-2 gap-8 mt-12">
            <div className="border border-white/15 rounded-xl p-6 backdrop-blur">
              <h3 className="text-xl font-medium mb-3">API Completa</h3>
              <p className="text-white/70 mb-4">Accede a todas nuestras funciones a través de una API RESTful bien documentada.</p>
              <pre className="bg-black/30 p-3 rounded-lg overflow-x-auto text-sm">
                <code>{
`// Ejemplo de solicitud de API
fetch('https://api.iaseo.com/v1/analyze', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'Authorization': 'Bearer TU_API_KEY'
  },
  body: JSON.stringify({
    url: 'https://tudominio.com'
  })
})`
                }</code>
              </pre>
            </div>
            
            <div className="border border-white/15 rounded-xl p-6 backdrop-blur">
              <h3 className="text-xl font-medium mb-3">SDK para Múltiples Plataformas</h3>
              <p className="text-white/70 mb-4">Integraciones nativas para JavaScript, Python, PHP, Ruby y más.</p>
              <pre className="bg-black/30 p-3 rounded-lg overflow-x-auto text-sm">
                <code>{
`// Ejemplo con nuestro SDK de JavaScript
import { IASEO } from 'iaseo-sdk';

const seo = new IASEO('TU_API_KEY');
const results = await seo.analyzeKeywords({
  keywords: ['marketing digital', 'seo']
});

console.log(results.suggestions);`
                }</code>
              </pre>
            </div>
          </div>
          
          <div className="mt-16 border border-white/15 rounded-xl p-8 backdrop-blur">
            <h3 className="text-2xl font-medium mb-6 text-center">Documentación Completa</h3>
            <p className="text-white/70 text-center mb-8">
              Explora nuestra documentación detallada con ejemplos, guías y referencias de API.
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