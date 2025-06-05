"use client";

import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useRouter } from "next/navigation";
import { useEffect } from "react";

const Unauthorized = () => {
  const router = useRouter();

  useEffect(() => {
  }, []);

  return (
    <div className="h-screen w-screen flex justify-center items-center flex-col">
      <h1 className="text-2xl font-bold">No tienes acceso</h1>
      <p className="text-muted-foreground text-center">
        Por favor, contacta con el soporte o el propietario de la agencia para obtener acceso.
      </p>
      <Button onClick={() => router.push("/")}>Volver al inicio</Button>
    </div>
  );
};

export default Unauthorized; 