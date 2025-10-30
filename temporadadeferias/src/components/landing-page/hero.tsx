
"use client";

import Image from "next/image";
import { motion } from "framer-motion";

export default function Hero() {
  return (
    <section id="home" className="relative w-full overflow-hidden bg-background flex justify-center px-4 md:px-8 lg:px-16">
      <motion.div
        className="relative z-10 flex flex-col items-center w-full rounded-lg overflow-hidden"
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.7 }}
      >
        <Image
          src="/inconformados.jpg"
          alt="Inconformados - Temporada de Férias 2026"
          width={1920}
          height={1080}
          className="w-full h-auto"
          priority
          data-ai-hint="event poster"
        />
      </motion.div>
    </section>
  );
}
// Trigger commit
