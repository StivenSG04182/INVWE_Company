'use client';

import { PieChart, Pie, Cell, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, LineChart, Line } from 'recharts';

// Componente de gráfico circular
export function PieChartComponent({ data, dataKey, nameKey, colors }: {
  data: any[];
  dataKey: string;
  nameKey: string;
  colors?: string[];
}) {
  const defaultColors = ['#10b981', '#f43f5e', '#3b82f6', '#f59e0b', '#8b5cf6'];
  const chartColors = colors || defaultColors;
  
  return (
    <ResponsiveContainer width="100%" height="100%">
      <PieChart>
        <Pie
          data={data}
          cx="50%"
          cy="50%"
          innerRadius={60}
          outerRadius={80}
          paddingAngle={2}
          dataKey={dataKey}
          nameKey={nameKey}
          animationDuration={1500}
        >
          {data.map((entry, index) => (
            <Cell key={`cell-${index}`} fill={chartColors[index % chartColors.length]} />
          ))}
        </Pie>
        <Tooltip 
          formatter={(value: any) => [`${value}`, '']}
          contentStyle={{ backgroundColor: 'white', borderRadius: '0.375rem', border: '1px solid #e2e8f0' }}
        />
        <Legend verticalAlign="bottom" height={36} />
      </PieChart>
    </ResponsiveContainer>
  );
}

// Componente de gráfico de barras
export function BarChartComponent({ data, xAxisKey, bars }: {
  data: any[];
  xAxisKey: string;
  bars: { dataKey: string; fill: string; name?: string }[];
}) {
  return (
    <ResponsiveContainer width="100%" height="100%">
      <BarChart
        data={data}
        margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
      >
        <CartesianGrid strokeDasharray="3 3" />
        <XAxis dataKey={xAxisKey} />
        <YAxis />
        <Tooltip 
          contentStyle={{ backgroundColor: 'white', borderRadius: '0.375rem', border: '1px solid #e2e8f0' }}
        />
        <Legend />
        {bars.map((bar, index) => (
          <Bar 
            key={`bar-${index}`} 
            dataKey={bar.dataKey} 
            fill={bar.fill} 
            name={bar.name || bar.dataKey} 
          />
        ))}
      </BarChart>
    </ResponsiveContainer>
  );
}

// Componente de gráfico de líneas
export function LineChartComponent({ data, xAxisKey, lines }: {
  data: any[];
  xAxisKey: string;
  lines: { dataKey: string; stroke: string; name?: string }[];
}) {
  return (
    <ResponsiveContainer width="100%" height="100%">
      <LineChart
        data={data}
        margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
      >
        <CartesianGrid strokeDasharray="3 3" />
        <XAxis dataKey={xAxisKey} />
        <YAxis />
        <Tooltip 
          contentStyle={{ backgroundColor: 'white', borderRadius: '0.375rem', border: '1px solid #e2e8f0' }}
        />
        <Legend />
        {lines.map((line, index) => (
          <Line
            key={`line-${index}`}
            type="monotone"
            dataKey={line.dataKey}
            stroke={line.stroke}
            name={line.name || line.dataKey}
            activeDot={{ r: 8 }}
          />
        ))}
      </LineChart>
    </ResponsiveContainer>
  );
}