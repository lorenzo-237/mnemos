// Types intermédiaires pour éviter d'importer Prisma côté client

export const MachineType = {
  SERVER: "SERVER",
  CLIENT: "CLIENT",
} as const;

export type MachineType = (typeof MachineType)[keyof typeof MachineType];

// Types pour les composants client
export interface MachineFormData {
  id: number;
  name: string;
  type: MachineType;
  siteId: number;
  teamviewerId: string | null;
  teamviewerPwd: string | null;
  createdAt: Date;
}

export interface MetadataValue {
  value: string;
  iconName?: string;
}

export interface SiteFormData {
  id: number;
  name: string;
  description?: string | null;
  iconName?: string | null;
  metadata?: Record<string, MetadataValue> | null;
  isObsolete?: boolean;
  obsoleteReason?: string | null;
  folderId?: number | null;
  createdAt: Date;
  folder?: {
    id: number;
    name: string;
  } | null;
  tags?: Array<{
    tag: {
      id: number;
      name: string;
    };
  }>;
}
