import React from "react";
import { Badge } from "@/components/ui/badge";
import { AlertTriangle } from "lucide-react";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";

interface StockStatusBadgeProps {
  product: any;
  showTooltip?: boolean;
  className?: string;
}

export default function StockStatusBadge({ product, showTooltip = true, className = "" }: StockStatusBadgeProps) {
  // Usar directamente el campo quantity del producto
  const quantity = product.quantity || 0;

  // Obtener el stock mínimo del producto
  const minStock = product.minStock || 0;

  // Si no hay stock mínimo definido, no podemos calcular un porcentaje
  if (minStock <= 0) {
    return null;
  }

  // Determinar el estado del stock según los criterios del formulario de productos
  let status: "bajo" | "normal" | "alto" = "normal";
  let label = "Stock Normal";
  let variant: "destructive" | "default" | "secondary" = "secondary";
  let icon = null;

  // Calcular el porcentaje para el tooltip
  const percentage = (quantity / minStock) * 100;

  // Aplicar la misma lógica que en product-form.tsx
  if (quantity <= Math.max(minStock * 0.1, 5)) {
    status = "bajo";
    label = "Stock Bajo";
    variant = "destructive";
    icon = <AlertTriangle className="h-3 w-3 mr-1" />;
  } else if (quantity >= minStock * 0.6) {
    status = "alto";
    label = "Stock Alto";
    variant = "default";
  }

  const badge = (
    <Badge variant={variant} className={`${className} flex items-center`}>
      {icon}
      {label}
    </Badge>
  );

  if (!showTooltip) {
    return badge;
  }

  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>
          {badge}
        </TooltipTrigger>
        <TooltipContent>
          <p>
            {status === "bajo" 
              ? `¡Alerta! Solo quedan ${quantity} unidades (${Math.round(percentage)}% del mínimo recomendado)` 
              : status === "alto" 
                ? `Stock saludable: ${quantity} unidades (${Math.round(percentage)}% del mínimo)` 
                : `Stock: ${quantity} unidades (${Math.round(percentage)}% del mínimo)`
            }
          </p>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
}