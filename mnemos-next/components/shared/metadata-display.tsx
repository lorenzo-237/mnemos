import { DynamicIcon } from '@/components/shared/dynamic-icon';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

interface MetadataValue {
  value: string;
  iconName?: string;
}

interface MetadataDisplayProps {
  metadata: Record<string, MetadataValue> | null | undefined;
  title?: string;
}

export function MetadataDisplay({ metadata, title = "Informations supplémentaires" }: MetadataDisplayProps) {
  if (!metadata || Object.keys(metadata).length === 0) {
    return null;
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg">{title}</CardTitle>
      </CardHeader>
      <CardContent>
        <dl className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {Object.entries(metadata).map(([key, data]) => {
            const metadataValue = typeof data === 'string'
              ? { value: data, iconName: undefined }
              : data;

            return (
              <div key={key} className="flex gap-3">
                {metadataValue.iconName && (
                  <div className="flex-shrink-0 mt-0.5">
                    <DynamicIcon iconName={metadataValue.iconName} className="w-5 h-5 text-muted-foreground" />
                  </div>
                )}
                <div className="flex-1 min-w-0">
                  <dt className="text-sm font-medium text-muted-foreground mb-1">{key}</dt>
                  <dd className="text-sm break-words">{metadataValue.value}</dd>
                </div>
              </div>
            );
          })}
        </dl>
      </CardContent>
    </Card>
  );
}
