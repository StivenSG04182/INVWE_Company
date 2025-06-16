import Link from "next/link";
import Image from "next/image";
import { Separator } from "@/components/ui/separator";

const footerColumns = [
  {
    title: "Sobre nosotros",
    links: [
      { label: "Como funciona", href: "/site/sobre-nosotros" },
      { label: "Destacados", href: "/site/productos" },
      { label: "Sociedad", href: "/site/sobre-nosotros" },
      { label: "Negocios", href: "/site/sistema-pos" },
    ],
  },
  {
    title: "Comunidad",
    links: [
      { label: "Eventos", href: "/site/blog" },
      { label: "Blog", href: "/site/blog" },
      { label: "Podcast", href: "/site/blog" },
      { label: "Invitar a un amigo", href: "/site/contacto" },
    ],
  },
  {
    title: "Redes",
    links: [
      { label: "Discord", href: "#" },
      { label: "Instagram", href: "#" },
      { label: "Twitter", href: "#" },
      { label: "Facebook", href: "#" },
    ],
  },
];

export function Footer() {
  return (
    <footer className="w-full bg-[#d3dbe6] py-20 px-4">
      <div className="container mx-auto max-w-6xl">
        {/* Top section */}
        <div className="flex flex-col lg:flex-row justify-between mb-16 gap-12">
          {/* Logo and company description */}
          <div className="flex flex-col gap-8 lg:max-w-sm">
            <Link href="/site" className="flex-shrink-0">
              <Image
                src="/logoNatulanda.png"
                alt="Natulanda Logo"
                width={150}
                height={150}
                className="object-cover rounded-full"
              />
            </Link>

            <p className="text-black font-medium">
              Natulanda para Sentirse bien
            </p>

            {/* Social media icons */}
            <div className="flex gap-5">
              <div className="w-8 h-8 bg-black rounded-full flex items-center justify-center">
                <span className="text-white text-sm">f</span>
              </div>
              <div className="w-8 h-8 bg-black rounded-full flex items-center justify-center">
                <span className="text-white text-sm">t</span>
              </div>
              <div className="w-8 h-8 bg-black rounded-full flex items-center justify-center">
                <span className="text-white text-sm">i</span>
              </div>
            </div>
          </div>

          {/* Footer columns */}
          <div className="flex flex-col md:flex-row gap-12 lg:gap-20">
            {footerColumns.map((column, index) => (
              <div key={index} className="min-w-[156px]">
                <h3 className="font-semibold text-xl text-black mb-6">
                  {column.title}
                </h3>
                <div className="space-y-4">
                  {column.links.map((link, linkIndex) => (
                    <Link
                      key={linkIndex}
                      href={link.href}
                      className="block text-black hover:text-[#486283] transition-colors duration-200"
                    >
                      {link.label}
                    </Link>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Divider */}
        <Separator className="bg-black/10 my-8" />

        {/* Footer bottom */}
        <div className="flex flex-col md:flex-row justify-between items-center gap-4">
          <div className="text-black font-semibold">
            ©2025 Natulanda. Todos los derechos reservados
          </div>

          <div className="flex flex-col md:flex-row gap-4 md:gap-10">
            <Link
              href="/site/terminos"
              className="text-black hover:text-[#486283] transition-colors duration-200 font-semibold"
            >
              Términos y condiciones
            </Link>
            <Link
              href="/site/condiciones"
              className="text-black hover:text-[#486283] transition-colors duration-200 font-semibold"
            >
              Políticas de privacidad
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
