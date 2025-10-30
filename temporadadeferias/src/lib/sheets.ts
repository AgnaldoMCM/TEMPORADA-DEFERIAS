

import { google } from 'googleapis';
import { formatInTimeZone } from 'date-fns-tz';
import type { SignUpData, PaidInstallment } from './types';

// Carrega as credenciais de forma segura.
const serviceAccountEmail = process.env.GOOGLE_SHEETS_SERVICE_ACCOUNT_EMAIL;
const privateKey = process.env.GOOGLE_SHEETS_PRIVATE_KEY?.replace(/\\n/g, '\n');
const sheetId = process.env.GOOGLE_SHEETS_DOCUMENT_ID;

if (!serviceAccountEmail || !privateKey || !sheetId) {
  console.warn("Variáveis de ambiente do Google Sheets não configuradas. A integração será desativada.");
}

// Escopos de permissão necessários.
const SCOPES = ['https://www.googleapis.com/auth/spreadsheets'];

// Função para obter o cliente autenticado da API do Google.
async function getAuthenticatedClient() {
  if (!serviceAccountEmail || !privateKey || !sheetId) {
    throw new Error("Credenciais do Google Sheets não configuradas no servidor.");
  }
  const auth = new google.auth.GoogleAuth({
    credentials: {
      client_email: serviceAccountEmail,
      private_key: privateKey,
    },
    scopes: SCOPES,
  });
  return await auth.getClient();
}

// Função para obter a instância da API do Google Sheets.
async function getSheetsInstance() {
  const authClient = await getAuthenticatedClient();
  return google.sheets({ version: 'v4', auth: authClient });
}

// Define o cabeçalho da planilha. A ordem aqui é CRUCIAL.
const HEADER_ROW = [
  // --- INFORMAÇÕES GERAIS ---
  'ID', 
  'Status Pagamento', 
  'É Adotante', // NOVO CAMPO
  'Data Inscrição',
  'Data Pagamento Final',
  
  // --- DADOS DO PARTICIPANTE ---
  'Nome Completo', 
  'Idade', 
  'Gênero', 
  'Telefone Adolescente', 
  'Tamanho Camisa', 
  'Tipo de Participação', 
  'Nome Congregação', 
  'Transporte', 
  
  // --- DADOS DO RESPONSÁVEL ---
  'Nome Responsável',
  'Email Responsável',
  'Telefone Responsável',

  // --- DETALHES FINANCEIROS ---
  'Valor Inscrição', 
  'Forma de Pagamento',
  'Valor Total Pago', 
  'Histórico de Pagamentos',

  // --- FICHA MÉDICA ---
  'Tipo Sanguíneo',
  'Peso e Altura',
  'Pode Fazer Atividades Físicas',
  'Possui Convênio', 
  'Nome Convênio', 
  'Restrição Médica',
  'Descrição Restrição Médica', 
  'Em Tratamento', 
  'Descrição Tratamento',
  'Acompanhamento Médico', 
  'Motivo Acompanhamento Médico', 
  'Acompanhamento Psicológico',
  'Motivo Acompanhamento Psicológico',
  'Restrição Alimentar', 
  'Descrição Restrição Alimentar', 
  
  // --- AUTORIZAÇÕES ---
  'Ciente Eletrônicos',
  'Ciente Política Camisa',
  'Acordo Política Reembolso',
  'Acordo Autorização Responsável',
  'Autorização de Imagem',
];


// Mapeamento para conversão de valores.
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

// Interface para os dados passados para as funções do Sheets
interface SheetRowData extends Partial<SignUpData> {
  paymentConfirmed: boolean;
  isAdoptee: boolean; // NOVO CAMPO
  paidAt: string | null;
  createdAt: string | null;
  paymentHistory: string;
  totalPaid: number;
  paymentMethod?: 'presencial' | 'carne' | 'pix';
}


// Função para transformar os dados do formulário em um array de valores para a planilha.
function formatDataForSheet(id: string, data: SheetRowData): any[] {
  const manausTimeZone = "America/Manaus";
  const na = "N/A";

  // CORREÇÃO: Prioriza os campos de nível superior que são usados em todo o sistema.
  const teenName = (data as any).name || data.teenName || '';
  const teenPhone = (data as any).phone || data.teenPhone || '';
  const guardianEmail = (data as any).email || data.guardianEmail || '';
  
  return [
    // --- INFORMAÇÕES GERAIS (5 colunas) ---
    id,
    data.paymentConfirmed ? "Confirmado" : "Pendente",
    data.isAdoptee ? "Sim" : "Não", // NOVO CAMPO
    data.createdAt ? formatInTimeZone(new Date(data.createdAt), manausTimeZone, "dd/MM/yyyy HH:mm") : na,
    data.paidAt ? formatInTimeZone(new Date(data.paidAt), manausTimeZone, "dd/MM/yyyy HH:mm") : na,
    
    // --- DADOS DO PARTICIPANTE (8 colunas) ---
    teenName,
    data.teenAge,
    data.teenGender === 'female' ? 'Feminino' : 'Masculino',
    teenPhone,
    data.shirtSize,
    data.participationType ? participationTypeMap[data.participationType] : na,
    data.congregationName || na,
    data.transportation === 'bus' ? 'Ônibus' : 'Carro',
    
    // --- DADOS DO RESPONSÁVEL (3 colunas) ---
    data.guardianName,
    guardianEmail,
    data.guardianPhone,

    // --- DETALHES FINANCEIROS (4 colunas) ---
    data.registrationValue ? `R$ ${data.registrationValue}` : na,
    data.paymentMethod ? paymentMethodMap[data.paymentMethod] : na,
    data.totalPaid.toFixed(2).replace('.', ','),
    data.paymentHistory || na,

    // --- FICHA MÉDICA (14 colunas) ---
    data.bloodType,
    data.teenWeightAndHeight,
    data.canDoPhysicalActivities === 'yes' ? 'Sim' : 'Não',
    data.hasMedicalInsurance === 'yes' ? 'Sim' : 'Não',
    data.medicalInsuranceName || na,
    data.hasMedicalCondition === 'yes' ? 'Sim' : 'Não',
    data.medicalConditionDescription || na,
    data.isUnderTreatment === 'yes' ? 'Sim' : 'Não',
    data.treatmentDescription || na,
    data.hasMedicalMonitoring === 'yes' ? 'Sim' : 'Não',
    data.medicalMonitoringReason || na,
    data.hasPsychologicalMonitoring === 'yes' ? 'Sim' : 'Não',
    data.psychologicalMonitoringReason || na,
    data.hasDietaryRestrictions === 'yes' ? 'Sim' : 'Não',
    data.dietaryRestrictionsDescription || na,
    
    // --- AUTORIZAÇÕES (5 colunas) ---
    data.electronicsAware ? 'Sim' : 'Não',
    data.shirtPolicyAgreement ? 'Sim' : 'Não',
    data.refundPolicyAgreement ? 'Sim' : 'Não',
    data.guardianAuthorizationAgreement ? 'Sim' : 'Não',
    data.imageAndVoiceAuthorization === 'authorized' ? 'Autorizado' : 'Não Autorizado',
  ];
}


// Garante que o cabeçalho exista na planilha.
async function ensureHeader(sheets: any, spreadsheetId: string, sheetName: string) {
  try {
    const response = await sheets.spreadsheets.values.get({
      spreadsheetId,
      range: `${sheetName}!1:1`, // Ler a primeira linha inteira
    });

    const header = response.data.values ? response.data.values[0] : [];
    // Compara o header atual com o esperado. Se for diferente, força a atualização.
    if (JSON.stringify(header) !== JSON.stringify(HEADER_ROW)) {
      console.log("Cabeçalho da planilha desatualizado ou inexistente. Forçando atualização...");
      await sheets.spreadsheets.values.update({
        spreadsheetId,
        range: `${sheetName}!A1`,
        valueInputOption: 'RAW',
        requestBody: {
          values: [HEADER_ROW],
        },
      });
      console.log("Cabeçalho atualizado na planilha.");
    }

  } catch (error: any) {
     if (error.message.includes('Unable to parse range')) {
        try {
            await sheets.spreadsheets.batchUpdate({
                spreadsheetId,
                requestBody: {
                    requests: [{ addSheet: { properties: { title: sheetName } } }],
                },
            });
            console.log(`Aba "${sheetName}" criada.`);
            await ensureHeader(sheets, spreadsheetId, sheetName); // Tenta de novo após criar
        } catch(createError) {
             console.error(`Falha ao criar a aba "${sheetName}":`, createError);
             throw createError;
        }
     } else {
        console.error("Erro ao verificar/atualizar o cabeçalho:", error);
        throw error;
     }
  }
}

// Adiciona uma nova linha à planilha.
export async function addRowToSheet(id: string, data: SheetRowData) {
  if (!serviceAccountEmail) return;
  try {
    const sheets = await getSheetsInstance();
    const spreadsheetId = sheetId!;
    const sheetName = 'Inscrições'; // Nome da aba/página da planilha

    await ensureHeader(sheets, spreadsheetId, sheetName);

    const values = formatDataForSheet(id, data);

    await sheets.spreadsheets.values.append({
      spreadsheetId,
      range: `${sheetName}!A:A`, // Append na primeira coluna vazia
      valueInputOption: 'USER_ENTERED',
      requestBody: {
        values: [values],
      },
    });
    console.log(`Linha adicionada para a inscrição ${id}`);
  } catch (error) {
    console.error("Erro ao adicionar linha no Google Sheets:", error);
    throw error;
  }
}

// Atualiza uma linha existente na planilha.
export async function updateRowInSheet(id: string, data: SheetRowData) {
  if (!serviceAccountEmail) return;
  try {
    const sheets = await getSheetsInstance();
    const spreadsheetId = sheetId!;
    const sheetName = 'Inscrições';

    await ensureHeader(sheets, spreadsheetId, sheetName);

    // Primeiro, encontre a linha que corresponde ao ID
    const findResponse = await sheets.spreadsheets.values.get({
      spreadsheetId,
      range: `${sheetName}!A:A`, // Procura na coluna de IDs
    });

    const rows = findResponse.data.values;
    if (!rows) {
      console.log(`ID ${id} não encontrado na planilha para atualização. Adicionando como nova linha.`);
      await addRowToSheet(id, data);
      return;
    }
    
    const rowIndex = rows.findIndex(row => row[0] === id);

    if (rowIndex === -1) {
      console.log(`ID ${id} não encontrado na planilha, adicionando como nova linha.`);
      await addRowToSheet(id, data);
      return;
    }

    const rowNumber = rowIndex + 1; // `findIndex` é 0-based, mas as linhas da planilha são 1-based.
    const values = formatDataForSheet(id, data);

    await sheets.spreadsheets.values.update({
      spreadsheetId,
      range: `${sheetName}!A${rowNumber}`,
      valueInputOption: 'USER_ENTERED',
      requestBody: {
        values: [values],
      },
    });
    console.log(`Linha ${rowNumber} (ID: ${id}) atualizada na planilha.`);
  } catch (error) {
    console.error(`Erro ao atualizar linha no Google Sheets para o ID ${id}:`, error);
    throw error;
  }
}

// Sincroniza TODOS os registros do Firestore com o Sheets.
// ATENÇÃO: Essa função pode ser lenta e custosa se houver muitos registros.
export async function syncAllToSheet(registrations: any[]) {
    if (!serviceAccountEmail) return;
    try {
        const sheets = await getSheetsInstance();
        const spreadsheetId = sheetId!;
        const sheetName = 'Inscrições';

        await ensureHeader(sheets, spreadsheetId, sheetName);

        // Limpa a planilha (exceto o cabeçalho) para evitar duplicatas ou dados antigos
        await sheets.spreadsheets.values.clear({
            spreadsheetId,
            range: `${sheetName}!A2:ZZ`, // Limpa da linha 2 em diante
        });
        
        if (registrations.length === 0) {
            console.log("Nenhum registro para sincronizar. Planilha limpa.");
            return;
        }

        const allValues = registrations.map(reg => {
            const paymentHistory = reg.paymentDetails?.paidInstallments?.map(
                (p: PaidInstallment) => `P${p.installment}: R$${p.amount.toFixed(2)}`
            ).join('; ') || '';
            
            const sheetData: SheetRowData = {
                ...(reg.details as SignUpData),
                // Passa os campos de nível superior para serem usados na formatação
                name: reg.name,
                email: reg.email,
                phone: reg.phone,
                paymentConfirmed: reg.paymentConfirmed,
                isAdoptee: reg.isAdoptee || false, // Passa o novo campo
                paidAt: reg.paidAt ? new Date(reg.paidAt).toISOString() : null,
                createdAt: reg.createdAt ? new Date(reg.createdAt).toISOString() : null,
                paymentMethod: reg.paymentDetails?.method,
                paymentHistory: paymentHistory,
                totalPaid: reg.paymentDetails?.totalPaid || 0,
            };
            return formatDataForSheet(reg.id, sheetData);
        });
        
        await sheets.spreadsheets.values.update({
            spreadsheetId,
            range: `${sheetName}!A2`, // Começa a inserir os dados a partir da segunda linha
            valueInputOption: 'USER_ENTERED',
            requestBody: {
                values: allValues,
            },
        });

        console.log(`${allValues.length} registros foram sincronizados com a planilha.`);

    } catch (error) {
        console.error("Erro durante a sincronização total com Google Sheets:", error);
        throw error;
    }
}

    
// Trigger commit
