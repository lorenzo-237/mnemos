'use client';

import { useState, useTransition } from 'react';
import { useRouter } from 'next/navigation';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Badge } from '@/components/ui/badge';
import { MachineTypeBadge } from '@/components/machines/machine-type-badge';
import { DynamicIcon } from '@/components/shared/dynamic-icon';
import { HugeiconsIcon } from '@hugeicons/react';
import { PlayIcon, PlusSignIcon } from '@hugeicons/core-free-icons';
import { addTasksToSession, startUpdateSession } from '@/lib/actions/update-sessions';

interface PrepareSessionViewProps {
  session: any;
  availableMachines: any[];
  tasks: any[];
}

export function PrepareSessionView({ session, availableMachines, tasks }: PrepareSessionViewProps) {
  const [isPending, startTransition] = useTransition();
  const router = useRouter();

  const [selectedMachines, setSelectedMachines] = useState<number[]>([]);
  const [selectedTasks, setSelectedTasks] = useState<number[]>([]);

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
      alert('Veuillez sélectionner au moins une machine et une tâche');
      return;
    }

    startTransition(async () => {
      await addTasksToSession(session.id, selectedMachines, selectedTasks);
      setSelectedMachines([]);
      setSelectedTasks([]);
      router.refresh();
    });
  };

  const handleStartSession = () => {
    if (session.updateTasks.length === 0) {
      alert('Veuillez ajouter au moins une tâche avant de démarrer');
      return;
    }

    startTransition(async () => {
      await startUpdateSession(session.id);
      router.push(`/updates/${session.id}/track`);
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
    </div>
  );
}
