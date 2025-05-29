"use client";
import { useState } from "react";
import Link from "next/link";

type NavItem = {
  title: string;
  href: string;
  isActive?: boolean;
  children?: NavItem[];
};

const navItems: NavItem[] = [
  {
    title: "Introducción",
    href: "/docs",
    isActive: true,
  },
  {
    title: "Guías",
    href: "#",
    children: [
      { title: "Base de datos", href: "/docs/guides/database" },
      { title: "Optimización SEO", href: "/docs/guides/seo" },
      { title: "Análisis de competencia", href: "/docs/guides/competition" },
      { title: "Palabras clave", href: "/docs/guides/keywords" },
    ],
  },
  {
    title: "Referencias",
    href: "#",
    children: [
      { title: "API", href: "/docs/references/api" },
      { title: "CLI", href: "/docs/references/cli" },
      { title: "SDK", href: "/docs/references/sdk" },
    ],
  },
  {
    title: "Recursos",
    href: "#",
    children: [
      { title: "Preguntas frecuentes", href: "/docs/resources/faq" },
      { title: "Soporte", href: "/docs/resources/support" },
      { title: "Comunidad", href: "/docs/resources/community" },
    ],
  },
];

const NavItemComponent = ({ item }: { item: NavItem }) => {
  const [isOpen, setIsOpen] = useState(item.isActive || false);

  const toggleOpen = () => {
    if (item.children) {
      setIsOpen(!isOpen);
    }
  };

  return (
    <div className="mb-1">
      <div
        className={`flex items-center justify-between py-2 px-3 rounded-md cursor-pointer ${item.isActive ? "bg-[#1F1F1F] text-white" : "text-white/70 hover:text-white hover:bg-[#1F1F1F]/50"}`}
        onClick={toggleOpen}
      >
        {item.children ? (
          <span className="font-medium">{item.title}</span>
        ) : (
          <Link href={item.href} className="font-medium w-full">
            {item.title}
          </Link>
        )}
        {item.children && (
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className={`h-4 w-4 transition-transform ${isOpen ? "rotate-180" : ""}`}
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M19 9l-7 7-7-7"
            />
          </svg>
        )}
      </div>
      {item.children && isOpen && (
        <div className="ml-4 mt-1 border-l border-white/10 pl-2">
          {item.children.map((child) => (
            <Link
              key={child.title}
              href={child.href}
              className="block py-1.5 px-3 text-sm text-white/70 hover:text-white rounded-md hover:bg-[#1F1F1F]/50"
            >
              {child.title}
            </Link>
          ))}
        </div>
      )}
    </div>
  );
};

export const DocsSidebar = () => {
  return (
    <div className="w-64 shrink-0 border-r border-white/10 pr-4 py-6 h-[calc(100vh-64px)] sticky top-16 overflow-y-auto">
      <div className="space-y-6">
        {navItems.map((item) => (
          <NavItemComponent key={item.title} item={item} />
        ))}
      </div>
    </div>
  );
};