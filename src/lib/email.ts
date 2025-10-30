
// Este arquivo é para uso EXCLUSIVO DO SERVIDOR
import { Resend } from 'resend';

// Validação rigorosa das variáveis de ambiente na inicialização.
const resendApiKey = process.env.RESEND_API_KEY;

if (!resendApiKey) {
  console.error("ERRO CRÍTICO: A variável de ambiente RESEND_API_KEY não está definida.");
  throw new Error("Configuração do servidor incompleta: RESEND_API_KEY é necessária.");
}

const resend = new Resend(resendApiKey);

// Usa a variável de ambiente se disponível, senão, usa um padrão com o domínio verificado.
// Isso garante que o sistema funcione com o domínio já verificado.
const fromEmail = process.env.EMAIL_FROM || 'contato@agmcm.online';
const fromAddress = `Equipe do Retiro TF2k26 <${fromEmail}>`;


/**
 * Envia um e-mail de confirmação de inscrição.
 * @param name - O nome do participante.
 * @param email - O e-mail do participante.
 * @throws Lança um erro se o envio do e-mail falhar.
 */
export async function sendRegistrationEmail(name: string, email: string) {
  console.log(`Tentando enviar e-mail de inscrição para ${email}...`);
  try {
    const { data, error } = await resend.emails.send({
      from: fromAddress,
      to: email,
      subject: 'Inscrição para a Temporada de Férias 2026 Recebida!',
      html: `
        <div style="font-family: Arial, sans-serif; line-height: 1.6;">
            <h2>Olá, ${name}!</h2>
            <p>Recebemos com sucesso sua pré-inscrição para o retiro <strong>Temporada de Férias 2026 - Inconformados</strong>.</p>
            <p>Agradecemos seu interesse em fazer parte deste momento especial!</p>
            <p>As instruções para o próximo passo, referente ao pagamento, foram exibidas na tela de conclusão do formulário. Se você optou pelo pagamento via PIX, o QR Code foi gerado para sua conveniência.</p>
            <p>Para pagamentos via carnê ou presencial, por favor, siga as orientações e procure a secretaria da UPA Religados para efetivar o pagamento e garantir sua vaga.</p>
            <p>Qualquer dúvida, não hesite em entrar em contato conosco pelo WhatsApp disponível no site.</p>
            <br>
            <p>Com alegria,</p>
            <p><strong>Equipe da Temporada de Férias 2026</strong></p>
        </div>
      `,
    });

    if (error) {
      console.error("ERRO DA API RESEND (Inscrição): ", error);
      // Lança um erro claro para ser capturado pela action
      throw new Error(`Falha ao enviar o e-mail de inscrição: ${error.message}`);
    }

    console.log(`E-mail de inscrição enviado para ${email}. ID: ${data?.id}`);
  } catch (err) {
    const errorMessage = err instanceof Error ? err.message : "Erro desconhecido ao tentar enviar e-mail.";
    console.error("ERRO CRÍTICO no sendRegistrationEmail:", errorMessage);
    // Relança o erro para que a action que o chamou possa tratá-lo.
    throw new Error(errorMessage);
  }
}

/**
 * Envia um e-mail de confirmação de pagamento.
 * @param name - O nome do participante.
 * @param email - O e-mail do participante.
 * @throws Lança um erro se o envio do e-mail falhar.
 */
export async function sendPaymentSuccessEmail(name: string, email: string) {
  console.log(`Tentando enviar e-mail de confirmação de pagamento para ${email}...`);
  try {
    const { data, error } = await resend.emails.send({
      from: fromAddress,
      to: email,
      subject: 'Pagamento Confirmado! Nos vemos na Temporada de Férias 2026!',
      html: `
        <div style="font-family: Arial, sans-serif; line-height: 1.6;">
            <h2>Oba, ${name}! Temos uma ótima notícia!</h2>
            <p>Seu pagamento foi confirmado e sua vaga para o retiro <strong>Temporada de Férias 2026 - Inconformados</strong> está oficialmente garantida!</p>
            <p>Estamos muito felizes em ter você conosco para viver dias incríveis de comunhão, aprendizado e diversão na presença de Deus.</p>
            <p>Fique de olho em nossos canais de comunicação para mais informações e novidades sobre o evento. Prepare seu coração!</p>
            <br>
            <p>Nos vemos lá!</p>
            <p><strong>Equipe da Temporada de Férias 2026</strong></p>
        </div>
      `,
    });

    if (error) {
      console.error(`ERRO DA API RESEND (Pagamento) para ${email}: `, error);
      // Lança o erro para que o webhook saiba que a operação falhou.
      throw new Error(`Falha ao enviar e-mail de confirmação de pagamento: ${error.message}`);
    } else {
      console.log(`E-mail de confirmação de pagamento enviado para ${email}. ID: ${data?.id}`);
    }
  } catch (err) {
    const errorMessage = err instanceof Error ? err.message : "Erro desconhecido ao tentar enviar e-mail.";
    console.error(`ERRO CRÍTICO no sendPaymentSuccessEmail para ${email}:`, errorMessage);
    // Relança o erro para garantir que a falha seja registrada no webhook.
    throw new Error(errorMessage);
  }
}

/**
 * Envia um e-mail com a resposta para uma dúvida do usuário.
 * @param email - O e-mail do usuário que perguntou.
 * @param question - A pergunta original do usuário.
 * @param answer - A resposta do administrador.
 */
export async function sendQuestionReplyEmail(email: string, question: string, answer: string) {
    console.log(`Tentando enviar e-mail de resposta para ${email}...`);
    try {
        const { data, error } = await resend.emails.send({
            from: fromAddress,
            to: email,
            subject: 'Sua dúvida sobre a Temporada de Férias foi respondida!',
            html: `
                <div style="font-family: Arial, sans-serif; line-height: 1.6; color: #333;">
                    <h2>Olá!</h2>
                    <p>Recebemos sua dúvida sobre o nosso retiro e nossa equipe já preparou uma resposta para você. Confira abaixo:</p>
                    <br>
                    <div style="background-color: #f7f7f7; padding: 15px; border-radius: 8px; border-left: 4px solid #ccc;">
                        <p style="font-size: 14px; color: #555; margin: 0;"><strong>Sua pergunta:</strong></p>
                        <p style="font-size: 16px; margin-top: 5px; font-style: italic;">"${question}"</p>
                    </div>
                    <br>
                     <div style="background-color: #e8f5e9; padding: 15px; border-radius: 8px; border-left: 4px solid #4CAF50;">
                        <p style="font-size: 14px; color: #333; margin: 0;"><strong>Nossa resposta:</strong></p>
                        <p style="font-size: 16px; margin-top: 5px; white-space: pre-wrap;">${answer}</p>
                    </div>
                    <br>
                    <p>Esperamos que isso ajude! Se precisar de mais alguma coisa, é só perguntar.</p>
                    <br>
                    <p>Atenciosamente,</p>
                    <p><strong>Equipe da Temporada de Férias 2026</strong></p>
                </div>
            `,
        });

        if (error) {
            console.error(`ERRO DA API RESEND (Resposta) para ${email}: `, error);
            throw new Error(`Falha ao enviar e-mail de resposta: ${error.message}`);
        } else {
            console.log(`E-mail de resposta enviado para ${email}. ID: ${data?.id}`);
        }
    } catch (err) {
        const errorMessage = err instanceof Error ? err.message : "Erro desconhecido ao tentar enviar e-mail.";
        console.error(`ERRO CRÍTICO no sendQuestionReplyEmail para ${email}:`, errorMessage);
        throw new Error(errorMessage);
    }
}
// Trigger commit
