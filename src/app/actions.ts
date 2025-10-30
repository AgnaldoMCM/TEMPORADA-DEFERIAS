
"use server";

import { z, type typeToFlattenedError } from 'zod';
import { SignUpSchema, QuestionSchema } from "@/lib/types";
import { db, authAdmin } from "@/lib/firebase-admin"; // só admin
import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import { getIronSession } from 'iron-session';
import { SessionData, sessionOptions } from "@/lib/session";
import { sendRegistrationEmail, sendPaymentSuccessEmail, sendQuestionReplyEmail } from "@/lib/email";
import { revalidatePath } from 'next/cache';
import type { Registration, SignUpData, Question, PaidInstallment, ActivityLog } from "@/lib/types";
import { addRowToSheet, updateRowInSheet, syncAllToSheet } from "@/lib/sheets";
import { startOfDay, startOfWeek, startOfMonth, isWithinInterval } from 'date-fns';


// A `FormState` agora precisa refletir o novo schema `SignUpSchema`
export type FormState = {
  message: string;
  errors?: typeToFlattenedError<SignUpData>["fieldErrors"] | null;
  data?: SignUpData | null;
  redirectUrl?: string;
  success?: boolean;
};


// --- Cadastro com o novo formulário ---
export async function handleSignUp(prevState: FormState, formData: FormData): Promise<FormState> {
    
  // Convertendo FormData para um objeto para validação
  const rawData = Object.fromEntries(formData.entries());

  // Tratamento especial para checkboxes que não vêm no FormData se não estiverem marcados
  const processedData = {
    ...rawData,
    electronicsAware: rawData.electronicsAware === 'on',
    refundPolicyAgreement: rawData.refundPolicyAgreement === 'on',
    guardianAuthorizationAgreement: rawData.guardianAuthorizationAgreement === 'on',
    shirtPolicyAgreement: rawData.shirtPolicyAgreement === 'on',
    // CORREÇÃO: O valor vem como 'on' de um campo hidden
    payFirstInstallmentWithPix: rawData.payFirstInstallmentWithPix === 'on',
  };

  const validatedFields = SignUpSchema.safeParse(processedData);

  if (!validatedFields.success) {
    console.log(validatedFields.error.flatten().fieldErrors);
    return {
      message: 'Por favor, corrija os erros no formulário.',
      errors: validatedFields.error.flatten().fieldErrors,
      data: processedData as any, // Retorna os dados brutos para preencher o form
      success: false,
    };
  }

  const { teenName, teenPhone, guardianEmail, paymentMethod, amountPaid, payFirstInstallmentWithPix } = validatedFields.data;
  
  try {
      const registrationTime = new Date();
      
      let initialPaidAmount = 0;
      // CORREÇÃO: A lógica agora considera o valor vindo do campo `amountPaid` quando `payFirstInstallmentWithPix` é true.
      if (payFirstInstallmentWithPix && paymentMethod === 'carne' && amountPaid) {
          // Se vai pagar a primeira com PIX, o valor é o que foi digitado.
          initialPaidAmount = parseFloat(amountPaid.replace(/[^0-9,-]/g, '').replace(',', '.'));
      }

      let installmentsTotal = 1;
      if (paymentMethod === 'carne') installmentsTotal = 3;
      if (paymentMethod === 'pix') installmentsTotal = 1;


      const docRef = await db.collection("registrations").add({
        name: teenName, // Campo principal para fácil identificação no admin
        email: guardianEmail, // Campo principal para fácil identificação no admin
        phone: teenPhone, // Campo principal para fácil identificação no admin
        paymentConfirmed: false, // Pagamento sempre pendente na inscrição
        isAdoptee: false, // Inscrições normais nunca começam como "Adote"
        createdAt: registrationTime,
        details: validatedFields.data, // Armazena todos os dados validados
        paymentDetails: {
          method: paymentMethod,
          installmentsTotal: installmentsTotal,
          // CORREÇÃO: Salva a primeira parcela se o valor for maior que zero (vindo do PIX do carnê)
          paidInstallments: initialPaidAmount > 0 && paymentMethod === 'carne' ? [{
              installment: 1,
              amount: initialPaidAmount,
              date: registrationTime.toISOString(),
              confirmedBy: 'auto-register-pix', // Identificador de pagamento inicial via PIX
          }] : [],
          totalPaid: initialPaidAmount,
          paymentConfirmedBy: null,
        },
      });

      // INTEGRAÇÃO GOOGLE SHEETS: Adiciona a nova inscrição na planilha
      try {
        const newRegData = (await docRef.get()).data() as Registration;
        await addRowToSheet(docRef.id, {
            ...newRegData, // Passa o objeto de registro inteiro
            ...(newRegData.details as SignUpData),
            paymentConfirmed: newRegData.paymentConfirmed,
            isAdoptee: newRegData.isAdoptee || false,
            paidAt: newRegData.paidAt ? new Date(newRegData.paidAt).toISOString() : null,
            createdAt: newRegData.createdAt ? new Date(newRegData.createdAt).toISOString() : null,
            paymentMethod: newRegData.paymentDetails?.method,
            paymentHistory: newRegData.paymentDetails?.paidInstallments?.map(p => `P${p.installment}: R$${p.amount.toFixed(2)}`).join('; ') || '',
            totalPaid: newRegData.paymentDetails?.totalPaid || 0,
        });
      } catch (sheetError) {
          console.error("ERRO NA INTEGRAÇÃO COM GOOGLE SHEETS (ao adicionar):", sheetError);
          // Não impede o fluxo principal, apenas loga o erro.
      }
      
      // Envia email de confirmação de "pré-inscrição"
      await sendRegistrationEmail(teenName, guardianEmail);

      const responseData = { ...validatedFields.data, id: docRef.id };

      return {
        message: "Inscrição recebida! O pagamento deve ser tratado diretamente com a organização.",
        errors: null,
        data: responseData,
        success: true,
        redirectUrl: '/success'
      };

  } catch (error) {
    console.error("ERRO CRÍTICO NO PROCESSO DE INSCRIÇÃO: ", error);
    const errorMessage = error instanceof Error ? error.message : "Erro desconhecido no servidor.";
    return {
        message: `Ocorreu um erro no servidor. Por favor, tente novamente mais tarde. Detalhe: ${errorMessage}`,
        errors: null,
        data: processedData as any,
        success: false,
    };
  }
}

// --- Autenticação Admin ---
export async function createSession(idToken: string) {
  try {
    const decodedToken = await authAdmin.verifyIdToken(idToken);

    if (decodedToken) {
      const cookieStore = await cookies();
      const session = await getIronSession<SessionData>(cookieStore, sessionOptions);
      session.isLoggedIn = true;
      session.email = decodedToken.email; // Salva o email do admin na sessão
      await session.save();
      return { success: true };
    }
    return { success: false, error: "Token inválido." };
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : "Erro desconhecido na verificação do token.";
    console.error("Erro ao criar sessão: ", error);
    return { success: false, error: errorMessage };
  }
}

export async function logout() {
  const cookieStore = await cookies();
  const session = await getIronSession<SessionData>(cookieStore, sessionOptions);
  session.destroy();
  redirect('/admin/login');
}

// --- Buscar inscrições (ADMIN) ---
export async function getRegistrations() {
  const cookieStore = await cookies();
  const session = await getIronSession<SessionData>(cookieStore, sessionOptions);
  if (!session.isLoggedIn) {
    redirect('/admin/login');
  }

  try {
    const snapshot = await db.collection("registrations")
      .orderBy("createdAt", "desc")
      .get();

    const registrations = snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data(),
      createdAt: doc.data().createdAt?.toDate().toISOString() || null,
      paidAt: doc.data().paidAt?.toDate().toISOString() || null,
    }));

    return registrations as Registration[];
  } catch (error) {
    console.error("Erro ao buscar inscrições:", error);
    throw new Error('Falha ao buscar dados do Firestore.');
  }
}

// --- Buscar UMA inscrição (ADMIN) ---
export async function getRegistrationById(id: string): Promise<Registration | null> {
    const cookieStore = await cookies();
    const session = await getIronSession<SessionData>(cookieStore, sessionOptions);
    if (!session.isLoggedIn) {
        redirect('/admin/login');
    }

    return getPublicRegistrationById(id);
}

// --- Buscar UMA inscrição (PÚBLICO) ---
export async function getPublicRegistrationById(id: string): Promise<Registration | null> {
    try {
        const doc = await db.collection("registrations").doc(id).get();
        if (!doc.exists) {
            return null;
        }
        const data = doc.data() as Registration;
        return {
            ...data,
            id: doc.id,
            createdAt: data.createdAt ? (data.createdAt as any).toDate().toISOString() : null,
            paidAt: data.paidAt ? (data.paidAt as any).toDate().toISOString() : null,
        };
    } catch (error) {
        console.error(`Erro ao buscar inscrição ${id}:`, error);
        throw new Error('Falha ao buscar dados do Firestore.');
    }
}


// --- Atualizar Status de Pagamento (Carnê - Admin) ---
export async function updateCarnetPaymentStatus(
    registrationId: string, 
    installmentNumber: number,
    amount: number,
    finalizePayment: boolean = false
): Promise<{ success: boolean; message: string }> {
    const cookieStore = await cookies();
    const session = await getIronSession<SessionData>(cookieStore, sessionOptions);
    if (!session.isLoggedIn) {
        return { success: false, message: "Acesso não autorizado." };
    }
    const adminEmail = session.email || 'Admin Desconhecido';

    if (!registrationId) {
        return { success: false, message: "ID da inscrição não fornecido." };
    }

    try {
        const registrationRef = db.collection("registrations").doc(registrationId);
        const doc = await registrationRef.get();

        if (!doc.exists) {
            return { success: false, message: "Inscrição não encontrada." };
        }

        const registrationData = doc.data() as Registration;
        const paidAtDate = new Date();
        const newPayment: PaidInstallment = { 
            installment: installmentNumber, 
            amount, 
            date: paidAtDate.toISOString(),
            confirmedBy: adminEmail 
        };
        
        let paidInstallments = registrationData.paymentDetails?.paidInstallments || [];
        
        // Verifica se a parcela já foi paga e atualiza, senão adiciona
        const existingInstallmentIndex = paidInstallments.findIndex(p => p.installment === installmentNumber);
        if (existingInstallmentIndex > -1) {
            paidInstallments[existingInstallmentIndex] = newPayment;
        } else {
            paidInstallments.push(newPayment);
        }
        
        const totalPaid = paidInstallments.reduce((acc, curr) => acc + curr.amount, 0);

        const updateData: { [key: string]: any } = {
            'paymentDetails.paidInstallments': paidInstallments,
            'paymentDetails.totalPaid': totalPaid,
        };

        if (finalizePayment) {
            updateData.paymentConfirmed = true;
            updateData.paidAt = paidAtDate;
            updateData['paymentDetails.paymentConfirmedBy'] = adminEmail;

            // Envia e-mail de sucesso apenas na finalização.
            if (registrationData?.email && !registrationData.paymentConfirmed) {
                await sendPaymentSuccessEmail(registrationData.name, registrationData.email);
            }
        }

        await registrationRef.update(updateData);

        // INTEGRAÇÃO GOOGLE SHEETS: Atualiza a linha na planilha
        try {
            const fullRegData = (await registrationRef.get()).data() as Registration;
            if (fullRegData.details) {
                const paymentHistory = fullRegData.paymentDetails?.paidInstallments?.map(p => `P${p.installment}: R$${p.amount.toFixed(2)}`).join('; ') || '';
                const updatedSheetData = {
                    ...fullRegData, // Passa o objeto completo
                    ...fullRegData.details,
                    paymentConfirmed: fullRegData.paymentConfirmed,
                    isAdoptee: fullRegData.isAdoptee || false,
                    paidAt: fullRegData.paidAt ? new Date(fullRegData.paidAt).toISOString() : null,
                    createdAt: fullRegData.createdAt ? new Date(fullRegData.createdAt).toISOString() : null,
                    paymentHistory: paymentHistory,
                    totalPaid: fullRegData.paymentDetails?.totalPaid || 0,
                    paymentMethod: fullRegData.paymentDetails?.method,
                };
                await updateRowInSheet(registrationId, updatedSheetData);
            }
        } catch(sheetError) {
            console.error("ERRO NA INTEGRAÇÃO COM GOOGLE SHEETS (ao atualizar):", sheetError);
        }
        
        revalidatePath('/admin');
        revalidatePath('/admin/dashboard');

        return { success: true, message: "Status do pagamento atualizado com sucesso." };

    } catch (error) {
        console.error(`ERRO AO ATUALIZAR STATUS DE PAGAMENTO para ${registrationId}:`, error);
        const errorMessage = error instanceof Error ? error.message : "Erro desconhecido no servidor.";
        return { success: false, message: `Falha ao atualizar status: ${errorMessage}` };
    }
}

// --- Buscar Estatísticas para o Dashboard ---
export async function getRegistrationStats() {
    const registrations = await getRegistrations(); // Reutiliza a função que já tem a validação de sessão

    if (!registrations || registrations.length === 0) {
        return {
            total: 0,
            normalRegistrations: 0,
            adoptees: 0,
            confirmed: 0,
            pending: 0,
            revenue: 0,
            newToday: 0,
            newThisWeek: 0,
            newThisMonth: 0,
            byGender: [],
            byParticipationType: [],
            byPaymentMethod: [],
            byRegistrationValue: [],
            byShirtSize: [],
            byAge: [],
            byImageAuthorization: [],
            alerts: {
                dietaryRestrictions: 0,
                physicalLimitations: 0,
                underTreatment: 0,
            },
        };
    }

    const now = new Date();
    const todayStart = startOfDay(now);
    const weekStart = startOfWeek(now);
    const monthStart = startOfMonth(now);

    const stats = registrations.reduce((acc, reg) => {
        // Core Stats
        if (reg.paymentConfirmed) {
            acc.confirmed += 1;
            acc.revenue += reg.paymentDetails?.totalPaid || 0;
        }

        if (reg.isAdoptee) {
            acc.adoptees += 1;
        }

        const createdAtDate = reg.createdAt ? new Date(reg.createdAt) : null;
        if(createdAtDate) {
            if (isWithinInterval(createdAtDate, { start: todayStart, end: now })) {
                acc.newToday += 1;
            }
             if (isWithinInterval(createdAtDate, { start: weekStart, end: now })) {
                acc.newThisWeek += 1;
            }
            if (isWithinInterval(createdAtDate, { start: monthStart, end: now })) {
                acc.newThisMonth += 1;
            }
        }
        
        // Chart: Gender
        const gender = reg.details?.teenGender === 'female' ? 'Feminino' : 'Masculino';
        acc.byGender[gender] = (acc.byGender[gender] || 0) + 1;

        // Chart: Participation Type
        const participationTypeMap: { [key: string]: string } = { member: 'Membro IPManaus', guest: 'Convidado', congregation: 'Congregação' };
        const type = participationTypeMap[reg.details?.participationType || 'guest'] || 'Outro';
        acc.byParticipationType[type] = (acc.byParticipationType[type] || 0) + 1;
        
        // Chart: Payment Method
        const paymentMethodMap: { [key: string]: string } = { presencial: 'Presencial - À vista', carne: 'Carnê-Parcelamento', pix: 'PIX' };
        const method = paymentMethodMap[reg.paymentDetails?.method || 'carne'] || 'Outro';
        acc.byPaymentMethod[method] = (acc.byPaymentMethod[method] || 0) + 1;

        // Chart: Registration Value
        const value = `R$ ${reg.details?.registrationValue || '0'}`;
        acc.byRegistrationValue[value] = (acc.byRegistrationValue[value] || 0) + 1;
        
        // Chart: Shirt Size
        const size = reg.details?.shirtSize || 'N/A';
        acc.byShirtSize[size] = (acc.byShirtSize[size] || 0) + 1;

        // Chart: Age
        const age = reg.details?.teenAge ? `${reg.details.teenAge} anos` : 'N/A';
        acc.byAge[age] = (acc.byAge[age] || 0) + 1;

        // Chart: Image Authorization
        const auth = reg.details?.imageAndVoiceAuthorization === 'authorized' ? 'Autorizado' : 'Não Autorizado';
        acc.byImageAuthorization[auth] = (acc.byImageAuthorization[auth] || 0) + 1;
        
        // Alerts
        if (reg.details?.hasDietaryRestrictions === 'yes') acc.alerts.dietaryRestrictions += 1;
        if (reg.details?.canDoPhysicalActivities === 'no') acc.alerts.physicalLimitations += 1;
        if (reg.details?.isUnderTreatment === 'yes') acc.alerts.underTreatment += 1;
        
        return acc;

    }, {
        confirmed: 0,
        adoptees: 0,
        revenue: 0,
        newToday: 0,
        newThisWeek: 0,
        newThisMonth: 0,
        byGender: {} as Record<string, number>,
        byParticipationType: {} as Record<string, number>,
        byPaymentMethod: {} as Record<string, number>,
        byRegistrationValue: {} as Record<string, number>,
        byShirtSize: {} as Record<string, number>,
        byAge: {} as Record<string, number>,
        byImageAuthorization: {} as Record<string, number>,
        alerts: { dietaryRestrictions: 0, physicalLimitations: 0, underTreatment: 0 },
    });

    const formatChartData = (data: Record<string, number>) => Object.entries(data).map(([name, value]) => ({ name, value }));

    return {
        total: registrations.length,
        normalRegistrations: registrations.length - stats.adoptees,
        adoptees: stats.adoptees,
        confirmed: stats.confirmed,
        pending: registrations.length - stats.confirmed,
        revenue: stats.revenue,
        newToday: stats.newToday,
        newThisWeek: stats.newThisWeek,
        newThisMonth: stats.newThisMonth,
        byGender: formatChartData(stats.byGender),
        byParticipationType: formatChartData(stats.byParticipationType),
        byPaymentMethod: formatChartData(stats.byPaymentMethod),
        byRegistrationValue: formatChartData(stats.byRegistrationValue),
        byShirtSize: formatChartData(stats.byShirtSize).sort((a,b) => a.name.localeCompare(b.name)),
        byAge: formatChartData(stats.byAge).sort((a, b) => parseInt(a.name) - parseInt(b.name)),
        byImageAuthorization: formatChartData(stats.byImageAuthorization),
        alerts: stats.alerts,
    };
}


// --- Sincronizar Todos os Dados com a Planilha Google ---
export async function syncAllRegistrationsToSheet(): Promise<{ success: boolean; message: string }> {
    const cookieStore = await cookies();
    const session = await getIronSession<SessionData>(cookieStore, sessionOptions);
    if (!session.isLoggedIn) {
        return { success: false, message: "Acesso não autorizado." };
    }
    
    try {
        console.log("Iniciando sincronização manual com o Google Sheets...");
        const registrations = await getRegistrations(); // Isso já tem validação de sessão

        if (!registrations || registrations.length === 0) {
            await syncAllToSheet([]); // Limpa a planilha se não houver registros
            return { success: true, message: "Nenhuma inscrição para sincronizar. Planilha limpa." };
        }
        
        // Transforma os dados crus do Firestore para o formato que a planilha espera.
        const sheetData = registrations.map(reg => {
            const paymentHistory = reg.paymentDetails?.paidInstallments
                ?.map((p: PaidInstallment) => `P${p.installment}: R$${p.amount.toFixed(2)}`)
                .join('; ') || '';

            return {
                ...reg, // Passa o objeto de registro completo
                ...reg.details,
                paymentConfirmed: reg.paymentConfirmed,
                isAdoptee: reg.isAdoptee || false,
                paidAt: reg.paidAt ? new Date(reg.paidAt).toISOString() : null,
                createdAt: reg.createdAt ? new Date(reg.createdAt).toISOString() : null,
                paymentMethod: reg.paymentDetails?.method,
                paymentHistory,
                totalPaid: reg.paymentDetails?.totalPaid || 0,
            };
        });
        
        // A função `syncAllToSheet` agora lida com todo o lote.
        await syncAllToSheet(sheetData);

        console.log(`Sincronização manual concluída. ${registrations.length} registros processados.`);
        return { success: true, message: `Sincronização concluída com sucesso! ${registrations.length} registros foram atualizados na planilha.` };

    } catch (error) {
        console.error("ERRO DURANTE A SINCRONIZAÇÃO MANUAL COM GOOGLE SHEETS:", error);
        const errorMessage = error instanceof Error ? error.message : "Erro desconhecido no servidor.";
        return { success: false, message: `Falha na sincronização: ${errorMessage}` };
    }
}

// --- Ações de Perguntas e Respostas ---

export type QuestionFormState = {
  message: string;
  errors?: typeToFlattenedError<Question>["fieldErrors"] | null;
  success?: boolean;
};


export async function handleQuestionSubmit(prevState: QuestionFormState, formData: FormData): Promise<QuestionFormState> {
  const rawData = Object.fromEntries(formData.entries());
  const validatedFields = QuestionSchema.safeParse(rawData);

  if (!validatedFields.success) {
    return {
      message: 'Por favor, corrija os erros no formulário.',
      errors: validatedFields.error.flatten().fieldErrors,
      success: false,
    };
  }

  try {
    await db.collection("questions").add({
      ...validatedFields.data,
      status: 'pending',
      createdAt: new Date(),
      answer: null,
      answeredAt: null,
      answeredBy: null,
      archivedBy: null, // Novo campo
      archivedAt: null,
    });

    return {
      message: "Sua pergunta foi enviada com sucesso! A resposta será enviada para o seu e-mail.",
      errors: null,
      success: true,
    };
  } catch (error) {
    console.error("ERRO AO ENVIAR PERGUNTA: ", error);
    return {
      message: "Ocorreu um erro no servidor. Tente novamente.",
      errors: null,
      success: false,
    };
  }
}

export async function getQuestions(): Promise<Question[]> {
  const cookieStore = await cookies();
  const session = await getIronSession<SessionData>(cookieStore, sessionOptions);
  if (!session.isLoggedIn) {
    redirect('/admin/login');
  }

  try {
    const snapshot = await db.collection("questions")
      .orderBy("createdAt", "desc")
      .get();
      
    return snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data(),
      createdAt: doc.data().createdAt?.toDate().toISOString() || null,
      answeredAt: doc.data().answeredAt?.toDate().toISOString() || null,
    })) as Question[];

  } catch (error) {
    console.error("Erro ao buscar perguntas:", error);
    throw new Error('Falha ao buscar perguntas do Firestore.');
  }
}

export async function handleQuestionReply(questionId: string, answer: string): Promise<{ success: boolean; message: string }> {
    const cookieStore = await cookies();
    const session = await getIronSession<SessionData>(cookieStore, sessionOptions);
    if (!session.isLoggedIn) {
        return { success: false, message: "Acesso não autorizado." };
    }
     if (!answer || answer.trim().length < 10) {
        return { success: false, message: "A resposta deve ter pelo menos 10 caracteres." };
    }

    try {
        const questionRef = db.collection("questions").doc(questionId);
        const doc = await questionRef.get();

        if (!doc.exists) {
            return { success: false, message: "Pergunta não encontrada." };
        }

        const questionData = doc.data() as Question;

        await questionRef.update({
            answer: answer,
            status: 'answered',
            answeredAt: new Date(),
            answeredBy: session.email || "Admin", // Salva o email do admin
        });
        
        await sendQuestionReplyEmail(questionData.email, questionData.question, answer);
        
        revalidatePath('/admin/questions');
        revalidatePath('/admin/logs');


        return { success: true, message: "Resposta enviada com sucesso!" };

    } catch (error) {
        const errorMessage = error instanceof Error ? error.message : "Erro desconhecido no servidor.";
        console.error(`ERRO AO RESPONDER PERGUNTA ${questionId}:`, error);
        return { success: false, message: `Falha ao enviar resposta: ${errorMessage}` };
    }
}

export async function deleteQuestion(questionId: string): Promise<{ success: boolean; message: string }> {
    const cookieStore = await cookies();
    const session = await getIronSession<SessionData>(cookieStore, sessionOptions);
    if (!session.isLoggedIn) {
        return { success: false, message: "Acesso não autorizado." };
    }
    const adminEmail = session.email || 'Admin Desconhecido';

    try {
        const questionRef = db.collection("questions").doc(questionId);
        const doc = await questionRef.get();

        if (!doc.exists) {
            return { success: false, message: "Pergunta não encontrada." };
        }

        // Em vez de excluir, arquivamos a pergunta para manter o log
        await questionRef.update({
            status: 'archived',
            archivedBy: adminEmail,
            archivedAt: new Date(),
        });
        
        revalidatePath('/admin/questions');
        revalidatePath('/admin/logs');

        return { success: true, message: "Pergunta arquivada com sucesso!" };

    } catch (error) {
        const errorMessage = error instanceof Error ? error.message : "Erro desconhecido no servidor.";
        console.error(`ERRO AO ARQUIVAR PERGUNTA ${questionId}:`, error);
        return { success: false, message: `Falha ao arquivar pergunta: ${errorMessage}` };
    }
}


// --- Ações de Logs ---

export async function getActivityLogs(): Promise<ActivityLog[]> {
    const cookieStore = await cookies();
    const session = await getIronSession<SessionData>(cookieStore, sessionOptions);
    if (!session.isLoggedIn) {
        redirect('/admin/login');
    }

    try {
        const registrations = await getRegistrations();
        const questions = await getQuestions();

        const logs: ActivityLog[] = [];

        registrations.forEach(reg => {
            if (reg.createdAt) {
                logs.push({
                    date: reg.createdAt,
                    actor: "Sistema",
                    action: `Nova inscrição recebida para ${reg.name}.`,
                    type: "registration",
                    targetId: reg.id
                });
            }
            if (reg.paymentConfirmed && reg.paidAt && reg.paymentDetails?.paymentConfirmedBy) {
                 logs.push({
                    date: reg.paidAt,
                    actor: reg.paymentDetails.paymentConfirmedBy,
                    action: `Pagamento final confirmado para ${reg.name}.`,
                    type: "payment",
                    targetId: reg.id
                });
            }
            reg.paymentDetails?.paidInstallments?.forEach(p => {
                if (p.confirmedBy) {
                     logs.push({
                        date: p.date,
                        actor: p.confirmedBy,
                        action: `Parcela ${p.installment} (R$ ${p.amount.toFixed(2)}) paga por ${reg.name}.`,
                        type: "payment",
                        targetId: reg.id
                    });
                }
            });
        });

        questions.forEach(q => {
            if(q.createdAt) {
                 logs.push({
                    date: q.createdAt,
                    actor: q.email,
                    action: `Nova dúvida recebida: "${q.question.substring(0, 30)}...".`,
                    type: "question",
                    targetId: q.id
                });
            }
            if (q.status === 'answered' && q.answeredAt && q.answeredBy) {
                logs.push({
                    date: q.answeredAt,
                    actor: q.answeredBy,
                    action: `Dúvida de ${q.email} foi respondida.`,
                    type: "question",
                    targetId: q.id
                });
            }
             if (q.status === 'archived' && q.archivedAt && q.archivedBy) {
                logs.push({
                    date: q.archivedAt,
                    actor: q.archivedBy,
                    action: `Dúvida de ${q.email} foi arquivada.`,
                    type: "question",
                    targetId: q.id
                });
            }
        });

        // Ordena os logs pela data, do mais recente para o mais antigo
        return logs.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

    } catch (error) {
        console.error("Erro ao buscar logs de atividade:", error);
        throw new Error('Falha ao buscar logs de atividade.');
    }
}
    
// --- Ações do programa "Adote" ---
export async function updateAdopteeStatus(
  registrationId: string,
  isAdoptee: boolean
): Promise<{ success: boolean; message: string }> {
  const cookieStore = await cookies();
  const session = await getIronSession<SessionData>(cookieStore, sessionOptions);
  if (!session.isLoggedIn) {
    return { success: false, message: "Acesso não autorizado." };
  }

  try {
    const registrationRef = db.collection("registrations").doc(registrationId);
    await registrationRef.update({ isAdoptee: isAdoptee });

    // INTEGRAÇÃO GOOGLE SHEETS: Atualiza a linha na planilha
    try {
        const fullRegData = (await registrationRef.get()).data() as Registration;
        if (fullRegData.details) {
            const paymentHistory = fullRegData.paymentDetails?.paidInstallments?.map(p => `P${p.installment}: R$${p.amount.toFixed(2)}`).join('; ') || '';
            const updatedSheetData = {
                ...fullRegData, // Passa o objeto completo
                ...fullRegData.details,
                paymentConfirmed: fullRegData.paymentConfirmed,
                isAdoptee: fullRegData.isAdoptee || false,
                paidAt: fullRegData.paidAt ? new Date(fullRegData.paidAt).toISOString() : null,
                createdAt: fullRegData.createdAt ? new Date(fullRegData.createdAt).toISOString() : null,
                paymentHistory: paymentHistory,
                totalPaid: fullRegData.paymentDetails?.totalPaid || 0,
                paymentMethod: fullRegData.paymentDetails?.method,
            };
            await updateRowInSheet(registrationId, updatedSheetData);
        }
    } catch(sheetError) {
        console.error("ERRO NA INTEGRAÇÃO COM GOOGLE SHEETS (ao atualizar status 'adotante'):", sheetError);
    }


    revalidatePath('/admin');
    revalidatePath(`/admin/registrations/${registrationId}`);
    revalidatePath('/admin/dashboard');


    const message = isAdoptee
      ? "Participante marcado como 'Adotante' com sucesso."
      : "Marcação 'Adotante' removida com sucesso.";
      
    return { success: true, message };

  } catch (error) {
    console.error(`Erro ao atualizar status 'Adotante' para ${registrationId}:`, error);
    const errorMessage = error instanceof Error ? error.message : "Erro desconhecido no servidor.";
    return { success: false, message: `Falha ao atualizar status: ${errorMessage}` };
  }
}
// Trigger commit
