
"use client";

import Link from 'next/link';
import { Button } from "@/components/ui/button";
import { motion } from 'framer-motion';

export default function SignUp() {
  return (
    <motion.section 
      id="signup" 
      className="py-12 md:py-24 bg-secondary"
      initial={{ opacity: 0, y: 50 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.5, delay: 0.2 }}
    >
      <div className="container">
        <div className="max-w-2xl mx-auto text-center">
            <h2 className="text-3xl font-headline font-semibold">Pronto para a Jornada?</h2>
            <p className="text-muted-foreground mt-4 text-lg font-headline">
              As inscrições estão abertas! As vagas são limitadas, então não perca tempo. Garanta sua participação agora mesmo e prepare-se para dias inesquecíveis.
            </p>
            <Button asChild size="lg" className="mt-8 font-headline">
                <Link href="/signup">Fazer Inscrição Agora</Link>
            </Button>
        </div>
      </div>
    </motion.section>
  );
}
// Trigger commit
