import { createUploadthing, type FileRouter } from "uploadthing/next";
import { auth } from "@clerk/nextjs/server";

const f = createUploadthing();

const authenticateUser = () => {
  const user = auth();
  // If you throw, the user will not be able to upload
  if (!user) throw new Error("Unauthorized");
  // Whatever is returned here is accessible in onUploadComplete as `metadata`
  return user;
};

// Función para registrar eventos de carga
const logUploadComplete = (fileName: string, fileUrl: string, fileType: string) => {
  console.log(`Archivo subido exitosamente: ${fileName}`);
  console.log(`URL: ${fileUrl}`);
  console.log(`Tipo: ${fileType}`);
  return { success: true };
};

// FileRouter for your app, can contain multiple FileRoutes
export const ourFileRouter = {
  // Define as many FileRoutes as you like, each with a unique routeSlug
  subaccountLogo: f({ image: { maxFileSize: "4MB", maxFileCount: 1 } })
    .middleware(authenticateUser)
    .onUploadComplete(({ file }) => {
      return logUploadComplete(file.name, file.url, file.type);
    }),
  avatar: f({ image: { maxFileSize: "4MB", maxFileCount: 1 } })
    .middleware(authenticateUser)
    .onUploadComplete(({ file }) => {
      return logUploadComplete(file.name, file.url, file.type);
    }),
  agencyLogo: f({ image: { maxFileSize: "4MB", maxFileCount: 1 } })
    .middleware(authenticateUser)
    .onUploadComplete(({ file }) => {
      return logUploadComplete(file.name, file.url, file.type);
    }),
  media: f({ image: { maxFileSize: "4MB", maxFileCount: 1 } })
    .middleware(authenticateUser)
    .onUploadComplete(({ file }) => {
      return logUploadComplete(file.name, file.url, file.type);
    }),
} satisfies FileRouter;

export type OurFileRouter = typeof ourFileRouter;
