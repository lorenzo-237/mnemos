'use client';

import { useState } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { HugeiconsIcon } from '@hugeicons/react';
import { Copy01Icon } from '@hugeicons/core-free-icons';

interface TeamViewerSectionProps {
  teamviewerId: string | null;
  teamviewerPwd: string | null;
}

export function TeamViewerSection({ teamviewerId, teamviewerPwd }: TeamViewerSectionProps) {
  const [copiedId, setCopiedId] = useState(false);
  const [copiedPwd, setCopiedPwd] = useState(false);

  if (!teamviewerId) return null;

  const copyToClipboard = async (text: string, type: 'id' | 'pwd') => {
    try {
      await navigator.clipboard.writeText(text);
      if (type === 'id') {
        setCopiedId(true);
        setTimeout(() => setCopiedId(false), 2000);
      } else {
        setCopiedPwd(true);
        setTimeout(() => setCopiedPwd(false), 2000);
      }
    } catch (error) {
      console.error('Failed to copy:', error);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Accès TeamViewer</CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm font-medium">ID</p>
            <p className="text-sm text-muted-foreground font-mono">{teamviewerId}</p>
          </div>
          <Button
            variant="outline"
            size="sm"
            onClick={() => copyToClipboard(teamviewerId, 'id')}
          >
            <HugeiconsIcon icon={Copy01Icon} strokeWidth={2} data-icon="inline-start" />
            {copiedId ? 'Copié !' : 'Copier'}
          </Button>
        </div>

        {teamviewerPwd && (
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium">Mot de passe</p>
              <p className="text-sm text-muted-foreground font-mono">••••••••</p>
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={() => copyToClipboard(teamviewerPwd, 'pwd')}
            >
              <HugeiconsIcon icon={Copy01Icon} strokeWidth={2} data-icon="inline-start" />
              {copiedPwd ? 'Copié !' : 'Copier'}
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
