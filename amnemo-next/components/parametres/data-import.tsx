'use client';

import { useState, useTransition } from 'react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { importData, ImportResult } from '@/lib/actions/import';
import { toast } from 'sonner';
import { HugeiconsIcon } from '@hugeicons/react';
import { Upload02Icon, FileImportIcon } from '@hugeicons/core-free-icons';

export function DataImport() {
  const [jsonContent, setJsonContent] = useState('');
  const [result, setResult] = useState<ImportResult | null>(null);
  const [isPending, startTransition] = useTransition();

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const content = event.target?.result as string;
      setJsonContent(content);
      setResult(null);
    };
    reader.readAsText(file);
  };

  const handleImport = () => {
    if (!jsonContent.trim()) {
      toast.error('Veuillez coller ou charger un fichier JSON');
      return;
    }

    startTransition(async () => {
      try {
        const importResult = await importData(jsonContent);
        setResult(importResult);

        if (importResult.success) {
          toast.success(importResult.message);
        } else {
          toast.error('Import terminé avec des erreurs');
        }
      } catch (error) {
        toast.error(error instanceof Error ? error.message : 'Erreur lors de l\'import');
      }
    });
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-4">
        <label className="cursor-pointer">
          <input
            type="file"
            accept=".json"
            onChange={handleFileUpload}
            className="hidden"
          />
          <Button variant="outline" asChild>
            <span>
              <HugeiconsIcon icon={Upload02Icon} strokeWidth={2} data-icon="inline-start" />
              Charger un fichier JSON
            </span>
          </Button>
        </label>
      </div>

      <Textarea
        value={jsonContent}
        onChange={(e) => {
          setJsonContent(e.target.value);
          setResult(null);
        }}
        placeholder="Collez ici le contenu JSON à importer..."
        rows={12}
        className="font-mono text-sm"
      />

      <Button onClick={handleImport} disabled={isPending || !jsonContent.trim()}>
        <HugeiconsIcon icon={FileImportIcon} strokeWidth={2} data-icon="inline-start" />
        {isPending ? 'Import en cours...' : 'Lancer l\'import'}
      </Button>

      {result && (
        <div className={`p-4 rounded-lg border ${result.success ? 'bg-green-50 border-green-200' : 'bg-amber-50 border-amber-200'}`}>
          <h4 className="font-medium mb-2">{result.message}</h4>

          <div className="grid grid-cols-2 md:grid-cols-3 gap-2 text-sm mb-3">
            <div>Dossiers : <strong>{result.details.folders}</strong></div>
            <div>Tags : <strong>{result.details.tags}</strong></div>
            <div>Logiciels : <strong>{result.details.softwares}</strong></div>
            <div>Tâches : <strong>{result.details.tasks}</strong></div>
            <div>Sites : <strong>{result.details.sites}</strong></div>
            <div>Machines : <strong>{result.details.machines}</strong></div>
          </div>

          {result.errors.length > 0 && (
            <div className="mt-3">
              <h5 className="font-medium text-red-700 mb-1">Erreurs ({result.errors.length}) :</h5>
              <ul className="text-sm text-red-600 list-disc list-inside max-h-32 overflow-y-auto">
                {result.errors.map((error, i) => (
                  <li key={i}>{error}</li>
                ))}
              </ul>
            </div>
          )}
        </div>
      )}

      <div className="text-sm text-muted-foreground">
        <p className="font-medium mb-1">Format attendu :</p>
        <pre className="bg-muted p-2 rounded text-xs overflow-x-auto">
{`{
  "folders": [{ "name": "..." }],
  "tags": [{ "name": "...", "color": "#3B82F6" }],
  "softwares": [{ "name": "...", "description": "..." }],
  "tasks": {
    "server": ["Tâche 1", "Tâche 2"],
    "client": ["Tâche client"]
  },
  "sites": [{
    "name": "...",
    "folder": "...",
    "tags": ["tag1", "tag2"],
    "metadata": { "key": "value" },
    "machines": [{ "name": "...", "type": "SERVER" }]
  }]
}`}
        </pre>
      </div>
    </div>
  );
}
