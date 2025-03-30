'use client'
import { Button } from '@/components/ui/button';
import { useState } from 'react';
import { Tabs, TabsContent, TabsTrigger, TabsList } from '@/components/ui/tabs';
import { Dialog, DialogContent, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { DataTable } from '@/components/ui/data-table';
import { columns } from './components/columns';
import { Checkbox } from '@/components/ui/checkbox';
import { DatePickerWithRange } from '@/components/ui/date-range-picker';

interface Movement {
  id: number;
  name: string;
  date: Date;
  description: string;
}

export default function MovementsPage() {
  const [dateRange, setDateRange] = useState({
    from: new Date(),
    to: new Date()
  });

  const [filters, setFilters] = useState<Record<string, string[]>>({
    stock: [],
    productos: []
  });
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const [activeTab, setActiveTab] = useState<TabType>('stock');

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

  const filterOptions: Record<TabType, string[]> = {
    stock: ['Ajustes', 'Entrada', 'Salida'],
    productos: ['Traslados', 'Devoluciones', 'Pérdidas']
  };

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

  const filteredMovements = movements.filter(movement => {
    const dateInRange = movement.date >= dateRange.from && movement.date <= dateRange.to;
    const matchesFilter = filters[activeTab].length === 0 ||
      filters[activeTab].some(filter => movement.name.toLowerCase().includes(filter.toLowerCase()));
    return dateInRange && matchesFilter;
  });

  return (
    <>
      <Tabs defaultValue="stock" onValueChange={(value: string) => {
        const tab = value as TabType;
        setActiveTab(tab);
        setFilters(prev => ({ ...prev, [tab]: [] }));
      }}>
        <div className="flex gap-4 mb-4">
          <TabsList className="grid grid-cols-2">
            <TabsTrigger value="stock">Movimientos de Stock</TabsTrigger>
            <TabsTrigger value="productos">Movimientos de Productos</TabsTrigger>
          </TabsList>
        </div>
        <div className="flex items-center gap-4 mb-4">
          <DatePickerWithRange
            date={dateRange}
            setDate={(date) => date && setDateRange({ from: date.from || new Date(), to: date.to || new Date() })}
          />
        </div>
        <TabsContent value="stock">
          <div className="flex items-center gap-4">
            <DataTable
              columns={columns}
              data={filteredMovements.filter(m => m.name.includes('stock'))}
              searchKey="name"
              searchPlaceholder="Buscar movimientos..."
            />
            <Dialog open={isFilterOpen} onOpenChange={setIsFilterOpen}>
              <DialogTrigger asChild>
                <Button variant="outline">Filtro</Button>
              </DialogTrigger>
              <DialogContent>
                <DialogTitle>Filtrar por:</DialogTitle>
                <div className="space-y-4 pt-4">
                  {filterOptions[activeTab].map((option) => (
                    <div key={option} className="flex items-center space-x-2">
                      <Checkbox
                        id={option}
                        checked={filters[activeTab].includes(option)}
                        onCheckedChange={(checked) => handleFilterChange(option, checked as boolean)}
                      />
                      <label htmlFor={option} className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
                        {option}
                      </label>
                    </div>
                  ))}
                </div>
              </DialogContent>
            </Dialog>
          </div>
        </TabsContent>
        <TabsContent value="productos">
          <div className="flex items-center gap-4">
            <DataTable
              columns={columns}
              data={filteredMovements}
              searchKey="name"
              searchPlaceholder="Buscar productos..."
            />
            <Dialog open={isFilterOpen} onOpenChange={setIsFilterOpen}>
              <DialogTrigger asChild>
                <Button variant="outline">Filtro</Button>
              </DialogTrigger>
              <DialogContent>
                <DialogTitle>Filtrar por:</DialogTitle>
                <div className="space-y-4 pt-4">
                  {filterOptions[activeTab].map((option) => (
                    <div key={option} className="flex items-center space-x-2">
                      <Checkbox
                        id={option}
                        checked={filters[activeTab].includes(option)}
                        onCheckedChange={(checked) => handleFilterChange(option, checked as boolean)}
                      />
                      <label htmlFor={option} className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
                        {option}
                      </label>
                    </div>
                  ))}
                </div>
              </DialogContent>
            </Dialog>
          </div>
        </TabsContent>
      </Tabs>
    </>
  );
}

type TabType = 'stock' | 'productos';
