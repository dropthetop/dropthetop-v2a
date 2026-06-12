"use client";

import { useState, useCallback, useEffect } from "react";
import Image from "next/image";
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
  type CarouselApi,
} from "@/components/ui/carousel";
import { cn } from "@/lib/utils";

interface GenerationGalleryProps {
  images: string[];
  generationName: string;
}

export function GenerationGallery({ images, generationName }: GenerationGalleryProps) {
  const [api, setApi] = useState<CarouselApi>();
  const [current, setCurrent] = useState(0);

  useEffect(() => {
    if (!api) return;
    setCurrent(api.selectedScrollSnap());
    api.on("select", () => setCurrent(api.selectedScrollSnap()));
  }, [api]);

  const scrollTo = useCallback(
    (index: number) => api?.scrollTo(index),
    [api]
  );

  return (
    <div className="w-full">
      <Carousel setApi={setApi} className="w-full" opts={{ loop: true }}>
        <CarouselContent>
          {images.map((image, index) => (
            <CarouselItem key={index}>
              <div className="relative aspect-[16/9] overflow-hidden rounded-lg">
                <Image
                  src={image}
                  alt={`${generationName} - Image ${index + 1}`}
                  fill
                  className="object-cover"
                  sizes="(max-width: 896px) 100vw, 896px"
                />
              </div>
            </CarouselItem>
          ))}
        </CarouselContent>
        <CarouselPrevious className="left-4 bg-background/80 backdrop-blur-sm border-border hover:bg-background" />
        <CarouselNext className="right-4 bg-background/80 backdrop-blur-sm border-border hover:bg-background" />
      </Carousel>

      {/* Thumbnails */}
      <div className="flex gap-3 mt-4 justify-center flex-wrap">
        {images.map((image, index) => (
          <button
            key={index}
            onClick={() => scrollTo(index)}
            className={cn(
              "relative w-20 h-14 rounded-md overflow-hidden border-2 transition-all duration-200",
              current === index
                ? "border-primary ring-2 ring-primary/30"
                : "border-border/50 opacity-60 hover:opacity-100"
            )}
            aria-label={`View image ${index + 1}`}
          >
            <Image
              src={image}
              alt={`Thumbnail ${index + 1}`}
              fill
              className="object-cover"
              sizes="80px"
            />
          </button>
        ))}
      </div>

      {/* Dot indicators */}
      <div className="flex gap-2 mt-4 justify-center">
        {images.map((_, index) => (
          <button
            key={index}
            onClick={() => scrollTo(index)}
            className={cn(
              "h-2 rounded-full transition-all duration-200",
              current === index ? "bg-primary w-6" : "bg-muted-foreground/30 w-2"
            )}
            aria-label={`Go to slide ${index + 1}`}
          />
        ))}
      </div>
    </div>
  );
}
