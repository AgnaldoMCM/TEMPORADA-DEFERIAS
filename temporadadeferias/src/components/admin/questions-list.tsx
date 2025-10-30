
"use client";

import { useState, useMemo, useTransition } from "react";
import type { Question } from "@/lib/types";
import { formatInTimeZone } from "date-fns-tz";
import { useToast } from "@/hooks/use-toast";
import { handleQuestionReply, deleteQuestion } from "@/app/actions";

import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Mail, MessageCircle, Send, CheckCircle, Clock, Loader2, Trash2, UserCog, Archive } from "lucide-react";


interface QuestionsListProps {
    initialData: Question[];
}

type StatusFilter = "all" | "pending" | "answered";

export function QuestionsList({ initialData }: QuestionsListProps) {
    const { toast } = useToast();
    const [questions, setQuestions] = useState(initialData);
    const [filter, setFilter] = useState<StatusFilter>("pending");
    const [isPending, startTransition] = useTransition();
    const [selectedQuestion, setSelectedQuestion] = useState<Question | null>(null);
    const [questionToDelete, setQuestionToDelete] = useState<Question | null>(null);
    const [answer, setAnswer] = useState("");


    const filteredData = useMemo(() => {
        const activeQuestions = questions.filter(q => q.status !== 'archived');
        if (filter === "all") return activeQuestions;
        return activeQuestions.filter(q => q.status === filter);
    }, [questions, filter]);

    const handleOpenReplyModal = (question: Question) => {
        setSelectedQuestion(question);
        setAnswer(question.answer || ""); // Carrega a resposta existente ao editar
    };
    
    const handleCloseReplyModal = () => {
        setSelectedQuestion(null);
        setAnswer("");
    };

    const handleSubmitReply = () => {
        if (!selectedQuestion) return;

        startTransition(async () => {
            const result = await handleQuestionReply(selectedQuestion.id, answer);
            if (result.success) {
                // Atualiza o estado local para refletir a mudança
                setQuestions(prev => 
                    prev.map(q => 
                        q.id === selectedQuestion.id 
                        ? { ...q, status: 'answered', answer: answer, answeredAt: new Date().toISOString() } 
                        : q
                    )
                );
                handleCloseReplyModal();
                toast({
                    title: "Sucesso!",
                    description: result.message,
                    className: "bg-green-500 text-white",
                });
            } else {
                 toast({
                    title: "Erro",
                    description: result.message,
                    variant: "destructive",
                });
            }
        });
    };

     const handleOpenDeleteDialog = (question: Question) => {
        setQuestionToDelete(question);
    };

    const handleCloseDeleteDialog = () => {
        setQuestionToDelete(null);
    };

    const handleDeleteQuestion = () => {
        if (!questionToDelete) return;

        startTransition(async () => {
            const result = await deleteQuestion(questionToDelete.id);
            if (result.success) {
                setQuestions(prev => prev.map(q => q.id === questionToDelete.id ? {...q, status: 'archived'} : q));
                toast({
                    title: "Arquivada!",
                    description: result.message,
                    className: "bg-blue-500 text-white",
                });
            } else {
                toast({
                    title: "Erro",
                    description: result.message,
                    variant: "destructive",
                });
            }
            handleCloseDeleteDialog();
        });
    };


    if (!questions) {
        return <p className="text-center p-4">Nenhuma dúvida foi enviada ainda.</p>;
    }
    
    const nonArchivedQuestions = questions.filter(q => q.status !== 'archived');
    if (nonArchivedQuestions.length === 0) {
        return <p className="text-center p-4">Nenhuma dúvida ativa no momento.</p>;
    }


    return (
        <div className="space-y-6">
            <div className="flex flex-col sm:flex-row gap-4 justify-between items-start sm:items-center p-4 border rounded-lg bg-muted/50">
                <div>
                    <Label className="font-semibold">Filtrar por Status</Label>
                    <RadioGroup 
                        defaultValue="pending"
                        value={filter}
                        onValueChange={(value: StatusFilter) => setFilter(value)}
                        className="flex items-center space-x-4 mt-2"
                    >
                        <div className="flex items-center space-x-2"><RadioGroupItem value="all" id="all" /><Label htmlFor="all">Todas</Label></div>
                        <div className="flex items-center space-x-2"><RadioGroupItem value="pending" id="pending" /><Label htmlFor="pending">Pendentes</Label></div>
                        <div className="flex items-center space-x-2"><RadioGroupItem value="answered" id="answered" /><Label htmlFor="answered">Respondidas</Label></div>
                    </RadioGroup>
                </div>
                 <div className="text-sm text-muted-foreground self-end">
                    Mostrando <strong>{filteredData.length}</strong> de <strong>{nonArchivedQuestions.length}</strong> dúvidas ativas.
                </div>
            </div>
            <div className="overflow-x-auto">
                <Accordion type="single" collapsible className="w-full space-y-2 min-w-[600px]">
                    {filteredData.length > 0 ? (
                        filteredData.map(q => (
                            <AccordionItem key={q.id} value={q.id} className="border rounded-md px-4 bg-background">
                                <AccordionTrigger className="w-full hover:no-underline">
                                    <div className="flex justify-between items-center w-full">
                                        <div className="flex-1 text-left">
                                            <p className="font-semibold text-base truncate max-w-xs sm:max-w-md md:max-w-lg">{q.question}</p>
                                            <p className="text-sm text-muted-foreground flex items-center gap-1.5 mt-1">
                                                <Mail size={14} /> {q.email}
                                            </p>
                                        </div>
                                        <div className="flex items-center gap-2 flex-shrink-0 ml-4">
                                            <Badge variant={q.status === 'answered' ? 'default' : 'secondary'} className={q.status === 'answered' ? "bg-green-500 hover:bg-green-600" : ""}>
                                                 {q.status === 'answered' ? <CheckCircle size={14} className="mr-1.5"/> : <Clock size={14} className="mr-1.5" />}
                                                {q.status === 'answered' ? 'Respondida' : 'Pendente'}
                                            </Badge>
                                        </div>
                                    </div>
                                </AccordionTrigger>
                                <AccordionContent>
                                    <div className="pt-2 pb-4 space-y-4">
                                         <div className="text-xs text-muted-foreground">
                                            Recebido em: {formatInTimeZone(new Date(q.createdAt), "America/Manaus", "dd/MM/yyyy 'às' HH:mm")}
                                        </div>
                                        {q.status === 'answered' && q.answer && (
                                            <div className="p-4 bg-muted/80 rounded-md">
                                                <h4 className="font-semibold mb-1">Resposta:</h4>
                                                <p className="text-sm whitespace-pre-wrap">{q.answer}</p>
                                                 <div className="text-xs text-muted-foreground mt-2 flex items-center gap-1.5">
                                                    <UserCog size={14} />
                                                    Respondido por <strong>{q.answeredBy}</strong> em: {q.answeredAt ? formatInTimeZone(new Date(q.answeredAt), "America/Manaus", "dd/MM/yy HH:mm") : 'N/A'}
                                                </div>
                                            </div>
                                        )}
                                        <div className="flex items-center gap-2">
                                            <Button size="sm" onClick={() => handleOpenReplyModal(q)}>
                                                <MessageCircle className="mr-2 h-4 w-4" />
                                                {q.status === 'answered' ? 'Ver ou Editar Resposta' : 'Responder'}
                                            </Button>
                                             <Button size="sm" variant="outline" onClick={() => handleOpenDeleteDialog(q)} disabled={isPending}>
                                                <Archive className="mr-2 h-4 w-4" />
                                                Arquivar
                                            </Button>
                                        </div>
                                    </div>
                                </AccordionContent>
                            </AccordionItem>
                        ))
                    ) : (
                        <div className="text-center p-8 text-muted-foreground">
                            <p>Nenhuma dúvida com o status "{filter}" encontrada.</p>
                        </div>
                    )}
                </Accordion>
            </div>


            {/* Modal para responder */}
             <Dialog open={!!selectedQuestion} onOpenChange={handleCloseReplyModal}>
                <DialogContent className="sm:max-w-lg">
                    <DialogHeader>
                    <DialogTitle>Responder Dúvida</DialogTitle>
                    <DialogDescription>Sua resposta será enviada para o e-mail do usuário.</DialogDescription>
                    </DialogHeader>
                    <div className="py-4 space-y-4">
                         <div className="p-3 bg-muted rounded-md text-sm">
                            <p className="font-semibold">Pergunta de {selectedQuestion?.email}:</p>
                            <p className="mt-1">{selectedQuestion?.question}</p>
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="answer">Sua Resposta</Label>
                            <Textarea
                                id="answer"
                                value={answer}
                                onChange={(e) => setAnswer(e.target.value)}
                                placeholder="Digite sua resposta aqui..."
                                rows={6}
                            />
                        </div>
                    </div>
                    <DialogFooter>
                    <Button variant="outline" onClick={handleCloseReplyModal}>Cancelar</Button>
                    <Button onClick={handleSubmitReply} disabled={isPending || answer.trim().length < 10}>
                         {isPending ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Send className="mr-2 h-4 w-4" />}
                         {isPending ? 'Enviando...' : 'Enviar Resposta'}
                    </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>

             {/* Modal para confirmar exclusão/arquivamento */}
             <AlertDialog open={!!questionToDelete} onOpenChange={handleCloseDeleteDialog}>
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle>Você tem certeza que deseja arquivar?</AlertDialogTitle>
                        <AlertDialogDescription>
                            Esta ação irá ocultar a pergunta da lista principal. Ela não será excluída permanentemente e poderá ser recuperada no futuro, se necessário.
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                        <AlertDialogCancel onClick={handleCloseDeleteDialog}>Cancelar</AlertDialogCancel>
                        <AlertDialogAction onClick={handleDeleteQuestion} disabled={isPending} className="bg-destructive hover:bg-destructive/90">
                             {isPending ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
                            Sim, Arquivar
                        </AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>

        </div>
    );
}
// Trigger commit
