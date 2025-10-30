
// Este arquivo é para uso EXCLUSIVO DO SERVIDOR
import admin from 'firebase-admin';
import { getAuth } from 'firebase-admin/auth';
import { getFirestore } from 'firebase-admin/firestore';
import dotenv from 'dotenv';
import path from 'path';

// Carrega as variáveis de ambiente de forma explícita e segura
// Isso garante que as credenciais sejam lidas antes de qualquer outra coisa.
dotenv.config({ path: path.resolve(process.cwd(), '.env.local') });

const serviceAccount = {
  projectId: process.env.FIREBASE_PROJECT_ID,
  clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
  // A chave privada precisa de um tratamento especial para substituir '\\n' por '\n'
  privateKey: process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, '\n'),
};

const secretCookiePassword = process.env.SECRET_COOKIE_PASSWORD;

// Validação rigorosa para garantir que as credenciais foram carregadas e são válidas.
// Se alguma estiver faltando, o servidor irá parar com um erro claro.
const missingVars = [
    !serviceAccount.projectId && 'FIREBASE_PROJECT_ID',
    !serviceAccount.clientEmail && 'FIREBASE_CLIENT_EMAIL',
    !serviceAccount.privateKey && 'FIREBASE_PRIVATE_KEY',
    !secretCookiePassword && 'SECRET_COOKIE_PASSWORD',
    // Adicionando validação para variáveis do Google Sheets
    !process.env.GOOGLE_SHEETS_SERVICE_ACCOUNT_EMAIL && 'GOOGLE_SHEETS_SERVICE_ACCOUNT_EMAIL',
    !process.env.GOOGLE_SHEETS_PRIVATE_KEY && 'GOOGLE_SHEETS_PRIVATE_KEY',
    !process.env.GOOGLE_SHEETS_DOCUMENT_ID && 'GOOGLE_SHEETS_DOCUMENT_ID',
].filter(Boolean).join(', ');


if (missingVars.length > 0) {
  const errorMessage = `ERRO CRÍTICO: Credenciais ou segredos essenciais não encontrados ou incompletos no .env.local. Faltando: ${missingVars}. O servidor não pode iniciar. Verifique seu arquivo .env.local.`;
  console.error(errorMessage);
  throw new Error(errorMessage);
}


let app: admin.app.App;

// Padrão Singleton: Garante que o Firebase seja inicializado apenas UMA VEZ.
// Isso evita erros de "já foi inicializado" e garante uma conexão estável.
if (!admin.apps.length) {
  try {
    app = admin.initializeApp({
      credential: admin.credential.cert(serviceAccount as admin.ServiceAccount),
    });
    console.log('Firebase Admin SDK inicializado com sucesso.');
  } catch (error: any) {
    console.error("ERRO CRÍTICO AO INICIALIZAR O FIREBASE ADMIN:", error.message);
    // Lançar o erro para parar a execução se a inicialização falhar.
    throw new Error(`Falha ao inicializar o Firebase Admin: ${error.message}`);
  }
} else {
  // Se já foi inicializado, apenas pegamos a instância existente.
  app = admin.app();
}

// Exportamos as conexões que serão usadas em outras partes do servidor.
// Como elas são criadas apenas APÓS a inicialização bem-sucedida, elas são garantidamente válidas.
const db = getFirestore(app);
const authAdmin = getAuth(app);

export { db, authAdmin, admin };
// Trigger commit
