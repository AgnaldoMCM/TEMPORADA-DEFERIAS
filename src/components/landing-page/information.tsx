
"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Calendar, MapPin, Package, CircleDollarSign } from 'lucide-react';
import { motion } from 'framer-motion';

const infoItems = [
  {
    icon: <Calendar className="h-8 w-8 text-primary" />,
    title: "Programação",
    description: "De 5 a 9 de Janeiro. Teremos louvor, palavra, dinâmicas e muito mais. Confira a programação completa em breve.",
  },
  {
    icon: <MapPin className="h-8 w-8 text-primary" />,
    title: "Localização",
    description: "Sítio Canarinho, BR-174, Manaus - AM.",
  },
  {
    icon: <Package className="h-8 w-8 text-primary" />,
    title: "O que levar",
    description: "Bíblia, caderno, roupas de cama, itens de higiene, roupas de banho e um coração aberto para Deus.",
  },
  {
    icon: <CircleDollarSign className="h-8 w-8 text-primary" />,
    title: "Pagamento",
    description: "PIX (gerado ao final da inscrição) ou presencialmente (à vista/carnê) com a secretaria da UPA Religados.",
  },
];

const fadeInAnimationVariants = {
  initial: {
    opacity: 0,
    y: 100,
  },
  animate: (index: number) => ({
    opacity: 1,
    y: 0,
    transition: {
      delay: 0.05 * index,
    },
  }),
};

export default function Information() {
  return (
    <section id="information" className="py-12 md:py-24 bg-background text-foreground relative">
      <div className="container mx-auto px-4 relative">
        <motion.div 
          className="text-center max-w-3xl mx-auto"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
        >
          <h2 className="text-3xl md:text-4xl font-semibold font-headline">
            Tudo o que Você Precisa Saber
          </h2>
          <p className="text-muted-foreground mt-4 text-lg">
            Preparamos tudo para que sua única preocupação seja aproveitar cada momento. Veja os detalhes abaixo.
          </p>
        </motion.div>
        <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-4 justify-items-center mt-12">
          {infoItems.map((item, index) => (
            <motion.div
              key={item.title}
              className="w-full max-w-sm text-center flex flex-col items-center"
              variants={fadeInAnimationVariants}
              initial="initial"
              whileInView="animate"
              viewport={{ once: true }}
              custom={index}
            >
              <div className="bg-primary/10 rounded-full p-4 w-fit mb-4">
                {item.icon}
              </div>
              <h3 className="font-headline text-xl font-bold">{item.title}</h3>
              <p className="text-muted-foreground mt-2">{item.description}</p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
// Trigger commit
