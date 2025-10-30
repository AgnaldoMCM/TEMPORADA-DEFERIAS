
import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'
import { getIronSession } from 'iron-session';
import { SessionData, sessionOptions } from '@/lib/session';
import { cookies } from 'next/headers';
 
export async function middleware(request: NextRequest) {
  const cookieStore = await cookies();
  const session = await getIronSession<SessionData>(cookieStore, sessionOptions);
 
  // Se o usuário não estiver logado, redirecione para a página de login.
  if (!session.isLoggedIn) {
     // Evita redirecionamentos infinitos se já estiver na página de login.
    if (request.nextUrl.pathname.startsWith('/admin/login')) {
      return NextResponse.next();
    }
    return NextResponse.redirect(new URL('/admin/login', request.url))
  }
  
  // Se o usuário estiver logado e tentar acessar a página de login, redirecione para o painel de dashboard.
  if (request.nextUrl.pathname.startsWith('/admin/login')) {
      return NextResponse.redirect(new URL('/admin/dashboard', request.url));
  }
 
  return NextResponse.next()
}
 
// O middleware agora se aplica a todas as rotas dentro de /admin,
// incluindo a própria /admin e /admin/login.
export const config = {
  matcher: ['/admin/:path*', '/admin'],
}
    
// Trigger commit
