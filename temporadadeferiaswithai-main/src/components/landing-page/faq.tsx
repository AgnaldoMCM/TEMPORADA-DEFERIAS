
"use client";

import { useRef, useEffect, useActionState } from 'react';
import { useFormStatus } from 'react-dom';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Loader2, HelpCircle } from 'lucide-react';
import { handleQuestionSubmit, type QuestionFormState } from '@/app/actions';
import { useToast } from '@/hooks/use-toast';
import { motion } from 'framer-motion';

const faqItems = [
  {
    id: "item-1",
    question: "Qual a idade mínima para participar?",
    answer:
      "A idade para participar do acampamento é de 12 a 18 anos. Todos os menores de idade precisam de autorização dos pais ou responsáveis, preenchida no momento da inscrição.",
  },
  {
    id: "item-2",
    question: "O que está incluso no valor da inscrição?",
    answer:
      "O valor da inscrição inclui transporte, hospedagem, todas as refeições (café da manhã, almoço, jantar e lanches), acesso a todas as atividades e um kit exclusivo do acampante.",
  },
  {
    id: "item-3",
    question: "Como funcionam os pagamentos?",
    answer:
      "O pagamento via PIX gera um QR Code ao final do formulário. Após a transação, é obrigatório o envio do comprovante para o WhatsApp (92) 99344-0353. Pagamentos à vista ou no carnê devem ser acertados presencialmente na secretaria da UPA.",
  },
  {
    id: "item-4",
    question: "Como é a acomodação?",
    answer:
      "As acomodações são em dormitórios masculinos e femininos, separados por faixa etária. É necessário levar roupa de cama e banho.",
  },
];

function SubmitButton() {
  const { pending } = useFormStatus();
  return (
    <Button type="submit" className="w-full" disabled={pending}>
      {pending ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
      {pending ? 'Enviando...' : 'Enviar Pergunta'}
    </Button>
  );
}

function ErrorMessage({ messages }: { messages?: string[] }) {
  if (!messages || messages.length === 0) return null;
  return <p className="text-sm font-medium text-destructive mt-1">{messages[0]}</p>;
}

function QuestionForm() {
  const { toast } = useToast();
  const formRef = useRef<HTMLFormElement>(null);
  const initialState: QuestionFormState = { message: '', errors: null, success: false };
  const [state, formAction] = useActionState(handleQuestionSubmit, initialState);

  useEffect(() => {
    if (state?.message) {
      toast({
        title: state.success ? "Sucesso!" : "Erro!",
        description: state.message,
        variant: state.success ? "default" : "destructive",
        className: state.success ? "bg-green-500 text-white" : "",
      });
      if (state.success) {
        formRef.current?.reset();
      }
    }
  }, [state, toast]);

  return (
    <Card className="mt-12">
      <CardHeader className="text-center">
        <HelpCircle className="mx-auto h-8 w-8 text-primary" />
        <CardTitle className="font-headline text-2xl">Ainda tem dúvidas?</CardTitle>
        <CardDescription>Envie sua pergunta para nossa equipe. Responderemos no seu e-mail o mais breve possível.</CardDescription>
      </CardHeader>
      <CardContent>
        <form ref={formRef} action={formAction} className="space-y-4">
          <div>
            <Label htmlFor="email">Seu E-mail</Label>
            <Input id="email" name="email" type="email" placeholder="seu@email.com" />
            <ErrorMessage messages={state?.errors?.email} />
          </div>
          <div>
            <Label htmlFor="question">Sua Dúvida</Label>
            <Textarea id="question" name="question" placeholder="Digite sua pergunta aqui..." />
            <ErrorMessage messages={state?.errors?.question} />
          </div>
          <SubmitButton />
        </form>
      </CardContent>
    </Card>
  );
}

export default function Faq() {
  return (
    <section id="faq" className="py-12 md:py-24 bg-secondary/50">
      <div className="container">
        <motion.h2 
          className="text-3xl md:text-4xl font-semibold font-headline text-center mb-12"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
        >
          Perguntas Frequentes
        </motion.h2>
        <motion.div 
          className="max-w-3xl mx-auto"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5, delay: 0.2 }}
        >
          <Accordion type="single" collapsible className="w-full">
            {faqItems.map((item) => (
              <AccordionItem key={item.id} value={item.id}>
                <AccordionTrigger className="text-left font-semibold">{item.question}</AccordionTrigger>
                <AccordionContent className="text-muted-foreground">
                  {item.answer}
                </AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>
          
          <QuestionForm />

        </motion.div>
      </div>
    </section>
  );
}
// Trigger commit
