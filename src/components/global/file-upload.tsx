import { FileIcon, X, Loader2 } from "lucide-react";
import Image from "next/image";
import React, { useState, useEffect } from "react";
import { Button } from "../ui/button";
import { UploadDropzone } from "@/lib/uploadthing";
import { useToast } from "../ui/use-toast";

type Props = {
  apiEndpoint: "agencyLogo" | "avatar" | "subaccountLogo" | "media";
  onChange: (url?: string) => void;
  value?: string;
};

const FileUpload = ({ apiEndpoint, onChange, value }: Props) => {
  const { toast } = useToast();
  const [isUploading, setIsUploading] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const type = value?.split(".").pop();
  
  // Efecto para registrar cuando el componente se monta y desmonta
  useEffect(() => {
    console.log(`FileUpload montado con endpoint: ${apiEndpoint}`);
    return () => {
      console.log(`FileUpload desmontado con endpoint: ${apiEndpoint}`);
    };
  }, [apiEndpoint]);

  if (value) {
    return (
      <div className="flex flex-col justify-center items-center">
        {type !== "pdf" ? (
          <div className="relative w-40 h-40">
            <Image
              src={value}
              alt="uploaded image"
              className="object-contain"
              fill
            />
          </div>
        ) : (
          <div className="relative flex items-center p-2 mt-2 rounded-md bg-background/10">
            <FileIcon />
            <a
              href={value}
              target="_blank"
              rel="noopener_noreferrer"
              className="ml-2 text-sm text-indigo-500 dark:text-indigo-400 hover:underline"
            >
              View PDF
            </a>
          </div>
        )}
        <Button onClick={() => onChange("")} variant="ghost" type="button">
          <X className="h-4 w-4" />
          Remove Logo
        </Button>
      </div>
    );
  }
  const handleRetry = () => {
    console.log(`Reintentando carga para endpoint: ${apiEndpoint}`);
    setUploadError(null);
    setIsUploading(false);
  };

  const handleManualMode = () => {
    console.log('Cambiando a modo manual de carga');
    setUploadError(null);
    setIsUploading(false);
  };

  return (
    <div className="w-full bg-muted/30 relative">
      {isUploading && (
        <div className="absolute inset-0 flex items-center justify-center bg-background/80 z-10">
          <Loader2 className="h-6 w-6 animate-spin text-primary" />
          <span className="ml-2 text-sm text-muted-foreground">Subiendo archivo...</span>
        </div>
      )}
      {uploadError && (
        <div className="p-4 mb-4 text-sm text-red-700 bg-red-100 rounded-lg">
          <p className="font-medium">Error al subir archivo:</p>
          <p className="mt-1">{uploadError}</p>
          <div className="flex gap-2 mt-3">
            <Button 
              onClick={handleRetry} 
              variant="default" 
              size="sm"
            >
              Intentar de nuevo
            </Button>
            <Button
              onClick={handleManualMode}
              variant="outline"
              size="sm"
            >
              Cambiar modo
            </Button>
          </div>
        </div>
      )}
      {!uploadError && (
        <UploadDropzone
          endpoint={apiEndpoint}
          onUploadBegin={() => {
            console.log(`Iniciando carga para endpoint: ${apiEndpoint}`);
            setIsUploading(true);
            setUploadError(null);
          }}
          onClientUploadComplete={(res) => {
            console.log(`Carga completada para endpoint: ${apiEndpoint}`, res);
            setIsUploading(false);
            if (res && res[0]) {
              onChange(res[0].url);
              toast({
                title: "Archivo subido",
                description: "El archivo se ha subido correctamente",
              });
            } else {
              console.warn("Respuesta vacía de UploadThing", res);
              setUploadError("No se recibió URL del archivo subido. Por favor, intente de nuevo.");
            }
          }}
          onUploadError={(error: Error) => {
            setIsUploading(false);
            const errorMessage = error.message || "Ha ocurrido un error al subir el archivo";
            console.error(`Error al subir archivo (${apiEndpoint}):`, error);
            setUploadError(errorMessage);
            toast({
              variant: "destructive",
              title: "Error al subir archivo",
              description: "Se ha producido un error. Puede intentarlo de nuevo.",
            });
          }}
          content={{
            label: apiEndpoint === "agencyLogo" ? "Logo de agencia" : "Archivo",
            button({ ready, isUploading }) {
              return (
                <Button 
                  className="ut-uploading:cursor-not-allowed ut-button-container w-full ut-readying:cursor-not-allowed"
                  disabled={!ready || isUploading}
                >
                  {isUploading ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Subiendo...
                    </>
                  ) : (
                    "Seleccionar archivo"
                  )}
                </Button>
              );
            }
          }}
          config={{
            mode: "auto"
          }}
        />
      )}
    </div>
  );
};

export default FileUpload;