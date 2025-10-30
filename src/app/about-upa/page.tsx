
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { ArrowLeft, BookOpen, Heart, Users, Compass } from 'lucide-react';

export default function AboutUpaPage() {
  return (
    <main className="flex min-h-screen flex-col items-center bg-secondary p-4 sm:p-8">
      <div className="w-full max-w-4xl mx-auto relative">
        <Button asChild variant="ghost" size="icon" className="absolute top-0 left-0 z-10">
            <Link href="/" aria-label="Voltar para a página inicial">
                <ArrowLeft />
            </Link>
        </Button>
        
        <div className="text-center mb-12 pt-12 md:pt-0">
            <div className="mx-auto bg-primary/10 rounded-full p-4 w-fit mb-4">
              <BookOpen className="h-8 w-8 text-primary" />
            </div>
            <h1 className="text-4xl font-headline font-bold">O que é a UPA Religados?</h1>
             <p className="text-muted-foreground mt-2">Conheça mais sobre o nosso ministério.</p>
        </div>

        <Card className="shadow-lg">
            <CardContent className="p-6 md:p-8 space-y-6 text-muted-foreground text-base leading-relaxed">
                <p>
                    A <strong>UPA (União Presbiteriana de Adolescentes)</strong> é o ministério da Igreja Presbiteriana do Brasil (IPB) dedicado aos adolescentes com idades entre 12 a 18 anos. O nosso grupo, a <strong>UPA Religados</strong>, faz parte da Igreja Presbiteriana de Manaus (IPManaus) e tem como objetivo principal integrar os adolescentes na vida da igreja, ensinando a Palavra de Deus de forma relevante e criando um ambiente de comunhão e amizade.
                </p>
                
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-center">
                    <div className="flex flex-col items-center p-4 rounded-lg bg-background">
                        <Heart className="h-8 w-8 text-primary mb-2"/>
                        <h3 className="font-headline text-lg font-semibold">Nossa Missão</h3>
                        <p className="text-sm">Levar o evangelho aos adolescentes, ajudando-os a desenvolver um relacionamento pessoal com Cristo.</p>
                    </div>
                    <div className="flex flex-col items-center p-4 rounded-lg bg-background">
                        <Users className="h-8 w-8 text-primary mb-2"/>
                        <h3 className="font-headline text-lg font-semibold">Nossas Atividades</h3>
                        <p className="text-sm">Realizamos estudos bíblicos, gincanas, acampamentos (como a Temporada de Férias!), projetos sociais e muito mais.</p>
                    </div>
                     <div className="flex flex-col items-center p-4 rounded-lg bg-background">
                        <Compass className="h-8 w-8 text-primary mb-2"/>
                        <h3 className="font-headline text-lg font-semibold">Nossos Valores</h3>
                        <p className="text-sm">Comunhão, ensino da Palavra, serviço ao próximo e adoração a Deus são os pilares que nos guiam.</p>
                    </div>
                </div>

                <p>
                    Acreditamos que a adolescência é uma fase crucial para a formação da fé e do caráter. Por isso, a UPA Religados se esforça para ser um lugar seguro, divertido e espiritualmente edificante, onde cada adolescente se sinta acolhido, amado e parte do corpo de Cristo.
                </p>
            </CardContent>
        </Card>

        <div className="text-center mt-12">
            <Button asChild>
                <Link href="/">Voltar para a página inicial</Link>
            </Button>
        </div>
      </div>
    </main>
  );
}
// Trigger commit
