'use client';
import Image from "next/image";
import acmeLogo from "../assets/logo-acme.png";
import apexLogo from "../assets/logo-apex.png";
import celestiallogo from "../assets/logo-celestial.png";
import quantumLogo from "../assets/logo-quantum.png";
import pulseLogo from "../assets/logo-pulse.png";
import echoLogo from "../assets/logo-echo.png";
import { motion } from "framer-motion";

export const LogoTicker = () => {
  const logos = [
    { src: acmeLogo, alt: "Acme Logo" },
    { src: apexLogo, alt: "Apex Logo" },
    { src: celestiallogo, alt: "Celestial Logo" },
    { src: quantumLogo, alt: "Quantum Logo" },
    { src: pulseLogo, alt: "Pulse Logo" },
    { src: echoLogo, alt: "Echo Logo" },
  ];

  return (
    <section className="py-20 md:py-24">
      <div className="container">
        <div className="flex items-center gap-5">
          <div className="flex-1 md:flex-none">
            <h2>Confiado por los equipos más innovadores</h2>
          </div>
          <div className="flex flex-1 overflow-hidden [mask-image:linear-gradient(to_right,transparent,black_20%,black_80%,transparent)]">
            <motion.div
              initial={{ translateX: "-50%" }}
              animate={{ translateX: "0" }}
              transition={{ repeat: Infinity, duration: 30, ease: "linear" }}
              className="flex flex-none gap-14 -translate-x-1/2"
            >
              {[...logos, ...logos].map((logo, index) => (
                <Image
                  src={logo.src}
                  alt={logo.alt}
                  key={`${logo.src}-${index}`}
                  width={50} // Adjust as needed
                  height={30} // Adjust as needed
                  className="h-6 w-auto"
                />
              ))}
            </motion.div>
          </div>
        </div>
      </div>
    </section>
  );
};
