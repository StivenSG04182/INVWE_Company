import { IProduct, IStock, IArea, IProvider, IMovement, ICategory } from '../mongodb';
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

// Servicio para gestionar productos
export const ProductService = {
  // Obtener todos los productos de una agencia
  async getProducts(agencyId: string) {
    const { db } = await getDatabase();
    return db
      .collection('products')
      .find({ agencyId })
      .sort({ createdAt: -1 })
      .toArray();
  },

  // Obtener todos los productos de una subaccount específica
  async getProductsBySubaccount(subaccountId: string) {
    const { db } = await getDatabase();
    return db
      .collection('products')
      .find({ subaccountId })
      .sort({ createdAt: -1 })
      .toArray();
  },

  // Obtener un producto por ID
  async getProductById(agencyId: string, productId: string) {
    const { db } = await getDatabase();
    try {
      // Validar que productId sea un ObjectId válido
      if (!ObjectId.isValid(productId)) {
        throw new Error(`ID de producto inválido: ${productId}`);
      }
      return db.collection('products').findOne({ 
        _id: new ObjectId(productId),
        agencyId: agencyId 
      });
    } catch (error) {
      console.error('Error en getProductById:', error);
      return null;
    }
  },

  // Crear un nuevo producto
  async createProduct(product: IProduct) {
    const { db } = await getDatabase();
    const newProduct = {
      ...product,
      createdAt: new Date(),
      updatedAt: new Date(),
    };
    const result = await db.collection('products').insertOne(newProduct);
    return { ...newProduct, _id: result.insertedId };
  },

  // Actualizar un producto existente
  async updateProduct(id: string, product: Partial<IProduct>) {
    const { db } = await getDatabase();
    const updatedProduct = {
      ...product,
      updatedAt: new Date(),
    };
    try {
      // Validar que id sea un ObjectId válido
      if (!ObjectId.isValid(id)) {
        throw new Error(`ID de producto inválido: ${id}`);
      }
      await db
        .collection('products')
        .updateOne({ _id: new ObjectId(id) }, { $set: updatedProduct });
      return this.getProductById(product.agencyId || '', id);
    } catch (error) {
      console.error('Error en updateProduct:', error);
      return null;
    }
  },

  // Eliminar un producto
  async deleteProduct(id: string) {
    const { db } = await getDatabase();
    try {
      // Validar que id sea un ObjectId válido
      if (!ObjectId.isValid(id)) {
        throw new Error(`ID de producto inválido: ${id}`);
      }
      return db.collection('products').deleteOne({ _id: new ObjectId(id) });
    } catch (error) {
      console.error('Error en deleteProduct:', error);
      return { acknowledged: false, deletedCount: 0 };
    }
  },
};

// Servicio para gestionar stock
export const StockService = {
  // Obtener todo el stock de una agencia
  async getStocks(agencyId: string) {
    const { db } = await getDatabase();
    return db
      .collection('stocks')
      .find({ agencyId })
      .sort({ createdAt: -1 })
      .toArray();
  },

  // Obtener todo el stock de una subaccount específica
  async getStocksBySubaccount(subaccountId: string) {
    const { db } = await getDatabase();
    return db
      .collection('stocks')
      .find({ subaccountId })
      .sort({ createdAt: -1 })
      .toArray();
  },

  // Obtener stock por ID de producto
  async getStockByProductId(productId: string) {
    const { db } = await getDatabase();
    return db.collection('stocks').find({ productId }).toArray();
  },

  // Obtener stock por ID de área
  async getStockByAreaId(areaId: string) {
    const { db } = await getDatabase();
    return db.collection('stocks').find({ areaId }).toArray();
  },

  // Crear o actualizar stock
  async updateStock(stock: IStock) {
    const { db } = await getDatabase();
    const existingStock = await db
      .collection('stocks')
      .findOne({ productId: stock.productId, areaId: stock.areaId });

    if (existingStock) {
      // Actualizar stock existente
      await db
        .collection('stocks')
        .updateOne(
          { _id: existingStock._id },
          { $set: { quantity: stock.quantity, updatedAt: new Date() } }
        );
      return { ...existingStock, quantity: stock.quantity, updatedAt: new Date() };
    } else {
      // Crear nuevo stock
      const newStock = {
        ...stock,
        createdAt: new Date(),
        updatedAt: new Date(),
      };
      const result = await db.collection('stocks').insertOne(newStock);
      return { ...newStock, _id: result.insertedId };
    }
  },
};

// Servicio para gestionar áreas
export const AreaService = {
  // Obtener todas las áreas de una agencia
  async getAreas(agencyId: string) {
    const { db } = await getDatabase();
    return db
      .collection('areas')
      .find({ agencyId })
      .sort({ name: 1 })
      .toArray();
  },

  // Obtener todas las áreas de una subaccount específica
  async getAreasBySubaccount(subaccountId: string) {
    const { db } = await getDatabase();
    return db
      .collection('areas')
      .find({ subaccountId })
      .sort({ name: 1 })
      .toArray();
  },

  // Obtener un área por ID
  async getAreaById(agencyId: string, id: string) {
    const { db } = await getDatabase();
    try {
      // Validar que id sea un ObjectId válido
      if (!ObjectId.isValid(id)) {
        throw new Error(`ID de área inválido: ${id}`);
      }
      return db.collection('areas').findOne({ 
        _id: new ObjectId(id),
        agencyId: agencyId 
      });
    } catch (error) {
      console.error('Error en getAreaById:', error);
      return null;
    }
  },

  // Crear una nueva área
  async createArea(area: IArea) {
    const { db } = await getDatabase();
    const newArea = {
      ...area,
      createdAt: new Date(),
      updatedAt: new Date(),
    };
    const result = await db.collection('areas').insertOne(newArea);
    return { ...newArea, _id: result.insertedId };
  },

  // Actualizar un área existente
  async updateArea(id: string, area: Partial<IArea>) {
    const { db } = await getDatabase();
    const updatedArea = {
      ...area,
      updatedAt: new Date(),
    };
    try {
      // Validar que id sea un ObjectId válido
      if (!ObjectId.isValid(id)) {
        throw new Error(`ID de área inválido: ${id}`);
      }
      await db
        .collection('areas')
        .updateOne({ _id: new ObjectId(id) }, { $set: updatedArea });
      return this.getAreaById(area.agencyId || '', id);
    } catch (error) {
      console.error('Error en updateArea:', error);
      return null;
    }
  },

  // Eliminar un área
  async deleteArea(id: string) {
    const { db } = await getDatabase();
    return db.collection('areas').deleteOne({ _id: new ObjectId(id) });
  },
};

// Servicio para gestionar categorías
export const CategoryService = {
  // Obtener todas las categorías de una agencia
  async getCategories(agencyId: string) {
    const { db } = await getDatabase();
    return db
      .collection('categories')
      .find({ agencyId })
      .sort({ name: 1 })
      .toArray();
  },

  // Obtener todas las categorías de una subaccount específica
  async getCategoriesBySubaccount(subaccountId: string) {
    const { db } = await getDatabase();
    return db
      .collection('categories')
      .find({ subaccountId })
      .sort({ name: 1 })
      .toArray();
  },

  // Obtener una categoría por ID
  async getCategoryById(id: string) {
    const { db } = await getDatabase();
    return db.collection('categories').findOne({ _id: new ObjectId(id) });
  },

  // Crear una nueva categoría
  async createCategory(category: ICategory) {
    const { db } = await getDatabase();
    const newCategory = {
      ...category,
      createdAt: new Date(),
      updatedAt: new Date(),
    };
    const result = await db.collection('categories').insertOne(newCategory);
    return { ...newCategory, _id: result.insertedId };
  },

  // Actualizar una categoría existente
  async updateCategory(id: string, category: Partial<ICategory>) {
    const { db } = await getDatabase();
    const updatedCategory = {
      ...category,
      updatedAt: new Date(),
    };
    await db
      .collection('categories')
      .updateOne({ _id: new ObjectId(id) }, { $set: updatedCategory });
    return this.getCategoryById(id);
  },

  // Eliminar una categoría
  async deleteCategory(id: string) {
    const { db } = await getDatabase();
    return db.collection('categories').deleteOne({ _id: new ObjectId(id) });
  },
};

// Servicio para gestionar proveedores
export const ProviderService = {
  // Obtener todos los proveedores de una agencia
  async getProviders(agencyId: string) {
    const { db } = await getDatabase();
    return db
      .collection('providers')
      .find({ agencyId })
      .sort({ name: 1 })
      .toArray();
  },

  // Obtener todos los proveedores de una subaccount específica
  async getProvidersBySubaccount(subaccountId: string) {
    const { db } = await getDatabase();
    return db
      .collection('providers')
      .find({ subaccountId })
      .sort({ name: 1 })
      .toArray();
  },

  // Obtener un proveedor por ID
  async getProviderById(agencyId: string, id: string) {
    const { db } = await getDatabase();
    try {
      // Validar que id sea un ObjectId válido
      if (!ObjectId.isValid(id)) {
        throw new Error(`ID de proveedor inválido: ${id}`);
      }
      return db.collection('providers').findOne({ 
        _id: new ObjectId(id),
        agencyId: agencyId 
      });
    } catch (error) {
      console.error('Error en getProviderById:', error);
      return null;
    }
  },

  // Crear un nuevo proveedor
  async createProvider(provider: IProvider) {
    const { db } = await getDatabase();
    const newProvider = {
      ...provider,
      createdAt: new Date(),
      updatedAt: new Date(),
    };
    const result = await db.collection('providers').insertOne(newProvider);
    return { ...newProvider, _id: result.insertedId };
  },

  // Actualizar un proveedor existente
  async updateProvider(id: string, provider: Partial<IProvider>) {
    const { db } = await getDatabase();
    const updatedProvider = {
      ...provider,
      updatedAt: new Date(),
    };
    try {
      // Validar que id sea un ObjectId válido
      if (!ObjectId.isValid(id)) {
        throw new Error(`ID de proveedor inválido: ${id}`);
      }
      await db
        .collection('providers')
        .updateOne({ _id: new ObjectId(id) }, { $set: updatedProvider });
      return this.getProviderById(provider.agencyId || '', id);
    } catch (error) {
      console.error('Error en updateProvider:', error);
      return null;
    }
  },

  // Eliminar un proveedor
  async deleteProvider(id: string) {
    const { db } = await getDatabase();
    return db.collection('providers').deleteOne({ _id: new ObjectId(id) });
  },
};

// Servicio para gestionar movimientos
export const MovementService = {
  // Obtener todos los movimientos de una agencia
  async getMovements(agencyId: string) {
    const { db } = await getDatabase();
    return db
      .collection('movements')
      .find({ agencyId })
      .sort({ createdAt: -1 })
      .toArray();
  },

  // Obtener todos los movimientos de una subaccount específica
  async getMovementsBySubaccount(subaccountId: string) {
    const { db } = await getDatabase();
    return db
      .collection('movements')
      .find({ subaccountId })
      .sort({ createdAt: -1 })
      .toArray();
  },

  // Obtener un movimiento por ID
  async getMovementById(id: string) {
    const { db } = await getDatabase();
    return db.collection('movements').findOne({ _id: new ObjectId(id) });
  },

  // Crear un nuevo movimiento y actualizar el stock
  async createMovement(movement: IMovement) {
    const { db } = await getDatabase();
    const { cachedClient } = await getDatabase();

    // Inicializar session como null para evitar errores
    let session = null;
    
    try {
      // Solo iniciar sesión si el cliente está disponible
      if (cachedClient) {
        session = cachedClient.startSession();
        session.startTransaction();
      }

      // Crear el movimiento
      const newMovement = {
        ...movement,
        createdAt: new Date(),
        updatedAt: new Date(),
      };
      const result = await db.collection('movements').insertOne(newMovement);

      // Actualizar el stock
      const existingStock = await db.collection('stocks').findOne({
        productId: movement.productId,
        areaId: movement.areaId,
      });

      if (existingStock) {
        // Calcular nueva cantidad
        let newQuantity = existingStock.quantity;
        if (movement.type === 'entrada') {
          newQuantity += movement.quantity;
        } else if (movement.type === 'salida') {
          newQuantity -= movement.quantity;
          if (newQuantity < 0) newQuantity = 0; // Evitar stock negativo
        }

        // Actualizar stock
        await db.collection('stocks').updateOne(
          { _id: existingStock._id },
          { $set: { quantity: newQuantity, updatedAt: new Date() } }
        );
      } else if (movement.type === 'entrada') {
        // Crear nuevo stock si es una entrada y no existe
        await db.collection('stocks').insertOne({
          productId: movement.productId,
          areaId: movement.areaId,
          quantity: movement.quantity,
          agencyId: movement.agencyId,
          createdAt: new Date(),
          updatedAt: new Date(),
        });
      }

      // Solo ejecutar operaciones de transacción si session existe
      if (session) {
        await session.commitTransaction();
        await session.endSession();
      }
      return { ...newMovement, _id: result.insertedId };
    } catch (error) {
      // Solo abortar transacción si session existe
      if (session) {
        await session.abortTransaction();
        await session.endSession();
      }
      throw error;
    }
  },
};