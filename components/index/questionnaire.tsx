import SocialMediaIcons from "./SocialMediaIcons";

export default function Questionnaire() {
  return (
    <div className="w-full max-w-4xl bg-white/50 backdrop-blur-lg p-0 rounded-xl shadow-md border border-gray-300">
      <h1>
        <b>Escríbenos</b>
      </h1>
      <p>
        ¡Gracias por visitar nuestra página!
        <br />
        Si tienes alguna pregunta o necesitas más información, no dudes en
        ponerte en contacto con nosotros.
      </p>
      <div className="flex justify-between w-full max-w-4xl bg-white/80 backdrop-blur-lg p-6 rounded-xl shadow-md border border-gray-300">
        <div className="">
          <b>Nombre</b> <br />
          <input type="text" placeholder="Nombre" />
          <br />
          <b>Email</b> <br />
          <input type="email" placeholder="Email" />
          <br />
          <b>Teléfono</b> <br />
          <input type="tel" placeholder="Teléfono" />
          <br />
          <b>Mensaje</b> <br />
          <textarea placeholder="Mensaje" />
          <br />
        </div>

        <div className="w-full items-center w-full max-w-4xl bg-white/80 backdrop-blur-lg p-6 rounded-xl shadow-md border border-gray-300">
          <h2>
            ¡Hola! siempre puedes encontrarnos en nuestras redes sociales.
          </h2>
          <p className="w-full max-w-2xl bg-white/80 backdrop-blur-lg p-1 rounded-xl shadow-md border border-gray-300">
            <b>SMS/Whatsapp</b> <br />+57 323 3453782
          </p>
          <p className="w-full max-w-2xl bg-white/80 backdrop-blur-lg p-1 rounded-xl shadow-md border border-gray-300">
            <b>Email</b> <br /> info@invwe.com
          </p>{" "}
          <br />
          <SocialMediaIcons />
        </div>
      </div>
            </div>
  );
}
