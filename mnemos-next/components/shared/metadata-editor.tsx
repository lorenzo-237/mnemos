'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { DynamicIcon, availableIcons, iconMap } from '@/components/shared/dynamic-icon';
import { HugeiconsIcon } from '@hugeicons/react';
import { Delete02Icon, PlusSignIcon } from '@hugeicons/core-free-icons';

interface MetadataEntry {
  key: string;
  value: string;
  iconName?: string;
}

interface MetadataValue {
  value: string;
  iconName?: string;
}

interface MetadataEditorProps {
  value?: Record<string, MetadataValue> | null;
  onChange: (metadata: Record<string, MetadataValue> | null) => void;
  label?: string;
}

export function MetadataEditor({ value, onChange, label = "Métadonnées" }: MetadataEditorProps) {
  const [entries, setEntries] = useState<MetadataEntry[]>(
    value ? Object.entries(value).map(([key, val]) => ({
      key,
      value: typeof val === 'string' ? val : val.value,
      iconName: typeof val === 'string' ? undefined : val.iconName
    })) : []
  );
  const [openIconPicker, setOpenIconPicker] = useState<number | null>(null);

  const handleAdd = () => {
    const newEntries = [...entries, { key: '', value: '', iconName: undefined }];
    setEntries(newEntries);
  };

  const handleRemove = (index: number) => {
    const newEntries = entries.filter((_, i) => i !== index);
    setEntries(newEntries);
    updateMetadata(newEntries);
  };

  const handleKeyChange = (index: number, key: string) => {
    const newEntries = [...entries];
    newEntries[index].key = key;
    setEntries(newEntries);
    updateMetadata(newEntries);
  };

  const handleValueChange = (index: number, value: string) => {
    const newEntries = [...entries];
    newEntries[index].value = value;
    setEntries(newEntries);
    updateMetadata(newEntries);
  };

  const handleIconChange = (index: number, iconName: string | null) => {
    const newEntries = [...entries];
    newEntries[index].iconName = iconName || undefined;
    setEntries(newEntries);
    updateMetadata(newEntries);
    setOpenIconPicker(null);
  };

  const updateMetadata = (newEntries: MetadataEntry[]) => {
    const validEntries = newEntries.filter(e => e.key.trim() !== '');
    if (validEntries.length === 0) {
      onChange(null);
    } else {
      const metadata: Record<string, MetadataValue> = {};
      validEntries.forEach(e => {
        metadata[e.key.trim()] = {
          value: e.value,
          iconName: e.iconName
        };
      });
      onChange(metadata);
    }
  };

  return (
    <div className="space-y-2">
      <label className="text-sm font-medium">{label}</label>
      <div className="space-y-3">
        {entries.map((entry, index) => (
          <div key={index} className="space-y-2 p-3 border rounded-md bg-muted/20">
            <div className="flex gap-2">
              <Input
                placeholder="Clé"
                value={entry.key}
                onChange={(e) => handleKeyChange(index, e.target.value)}
                className="flex-1"
              />
              <Input
                placeholder="Valeur"
                value={entry.value}
                onChange={(e) => handleValueChange(index, e.target.value)}
                className="flex-1"
              />
              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={() => handleRemove(index)}
              >
                <HugeiconsIcon icon={Delete02Icon} strokeWidth={2} />
              </Button>
            </div>

            {/* Icon picker */}
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <span className="text-xs text-muted-foreground">Icône:</span>
                {entry.iconName ? (
                  <div className="flex items-center gap-2">
                    <DynamicIcon iconName={entry.iconName} className="w-4 h-4" />
                    <span className="text-xs">{entry.iconName.replace('Icon', '')}</span>
                    <button
                      type="button"
                      onClick={() => handleIconChange(index, null)}
                      className="text-xs text-muted-foreground hover:text-foreground"
                    >
                      Retirer
                    </button>
                  </div>
                ) : (
                  <button
                    type="button"
                    onClick={() => setOpenIconPicker(openIconPicker === index ? null : index)}
                    className="text-xs text-primary hover:underline"
                  >
                    Choisir une icône
                  </button>
                )}
              </div>

              {openIconPicker === index && (
                <div className="grid grid-cols-8 gap-1 p-2 border rounded-md bg-background max-h-32 overflow-y-auto">
                  {availableIcons.map((iconName) => {
                    const Icon = iconMap[iconName];
                    return (
                      <button
                        key={iconName}
                        type="button"
                        onClick={() => handleIconChange(index, iconName)}
                        className="p-1.5 rounded hover:bg-muted transition-all"
                        title={iconName.replace('Icon', '')}
                      >
                        <HugeiconsIcon icon={Icon} strokeWidth={2} className="w-4 h-4" />
                      </button>
                    );
                  })}
                </div>
              )}
            </div>
          </div>
        ))}
        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={handleAdd}
          className="w-full"
        >
          <HugeiconsIcon icon={PlusSignIcon} strokeWidth={2} data-icon="inline-start" />
          Ajouter une métadonnée
        </Button>
      </div>
    </div>
  );
}
