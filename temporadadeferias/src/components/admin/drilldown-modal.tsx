
"use client";

import type { Registration } from "@/lib/types";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Users } from "lucide-react";
import { RegistrationDetailsModal } from "./registration-details-modal";
import { useState } from "react";

interface DrilldownModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  registrations: Registration[];
}

export function DrilldownModal({ isOpen, onClose, title, registrations }: DrilldownModalProps) {
  const [selectedRegistration, setSelectedRegistration] = useState<Registration | null>(null);

  const handleSelectRegistration = (reg: Registration) => {
    setSelectedRegistration(reg);
  };

  const handleCloseDetails = () => {
    setSelectedRegistration(null);
  };

  return (
    <>
      <RegistrationDetailsModal 
        isOpen={!!selectedRegistration}
        onClose={handleCloseDetails}
        registration={selectedRegistration}
      />
      <Dialog open={isOpen} onOpenChange={onClose}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Users className="h-5 w-5" />
              {title}
            </DialogTitle>
            <DialogDescription>
              {registrations.length > 0
                ? `Encontrado(s) ${registrations.length} participante(s) nesta categoria.`
                : "Nenhum participante encontrado nesta categoria."}
            </DialogDescription>
          </DialogHeader>
          
          <ScrollArea className="max-h-[50vh] border rounded-md">
            <div className="p-4">
              {registrations.length > 0 ? (
                <ul className="space-y-2">
                  {registrations.map(reg => (
                    <li key={reg.id}>
                      <button 
                        className="w-full text-left text-sm p-2 rounded-md hover:bg-muted"
                        onClick={() => handleSelectRegistration(reg)}
                      >
                        {reg.name}
                      </button>
                    </li>
                  ))}
                </ul>
              ) : (
                <p className="text-center text-sm text-muted-foreground py-4">
                  Nenhum registro para exibir.
                </p>
              )}
            </div>
          </ScrollArea>
          
          <DialogFooter>
            <Button variant="outline" onClick={onClose}>
              Fechar
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
// Trigger commit
