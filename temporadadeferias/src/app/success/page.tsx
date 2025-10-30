
"use client";

import { Suspense, useEffect, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import { CheckCircle2, Loader2, QrCode, Copy, AlertTriangle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { getPublicRegistrationById } from '@/app/actions';
import type { Registration } from '@/lib/types';
import QRCode from "react-qr-code";
import { useToast } from "@/hooks/use-toast";

// Função para gerar o payload do PIX (BR Code)
function generatePixPayload(pixKey: string, merchantName: string, merchantCity: string, txid: string, amount: string): string {
    const payloadFormatIndicator = '000201';
    const pointOfInitiationMethod = '010212'; // 12 para indicar que um QR Code dinâmico pode ser usado

    const merchantAccountInformation = [
        '26' + (('0014BR.GOV.BCB.PIX' + '01' + pixKey.length.toString().padStart(2, '0') + pixKey).length).toString().padStart(2, '0'),
        '0014BR.GOV.BCB.PIX',
        '01' + pixKey.length.toString().padStart(2, '0') + pixKey,
    ].join('');

    const merchantCategoryCode = '52040000'; // 0000 para não especificado
    const transactionCurrency = '5303986'; // 986 for BRL
    const transactionAmount = '54' + amount.length.toString().padStart(2, '0') + amount;
    const countryCode = '5802BR';
    const merchantNameField = '59' + merchantName.length.toString().padStart(2, '0') + merchantName;
    const merchantCityField = '60' + merchantCity.length.toString().padStart(2, '0') + merchantCity;

    const additionalDataFieldTemplate = [
        '62' + (('05' + txid.length.toString().padStart(2, '0') + txid).length).toString().padStart(2, '0'),
        '05' + txid.length.toString().padStart(2, '0') + txid
    ].join('');

    const payload = [
        payloadFormatIndicator,
        // pointOfInitiationMethod,
        merchantAccountInformation,
        merchantCategoryCode,
        transactionCurrency,
        transactionAmount,
        countryCode,
        merchantNameField,
        merchantCityField,
        additionalDataFieldTemplate
    ].join('');

    const crc16 = computeCRC16(payload + '6304');
    return payload + '6304' + crc16;
}

function computeCRC16(payload: string): string {
    let crc = 0xFFFF;
    const polynomial = 0x1021;
    for (let i = 0; i < payload.length; i++) {
        crc ^= (payload.charCodeAt(i) & 0xFF) << 8;
        for (let j = 0; j < 8; j++) {
            if ((crc & 0x8000) !== 0) {
                crc = (crc << 1) ^ polynomial;
            } else {
                crc <<= 1;
            }
        }
    }
    return (crc & 0xFFFF).toString(16).toUpperCase().padStart(4, '0');
}


function PixPaymentDetails({ registration }: { registration: Registration }) {
    const { toast } = useToast();
    const [pixPayload, setPixPayload] = useState('');
    const pixKey = "upareligados@ipmanaus.com.br"; // Chave PIX oficial
    
    // Define o valor a ser pago
    let amountToPay = 0;

    if (registration.paymentDetails?.method === 'pix') {
        // PIX integral
        amountToPay = parseFloat(registration.details?.registrationValue || '0');
    } else if (registration.paymentDetails?.method === 'carne' && registration.details?.payFirstInstallmentWithPix) {
        // Carnê com primeira parcela via PIX
        amountToPay = registration.paymentDetails.totalPaid > 0 
            ? registration.paymentDetails.totalPaid
            : parseFloat(registration.details?.amountPaid?.replace(',', '.') || '0');
    }

    const amount = amountToPay.toFixed(2);
    if (amountToPay <= 0) {
        return (
             <div className="text-center">
                <AlertTriangle className="h-16 w-16 text-amber-500 mx-auto" />
                <CardTitle className="mt-6 text-2xl font-bold">Valor para PIX Inválido</CardTitle>
                <CardDescription className="mt-2 text-center">
                    Não foi possível gerar um QR Code pois o valor do pagamento é zero ou inválido. Por favor, volte e verifique o formulário.
                </CardDescription>
            </div>
        )
    }

    const txid = registration.id.substring(0, 25); // Usa o ID da inscrição como TXID
    const merchantName = "UPA Religados";
    const merchantCity = "Manaus";

    useEffect(() => {
        const payload = generatePixPayload(pixKey, merchantName, merchantCity, txid, amount);
        setPixPayload(payload);
    }, [pixKey, merchantName, merchantCity, txid, amount]);

    const handleCopy = () => {
        navigator.clipboard.writeText(pixPayload);
        toast({
            title: "Copiado!",
            description: "O código PIX Copia e Cola foi copiado para a área de transferência.",
            className: "bg-green-500 text-white",
        });
    };

    return (
        <div className="text-center">
            <QrCode className="h-16 w-16 text-primary mx-auto" />
            <CardTitle className="mt-6 text-2xl font-bold">Pague com PIX para garantir sua vaga</CardTitle>
            <CardDescription className="mt-2 text-center">
                Escaneie o QR Code abaixo com o app do seu banco ou use o código "Copia e Cola".
            </CardDescription>

            <div className="mt-4 p-4 bg-amber-100 dark:bg-amber-900/30 border border-amber-300 dark:border-amber-700 rounded-lg">
                <div className="flex items-center justify-center gap-2">
                     <AlertTriangle className="h-5 w-5 text-amber-600 dark:text-amber-400" />
                     <h3 className="font-semibold text-amber-800 dark:text-amber-300">Atenção!</h3>
                </div>
                 <p className="mt-2 text-base text-amber-900 dark:text-amber-200">
                    Após o pagamento, envie o comprovante para o WhatsApp da secretaria da UPA no número <strong className="whitespace-nowrap">(92) 99344-0353</strong> para confirmar sua inscrição.
                 </p>
            </div>

            <div className="my-6 flex justify-center">
                <div className="bg-white p-4 rounded-lg shadow-lg">
                    <QRCode value={pixPayload} size={192} />
                </div>
            </div>

            <div className="space-y-4">
                 <p className="text-lg font-semibold">Valor: R$ {parseFloat(amount).toFixed(2).replace('.', ',')}</p>
                <div className="relative">
                    <p className="text-sm bg-muted text-muted-foreground p-3 rounded-md break-all font-mono">
                        {pixPayload}
                    </p>
                    <Button size="icon" variant="ghost" className="absolute top-1 right-1 h-8 w-8" onClick={handleCopy}>
                        <Copy className="h-4 w-4" />
                    </Button>
                </div>
                <Button onClick={handleCopy} className="w-full">
                    <Copy className="mr-2 h-4 w-4" />
                    Copiar Código PIX
                </Button>
            </div>
        </div>
    );
}


function SuccessContent() {
    const searchParams = useSearchParams();
    const registrationId = searchParams.get('id');
    const [registration, setRegistration] = useState<Registration | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (registrationId) {
            getPublicRegistrationById(registrationId)
                .then(data => {
                    if (data) {
                        setRegistration(data);
                    }
                })
                .finally(() => setLoading(false));
        } else {
            setLoading(false);
        }
    }, [registrationId]);

    // Define se o PIX deve ser exibido
    const shouldShowPix = registrationId && registration && 
        (registration.paymentDetails?.method === 'pix' || 
         (registration.paymentDetails?.method === 'carne' && registration.details?.payFirstInstallmentWithPix));


    if (loading) {
        return <Loader2 className="h-16 w-16 animate-spin text-primary" />;
    }

    if (shouldShowPix) {
         return <PixPaymentDetails registration={registration!} />;
    }
    
    // Se não deve mostrar o PIX, mostra a mensagem padrão
    return (
        <div className="text-center">
            <CheckCircle2 className="h-16 w-16 text-green-500 mx-auto" />
            <CardTitle className="mt-6 text-2xl font-bold">Pré-inscrição Realizada!</CardTitle>
            <CardDescription className="mt-2 text-center">
                Sua pré-inscrição foi recebida com sucesso. O pagamento deve ser feito diretamente com a secretaria da UPA Religados para garantir sua vaga.
                <br /><br />
                Você receberá um e-mail com os detalhes em breve.
                <br />
                <strong>Não se esqueça de verificar sua caixa de spam ou lixo eletrônico!</strong>
            </CardDescription>
        </div>
    );
}


// A página principal agora envolve o conteúdo em um Suspense no lado do cliente
export default function SuccessPage() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center bg-secondary p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="items-center">
            <Suspense fallback={<Loader2 className="h-16 w-16 animate-spin text-primary" />}>
                <SuccessContent />
            </Suspense>
        </CardHeader>
        <CardContent className="flex justify-center pt-6">
          <Button asChild>
            <Link href="/">Voltar para a página inicial</Link>
          </Button>
        </CardContent>
      </Card>
    </main>
  );
}
// Trigger commit
