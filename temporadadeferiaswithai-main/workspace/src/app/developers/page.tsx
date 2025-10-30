
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { ArrowLeft, Code2 } from 'lucide-react';
import Image from 'next/image';

const developers = [
  {
    name: "Agnaldo Matheus",
    role: "Desenvolvedor Full-Stack",
    bio: "Responsável por todo o desenvolvimento do projeto, desde a concepção da ideia até a implementação do código front-end e back-end, integrações e implantação.",
    image: "/agnaldo.jpeg",
    hint: "male portrait"
  },
  {
    name: "André Negrão",
    role: "Engenheiro de Software & Mentor do Projeto",
    bio: "Atuou como mentor no início do projeto, oferecendo direcionamento técnico crucial apontando os problemas que a equipe de gestão enfrentava nos retiros, não atuou diretamente no desenvolvimento porém foi de extrema importancia.",
    image: "/negrao.jpg",
    hint: "man portrait"
  }
];

export default function DevelopersPage() {
  return (
    <main className="flex min-h-screen flex-col items-center bg-secondary p-4 sm:p-8">
      <div className="w-full max-w-4xl mx-auto relative">
        <div className="absolute top-0 left-0 z-10">
          <Button asChild variant="ghost" size="icon">
              <Link href="/" aria-label="Voltar para a página inicial">
                  <ArrowLeft />
              </Link>
          </Button>
        </div>
        <div className="text-center mb-12 pt-12 md:pt-0">
          <div className="mx-auto bg-primary/10 rounded-full p-4 w-fit mb-4">
              <Code2 className="h-8 w-8 text-primary" />
          </div>
          <h1 className="text-4xl font-headline font-bold">Sobre os Desenvolvedores</h1>
          <p className="text-muted-foreground mt-2">As mentes por trás do projeto.</p>
        </div>
        
        <div className="grid gap-8 md:grid-cols-2">
          {developers.map((dev) => (
            <Card key={dev.name} className="flex flex-col text-center items-center p-6 shadow-lg hover:shadow-xl transition-shadow">
                <Image 
                    src={dev.image}
                    alt={`Foto de ${dev.name}`}
                    width={120}
                    height={120}
                    className="rounded-full h-32 w-32 object-cover border-4 border-primary"
                    data-ai-hint={dev.hint}
                />
                <CardHeader>
                    <CardTitle className="text-2xl font-headline">{dev.name}</CardTitle>
                    <CardDescription className="text-primary font-semibold">{dev.role}</CardDescription>
                </CardHeader>
                <CardContent>
                    <p className="text-sm text-muted-foreground">{dev.bio}</p>
                </CardContent>
            </Card>
          ))}
        </div>
        <div className="text-center mt-12">
            <Button asChild>
                <Link href="/">Voltar para a página inicial</Link>
            </Button>
        </div>
      </div>
    </main>
  );
}
// Final trigger for commit
