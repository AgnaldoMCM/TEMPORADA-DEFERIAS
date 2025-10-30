
"use client";

import { useEffect, useRef, useState, useActionState } from 'react';
import { useRouter } from 'next/navigation';
import { useFormStatus } from 'react-dom';
import { handleSignUp, type FormState } from '@/app/actions';
import { useToast } from "@/hooks/use-toast";
import Link from 'next/link';

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ArrowLeft, Loader2, ArrowRight } from 'lucide-react';
import { Checkbox } from "@/components/ui/checkbox";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Progress } from '@/components/ui/progress';
import { type SignUpData } from '@/lib/types';

function SubmitButton() {
  const { pending } = useFormStatus();
  return (
    <Button type="submit" className="w-full font-headline" disabled={pending}>
      {pending ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
      {pending ? 'Processando...' : 'Finalizar Inscrição'}
    </Button>
  );
}

function ErrorMessage({ messages }: { messages?: string[] }) {
    if (!messages || messages.length === 0) return null;
    return <p className="text-sm font-medium text-destructive mt-1">{messages[0]}</p>;
}

const TOTAL_STEPS = 4;

export default function SignUpPage() {
  const { toast } = useToast();
  const router = useRouter();
  const formRef = useRef<HTMLFormElement>(null);
  const cardRef = useRef<HTMLDivElement>(null);
  
  const initialState: FormState = { message: '', errors: null, data: null, success: false };
  const [state, formAction] = useActionState(handleSignUp, initialState);

  const [step, setStep] = useState(1);
  const [formData, setFormData] = useState<Partial<SignUpData>>(state?.data ?? {});
  
  // States para campos condicionais
  const [participationType, setParticipationType] = useState<SignUpData['participationType'] | undefined>(formData?.participationType);
  const [hasMedicalInsurance, setHasMedicalInsurance] = useState<SignUpData['hasMedicalInsurance'] | undefined>(formData?.hasMedicalInsurance);
  const [hasMedicalCondition, setHasMedicalCondition] = useState<SignUpData['hasMedicalCondition'] | undefined>(formData?.hasMedicalCondition);
  const [isUnderTreatment, setIsUnderTreatment] = useState<SignUpData['isUnderTreatment'] | undefined>(formData?.isUnderTreatment);
  const [hasMedicalMonitoring, setHasMedicalMonitoring] = useState<SignUpData['hasMedicalMonitoring'] | undefined>(formData?.hasMedicalMonitoring);
  const [hasPsychologicalMonitoring, setHasPsychologicalMonitoring] = useState<SignUpData['hasPsychologicalMonitoring'] | undefined>(formData?.hasPsychologicalMonitoring);
  const [hasDietaryRestrictions, setHasDietaryRestrictions] = useState<SignUpData['hasDietaryRestrictions'] | undefined>(formData?.hasDietaryRestrictions);
  const [paymentMethod, setPaymentMethod] = useState<SignUpData['paymentMethod'] | undefined>(formData?.paymentMethod);
  const [carnePaymentOption, setCarnePaymentOption] = useState<'pix' | 'presencial' | undefined>();

  const updateFormData = () => {
    if (formRef.current) {
      const currentFormData = new FormData(formRef.current);
      const data = Object.fromEntries(currentFormData.entries());
      
      const processedData = {
        ...data,
        payFirstInstallmentWithPix: carnePaymentOption === 'pix'
      }
      setFormData(prev => ({...prev, ...processedData}));
    }
  }

  const handleNext = () => {
    updateFormData();
    if (step < TOTAL_STEPS) {
        setStep(step + 1);
        cardRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  }

  const handlePrev = () => {
      updateFormData();
      if (step > 1) {
          setStep(step - 1);
          cardRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }
  }

  useEffect(() => {
    if (state?.success && state.redirectUrl) {
      const finalPaymentMethod = formData.paymentMethod || state.data?.paymentMethod;
      // CORREÇÃO: Usar a prop `payFirstInstallmentWithPix` do estado retornado pela action, que é mais confiável.
      const finalPayFirstWithPix = state.data?.payFirstInstallmentWithPix;

      if (finalPaymentMethod === 'pix' || (finalPaymentMethod === 'carne' && finalPayFirstWithPix)) {
        router.push(`/success?id=${state.data?.id}`);
        return;
      }

      toast({
        title: "Inscrição Recebida!",
        description: state.message,
        className: "bg-green-500 text-white",
      });
       setTimeout(() => {
        router.push(state.redirectUrl!);
      }, 1000);
    } 
    else if (!state?.success && state?.message) {
       toast({
          title: state.errors ? "Erro de Validação" : "Erro no Servidor",
          description: state.message,
          variant: "destructive",
      });
      if(state.errors){
        const errorKeys = Object.keys(state.errors);
        if (errorKeys.some(k => ['participationType', 'teenName', 'teenAge', 'teenGender', 'shirtSize', 'teenPhone', 'transportation', 'electronicsAware', 'shirtPolicyAgreement'].includes(k))) {
            setStep(1);
        } else if (errorKeys.some(k => ['bloodType', 'hasMedicalInsurance', 'teenWeightAndHeight', 'hasMedicalCondition', 'isUnderTreatment', 'hasMedicalMonitoring', 'hasPsychologicalMonitoring', 'canDoPhysicalActivities', 'hasDietaryRestrictions'].includes(k))) {
            setStep(2);
        } else if (errorKeys.some(k => ['guardianName', 'guardianPhone', 'guardianEmail', 'refundPolicyAgreement', 'guardianAuthorizationAgreement', 'imageAndVoiceAuthorization'].includes(k))) {
            setStep(3);
        } else {
            setStep(4);
        }
      }
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [state, toast, router]);


  return (
    <main className="flex min-h-screen flex-col items-center justify-center bg-secondary p-4">
      <Card ref={cardRef} className="w-full max-w-3xl mx-auto shadow-2xl relative">
        <div className="absolute top-4 left-4 z-10">
          <Button asChild variant="ghost" size="icon" aria-label="Voltar para a página inicial">
            <Link href="/">
              <ArrowLeft />
            </Link>
          </Button>
        </div>
            
        <CardHeader className="text-center pt-16 md:pt-6">
          <CardTitle className="text-3xl font-headline">Formulário de Inscrição</CardTitle>
          <CardDescription>
            Etapa {step} de {TOTAL_STEPS} - Preencha todos os campos com atenção.
          </CardDescription>
          <Progress value={(step / TOTAL_STEPS) * 100} className="w-full mt-4" />
        </CardHeader>
        <CardContent>
          <form ref={formRef} action={formAction} className="space-y-8">
              
            {Object.entries(formData).map(([key, value]) => {
              if (value !== null && value !== undefined && typeof value !== 'object') {
                  return <input key={key} type="hidden" name={key} value={String(value)} />;
              }
              return null;
            })}
            
            {/* CORREÇÃO: Adiciona um campo hidden para garantir que o 'payFirstInstallmentWithPix' seja enviado */}
            {paymentMethod === 'carne' && carnePaymentOption === 'pix' && (
                <input type="hidden" name="payFirstInstallmentWithPix" value="on" />
            )}

            {step === 1 && (
              <div className="space-y-6 p-4 border rounded-lg animate-fade-in">
                <h3 className="font-headline text-xl font-semibold">1. Ficha de Inscrição</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="participationType">Estou participando como:</Label>
                    <Select name="participationType" defaultValue={formData?.participationType} onValueChange={(value) => setParticipationType(value as SignUpData['participationType'])}>
                      <SelectTrigger><SelectValue placeholder="Selecione..." /></SelectTrigger>
                      <SelectContent>
                        <SelectItem value="member">Membro IPManaus</SelectItem>
                        <SelectItem value="guest">Convidado</SelectItem>
                        <SelectItem value="congregation">Membro de Congregação</SelectItem>
                      </SelectContent>
                    </Select>
                    <ErrorMessage messages={state?.errors?.participationType} />
                  </div>
                  {participationType === 'congregation' && (
                    <div>
                      <Label htmlFor="congregationName">Qual congregação?</Label>
                      <Input name="congregationName" defaultValue={formData?.congregationName} />
                      <ErrorMessage messages={state?.errors?.congregationName} />
                    </div>
                  )}
                </div>
                <div>
                  <Label htmlFor="teenName">Nome Completo do Adolescente</Label>
                  <Input name="teenName" defaultValue={formData?.teenName} />
                  <ErrorMessage messages={state?.errors?.teenName} />
                </div>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <Label htmlFor="teenAge">Idade</Label>
                    <Input name="teenAge" type="number" defaultValue={formData?.teenAge}/>
                    <ErrorMessage messages={state?.errors?.teenAge} />
                  </div>
                  <div>
                    <Label htmlFor="teenGender">Gênero</Label>
                    <Select name="teenGender" defaultValue={formData?.teenGender} onValueChange={(value) => setFormData(prev => ({...prev, teenGender: value as SignUpData['teenGender']}))}>
                      <SelectTrigger><SelectValue placeholder="Selecione..." /></SelectTrigger>
                      <SelectContent>
                        <SelectItem value="female">Feminino</SelectItem>
                        <SelectItem value="male">Masculino</SelectItem>
                      </SelectContent>
                    </Select>
                    <ErrorMessage messages={state?.errors?.teenGender} />
                  </div>
                  <div>
                    <Label htmlFor="shirtSize">Tamanho da Camisa</Label>
                    <Select name="shirtSize" defaultValue={formData?.shirtSize} onValueChange={(value) => setFormData(prev => ({...prev, shirtSize: value as SignUpData['shirtSize']}))}>
                      <SelectTrigger><SelectValue placeholder="Selecione..." /></SelectTrigger>
                      <SelectContent>
                        <SelectItem value="P">P</SelectItem>
                        <SelectItem value="M">M</SelectItem>
                        <SelectItem value="G">G</SelectItem>
                        <SelectItem value="GG">GG</SelectItem>
                        <SelectItem value="XG">XG</SelectItem>
                      </SelectContent>
                    </Select>
                    <ErrorMessage messages={state?.errors?.shirtSize} />
                  </div>
                </div>

                <div className="space-y-2 rounded-md bg-amber-50 dark:bg-amber-900/20 p-4 border border-amber-200 dark:border-amber-800">
                  <p className="font-semibold text-amber-800 dark:text-amber-300">Atenção à Política de Camisas</p>
                  <p className="text-sm text-amber-700 dark:text-amber-400">As inscrições feitas após <strong>29/11/2025</strong> receberão camisas de tamanho aleatório ou poderão não receber, conforme a disponibilidade.</p>
                  <div className="flex items-center space-x-2 pt-2">
                    <Checkbox id="shirtPolicyAgreement" name="shirtPolicyAgreement" defaultChecked={formData?.shirtPolicyAgreement} />
                    <Label htmlFor="shirtPolicyAgreement">Estou ciente.</Label>
                  </div>
                  <ErrorMessage messages={state?.errors?.shirtPolicyAgreement} />
                </div>

                <div>
                  <Label htmlFor="teenPhone">Telefone com WhatsApp</Label>
                  <Input name="teenPhone" type="tel" defaultValue={formData?.teenPhone}/>
                  <ErrorMessage messages={state?.errors?.teenPhone} />
                </div>
                <div>
                  <Label>Irei de:</Label>
                  <RadioGroup name="transportation" defaultValue={formData?.transportation} className="flex gap-4 pt-2" onValueChange={(value) => setFormData(prev => ({...prev, transportation: value as SignUpData['transportation']}))}>
                    <div className="flex items-center space-x-2"><RadioGroupItem value="bus" id="bus" /><Label htmlFor="bus">Ônibus</Label></div>
                    <div className="flex items-center space-x-2"><RadioGroupItem value="car" id="car" /><Label htmlFor="car">Carro</Label></div>
                  </RadioGroup>
                  <ErrorMessage messages={state?.errors?.transportation} />
                </div>
                <div className="space-y-2 rounded-md bg-amber-50 dark:bg-amber-900/20 p-4 border border-amber-200 dark:border-amber-800">
                  <p className="font-semibold text-amber-800 dark:text-amber-300">O que não levar:</p>
                  <p className="text-sm text-amber-700 dark:text-amber-400">Aparelhos eletrônicos (celular, tablet, etc) e objetos de valor. A UPA não se responsabiliza por itens perdidos. Itens esquecidos serão doados.</p>
                  <div className="flex items-center space-x-2 pt-2">
                    <Checkbox id="electronicsAware" name="electronicsAware" defaultChecked={formData?.electronicsAware} />
                    <Label htmlFor="electronicsAware">Estou ciente.</Label>
                  </div>
                  <ErrorMessage messages={state?.errors?.electronicsAware} />
                </div>
              </div>
            )}

            {step === 2 && (
              <div className="space-y-6 p-4 border rounded-lg animate-fade-in">
                <h3 className="font-headline text-xl font-semibold">2. Ficha Médica</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                    <Label htmlFor="bloodType">Tipo Sanguíneo</Label>
                    <Select name="bloodType" defaultValue={formData?.bloodType} onValueChange={(value) => setFormData(prev => ({...prev, bloodType: value as SignUpData['bloodType']}))}>
                        <SelectTrigger><SelectValue placeholder="Selecione..." /></SelectTrigger>
                        <SelectContent>
                            <SelectItem value="A+">A+</SelectItem>
                            <SelectItem value="A-">A-</SelectItem>
                            <SelectItem value="B+">B+</SelectItem>
                            <SelectItem value="B-">B-</SelectItem>
                            <SelectItem value="O+">O+</SelectItem>
                            <SelectItem value="O-">O-</SelectItem>
                            <SelectItem value="AB+">AB+</SelectItem>
                            <SelectItem value="AB-">AB-</SelectItem>
                            <SelectItem value="NAO_SEI">Não sei</SelectItem>
                        </SelectContent>
                    </Select>
                    <ErrorMessage messages={state?.errors?.bloodType} />
                </div>
                <div>
                    <Label htmlFor="teenWeightAndHeight">Peso e Altura (ex: 60kg, 1.70m)</Label>
                    <Input name="teenWeightAndHeight" defaultValue={formData?.teenWeightAndHeight} />
                    <ErrorMessage messages={state?.errors?.teenWeightAndHeight} />
                </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <Label>Possui convênio médico?</Label>
                    <RadioGroup name="hasMedicalInsurance" defaultValue={formData?.hasMedicalInsurance} onValueChange={(value) => setHasMedicalInsurance(value as SignUpData['hasMedicalInsurance'])} className="flex gap-4">
                      <div className="flex items-center space-x-2"><RadioGroupItem value="yes" id="med-yes" /><Label htmlFor="med-yes">Sim</Label></div>
                      <div className="flex items-center space-x-2"><RadioGroupItem value="no" id="med-no" /><Label htmlFor="med-no">Não</Label></div>
                    </RadioGroup>
                    <ErrorMessage messages={state?.errors?.hasMedicalInsurance} />
                    {hasMedicalInsurance === 'yes' && (
                      <Input name="medicalInsuranceName" placeholder="Se sim, qual?" className="mt-2" defaultValue={formData?.medicalInsuranceName} />
                    )}
                  </div>
                  <div className="space-y-2">
                    <Label>Possui alguma restrição médica?</Label>
                    <RadioGroup name="hasMedicalCondition" defaultValue={formData?.hasMedicalCondition} onValueChange={(value) => setHasMedicalCondition(value as SignUpData['hasMedicalCondition'])} className="flex gap-4">
                    <div className="flex items-center space-x-2"><RadioGroupItem value="yes" id="cond-yes" /><Label htmlFor="cond-yes">Sim</Label></div>
                    <div className="flex items-center space-x-2"><RadioGroupItem value="no" id="cond-no" /><Label htmlFor="cond-no">Não</Label></div>
                    </RadioGroup>
                    <ErrorMessage messages={state?.errors?.hasMedicalCondition} />
                    {hasMedicalCondition === 'yes' && (
                    <Textarea name="medicalConditionDescription" placeholder="Se sim, qual?" className="mt-2" defaultValue={formData?.medicalConditionDescription} />
                    )}
                  </div>
                  <div className="space-y-2">
                    <Label>Está submetido a algum tratamento?</Label>
                    <RadioGroup name="isUnderTreatment" defaultValue={formData?.isUnderTreatment} onValueChange={(value) => setIsUnderTreatment(value as SignUpData['isUnderTreatment'])} className="flex gap-4">
                    <div className="flex items-center space-x-2"><RadioGroupItem value="yes" id="treat-yes" /><Label htmlFor="treat-yes">Sim</Label></div>
                    <div className="flex items-center space-x-2"><RadioGroupItem value="no" id="treat-no" /><Label htmlFor="treat-no">Não</Label></div>
                    </RadioGroup>
                    <ErrorMessage messages={state?.errors?.isUnderTreatment} />
                    {isUnderTreatment === 'yes' && (
                    <Textarea name="treatmentDescription" placeholder="Se sim, indique medicamento, dosagem, horário, etc." className="mt-2" defaultValue={formData?.treatmentDescription} />
                    )}
                  </div>
                  <div className="space-y-2">
                    <Label>Fez ou faz acompanhamento médico?</Label>
                    <RadioGroup name="hasMedicalMonitoring" defaultValue={formData?.hasMedicalMonitoring} onValueChange={(value) => setHasMedicalMonitoring(value as SignUpData['hasMedicalMonitoring'])} className="flex gap-4">
                    <div className="flex items-center space-x-2"><RadioGroupItem value="yes" id="monit-yes" /><Label htmlFor="monit-yes">Sim</Label></div>
                    <div className="flex items-center space-x-2"><RadioGroupItem value="no" id="monit-no" /><Label htmlFor="monit-no">Não</Label></div>
                    </RadioGroup>
                    <ErrorMessage messages={state?.errors?.hasMedicalMonitoring} />
                    {hasMedicalMonitoring === 'yes' && (
                    <Textarea name="medicalMonitoringReason" placeholder="Se sim, por qual motivo?" className="mt-2" defaultValue={formData?.medicalMonitoringReason} />
                    )}
                  </div>
                  <div className="space-y-2">
                    <Label>Fez ou faz acompanhamento psicológico?</Label>
                    <RadioGroup name="hasPsychologicalMonitoring" defaultValue={formData?.hasPsychologicalMonitoring} onValueChange={(value) => setHasPsychologicalMonitoring(value as SignUpData['hasPsychologicalMonitoring'])} className="flex gap-4">
                    <div className="flex items-center space-x-2"><RadioGroupItem value="yes" id="psy-yes" /><Label htmlFor="psy-yes">Sim</Label></div>
                    <div className="flex items-center space-x-2"><RadioGroupItem value="no" id="psy-no" /><Label htmlFor="psy-no">Não</Label></div>
                    </RadioGroup>
                    <ErrorMessage messages={state?.errors?.hasPsychologicalMonitoring} />
                    {hasPsychologicalMonitoring === 'yes' && (
                    <Textarea name="psychologicalMonitoringReason" placeholder="Se sim, por qual motivo?" className="mt-2" defaultValue={formData?.psychologicalMonitoringReason} />
                    )}
                  </div>
                  <div>
                    <Label>Pode participar de atividades físicas?</Label>
                    <RadioGroup name="canDoPhysicalActivities" defaultValue={formData?.canDoPhysicalActivities} className="flex gap-4 pt-2" onValueChange={(value) => setFormData(prev => ({...prev, canDoPhysicalActivities: value as SignUpData['canDoPhysicalActivities']}))}>
                      <div className="flex items-center space-x-2"><RadioGroupItem value="yes" id="phys-yes" /><Label htmlFor="phys-yes">Sim</Label></div>
                      <div className="flex items-center space-x-2"><RadioGroupItem value="no" id="phys-no" /><Label htmlFor="phys-no">Não</Label></div>
                    </RadioGroup>
                    <ErrorMessage messages={state?.errors?.canDoPhysicalActivities} />
                  </div>
                  <div className="space-y-2">
                    <Label>Possui dieta alimentar diferenciada?</Label>
                    <RadioGroup name="hasDietaryRestrictions" defaultValue={formData?.hasDietaryRestrictions} onValueChange={(value) => setHasDietaryRestrictions(value as SignUpData['hasDietaryRestrictions'])} className="flex gap-4">
                    <div className="flex items-center space-x-2"><RadioGroupItem value="yes" id="diet-yes" /><Label htmlFor="diet-yes">Sim</Label></div>
                    <div className="flex items-center space-x-2"><RadioGroupItem value="no" id="diet-no" /><Label htmlFor="diet-no">Não</Label></div>
                    </RadioGroup>
                    <ErrorMessage messages={state?.errors?.hasDietaryRestrictions} />
                    {hasDietaryRestrictions === 'yes' && (
                    <Textarea name="dietaryRestrictionsDescription" placeholder="Se sim, descreva a restrição" className="mt-2" defaultValue={formData?.dietaryRestrictionsDescription} />
                    )}
                  </div>
                </div>
              </div>
            )}
            
            {step === 3 && (
              <div className="space-y-6 p-4 border rounded-lg animate-fade-in">
                <h3 className="font-headline text-xl font-semibold">3. Autorizações do Responsável</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                  <Label htmlFor="guardianName">Nome do Responsável</Label>
                  <Input name="guardianName" defaultValue={formData?.guardianName} />
                    <ErrorMessage messages={state?.errors?.guardianName} />
                  </div>
                  <div>
                  <Label htmlFor="guardianPhone">Telefone do Responsável com WhatsApp</Label>
                  <Input name="guardianPhone" type="tel" defaultValue={formData?.guardianPhone} />
                    <ErrorMessage messages={state?.errors?.guardianPhone} />
                  </div>
                </div>
                <div>
                  <Label htmlFor="guardianEmail">E-mail do Responsável</Label>
                  <Input name="guardianEmail" type="email" defaultValue={formData?.guardianEmail} placeholder="E-mail para contato e recibos" />
                  <ErrorMessage messages={state?.errors?.guardianEmail} />
                </div>
                <div className="space-y-2 rounded-md bg-amber-50 dark:bg-amber-900/20 p-4 border border-amber-200 dark:border-amber-800">
                  <p className="font-semibold text-amber-800 dark:text-amber-300">Política de Reembolso</p>
                  <p className="text-sm text-amber-700 dark:text-amber-400">Em caso de desistência, a UPA Religados poderá devolver 40% do valor investido, devido à compra antecipada de materiais para o retiro.</p>
                  <div className="flex items-center space-x-2 pt-2">
                  <Checkbox id="refundPolicyAgreement" name="refundPolicyAgreement" defaultChecked={formData?.refundPolicyAgreement} />
                  <Label htmlFor="refundPolicyAgreement">Declaro que li e estou de acordo.</Label>
                  </div>
                  <ErrorMessage messages={state?.errors?.refundPolicyAgreement} />
                </div>
                <div className="space-y-2 rounded-md bg-amber-50 dark:bg-amber-900/20 p-4 border border-amber-200 dark:border-amber-800">
                  <p className="font-semibold text-amber-800 dark:text-amber-300">Termo de Autorização do Responsável</p>
                  <p className="text-sm text-amber-700 dark:text-amber-400">Eu, responsável legal, autorizo a participação do(a) adolescente no RetirUPA (5 a 9 de Jan), no Sítio Canarinho. Declaro estar ciente de todas as informações e confirmo a veracidade dos dados de saúde fornecidos.</p>
                  <div className="flex items-center space-x-2 pt-2">
                  <Checkbox id="guardianAuthorizationAgreement" name="guardianAuthorizationAgreement" defaultChecked={formData?.guardianAuthorizationAgreement} />
                  <Label htmlFor="guardianAuthorizationAgreement">Estou ciente e concordo com os termos.</Label>
                  </div>
                  <ErrorMessage messages={state?.errors?.guardianAuthorizationAgreement} />
                </div>
                <div className="space-y-2 rounded-md bg-amber-50 dark:bg-amber-900/20 p-4 border border-amber-200 dark:border-amber-800">
                  <p className="font-semibold text-amber-800 dark:text-amber-300">Termo de Autorização de Uso de Imagem e Voz</p>
                  <p className="text-sm text-amber-700 dark:text-amber-400">Autorizo (ou não) que fotos, vídeos e gravações de voz do(a) participante, feitos durante o RetirUPA, sejam utilizados pelo Ministério para fins não comerciais em suas redes sociais e materiais de divulgação.</p>
                  <RadioGroup name="imageAndVoiceAuthorization" defaultValue={formData?.imageAndVoiceAuthorization} className="flex flex-col space-y-2 pt-2" onValueChange={(value) => setFormData(prev => ({...prev, imageAndVoiceAuthorization: value as SignUpData['imageAndVoiceAuthorization']}))}>
                    <div className="flex items-center space-x-2"><RadioGroupItem value="authorized" id="img-auth" /><Label htmlFor="img-auth">Autorizo o uso da imagem e voz.</Label></div>
                    <div className="flex items-center space-x-2"><RadioGroupItem value="not_authorized" id="img-not-auth" /><Label htmlFor="img-not-auth">Não autorizo o uso da imagem e voz.</Label></div>
                  </RadioGroup>
                  <ErrorMessage messages={state?.errors?.imageAndVoiceAuthorization} />
                </div>
              </div>
            )}

            {step === 4 && (
              <div className="space-y-6 p-4 border rounded-lg animate-fade-in">
                <h3 className="font-headline text-xl font-semibold">4. Pagamento</h3>
                <div>
                  <Label>Minha inscrição é no valor de:</Label>
                  <RadioGroup name="registrationValue" defaultValue={formData?.registrationValue} className="grid grid-cols-1 sm:grid-cols-2 gap-2 mt-2" onValueChange={(value) => setFormData(prev => ({...prev, registrationValue: value as SignUpData['registrationValue']}))}>
                    <Label className="flex items-center space-x-2 rounded-md border p-3 hover:border-primary cursor-pointer has-[[data-state=checked]]:border-primary has-[[data-state=checked]]:bg-primary/5">
                      <RadioGroupItem value="530" />
                      <span>Lote único (geral): R$ 530,00</span>
                    </Label>
                    <Label className="flex items-center space-x-2 rounded-md border p-3 hover:border-primary cursor-pointer has-[[data-state=checked]]:border-primary has-[[data-state=checked]]:bg-primary/5">
                      <RadioGroupItem value="477" />
                      <span>Desconto (2º irmão+): R$ 477,00</span>
                    </Label>
                    <Label className="flex items-center space-x-2 rounded-md border p-3 hover:border-primary cursor-pointer has-[[data-state=checked]]:border-primary has-[[data-state=checked]]:bg-primary/5">
                      <RadioGroupItem value="450.50" />
                      <span>Sócios: R$ 450,50</span>
                    </Label>
                    <Label className="flex items-center space-x-2 rounded-md border p-3 hover:border-primary cursor-pointer has-[[data-state=checked]]:border-primary has-[[data-state=checked]]:bg-primary/5">
                      <RadioGroupItem value="265" />
                      <span>Congregação: R$ 265,00</span>
                    </Label>
                  </RadioGroup>
                  <ErrorMessage messages={state?.errors?.registrationValue} />
                </div>
                <div>
                  <Label>Forma de Pagamento:</Label>
                  <RadioGroup name="paymentMethod" defaultValue={formData?.paymentMethod || 'presencial'} className="grid grid-cols-1 sm:grid-cols-3 gap-2 mt-2" onValueChange={(value) => setPaymentMethod(value as SignUpData['paymentMethod'])}>
                      <Label className="flex items-center space-x-2 rounded-md border p-3 hover:border-primary cursor-pointer has-[[data-state=checked]]:border-primary has-[[data-state=checked]]:bg-primary/5">
                          <RadioGroupItem value="pix" id="pix" />
                          <span>PIX</span>
                      </Label>
                      <Label className="flex items-center space-x-2 rounded-md border p-3 hover:border-primary cursor-pointer has-[[data-state=checked]]:border-primary has-[[data-state=checked]]:bg-primary/5">
                          <RadioGroupItem value="presencial" id="presencial" />
                          <span>Presencial – À vista</span>
                      </Label>
                      <Label className="flex items-center space-x-2 rounded-md border p-3 hover:border-primary cursor-pointer has-[[data-state=checked]]:border-primary has-[[data-state=checked]]:bg-primary/5">
                          <RadioGroupItem value="carne" id="carne" />
                          <span>Carnê-Parcelamento</span>
                      </Label>
                  </RadioGroup>
                  <ErrorMessage messages={state?.errors?.paymentMethod} />
                  
                  {paymentMethod === 'carne' && (
                    <div className="mt-4 p-4 bg-muted rounded-md border space-y-4">
                        <Label>Como deseja pagar a 1ª parcela (entrada)?</Label>
                        <RadioGroup 
                          defaultValue={carnePaymentOption}
                          onValueChange={(value) => setCarnePaymentOption(value as 'pix' | 'presencial')}
                          className="grid grid-cols-1 sm:grid-cols-2 gap-2"
                        >
                            <Label className="flex items-center space-x-2 rounded-md border p-3 hover:border-primary cursor-pointer has-[[data-state=checked]]:border-primary has-[[data-state=checked]]:bg-primary/5 bg-background">
                                <RadioGroupItem value="pix" id="carne_pix" />
                                <span>Pagar 1ª com PIX</span>
                            </Label>
                            <Label className="flex items-center space-x-2 rounded-md border p-3 hover:border-primary cursor-pointer has-[[data-state=checked]]:border-primary has-[[data-state=checked]]:bg-primary/5 bg-background">
                                <RadioGroupItem value="presencial" id="carne_presencial" />
                                <span>Pagar 1ª presencialmente</span>
                            </Label>
                        </RadioGroup>
                        {carnePaymentOption === 'pix' && (
                          <div>
                            <Label htmlFor="amountPaid" className="block text-sm">Digite o valor que irá pagar na primeira parcela:</Label>
                            <Input name="amountPaid" type="text" placeholder="Ex: 50,00" defaultValue={formData?.amountPaid} className="mt-1"/>
                             <p className="text-sm text-muted-foreground mt-2">O QR Code para este valor será gerado na próxima tela. O restante do carnê será entregue presencialmente.</p>
                          </div>
                        )}
                    </div>
                  )}

                   {(paymentMethod === 'pix' || paymentMethod === 'presencial') && (
                       <div className="mt-4 p-3 bg-muted rounded-md border">
                          <p className="text-sm text-muted-foreground font-semibold">O QR Code para pagamentos PIX será exibido na tela de sucesso. Outras formas devem ser tratadas com a secretaria.</p>
                       </div>
                   )}
                </div>
              </div>
            )}

            <div className="flex justify-between items-center mt-8">
              {step > 1 ? (
                <Button type="button" variant="outline" onClick={handlePrev}>
                  <ArrowLeft className="mr-2 h-4 w-4" />
                  Anterior
                </Button>
              ) : (
                <div />
              )}

              {step < TOTAL_STEPS ? (
                <Button type="button" onClick={handleNext}>
                  Próximo
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
              ) : (
                <SubmitButton />
              )}
            </div>
          </form>
        </CardContent>
      </Card>
    </main>
  );
}
// Trigger commit
