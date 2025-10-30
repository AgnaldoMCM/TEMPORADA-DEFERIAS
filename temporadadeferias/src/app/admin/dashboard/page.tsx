
import { getRegistrationStats } from "@/app/actions";
import { AdminLayout } from "@/components/admin/admin-layout";
import { RegistrationCharts } from "@/components/admin/registration-charts";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Progress } from "@/components/ui/progress";
import { BarChart, Terminal, Users, UserCheck, UserX, LineChart, CalendarDays, DollarSign, Target, Heart } from "lucide-react";
import { Suspense } from "react";
import { TotalRegistrationsChart } from "@/components/admin/total-registrations-chart";

export const dynamic = 'force-dynamic';

export default async function DashboardPage() {
    let stats;
    let error = null;
    const GOAL = 250;
    const ADOPTEE_GOAL = 20;

    try {
        stats = await getRegistrationStats();
    } catch (e) {
        console.error("Failed to load registration stats:", e);
        error = e instanceof Error ? e.message : "An unknown error occurred.";
    }

    const adopteeProgressPercentage = stats ? (stats.adoptees / ADOPTEE_GOAL) * 100 : 0;
    
    return (
        <AdminLayout>
            <div className="space-y-6">
                 {stats && (
                    <>
                        {/* KPI Cards */}
                         <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                            <Card>
                                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                                    <CardTitle className="text-sm font-medium">Receita Total</CardTitle>
                                    <DollarSign className="h-4 w-4 text-muted-foreground" />
                                </CardHeader>
                                <CardContent>
                                    <div className="text-2xl font-bold">R$ {stats.revenue.toFixed(2).replace('.', ',')}</div>
                                    <p className="text-xs text-muted-foreground">de {stats.confirmed} pagamentos confirmados</p>
                                </CardContent>
                            </Card>
                             <Card>
                                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                                    <CardTitle className="text-sm font-medium">Inscrições na Semana</CardTitle>
                                    <CalendarDays className="h-4 w-4 text-muted-foreground" />
                                </CardHeader>
                                <CardContent>
                                    <div className="text-2xl font-bold">+{stats.newThisWeek}</div>
                                    <p className="text-xs text-muted-foreground">nos últimos 7 dias</p>
                                </CardContent>
                            </Card>
                            <Card>
                                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                                    <CardTitle className="text-sm font-medium">Inscrições no Mês</CardTitle>
                                    <LineChart className="h-4 w-4 text-muted-foreground" />
                                </CardHeader>
                                <CardContent>
                                    <div className="text-2xl font-bold">+{stats.newThisMonth}</div>
                                    <p className="text-xs text-muted-foreground">nos últimos 30 dias</p>
                                </CardContent>
                            </Card>
                        </div>
                        {/* Main Stats Cards */}
                        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                            <Card className="lg:col-span-1">
                                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                                    <CardTitle className="text-sm font-medium">Total de Vagas</CardTitle>
                                    <Target className="h-4 w-4 text-muted-foreground" />
                                </CardHeader>
                                <CardContent>
                                    <div className="text-2xl font-bold">{stats.total} / {GOAL}</div>
                                     <TotalRegistrationsChart
                                        total={stats.total}
                                        goal={GOAL}
                                     />
                                </CardContent>
                            </Card>
                             <Card className="lg:col-span-1">
                                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                                    <CardTitle className="text-sm font-medium">Vagas "Adote"</CardTitle>
                                    <Heart className="h-4 w-4 text-pink-500" />
                                </CardHeader>
                                <CardContent>
                                    <div className="text-2xl font-bold">{stats.adoptees} / {ADOPTEE_GOAL}</div>
                                    <Progress value={adopteeProgressPercentage} className="mt-2" />
                                </CardContent>
                            </Card>
                            <Card>
                                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                                    <CardTitle className="text-sm font-medium">Vagas Confirmadas</CardTitle>
                                    <UserCheck className="h-4 w-4 text-muted-foreground" />
                                </CardHeader>
                                <CardContent>
                                    <div className="text-2xl font-bold">{stats.confirmed}</div>
                                </CardContent>
                            </Card>
                            <Card>
                                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                                    <CardTitle className="text-sm font-medium">Pagamentos Pendentes</CardTitle>
                                    <UserX className="h-4 w-4 text-muted-foreground" />
                                </CardHeader>
                                <CardContent>
                                    <div className="text-2xl font-bold">{stats.pending}</div>
                                </CardContent>
                            </Card>
                        </div>
                    </>
                 )}

                <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <BarChart className="h-6 w-6" />
                            Dashboard de Insights
                        </CardTitle>
                        <CardDescription>
                            Análise visual dos dados de inscrição do evento.
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        <Suspense fallback={<p>Carregando estatísticas...</p>}>
                            {error ? (
                                <Alert variant="destructive">
                                    <Terminal className="h-4 w-4" />
                                    <AlertTitle>Erro ao carregar estatísticas</AlertTitle>
                                    <AlertDescription>{error}</AlertDescription>
                                </Alert>
                            ) : stats ? (
                                <RegistrationCharts stats={stats} />
                            ) : (
                            <p>Nenhuma estatística disponível.</p>
                            )}
                        </Suspense>
                    </CardContent>
                </Card>
            </div>
        </AdminLayout>
    );
}
// Trigger commit
