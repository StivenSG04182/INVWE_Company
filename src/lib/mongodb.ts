import { MongoClient, Db } from 'mongodb';

if (!process.env.MONGODB_URI) {
  throw new Error('Por favor, define la variable de entorno MONGODB_URI');
}

if (!process.env.MONGODB_DB) {
  throw new Error('Por favor, define la variable de entorno MONGODB_DB');
}

const uri = process.env.MONGODB_URI;
const dbName = process.env.MONGODB_DB;

let cachedClient: MongoClient | null = null;
let cachedDb: Db | null = null;

export async function connectToDatabase() {
  // Si ya tenemos una conexión, la reutilizamos
  if (cachedClient && cachedDb) {
    return { client: cachedClient, db: cachedDb };
  }

  // Creamos una nueva conexión
  const client = new MongoClient(uri);
  await client.connect();
  
  const db = client.db(dbName);
  
  // Guardamos la conexión en caché
  cachedClient = client;
  cachedDb = db;
  
  return { client, db };
}

// Modelos para el sistema de inventario
export interface IProduct {
  _id?: string;
  name: string;
  description?: string;
  sku: string;
  barcode?: string;
  price: number;
  cost?: number;
  categoryId?: string;
  images?: string[];
  minStock?: number;
  agencyId: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface IStock {
  _id?: string;
  productId: string;
  areaId: string;
  quantity: number;
  agencyId: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface IArea {
  _id?: string;
  name: string;
  description?: string;
  agencyId: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface IProvider {
  _id?: string;
  name: string;
  contactName?: string;
  email?: string;
  phone?: string;
  address?: string;
  agencyId: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface IMovement {
  _id?: string;
  type: 'entrada' | 'salida';
  productId: string;
  areaId: string;
  quantity: number;
  providerId?: string;
  notes?: string;
  agencyId: string;
  createdAt: Date;
  updatedAt: Date;
}