"use client";

import { DynamicIcon, availableIcons, iconMap } from "./dynamic-icon";
import { HugeiconsIcon } from "@hugeicons/react";

interface IconSelectorProps {
  value?: string | null;
  onChange: (iconName: string | null) => void;
  label?: string;
}

export function IconSelector({
  value,
  onChange,
  label = "Icône",
}: IconSelectorProps) {
  return (
    <div className="space-y-2">
      <label className="text-sm font-medium">{label}</label>
      <div className="flex items-center gap-2 mb-2">
        <div className="flex-1">
          {value ? (
            <div className="flex items-center gap-2 p-2 border rounded-md">
              <DynamicIcon iconName={value} />
              <span className="text-sm">{value.replace("Icon", "")}</span>
            </div>
          ) : (
            <div className="p-2 border rounded-md text-sm text-muted-foreground">
              Aucune icône sélectionnée
            </div>
          )}
        </div>
        {value && (
          <button
            type="button"
            onClick={() => onChange(null)}
            className="text-sm text-muted-foreground hover:text-foreground"
          >
            Effacer
          </button>
        )}
      </div>
      <div className="grid grid-cols-6 gap-1 p-2 border rounded-md max-h-40 overflow-y-auto">
        {availableIcons.map((iconName) => {
          const Icon = iconMap[iconName];
          return (
            <button
              key={iconName}
              type="button"
              onClick={() => onChange(iconName)}
              className={`
                p-2 rounded-md transition-all
                hover:bg-muted
                ${value === iconName ? "bg-primary/10 ring-1 ring-primary" : ""}
              `}
              title={iconName.replace("Icon", "")}
            >
              <HugeiconsIcon icon={Icon} strokeWidth={2} className="w-4 h-4" />
            </button>
          );
        })}
      </div>
    </div>
  );
}
