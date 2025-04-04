'use client'
import { Button } from '@/components/ui/button';
import { useState } from 'react';
import { Tabs, TabsContent, TabsTrigger, TabsList } from '@/components/ui/tabs';
import { Dialog, DialogContent, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { columns } from './components/columns';
import { Checkbox } from '@/components/ui/checkbox';
import { DatePickerWithRange } from '@/components/ui/date-range-picker';
import { Table, TableHeader, TableBody, TableRow, TableCell, Spinner, TableColumn, Pagination } from '@heroui/react';
import useSWR from 'swr';


const fetcher = (...args: [string, RequestInit?]) => fetch(...args).then((res) => res.json());

export default function MovementsPage() {
  const [page, setPage] = useState(1);
  const [dateRange, setDateRange] = useState({
    from: new Date(),
    to: new Date()
  });

  const {data, isLoading} = useSWR(`/api/movements?page=${page}`, fetcher, {
    keepPreviousData: true
  });

  const [filters, setFilters] = useState<Record<string, string[]>>({
    stock: [],
    productos: []
  });
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const [activeTab, setActiveTab] = useState<TabType>('stock');

  const rowsPerPage = 10;

  const pages = data?.count ? Math.ceil(data.count / rowsPerPage) : 0;
  const loadingState = isLoading || !data?.results?.length ? "loading" : "idle";

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

  const filteredMovements = data?.results?.filter((movement: { date: string; name: string }) => {
    if (!movement) return false;
    const moveDate = new Date(movement.date);
    const dateInRange = moveDate >= dateRange.from && moveDate <= dateRange.to;
    const matchesFilter = filters[activeTab].length === 0 ||
      filters[activeTab].some(filter => movement.name.toLowerCase().includes(filter.toLowerCase()));
    return dateInRange && matchesFilter;
  }) || [];

  return (
    <>
      <Tabs defaultValue="stock" onValueChange={(value: string) => {
        const tab = value as TabType;
        setActiveTab(tab);
        setFilters(prev => ({ ...prev, [tab]: [] }));
      }}>
        <div className="flex w-screen">
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
        <div className="border-b border-black my-4" />
        <TabsContent value="stock">
          <div className="flex items-center gap-4">
            <Table
              aria-label="Movimientos de stock"
              className="dark"
              bottomContent={
                pages > 0 ? (
                  <div className="flex w-full justify-center">
                    <Pagination
                      isCompact
                      showControls
                      showShadow
                      color="primary"
                      page={page}
                      total={pages}
                      onChange={(page) => setPage(page)}
                    />
                  </div>
                ) : null
              }
            >
              <TableHeader>
                {columns.map(column => (
                  <TableColumn key={column.accessorKey}>{column.header}</TableColumn>
                ))}
              </TableHeader>
              <TableBody
                items={data?.results ?? []}
                loadingContent={<Spinner />}
                loadingState={loadingState}
              >
                {(item) => (
                  <TableRow key={(item as { id: string }).id}>
                    {(columnKey) => <TableCell>{(item as Record<string, string | number | boolean>)[columnKey]}</TableCell>}
                  </TableRow>
                )}
              </TableBody>
            </Table>
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
            <Table aria-label="Movimientos de productos">
              <TableHeader>
                {columns.map(column => (
                  <TableColumn key={column.accessorKey}>{column.header}</TableColumn>
                ))}
              </TableHeader>
              <TableBody items={filteredMovements}>
                {(item) => (
                  <TableRow key={(item as { id: string }).id}>
                    {(columnKey) => <TableCell>{(item as Record<string, string | number | boolean>)[columnKey]}</TableCell>}
                  </TableRow>
                )}
              </TableBody>
            </Table>
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
