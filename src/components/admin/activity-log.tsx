
"use client";

import { useState, useMemo } from "react";
import type { ActivityLog } from "@/lib/types";
import { formatInTimeZone } from "date-fns-tz";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Button } from "../ui/button";
import { X, User, MessageSquare, BadgeCheck, CircleDollarSign } from "lucide-react";
import Link from "next/link";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"


interface ActivityLogListProps {
    initialData: ActivityLog[];
}

type LogTypeFilter = "all" | "registration" | "payment" | "checkin" | "question";


export function ActivityLogList({ initialData }: ActivityLogListProps) {
    const [logs, setLogs] = useState(initialData);
    const [searchTerm, setSearchTerm] = useState("");
    const [typeFilter, setTypeFilter] = useState<LogTypeFilter>("all");

    const filteredData = useMemo(() => {
        return logs.filter(log => {
            const matchesSearch = log.actor.toLowerCase().includes(searchTerm.toLowerCase()) ||
                                  log.action.toLowerCase().includes(searchTerm.toLowerCase());
            
            const matchesType = typeFilter === 'all' || log.type === typeFilter;

            return matchesSearch && matchesType;
        });
    }, [logs, searchTerm, typeFilter]);

    const getIconForType = (type: LogTypeFilter) => {
        switch (type) {
            case "registration": return <User className="h-4 w-4" />;
            case "payment": return <CircleDollarSign className="h-4 w-4" />;
            case "checkin": return <BadgeCheck className="h-4 w-4" />;
            case "question": return <MessageSquare className="h-4 w-4" />;
            default: return <User className="h-4 w-4" />;
        }
    };


    if (!logs || logs.length === 0) {
        return <p className="text-center p-4">Nenhum log de atividade encontrado.</p>;
    }

    return (
        <div className="space-y-4">
             <div className="flex flex-col md:flex-row gap-4 mb-4">
                <div className="relative flex-1">
                    <Input
                        placeholder="Buscar por ator ou ação..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="pr-8"
                    />
                    {searchTerm && (
                        <Button
                            variant="ghost"
                            size="icon"
                            className="absolute right-1 top-1/2 -translate-y-1/2 h-7 w-7"
                            onClick={() => setSearchTerm('')}
                        >
                            <X className="h-4 w-4" />
                        </Button>
                    )}
                </div>
                 <Select value={typeFilter} onValueChange={(value) => setTypeFilter(value as LogTypeFilter)}>
                    <SelectTrigger className="w-full md:w-[180px]">
                        <SelectValue placeholder="Filtrar por tipo..." />
                    </SelectTrigger>
                    <SelectContent>
                        <SelectItem value="all">Todos os Tipos</SelectItem>
                        <SelectItem value="registration">Inscrições</SelectItem>
                        <SelectItem value="payment">Pagamentos</SelectItem>
                        <SelectItem value="checkin">Check-in</SelectItem>
                        <SelectItem value="question">Dúvidas</SelectItem>
                    </SelectContent>
                </Select>
            </div>
             <div className="mb-4 text-sm text-muted-foreground">
                <span>
                    Mostrando <strong>{filteredData.length}</strong> de <strong>{logs.length}</strong> registros de log.
                </span>
            </div>

            <div className="border rounded-md overflow-x-auto">
                <Table>
                    <TableHeader>
                        <TableRow>
                            <TableHead>Data</TableHead>
                            <TableHead>Ator</TableHead>
                            <TableHead>Ação</TableHead>
                             <TableHead className="text-right">Tipo</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {filteredData.length > 0 ? (
                            filteredData.map((log, index) => (
                                <TableRow key={index}>
                                    <TableCell className="text-xs text-muted-foreground whitespace-nowrap">
                                        {formatInTimeZone(new Date(log.date), "America/Manaus", "dd/MM/yy HH:mm")}
                                    </TableCell>
                                    <TableCell className="font-medium">
                                        {log.actor}
                                    </TableCell>
                                    <TableCell>
                                         <Link href={log.type === "question" ? `/admin/questions` : `/admin`} passHref>
                                            <span className="hover:underline cursor-pointer">{log.action}</span>
                                        </Link>
                                    </TableCell>
                                    <TableCell className="text-right">
                                         <Badge variant="outline" className="flex items-center gap-1.5 w-fit ml-auto">
                                            {getIconForType(log.type as LogTypeFilter)}
                                            {log.type}
                                        </Badge>
                                    </TableCell>
                                </TableRow>
                            ))
                        ) : (
                            <TableRow>
                                <TableCell colSpan={4} className="h-24 text-center">
                                    Nenhum log encontrado para os filtros aplicados.
                                </TableCell>
                            </TableRow>
                        )}
                    </TableBody>
                </Table>
            </div>
        </div>
    );
}
// Trigger commit
