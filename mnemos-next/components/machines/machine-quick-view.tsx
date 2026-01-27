"use client";

import { useState, useEffect, ReactNode } from "react";
import Link from "next/link";
import { getMachineById } from "@/lib/actions/machines";
import {
  AlertDialog,
  AlertDialogContent,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
  AlertDialogFooter,
} from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { MachineTypeBadge } from "./machine-type-badge";
import { HugeiconsIcon } from "@hugeicons/react";
import { ArrowRight01Icon, Copy01Icon } from "@hugeicons/core-free-icons";

interface MachineQuickViewProps {
  machine: {
    id: number;
    name: string;
    type: "SERVER" | "CLIENT";
    siteId: number;
    teamviewerId: string | null;
    installations: Array<{
      id: number;
      version: string;
      software: {
        name: string;
      };
    }>;
  };
  trigger: ReactNode;
}

export function MachineQuickView({ machine, trigger }: MachineQuickViewProps) {
  const [open, setOpen] = useState(false);
  const [copied, setCopied] = useState(false);
  const [fullMachine, setFullMachine] = useState(machine);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (open && machine.installations.length === 0) {
      setLoading(true);
      getMachineById(machine.id).then((data) => {
        if (data) {
          setFullMachine({
            ...machine,
            installations: data.installations,
          });
        }
        setLoading(false);
      });
    }
  }, [open, machine]);

  const copyTeamViewerId = async () => {
    if (machine.teamviewerId) {
      try {
        await navigator.clipboard.writeText(machine.teamviewerId);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
      } catch (error) {
        console.error("Failed to copy:", error);
      }
    }
  };

  return (
    <AlertDialog open={open} onOpenChange={setOpen}>
      <AlertDialogTrigger>{trigger}</AlertDialogTrigger>

      <AlertDialogContent className="max-w-2xl">
        <AlertDialogHeader>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <AlertDialogTitle className="text-2xl">
                {machine.name}
              </AlertDialogTitle>
              <MachineTypeBadge type={machine.type} />
            </div>
          </div>
        </AlertDialogHeader>

        <div className="space-y-4">
          {/* TeamViewer Section */}
          {fullMachine.teamviewerId && (
            <>
              <div>
                <h4 className="text-sm font-medium mb-2">Accès TeamViewer</h4>
                <div className="flex items-center gap-2 p-3 bg-muted rounded-md">
                  <span className="text-sm font-mono flex-1">
                    {fullMachine.teamviewerId}
                  </span>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={copyTeamViewerId}
                  >
                    <HugeiconsIcon
                      icon={Copy01Icon}
                      strokeWidth={2}
                      data-icon="inline-start"
                    />
                    {copied ? "Copié !" : "Copier"}
                  </Button>
                </div>
              </div>
              <Separator />
            </>
          )}

          {/* Logiciels installés */}
          <div>
            <h4 className="text-sm font-medium mb-2">
              Logiciels installés ({fullMachine.installations.length})
            </h4>
            {loading ? (
              <div className="space-y-2">
                {[1, 2].map((i) => (
                  <div
                    key={i}
                    className="h-10 bg-muted/50 rounded animate-pulse"
                  />
                ))}
              </div>
            ) : fullMachine.installations.length === 0 ? (
              <p className="text-sm text-muted-foreground">
                Aucun logiciel installé
              </p>
            ) : (
              <div className="space-y-2 max-h-60 overflow-y-auto">
                {fullMachine.installations.map((installation) => (
                  <div
                    key={installation.id}
                    className="flex items-center justify-between p-2 bg-muted/50 rounded"
                  >
                    <span className="text-sm font-medium">
                      {installation.software.name}
                    </span>
                    <Badge variant="secondary" className="text-xs">
                      v{installation.version}
                    </Badge>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        <AlertDialogFooter>
          <Button variant="outline" onClick={() => setOpen(false)}>
            Fermer
          </Button>
          <Link href={`/sites/${machine.siteId}/machines/${machine.id}`}>
            <Button onClick={() => setOpen(false)}>
              <HugeiconsIcon
                icon={ArrowRight01Icon}
                strokeWidth={2}
                data-icon="inline-end"
              />
              Voir détail complet
            </Button>
          </Link>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
