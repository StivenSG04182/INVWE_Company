"use client";

import { useParams } from "next/navigation";
import { useEffect, useState } from "react";
import { Card } from "@/components/ui/card";
import Image from "next/image";
import { ChartContainer, ChartLegendContent, ChartTooltipContent } from "@/components/ui/chart";
import { LineChart, CartesianGrid, XAxis, YAxis, Line } from "recharts";

interface Company {
  name: string;
  _id?: string;
}

interface Product {
  name: string;
  quantity: number;
  type: string;
  image: string;
}

const createProduct = (
  name: string, 
  type: string, 
  quantity: number,
  image: string
): Product => ({
  name,
  type,
  quantity,
  image
});

const productList = [
  createProduct("manzana", "fruit", 25, "/images/apple.png"),
  createProduct("apio", "vegetable", 10, "/images/celery.png"),
  createProduct("almendras", "grain", 30, "/images/almonds.png"),
  createProduct("esparragos", "vegetable", 30, "/images/almonds.png")
];

const salesData = [
  { date: "2025-04-14", value: 120 },
  { date: "2025-04-15", value: 98 },
  { date: "2025-04-16", value: 134 },
  { date: "2025-04-17", value: 112 },
  { date: "2025-04-18", value: 145 },
  { date: "2025-04-19", value: 130 },
  { date: "2025-04-20", value: 150 },
];

const chartConfig = {
  ventas: {
    label: "Ventas diarias",
    color: "#4f46e5",
  },
};

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
      <main className="container mx-auto p-6">
        <h1 className="text-3xl font-bold pb-10">Dashboard de {companyName}</h1>
        <section className="mb-4 pl-7 p-2 border border-gray-300 rounded-md flex gap-x-8 gap-y-4 grid grid-flow-row">
          <div className="bg-gray-200 rounded-md w-[15.5rem] px-1">
            <h2 className="text-lg text-center font-semibold">Productos bajos de stock</h2>
          </div>
          <div className="flex gap-8 overflow-x-auto">
          {productList.sort((a, b) => a.quantity - b.quantity).map((product, index) => (
            <Card key={index} className="flex flex-col items-center border-none shadow-none">
              <div className="relative w-16 h-16 rounded-full overflow-hidden mb-2 border-2 border-gray-200">
                <Image
                  src={product.image}
                  alt={product.name}
                  fill
                  className="object-cover"
                  sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                />
              </div>
              <div className="text-center">
                <p className="text-sm capitalize">{product.name}</p>
                <p className="text-gray-500 text-xs">Cantidad: {product.quantity}</p>
              </div>
            </Card>
          ))}
          </div>
        </section>
        <section className="mb-4 grid grid-cols-5 gap-2">
          <div className="border border-color-gray-300 rounded-md p-4 pt-2 col-span-3">
            <h2 className="mb-4 text-lg font-semibold">Ventas</h2>
            <ChartContainer config={chartConfig} className="w-full h-64 transform -translate-x-4">
              <LineChart data={salesData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="date"
                       interval={0}
                       angle={-45}
                       textAnchor="end"
                       height={60}
                       tick={{ fontSize: 10 }} />
                <YAxis />
                <Line
                  type="monotone"
                  dataKey="value"
                  stroke="var(--color-ventas)"
                  dot={{ fill: "var(--color-ventas)" }}
                />
                <ChartTooltipContent />
                <ChartLegendContent />
              </LineChart>
            </ChartContainer>
          </div>
          <div className="border border-color-gray-300 rounded-md p-2 col-span-2">
          
          </div>
        </section>
      </main>
    </div>
  );
}