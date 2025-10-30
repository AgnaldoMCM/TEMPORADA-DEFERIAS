
import RegistrationData from "@/components/admin/registration-data";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Suspense } from "react";
import LogoutButton from "@/components/admin/logout-button";
import { getRegistrations } from "@/app/actions";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Terminal, Users } from "lucide-react";
import { type Registration } from "@/lib/types";
import { AdminLayout } from "@/components/admin/admin-layout";

export const dynamic = 'force-dynamic';

export default async function AdminRegistrationsPage() {
    let registrations: Registration[] = [];
    let error: string | null = null;
    let rawRegistrations;

    try {
        // Busca os dados mais recentes para exibir.
        rawRegistrations = await getRegistrations();
        
        // Garantindo que os dados estejam no formato esperado antes de passar para o client component.
        // O .sort() aqui garante que os dados cheguem ao cliente pré-ordenados por data.
        registrations = JSON.parse(JSON.stringify(rawRegistrations)).sort(
            (a: Registration, b: Registration) => 
                new Date(b.createdAt as string).getTime() - new Date(a.createdAt as string).getTime()
        );

    } catch (e) {
        console.error(e);
        error = e instanceof Error ? e.message : "Ocorreu um erro desconhecido.";
    }

    return (
        <AdminLayout>
            <Card>
                <CardHeader className="flex flex-row items-center justify-between">
                    <div>
                        <CardTitle className="flex items-center gap-2">
                            <Users className="h-6 w-6" />
                            Inscrições
                        </CardTitle>
                        <CardDescription>
                            A lista de todas as inscrições no sistema.
                        </CardDescription>
                    </div>
                    <LogoutButton />
                </CardHeader>
                <CardContent>
                    <Suspense fallback={<p>Carregando inscrições...</p>}>
                        {error ? (
                            <Alert variant="destructive">
                                <Terminal className="h-4 w-4" />
                                <AlertTitle>Erro ao carregar dados</AlertTitle>
                                <AlertDescription>{error}</AlertDescription>
                            </Alert>
                        ) : (
                            <RegistrationData initialData={registrations} />
                        )}
                    </Suspense>
                </CardContent>
            </Card>
        </AdminLayout>
    );
}
// Trigger commit
