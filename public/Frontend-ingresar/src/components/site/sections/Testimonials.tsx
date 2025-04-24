"use client";
import avatar1 from "@/assets/avatar-1.png";
import avatar2 from "@/assets/avatar-2.png";
import avatar3 from "@/assets/avatar-3.png";
import avatar4 from "@/assets/avatar-4.png";
import Image from "next/image";
import {motion} from "framer-motion";

const testimonials = [
  {
    text: "Este producto ha transformado completamente la forma en que gestiono mis proyectos y plazos",
    name: "Sofía Pérez",
    title: "Directora @ Quantum",
    avatarImg: avatar1,
  },
  {
    text: "Estas herramientas de IA han revolucionado completamente nuestra estrategia SEO de la noche a la mañana",
    name: "Jaime León",
    title: "Fundador @ Pulse",
    avatarImg: avatar2,
  },
  {
    text: "La interfaz de usuario es tan intuitiva y fácil de usar que nos ha ahorrado incontables horas",
    name: "Alicia Hester",
    title: "Producto @ Innovate",
    avatarImg: avatar3,
  },
  {
    text: "La productividad de nuestro equipo ha aumentado significativamente desde que comenzamos a usar esta herramienta",
    name: "Alejandro Whitten",
    title: "CTO @ Tech Solutions",
    avatarImg: avatar4,
  },
];

export const Testimonials = () => {
  return (
    <section className="py-20 md:py-24">
      <div className="container">
        <h2 className="text-5xl  md:text-6xl text-center tracking-tighter font-medium">
          Más Allá de las Expectativas
        </h2>
        <p className="text-white/70 text-lg md:text-xl text-center mt-5 tracking-tight max-w-sm mx-auto">
          Nuestras revolucionarias herramientas de IA han transformado las estrategias de nuestros clientes
        </p>
        <div className=" flex overflow:hidden mt-10 [mask-image:linear-gradient(to_right,transparent,black_20%,black_80%,transparent)]">
          <motion.div 
          initial={{
            translateX: "-50%",
          }}
          animate={{
            translateX: "0%",
          }}
          transition={{
            duration: 20,
            repeat: Infinity,
            ease: "linear",
           
          }}
          
          className="flex gap-5 flex-none -translate-x-1/2 ">
            {[...testimonials, ...testimonials].map((testimonial) => (
              <div
                key={testimonial.name}
                className="border border-white/15 p-6 md:p-10  rounded-xl bg-[linear-gradient(to_bottom_left,rgb(140,69,255,.3),black)] max-w-xs md:max-w-md flex-none"
              >
                <div className="text-lg  tracking-tight md:text-xl">{testimonial.text}</div> 
                <div className="flex items-center gap-3 mt-5">
                  <div className="relative after:content-[''] after:absolute after:inset-0 after:bg-[rgb(140,69,244)] after:mix-blend-soft-light before:content-[''] before:absolute before:inset-0 before:before before:border-white/30 before:z-10 rounded-lg">
                    <Image
                      src={testimonial.avatarImg}
                      alt={`Avatar for ${testimonial.name}`}
                      className="h-11 w-11 rounded-lg grayscale "
                    />
                  </div>
                  <div className="">
                    <div>{testimonial.name}</div>
                    <div className="text-white/50 text-sm">
                      {testimonial.title}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </motion.div>
        </div>
      </div>
    </section>
  );
};
