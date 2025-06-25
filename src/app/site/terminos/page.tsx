'use client'

import { useEffect } from 'react'
import { gsap } from 'gsap'
import { Card, CardContent } from '@/components/ui/card'

export default function TerminosPage() {
  useEffect(() => {
    gsap.fromTo('.terms-header', 
      { opacity: 0, y: 30 },
      { opacity: 1, y: 0, duration: 0.8, ease: 'power2.out' }
    )

    gsap.fromTo('.terms-content', 
      { opacity: 0, y: 50 },
      { opacity: 1, y: 0, duration: 0.6, ease: 'power2.out', delay: 0.3 }
    )
  }, [])

  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="container mx-auto px-4 max-w-4xl">
        {/* Header */}
        <div className="terms-header text-center mb-12">
          <h1 className="text-4xl lg:text-5xl font-bold text-[#486283] mb-6 font-['Plus_Jakarta_Sans']">
            Términos y Condiciones
          </h1>
          <p className="text-lg text-gray-600 leading-relaxed">
            Última actualización: 1 de enero de 2024
          </p>
        </div>

        <Card className="terms-content">
          <CardContent className="p-8 lg:p-12">
            <div className="prose prose-lg max-w-none">
              <section className="mb-8">
                <h2 className="text-2xl font-bold text-[#486283] mb-4">1. Aceptación de los Términos</h2>
                <p className="text-gray-600 leading-relaxed mb-4">
                  Al acceder y utilizar el sitio web de Natulanda y nuestros servicios, usted acepta estar sujeto a estos términos y condiciones de uso. Si no está de acuerdo con alguna parte de estos términos, no debe utilizar nuestros servicios.
                </p>
                <p className="text-gray-600 leading-relaxed">
                  Estos términos se aplican a todos los visitantes, usuarios y otras personas que accedan o utilicen el servicio.
                </p>
              </section>

              <section className="mb-8">
                <h2 className="text-2xl font-bold text-[#486283] mb-4">2. Descripción del Servicio</h2>
                <p className="text-gray-600 leading-relaxed mb-4">
                  Natulanda es una empresa dedicada a la venta de productos naturales, orgánicos y saludables. Ofrecemos:
                </p>
                <ul className="list-disc list-inside text-gray-600 space-y-2 mb-4">
                  <li>Venta de productos naturales y orgánicos</li>
                  <li>Servicios de entrega a domicilio</li>
                  <li>Asesoría nutricional especializada</li>
                  <li>Talleres educativos sobre alimentación consciente</li>
                  <li>Sistema POS para comerciantes</li>
                </ul>
              </section>

              <section className="mb-8">
                <h2 className="text-2xl font-bold text-[#486283] mb-4">3. Registro y Cuenta de Usuario</h2>
                <p className="text-gray-600 leading-relaxed mb-4">
                  Para utilizar ciertos servicios, es posible que deba crear una cuenta. Usted es responsable de:
                </p>
                <ul className="list-disc list-inside text-gray-600 space-y-2 mb-4">
                  <li>Mantener la confidencialidad de su contraseña</li>
                  <li>Proporcionar información precisa y actualizada</li>
                  <li>Notificar inmediatamente cualquier uso no autorizado de su cuenta</li>
                  <li>Ser responsable de todas las actividades que ocurran bajo su cuenta</li>
                </ul>
              </section>

              <section className="mb-8">
                <h2 className="text-2xl font-bold text-[#486283] mb-4">4. Productos y Precios</h2>
                <p className="text-gray-600 leading-relaxed mb-4">
                  Todos los productos están sujetos a disponibilidad. Los precios pueden cambiar sin previo aviso. Nos reservamos el derecho de:
                </p>
                <ul className="list-disc list-inside text-gray-600 space-y-2 mb-4">
                  <li>Modificar o descontinuar productos en cualquier momento</li>
                  <li>Limitar las cantidades de compra por cliente</li>
                  <li>Rechazar pedidos que consideremos fraudulentos</li>
                  <li>Corregir errores de precios o información de productos</li>
                </ul>
              </section>

              <section className="mb-8">
                <h2 className="text-2xl font-bold text-[#486283] mb-4">5. Pedidos y Pagos</h2>
                <p className="text-gray-600 leading-relaxed mb-4">
                  Al realizar un pedido, usted declara que:
                </p>
                <ul className="list-disc list-inside text-gray-600 space-y-2 mb-4">
                  <li>Es mayor de edad y tiene capacidad legal para contratar</li>
                  <li>La información proporcionada es veraz y completa</li>
                  <li>Acepta pagar el precio total del pedido</li>
                  <li>Autoriza el cargo a su método de pago seleccionado</li>
                </ul>
                <p className="text-gray-600 leading-relaxed">
                  Los pagos se procesan de forma segura a través de nuestros proveedores de servicios de pago autorizados.
                </p>
              </section>

              <section className="mb-8">
                <h2 className="text-2xl font-bold text-[#486283] mb-4">6. Entrega y Envío</h2>
                <p className="text-gray-600 leading-relaxed mb-4">
                  Los tiempos de entrega son estimados y pueden variar según la ubicación y disponibilidad. No nos hacemos responsables por retrasos causados por:
                </p>
                <ul className="list-disc list-inside text-gray-600 space-y-2 mb-4">
                  <li>Condiciones climáticas adversas</li>
                  <li>Problemas con empresas de transporte</li>
                  <li>Direcciones incorrectas o incompletas</li>
                  <li>Ausencia del destinatario en el momento de la entrega</li>
                </ul>
              </section>

              <section className="mb-8">
                <h2 className="text-2xl font-bold text-[#486283] mb-4">7. Devoluciones y Reembolsos</h2>
                <p className="text-gray-600 leading-relaxed mb-4">
                  Aceptamos devoluciones bajo las siguientes condiciones:
                </p>
                <ul className="list-disc list-inside text-gray-600 space-y-2 mb-4">
                  <li>El producto debe estar en su empaque original</li>
                  <li>La solicitud debe realizarse dentro de 15 días calendario</li>
                  <li>Los productos perecederos no son elegibles para devolución</li>
                  <li>Los gastos de envío de devolución corren por cuenta del cliente</li>
                </ul>
              </section>

              <section className="mb-8">
                <h2 className="text-2xl font-bold text-[#486283] mb-4">8. Uso Prohibido</h2>
                <p className="text-gray-600 leading-relaxed mb-4">
                  Está prohibido utilizar nuestros servicios para:
                </p>
                <ul className="list-disc list-inside text-gray-600 space-y-2 mb-4">
                  <li>Actividades ilegales o fraudulentas</li>
                  <li>Violar derechos de propiedad intelectual</li>
                  <li>Transmitir contenido ofensivo o dañino</li>
                  <li>Interferir con el funcionamiento del sitio web</li>
                  <li>Recopilar información de otros usuarios sin autorización</li>
                </ul>
              </section>

              <section className="mb-8">
                <h2 className="text-2xl font-bold text-[#486283] mb-4">9. Limitación de Responsabilidad</h2>
                <p className="text-gray-600 leading-relaxed mb-4">
                  Natulanda no será responsable por daños indirectos, incidentales, especiales o consecuentes que resulten del uso de nuestros productos o servicios. Nuestra responsabilidad total no excederá el valor del producto o servicio adquirido.
                </p>
              </section>

              <section className="mb-8">
                <h2 className="text-2xl font-bold text-[#486283] mb-4">10. Propiedad Intelectual</h2>
                <p className="text-gray-600 leading-relaxed mb-4">
                  Todo el contenido del sitio web, incluyendo textos, imágenes, logos, y diseños, es propiedad de Natulanda y está protegido por las leyes de propiedad intelectual. Queda prohibida su reproducción sin autorización expresa.
                </p>
              </section>

              <section className="mb-8">
                <h2 className="text-2xl font-bold text-[#486283] mb-4">11. Modificaciones</h2>
                <p className="text-gray-600 leading-relaxed mb-4">
                  Nos reservamos el derecho de modificar estos términos en cualquier momento. Las modificaciones entrarán en vigor inmediatamente después de su publicación en el sitio web. Es responsabilidad del usuario revisar periódicamente estos términos.
                </p>
              </section>

              <section className="mb-8">
                <h2 className="text-2xl font-bold text-[#486283] mb-4">12. Ley Aplicable</h2>
                <p className="text-gray-600 leading-relaxed mb-4">
                  Estos términos se rigen por las leyes de la República de Colombia. Cualquier disputa será resuelta en los tribunales competentes de Bogotá, Colombia.
                </p>
              </section>

              <section>
                <h2 className="text-2xl font-bold text-[#486283] mb-4">13. Contacto</h2>
                <p className="text-gray-600 leading-relaxed mb-4">
                  Si tiene preguntas sobre estos términos y condiciones, puede contactarnos:
                </p>
                <ul className="list-none text-gray-600 space-y-2">
                  <li><strong>Email:</strong> legal@natulanda.com</li>
                  <li><strong>Teléfono:</strong> +57 300 123 4567</li>
                  <li><strong>Dirección:</strong> Calle 123 #45-67, Bogotá, Colombia</li>
                </ul>
              </section>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}