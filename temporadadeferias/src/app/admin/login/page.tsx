
"use client";

import { useState } from "react";
import { useRouter } from 'next/navigation';
// ATUALIZAÇÃO: Usa `browserSessionPersistence` para garantir que o login não persista após fechar o navegador.
import { getAuth, signInWithEmailAndPassword, sendPasswordResetEmail, setPersistence, browserSessionPersistence } from "firebase/auth";
import { app } from "@/lib/firebase"; // Import a config de cliente
import { createSession } from "@/app/actions";
import Link from "next/link";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Church, Loader2, Mail } from "lucide-react";

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [message, setMessage] = useState<string | null>(null); // For success/info messages
  const [view, setView] = useState<'login' | 'reset'>('login'); // To toggle forms

  const router = useRouter();
  
  // A sessão será controlada exclusivamente pelo cookie seguro do iron-session.
  const auth = getAuth(app);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setMessage(null);

    try {
      // Garante que a persistência seja definida como de SESSÃO antes de fazer o login.
      // Isso significa que o login será encerrado quando o navegador for fechado.
      await setPersistence(auth, browserSessionPersistence);
      
      const userCredential = await signInWithEmailAndPassword(auth, email, password);
      const user = userCredential.user;
      const idToken = await user.getIdToken();

      const sessionResult = await createSession(idToken);

      if (sessionResult.success) {
        router.push('/admin/dashboard');
      } else {
        throw new Error(sessionResult.error || "Falha ao criar a sessão no servidor.");
      }

    } catch (error: any) {
      let errorMessage = "Ocorreu um erro desconhecido.";
      if (error.code) {
        switch (error.code) {
          case 'auth/user-not-found':
          case 'auth/wrong-password':
          case 'auth/invalid-credential':
            errorMessage = 'Email ou senha inválidos.';
            break;
          default:
            errorMessage = 'Falha ao autenticar. Verifique suas credenciais.';
        }
      }
      console.error("Erro de autenticação:", error);
      setError(errorMessage);
      setLoading(false);
    }
  };

  const handlePasswordReset = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setMessage(null);

    try {
      await sendPasswordResetEmail(auth, email);
      setMessage("Se existir uma conta para este e-mail, um link de redefinição de senha foi enviado.");
      setLoading(false);
    } catch (error: any) {
       let errorMessage = "Ocorreu um erro desconhecido.";
       if (error.code) {
        switch (error.code) {
           case 'auth/invalid-email':
            errorMessage = 'O formato do e-mail fornecido é inválido.';
            break;
           case 'auth/user-not-found':
            // Don't reveal if user exists, show generic message
             setMessage("Se existir uma conta para este e-mail, um link de redefinição de senha foi enviado.");
            break;
          default:
            errorMessage = 'Falha ao enviar o e-mail de redefinição. Tente novamente.';
        }
      }
      if(errorMessage !== "Ocorreu um erro desconhecido.") {
        setError(errorMessage);
      }
      console.error("Erro ao redefinir senha:", error);
      setLoading(false);
    }
  }


  return (
    <main className="flex min-h-screen flex-col items-center justify-center bg-secondary p-4">
      <Card className="w-full max-w-sm">
        {view === 'login' ? (
          <>
            <CardHeader className="text-center">
                <div className="mx-auto bg-primary/10 rounded-full p-4 w-fit mb-4">
                    <Church className="h-8 w-8 text-primary" />
                </div>
                <CardTitle className="text-2xl">Acesso Restrito</CardTitle>
                <CardDescription>
                    Por favor, insira suas credenciais para acessar o painel.
                </CardDescription>
            </CardHeader>
            <CardContent>
                <form onSubmit={handleLogin} className="space-y-4">
                    <div className="space-y-2">
                        <Label htmlFor="email">Email</Label>
                        <Input id="email" name="email" type="email" required value={email} onChange={(e) => setEmail(e.target.value)} disabled={loading}/>
                    </div>
                    <div className="space-y-2">
                        <div className="flex items-center justify-between">
                            <Label htmlFor="password">Senha</Label>
                            <Button variant="link" type="button" onClick={() => setView('reset')} className="h-auto p-0 text-xs">
                              esqueceu a senha adm?
                            </Button>
                        </div>
                        <Input id="password" name="password" type="password" required value={password} onChange={(e) => setPassword(e.target.value)} disabled={loading}/>
                    </div>
                    {error && (
                        <p className="text-sm font-medium text-destructive">{error}</p>
                    )}
                    <Button type="submit" className="w-full" disabled={loading}>
                      {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                      {loading ? "Entrando..." : "Entrar"}
                    </Button>
                </form>
            </CardContent>
          </>
        ) : ( // view === 'reset'
          <>
            <CardHeader className="text-center">
                <div className="mx-auto bg-primary/10 rounded-full p-4 w-fit mb-4">
                    <Mail className="h-8 w-8 text-primary" />
                </div>
                <CardTitle className="text-2xl">Redefinir Senha</CardTitle>
                <CardDescription>
                    Digite seu e-mail para receber um link de redefinição.
                </CardDescription>
            </CardHeader>
            <CardContent>
                <form onSubmit={handlePasswordReset} className="space-y-4">
                    <div className="space-y-2">
                        <Label htmlFor="reset-email">Email</Label>
                        <Input id="reset-email" name="reset-email" type="email" required value={email} onChange={(e) => setEmail(e.target.value)} disabled={loading} placeholder="seu@email.com"/>
                    </div>
                    {error && <p className="text-sm font-medium text-destructive">{error}</p>}
                    {message && <p className="text-sm font-medium text-green-600">{message}</p>}
                    <Button type="submit" className="w-full" disabled={loading}>
                      {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                      {loading ? "Enviando..." : "Enviar Link de Redefinição"}
                    </Button>
                    <Button variant="link" onClick={() => { setView('login'); setError(null); setMessage(null); }} className="w-full">
                        Voltar para o Login
                    </Button>
                </form>
            </CardContent>
          </>
        )}
        <CardFooter className="pt-4">
          <Button asChild variant="link" className="w-full">
              <Link href="/">Voltar para a página inicial</Link>
          </Button>
        </CardFooter>
      </Card>
    </main>
  );
}
// Trigger commit
