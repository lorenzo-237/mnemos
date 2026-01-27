import { Badge } from '@/components/ui/badge';
import { MachineType } from '@/lib/types';

export function MachineTypeBadge({ type }: { type: MachineType }) {
  return (
    <Badge variant={type === 'SERVER' ? 'default' : 'secondary'}>
      {type === 'SERVER' ? 'Serveur' : 'Client'}
    </Badge>
  );
}
