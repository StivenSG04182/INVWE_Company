'use client'

import { useEffect } from 'react'
import { gsap } from 'gsap'
import { Card, CardContent } from '@/components/ui/card'
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion'
import { Button } from '@/components/ui/button'
import { MessageCircle, Phone, Mail } from 'lucide-react'

const faqData = [
  {
    category: 'Productos',
    questions: [
      {
        question: '¿Todos sus productos son 100% naturales?',
        answer: 'Sí, todos nuestros productos son completamente naturales y orgánicos. Trabajamos directamente con productores locales que siguen prácticas sostenibles y no utilizan químicos ni pesticidas en sus cultivos.'
      },
      {
        question: '¿Cómo garantizan la calidad de los productos?',
        answer: 'Tenemos un riguroso proceso de control de calidad que incluye inspección visual, pruebas de laboratorio y certificaciones de nuestros proveedores. Cada lote es verificado antes de llegar a nuestros clientes.'
      },
      {
        question: '¿Cuál es la fecha de vencimiento de los productos?',
        answer: 'La fecha de vencimiento varía según el producto. Las especias y hierbas secas pueden durar de 1-3 años, mientras que las frutas deshidratadas tienen una vida útil de 6-12 meses. Siempre incluimos la fecha de vencimiento en el empaque.'
      },
      {
        question: '¿Ofrecen productos sin gluten?',
        answer: 'Sí, la mayoría de nuestros productos son naturalmente libres de gluten. Sin embargo, recomendamos verificar la etiqueta de cada producto o contactarnos directamente si tienes alergias específicas.'
      }
    ]
  },
  {
    category: 'Pagos y Facturación',
    questions: [
      {
        question: '¿Qué métodos de pago aceptan?',
        answer: 'Aceptamos tarjetas de crédito y débito (Visa, Mastercard), transferencias bancarias, PSE, y pagos en efectivo contra entrega en Bogotá.'
      },
      {
        question: '¿Emiten factura?',
        answer: 'Sí, emitimos factura electrónica para todos los pedidos. La factura se envía automáticamente a tu correo electrónico una vez confirmado el pago.'
      },
      {
        question: '¿Ofrecen descuentos por compras al mayor?',
        answer: 'Sí, ofrecemos descuentos especiales para compras al por mayor. Contacta a nuestro equipo de ventas para conocer los precios especiales según la cantidad que necesites.'
      },
      {
        question: '¿Es seguro pagar en línea?',
        answer: 'Absolutamente. Utilizamos encriptación SSL y trabajamos con pasarelas de pago certificadas que cumplen con los más altos estándares de seguridad internacional.'
      }
    ]
  },
  {
    category: 'Devoluciones y Garantías',
    questions: [
      {
        question: '¿Cuál es su política de devoluciones?',
        answer: 'Aceptamos devoluciones dentro de los 15 días posteriores a la entrega, siempre que el producto esté en su empaque original y en perfectas condiciones. Los productos perecederos no son elegibles para devolución.'
      },
      {
        question: '¿Qué hago si recibo un producto defectuoso?',
        answer: 'Si recibes un producto defectuoso o dañado, contáctanos inmediatamente. Te enviaremos un reemplazo sin costo adicional o te reembolsaremos el dinero completo.'
      },
      {
        question: '¿Cuánto tiempo tarda el reembolso?',
        answer: 'Los reembolsos se procesan dentro de 5-7 días hábiles una vez que recibamos y verifiquemos el producto devuelto. El tiempo para ver el dinero en tu cuenta depende de tu banco.'
      }
    ]
  }
]

export default function FAQPage() {
  useEffect(() => {
    gsap.fromTo('.faq-header', 
      { opacity: 0, y: 30 },
      { opacity: 1, y: 0, duration: 0.8, ease: 'power2.out' }
    )

    gsap.fromTo('.faq-card', 
      { opacity: 0, y: 50, scale: 0.9 },
      { 
        opacity: 1, 
        y: 0, 
        scale: 1,
        duration: 0.6,
        stagger: 0.2,
        ease: 'power2.out',
        delay: 0.3
      }
    )
  }, [])

  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="container mx-auto px-4">
        {/* Header */}
        <div className="faq-header text-center mb-16">
          <h1 className="text-4xl lg:text-5xl font-bold text-[#486283] mb-6 font-['Plus_Jakarta_Sans']">
            Preguntas Frecuentes
          </h1>
          <p className="text-lg text-gray-600 max-w-3xl mx-auto leading-relaxed">
            Encuentra respuestas a las preguntas más comunes sobre nuestros productos, 
            envíos, pagos y políticas.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          {/* FAQ Content */}
          <div className="lg:col-span-3">
            {faqData.map((category, categoryIndex) => (
              <Card key={categoryIndex} className="faq-card mb-8">
                <CardContent className="p-8">
                  <h2 className="text-2xl font-bold text-[#486283] mb-6">
                    {category.category}
                  </h2>
                  
                  <Accordion type="single" collapsible className="space-y-4">
                    {category.questions.map((item, index) => (
                      <AccordionItem key={index} value={`item-${categoryIndex}-${index}`} className="border border-gray-200 rounded-lg px-4">
                        <AccordionTrigger className="text-left font-medium text-[#486283] hover:text-[#899735] transition-colors">
                          {item.question}
                        </AccordionTrigger>
                        <AccordionContent className="text-gray-600 leading-relaxed pt-2">
                          {item.answer}
                        </AccordionContent>
                      </AccordionItem>
                    ))}
                  </Accordion>
                </CardContent>
              </Card>
            ))}
          </div>

          {/* Contact Sidebar */}
          <div className="lg:col-span-1">
            <Card className="faq-card sticky top-8">
              <CardContent className="p-6">
                <h3 className="text-xl font-bold text-[#486283] mb-4">
                  ¿No encuentras tu respuesta?
                </h3>
                <p className="text-gray-600 mb-6 text-sm">
                  Nuestro equipo de atención al cliente está aquí para ayudarte.
                </p>

                <div className="space-y-4">
                  <Button className="w-full bg-[#899735] hover:bg-[#899735]/90 text-white justify-start">
                    <MessageCircle className="h-4 w-4 mr-2" />
                    Chat en Vivo
                  </Button>

                  <Button variant="outline" className="w-full border-[#486283] text-[#486283] justify-start">
                    <Phone className="h-4 w-4 mr-2" />
                    +57 300 123 4567
                  </Button>

                  <Button variant="outline" className="w-full border-[#486283] text-[#486283] justify-start">
                    <Mail className="h-4 w-4 mr-2" />
                    Enviar Email
                  </Button>
                </div>

                <div className="mt-6 p-4 bg-[#486283]/5 rounded-lg">
                  <h4 className="font-semibold text-[#486283] mb-2">
                    Horarios de Atención
                  </h4>
                  <div className="text-sm text-gray-600 space-y-1">
                    <p>Lun - Vie: 8:00 AM - 6:00 PM</p>
                    <p>Sábados: 9:00 AM - 4:00 PM</p>
                    <p>Domingos: Cerrado</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  )
}