"use client";

import { useParams } from "next/navigation";
import { useEffect, useState } from "react";
import { Card } from "@/components/ui/card";
import Image from "next/image";
import { ChartContainer, ChartLegendContent } from "@/components/ui/chart";
import { LineChart, CartesianGrid, XAxis, YAxis, Line, Tooltip, TooltipProps } from "recharts";

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

const ChartTooltipContent: React.FC<TooltipProps<number, string>> = ({
  active,
  payload,
  label,
}) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-white p-2 border rounded shadow text-sm text-black">
        <p className="font-semibold">{label ?? "Fecha desconocida"}</p>
        <p>Ventas: {payload?.[0]?.value}</p>
      </div>
    );
  }

  return null;
};

interface Supplier {
  name: string;
  productType: string;
  email: string;
  status: "Activo" | "Inactivo";
}

const supplierList: Supplier[] = [
  {
    name: "Frutas El Valle",
    productType: "Frutas",
    email: "contacto@elvalle.com",
    status: "Activo",
  },
  {
    name: "Verduras Naturales",
    productType: "Verduras",
    email: "ventas@vernatur.com",
    status: "Activo",
  },
  {
    name: "Graneros del Norte",
    productType: "Granos",
    email: "info@granerosnorte.com",
    status: "Inactivo",
  },
];

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
        <h2 className="pl-4 mb-2 text-lg font-semibold">Productos bajos de stock</h2>
        <section className="mb-4 pl-7 p-2 border border-gray-300 rounded-md flex gap-x-8 gap-y-4 grid grid-flow-row">
          <div className="flex gap-8 overflow-x-auto">
          {productList.length > 0 ? (
            productList.sort((a, b) => a.quantity - b.quantity).map((product, index) => (
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
                ))
              ) : (
                <p className="text-sm text-gray-500">No hay productos registrados.</p>
              )}
          </div>
        </section>
        <section className="mb-4 grid grid-cols-5 gap-2">
          <div className="border border-color-gray-300 rounded-md p-4 pt-2 col-span-3">
            <h2 className="mb-4 text-lg font-semibold">Ventas</h2>
            <ChartContainer config={chartConfig} className="w-full h-64 transform -translate-x-4">
                {salesData.length > 0 ? (
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
                <Tooltip content={<ChartTooltipContent />} />
                <ChartLegendContent />
                </LineChart>
                ) : (
                  <p className="text-sm text-gray-500">No hay datos de ventas disponibles.</p>
                )}
            </ChartContainer>
          </div>
          <div className="border border-color-gray-300 rounded-md p-4 col-span-2">
            <h2 className="mb-4 text-lg font-semibold">Resumen general</h2>
            <div className="grid grid-cols-2 gap-4 h-max">
              <Card className="p-4 text-center bg-gray-100 dark:bg-gray-800">
                <h3 className="text-sm text-gray-500 dark:text-gray-400">Total de productos</h3>
                <p className="text-2xl font-bold">{productList.length}</p>
              </Card>
              <Card className="p-4 text-center bg-gray-100 dark:bg-gray-800">
                <h3 className="text-sm text-gray-500 dark:text-gray-400">Unidades en inventario</h3>
                <p className="text-2xl font-bold text-blue-600">
                  {productList.reduce((total, product) => total + product.quantity, 0)}
                </p>
              </Card>
              <Card className="p-4 text-center bg-gray-100 dark:bg-gray-800">
                <h3 className="text-sm text-gray-500 dark:text-gray-400">Ventas esta semana</h3>
                <p className="text-2xl font-bold text-green-600">
                  {salesData.reduce((total, sale) => total + sale.value, 0)}
                </p>
              </Card>
              <Card className="p-4 text-center bg-gray-100 dark:bg-gray-800">
                <h3 className="text-sm text-gray-500 dark:text-gray-400">Productos críticos</h3>
                <p className="text-2xl font-bold text-red-500">
                  {productList.filter(product => product.quantity < 15).length}
                </p>
              </Card>
            </div>
          </div>
        </section>
        <section>
          <div className="border border-color-gray-300 rounded-md p-4">
              <h2 className="text-2xl font-semibold mb-4">Proveedores</h2>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {supplierList.length > 0 ? (
                supplierList.map((supplier, index) => (
                  <Card key={index} className="p-4 bg-gray-100 dark:bg-gray-800">
                    <h3 className="text-lg font-bold mb-1">{supplier.name}</h3>
                    <p className="text-sm text-gray-600 dark:text-gray-300">Tipo de producto: <span className="font-medium">{supplier.productType}</span></p>
                    <p className="text-sm text-gray-600 dark:text-gray-300">Correo: <a href={`mailto:${supplier.email}`} className="text-blue-600 underline">{supplier.email}</a></p>
                    <p className={`text-sm font-semibold mt-2 ${supplier.status === "Activo" ? "text-green-600" : "text-red-500"}`}>
                      {supplier.status}
                    </p>
                    </Card>
                      ))
                    ) : (
                      <p className="text-sm text-gray-500">No hay proveedores registrados.</p>
                    )}
              </div>
          </div>
        </section>
      </main>
    </div>
  );
}
