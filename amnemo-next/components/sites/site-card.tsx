'use client';

import Link from 'next/link';
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { MachineQuickView } from '@/components/machines/machine-quick-view';
import { MachineTypeBadge } from '@/components/machines/machine-type-badge';
import { DynamicIcon } from '@/components/shared/dynamic-icon';
import { HugeiconsIcon } from '@hugeicons/react';
import { ArrowRight01Icon, FolderIcon } from '@hugeicons/core-free-icons';

interface SiteWithMachines {
  id: number;
  name: string;
  description?: string | null;
  iconName?: string | null;
  isObsolete?: boolean;
  createdAt: Date;
  folder?: {
    id: number;
    name: string;
  } | null;
  tags?: Array<{
    tag: {
      id: number;
      name: string;
      color?: string | null;
    };
  }>;
  machines: Array<{
    id: number;
    name: string;
    type: 'SERVER' | 'CLIENT';
    teamviewerId: string | null;
    _count: { installations: number };
  }>;
}

export function SiteCard({ site }: { site: SiteWithMachines }) {
  const displayedMachines = site.machines.slice(0, 3);
  const remainingCount = site.machines.length - displayedMachines.length;

  return (
    <Card className={`group hover:shadow-md transition-all flex flex-col ${site.isObsolete ? 'opacity-60' : ''}`}>
      <Link href={`/sites/${site.id}`}>
        <CardHeader className="pb-3">
          <div className="flex items-start gap-3">
            {site.iconName && (
              <div className="mt-1">
                <DynamicIcon iconName={site.iconName} className="w-5 h-5" />
              </div>
            )}
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2">
                <CardTitle className="group-hover:text-primary transition-colors truncate">
                  {site.name}
                </CardTitle>
                {site.isObsolete && (
                  <Badge variant="destructive" className="text-xs">
                    Obsolète
                  </Badge>
                )}
              </div>
              {site.description && (
                <p className="text-xs text-muted-foreground mt-1 line-clamp-2">
                  {site.description}
                </p>
              )}
              <CardDescription className="mt-1">
                {site.machines.length} machine{site.machines.length > 1 ? 's' : ''}
              </CardDescription>
            </div>
          </div>

          {/* Folder and Tags */}
          {(site.folder || (site.tags && site.tags.length > 0)) && (
            <div className="flex flex-wrap gap-1 mt-2">
              {site.folder && (
                <Badge variant="outline" className="text-xs">
                  <HugeiconsIcon icon={FolderIcon} strokeWidth={2} className="w-3 h-3 mr-1" />
                  {site.folder.name}
                </Badge>
              )}
              {site.tags?.map((siteTag) => (
                <span
                  key={siteTag.tag.id}
                  className="inline-flex items-center px-2 py-0.5 rounded-md text-xs font-medium text-white"
                  style={{ backgroundColor: siteTag.tag.color || '#6B7280' }}
                >
                  {siteTag.tag.name}
                </span>
              ))}
            </div>
          )}
        </CardHeader>
      </Link>

      {site.machines.length > 0 && (
        <>
          <Separator />
          <CardContent className="pt-4 pb-3 flex-1">
            <div className="space-y-2">
              {displayedMachines.map((machine) => (
                <MachineQuickView
                  key={machine.id}
                  machine={{
                    ...machine,
                    siteId: site.id,
                    installations: []
                  }}
                  trigger={
                    <div className="flex items-center justify-between p-2 rounded hover:bg-muted/50 transition-colors cursor-pointer group/machine">
                      <div className="flex items-center gap-2 flex-1 min-w-0">
                        <MachineTypeBadge type={machine.type} />
                        <span className="text-sm font-medium truncate group-hover/machine:text-primary transition-colors">
                          {machine.name}
                        </span>
                      </div>
                      <Badge variant="secondary" className="text-xs ml-2">
                        {machine._count.installations}
                      </Badge>
                    </div>
                  }
                />
              ))}

              {remainingCount > 0 && (
                <Link href={`/sites/${site.id}`}>
                  <div className="flex items-center justify-center p-2 rounded hover:bg-muted/50 transition-colors cursor-pointer text-sm text-muted-foreground hover:text-foreground">
                    + {remainingCount} autre{remainingCount > 1 ? 's' : ''}
                  </div>
                </Link>
              )}
            </div>
          </CardContent>
        </>
      )}

      <CardFooter className="pt-3 border-t">
        <Link href={`/sites/${site.id}`} className="w-full">
          <Button variant="ghost" size="sm" className="w-full">
            <HugeiconsIcon icon={ArrowRight01Icon} strokeWidth={2} data-icon="inline-end" />
            Gérer le site
          </Button>
        </Link>
      </CardFooter>
    </Card>
  );
}
