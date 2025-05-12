/**
 * Utilidades para serializar objetos de MongoDB antes de pasarlos a componentes cliente
 */

/**
 * Serializa un objeto de MongoDB para convertirlo en un objeto plano JSON
 * Esto resuelve el error: "Only plain objects can be passed to Client Components from Server Components"
 */
export function serializeMongoObject<T>(obj: any): T {
  if (!obj) return obj;
  
  // Convertir a string y luego a objeto para eliminar métodos y propiedades no serializables
  const serialized = JSON.parse(JSON.stringify(obj));
  
  // Convertir _id de ObjectId a string si existe
  if (serialized._id) {
    serialized._id = serialized._id.toString();
  }
  
  return serialized as T;
}

/**
 * Serializa un array de objetos de MongoDB
 */
export function serializeMongoArray<T>(array: any[]): T[] {
  if (!array || !Array.isArray(array)) return [];
  return array.map(item => serializeMongoObject<T>(item));
}