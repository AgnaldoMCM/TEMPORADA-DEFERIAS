

"use client"

import { Bar, BarChart, CartesianGrid, XAxis, YAxis, Pie, PieChart, Cell, Legend, Tooltip, ResponsiveContainer } from "recharts"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { ChartContainer, ChartTooltipContent, ChartLegend, ChartLegendContent } from "@/components/ui/chart"
import { getRegistrationStats, getRegistrations } from "@/app/actions"
import { useState, useMemo, useEffect } from "react"
import { AlertCircle, FileImage, Salad, Stethoscope } from "lucide-react"
import { DrilldownModal } from "./drilldown-modal"
import type { Registration } from "@/lib/types"

type Stats = Awaited<ReturnType<typeof getRegistrationStats>>;

interface RegistrationChartsProps {
  stats: Stats;
}

// Helper para formatar o eixo X
const formatXAxis = (tickItem: any, data: any[]) => {
  const entry = data.find(d => d.name === tickItem);
  return entry ? `${entry.name} (${entry.value})` : tickItem;
};

export function RegistrationCharts({ stats }: RegistrationChartsProps) {
  const [allRegistrations, setAllRegistrations] = useState<Registration[]>([]);
  const [modalOpen, setModalOpen] = useState(false);
  const [modalTitle, setModalTitle] = useState("");
  const [modalData, setModalData] = useState<Registration[]>([]);

  useEffect(() => {
    // Busca todos os dados uma vez para poder filtrar localmente
    async function loadData() {
      const rawData = await getRegistrations();
      const parsedData = JSON.parse(JSON.stringify(rawData));
      setAllRegistrations(parsedData);
    }
    loadData();
  }, []);

  const handleChartClick = (category: string, value: string | number) => {
    if (!allRegistrations.length) return;

    let filtered: Registration[] = [];
    let title = "";

    switch(category) {
        case 'gender':
            title = `Participantes do Gênero: ${value}`;
            filtered = allRegistrations.filter(r => (r.details?.teenGender === 'female' ? 'Feminino' : 'Masculino') === value);
            break;
        case 'participationType':
             title = `Participantes por Tipo: ${value}`;
             const typeMap: { [key: string]: string } = { 'Membro IPManaus': 'member', 'Convidado': 'guest', 'Congregação': 'congregation' };
             const key = Object.keys(typeMap).find(k => k === value);
             if (key) {
                 filtered = allRegistrations.filter(r => r.details?.participationType === typeMap[key]);
             }
            break;
        case 'paymentMethod':
             title = `Pagamentos por Método: ${value}`;
             const paymentMap: { [key: string]: string } = { 'Presencial - À vista': 'presencial', 'Carnê-Parcelamento': 'carne', PIX: 'pix' };
             const pKey = Object.keys(paymentMap).find(k => k === value);
             if (pKey) {
                 filtered = allRegistrations.filter(r => r.paymentDetails?.method === paymentMap[pKey]);
             }
            break;
        case 'registrationValue':
             title = `Inscrições com Valor: ${value}`;
             const regValue = String(value).replace('R$ ', '');
             filtered = allRegistrations.filter(r => r.details?.registrationValue === regValue);
            break;
        case 'shirtSize':
            title = `Camisas do Tamanho: ${value}`;
            filtered = allRegistrations.filter(r => r.details?.shirtSize === value);
            break;
        case 'age':
            title = `Participantes com Idade: ${value}`;
            const ageNum = String(value).replace(' anos', '');
            filtered = allRegistrations.filter(r => String(r.details?.teenAge) === ageNum);
            break;
        case 'imageAuthorization':
            title = `Uso de Imagem: ${value}`;
            const authStatus = value === 'Autorizado' ? 'authorized' : 'not_authorized';
            filtered = allRegistrations.filter(r => r.details?.imageAndVoiceAuthorization === authStatus);
            break;
        case 'dietaryRestrictions':
            title = 'Participantes com Restrição Alimentar';
            filtered = allRegistrations.filter(r => r.details?.hasDietaryRestrictions === 'yes');
            break;
        case 'underTreatment':
            title = 'Participantes em Tratamento Médico';
            filtered = allRegistrations.filter(r => r.details?.isUnderTreatment === 'yes');
            break;
        case 'physicalLimitations':
             title = 'Participantes com Limitação Física';
             filtered = allRegistrations.filter(r => r.details?.canDoPhysicalActivities === 'no');
            break;
    }

    setModalTitle(title);
    setModalData(filtered);
    setModalOpen(true);
  };
  
  const chartConfigTotal = {
    confirmed: { label: "Confirmados", color: "hsl(var(--chart-2))" },
    pending: { label: "Pendentes", color: "hsl(var(--chart-5))" },
  }
  const totalData = [{ name: "Inscrições", confirmed: stats.confirmed, pending: stats.pending }];
  
  const chartConfigGender = {
    value: { label: "Participantes" },
    Feminino: { label: "Feminino", color: "hsl(var(--chart-1))" },
    Masculino: { label: "Masculino", color: "hsl(var(--chart-2))" },
  }
  
  const chartConfigParticipation = {
    value: { label: "Participantes" },
    "Membro IPManaus": { label: "Membro IPManaus", color: "hsl(var(--chart-1))" },
    "Convidado": { label: "Convidado", color: "hsl(var(--chart-2))" },
    "Congregação": { label: "Congregação", color: "hsl(var(--chart-3))" },
  }
  
  const chartConfigPayment = {
    value: { label: "Inscrições" },
    "Carnê-Parcelamento": { label: "Carnê", color: "hsl(var(--chart-3))" },
    "Presencial - À vista": { label: "À vista", color: "hsl(var(--chart-4))" },
    "PIX": { label: "PIX", color: "hsl(var(--chart-5))" },
  }

  const chartConfigValue = {
    value: { label: "Inscrições" },
    "R$ 380": { label: "R$ 380", color: "hsl(var(--chart-1))" },
    "R$ 323": { label: "R$ 323", color: "hsl(var(--chart-2))" },
    "R$ 190": { label: "R$ 190", color: "hsl(var(--chart-3))" },
    "R$ 342": { label: "R$ 342", color: "hsl(var(--chart-4))" },
  }

  const chartConfigShirts = {
    value: { label: "Camisas" },
     P: { color: "hsl(var(--chart-1))" },
     M: { color: "hsl(var(--chart-2))" },
     G: { color: "hsl(var(--chart-3))" },
     GG: { color: "hsl(var(--chart-4))" },
     XG: { color: "hsl(var(--chart-5))" },
  }

  const chartConfigAge = {
    value: { label: "Participantes" },
    "12 anos": { color: "hsl(var(--chart-1))" },
    "13 anos": { color: "hsl(var(--chart-2))" },
    "14 anos": { color: "hsl(var(--chart-3))" },
    "15 anos": { color: "hsl(var(--chart-4))" },
    "16 anos": { color: "hsl(var(--chart-5))" },
    "17 anos": { color: "hsl(var(--chart-1))" },
    "18 anos": { color: "hsl(var(--chart-2))" },
  }

  const chartConfigImageAuth = {
      value: { label: "Participantes" },
      Autorizado: { label: "Autorizado", color: "hsl(var(--chart-2))" },
      "Não Autorizado": { label: "Não Autorizado", color: "hsl(var(--chart-5))" },
  }

  return (
    <div className="space-y-6">
        <DrilldownModal 
            isOpen={modalOpen} 
            onClose={() => setModalOpen(false)}
            title={modalTitle}
            registrations={modalData}
        />
        {/* Medical Alerts */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <Card className="flex flex-col items-center justify-center p-4 bg-amber-50 border-amber-200 cursor-pointer hover:bg-amber-100" onClick={() => handleChartClick('dietaryRestrictions', '')}>
                <CardHeader className="p-0 flex-row items-center gap-2">
                    <Salad className="h-6 w-6 text-amber-600" />
                    <CardTitle className="text-sm font-semibold text-amber-800">Restrição Alimentar</CardTitle>
                </CardHeader>
                <CardContent className="p-0 pt-2">
                    <p className="text-2xl font-bold text-amber-700">{stats.alerts.dietaryRestrictions}</p>
                </CardContent>
            </Card>
            <Card className="flex flex-col items-center justify-center p-4 bg-rose-50 border-rose-200 cursor-pointer hover:bg-rose-100" onClick={() => handleChartClick('underTreatment', '')}>
                <CardHeader className="p-0 flex-row items-center gap-2">
                    <Stethoscope className="h-6 w-6 text-rose-600" />
                    <CardTitle className="text-sm font-semibold text-rose-800">Em Tratamento</CardTitle>
                </CardHeader>
                <CardContent className="p-0 pt-2">
                    <p className="text-2xl font-bold text-rose-700">{stats.alerts.underTreatment}</p>
                </CardContent>
            </Card>
            <Card className="flex flex-col items-center justify-center p-4 bg-blue-50 border-blue-200 cursor-pointer hover:bg-blue-100" onClick={() => handleChartClick('physicalLimitations', '')}>
                <CardHeader className="p-0 flex-row items-center gap-2">
                    <AlertCircle className="h-6 w-6 text-blue-600" />
                    <CardTitle className="text-sm font-semibold text-blue-800">Limitação Física</CardTitle>
                </CardHeader>
                <CardContent className="p-0 pt-2">
                    <p className="text-2xl font-bold text-blue-700">{stats.alerts.physicalLimitations}</p>
                </CardContent>
            </Card>
        </div>


        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
                <CardHeader>
                <CardTitle>Total de Inscrições</CardTitle>
                <CardDescription>Pagamentos confirmados vs. pendentes.</CardDescription>
                </CardHeader>
                <CardContent>
                <ChartContainer config={chartConfigTotal} className="min-h-[200px] w-full">
                    <BarChart accessibilityLayer data={totalData} layout="vertical">
                    <CartesianGrid horizontal={false} />
                    <YAxis
                        dataKey="name"
                        type="category"
                        tickLine={false}
                        axisLine={false}
                    />
                    <XAxis dataKey="confirmed" type="number" hide />
                    <Tooltip cursor={false} content={<ChartTooltipContent hideLabel />} />
                    <Bar dataKey="confirmed" layout="vertical" stackId="a" radius={4} fill="var(--color-confirmed)" />
                    <Bar dataKey="pending" layout="vertical" stackId="a" radius={4} fill="var(--color-pending)" />
                    <ChartLegend content={<ChartLegendContent />} />
                    </BarChart>
                </ChartContainer>
                </CardContent>
            </Card>
            
            <Card>
                <CardHeader>
                <CardTitle>Distribuição por Gênero</CardTitle>
                </CardHeader>
                <CardContent>
                    <ChartContainer config={chartConfigGender} className="min-h-[200px] w-full">
                        <PieChart>
                            <Tooltip content={<ChartTooltipContent nameKey="name" hideLabel />} />
                            <Pie data={stats.byGender} dataKey="value" nameKey="name" innerRadius={50} onClick={(_, index) => handleChartClick('gender', stats.byGender[index].name)}>
                                {stats.byGender.map((entry, index) => (
                                    <Cell key={`cell-${index}`} fill={(chartConfigGender[entry.name as keyof typeof chartConfigGender] as any)?.color ?? '#8884d8'} className="cursor-pointer" />
                                ))}
                            </Pie>
                            <ChartLegend content={<ChartLegendContent nameKey="name" />} />
                        </PieChart>
                    </ChartContainer>
                </CardContent>
            </Card>

             <Card>
                <CardHeader>
                <CardTitle>Forma de Pagamento</CardTitle>
                </CardHeader>
                <CardContent>
                    <ChartContainer config={chartConfigPayment} className="min-h-[200px] w-full">
                        <PieChart>
                            <Tooltip content={<ChartTooltipContent nameKey="name" hideLabel />} />
                            <Pie data={stats.byPaymentMethod} dataKey="value" nameKey="name" innerRadius={50} onClick={(_, index) => handleChartClick('paymentMethod', stats.byPaymentMethod[index].name)}>
                                {stats.byPaymentMethod.map((entry, index) => (
                                    <Cell key={`cell-${index}`} fill={(chartConfigPayment[entry.name as keyof typeof chartConfigPayment] as any)?.color ?? '#8884d8'} className="cursor-pointer" />
                                ))}
                            </Pie>
                            <ChartLegend content={<ChartLegendContent nameKey="name" />} />
                        </PieChart>
                    </ChartContainer>
                </CardContent>
            </Card>

            <Card>
                <CardHeader>
                <CardTitle>Autorização de Uso de Imagem</CardTitle>
                </CardHeader>
                <CardContent>
                    <ChartContainer config={chartConfigImageAuth} className="min-h-[200px] w-full">
                        <PieChart>
                            <Tooltip content={<ChartTooltipContent nameKey="name" hideLabel />} />
                            <Pie data={stats.byImageAuthorization} dataKey="value" nameKey="name" innerRadius={50} onClick={(_, index) => handleChartClick('imageAuthorization', stats.byImageAuthorization[index].name)}>
                                {stats.byImageAuthorization.map((entry, index) => (
                                    <Cell key={`cell-${index}`} fill={(chartConfigImageAuth[entry.name as keyof typeof chartConfigImageAuth] as any)?.color ?? '#8884d8'} className="cursor-pointer"/>
                                ))}
                            </Pie>
                            <ChartLegend content={<ChartLegendContent nameKey="name" />} />
                        </PieChart>
                    </ChartContainer>
                </CardContent>
            </Card>

            <Card>
                <CardHeader>
                <CardTitle>Tipo de Participação</CardTitle>
                </CardHeader>
                <CardContent>
                    <ChartContainer config={chartConfigParticipation} className="min-h-[200px] w-full">
                        <PieChart>
                            <Tooltip content={<ChartTooltipContent nameKey="name" hideLabel />} />
                            <Pie data={stats.byParticipationType} dataKey="value" nameKey="name" innerRadius={50} onClick={(_, index) => handleChartClick('participationType', stats.byParticipationType[index].name)}>
                                {stats.byParticipationType.map((entry, index) => (
                                    <Cell key={`cell-${index}`} fill={(chartConfigParticipation[entry.name as keyof typeof chartConfigParticipation] as any)?.color ?? '#8884d8'} className="cursor-pointer" />
                                ))}
                            </Pie>
                            <ChartLegend content={<ChartLegendContent nameKey="name" />} />
                        </PieChart>
                    </ChartContainer>
                </CardContent>
            </Card>

            <Card className="lg:col-span-2">
                <CardHeader>
                    <CardTitle>Distribuição por Idade</CardTitle>
                </CardHeader>
                <CardContent>
                    <ChartContainer config={chartConfigAge} className="min-h-[300px] w-full">
                        <BarChart data={stats.byAge} margin={{ top: 20 }} onClick={(e) => e && e.activeLabel && handleChartClick('age', e.activeLabel)}>
                            <CartesianGrid vertical={false} />
                            <XAxis 
                                dataKey="name" 
                                tickLine={false} 
                                axisLine={false} 
                                tickMargin={10}
                            />
                            <YAxis />
                            <Tooltip content={<ChartTooltipContent />} />
                            <Bar dataKey="value" radius={4} className="cursor-pointer">
                                {stats.byAge.map((entry) => (
                                    <Cell key={`cell-${entry.name}`} fill={(chartConfigAge[entry.name as keyof typeof chartConfigAge] as any)?.color ?? '#8884d8'} />
                                ))}
                            </Bar>
                        </BarChart>
                    </ChartContainer>
                </CardContent>
            </Card>
            
            <Card className="lg:col-span-2">
                <CardHeader>
                <CardTitle>Valores de Inscrição</CardTitle>
                </CardHeader>
                <CardContent>
                    <ChartContainer config={chartConfigValue} className="min-h-[300px] w-full">
                        <BarChart data={stats.byRegistrationValue} margin={{ top: 20 }} onClick={(e) => e && e.activeLabel && handleChartClick('registrationValue', e.activeLabel)}>
                            <CartesianGrid vertical={false} />
                            <XAxis 
                                dataKey="name" 
                                tickLine={false} 
                                axisLine={false} 
                                tickMargin={10}
                            />
                            <YAxis />
                            <Tooltip content={<ChartTooltipContent />} />
                            <Bar dataKey="value" radius={4} className="cursor-pointer">
                                {stats.byRegistrationValue.map((entry, index) => (
                                    <Cell key={`cell-${index}`} fill={(chartConfigValue[entry.name as keyof typeof chartConfigValue] as any)?.color ?? '#8884d8'} />
                                ))}
                            </Bar>
                        </BarChart>
                    </ChartContainer>
                </CardContent>
            </Card>

            <Card className="lg:col-span-2">
                <CardHeader>
                <CardTitle>Tamanhos de Camisa</CardTitle>
                </CardHeader>
                <CardContent>
                    <ChartContainer config={chartConfigShirts} className="min-h-[300px] w-full">
                        <BarChart data={stats.byShirtSize} margin={{ top: 20 }} onClick={(e) => e && e.activeLabel && handleChartClick('shirtSize', e.activeLabel)}>
                            <CartesianGrid vertical={false} />
                             <XAxis 
                                dataKey="name" 
                                tickLine={false} 
                                axisLine={false} 
                                tickMargin={10}
                            />
                            <YAxis />
                            <Tooltip content={<ChartTooltipContent />} />
                            <Bar dataKey="value" radius={4} className="cursor-pointer">
                                {stats.byShirtSize.map((entry, index) => (
                                    <Cell key={`cell-${index}`} fill={(chartConfigShirts[entry.name as keyof typeof chartConfigShirts] as any)?.color ?? '#8884d8'} />
                                ))}
                            </Bar>
                        </BarChart>
                    </ChartContainer>
                </CardContent>
            </Card>
        </div>
    </div>
  )
}

    
// Trigger commit
