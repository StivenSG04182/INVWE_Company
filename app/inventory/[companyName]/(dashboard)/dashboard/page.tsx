"use client";

import { useParams } from "next/navigation";
import { useEffect, useState } from "react";

interface Company {
  name: string;
  _id?: string;
}

export default function DashboardPage() {
  const params = useParams();
  const [loading, setLoading] = useState(true);
  const [company, setCompany] = useState<Company | null>(null);
  const [error, setError] = useState<string>("");
  
  const companyName = typeof params.companyName === 'string' 
    ? decodeURIComponent(params.companyName) 
    : '';
  
  useEffect(() => {
    const fetchCompanyData = async () => {
      try {
        const response = await fetch('/api/companies');
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
    <div className="p-4">
      <h1 className="text-2xl font-bold mb-6">{company?.name || 'Dashboard'}</h1>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        <div className="bg-white p-4 rounded-md shadow">
          <h2 className="text-lg font-semibold mb-2">Información de la Empresa</h2>
          <p>ID: {company?._id || 'No disponible'}</p>
          <p>Nombre: {company?.name || 'No disponible'}</p>
        </div>
        <div className="bg-white p-4 rounded-md shadow">
          <h2 className="text-lg font-semibold mb-2">Estado del Sistema</h2>
          <p>Estado: {error ? 'Error' : 'Activo'}</p>
          <p>Última actualización: {new Date().toLocaleString()}</p>
        </div>
        <div className="bg-white p-4 rounded-md shadow">
          <h2 className="text-lg font-semibold mb-2">Acciones Rápidas</h2>
          <p>Próximamente: Acciones personalizadas</p>
        </div>
      </div>
    </div>
  );
}