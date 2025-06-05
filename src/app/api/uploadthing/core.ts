import { createUploadthing, type FileRouter } from "uploadthing/next";
import { auth } from "@clerk/nextjs/server";

const f = createUploadthing();

const authenticateUser = () => {
  const user = auth();
  if (!user) throw new Error("Unauthorized");
  return user;
};

const logUploadComplete = (fileName: string, fileUrl: string, fileType: string) => {
  return { success: true };
};

export const ourFileRouter = {
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
