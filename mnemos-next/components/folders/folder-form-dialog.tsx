"use client";

import { useState, useTransition, ReactNode } from "react";
import { useRouter } from "next/navigation";
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
import { createFolder, updateFolder } from "@/lib/actions/folders";

interface FolderFormDialogProps {
  folder?: {
    id: number;
    name: string;
  };
  trigger: ReactNode;
}

export function FolderFormDialog({ folder, trigger }: FolderFormDialogProps) {
  const [open, setOpen] = useState(false);
  const [isPending, startTransition] = useTransition();
  const router = useRouter();

  const handleSubmit = async (formData: FormData) => {
    startTransition(async () => {
      try {
        if (folder) {
          await updateFolder(folder.id, formData);
          setOpen(false);
          router.refresh();
        } else {
          setOpen(false);
          await createFolder(formData);
          // La redirection est gérée par l'action
        }
      } catch (error) {
        console.error("Form error:", error);
      }
    });
  };

  return (
    <AlertDialog open={open} onOpenChange={setOpen}>
      <AlertDialogTrigger asChild>{trigger}</AlertDialogTrigger>

      <AlertDialogContent>
        <form action={handleSubmit}>
          <AlertDialogHeader>
            <AlertDialogTitle>
              {folder ? "Modifier le dossier" : "Nouveau dossier"}
            </AlertDialogTitle>
          </AlertDialogHeader>

          <FieldGroup>
            <Field>
              <FieldLabel htmlFor="name">Nom du dossier</FieldLabel>
              <Input
                id="name"
                name="name"
                defaultValue={folder?.name}
                placeholder="Mes sites principaux"
                required
              />
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
