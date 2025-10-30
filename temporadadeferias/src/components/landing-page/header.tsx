
import Image from 'next/image';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { ThemeToggle } from '@/components/theme-toggle';


export default function Header() {
  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container flex h-16 items-center justify-between">
        <div className="flex items-center gap-2">
           <Link href="/" aria-label="Home" className='flex items-center gap-2'>
            <Image src="/upa.jpg" alt="Logo da UPA" width={32} height={32} className="h-8 w-8 rounded-full" data-ai-hint="logo design" />
            <span className='font-bold hidden sm:inline-block'>Temporada de Férias</span>
          </Link>
        </div>
        
        <div className="flex items-center justify-end gap-2">
          <Button asChild className="bg-primary hover:bg-primary/90 text-primary-foreground font-headline">
              <Link href="/signup">Inscreva-se</Link>
          </Button>
          <ThemeToggle />
        </div>
      </div>
    </header>
  );
}
// Trigger commit
