/**
 * Utilidades para serializar objetos MongoDB a objetos planos
 */

export const serializeMongoArray = <T>(data: T[]): T[] => {
  return data.map(item => serializeMongoObject(item))
}

export const serializeMongoObject = <T>(data: T): T => {
  if (!data || typeof data !== 'object') {
    return data
  }

  if (Array.isArray(data)) {
    return data.map(item => serializeMongoObject(item)) as T
  }

  const serialized: any = {}
  
  for (const [key, value] of Object.entries(data)) {
    if (value && typeof value === 'object') {
      // Manejar fechas
      if (value instanceof Date) {
        serialized[key] = value.toISOString()
      }
      // Manejar objetos con _id (documentos MongoDB)
      else if ('_id' in value && typeof value._id === 'object') {
        serialized[key] = {
          ...value,
          _id: value._id.toString()
        }
      }
      // Recursión para objetos anidados
      else {
        serialized[key] = serializeMongoObject(value)
      }
    } else {
      serialized[key] = value
    }
  }

  return serialized as T
}

export const serializeMongoId = (id: any): string => {
  if (id && typeof id === 'object' && '_bsontype' in id) {
    return id.toString()
  }
  return id
} 