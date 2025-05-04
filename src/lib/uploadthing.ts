import { OurFileRouter } from "@/app/api/uploadthing/core";
import { generateComponents } from "@uploadthing/react";
import { generateReactHelpers } from "@uploadthing/react/hooks";

// Configuración personalizada para los componentes de UploadThing
const config = {
  // Añadir opciones de fallback y reintentos
  appendOnFallback: true,
  // Modo de carga automático
  mode: "auto",
};

// Generar componentes con configuración personalizada
export const { UploadButton, UploadDropzone, Uploader } =
  generateComponents<OurFileRouter>(config);

export const { useUploadThing, uploadFiles } =
  generateReactHelpers<OurFileRouter>();

// Exportar una función para verificar si UploadThing está configurado correctamente
export const checkUploadThingConfig = () => {
  const appId = process.env.UPLOADTHING_APP_ID;
  const secret = process.env.UPLOADTHING_SECRET;
  
  const isConfigured = !!appId && !!secret;
  
  if (!isConfigured) {
    console.error('UploadThing no está configurado correctamente. Verifique las variables de entorno UPLOADTHING_APP_ID y UPLOADTHING_SECRET.');
  }
  
  return isConfigured;
};
