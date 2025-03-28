'use client'
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useState } from 'react';
import { Tabs, TabsContent, TabsTrigger, TabsList } from '@/components/ui/tabs';
import { Dialog, DialogContent, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { DataTable } from '@/components/ui/data-table';
import { columns } from './components/columns';

interface Movement {
  id: number;
  name: string;
  date: Date;
  description: string;
}

export default function MovementsPage() {
  const [date, setDate] = useState<DateRange | undefined>({
    from: new Date(),
    to: new Date(),
  });

  const [filters, setFilters] = useState<Record<string, string[]>>({
    stock: [],
    productos: []
  });
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const [activeTab, setActiveTab] = useState('stock');

  const movements: Movement[] = [
    {
      id: 1,
      name: 'Ajuste de stock',
      date: new Date(),
      description: 'Ajuste inicial de inventario'
    },
    {
      id: 2,
      name: 'Traslado de productos',
      date: new Date(),
      description: 'Movimiento entre bodegas'
    }
  ];

  const handleFilterChange = (filterType: string, isChecked: boolean) => {
    setFilters(prev => {
      const currentFilters = [...prev[activeTab]];
      if (isChecked) {
        currentFilters.push(filterType);
      } else {
        const index = currentFilters.indexOf(filterType);
        if (index > -1) currentFilters.splice(index, 1);
      }
      return { ...prev, [activeTab]: currentFilters };
    });
  };

  return (
    <>
      <Tabs defaultValue="stock" onValueChange={(tab) => {
        setActiveTab(tab);
        setFilters(prev => ({ ...prev, [tab]: [] }));
      }}>
        <div className="flex gap-4 mb-4">
          <TabsList className="grid grid-cols-2">
            <TabsTrigger value="stock">Movimientos de Stock</TabsTrigger>
            <TabsTrigger value="productos">Movimientos de Productos</TabsTrigger>
          </TabsList>
          
        </div>
        <TabsContent value="stock">
          <div className="flex items-center gap-4">
            <DataTable
              columns={columns}
              data={movements.filter(m => m.name.includes('stock'))}
              searchKey="name"
              searchPlaceholder="Buscar movimientos..."
            />
            <Dialog open={isFilterOpen} onOpenChange={setIsFilterOpen}>
              <DialogTrigger asChild>
                <Button variant="outline">Filtro</Button>
              </DialogTrigger>
              <DialogContent>
                <DialogTitle>Filtrar por:</DialogTitle>
                <div className="space-y-4">
                  {/* Contenido de filtros existente */}
                </div>
              </DialogContent>
            </Dialog>
          </div>
        </TabsContent>
        <TabsContent value="productos">
          <div className="flex items-center gap-4">
            <DataTable
              columns={columns}
              data={movements}
              searchKey="name"
              searchPlaceholder="Buscar productos..."
            />
            <Dialog open={isFilterOpen} onOpenChange={setIsFilterOpen}>
              <DialogTrigger asChild>
                <Button variant="outline">Filtro</Button>
              </DialogTrigger>
              <DialogContent>
                <DialogTitle>Filtrar por:</DialogTitle>
                <div className="space-y-4">
                  {/* Contenido de filtros específico para productos */}
                </div>
              </DialogContent>
            </Dialog>
          </div>
        </TabsContent>
      </Tabs>
    </>
  );
}