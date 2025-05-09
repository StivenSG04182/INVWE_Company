import { MongoClient, Db, ObjectId } from 'mongodb';

// Interfaces para los modelos de datos
export interface IProduct {
  _id?: ObjectId;
  agencyId: string;
  subaccountId: string;
  name: string;
  description?: string;
  sku: string;
  barcode?: string;
  price: number;
  cost?: number;
  minStock?: number;
  images?: string[];
  productImage?: string;
  categoryId?: string;
  createdAt?: Date;
  updatedAt?: Date;
}

export interface ICategory {
  _id?: ObjectId;
  agencyId: string;
  subaccountId?: string;
  name: string;
  description?: string;
  createdAt?: Date;
  updatedAt?: Date;
}

export interface IArea {
  _id?: ObjectId;
  agencyId: string;
  subaccountId: string;
  name: string;
  description?: string;
  layout?: {
    items: Array<{
      x: number;
      y: number;
      width: number;
      height: number;
      rotation?: number;
      color?: string;
    }>;
  };
  createdAt?: Date;
  updatedAt?: Date;
}

export interface IProvider {
  _id?: ObjectId;
  agencyId: string;
  subaccountId: string;
  name: string;
  contactName?: string;
  email?: string;
  phone?: string;
  address?: string;
  active?: boolean;
  createdAt?: Date;
  updatedAt?: Date;
}

export interface IStock {
  _id?: ObjectId;
  agencyId: string;
  subaccountId: string;
  productId: string;
  areaId: string;
  quantity: number;
  createdAt?: Date;
  updatedAt?: Date;
}

export interface IMovement {
  _id?: ObjectId;
  agencyId: string;
  subaccountId: string;
  type: 'entrada' | 'salida' | 'transferencia';
  productId: string;
  areaId: string;
  quantity: number;
  providerId?: string;
  notes?: string;
  createdAt?: Date;
  updatedAt?: Date;
}

// Variables para la conexión a MongoDB
let cachedClient: MongoClient | null = null;
let cachedDb: Db | null = null;

// URI de conexión a MongoDB
const uri = process.env.MONGODB_URI || '';
const dbName = process.env.MONGODB_DB || 'invwe_db';

if (!uri) {
  throw new Error('Por favor, define la variable de entorno MONGODB_URI');
}

// Función para conectar a la base de datos
export async function connectToDatabase() {
  // Si ya tenemos una conexión, la reutilizamos
  if (cachedClient && cachedDb) {
    return { client: cachedClient, db: cachedDb };
  }

  // Crear una nueva conexión
  const client = new MongoClient(uri);
  await client.connect();
  const db = client.db(dbName);

  // Guardar la conexión en caché
  cachedClient = client;
  cachedDb = db;

  return { client, db };
}