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
  </div>
  );
}