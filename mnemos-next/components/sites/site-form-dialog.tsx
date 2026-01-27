"use client";

import { useState, useTransition, ReactNode, useEffect } from "react";
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
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { IconSelector } from "@/components/shared/icon-selector";
import { MetadataEditor } from "@/components/shared/metadata-editor";
import { TagSelector } from "@/components/tags/tag-selector";
import { createSite, updateSite } from "@/lib/actions/sites";
import { getFolders } from "@/lib/actions/folders";
import { addTagToSite, removeTagFromSite } from "@/lib/actions/tags";
import type { SiteFormData } from "@/lib/types";

interface SiteFormDialogProps {
  site?: SiteFormData;
  trigger: ReactNode;
}

export function SiteFormDialog({ site, trigger }: SiteFormDialogProps) {
  const [open, setOpen] = useState(false);
  const [isPending, startTransition] = useTransition();
  const router = useRouter();

  // Form state
  const [iconName, setIconName] = useState<string | null>(
    site?.iconName || null,
  );
  const [metadata, setMetadata] = useState<Record<
    string,
    { value: string; iconName?: string }
  > | null>(site?.metadata || null);
  const [selectedTags, setSelectedTags] = useState<number[]>(
    site?.tags?.map((t) => t.tag.id) || [],
  );
  const [isObsolete, setIsObsolete] = useState(site?.isObsolete || false);
  const [selectedFolderId, setSelectedFolderId] = useState<string>(
    site?.folderId?.toString() || "none",
  );

  // Folders list
  const [folders, setFolders] = useState<Array<{ id: number; name: string }>>(
    [],
  );
  const [loadingFolders, setLoadingFolders] = useState(true);

  useEffect(() => {
    if (open) {
      getFolders().then((data) => {
        setFolders(data);
        setLoadingFolders(false);
      });
    }
  }, [open]);

  const handleSubmit = async (formData: FormData) => {
    // Add computed fields to formData
    if (iconName) {
      formData.set("iconName", iconName);
    }
    if (metadata) {
      formData.set("metadata", JSON.stringify(metadata));
    }
    formData.set("isObsolete", isObsolete.toString());
    if (selectedFolderId && selectedFolderId !== "none") {
      formData.set("folderId", selectedFolderId);
    }

    startTransition(async () => {
      try {
        if (site) {
          await updateSite(site.id, formData);

          // Handle tag updates
          const currentTagIds = site.tags?.map((t) => t.tag.id) || [];
          const tagsToAdd = selectedTags.filter(
            (id) => !currentTagIds.includes(id),
          );
          const tagsToRemove = currentTagIds.filter(
            (id) => !selectedTags.includes(id),
          );

          for (const tagId of tagsToAdd) {
            await addTagToSite(site.id, tagId);
          }
          for (const tagId of tagsToRemove) {
            await removeTagFromSite(site.id, tagId);
          }

          toast.success("Site modifié avec succès");
          setOpen(false);
          router.refresh();
        } else {
          await createSite(formData);
          toast.success("Site créé avec succès");
          // La redirection est gérée par l'action
          // Tags will be handled after site creation if needed
        }
      } catch (error) {
        console.error("Form error:", error);
        toast.error(
          site
            ? "Erreur lors de la modification du site"
            : "Erreur lors de la création du site",
        );
      }
    });
  };

  return (
    <AlertDialog open={open} onOpenChange={setOpen}>
      <AlertDialogTrigger asChild>{trigger}</AlertDialogTrigger>

      <AlertDialogContent className="max-w-5xl max-h-[90vh] overflow-y-auto">
        <form action={handleSubmit}>
          <AlertDialogHeader>
            <AlertDialogTitle>
              {site ? "Modifier le site" : "Nouveau site"}
            </AlertDialogTitle>
          </AlertDialogHeader>

          <FieldGroup className="space-y-4 my-4">
            <Field>
              <FieldLabel htmlFor="name">Nom du site *</FieldLabel>
              <Input
                id="name"
                name="name"
                defaultValue={site?.name}
                placeholder="Siège social"
                required
              />
            </Field>

            <Field>
              <FieldLabel htmlFor="description">Description</FieldLabel>
              <Textarea
                id="description"
                name="description"
                defaultValue={site?.description || ""}
                placeholder="Description du site..."
                rows={3}
              />
            </Field>

            <Field>
              <FieldLabel htmlFor="folderId">Dossier</FieldLabel>
              {loadingFolders ? (
                <div className="text-sm text-muted-foreground">
                  Chargement...
                </div>
              ) : (
                <Select
                  value={selectedFolderId}
                  onValueChange={setSelectedFolderId}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Aucun dossier" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="none">Aucun dossier</SelectItem>
                    {folders.map((folder) => (
                      <SelectItem key={folder.id} value={folder.id.toString()}>
                        {folder.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              )}
            </Field>

            <IconSelector
              value={iconName}
              onChange={setIconName}
              label="Icône du site"
            />

            {site && (
              <TagSelector
                selectedTagIds={selectedTags}
                onChange={setSelectedTags}
                label="Tags"
              />
            )}

            <div className="flex items-center space-x-2">
              <Checkbox
                id="isObsolete"
                checked={isObsolete}
                onCheckedChange={(checked) => setIsObsolete(checked as boolean)}
              />
              <Label htmlFor="isObsolete" className="text-sm font-medium">
                Site obsolète
              </Label>
            </div>

            {isObsolete && (
              <Field>
                <FieldLabel htmlFor="obsoleteReason">
                  Raison de l'obsolescence
                </FieldLabel>
                <Textarea
                  id="obsoleteReason"
                  name="obsoleteReason"
                  defaultValue={site?.obsoleteReason || ""}
                  placeholder="Expliquez pourquoi ce site est obsolète..."
                  rows={2}
                />
              </Field>
            )}

            <MetadataEditor
              value={metadata}
              onChange={setMetadata}
              label="Métadonnées personnalisées"
            />
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
