"use client";

import { useState, useEffect } from "react";
import axios from "axios";
import { TextRevealCard } from "@/components/ui/text-reveal-card";
import { CreateInventoryForm } from "./components/create-inventory-form";
import { JoinInventoryForm } from "./components/join-inventory-form";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";
import { Boxes } from "@/components/ui/background-boxes";
import { BorderBeam } from "@/components/ui/magicui/border-beam";
import { CardContainer, CardBody, CardItem } from "@/components/ui/3d-card";
import Image from "next/image";
import { Carousel, CarouselContent, CarouselItem } from "@/components/ui/carousel";

export default function SelectInventoryPage() {
  const [companies, setCompanies] = useState<Array<{id: string, name: string}>>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedOption, setSelectedOption] = useState<string | null>(null);

  // Cargar empresas para el formulario de "unirse"
  useEffect(() => {
    (async () => {
      try {
        setIsLoading(true);
        const response = await axios.get("/api/control_login/companies/list");
        if (response.data && response.data.companies && Array.isArray(response.data.companies)) {
          // Mapear los datos para asegurar que tengan el formato correcto (id y name)
          const formattedCompanies = response.data.companies.map((company: any) => ({
            id: company._id,
            name: company.name
          }));
          setCompanies(formattedCompanies);
        } else {
          setCompanies([]);
        }
      } catch (error) {
        console.error("Error fetching companies:", error);
        setCompanies([]);
      } finally {
        setIsLoading(false);
      }
    })();
  }, []);

  const handleBackClick = () => {
    setSelectedOption(null);
  };

  return (
    <div className="min-h-screen relative w-full overflow-hidden bg-slate-900 flex flex-col items-center justify-center rounded-lg">
      {/* Fondo y efectos */}
      <div className="absolute inset-0 w-full h-full bg-slate-900 z-20 [mask-image:radial-gradient(transparent,white)] pointer-events-none" />
      <Boxes />
  

      <div className="relative flex flex-col items-center justify-center gap-14">
        <TextRevealCard
          text="INVWE_Company"
          revealText="Únete o Crea uno Nuevo"
          className="w-full max-w-md"
          textAlign="center"
        />

        {selectedOption === null ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 w-full">
            {/* Tarjeta 3D para "Crear Inventario" */}
            <div onClick={() => setSelectedOption("create")} className="relative h-80 flex-1">
              <CardContainer className="cursor-pointer">
                <CardBody className="bg-white w-full h-full rounded-xl p-6 border flex flex-col">
                  <BorderBeam duration={4} size={100} className="z-10" />
                  <CardItem translateZ="50" className="text-xl font-bold text-500 justify-center items-center">
                    Crear Inventario
                  </CardItem>
                  <CardItem translateZ="100" className="w-full mt-4">
                    <Carousel className="w-full" opts={{ loop: true, align: "start", duration: 3000 }}>
                      <CarouselContent>
                        <CarouselItem>
                          <Image
                            src="/carousel/create-inventory.svg"
                            width={400}
                            height={400}
                            alt="Crear Inventario"
                            className="h-40 w-full object-contain rounded-xl"
                            priority
                          />
                        </CarouselItem>
                        {/* ... otros CarouselItem */}
                      </CarouselContent>
                    </Carousel>
                  </CardItem>
                  <div className="flex justify-center mt-8">
                    <CardItem
                      translateZ={20}
                      as="button"
                      className="px-4 py-2 rounded-xl bg-black dark:bg-white dark:text-black text-white text-xs font-bold"
                    >
                      Seleccionar
                    </CardItem>
                  </div>
                </CardBody>
              </CardContainer>
            </div>

            {/* Tarjeta 3D para "Unirse a Inventario" */}
            <div onClick={() => setSelectedOption("join")} className="relative">
              <CardContainer className="group/card relative z-20 h-full cursor-pointer">
                <CardBody className="bg-white w-full h-full rounded-xl p-6 border flex flex-col">
                  <BorderBeam duration={4} size={50} className="z-10" />
                  <CardItem translateZ="50" className="text-xl font-bold text-black text-center">
                    Unirse a Inventario
                  </CardItem>
                  <CardItem translateZ="100" className="w-full mt-4">
                    <Carousel className="w-full" opts={{ loop: true, align: "start", duration: 3000 }}>
                      <CarouselContent>
                        <CarouselItem>
                          <Image
                            src="/carousel/join-inventory.svg"
                            width={400}
                            height={400}
                            alt="Unirse a Inventario"
                            className="h-40 w-full object-contain rounded-xl group-hover/card:shadow-xl"
                            priority
                          />
                        </CarouselItem>
                        {/* ... otros CarouselItem */}
                      </CarouselContent>
                    </Carousel>
                  </CardItem>
                  <div className="flex justify-center mt-8">
                    <CardItem
                      translateZ={20}
                      as="button"
                      className="px-4 py-2 rounded-xl bg-black dark:bg-white dark:text-black text-white text-xs font-bold"
                    >
                      Seleccionar
                    </CardItem>
                  </div>
                </CardBody>
              </CardContainer>
            </div>
          </div>
        ) : (
          <div className="bg-white p-8 rounded-lg w-full max-w-md">
            <div className="flex items-center mb-4">
              <Button variant="ghost" size="icon" onClick={handleBackClick} className="mr-2">
                <ArrowLeft className="h-5 w-5" />
              </Button>
              <h2 className="text-xl font-bold">
                {selectedOption === "create" ? "Crear Inventario" : "Unirse a Inventario"}
              </h2>
            </div>
            {selectedOption === "create" ? (
              <CreateInventoryForm />
            ) : (
              <JoinInventoryForm companies={companies} isLoading={isLoading} />
            )}
          </div>
        )}
      </div>
    </div>
  );
}