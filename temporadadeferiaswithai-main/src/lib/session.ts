import type { IronSessionOptions } from 'iron-session';

export interface SessionData {
  isLoggedIn: boolean;
  email?: string; // Adicionado para armazenar o email do admin logado
}

const secretPassword = process.env.SECRET_COOKIE_PASSWORD;

if (!secretPassword || secretPassword.length < 32) {
    const errorMessage = "ERRO CRÍTICO: A variável de ambiente SECRET_COOKIE_PASSWORD não está definida ou é muito curta (deve ter no mínimo 32 caracteres). Esta variável é essencial para a segurança das sessões. O servidor não pode iniciar.";
    console.error(errorMessage);
    throw new Error(errorMessage);
}


export const sessionOptions: IronSessionOptions = {
  password: secretPassword,
  cookieName: 'frias-retreat-auth-cookie',
  // secure: true deve ser usado em produção (HTTPS), mas não em desenvolvimento (HTTP)
  cookieOptions: {
    secure: process.env.NODE_ENV === 'production',
    // maxAge: undefined garante que este seja um "session cookie" que é destruído quando o navegador é fechado.
    maxAge: undefined,
  },
};
// Trigger commit
