"use client";

import { useParams } from "next/navigation";
import { useEffect, useState } from "react";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

interface Company {
  name: string;
  _id?: string;
}

export default function DashboardAdminPage() {
  const params = useParams();
  const [loading, setLoading] = useState(true);
  const [company, setCompany] = useState<Company | null>(null);
  const [error, setError] = useState<string>("");
  const systemStats = [
    { name: 'Lun', usuarios: 45, transacciones: 240 },
    { name: 'Mar', usuarios: 52, transacciones: 310 },
    { name: 'Mié', usuarios: 60, transacciones: 450 },
    { name: 'Jue', usuarios: 58, transacciones: 380 },
    { name: 'Vie', usuarios: 72, transacciones: 520 },
    { name: 'Sáb', usuarios: 65, transacciones: 410 },
    { name: 'Dom', usuarios: 48, transacciones: 290 },
  ];
  
  const companyName = typeof params.companyName === 'string' 
    ? decodeURIComponent(params.companyName) 
    : '';
  
  useEffect(() => {
    const fetchCompanyData = async () => {
      try {
        const response = await fetch('/api/admin/companies');
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
    <div className="p-4 bg-gray-50 min-h-screen">
      <h1 className="text-2xl font-bold mb-6 text-blue-600">Panel Administrativo - {company?.name}</h1>
          <div className="bg-white p-4 rounded-md shadow mb-4">
            <h3 className="text-lg font-semibold mb-4">Estadísticas del Sistema</h3>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={systemStats} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="name" />
                  <YAxis />
                  <Tooltip />
                  <Line type="monotone" dataKey="usuarios" stroke="#2563eb" />
                  <Line type="monotone" dataKey="transacciones" stroke="#16a34a" />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </div>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white p-4 rounded-md shadow">
          <h2 className="text-lg font-semibold mb-2">Información de la Empresa</h2>
          <p>ID: {company?._id || 'No disponible'}</p>
          <p>Nombre: {company?.name || 'No disponible'}</p>
        </div>
        <div className="bg-white p-4 rounded-md shadow">
          <h2 className="text-lg font-semibold mb-2">Estado del Sistema</h2>
          <div className="space-y-2">
            <p>Estado: <span className="font-semibold text-green-600">Operativo</span></p>
            <p>Usuarios conectados: 8</p>
            <p>Uso de almacenamiento: 2.5/10 GB</p>
            <p>Última actualización: {new Date().toLocaleString()}</p>
          </div>
        </div>
        <div className="bg-white p-4 rounded-md shadow border-l-4 border-blue-500">
          <h2 className="text-lg font-semibold mb-2 text-blue-600">Gestión de Usuarios</h2>
          <div className="space-y-2">
            <p>Usuarios activos: 15</p>
            <p>Administradores: 3</p>
            <p>Último registro: 2024-03-15</p>
            <button className="mt-2 bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 text-sm">
              Administrar usuarios
            </button>
          </div>
        </div>
        <div className="bg-white p-4 rounded-md shadow border-l-4 border-blue-500">
          <h2 className="text-lg font-semibold mb-2 text-blue-600">Actividad Reciente</h2>
          <div className="space-y-2 text-sm">
            <p>• Usuario123 editó producto (15:32)</p>
            <p>• Nuevo pedido #4567 (14:45)</p>
            <p>• Actualización del sistema (13:00)</p>
            <button className="mt-2 text-blue-600 hover:underline text-xs">
              Ver registro completo
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}