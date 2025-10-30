
import Link from "next/link";
import { Button } from "@/components/ui/button";
import Image from "next/image";
import { Instagram, UserCog } from "lucide-react";

export default function Footer() {
  return (
    <footer className="py-12 border-t bg-secondary">
      <div className="container text-center text-sm text-muted-foreground flex flex-col items-center">
        <Link href="/" aria-label="Home" className='flex items-center gap-2'>
            <Image src="/upa.jpg" alt="Logo da UPA" width={32} height={32} className="h-8 w-8 rounded-full" data-ai-hint="logo design" />
        </Link>
        <p className="mt-4 max-w-sm">
            Igreja Presbiteriana de Manaus - UPA Religados
        </p>
        <div className="flex flex-col sm:flex-row items-center gap-4 mt-4">
            <a 
              href="https://www.instagram.com/upa_religados" 
              target="_blank" 
              rel="noopener noreferrer" 
              className="inline-flex items-center gap-2 text-sm font-semibold text-primary hover:underline"
            >
              <Instagram className="h-4 w-4" />
              @upa_religados
            </a>
            <a 
              href="https://wa.me/5592993440353"
              target="_blank" 
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 text-sm font-semibold text-primary hover:underline"
            >
              <Image src="/zap2.png" alt="WhatsApp" width={16} height={16} className="h-4 w-4" data-ai-hint="whatsapp icon"/>
              (92) 99344-0353
            </a>
        </div>
        <p className="mt-6 text-xs">
            &copy; {new Date().getFullYear()} Todos os direitos reservados.
        </p>
        <div className="flex items-center gap-2 mt-2 flex-wrap justify-center">
            <Button variant="link" asChild className="text-xs h-auto p-0">
                <Link href="/developers">
                    Quem criou esse site?
                </Link>
            </Button>
            <span className="text-xs hidden sm:inline">|</span>
            <Button variant="link" asChild className="text-xs h-auto p-0">
                <Link href="/about-upa">
                    O que é a UPA Religados?
                </Link>
            </Button>
             <span className="text-xs hidden sm:inline">|</span>
             <Button variant="link" asChild className="text-xs h-auto p-0">
                <Link href="/admin">
                    <UserCog className="mr-1 inline-block h-3 w-3" />
                    Acesso Restrito
                </Link>
            </Button>
        </div>
      </div>
    </footer>
  );
}
// Trigger commit
