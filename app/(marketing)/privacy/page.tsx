"use client";

import React from "react";

export default function Page() {
  return (
    <div className="text-justify container mx-auto p-4 md:p-8" style={{maxWidth:"80%", margin:"auto"}}>
      <h1 className="text-2xl md:text-3xl text-center font-bold mb-4 md:mb-6">Políticas de Privacidad de InvWe</h1>

      <p className="mb-4 text-sm md:text-base">
        En InvWe, nos comprometemos a proteger y respetar su privacidad. Esta política explica cómo
        recopilamos, usamos y protegemos su información personal cuando utiliza nuestro sistema de
        gestión de inventario y facturación. Al utilizar InvWe, usted acepta las prácticas descritas
        en esta política.
      </p>

      <h2 className="text-2xl font-semibold mb-2">
        Recolección de Información
      </h2>
      <p className="mb-4 text-sm md:text-base">
      Recopilamos información personal y de negocio, como su nombre, dirección, correo electrónico,
        número de teléfono, datos fiscales (RFC, NIT, etc.), detalles de inventario, proveedores,
        clientes y transacciones, así como datos de facturación y uso del sistema. Esta información se
        utiliza para gestionar su inventario y facturación, mejorar nuestros servicios, cumplir con
        obligaciones fiscales y legales, y enviarle notificaciones importantes sobre su cuenta o
        cambios en nuestros servicios.
      </p>

      <p className="mb-4 text-sm md:text-base">
        La recopilación de datos se realiza a través del registro de usuario, la interacción con el
        sistema al ingresar datos de inventario o facturas, comunicaciones directas (como correos
        electrónicos o llamadas) y tecnologías automáticas como cookies y herramientas de análisis.
        Estas herramientas nos ayudan a mejorar la experiencia del usuario y a optimizar nuestro
        sistema.
      </p>

      <p className="mb-4 text-sm md:text-base">
        Nos comunicamos con usted para notificarle sobre actualizaciones del sistema, cambios en
        nuestras políticas, resolver problemas técnicos o dudas sobre su cuenta, y enviar facturas
        electrónicas o recordatorios de pago. Usted puede optar por no recibir comunicaciones
        promocionales en cualquier momento.
      </p>

      <p className="mb-4 text-sm md:text-base">
        La seguridad de su información es una prioridad para nosotros. Utilizamos encriptación para
        proteger los datos sensibles, restringimos el acceso a personal autorizado y realizamos
        copias de seguridad periódicas para prevenir pérdidas de datos. En caso de una violación de
        seguridad, le notificaremos de inmediato y tomaremos medidas para mitigar cualquier daño.
      </p>

      <p className="mb-4 text-sm md:text-base">
        InvWe no está dirigido a menores de 18 años, y no recopilamos intencionalmente información de
        niños. Si descubre que un menor ha proporcionado datos personales, contáctenos para eliminar
        dicha información.
      </p>

      <p className="mb-4">
        Nos reservamos el derecho de actualizar esta política de privacidad en cualquier momento. Le
        notificaremos sobre cambios significativos a través de su correo electrónico o mediante una
        notificación en nuestro sistema. Le recomendamos revisar esta política periódicamente para
        mantenerse informado.
      </p>

      <p className="mb-4 text-sm md:text-base">
        Si tiene preguntas o inquietudes sobre esta política de privacidad, puede contactarnos a
        través de nuestras redes sociales o nuestro correo electrónico.
      </p>

      <p className="mb-4 text-sm md:text-base">
      Gracias por confiar en InvWe para la gestión de su inventario y facturación. Su privacidad es
        nuestra prioridad.
      </p>
    </div>
  );
}
