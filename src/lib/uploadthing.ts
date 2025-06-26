import { OurFileRouter } from "@/app/api/uploadthing/core";
import { generateUploadButton, generateUploadDropzone, generateReactHelpers } from "@uploadthing/react";

// Generar componentes recomendados (la configuración se pasa como prop, no aquí)
export const UploadButton = generateUploadButton<OurFileRouter>();
export const UploadDropzone = generateUploadDropzone<OurFileRouter>();

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
