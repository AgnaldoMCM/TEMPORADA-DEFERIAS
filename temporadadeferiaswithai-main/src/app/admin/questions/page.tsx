
import { Suspense } from "react";
import { AdminLayout } from "@/components/admin/admin-layout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { getQuestions } from "@/app/actions";
import { QuestionsList } from "@/components/admin/questions-list";
import type { Question } from "@/lib/types";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Terminal, HelpCircle } from "lucide-react";

export const dynamic = 'force-dynamic';

export default async function AdminQuestionsPage() {
    let questions: Question[] = [];
    let error: string | null = null;

    try {
        const rawQuestions = await getQuestions();
        questions = JSON.parse(JSON.stringify(rawQuestions));
    } catch (e) {
        console.error("Failed to load questions:", e);
        error = e instanceof Error ? e.message : "An unknown error occurred.";
    }

    return (
        <AdminLayout>
            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                        <HelpCircle className="h-6 w-6" />
                        Perguntas e Respostas
                    </CardTitle>
                    <CardDescription>
                        Visualize e responda às dúvidas enviadas pelos usuários.
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <Suspense fallback={<p>Carregando perguntas...</p>}>
                        {error ? (
                            <Alert variant="destructive">
                                <Terminal className="h-4 w-4" />
                                <AlertTitle>Erro ao carregar dados</AlertTitle>
                                <AlertDescription>{error}</AlertDescription>
                            </Alert>
                        ) : (
                            <QuestionsList initialData={questions} />
                        )}
                    </Suspense>
                </CardContent>
            </Card>
        </AdminLayout>
    );
}
// Trigger commit
