
"use client";

import { Youtube } from 'lucide-react';
import { motion } from 'framer-motion';

export default function VideoSection() {
  return (
    <motion.section 
      id="video" 
      className="py-12 md:py-24 bg-secondary/50"
      initial={{ opacity: 0, y: 50 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.7 }}
    >
      <div className="container">
        <div className="text-center max-w-3xl mx-auto">
          <div className="mx-auto bg-primary/10 rounded-full p-4 w-fit mb-4">
            <Youtube className="h-8 w-8 text-primary" />
          </div>
          <h2 className="text-3xl md:text-4xl font-semibold font-headline">
            Conheça a Temporada de Férias
          </h2>
          <p className="text-muted-foreground mt-4 text-lg">
            Veja um pouco do que espera por você: o local, as atividades e a energia do nosso retiro. Dê o play e sinta um gostinho dessa experiência!
          </p>
        </div>
        <div className="max-w-4xl mx-auto mt-12">
          <div className="aspect-w-16 aspect-h-9 w-full overflow-hidden rounded-lg shadow-2xl">
            <iframe 
              className="w-full h-full aspect-video"
              src="https://www.youtube.com/embed/dQw4w9WgXcQ" 
              title="YouTube video player" 
              frameBorder="0" 
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" 
              allowFullScreen>
            </iframe>
          </div>
        </div>
      </div>
    </motion.section>
  );
}
// Trigger commit
