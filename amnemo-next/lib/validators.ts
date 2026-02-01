import { z } from "zod";

const metadataValueSchema = z.object({
  value: z.string(),
  iconName: z.string().optional(),
});

// metadata = Record<string, MetadataValue>
const metadataSchema = z
  .string() // FormData envoie une string JSON
  .optional()
  .transform((val) => {
    if (!val || val.trim() === "") {
      return null;
    }
    try {
      const parsed = JSON.parse(val);
      // Zod check : doit être un objet dont les valeurs sont des metadataValueSchema
      return z.record(z.string(), metadataValueSchema).parse(parsed);
    } catch (e) {
      throw new z.ZodError([
        {
          code: "custom",
          path: ["metadata"],
          message: "Metadata JSON invalide",
        },
      ]);
    }
  })
  .nullable();

export const siteSchema = z.object({
  name: z.string().min(1, "Le nom du site est requis").max(100),
  description: z.string().optional().nullable(),
  iconName: z.string().optional().nullable(),
  isObsolete: z.preprocess(
    (val) => val === "true" || val === true,
    z.boolean().optional(),
  ),
  obsoleteReason: z.string().optional().nullable(),
  folderId: z.preprocess(
    (val) => (val && val !== "none" ? Number(val) : undefined),
    z.number().optional(),
  ),
  metadata: metadataSchema,
});

export const machineSchema = z.object({
  name: z.string().min(1, "Le nom de la machine est requis").max(100),
  type: z.enum(["SERVER", "CLIENT"]),
  teamviewerId: z.string().optional(),
  teamviewerPwd: z.string().optional(),
});

export const softwareSchema = z.object({
  name: z.string().min(1, "Le nom du logiciel est requis").max(100),
  description: z.string().optional().nullable(),
  iconName: z.string().optional().nullable(),
  metadata: metadataSchema,
});

export const installationSchema = z.object({
  softwareName: z.string().min(1, "Le nom du logiciel est requis").max(100),
  version: z.string().min(1, "La version est requise").max(50),
});

export const updateSoftwareSchema = z.object({
  oldInstallationId: z.coerce.number(),
  softwareId: z.coerce.number(),
  newVersion: z.string().min(1, "La nouvelle version est requise").max(50),
});

export type SiteSchemaData = z.infer<typeof siteSchema>;
export type MachineSchemaData = z.infer<typeof machineSchema>;
export type SoftwareSchemaData = z.infer<typeof softwareSchema>;
export type InstallationSchemaData = z.infer<typeof installationSchema>;
export type UpdateSoftwareSchemaData = z.infer<typeof updateSoftwareSchema>;

export const userSchema = z.object({
  username: z.string().min(3, "Le nom d'utilisateur doit avoir au moins 3 caractères").max(50),
  password: z.string().min(8, "Le mot de passe doit avoir au moins 8 caractères"),
  role: z.enum(["UTILISATEUR", "GESTIONNAIRE", "ADMIN"]).default("UTILISATEUR"),
});

export const organizationSchema = z.object({
  name: z.string().min(1, "Le nom de l'organisation est requis").max(100),
});

export const folderSchema = z.object({
  name: z.string().min(1, "Le nom du dossier est requis").max(100),
});

export const tagSchema = z.object({
  name: z.string().min(1, "Le nom du tag est requis").max(100),
});

export type UserSchemaData = z.infer<typeof userSchema>;
export type OrganizationSchemaData = z.infer<typeof organizationSchema>;
export type FolderSchemaData = z.infer<typeof folderSchema>;
export type TagSchemaData = z.infer<typeof tagSchema>;
