import HeroVideoDialog from "@/components/magicui/hero-video-dialog";
import { Carousel, CarouselContent, CarouselItem } from "@/components/ui/carousel";
import Autoplay  from 'embla-carousel-autoplay';


export function Hero() {
  const brands = ["Amazon", "Walmart", "Target", "Nike", "Adidas", "Apple", "Microsoft", "Google"];

  return (
    <div className="relative w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <div className="relative w-full max-w-5xl mx-auto">
        <HeroVideoDialog
          className="block dark:hidden"
          animationStyle="top-in-bottom-out"
          videoSrc="https://www.youtube.com/embed/qh3NGpYRG3I?si=4rb-zSdDkVK9qxxb"
          thumbnailSrc="https://startup-template-sage.vercel.app/hero-light.png"
          thumbnailAlt="Hero Video"
        />
        <HeroVideoDialog
          className="hidden dark:block"
          animationStyle="top-in-bottom-out"
          videoSrc="https://www.youtube.com/embed/qh3NGpYRG3I?si=4rb-zSdDkVK9qxxb"
          thumbnailSrc="https://startup-template-sage.vercel.app/hero-dark.png"
          thumbnailAlt="Hero Video"
        />
        <div className="absolute bottom-0 left-0 right-0 h-40 bg-gradient-to-t from-background via-background/80 to-transparent pointer-events-none"></div>
      </div>
      
      <div className="mt-20 w-full py-15 bg-background/30 backdrop-blur-md rounded-2xl shadow-lg border border-border/20">
        <div className="container mx-auto px-6">
          <Carousel 
            className="w-full" 
            opts={{ 
              loop: true, 
              align: "center", 
              dragFree: true,
              containScroll: "trimSnaps",
              duration: 30,
              startIndex: 1,
            }}
            plugins={[Autoplay({ delay: 2000 })]}
          >
            <CarouselContent className="-ml-2 md:-ml-4">
              {brands.map((brand) => (
                <CarouselItem key={brand} className="pl-2 md:pl-4 basis-1/3 md:basis-1/6">
                  <div className="flex items-center justify-center h-20 grayscale opacity-40 hover:opacity-100 transition-all duration-300 hover:scale-105">
                    <span className="font-semibold text-sm md:text-base">{brand}</span>
                  </div>
                </CarouselItem>
              ))}
            </CarouselContent>
          </Carousel>
        </div>
      </div>
    </div>
  );
}
