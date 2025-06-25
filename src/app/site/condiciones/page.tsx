'use client'

import { useEffect } from 'react'
import { gsap } from 'gsap'
import { Card, CardContent } from '@/components/ui/card'

export default function CondicionesPage() {
  useEffect(() => {
    gsap.fromTo('.privacy-header', 
      { opacity: 0, y: 30 },
      { opacity: 1, y: 0, duration: 0.8, ease: 'power2.out' }
    )

    gsap.fromTo('.privacy-content', 
      { opacity: 0, y: 50 },
      { opacity: 1, y: 0, duration: 0.6, ease: 'power2.out', delay: 0.3 }
    )
  }, [])

  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="container mx-auto px-4 max-w-4xl">
        {/* Header */}
        <div className="privacy-header text-center mb-12">
          <h1 className="text-4xl lg:text-5xl font-bold text-[#486283] mb-6 font-['Plus_Jakarta_Sans']">
            Políticas de Privacidad
          </h1>
          <p className="text-lg text-gray-600 leading-relaxed">
            Última actualización: 1 de enero de 2024
          </p>
        </div>

        <Card className="privacy-content">
          <CardContent className="p-8 lg:p-12">
            <div className="prose prose-lg max-w-none">
              <section className="mb-8">
                <h2 className="text-2xl font-bold text-[#486283] mb-4">1. Introducción</h2>
                <p className="text-gray-600 leading-relaxed mb-4">
                  En Natulanda, valoramos y respetamos su privacidad. Esta política de privacidad describe cómo recopilamos, utilizamos, almacenamos y protegemos su información personal cuando utiliza nuestros servicios.
                </p>
                <p className="text-gray-600 leading-relaxed">
                  Al utilizar nuestros servicios, usted acepta las prácticas descritas en esta política de privacidad.
                </p>
              </section>

              <section className="mb-8">
                <h2 className="text-2xl font-bold text-[#486283] mb-4">2. Información que Recopilamos</h2>
                <h3 className="text-xl font-semibold text-[#486283] mb-3">2.1 Información Personal</h3>
                <p className="text-gray-600 leading-relaxed mb-4">
                  Recopilamos información personal que usted nos proporciona voluntariamente, incluyendo:
                </p>
                <ul className="list-disc list-inside text-gray-600 space-y-2 mb-4">
                  <li>Nombre completo y datos de contacto</li>
                  <li>Dirección de correo electrónico</li>
                  <li>Número de teléfono</li>
                  <li>Dirección de entrega</li>
                  <li>Información de pago (procesada de forma segura)</li>
                  <li>Preferencias alimentarias y de salud</li>
                </ul>

                <h3 className="text-xl font-semibold text-[#486283] mb-3">2.2 Información Técnica</h3>
                <p className="text-gray-600 leading-relaxed mb-4">
                  También recopilamos información técnica automáticamente:
                </p>
                <ul className="list-disc list-inside text-gray-600 space-y-2 mb-4">
                  <li>Dirección IP y ubicación geográfica</li>
                  <li>Tipo de navegador y dispositivo</li>
                  <li>Páginas visitadas y tiempo de navegación</li>
                  <li>Cookies y tecnologías similares</li>
                  <li>Historial de compras y preferencias</li>
                </ul>
              </section>

              <section className="mb-8">
                <h2 className="text-2xl font-bold text-[#486283] mb-4">3. Cómo Utilizamos su Información</h2>
                <p className="text-gray-600 leading-relaxed mb-4">
                  Utilizamos su información personal para los siguientes propósitos:
                </p>
                <ul className="list-disc list-inside text-gray-600 space-y-2 mb-4">
                  <li>Procesar y entregar sus pedidos</li>
                  <li>Proporcionar atención al cliente</li>
                  <li>Personalizar su experiencia de compra</li>
                  <li>Enviar comunicaciones sobre productos y servicios</li>
                  <li>Mejorar nuestros productos y servicios</li>
                  <li>Cumplir con obligaciones legales</li>
                  <li>Prevenir fraudes y garantizar la seguridad</li>
                </ul>
              </section>

              <section className="mb-8">
                <h2 className="text-2xl font-bold text-[#486283] mb-4">4. Compartir Información</h2>
                <p className="text-gray-600 leading-relaxed mb-4">
                  No vendemos, alquilamos ni compartimos su información personal con terceros, excepto en las siguientes circunstancias:
                </p>
                <ul className="list-disc list-inside text-gray-600 space-y-2 mb-4">
                  <li><strong>Proveedores de servicios:</strong> Empresas que nos ayudan a operar nuestro negocio (procesamiento de pagos, entrega, etc.)</li>
                  <li><strong>Cumplimiento legal:</strong> Cuando sea requerido por ley o autoridades competentes</li>
                  <li><strong>Protección de derechos:</strong> Para proteger nuestros derechos, propiedad o seguridad</li>
                  <li><strong>Consentimiento:</strong> Cuando usted haya dado su consentimiento explícito</li>
                </ul>
              </section>

              <section className="mb-8">
                <h2 className="text-2xl font-bold text-[#486283] mb-4">5. Cookies y Tecnologías Similares</h2>
                <p className="text-gray-600 leading-relaxed mb-4">
                  Utilizamos cookies y tecnologías similares para:
                </p>
                <ul className="list-disc list-inside text-gray-600 space-y-2 mb-4">
                  <li>Recordar sus preferencias y configuraciones</li>
                  <li>Analizar el tráfico y uso del sitio web</li>
                  <li>Personalizar contenido y anuncios</li>
                  <li>Mejorar la funcionalidad del sitio</li>
                </ul>
                <p className="text-gray-600 leading-relaxed">
                  Puede configurar su navegador para rechazar cookies, aunque esto puede afectar la funcionalidad del sitio.
                </p>
              </section>

              <section className="mb-8">
                <h2 className="text-2xl font-bold text-[#486283] mb-4">6. Seguridad de la Información</h2>
                <p className="text-gray-600 leading-relaxed mb-4">
                  Implementamos medidas de seguridad técnicas, administrativas y físicas para proteger su información personal:
                </p>
                <ul className="list-disc list-inside text-gray-600 space-y-2 mb-4">
                  <li>Encriptación SSL para transmisión de datos</li>
                  <li>Servidores seguros y protegidos</li>
                  <li>Acceso limitado a información personal</li>
                  <li>Capacitación regular del personal en seguridad</li>
                  <li>Monitoreo continuo de sistemas</li>
                </ul>
              </section>

              <section className="mb-8">
                <h2 className="text-2xl font-bold text-[#486283] mb-4">7. Sus Derechos</h2>
                <p className="text-gray-600 leading-relaxed mb-4">
                  Usted tiene los siguientes derechos respecto a su información personal:
                </p>
                <ul className="list-disc list-inside text-gray-600 space-y-2 mb-4">
                  <li><strong>Acceso:</strong> Solicitar una copia de la información que tenemos sobre usted</li>
                  <li><strong>Rectificación:</strong> Corregir información inexacta o incompleta</li>
                  <li><strong>Eliminación:</strong> Solicitar la eliminación de su información personal</li>
                  <li><strong>Portabilidad:</strong> Recibir sus datos en un formato estructurado</li>
                  <li><strong>Oposición:</strong> Oponerse al procesamiento de sus datos</li>
                  <li><strong>Limitación:</strong> Solicitar la limitación del procesamiento</li>
                </ul>
              </section>

              <section className="mb-8">
                <h2 className="text-2xl font-bold text-[#486283] mb-4">8. Retención de Datos</h2>
                <p className="text-gray-600 leading-relaxed mb-4">
                  Conservamos su información personal durante el tiempo necesario para:
                </p>
                <ul className="list-disc list-inside text-gray-600 space-y-2 mb-4">
                  <li>Cumplir con los propósitos para los cuales fue recopilada</li>
                  <li>Satisfacer requisitos legales y regulatorios</li>
                  <li>Resolver disputas y hacer cumplir nuestros acuerdos</li>
                </ul>
                <p className="text-gray-600 leading-relaxed">
                  Una vez que ya no necesitemos su información, la eliminaremos de forma segura.
                </p>
              </section>

              <section className="mb-8">
                <h2 className="text-2xl font-bold text-[#486283] mb-4">9. Transferencias Internacionales</h2>
                <p className="text-gray-600 leading-relaxed mb-4">
                  Su información puede ser transferida y procesada en países fuera de Colombia. En tales casos, nos aseguramos de que se mantengan niveles adecuados de protección mediante:
                </p>
                <ul className="list-disc list-inside text-gray-600 space-y-2 mb-4">
                  <li>Acuerdos contractuales apropiados</li>
                  <li>Certificaciones de privacidad reconocidas</li>
                  <li>Cumplimiento de estándares internacionales</li>
                </ul>
              </section>

              <section className="mb-8">
                <h2 className="text-2xl font-bold text-[#486283] mb-4">10. Menores de Edad</h2>
                <p className="text-gray-600 leading-relaxed mb-4">
                  Nuestros servicios no están dirigidos a menores de 18 años. No recopilamos intencionalmente información personal de menores. Si descubrimos que hemos recopilado información de un menor, la eliminaremos inmediatamente.
                </p>
              </section>

              <section className="mb-8">
                <h2 className="text-2xl font-bold text-[#486283] mb-4">11. Cambios a esta Política</h2>
                <p className="text-gray-600 leading-relaxed mb-4">
                  Podemos actualizar esta política de privacidad periódicamente. Le notificaremos sobre cambios significativos mediante:
                </p>
                <ul className="list-disc list-inside text-gray-600 space-y-2 mb-4">
                  <li>Publicación en nuestro sitio web</li>
                  <li>Notificación por correo electrónico</li>
                  <li>Aviso en nuestra aplicación móvil</li>
                </ul>
              </section>

              <section>
                <h2 className="text-2xl font-bold text-[#486283] mb-4">12. Contacto</h2>
                <p className="text-gray-600 leading-relaxed mb-4">
                  Si tiene preguntas sobre esta política de privacidad o desea ejercer sus derechos, puede contactarnos:
                </p>
                <ul className="list-none text-gray-600 space-y-2">
                  <li><strong>Email:</strong> privacidad@natulanda.com</li>
                  <li><strong>Teléfono:</strong> +57 300 123 4567</li>
                  <li><strong>Dirección:</strong> Calle 123 #45-67, Bogotá, Colombia</li>
                  <li><strong>Horario de atención:</strong> Lunes a Viernes, 8:00 AM - 6:00 PM</li>
                </ul>
              </section>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}