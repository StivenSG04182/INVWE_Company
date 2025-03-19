"use client";

import React from "react";

export default function Page() {
  return (
    <div className="min-h-screen bg-gradient-to-br py-12">
      <div className="max-w-4xl mx-auto bg-white/80 dark:bg-gray-800/80 backdrop-blur-lg rounded-2xl shadow-xl p-8 md:p-12 transition-all duration-300 hover:shadow-2xl">
        <h1 className="text-3xl md:text-4xl text-center font-bold mb-8 bg-clip-text text-transparent bg-gradient-to-r from-blue-600 to-purple-600 dark:from-blue-400 dark:to-purple-400">Políticas de Privacidad de InvWe</h1>

        <div className="space-y-8">
          <div className="prose prose-gray dark:prose-invert max-w-none">
            <p className="text-base md:text-lg text-gray-700 dark:text-gray-300 leading-relaxed">
              En InvWe, nos comprometemos a proteger y respetar su privacidad. Esta política explica cómo
              recopilamos, usamos y protegemos su información personal cuando utiliza nuestro sistema de
              gestión de inventario y facturación. Al utilizar InvWe, usted acepta las prácticas descritas
              en esta política.
            </p>
          </div>

          <div className="bg-gray-50 dark:bg-gray-700/50 rounded-xl p-6 transition-all duration-300 hover:shadow-lg">
            <h2 className="text-2xl font-semibold mb-4 text-gray-800 dark:text-gray-200">
              Recolección de Información
            </h2>
            <p className="text-gray-700 dark:text-gray-300 leading-relaxed">
              Recopilamos información personal y de negocio, como su nombre, dirección, correo electrónico,
              número de teléfono, datos fiscales (RFC, NIT, etc.), detalles de inventario, proveedores,
              clientes y transacciones, así como datos de facturación y uso del sistema. Esta información se
              utiliza para gestionar su inventario y facturación, mejorar nuestros servicios, cumplir con
              obligaciones fiscales y legales, y enviarle notificaciones importantes sobre su cuenta o
              cambios en nuestros servicios.
            </p>
          </div>

          <div className="space-y-6">
            <p className="text-gray-700 dark:text-gray-300 leading-relaxed">
              La recopilación de datos se realiza a través del registro de usuario, la interacción con el
              sistema al ingresar datos de inventario o facturas, comunicaciones directas (como correos
              electrónicos o llamadas) y tecnologías automáticas como cookies y herramientas de análisis.
              Estas herramientas nos ayudan a mejorar la experiencia del usuario y a optimizar nuestro
              sistema.
            </p>

            <p className="text-gray-700 dark:text-gray-300 leading-relaxed">
              Nos comunicamos con usted para notificarle sobre actualizaciones del sistema, cambios en
              nuestras políticas, resolver problemas técnicos o dudas sobre su cuenta, y enviar facturas
              electrónicas o recordatorios de pago. Usted puede optar por no recibir comunicaciones
              promocionales en cualquier momento.
            </p>

            <div className="bg-blue-50 dark:bg-blue-900/20 rounded-xl p-6 border-l-4 border-blue-500 dark:border-blue-400">
              <p className="text-gray-700 dark:text-gray-300 leading-relaxed">
                La seguridad de su información es una prioridad para nosotros. Utilizamos encriptación para
                proteger los datos sensibles, restringimos el acceso a personal autorizado y realizamos
                copias de seguridad periódicas para prevenir pérdidas de datos. En caso de una violación de
                seguridad, le notificaremos de inmediato y tomaremos medidas para mitigar cualquier daño.
              </p>
            </div>

            <div className="bg-yellow-50 dark:bg-yellow-900/20 rounded-xl p-6 border-l-4 border-yellow-500 dark:border-yellow-400">
              <p className="text-gray-700 dark:text-gray-300 leading-relaxed">
                InvWe no está dirigido a menores de 18 años, y no recopilamos intencionalmente información de
                niños. Si descubre que un menor ha proporcionado datos personales, contáctenos para eliminar
                dicha información.
              </p>
            </div>

            <p className="text-gray-700 dark:text-gray-300 leading-relaxed">
              Nos reservamos el derecho de actualizar esta política de privacidad en cualquier momento. Le
              notificaremos sobre cambios significativos a través de su correo electrónico o mediante una
              notificación en nuestro sistema. Le recomendamos revisar esta política periódicamente para
              mantenerse informado.
            </p>

            <p className="text-gray-700 dark:text-gray-300 leading-relaxed">
              Si tiene preguntas o inquietudes sobre esta política de privacidad, puede contactarnos a
              través de nuestras redes sociales o nuestro correo electrónico.
            </p>

            <p className="text-center text-lg font-medium text-gray-800 dark:text-gray-200">
              Gracias por confiar en InvWe para la gestión de su inventario y facturación. Su privacidad es
              nuestra prioridad.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
