/**
 * Servicio de conexión a MongoDB específico para el módulo de e-commerce
 * Este servicio proporciona una conexión aislada a MongoDB para las operaciones de e-commerce
 */

import { MongoClient, Db } from 'mongodb';

// Configuración de la conexión
const uri = process.env.MONGODB_URI;
const ecommerceDbName = process.env.ECOMMERCE_DB_NAME || 'ecommerce';

// Opciones de conexión
const options = {};

// Cliente y promesa de conexión
let client: MongoClient;
let clientPromise: Promise<MongoClient>;

// Verificar que existe la URI de conexión
if (!uri) {
    throw new Error('Por favor, agrega tu URI de MongoDB en las variables de entorno');
}

// Configuración de la conexión según el entorno
if (process.env.NODE_ENV === 'development') {
    // En desarrollo, usar una variable global para mantener la conexión
    let globalWithMongo = global as typeof globalThis & {
        _mongoEcommerceClientPromise?: Promise<MongoClient>;
    };

    if (!globalWithMongo._mongoEcommerceClientPromise) {
        client = new MongoClient(uri, options);
        globalWithMongo._mongoEcommerceClientPromise = client.connect();
    }

    clientPromise = globalWithMongo._mongoEcommerceClientPromise;
} else {
    // En producción, crear una nueva conexión
    client = new MongoClient(uri, options);
    clientPromise = client.connect();
}

/**
 * Obtiene una conexión a la base de datos de e-commerce
 * @returns Promesa que resuelve a una instancia de la base de datos
 */
export async function connectToEcommerceDb(): Promise<Db> {
    const client = await clientPromise;
    return client.db(ecommerceDbName);
}

/**
 * Obtiene una colección específica de la base de datos de e-commerce
 * @param collectionName Nombre de la colección
 * @returns Promesa que resuelve a la colección solicitada
 */
export async function getEcommerceCollection(collectionName: string) {
    const db = await connectToEcommerceDb();
    return db.collection(collectionName);
}

// Exportar la promesa del cliente para usos avanzados
export default clientPromise;