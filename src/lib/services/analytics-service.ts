import { IProduct, IStock, IMovement, ICategory } from '../mongodb';
import { ObjectId } from 'mongodb';

// Verificar si estamos en el servidor
const isServer = typeof window === 'undefined';

// Importación dinámica para evitar errores en el cliente
const getDatabase = async () => {
  if (!isServer) {
    throw new Error('Esta función solo puede ser ejecutada en el servidor');
  }
  const { connectToDatabase } = await import('../mongodb');
  return connectToDatabase();
};

// Servicio para obtener datos analíticos
export const AnalyticsService = {
  // Obtener datos de ventas mensuales
  async getMonthlySalesData(subaccountId: string) {
    const { db } = await getDatabase();
    
    // Obtener fecha actual
    const now = new Date();
    const startDate = new Date(now.getFullYear(), now.getMonth() - 6, 1); // Últimos 6 meses
    
    // Obtener movimientos de salida (ventas)
    const movements = await db
      .collection('movements')
      .find({
        subaccountId,
        type: 'salida',
        createdAt: { $gte: startDate }
      })
      .toArray();
    
    // Agrupar por mes
    const monthlyData: Record<string, { ventas: number, tickets: number }> = {};
    
    // Inicializar los últimos 6 meses
    for (let i = 0; i < 7; i++) {
      const monthDate = new Date(now.getFullYear(), now.getMonth() - i, 1);
      const monthKey = monthDate.toLocaleString('es-ES', { month: 'short' });
      monthlyData[monthKey] = { ventas: 0, tickets: 0 };
    }
    
    // Procesar movimientos
    for (const movement of movements) {
      const date = new Date(movement.createdAt!);
      const monthKey = date.toLocaleString('es-ES', { month: 'short' });
      
      if (monthlyData[monthKey]) {
        // Buscar el producto para obtener el precio
        const product = await db
          .collection('products')
          .findOne({ _id: new ObjectId(movement.productId) });
        
        if (product) {
          // Sumar el valor de la venta (precio * cantidad)
          monthlyData[monthKey].ventas += product.price * movement.quantity;
          // Incrementar contador de tickets (consideramos cada movimiento como un ticket)
          monthlyData[monthKey].tickets += 1;
        }
      }
    }
    
    // Convertir a array para el gráfico
    return Object.entries(monthlyData)
      .map(([name, data]) => ({ name, ...data }))
      .reverse(); // Para mostrar en orden cronológico
  },
  
  // Obtener datos de ventas por categoría
  async getCategorySalesData(subaccountId: string) {
    const { db } = await getDatabase();
    
    // Obtener todas las categorías
    const categories = await db
      .collection('categories')
      .find({ subaccountId })
      .toArray();
    
    // Obtener todos los productos con sus categorías
    const products = await db
      .collection('products')
      .find({ subaccountId })
      .toArray();
    
    // Obtener movimientos de salida (ventas)
    const movements = await db
      .collection('movements')
      .find({ subaccountId, type: 'salida' })
      .toArray();
    
    // Inicializar datos por categoría
    const categoryData: Record<string, number> = {};
    categories.forEach(category => {
      categoryData[category._id.toString()] = 0;
    });
    
    // Categoría para productos sin categoría
    categoryData['sin_categoria'] = 0;
    
    // Procesar movimientos
    for (const movement of movements) {
      const product = products.find(p => p._id.toString() === movement.productId);
      
      if (product) {
        const categoryId = product.categoryId ? product.categoryId.toString() : 'sin_categoria';
        categoryData[categoryId] += movement.quantity;
      }
    }
    
    // Convertir a array para el gráfico
    return Object.entries(categoryData)
      .map(([categoryId, value]) => {
        // Buscar el nombre de la categoría
        const category = categories.find(c => c._id.toString() === categoryId);
        const name = category ? category.name : 'Sin categoría';
        
        return { name, value };
      })
      .filter(item => item.value > 0) // Solo incluir categorías con ventas
      .sort((a, b) => b.value - a.value); // Ordenar de mayor a menor
  },
  
  // Obtener productos más vendidos
  async getTopProducts(subaccountId: string, limit: number = 5) {
    const { db } = await getDatabase();
    
    // Obtener todos los productos
    const products = await db
      .collection('products')
      .find({ subaccountId })
      .toArray();
    
    // Obtener movimientos de salida (ventas)
    const movements = await db
      .collection('movements')
      .find({ subaccountId, type: 'salida' })
      .toArray();
    
    // Calcular ventas por producto
    const productSales: Record<string, number> = {};
    
    for (const movement of movements) {
      const productId = movement.productId;
      if (!productSales[productId]) {
        productSales[productId] = 0;
      }
      productSales[productId] += movement.quantity;
    }
    
    // Convertir a array para el gráfico
    return Object.entries(productSales)
      .map(([productId, ventas]) => {
        const product = products.find(p => p._id.toString() === productId);
        return {
          name: product ? product.name : 'Producto desconocido',
          ventas
        };
      })
      .sort((a, b) => b.ventas - a.ventas) // Ordenar de mayor a menor
      .slice(0, limit); // Limitar al número especificado
  },
  
  // Obtener estadísticas generales
  async getGeneralStats(subaccountId: string) {
    const { db } = await getDatabase();
    
    // Obtener todos los productos
    const products = await db
      .collection('products')
      .find({ subaccountId })
      .toArray();
    
    // Obtener todo el stock
    const stocks = await db
      .collection('stocks')
      .find({ subaccountId })
      .toArray();
    
    // Obtener contactos (clientes)
    const contacts = await db
      .collection('contacts')
      .find({ subaccountId })
      .toArray();
    
    // Obtener tickets activos
    const tickets = await db
      .collection('tickets')
      .find({ subaccountId })
      .toArray();
    
    // Calcular valor total del inventario
    let totalValue = 0;
    for (const stock of stocks) {
      const product = products.find(p => p._id.toString() === stock.productId);
      if (product) {
        totalValue += product.price * stock.quantity;
      }
    }
    
    return {
      totalContacts: contacts.length,
      totalTickets: tickets.length,
      totalProducts: products.length,
      totalValue
    };
  }
};