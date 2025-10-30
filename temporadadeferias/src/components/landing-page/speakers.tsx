
"use client";

import Image from 'next/image';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from "@/components/ui/carousel";
import Autoplay from "embla-carousel-autoplay";
import { motion } from 'framer-motion';

const speakers = [
    {
      name: "Pr. Weslley",
      title: "Pastor do Ministério de Adolescentes UPA Religados",
      bio: "Responsável por conduzir espiritualmente o ministério, cuidando dos adolescentes com amor, dedicação e direcionamento bíblico.",
      image: "/wesley.jpg",
      hint: "male portrait"
    },
    {
      name: "Jean Carlos",
      title: "Gestor do Ministério",
      bio: "Coordena todas as áreas do ministério, garantindo que a visão seja cumprida e que cada equipe esteja alinhada em propósito e missão.",
      image: "/jean.jpg",
      hint: "man portrait"
    },
    {
      name: "Fernanda Paula",
      title: "Gestora do Ministério e Supervisora da Área Administrativa",
      bio: "Atua tanto na gestão geral quanto na organização administrativa, oferecendo suporte e estrutura para que o ministério funcione de forma eficiente.",
      image: "/marcia.jpg",
      hint: "woman portrait"
    },
    {
      name: "Acsa Leão",
      title: "Supervisora da Secretaria",
      bio: "Cuida da parte organizacional e da comunicação entre os inscritos, garantindo informações claras, acessíveis e o bom andamento das inscrições e registros.",
      image: "/acs.jpg",
      hint: "female portrait"
    },
    {
      name: "Ryan Lucas",
      title: "Supervisor da Área de Ensino",
      bio: "Responsável por planejar e acompanhar os momentos de ensino bíblico, preparando conteúdos que edificam e fortalecem a fé dos adolescentes.",
      image: "/ryan.png",
      hint: "man portrait"
    },
    {
      name: "Rodrigo Vasconcelos",
      title: "Supervisor da Área de Ministérios",
      bio: "Orienta e apoia os diferentes núcleos ministeriais, assegurando que cada um contribua para a vivência integral do acampamento.",
      image: "/rodrigo.jpg",
      hint: "male person"
    },
    {
      name: "Davi Leão",
      title: "Líder do Núcleo de Brincadeiras",
      bio: "Promove atividades recreativas e dinâmicas que tornam a experiência mais divertida e fortalecem a comunhão entre os adolescentes.",
      image: "/leao.png",
      hint: "man portrait"
    },
    {
      name: "Gabriela Siqueira",
      title: "Líder do Núcleo de Comunicação",
      bio: "Cuida da identidade visual e da divulgação do ministério, garantindo que cada informação e experiência seja transmitida de forma criativa e envolvente.",
      image: "https://picsum.photos/seed/gabi/400/400",
      hint: "woman portrait"
    },
    {
      name: "Márcia Marinho",
      title: "Líder do Núcleo de Captação de Recursos e UPA Store",
      bio: "Responsável por desenvolver estratégias de apoio financeiro e coordenar a loja oficial UPA Store, fortalecendo a sustentabilidade do ministério.",
      image: "/marcia.jpg",
      hint: "woman portrait"
    },
    {
      name: "Rafaela Duarte",
      title: "Líder do Núcleo de Decoração",
      bio: "Traz beleza e criatividade para cada ambiente do acampamento, transformando os espaços em lugares acolhedores e inspiradores.",
      image: "https://picsum.photos/seed/rafa/400/400",
      hint: "woman portrait"
    },
    {
      name: "Diogo Magalhães",
      title: "Líder da BandUPA",
      bio: "Coordena a equipe de louvor, conduzindo os adolescentes em momentos de adoração que aproximam seus corações de Deus.",
      image: "/diogo.jpg",
      hint: "man portrait"
    },
    {
      name: "André Negrão",
      title: "Líder do Núcleo de Limpeza",
      bio: "Garante que os ambientes estejam sempre organizados e agradáveis, contribuindo para o bem-estar de todos durante o acampamento.",
      image: "/negrao.jpg",
      hint: "man portrait"
    },
    {
      name: "Hadassa Feijó",
      title: "Líder do Núcleo da Saúde",
      bio: "Cuida da saúde e segurança dos participantes, oferecendo suporte e acompanhamento em situações de necessidade.",
      image: "/hadassa.jpg",
      hint: "woman portrait"
    },
    {
      name: "Lael Henrique",
      title: "Líder do Reteatrus",
      bio: "Responsável por conduzir as apresentações teatrais do acampamento, usando a arte como ferramenta criativa para transmitir mensagens que edificam e inspiram.",
      image: "/lael.jpg",
      hint: "male person"
    },
    {
      name: "Hannah Falcão",
      title: "Líder do Kinisi",
      bio: "Coordena o grupo de dança, preparando coreografias que expressam adoração e alegria, contribuindo para a vivência artística e espiritual do acampamento.",
      image: "/hannah.jpg",
      hint: "woman portrait"
    },
    {
      name: "Luísa Barreto",
      title: "Líder do Núcleo de Intercessão",
      bio: "Dedica-se à oração e intercessão durante o acampamento, sustentando cada detalhe do evento espiritualmente e fortalecendo a cobertura de oração sobre os adolescentes.",
      image: "/luisa.jpg",
      hint: "woman portrait"
    }
];

export default function Speakers() {
  return (
    <section id="speakers" className="py-12 md:py-24 bg-card">
      <div className="container">
        <motion.div 
          className="text-center max-w-3xl mx-auto"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
        >
          <h2 className="text-3xl md:text-4xl font-semibold font-headline">
            Nossa Equipe – UPA Religados
          </h2>
          <p className="text-muted-foreground mt-4 text-lg">
            Conheça a equipe que, com dedicação e amor, tem servido para que cada detalhe do Acampamento UPA Religados seja preparado com excelência.
          </p>
        </motion.div>
        <Carousel 
          opts={{
            align: "start",
            loop: true,
          }}
          plugins={[
            Autoplay({
              delay: 5000,
            }),
          ]}
          className="w-full max-w-xs sm:max-w-xl md:max-w-3xl lg:max-w-5xl mx-auto mt-12"
        >
          <CarouselContent>
            {speakers.map((speaker, index) => (
              <CarouselItem key={index} className="basis-full sm:basis-1/2 lg:basis-1/3">
                <div className="p-1">
                  <Card className="flex flex-col text-left overflow-hidden h-full border-none shadow-none bg-transparent">
                    <CardHeader className="p-0">
                      <Image
                        src={speaker.image}
                        alt={`Foto de ${speaker.name}`}
                        width={400}
                        height={400}
                        className="w-full h-auto object-cover aspect-square rounded-lg"
                        data-ai-hint={speaker.hint}
                        priority={index < 3}
                        loading={index >= 3 ? 'lazy' : 'eager'}
                      />
                    </CardHeader>
                    <CardContent className="p-0 pt-4 flex flex-col flex-grow">
                      <CardTitle className="font-headline text-xl">{speaker.name}</CardTitle>
                      <p className="text-primary font-semibold mt-1 text-sm">{speaker.title}</p>
                      {speaker.bio && <CardDescription className="mt-2 flex-grow">{speaker.bio}</CardDescription>}
                    </CardContent>
                  </Card>
                </div>
              </CarouselItem>
            ))}
          </CarouselContent>
          <CarouselPrevious className="bg-secondary text-secondary-foreground hover:bg-secondary/90 -left-4 sm:-left-8 md:-left-12" />
          <CarouselNext className="bg-secondary text-secondary-foreground hover:bg-secondary/90 -right-4 sm:-right-8 md:-right-12" />
        </Carousel>
      </div>
    </section>
  );
}
// Trigger commit
