'use client'
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useState } from 'react';
import { Tabs, TabsContent, TabsTrigger, TabsList } from '@/components/ui/tabs';
import { Dialog, DialogContent, DialogTitle, DialogTrigger } from '@/components/ui/dialog';

interface Movement {
    id: number;
    name: string;
    date: Date;
    description: string;
}

export default function MovementsPage() {
    const [movements, setMovements] = useState<Movement[]>([
        {
            id: 1,
            name: 'se realiza cambios en el stock',
            date: new Date(2025, 4, 24), // Correct format: year, monthIndex (0-11), day
            description:
                'se agrega un nuevo producto, y se realiza un cambio en el stock',
        },
        {
            id: 2,
            name: 'se realiza cambios en el stock',
            date: new Date(2025, 4, 24), // Correct format: year, monthIndex (0-11), day"
            description:
                'se agrega un nuevo producto, y se realiza un cambio en el stock',
        },
    ]);

    return (
      <h1 className="text-2xl font-bold mb-4">Movements History</h1>
    <Dialog>
        <DialogTrigger asChild>
    <div>
      <div className="flex gap-4 mb-6">
        <Input placeholder="Search movement..." className="max-w-sm" />
        <Button>Filter</Button>
      </div>
        </DialogTrigger>
        <DialogContent>
            <DialogTitle>Filter Movements</DialogTitle>
            <Tabs>
                <TabsList>
                    <TabsTrigger value='all'>All</TabsTrigger>
                    <TabsTrigger value='today'>Today</TabsTrigger>
                    <TabsTrigger value='week'>This Week</TabsTrigger>
                    <TabsTrigger value='month'>This Month</TabsTrigger>
                    <TabsTrigger value='year'>This Year</TabsTrigger>
                </TabsList>
                <TabsContent value='all'>
                    
                </TabsContent>
            </Tabs>
        </DialogContent>
    </Dialog>
      <div className="flex flex-col gap-4">
        {movements.map((movement: Movement) => (
          <Card key={movement.id} className="flex flex-col">
            <CardHeader>
              <CardTitle>{movement.name}</CardTitle>
            </CardHeader>           
            <CardContent>
              <p className="text-sm text-gray-600">
              date: {movement.date.toLocaleDateString()}
                <p>description: {movement.description}</p>
              </p>
              <div className="grid grid-cols-2 gap-2 mt-4">
                <Button variant="outline" size="sm">
                  Edit
                </Button>
                <Button variant="destructive" size="sm">
                  Delete
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div >
  );
}