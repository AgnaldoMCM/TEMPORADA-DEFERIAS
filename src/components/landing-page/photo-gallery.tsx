
"use client";

import Image from 'next/image';
import Link from 'next/link';
import { Button } from "@/components/ui/button";
import { cn } from '@/lib/utils';
import { useState, useEffect, useRef } from 'react';
import { useInView, motion } from 'framer-motion';

const allImages = [
  { src: "/um.jpg", hint: "people smiling" },
  { src: "/dois.jpg", hint: "group photo" },
  { src: "/seis.jpg", hint: "event moment" },
  { src: "/quatro.jpg", hint: "worship service" },
  { src: "/cinco.jpg", hint: "friends hugging" },
  { src: "/tres.jpg", hint: "prayer meeting" },
  { src: "/sete.jpg", hint: "youth camp" },
  { src: "/oito.jpg", hint: "landscape view" },
  { src: "/nove.jpg", hint: "candid shot" },
  { src: "/dez.jpg", hint: "singing together" },
  { src: "/onze.jpg", hint: "singing together" },
  { src: "/doze.jpg", hint: "sunset background" },
  { src: "/treze.JPG", hint: "bonfire night" },
  { src: "/catorze.JPG", hint: "friends laughing" },
  { src: "/quinze.JPG", hint: "playing guitar" },
  { src: "/dezesseis.JPG", hint: "sports game" },
  { src: "/dezessete.JPG", hint: "group prayer" },
  { src: "/dezoito.JPG", hint: "sharing food" },
  { src: "/dezenove.JPG", hint: "watching sunrise" },
  { src: "/vinte.JPG", hint: "team huddle" },
  { src: "/vinteum.JPG", hint: "water fight" },
  { src: "/vintedois.JPG", hint: "reading bible" },
  { src: "/vintetres.JPG", hint: "storytelling campfire" },
  { src: "/vintequatro.JPG", hint: "concert lights" },
];

const SafeImage = ({ img, index }: { img: { src: string; hint: string }; index: number }) => {
  const [hasError, setHasError] = useState(false);
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: "200px" });

  if (hasError) {
    return null; // Don't render if the image fails to load
  }

  return (
    <div ref={ref} className="relative aspect-[3/4] w-48 flex-shrink-0 overflow-hidden rounded-lg group">
      {isInView ? (
        <>
          <Image
            src={img.src}
            fill
            alt={`Retreat photo ${index + 1}`}
            data-ai-hint={img.hint}
            className="rounded-lg object-cover transition-transform duration-500 ease-in-out group-hover:scale-110"
            sizes="(max-width: 768px) 50vw, (max-width: 1024px) 25vw, 20vw"
            priority={index < 6}
            onError={() => setHasError(true)}
          />
          <div className="absolute inset-0 bg-black/10 transition-all duration-500 group-hover:bg-black/20" />
        </>
      ) : (
        <div className="w-full h-full bg-muted animate-pulse rounded-lg" />
      )}
    </div>
  );
};

export default function PhotoGallery() {
    const [columns, setColumns] = useState<{src: string; hint: string}[][]>([]);

    useEffect(() => {
        const shuffled = [...allImages].sort(() => Math.random() - 0.5);
        const numColumns = 4;
        const newColumns = Array.from({ length: numColumns }, (_, colIndex) => 
            shuffled.filter((_, imgIndex) => imgIndex % numColumns === colIndex)
        );
        setColumns(newColumns);
    }, []);
    
    return (
        <section id="signup-gallery" className="relative w-full overflow-hidden bg-background py-20 md:py-32">
            <div className="pointer-events-none absolute inset-0 flex justify-center gap-4 [mask-image:linear-gradient(to_bottom,transparent,black_10%,black_80%,transparent)]">
               {columns.map((col, i) => (
                    <motion.div 
                        key={i}
                        className={cn("flex flex-col gap-4 animate-marquee-y", i > 1 && "hidden md:flex", i > 2 && "hidden lg:flex")}
                        style={{
                           animationDirection: i % 2 === 0 ? 'normal' : 'reverse',
                           animationDuration: i % 2 === 0 ? '50s' : '70s'
                        }}
                    >
                        {[...col, ...col].map((img, j) => (
                           <SafeImage key={`${img.src}-${i}-${j}`} img={img} index={j} />
                        ))}
                    </motion.div>
               ))}
            </div>

            <div className="relative z-10 container text-center bg-black/50 backdrop-blur-sm p-8 rounded-lg max-w-2xl mx-auto">
                <h2 className="text-3xl font-headline font-semibold text-white">Pronto para a Jornada?</h2>
                <p className="text-white/80 mt-4 text-lg font-headline">
                As inscrições estão abertas! As vagas são limitadas, então não perca tempo. Garanta sua participação agora mesmo e prepare-se para dias inesquecíveis.
                </p>
                <Button asChild size="lg" className="mt-8 bg-primary hover:bg-primary/90 text-primary-foreground font-headline">
                <Link href="/signup">Fazer Inscrição Agora</Link>
                </Button>
            </div>
        </section>
    );
}
// Trigger commit
