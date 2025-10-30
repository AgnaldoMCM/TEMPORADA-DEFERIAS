
import { Suspense } from "react";
import { AdminLayout } from "@/components/admin/admin-layout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { getActivityLogs } from "@/app/actions";
import { ActivityLogList } from "@/components/admin/activity-log";
import type { ActivityLog } from "@/lib/types";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Terminal, History } from "lucide-react";

export const dynamic = 'force-dynamic';

export default async function AdminLogsPage() {
    let logs: ActivityLog[] = [];
    let error: string | null = null;

    try {
        const rawLogs = await getActivityLogs();
        // Serializa e desserializa para garantir que não haja problemas com tipos não-serializáveis
        logs = JSON.parse(JSON.stringify(rawLogs));
    } catch (e) {
        console.error("Failed to load activity logs:", e);
        error = e instanceof Error ? e.message : "An unknown error occurred.";
    }

    return (
        <AdminLayout>
            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                        <History className="h-6 w-6" />
                        Logs de Atividade
                    </CardTitle>
                    <CardDescription>
                        Um registro de todas as ações importantes realizadas no sistema.
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <Suspense fallback={<p>Carregando logs de atividade...</p>}>
                        {error ? (
                            <Alert variant="destructive">
                                <Terminal className="h-4 w-4" />
                                <AlertTitle>Erro ao carregar dados</AlertTitle>
                                <AlertDescription>{error}</AlertDescription>
                            </Alert>
                        ) : (
                            <ActivityLogList initialData={logs} />
                        )}
                    </Suspense>
                </CardContent>
            </Card>
        </AdminLayout>
    );
}
// Trigger commit
