import { XCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';

export default function ErrorPage() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center bg-secondary p-4">
      <Card className="w-full max-w-md text-center">
        <CardHeader className="items-center">
            <XCircle className="h-16 w-16 text-destructive" />
            <CardTitle className="mt-6">Ocorreu um Erro</CardTitle>
            <CardDescription>Houve um problema inesperado. Por favor, tente novamente mais tarde ou entre em contato com o suporte.</CardDescription>
        </CardHeader>
        <CardContent>
          <Button asChild>
            <Link href="/">Voltar para a página inicial</Link>
          </Button>
        </CardContent>
      </Card>
    </main>
  );
}
// Trigger commit
