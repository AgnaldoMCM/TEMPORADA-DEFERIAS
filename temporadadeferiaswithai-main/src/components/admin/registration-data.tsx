

"use client";

import { useState, useMemo, useTransition, Fragment } from "react";
import * as XLSX from "xlsx";
import { format } from "date-fns";
import { formatInTimeZone } from "date-fns-tz";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
  DropdownMenuGroup,
  DropdownMenuSub,
  DropdownMenuSubContent,
  DropdownMenuSubTrigger,
  DropdownMenuPortal,

} from "@/components/ui/dropdown-menu"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import type { Registration, PaidInstallment } from "@/lib/types";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "../ui/button";
import { X, FileSpreadsheet, Sparkles, Loader2, ChevronDown, Check, UploadCloud, BadgeCheck, CircleDollarSign, Filter, Database, Heart } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { RegistrationDetailsModal } from "./registration-details-modal";
import { updateCarnetPaymentStatus, syncAllRegistrationsToSheet, updateAdopteeStatus } from "@/app/actions";


interface RegistrationDataProps {
    initialData: Registration[];
}

type PaymentStatusFilter = "all" | "confirmed" | "pending";
type GenderFilter = "all" | "male" | "female";
type ParticipationFilter = "all" | "member" | "guest" | "congregation";
type ShirtSizeFilter = "all" | "P" | "M" | "G" | "GG" | "XG";
type MedicalAlertFilter = "all" | "dietary" | "medical_condition" | "treatment" | "physical_limitations" | "psychological_monitoring";
type AdopteeFilter = "all" | "adoptee_only";
type SortOption = "createdAt_desc" | "createdAt_asc" | "name_asc" | "name_desc";

interface PaymentModalState {
    isOpen: boolean;
    registration: Registration | null;
    installmentNumber: number | null;
    currentAmount: number;
}

export default function RegistrationData({ initialData: initialDataProp }: RegistrationDataProps) {
  const { toast } = useToast();
  const [initialData, setInitialData] = useState(initialDataProp);
  const [registrations, setRegistrations] = useState(initialDataProp);
  const [searchTerm, setSearchTerm] = useState("");
  const [paymentStatus, setPaymentStatus] = useState<PaymentStatusFilter>("all");
  const [gender, setGender] = useState<GenderFilter>("all");
  const [ageFilter, setAgeFilter] = useState<string>("");
  const [participationType, setParticipationType] = useState<ParticipationFilter>("all");
  const [shirtSize, setShirtSize] = useState<ShirtSizeFilter>("all");
  const [medicalAlert, setMedicalAlert] = useState<MedicalAlertFilter>("all");
  const [adopteeFilter, setAdopteeFilter] = useState<AdopteeFilter>("all");
  const [sortOption, setSortOption] = useState<SortOption>("createdAt_desc");
  const [selectedRegistration, setSelectedRegistration] = useState<Registration | null>(null);
  const [isTransitioning, startTransition] = useTransition();
  const [isSyncing, startSyncTransition] = useTransition();
  
  const [paymentModal, setPaymentModal] = useState<PaymentModalState>({
      isOpen: false,
      registration: null,
      installmentNumber: null,
      currentAmount: 0,
  });

  const filteredData = useMemo(() => {
    return registrations.filter(reg => {
      const matchesSearch = searchTerm.trim() === '' ||
          reg.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
          reg.email.toLowerCase().includes(searchTerm.toLowerCase());
      
      const matchesPayment = paymentStatus === 'all' || (paymentStatus === 'confirmed' && reg.paymentConfirmed) || (paymentStatus === 'pending' && !reg.paymentConfirmed);
      const matchesGender = gender === 'all' || reg.details?.teenGender === gender;
      const matchesAge = !ageFilter || (reg.details?.teenAge ? reg.details.teenAge.toString() === ageFilter : false);
      const matchesParticipation = participationType === 'all' || reg.details?.participationType === participationType;
      const matchesShirtSize = shirtSize === 'all' || reg.details?.shirtSize === shirtSize;
      const matchesMedicalAlert = medicalAlert === 'all' ||
        (medicalAlert === 'dietary' && reg.details?.hasDietaryRestrictions === 'yes') ||
        (medicalAlert === 'medical_condition' && reg.details?.hasMedicalCondition === 'yes') ||
        (medicalAlert === 'treatment' && reg.details?.isUnderTreatment === 'yes') ||
        (medicalAlert === 'psychological_monitoring' && reg.details?.hasPsychologicalMonitoring === 'yes') ||
        (medicalAlert === 'physical_limitations' && reg.details?.canDoPhysicalActivities === 'no');
      const matchesAdoptee = adopteeFilter === 'all' || (adopteeFilter === 'adoptee_only' && reg.isAdoptee);

      return matchesSearch && matchesPayment && matchesGender && matchesAge && matchesParticipation && matchesShirtSize && matchesMedicalAlert && matchesAdoptee;
    }).sort((a, b) => {
      switch (sortOption) {
        case "name_asc":
          return a.name.localeCompare(b.name);
        case "name_desc":
          return b.name.localeCompare(a.name);
        case "createdAt_asc":
          return new Date(a.createdAt as string).getTime() - new Date(b.createdAt as string).getTime();
        case "createdAt_desc":
        default:
          return new Date(b.createdAt as string).getTime() - new Date(a.createdAt as string).getTime();
      }
    });
  }, [registrations, searchTerm, paymentStatus, gender, ageFilter, participationType, shirtSize, medicalAlert, adopteeFilter, sortOption]);


  // Função otimizada para atualizar o estado
  const handleUpdateRegistrationState = (registrationId: string, updates: Partial<Registration>) => {
    const updater = (prev: Registration[]) =>
        prev.map(reg => reg.id === registrationId ? { ...reg, ...updates } : reg);
    
    setRegistrations(updater);
    setInitialData(updater);

    if (selectedRegistration && selectedRegistration.id === registrationId) {
        setSelectedRegistration(prev => prev ? { ...prev, ...updates } : null);
    }
  };


  const handleOpenPaymentModal = (reg: Registration, installment: number) => {
      const existingPayment = reg.paymentDetails?.paidInstallments?.find(p => p.installment === installment);
      setPaymentModal({
          isOpen: true,
          registration: reg,
          installmentNumber: installment,
          currentAmount: existingPayment?.amount || 0
      });
  }

  const handleClosePaymentModal = () => {
       setPaymentModal({ isOpen: false, registration: null, installmentNumber: null, currentAmount: 0 });
  }

  const handleSubmitPaymentModal = () => {
      const { registration, installmentNumber, currentAmount } = paymentModal;
      if (!registration || installmentNumber === null || currentAmount <= 0) {
           toast({ title: "Erro", description: "O valor da parcela deve ser maior que zero.", variant: "destructive" });
           return;
      }
      
      startTransition(async () => {
        const result = await updateCarnetPaymentStatus(registration.id, installmentNumber, currentAmount);
        if (result.success) {
            let paidInstallments = [...(registration.paymentDetails?.paidInstallments || [])];
            const existingIndex = paidInstallments.findIndex(p => p.installment === installmentNumber);
            if (existingIndex > -1) {
              paidInstallments[existingIndex] = { installment: installmentNumber, amount: currentAmount, date: new Date().toISOString(), confirmedBy: 'admin' };
            } else {
              paidInstallments.push({ installment: installmentNumber, amount: currentAmount, date: new Date().toISOString(), confirmedBy: 'admin' });
            }
            const totalPaid = paidInstallments.reduce((sum, p) => sum + p.amount, 0);

            handleUpdateRegistrationState(registration.id, {
              paymentDetails: {
                ...registration.paymentDetails!,
                paidInstallments,
                totalPaid,
              }
            });

            toast({ title: "Sucesso!", description: "Pagamento de parcela atualizado.", className: "bg-green-500 text-white" });
        } else {
            toast({ title: "Erro", description: result.message, variant: "destructive" });
        }
        handleClosePaymentModal();
      });
  }


  const handleFinalizePayment = (registration: Registration) => {
    const totalInstallments = registration.paymentDetails?.installmentsTotal || 3;
    const lastInstallment = registration.paymentDetails?.paidInstallments?.find(p => p.installment === totalInstallments);
    
    if (!lastInstallment) {
        toast({ title: "Atenção", description: `É necessário registrar o pagamento da última parcela (${totalInstallments}) antes de finalizar.`, variant: "destructive" });
        return;
    }

    startTransition(async () => {
      const result = await updateCarnetPaymentStatus(registration.id, lastInstallment.installment, lastInstallment.amount, true);
      if (result.success) {
        handleUpdateRegistrationState(registration.id, { paymentConfirmed: true, paidAt: new Date().toISOString() });
        toast({ title: "Sucesso!", description: "Pagamento finalizado com sucesso.", className: "bg-green-500 text-white" });
      } else {
        toast({ title: "Erro", description: result.message, variant: "destructive" });
      }
    });
  };

  const handleConfirmPayment = (registration: Registration) => {
      const registrationValue = parseFloat(registration.details?.registrationValue || '0');
       if (registrationValue <= 0) {
        toast({ title: "Erro", description: "Valor da inscrição não definido. Não é possível confirmar o pagamento.", variant: "destructive" });
        return;
      }
      startTransition(async () => {
        const result = await updateCarnetPaymentStatus(registration.id, 1, registrationValue, true);
         if (result.success) {
            handleUpdateRegistrationState(registration.id, { 
                paymentConfirmed: true, 
                paidAt: new Date().toISOString(),
                paymentDetails: {
                    ...registration.paymentDetails!,
                    paidInstallments: [{ installment: 1, amount: registrationValue, date: new Date().toISOString(), confirmedBy: 'admin' }],
                    totalPaid: registrationValue,
                }
            });
            toast({ title: "Sucesso!", description: "Pagamento confirmado com sucesso.", className: "bg-green-500 text-white" });
        } else {
            toast({ title: "Erro", description: result.message, variant: "destructive" });
        }
      });
  }


  const handleManualSync = () => {
    startSyncTransition(async () => {
        const result = await syncAllRegistrationsToSheet();
        if (result.success) {
            toast({
                title: "Sincronização Concluída",
                description: result.message,
                className: "bg-green-500 text-white",
            });
        } else {
            toast({
                title: "Erro na Sincronização",
                description: result.message,
                variant: "destructive",
            });
        }
    });
  };

  const handleToggleAdoptee = (registration: Registration) => {
    const newStatus = !registration.isAdoptee;
    startTransition(async () => {
      const result = await updateAdopteeStatus(registration.id, newStatus);
      if (result.success) {
        handleUpdateRegistrationState(registration.id, { isAdoptee: newStatus });
        toast({ title: "Sucesso!", description: result.message, className: "bg-blue-500 text-white" });
      } else {
        toast({ title: "Erro", description: result.message, variant: "destructive" });
      }
    });
  };

  const totalConfirmed = useMemo(() => {
    return initialData.filter(reg => reg.paymentConfirmed).length;
  }, [initialData]);

  const generateExcel = (data: any[], sheetName: string, fileName: string) => {
    const ws = XLSX.utils.json_to_sheet(data, { skipHeader: false });
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, sheetName);
    XLSX.writeFile(wb, fileName);
  };
  
  const handleJsonBackup = () => {
    const dataStr = JSON.stringify(initialData, null, 2);
    const dataUri = 'data:application/json;charset=utf-8,'+ encodeURIComponent(dataStr);
    
    const exportFileDefaultName = `backup_tf2k26_registrations_${format(new Date(), 'yyyy-MM-dd')}.json`;

    const linkElement = document.createElement('a');
    linkElement.setAttribute('href', dataUri);
    linkElement.setAttribute('download', exportFileDefaultName);
    linkElement.click();
  };


  const handleExport = (alphabetical = false) => {
    const dataToProcess = alphabetical ? [...filteredData].sort((a, b) => a.name.localeCompare(b.name)) : filteredData;

    const participationTypeMap: { [key: string]: string } = {
        member: 'Membro IPManaus',
        guest: 'Convidado',
        congregation: 'Congregação',
    };
    
    const paymentMethodMap: { [key: string]: string } = {
        presencial: 'Presencial - À vista',
        carne: 'Carnê-Parcelamento',
        pix: 'PIX'
    };

    const dataToExport = dataToProcess.map(reg => {
      const paymentHistory = reg.paymentDetails?.paidInstallments?.map(
          (p: PaidInstallment) => `P${p.installment}: R$${p.amount.toFixed(2)} em ${formatInTimeZone(new Date(p.date), "America/Manaus", "dd/MM/yy")}`
      ).join('; ') || '';
      
      return {
        "ID": reg.id,
        "Status Pagamento": reg.paymentConfirmed ? "Confirmado" : "Pendente",
        "É Adotante": reg.isAdoptee ? "Sim" : "Não",
        "Data Inscrição": reg.createdAt ? formatInTimeZone(new Date(reg.createdAt), "America/Manaus", "dd/MM/yyyy HH:mm:ss") : "N/A",
        "Data Pagamento Final": reg.paidAt ? formatInTimeZone(new Date(reg.paidAt), "America/Manaus", "dd/MM/yyyy HH:mm") : "N/A",
        
        "Nome Completo": reg.name,
        "Idade": reg.details?.teenAge,
        "Gênero": reg.details?.teenGender === 'female' ? 'Feminino' : 'Masculino',
        "Telefone Adolescente": reg.phone,
        "Tamanho Camisa": reg.details?.shirtSize,
        "Tipo de Participação": reg.details?.participationType ? participationTypeMap[reg.details.participationType] : 'N/A',
        "Nome Congregação": reg.details?.congregationName || 'N/A',
        "Transporte": reg.details?.transportation === 'bus' ? 'Ônibus' : 'Carro',
        
        "Nome Responsável": reg.details?.guardianName,
        "Email Responsável": reg.email,
        "Telefone Responsável": reg.details?.guardianPhone,

        "Valor Inscrição": `R$ ${reg.details?.registrationValue}`,
        "Forma de Pagamento": paymentMethodMap[reg.paymentDetails?.method || 'carne'],
        "Valor Total Pago": reg.paymentDetails?.totalPaid?.toFixed(2).replace('.', ',') || '0,00',
        "Histórico de Pagamentos": paymentHistory,

        "Tipo Sanguíneo": reg.details?.bloodType,
        "Peso e Altura": reg.details?.teenWeightAndHeight,
        "Pode Fazer Atividades Físicas": reg.details?.canDoPhysicalActivities === 'yes' ? 'Sim' : 'Não',
        "Possui Convênio": reg.details?.hasMedicalInsurance === 'yes' ? 'Sim' : 'Não',
        "Nome Convênio": reg.details?.medicalInsuranceName || 'N/A',
        "Restrição Médica": reg.details?.hasMedicalCondition === 'yes' ? 'Sim' : 'Não',
        "Descrição Restrição Médica": reg.details?.medicalConditionDescription || 'N/A',
        "Em Tratamento": reg.details?.isUnderTreatment === 'yes' ? 'Sim' : 'Não',
        "Descrição Tratamento": reg.details?.treatmentDescription || 'N/A',
        "Acompanhamento Médico": reg.details?.hasMedicalMonitoring === 'yes' ? 'Sim' : 'Não',
        "Motivo Acompanhamento Médico": reg.details?.medicalMonitoringReason || 'N/A',
        "Acompanhamento Psicológico": reg.details?.hasPsychologicalMonitoring === 'yes' ? 'Sim' : 'Não',
        "Motivo Acompanhamento Psicológico": reg.details?.psychologicalMonitoringReason || 'N/A',
        "Restrição Alimentar": reg.details?.hasDietaryRestrictions === 'yes' ? 'Sim' : 'Não',
        "Descrição Restrição Alimentar": reg.details?.dietaryRestrictionsDescription || 'N/A',
        
        "Ciente Eletrônicos": reg.details?.electronicsAware ? 'Sim' : 'Não',
        "Ciente Política Camisa": reg.details?.shirtPolicyAgreement ? 'Sim' : 'Não',
        "Acordo Política Reembolso": reg.details?.refundPolicyAgreement ? 'Sim' : 'Não',
        "Acordo Autorização Responsável": reg.details?.guardianAuthorizationAgreement ? 'Sim' : 'Não',
        "Autorização de Imagem": reg.details?.imageAndVoiceAuthorization === 'authorized' ? 'Autorizado' : 'Não Autorizado',
      }
    });
    
    const fileName = alphabetical ? "Inscricoes_Completo_Ordem_Alfabetica.xlsx" : "Inscricoes_Completo.xlsx";
    generateExcel(dataToExport, "Inscricoes", fileName);
  };

  const handleSimpleExport = (alphabetical = false) => {
    const dataToProcess = alphabetical ? [...filteredData].sort((a, b) => a.name.localeCompare(b.name)) : filteredData;
    const dataToExport = dataToProcess.map(reg => ({ "Nome Completo": reg.name }));
    const fileName = alphabetical ? "Lista_Nomes_Ordem_Alfabetica.xlsx" : "Lista_Nomes.xlsx";
    generateExcel(dataToExport, "ListaDeNomes", fileName);
  };
  
  if (!initialData || initialData.length === 0) {
    return (
        <div className="text-center p-8">
            <p>Nenhuma inscrição encontrada ainda.</p>
        </div>
    );
  }

  return (
    <>
      <RegistrationDetailsModal
          registration={selectedRegistration}
          isOpen={!!selectedRegistration}
          onClose={() => setSelectedRegistration(null)}
      />

      <Dialog open={paymentModal.isOpen} onOpenChange={handleClosePaymentModal}>
          <DialogContent>
              <DialogHeader>
                  <DialogTitle>Registrar Pagamento de Parcela</DialogTitle>
                  <DialogDescription>
                      Insira o valor pago para a parcela {paymentModal.installmentNumber}.
                  </DialogDescription>
              </DialogHeader>
              <div className="py-4 space-y-2">
                  <Label htmlFor="installmentAmount">Valor da Parcela (R$)</Label>
                  <Input
                      id="installmentAmount"
                      type="number"
                      placeholder="Ex: 100.00"
                      value={paymentModal.currentAmount || ''}
                      onChange={(e) => setPaymentModal(prev => ({ ...prev, currentAmount: parseFloat(e.target.value) || 0 }))}
                  />
              </div>
              <DialogFooter>
                  <Button variant="outline" onClick={handleClosePaymentModal}>Cancelar</Button>
                  <Button onClick={handleSubmitPaymentModal} disabled={isTransitioning || paymentModal.currentAmount <= 0}>
                       {isTransitioning ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <CircleDollarSign className="mr-2 h-4 w-4" />}
                       Salvar Pagamento
                  </Button>
              </DialogFooter>
          </DialogContent>
      </Dialog>
      
      <div className="space-y-4 p-4 border rounded-lg bg-muted/50 mb-6">
          <div className="space-y-4">
              <div>
                  <Label htmlFor="search" className="font-semibold">
                      Busca Rápida
                  </Label>
                  <div className="relative mt-1">
                      <Input
                          id="search"
                          placeholder="Busque por nome ou email..."
                          value={searchTerm}
                          onChange={(e) => setSearchTerm(e.target.value)}
                      />
                      {searchTerm && (
                          <Button
                              variant="ghost" size="icon" type="button"
                              className="absolute right-1 top-1/2 -translate-y-1/2 h-7 w-7"
                              onClick={() => setSearchTerm('')}
                          >
                              <X className="h-4 w-4" />
                          </Button>
                      )}
                  </div>
              </div>

            <div className="flex flex-wrap gap-2 justify-between items-center">
                 <div>
                    <Label htmlFor="sort" className="font-semibold text-sm">Ordenar por</Label>
                    <Select value={sortOption} onValueChange={(value) => setSortOption(value as SortOption)}>
                        <SelectTrigger id="sort" className="mt-1 w-full sm:w-auto">
                            <SelectValue placeholder="Ordenar por..." />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="createdAt_desc">Mais Recentes</SelectItem>
                            <SelectItem value="createdAt_asc">Mais Antigos</SelectItem>
                            <SelectItem value="name_asc">Nome (A-Z)</SelectItem>
                            <SelectItem value="name_desc">Nome (Z-A)</SelectItem>
                        </SelectContent>
                    </Select>
                </div>

                <div className="flex items-center gap-2 flex-wrap">
                     <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                            <Button variant="outline">
                                <Filter className="mr-2 h-4 w-4" />
                                Filtros
                            </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent className="w-56" align="end">
                            <DropdownMenuLabel>Filtrar Por</DropdownMenuLabel>
                            <DropdownMenuSeparator />
                             <div className="px-2 py-1.5">
                                <Label htmlFor="age-filter" className="text-sm font-medium">Idade</Label>
                                <Input
                                    id="age-filter"
                                    type="number"
                                    placeholder="Ex: 15"
                                    value={ageFilter}
                                    onChange={(e) => setAgeFilter(e.target.value)}
                                    className="mt-1 h-8"
                                    onClick={(e) => e.stopPropagation()} // Impede o menu de fechar
                                />
                            </div>
                            <DropdownMenuSeparator />
                            <DropdownMenuSub>
                                <DropdownMenuSubTrigger>Status</DropdownMenuSubTrigger>
                                <DropdownMenuPortal>
                                <DropdownMenuSubContent>
                                    <DropdownMenuItem onClick={() => setPaymentStatus('all')}>Todos Pagamentos</DropdownMenuItem>
                                    <DropdownMenuItem onClick={() => setPaymentStatus('confirmed')}>Pag. Confirmado</DropdownMenuItem>
                                    <DropdownMenuItem onClick={() => setPaymentStatus('pending')}>Pag. Pendente</DropdownMenuItem>
                                    <DropdownMenuSeparator />
                                    <DropdownMenuItem onClick={() => setAdopteeFilter('all')}>Todos (Adote)</DropdownMenuItem>
                                    <DropdownMenuItem onClick={() => setAdopteeFilter('adoptee_only')}>Apenas Adotantes</DropdownMenuItem>
                                </DropdownMenuSubContent>
                                </DropdownMenuPortal>
                            </DropdownMenuSub>
                             <DropdownMenuSub>
                                <DropdownMenuSubTrigger>Gênero</DropdownMenuSubTrigger>
                                <DropdownMenuPortal>
                                <DropdownMenuSubContent>
                                    <DropdownMenuItem onClick={() => setGender('all')}>Todos</DropdownMenuItem>
                                    <DropdownMenuItem onClick={() => setGender('male')}>Masculino</DropdownMenuItem>
                                    <DropdownMenuItem onClick={() => setGender('female')}>Feminino</DropdownMenuItem>
                                </DropdownMenuSubContent>
                                </DropdownMenuPortal>
                            </DropdownMenuSub>
                            <DropdownMenuSub>
                                <DropdownMenuSubTrigger>Tipo de Vaga</DropdownMenuSubTrigger>
                                <DropdownMenuPortal>
                                <DropdownMenuSubContent>
                                    <DropdownMenuItem onClick={() => setParticipationType('all')}>Todos</DropdownMenuItem>
                                    <DropdownMenuItem onClick={() => setParticipationType('member')}>Membro IPManaus</DropdownMenuItem>
                                    <DropdownMenuItem onClick={() => setParticipationType('guest')}>Convidado</DropdownMenuItem>
                                    <DropdownMenuItem onClick={() => setParticipationType('congregation')}>Congregação</DropdownMenuItem>
                                </DropdownMenuSubContent>
                                </DropdownMenuPortal>
                            </DropdownMenuSub>
                             <DropdownMenuSub>
                                <DropdownMenuSubTrigger>Camisa</DropdownMenuSubTrigger>
                                <DropdownMenuPortal>
                                <DropdownMenuSubContent>
                                    <DropdownMenuItem onClick={() => setShirtSize('all')}>Todos</DropdownMenuItem>
                                    <DropdownMenuItem onClick={() => setShirtSize('P')}>P</DropdownMenuItem>
                                    <DropdownMenuItem onClick={() => setShirtSize('M')}>M</DropdownMenuItem>
                                    <DropdownMenuItem onClick={() => setShirtSize('G')}>G</DropdownMenuItem>
                                    <DropdownMenuItem onClick={() => setShirtSize('GG')}>GG</DropdownMenuItem>
                                    <DropdownMenuItem onClick={() => setShirtSize('XG')}>XG</DropdownMenuItem>
                                </DropdownMenuSubContent>
                                </DropdownMenuPortal>
                            </DropdownMenuSub>
                             <DropdownMenuSub>
                                <DropdownMenuSubTrigger>Alertas Médicos</DropdownMenuSubTrigger>
                                <DropdownMenuPortal>
                                <DropdownMenuSubContent>
                                    <DropdownMenuItem onClick={() => setMedicalAlert('all')}>Todos</DropdownMenuItem>
                                    <DropdownMenuItem onClick={() => setMedicalAlert('dietary')}>Restrição Alimentar</DropdownMenuItem>
                                    <DropdownMenuItem onClick={() => setMedicalAlert('medical_condition')}>Condição Médica</DropdownMenuItem>
                                    <DropdownMenuItem onClick={() => setMedicalAlert('treatment')}>Em Tratamento</DropdownMenuItem>
                                    <DropdownMenuItem onClick={() => setMedicalAlert('physical_limitations')}>Limitação Física</DropdownMenuItem>
                                    <DropdownMenuItem onClick={() => setMedicalAlert('psychological_monitoring')}>Acomp. Psicológico</DropdownMenuItem>
                                </DropdownMenuSubContent>
                                </DropdownMenuPortal>
                            </DropdownMenuSub>
                        </DropdownMenuContent>
                    </DropdownMenu>

                     <Button size="sm" onClick={handleManualSync} disabled={isSyncing} variant="outline" className="hidden sm:flex">
                        {isSyncing ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <UploadCloud className="mr-2 h-4 w-4" />}
                        {isSyncing ? "Sincronizando..." : "Sincronizar Planilha"}
                    </Button>
                    <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                            <Button variant="outline" size="sm" disabled={filteredData.length === 0}>
                                <FileSpreadsheet className="mr-2 h-4 w-4" />
                                Exportar
                                <ChevronDown className="ml-2 h-4 w-4" />
                            </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent>
                            <DropdownMenuLabel>Exportar para Excel</DropdownMenuLabel>
                            <DropdownMenuItem onClick={() => handleExport(false)}>Por Data de Inscrição</DropdownMenuItem>
                            <DropdownMenuItem onClick={() => handleExport(true)}>Por Ordem Alfabética</DropdownMenuItem>
                            <DropdownMenuSeparator />
                            <DropdownMenuLabel>Exportar Apenas Nomes</DropdownMenuLabel>
                            <DropdownMenuItem onClick={() => handleSimpleExport(false)}>Por Data de Inscrição</DropdownMenuItem>
                            <DropdownMenuItem onClick={() => handleSimpleExport(true)}>Por Ordem Alfabética</DropdownMenuItem>
                             <DropdownMenuSeparator />
                            <DropdownMenuLabel>Sistema de Backup</DropdownMenuLabel>
                            <DropdownMenuItem onClick={handleJsonBackup}>
                                <Database className="mr-2 h-4 w-4" />
                                Backup Completo (JSON)
                            </DropdownMenuItem>
                        </DropdownMenuContent>
                    </DropdownMenu>
                </div>
            </div>
          </div>
      </div>

      <div className="mb-4 text-sm text-muted-foreground flex justify-between items-center">
          <span>
              Mostrando <strong>{filteredData.length}</strong> de <strong>{initialData.length}</strong> inscrições.
          </span>
          <span className="font-semibold text-green-600">
              Total de Vagas Preenchidas: {totalConfirmed}
          </span>
      </div>

      <div className="border rounded-md overflow-x-auto">
          <Table>
              <TableHeader>
              <TableRow>
                  <TableHead>Nome</TableHead>
                  <TableHead className="hidden sm:table-cell">Email</TableHead>
                  <TableHead>Pagamento</TableHead>
                  <TableHead className="hidden md:table-cell">Data de Inscrição</TableHead>
                  <TableHead className="text-right">Ações</TableHead>
              </TableRow>
              </TableHeader>
              <TableBody>
                {filteredData.length > 0 ? (
                  filteredData.map((reg) => {
                    const paidInstallments = reg.paymentDetails?.paidInstallments || [];
                    const totalPaid = reg.paymentDetails?.totalPaid || 0;
                    const registrationValue = reg.details?.registrationValue || '0';
                    const totalInstallments = reg.paymentDetails?.installmentsTotal ?? (reg.paymentDetails?.method === 'carne' ? 3 : 1);
                    const isCarne = reg.paymentDetails?.method === 'carne';
                    const isPresencial = reg.paymentDetails?.method === 'presencial';
                    const isPix = reg.paymentDetails?.method === 'pix';
                    
                    return (
                      <TableRow 
                          key={reg.id}
                          onClick={() => setSelectedRegistration(reg)}
                          className="cursor-pointer"
                      >
                        <TableCell className="font-medium whitespace-nowrap">
                            <div className="flex items-center gap-2">
                                {reg.isAdoptee && <Heart className="h-4 w-4 text-pink-500 flex-shrink-0" title="Participante do programa Adote"/>}
                                {reg.name}
                            </div>
                        </TableCell>
                        <TableCell className="hidden sm:table-cell">{reg.email}</TableCell>
                        <TableCell>
                          <Badge variant={reg.paymentConfirmed ? "default" : "destructive"} className={reg.paymentConfirmed ? "bg-green-500 hover:bg-green-600" : ""}>
                            {reg.paymentConfirmed ? "Confirmado" : `Pendente ${isCarne ? `(${paidInstallments.length}/${totalInstallments})` : ''}`}
                          </Badge>
                           <p className="text-xs text-muted-foreground mt-1">
                              R$ {totalPaid.toFixed(2)} / R$ {registrationValue}
                          </p>
                        </TableCell>
                        <TableCell className="text-xs text-muted-foreground whitespace-nowrap hidden md:table-cell">
                          {reg.createdAt ? formatInTimeZone(new Date(reg.createdAt), "America/Manaus", "dd/MM/yyyy HH:mm") : 'N/A'}
                        </TableCell>
                        <TableCell className="text-right">
                           <DropdownMenu>
                              <DropdownMenuTrigger asChild>
                                  <Button 
                                      size="sm" 
                                      variant="ghost" 
                                      onClick={(e) => e.stopPropagation()} 
                                      disabled={isTransitioning}
                                      className="h-8"
                                  >
                                      {isTransitioning ? <Loader2 className="h-4 w-4 animate-spin" /> : "Ações"}
                                      <ChevronDown className="ml-2 h-4 w-4" />
                                  </Button>
                              </DropdownMenuTrigger>
                              <DropdownMenuContent align="end" onClick={(e) => e.stopPropagation()}>
                                  <DropdownMenuLabel>Ações da Inscrição</DropdownMenuLabel>
                                  <DropdownMenuSeparator />
                                   <DropdownMenuItem onClick={() => handleToggleAdoptee(reg)}>
                                        <Heart className="mr-2 h-4 w-4" />
                                        {reg.isAdoptee ? 'Remover marcação de Adotante' : 'Marcar como Adotante'}
                                    </DropdownMenuItem>
                                    <DropdownMenuSeparator />
                                  {isCarne && !reg.paymentConfirmed && (
                                    <>
                                      <DropdownMenuSub>
                                          <DropdownMenuSubTrigger>Atualizar Carnê</DropdownMenuSubTrigger>
                                          <DropdownMenuPortal>
                                              <DropdownMenuSubContent>
                                                  {Array.from({ length: totalInstallments }, (_, i) => i + 1).map((num) => {
                                                      const isPaid = paidInstallments.some(p => p.installment === num);
                                                      return (
                                                          <DropdownMenuItem 
                                                              key={num} 
                                                              disabled={isTransitioning}
                                                              onClick={() => handleOpenPaymentModal(reg, num)}
                                                          >
                                                              <span className="flex-1">{isPaid ? `Editar` : `Marcar`} Parcela {num}</span>
                                                              {isPaid && <Check className="h-4 w-4 text-green-500 ml-2" />}
                                                          </DropdownMenuItem>
                                                      );
                                                  })}
                                              </DropdownMenuSubContent>
                                          </DropdownMenuPortal>
                                      </DropdownMenuSub>
                                      <DropdownMenuItem 
                                          className="font-semibold text-green-600 focus:bg-green-100 focus:text-green-700"
                                          disabled={isTransitioning}
                                          onClick={() => handleFinalizePayment(reg)}
                                      >
                                          <BadgeCheck className="mr-2 h-4 w-4" />
                                          Confirmar Pagamento (Finalizar)
                                      </DropdownMenuItem>
                                      <DropdownMenuSeparator />
                                    </>
                                  )}
                                  {(isPresencial || isPix) && !reg.paymentConfirmed && (
                                    <>
                                      <DropdownMenuItem onClick={() => handleConfirmPayment(reg)} disabled={isTransitioning}>
                                        <Check className="mr-2 h-4 w-4"/>Confirmar Pagamento
                                      </DropdownMenuItem>
                                      <DropdownMenuSeparator />
                                    </>
                                  )}
                                  <DropdownMenuItem onClick={() => setSelectedRegistration(reg)}>
                                    Ver Detalhes
                                  </DropdownMenuItem>
                              </DropdownMenuContent>
                          </DropdownMenu>
                        </TableCell>
                      </TableRow>
                    )
                  })
              ) : (
                  <TableRow>
                      <TableCell colSpan={5} className="h-24 text-center">
                          Nenhum resultado encontrado para os filtros aplicados.
                      </TableCell>
                  </TableRow>
              )}
              </TableBody>
          </Table>
      </div>
    </>
  );
}

    
// Trigger commit
