

"use client";

import type { Registration, PaidInstallment, SignUpData } from "@/lib/types";
import { format, formatInTimeZone } from "date-fns-tz";
import { useToast } from "@/hooks/use-toast";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { ScrollArea } from "@/components/ui/scroll-area";
import { User, HeartPulse, Shield, FileText, CircleDollarSign, Check, X, UserCog, Undo2, Sparkles, Loader2, Heart } from "lucide-react";
import { useEffect, useState, useTransition } from "react";

interface RegistrationDetailsModalProps {
  registration: Registration | null;
  isOpen: boolean;
  onClose: () => void;
}

function DetailItem({ label, value, subValue }: { label: string; value: React.ReactNode, subValue?: string | null }) {
    if (value === null || value === undefined || value === '' || value === 'N/A' || value === 'Não') return null;
    
    // Se o valor for "Sim", podemos mostrar um check verde
    if (value === 'Sim') {
        return (
             <div className="flex items-start gap-2">
                <p className="text-sm font-semibold text-muted-foreground">{label}:</p>
                <Check className="h-5 w-5 text-green-500 flex-shrink-0" />
            </div>
        )
    }

    return (
        <div>
            <p className="text-sm font-semibold text-muted-foreground">{label}</p>
            <p className="text-base">{value}</p>
            {subValue && (
                <p className="text-xs text-muted-foreground/80 flex items-center gap-1.5 mt-1">
                    <UserCog size={12} /> {subValue}
                </p>
            )}
        </div>
    );
}

function DetailBoolean({ label, value }: { label: string; value: boolean | undefined }) {
     if (value === undefined) return null;
    return (
        <div className="flex items-center gap-2">
             <p className="text-sm font-semibold text-muted-foreground">{label}:</p>
             {value ? <Check className="h-5 w-5 text-green-500" /> : <X className="h-5 w-5 text-destructive" />}
        </div>
    );
}


export function RegistrationDetailsModal({
  registration,
  isOpen,
  onClose,
}: RegistrationDetailsModalProps) {
  const { toast } = useToast();
  const [summary, setSummary] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  // Limpa o resumo quando o modal é fechado ou o participante muda
  useEffect(() => {
    if (!isOpen) {
      setSummary(null);
    }
  }, [isOpen]);

  if (!registration || !registration.details) return null;

  const { details, paymentDetails } = registration;
  const paidInstallments = paymentDetails?.paidInstallments || [];

  const participationTypeMap: { [key: string]: string } = {
    member: 'Membro IPManaus',
    guest: 'Convidado',
    congregation: 'Congregação',
  };

  const paymentMethodMap: { [key: string]: string } = {
      presencial: 'Presencial - À vista',
      carne: 'Carnê-Parcelamento',
      pix: 'PIX'
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-3xl">
        <DialogHeader>
          <DialogTitle className="text-2xl font-headline flex items-center gap-2">
            <User />
            {registration.name}
            {registration.isAdoptee && <Badge variant="secondary" className="bg-pink-100 text-pink-700 border-pink-200"><Heart className="h-4 w-4 mr-1.5"/>Adotante</Badge>}
          </DialogTitle>
          <DialogDescription>
            Informações completas da inscrição.
          </DialogDescription>
        </DialogHeader>
        
        <ScrollArea className="max-h-[65vh] pr-4">
            <div className="space-y-6 py-4">
                 <div className="p-4 bg-muted/50 rounded-lg grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                        <p className="text-sm font-semibold">Status do Pagamento</p>
                        <Badge variant={registration.paymentConfirmed ? "default" : "destructive"} className={`mt-1 text-base ${registration.paymentConfirmed ? "bg-green-500 hover:bg-green-600" : ""}`}>
                            {registration.paymentConfirmed ? "Confirmado" : `Pendente ${paymentDetails?.method === 'carne' ? `(${paidInstallments.length}/${paymentDetails?.installmentsTotal})` : ''}`}
                        </Badge>
                        {registration.paidAt && (
                             <p className="text-xs text-muted-foreground mt-1 flex items-center gap-1.5">
                                <UserCog size={12} />
                                Confirmado em {format(new Date(registration.paidAt), "dd/MM/yyyy 'às' HH:mm")}
                                {paymentDetails?.paymentConfirmedBy && ` por ${paymentDetails.paymentConfirmedBy}`}
                            </p>
                        )}
                    </div>
                </div>

                <div className="space-y-4">
                    <h3 className="font-headline text-lg font-semibold flex items-center gap-2"><FileText className="text-primary"/>Ficha de Inscrição</h3>
                    <Separator />
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                        <DetailItem label="Nome Completo" value={details.teenName} />
                        <DetailItem label="Idade" value={`${details.teenAge} anos`} />
                        <DetailItem label="Gênero" value={details.teenGender === 'female' ? 'Feminino' : 'Masculino'} />
                        <DetailItem label="Telefone" value={details.teenPhone} />
                        <DetailItem label="Tamanho da Camisa" value={details.shirtSize} />
                        <DetailItem label="Transporte" value={details.transportation === 'bus' ? 'Ônibus' : 'Carro'} />
                        <DetailItem label="Participação como" value={participationTypeMap[details.participationType]} />
                        <DetailItem label="Congregação" value={details.congregationName} />
                    </div>
                </div>

                <div className="space-y-4">
                    <h3 className="font-headline text-lg font-semibold flex items-center gap-2"><HeartPulse className="text-primary"/>Ficha Médica</h3>
                    <Separator />
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                        <DetailItem label="Tipo Sanguíneo" value={details.bloodType} />
                        <DetailItem label="Peso e Altura" value={details.teenWeightAndHeight} />
                         <DetailItem label="Pode fazer atividades físicas?" value={details.canDoPhysicalActivities === 'yes' ? 'Sim' : 'Não'} />
                    </div>
                     <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-4 mt-4">
                        <DetailItem label="Possui Convênio?" value={details.hasMedicalInsurance === 'yes' ? `Sim (${details.medicalInsuranceName || 'Não informado'})` : 'Não'} />
                        <DetailItem label="Alguma restrição médica?" value={details.hasMedicalCondition === 'yes' ? details.medicalConditionDescription : 'Não'} />
                        <DetailItem label="Em tratamento médico?" value={details.isUnderTreatment === 'yes' ? details.treatmentDescription : 'Não'} />
                        <DetailItem label="Acompanhamento médico?" value={details.hasMedicalMonitoring === 'yes' ? details.medicalMonitoringReason : 'Não'} />
                        <DetailItem label="Acompanhamento psicológico?" value={details.hasPsychologicalMonitoring === 'yes' ? details.psychologicalMonitoringReason : 'Não'} />
                        <DetailItem label="Dieta diferenciada?" value={details.hasDietaryRestrictions === 'yes' ? details.dietaryRestrictionsDescription : 'Não'} />
                    </div>
                </div>

                <div className="space-y-4">
                    <h3 className="font-headline text-lg font-semibold flex items-center gap-2"><Shield className="text-primary"/>Responsável e Autorizações</h3>
                    <Separator />
                     <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                        <DetailItem label="Nome do Responsável" value={details.guardianName} />
                        <DetailItem label="Telefone do Responsável" value={details.guardianPhone} />
                        <DetailItem label="Email do Responsável" value={details.guardianEmail} />
                    </div>
                    <div className="p-4 bg-muted/50 rounded-lg space-y-3 mt-4">
                        <DetailBoolean label="Ciente sobre política de eletrônicos" value={details.electronicsAware} />
                        <DetailBoolean label="Ciente sobre política de camisas" value={details.shirtPolicyAgreement} />
                        <DetailBoolean label="Concordou com a política de reembolso" value={details.refundPolicyAgreement} />
                        <DetailBoolean label="Concordou com o termo de autorização" value={details.guardianAuthorizationAgreement} />
                        <DetailBoolean label="Autorizou uso de imagem e voz" value={details.imageAndVoiceAuthorization === 'authorized'} />
                    </div>
                </div>

                <div className="space-y-4">
                    <h3 className="font-headline text-lg font-semibold flex items-center gap-2"><CircleDollarSign className="text-primary"/>Pagamento</h3>
                    <Separator />
                     <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <DetailItem label="Valor da Inscrição" value={`R$ ${details.registrationValue}`} />
                        <DetailItem label="Forma de Pagamento" value={paymentMethodMap[paymentDetails?.method || 'presencial']} />
                        <DetailItem label="Valor Total Pago" value={`R$ ${(paymentDetails?.totalPaid || 0).toFixed(2)}`} />
                    </div>
                     {paidInstallments.length > 0 && (
                        <div className="mt-4">
                            <p className="text-sm font-semibold mb-2">Histórico de Pagamento:</p>
                             <Table>
                                <TableHeader>
                                    <TableRow>
                                    <TableHead>Parcela</TableHead>
                                    <TableHead>Valor Pago</TableHead>
                                    <TableHead>Data</TableHead>
                                    <TableHead>Confirmado por</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {paidInstallments.sort((a,b) => a.installment - b.installment).map(p => (
                                        <TableRow key={p.installment}>
                                            <TableCell>Parcela {p.installment}</TableCell>
                                            <TableCell>R$ {p.amount.toFixed(2)}</TableCell>
                                            <TableCell>{formatInTimeZone(new Date(p.date), "America/Manaus", "dd/MM/yyyy HH:mm")}</TableCell>
                                            <TableCell>{p.confirmedBy || 'N/A'}</TableCell>
                                        </TableRow>
                                    ))}
                                </TableBody>
                            </Table>
                        </div>
                    )}
                </div>

            </div>
        </ScrollArea>
        
        <DialogFooter>
          <Button variant="outline" onClick={onClose}>
            Fechar
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

    
// Trigger commit
