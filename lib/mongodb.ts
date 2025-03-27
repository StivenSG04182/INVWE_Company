import { MongoClient } from 'mongodb';
const uri = process.env.MONGODB_URI;
const options = {};
let client;
let clientPromise: Promise<MongoClient>;
if (!process.env.MONGODB_URI) {
  throw new Error('Please add your Mongo URI to .env.local');
}
if (process.env.NODE_ENV === 'development') {
  // En modo de desarrollo, use una variable global para mantener una conexión con la base de datos.
  if (!global._mongoClientPromise) {
    client = new MongoClient(uri!, options);
    global._mongoClientPromise = client.connect();
  }
  clientPromise = global._mongoClientPromise;
} else {
  // En modo de producción, Esto es mejor para evitar problemas de conexión en el entorno de producción.
  client = new MongoClient(uri!, options);
  clientPromise = client.connect();
}
export default clientPromise;