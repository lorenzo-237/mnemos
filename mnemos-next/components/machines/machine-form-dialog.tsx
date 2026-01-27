"use client";

import { useState, useTransition, ReactNode } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import {
  AlertDialog,
  AlertDialogContent,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
  AlertDialogFooter,
  AlertDialogCancel,
} from "@/components/ui/alert-dialog";
import { Field, FieldLabel, FieldGroup } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { createMachine, updateMachine } from "@/lib/actions/machines";
import { MachineType, type MachineFormData } from "@/lib/types";

interface MachineFormDialogProps {
  siteId: number;
  machine?: MachineFormData;
  trigger: ReactNode;
}

export function MachineFormDialog({
  siteId,
  machine,
  trigger,
}: MachineFormDialogProps) {
  const [open, setOpen] = useState(false);
  const [isPending, startTransition] = useTransition();
  const [machineType, setMachineType] = useState<string>(
    machine?.type || MachineType.CLIENT,
  );
  const router = useRouter();

  const handleSubmit = async (formData: FormData) => {
    // Ajouter le type sélectionné au FormData
    formData.set("type", machineType);

    startTransition(async () => {
      try {
        if (machine) {
          await updateMachine(machine.id, formData);
          toast.success('Machine modifiée avec succès');
          setOpen(false);
          router.refresh();
        } else {
          await createMachine(siteId, formData);
          toast.success('Machine créée avec succès');
          setOpen(false);
        }
      } catch (error) {
        console.error("Form error:", error);
        toast.error(machine ? 'Erreur lors de la modification de la machine' : 'Erreur lors de la création de la machine');
      }
    });
  };

  return (
    <AlertDialog open={open} onOpenChange={setOpen}>
      <AlertDialogTrigger asChild>{trigger}</AlertDialogTrigger>

      <AlertDialogContent className="max-w-3xl">
        <form action={handleSubmit}>
          <AlertDialogHeader>
            <AlertDialogTitle>
              {machine ? "Modifier la machine" : "Nouvelle machine"}
            </AlertDialogTitle>
          </AlertDialogHeader>

          <FieldGroup>
            <Field>
              <FieldLabel htmlFor="name">Nom de la machine</FieldLabel>
              <Input
                id="name"
                name="name"
                defaultValue={machine?.name}
                placeholder="SRV-WEB-01"
                required
              />
            </Field>

            <Field>
              <FieldLabel htmlFor="type">Type</FieldLabel>
              <Select value={machineType} onValueChange={setMachineType}>
                <SelectTrigger id="type">
                  <SelectValue placeholder="Sélectionnez un type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value={MachineType.SERVER}>Serveur</SelectItem>
                  <SelectItem value={MachineType.CLIENT}>Client</SelectItem>
                </SelectContent>
              </Select>
            </Field>

            <Field>
              <FieldLabel htmlFor="teamviewerId">TeamViewer ID</FieldLabel>
              <Input
                id="teamviewerId"
                name="teamviewerId"
                defaultValue={machine?.teamviewerId || ""}
                placeholder="123 456 789"
              />
            </Field>

            <Field>
              <FieldLabel htmlFor="teamviewerPwd">
                Mot de passe TeamViewer
              </FieldLabel>
              <Input
                id="teamviewerPwd"
                name="teamviewerPwd"
                type="password"
                placeholder="••••••••"
              />
              {machine && (
                <p className="text-xs text-muted-foreground mt-1">
                  Laissez vide pour conserver le mot de passe actuel
                </p>
              )}
            </Field>
          </FieldGroup>

          <AlertDialogFooter>
            <AlertDialogCancel>Annuler</AlertDialogCancel>
            <Button type="submit" disabled={isPending}>
              {isPending ? "Enregistrement..." : "Enregistrer"}
            </Button>
          </AlertDialogFooter>
        </form>
      </AlertDialogContent>
    </AlertDialog>
  );
}
