'use client';

import { useState, useTransition } from 'react';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Badge } from '@/components/ui/badge';
import { MachineTypeBadge } from '@/components/machines/machine-type-badge';
import { DynamicIcon } from '@/components/shared/dynamic-icon';
import { HugeiconsIcon } from '@hugeicons/react';
import { PlayIcon, PlusSignIcon } from '@hugeicons/core-free-icons';
import { addTasksToSession, startUpdateSession } from '@/lib/actions/update-sessions';
import {
  AlertDialog,
  AlertDialogContent,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogFooter,
  AlertDialogCancel,
} from '@/components/ui/alert-dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Field, FieldLabel } from '@/components/ui/field';
import { Input } from '@/components/ui/input';

interface PrepareSessionViewProps {
  session: any;
  availableMachines: any[];
  tasks: any[];
  softwares: any[];
}

export function PrepareSessionView({ session, availableMachines, tasks, softwares }: PrepareSessionViewProps) {
  const [isPending, startTransition] = useTransition();
  const router = useRouter();

  const [selectedMachines, setSelectedMachines] = useState<number[]>([]);
  const [selectedTasks, setSelectedTasks] = useState<number[]>([]);

  // État pour le dialogue de configuration des remplacements de logiciels
  const [showSoftwareDialog, setShowSoftwareDialog] = useState(false);
  const [softwareReplacements, setSoftwareReplacements] = useState<Record<number, { softwareId: number; targetVersion: string }>>({});

  const clientMachines = availableMachines.filter(m => m.type === 'CLIENT');
  const serverMachines = availableMachines.filter(m => m.type === 'SERVER');

  const clientTasks = tasks.filter(t => t.targetType === 'CLIENT');
  const serverTasks = tasks.filter(t => t.targetType === 'SERVER');

  const toggleMachine = (machineId: number) => {
    setSelectedMachines(prev =>
      prev.includes(machineId)
        ? prev.filter(id => id !== machineId)
        : [...prev, machineId]
    );
  };

  const toggleTask = (taskId: number) => {
    setSelectedTasks(prev =>
      prev.includes(taskId)
        ? prev.filter(id => id !== taskId)
        : [...prev, taskId]
    );
  };

  const selectAllMachines = (type: 'CLIENT' | 'SERVER') => {
    const machines = type === 'CLIENT' ? clientMachines : serverMachines;
    const machineIds = machines.map(m => m.id);
    const allSelected = machineIds.every(id => selectedMachines.includes(id));

    if (allSelected) {
      setSelectedMachines(prev => prev.filter(id => !machineIds.includes(id)));
    } else {
      setSelectedMachines(prev => [...new Set([...prev, ...machineIds])]);
    }
  };

  const selectAllTasks = (type: 'CLIENT' | 'SERVER') => {
    const taskList = type === 'CLIENT' ? clientTasks : serverTasks;
    const taskIds = taskList.map(t => t.id);
    const allSelected = taskIds.every(id => selectedTasks.includes(id));

    if (allSelected) {
      setSelectedTasks(prev => prev.filter(id => !taskIds.includes(id)));
    } else {
      setSelectedTasks(prev => [...new Set([...prev, ...taskIds])]);
    }
  };

  const handleAddTasks = () => {
    if (selectedMachines.length === 0 || selectedTasks.length === 0) {
      toast.warning('Veuillez sélectionner au moins une machine et une tâche');
      return;
    }

    // Vérifier si des tâches sélectionnées sont de type SOFTWARE_REPLACEMENT
    const softwareReplacementTasks = tasks.filter(
      (task) => selectedTasks.includes(task.id) && task.type === 'SOFTWARE_REPLACEMENT'
    );

    if (softwareReplacementTasks.length > 0) {
      // Initialiser les remplacements de logiciels pour les tâches concernées
      const initialReplacements: Record<number, { softwareId: number; targetVersion: string }> = {};
      softwareReplacementTasks.forEach((task) => {
        if (!softwareReplacements[task.id]) {
          initialReplacements[task.id] = {
            softwareId: softwares[0]?.id || 0,
            targetVersion: ''
          };
        } else {
          initialReplacements[task.id] = softwareReplacements[task.id];
        }
      });
      setSoftwareReplacements(initialReplacements);
      setShowSoftwareDialog(true);
    } else {
      // Pas de tâches SOFTWARE_REPLACEMENT, ajouter directement
      performAddTasks();
    }
  };

  const performAddTasks = () => {
    startTransition(async () => {
      try {
        await addTasksToSession(session.id, selectedMachines, selectedTasks, softwareReplacements);
        toast.success(`${selectedTasks.length} tâche(s) ajoutée(s) à ${selectedMachines.length} machine(s)`);
        setSelectedMachines([]);
        setSelectedTasks([]);
        setSoftwareReplacements({});
        setShowSoftwareDialog(false);
        router.refresh();
      } catch (error) {
        toast.error('Erreur lors de l\'ajout des tâches');
      }
    });
  };

  const handleStartSession = () => {
    if (session.updateTasks.length === 0) {
      toast.warning('Veuillez ajouter au moins une tâche avant de démarrer');
      return;
    }

    startTransition(async () => {
      try {
        await startUpdateSession(session.id);
        toast.success('Session démarrée avec succès');
        router.push(`/updates/${session.id}/track`);
      } catch (error) {
        toast.error('Erreur lors du démarrage de la session');
      }
    });
  };

  return (
    <div className="space-y-6">
      {/* Tâches déjà assignées */}
      {session.updateTasks.length > 0 && (
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle>Tâches assignées</CardTitle>
              <Badge variant="secondary">{session.updateTasks.length} tâche{session.updateTasks.length > 1 ? 's' : ''}</Badge>
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-2 max-h-60 overflow-y-auto">
              {session.updateTasks.map((ut: any) => (
                <div key={ut.id} className="flex items-center justify-between p-2 bg-muted rounded">
                  <div className="flex items-center gap-2">
                    <MachineTypeBadge type={ut.machine.type} />
                    <span className="text-sm font-medium">{ut.machine.site.name} - {ut.machine.name}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    {ut.task.iconName && <DynamicIcon iconName={ut.task.iconName} className="w-4 h-4" />}
                    <span className="text-sm">{ut.task.name}</span>
                  </div>
                </div>
              ))}
            </div>
            <div className="mt-4">
              <Button onClick={handleStartSession} disabled={isPending}>
                <HugeiconsIcon icon={PlayIcon} strokeWidth={2} data-icon="inline-start" />
                Démarrer la session
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Sélection des machines et tâches */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Machines CLIENT */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle>Machines Client</CardTitle>
              <Button variant="outline" size="sm" onClick={() => selectAllMachines('CLIENT')}>
                Tout sélectionner
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-2 max-h-80 overflow-y-auto">
              {clientMachines.length === 0 ? (
                <p className="text-sm text-muted-foreground">Aucune machine client disponible</p>
              ) : (
                clientMachines.map((machine) => (
                  <div key={machine.id} className="flex items-center space-x-2 p-2 hover:bg-muted rounded">
                    <Checkbox
                      checked={selectedMachines.includes(machine.id)}
                      onCheckedChange={() => toggleMachine(machine.id)}
                    />
                    <label className="text-sm cursor-pointer flex-1">
                      {machine.site.name} - {machine.name}
                    </label>
                  </div>
                ))
              )}
            </div>
          </CardContent>
        </Card>

        {/* Tâches CLIENT */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle>Tâches Client</CardTitle>
              <Button variant="outline" size="sm" onClick={() => selectAllTasks('CLIENT')}>
                Tout sélectionner
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-2 max-h-80 overflow-y-auto">
              {clientTasks.length === 0 ? (
                <p className="text-sm text-muted-foreground">Aucune tâche client disponible</p>
              ) : (
                clientTasks.map((task) => (
                  <div key={task.id} className="flex items-center space-x-2 p-2 hover:bg-muted rounded">
                    <Checkbox
                      checked={selectedTasks.includes(task.id)}
                      onCheckedChange={() => toggleTask(task.id)}
                    />
                    <div className="flex items-center gap-2 flex-1">
                      {task.iconName && <DynamicIcon iconName={task.iconName} className="w-4 h-4" />}
                      <label className="text-sm cursor-pointer">{task.name}</label>
                    </div>
                  </div>
                ))
              )}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Machines et tâches SERVER */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle>Machines Serveur</CardTitle>
              <Button variant="outline" size="sm" onClick={() => selectAllMachines('SERVER')}>
                Tout sélectionner
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-2 max-h-80 overflow-y-auto">
              {serverMachines.length === 0 ? (
                <p className="text-sm text-muted-foreground">Aucune machine serveur disponible</p>
              ) : (
                serverMachines.map((machine) => (
                  <div key={machine.id} className="flex items-center space-x-2 p-2 hover:bg-muted rounded">
                    <Checkbox
                      checked={selectedMachines.includes(machine.id)}
                      onCheckedChange={() => toggleMachine(machine.id)}
                    />
                    <label className="text-sm cursor-pointer flex-1">
                      {machine.site.name} - {machine.name}
                    </label>
                  </div>
                ))
              )}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle>Tâches Serveur</CardTitle>
              <Button variant="outline" size="sm" onClick={() => selectAllTasks('SERVER')}>
                Tout sélectionner
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-2 max-h-80 overflow-y-auto">
              {serverTasks.length === 0 ? (
                <p className="text-sm text-muted-foreground">Aucune tâche serveur disponible</p>
              ) : (
                serverTasks.map((task) => (
                  <div key={task.id} className="flex items-center space-x-2 p-2 hover:bg-muted rounded">
                    <Checkbox
                      checked={selectedTasks.includes(task.id)}
                      onCheckedChange={() => toggleTask(task.id)}
                    />
                    <div className="flex items-center gap-2 flex-1">
                      {task.iconName && <DynamicIcon iconName={task.iconName} className="w-4 h-4" />}
                      <label className="text-sm cursor-pointer">{task.name}</label>
                    </div>
                  </div>
                ))
              )}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Bouton d'ajout */}
      <div className="flex justify-end">
        <Button
          onClick={handleAddTasks}
          disabled={isPending || selectedMachines.length === 0 || selectedTasks.length === 0}
        >
          <HugeiconsIcon icon={PlusSignIcon} strokeWidth={2} data-icon="inline-start" />
          Ajouter les tâches sélectionnées ({selectedMachines.length} machines × {selectedTasks.length} tâches)
        </Button>
      </div>

      {/* Dialog pour configurer les remplacements de logiciels */}
      <AlertDialog open={showSoftwareDialog} onOpenChange={setShowSoftwareDialog}>
        <AlertDialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
          <AlertDialogHeader>
            <AlertDialogTitle>Configuration des remplacements de logiciels</AlertDialogTitle>
            <p className="text-sm text-muted-foreground mt-2">
              Les tâches de remplacement de logiciel nécessitent de sélectionner le logiciel cible et sa version.
            </p>
          </AlertDialogHeader>

          <div className="space-y-4 my-4">
            {tasks
              .filter((task) => selectedTasks.includes(task.id) && task.type === 'SOFTWARE_REPLACEMENT')
              .map((task) => (
                <Card key={task.id}>
                  <CardHeader>
                    <div className="flex items-center gap-2">
                      {task.iconName && <DynamicIcon iconName={task.iconName} className="w-5 h-5" />}
                      <CardTitle className="text-base">{task.name}</CardTitle>
                    </div>
                    {task.description && (
                      <p className="text-xs text-muted-foreground mt-1">{task.description}</p>
                    )}
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <Field>
                      <FieldLabel>Logiciel cible</FieldLabel>
                      <Select
                        value={softwareReplacements[task.id]?.softwareId?.toString() || ''}
                        onValueChange={(value) => {
                          setSoftwareReplacements({
                            ...softwareReplacements,
                            [task.id]: {
                              ...softwareReplacements[task.id],
                              softwareId: parseInt(value)
                            }
                          });
                        }}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Sélectionner un logiciel" />
                        </SelectTrigger>
                        <SelectContent>
                          {softwares.map((software) => (
                            <SelectItem key={software.id} value={software.id.toString()}>
                              {software.name}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </Field>

                    <Field>
                      <FieldLabel>Version cible</FieldLabel>
                      <Input
                        placeholder="Ex: 2.4.1"
                        value={softwareReplacements[task.id]?.targetVersion || ''}
                        onChange={(e) => {
                          setSoftwareReplacements({
                            ...softwareReplacements,
                            [task.id]: {
                              ...softwareReplacements[task.id],
                              targetVersion: e.target.value
                            }
                          });
                        }}
                      />
                    </Field>
                  </CardContent>
                </Card>
              ))}
          </div>

          <AlertDialogFooter>
            <AlertDialogCancel onClick={() => {
              setShowSoftwareDialog(false);
              setSoftwareReplacements({});
            }}>
              Annuler
            </AlertDialogCancel>
            <Button
              onClick={performAddTasks}
              disabled={
                isPending ||
                Object.values(softwareReplacements).some(
                  (replacement) => !replacement.softwareId || !replacement.targetVersion
                )
              }
            >
              Confirmer et ajouter
            </Button>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
