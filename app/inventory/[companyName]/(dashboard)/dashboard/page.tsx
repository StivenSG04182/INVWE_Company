"use client";

import { useParams } from "next/navigation";
import { useEffect, useState } from "react";
import Head from 'next/head';

interface Company {
  name: string;
  _id?: string;
}

export default function DashboardPage() {
  const params = useParams();
  const [loading, setLoading] = useState(true);
  const [, setCompany] = useState<Company | null>(null);
  const [error, setError] = useState<string>("");
  
  const companyName = typeof params.companyName === 'string' 
    ? decodeURIComponent(params.companyName) 
    : '';
  
  useEffect(() => {
    const fetchCompanyData = async () => {
      try {
        const response = await fetch('/api/control_login/companies');
        const data = await response.json();
        
        if (data.isValid && data.data?.company) {
          setCompany(data.data.company);
        } else {
          setError(data.error || "No se pudo cargar la información de la empresa");
        }
      } catch (err) {
        console.error("Error fetching company data:", err);
        setError("Error al cargar los datos de la empresa");
      } finally {
        setLoading(false);
      }
    };

    if (companyName) {
      fetchCompanyData();
    } else {
      console.error("No company name found in URL parameters");
      setLoading(false);
    }
  }, [companyName]);
  
  if (loading) {
    return <div className="p-4">Loading dashboard...</div>;
  }

  if (error) {
    return <div className="p-4 text-red-500">{error}</div>;
  }
  
  return (
    <div className="min-h-screen bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100">
    <Head>
      <title>Mi Sitio Minimalista</title>
      <meta name="viewport" content="width=device-width, initial-scale=1" />
    </Head>

    {/* Encabezado */}
    <header className="py-4 px-6 border-b border-gray-200 dark:border-gray-700">
      <div className="container mx-auto flex justify-between items-center">
        <h1 className="text-2xl font-bold">Mi Sitio Minimalista</h1>
        <nav>
          <ul className="flex space-x-4">
            <li><a href="#" className="hover:underline">Inicio</a></li>
            <li><a href="#" className="hover:underline">Acerca</a></li>
            <li><a href="#" className="hover:underline">Contacto</a></li>
          </ul>
        </nav>
      </div>
    </header>

    {/* Contenido Principal */}
    <main className="container mx-auto p-6">
      <section className="mb-8">
        <h2 className="text-xl font-semibold mb-4">Bienvenido</h2>
        <p>
          Este es un ejemplo de un diseño minimalista utilizando Next.js y Tailwind CSS 3,
          inspirado en el estilo limpio y moderno de cuicui.day. El fondo es sencillo y se adapta
          al modo claro y oscuro para mejorar la experiencia de usuario.
        </p>
      </section>
      {/* Agrega más secciones o componentes según necesites */}
    </main>

    {/* Pie de Página */}
    <footer className="py-4 px-6 border-t border-gray-200 dark:border-gray-700">
      <div className="container mx-auto text-center">
        <p>&copy; 2025 Mi Sitio Minimalista. Todos los derechos reservados.</p>
      </div>
    </footer>
  </div>
  );
}