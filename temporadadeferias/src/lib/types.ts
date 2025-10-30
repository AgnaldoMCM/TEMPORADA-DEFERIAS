
import { z } from 'zod';

// Schema para validação do novo formulário de inscrição detalhado.
export const SignUpSchema = z.object({
  // Ficha de Inscrição
  participationType: z.enum(['member', 'guest', 'congregation'], {
    required_error: "Selecione o tipo de participação.",
  }),
  congregationName: z.string().optional(),
  teenName: z.string().min(3, { message: "O nome deve ter pelo menos 3 caracteres." }),
  teenAge: z.preprocess(
    (val) => {
      if (typeof val === 'string' && val.trim() !== '') {
        const num = parseInt(val, 10);
        return isNaN(num) ? val : num;
      }
       if(typeof val === 'number') return val;
      return undefined;
    },
    z.number({
      required_error: "A idade é obrigatória.",
      invalid_type_error: "A idade deve ser um número.",
    }).min(12, { message: "A idade mínima é 12 anos." }).max(18, { message: "A idade máxima é 18 anos." })
  ),
  teenGender: z.enum(['female', 'male'], { required_error: "Selecione o gênero." }),
  shirtSize: z.enum(['P', 'M', 'G', 'GG', 'XG'], { required_error: "Selecione o tamanho da camisa." }),
  shirtPolicyAgreement: z.preprocess(
    (val) => val === 'on' || val === true,
    z.literal(true, {
      errorMap: () => ({ message: "Você deve estar ciente da política de camisas." }),
    })
  ),
  teenPhone: z.string().regex(/^\(?\d{2}\)?[\s-]?\d{4,5}-?\d{4}$/, { message: "Por favor, insira um telefone válido." }),
  transportation: z.enum(['bus', 'car'], { required_error: "Selecione o meio de transporte." }),
   electronicsAware: z.preprocess(
    (val) => val === 'on' || val === true,
    z.literal(true, {
      errorMap: () => ({ message: "Você deve estar ciente sobre a política de eletrônicos." }),
    })
  ),

  // Ficha Médica
  bloodType: z.enum(['A+', 'A-', 'B+', 'B-', 'O+', 'O-', 'AB+', 'AB-', 'NAO_SEI'], { required_error: "Selecione o tipo sanguíneo." }),
  hasMedicalInsurance: z.enum(['yes', 'no'], { required_error: "Informe se possui convênio." }),
  medicalInsuranceName: z.string().optional(),
  teenWeightAndHeight: z.string().min(1, { message: "Informe o peso e altura." }),
  hasMedicalCondition: z.enum(['yes', 'no'], { required_error: "Informe sobre restrições médicas." }),
  medicalConditionDescription: z.string().optional(),
  isUnderTreatment: z.enum(['yes', 'no'], { required_error: "Informe se está em tratamento." }),
  treatmentDescription: z.string().optional(),
  hasMedicalMonitoring: z.enum(['yes', 'no'], { required_error: "Informe sobre acompanhamento médico." }),
  medicalMonitoringReason: z.string().optional(),
  hasPsychologicalMonitoring: z.enum(['yes', 'no'], { required_error: "Informe sobre acompanhamento psicológico." }),
  psychologicalMonitoringReason: z.string().optional(),
  canDoPhysicalActivities: z.enum(['yes', 'no'], { required_error: "Informe se pode fazer atividades físicas." }),
  hasDietaryRestrictions: z.enum(['yes', 'no'], { required_error: "Informe sobre restrições alimentares." }),
  dietaryRestrictionsDescription: z.string().optional(),
  
  // Autorizações
  guardianName: z.string().min(3, { message: "O nome do responsável é obrigatório." }),
  guardianPhone: z.string().regex(/^\(?\d{2}\)?[\s-]?\d{4,5}-?\d{4}$/, { message: "Por favor, insira um telefone de responsável válido." }),
  guardianEmail: z.string().email({ message: "Por favor, insira um e-mail de responsável válido." }),
  refundPolicyAgreement: z.preprocess(
    (val) => val === 'on' || val === true,
    z.literal(true, {
      errorMap: () => ({ message: "Você deve concordar com a política de reembolso." }),
    })
  ),
  guardianAuthorizationAgreement: z.preprocess(
    (val) => val === 'on' || val === true,
    z.literal(true, {
      errorMap: () => ({ message: "Você deve concordar com o termo de autorização." }),
    })
  ),
  imageAndVoiceAuthorization: z.enum(['authorized', 'not_authorized'], {
    required_error: "Você deve autorizar ou não o uso de imagem.",
  }),

  // Pagamento
  registrationValue: z.enum(['530', '477', '450.50', '265'], {
    required_error: "Selecione o valor da inscrição.",
  }),
  paymentMethod: z.enum(['presencial', 'carne', 'pix'], {
    required_error: "Selecione a forma de pagamento.",
  }),
  payFirstInstallmentWithPix: z.boolean().optional(),
  amountPaid: z.string().optional(), // Valor de entrada para o carnê.
}).refine(data => data.participationType !== 'congregation' || !!data.congregationName, {
  message: "O nome da congregação é obrigatório.",
  path: ["congregationName"],
});

// Tipo inferido do novo schema de inscrição.
export type SignUpData = z.infer<typeof SignUpSchema> & { id?: string };

// Novo schema de parcela
const PaidInstallmentSchema = z.object({
    installment: z.number(),
    amount: z.number(),
    date: z.string(),
    confirmedBy: z.string().nullable().optional(), // Quem confirmou o pagamento da parcela
});
export type PaidInstallment = z.infer<typeof PaidInstallmentSchema>;

// O schema de registro no banco de dados agora tem campos principais para exibição
// e um objeto 'details' para os dados completos.
export const RegistrationSchema = z.object({
    id: z.string(),
    name: z.string(), // teenName de SignUpData
    email: z.string().email(), // guardianEmail de SignUpData
    phone: z.string(), // teenPhone de SignUpData
    paymentConfirmed: z.boolean(),
    createdAt: z.string().nullable(),
    paidAt: z.string().optional().nullable(),
    details: SignUpSchema.optional(), 
    paymentDetails: z.object({
      method: z.enum(['presencial', 'carne', 'pix']),
      installmentsTotal: z.number(),
      paidInstallments: z.array(PaidInstallmentSchema).optional().default([]), // Histórico de parcelas pagas
      totalPaid: z.number().optional().default(0), // Soma total dos valores pagos
      paymentConfirmedBy: z.string().nullable().optional(), // Quem finalizou o pagamento
    }).optional(),
    isAdoptee: z.boolean().optional().default(false), // Novo campo para o programa "Adote"
});

export type Registration = z.infer<typeof RegistrationSchema>;

// Novo schema e tipo para as perguntas
export const QuestionSchema = z.object({
  email: z.string().email({ message: "Por favor, insira um e-mail válido." }),
  question: z.string().min(10, { message: "A pergunta deve ter pelo menos 10 caracteres." }),
});

export type QuestionData = z.infer<typeof QuestionSchema>;

export const QuestionDbSchema = QuestionSchema.extend({
  id: z.string(),
  status: z.enum(['pending', 'answered', 'archived']),
  createdAt: z.string(),
  answer: z.string().nullable(),
  answeredAt: z.string().nullable(),
  answeredBy: z.string().nullable(), // Opcional, para saber qual admin respondeu
  archivedBy: z.string().nullable(), // Quem arquivou a pergunta
  archivedAt: z.string().nullable(),
});

export type Question = z.infer<typeof QuestionDbSchema>;


// --- Tipos para Logs ---
export const ActivityLogSchema = z.object({
    date: z.string(),
    actor: z.string(),
    action: z.string(),
    type: z.enum(['registration', 'payment', 'checkin', 'question']),
    targetId: z.string(), // ID da inscrição ou pergunta relacionada
});

export type ActivityLog = z.infer<typeof ActivityLogSchema>;

// --- Tipos para IA ---

// 1. Resumo da Inscrição
export const RegistrationSummaryInputSchema = z.object({
  teenName: z.string().optional(),
  teenAge: z.union([z.string(), z.number()]).optional(),
  hasDietaryRestrictions: z.string().optional(),
  dietaryRestrictionsDescription: z.string().optional(),
  canDoPhysicalActivities: z.string().optional(),
  hasMedicalCondition: z.string().optional(),
  medicalConditionDescription: z.string().optional(),
  isUnderTreatment: z.string().optional(),
  treatmentDescription: z.string().optional(),
  hasMedicalMonitoring: z.string().optional(),
  medicalMonitoringReason: z.string().optional(),
  hasPsychologicalMonitoring: z.string().optional(),
  psychologicalMonitoringReason: z.string().optional(),
}).describe("Detalhes da inscrição de um participante do retiro.");
export type RegistrationSummaryInput = z.infer<typeof RegistrationSummaryInputSchema>;

export const RegistrationSummaryOutputSchema = z.object({
  summary: z.string().describe("Um resumo conciso e em tópicos (bullet points) das informações mais críticas do participante, como nome, idade e, principalmente, quaisquer alertas de saúde (restrições alimentares, condições médicas, tratamentos, etc.). Se não houver alertas, mencione isso."),
});
export type RegistrationSummaryOutput = z.infer<typeof RegistrationSummaryOutputSchema>;

// 2. Busca Inteligente
export const SearchQueryInputSchema = z.object({
  query: z.string().describe("A consulta de busca em linguagem natural feita pelo usuário."),
});
export type SearchQueryInput = z.infer<typeof SearchQueryInputSchema>;

export const SearchFiltersSchema = z.object({
  textSearch: z.string().optional().describe("Termos gerais de busca para nome, email, etc."),
  age: z.number().optional().describe("Idade específica para filtrar."),
  dietaryRestrictionsDescription: z.string().optional().describe("Busca por texto específico na descrição de restrições alimentares."),
  medicalConditionDescription: z.string().optional().describe("Busca por texto específico na descrição de condições médicas."),
  teenGender: z.enum(['male', 'female']).optional().describe("Filtra por gênero. 'male' para masculino, 'female' para feminino."),
  paymentConfirmed: z.boolean().optional().describe("Filtra por status de pagamento. 'true' para confirmado, 'false' para pendente."),
});
export type SearchFilters = z.infer<typeof SearchFiltersSchema>;
    

    
// Trigger commit
