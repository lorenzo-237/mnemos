"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { requireSession } from "@/lib/auth/session";
import { siteSchema } from "@/lib/validators";
import { MetadataValue } from "../types";
import { Prisma } from "@/generated/prisma/client";

function normalizeJson<T>(value: unknown): T | null {
  if (value === null || value === undefined) return null;
  return JSON.parse(JSON.stringify(value));
}

export async function getSites(folderIds?: number[], tagIds?: number[], name?: string) {
  const session = await requireSession();
  const where: any = { organizationId: session.organizationId };

  // Build AND conditions array
  const andConditions: any[] = [];

  // Filter by name (contains, case-insensitive)
  if (name && name.trim()) {
    andConditions.push({
      name: { contains: name.trim(), mode: "insensitive" },
    });
  }

  // Filter by folders (OR condition)
  if (folderIds && folderIds.length > 0) {
    andConditions.push({
      folderId: {
        in: folderIds,
      },
    });
  }

  // Filter by tags (OR condition - site must have at least one of the selected tags)
  if (tagIds && tagIds.length > 0) {
    andConditions.push({
      tags: {
        some: {
          tagId: {
            in: tagIds,
          },
        },
      },
    });
  }

  // Apply AND conditions if any
  if (andConditions.length > 0) {
    where.AND = andConditions;
  }

  return prisma.site.findMany({
    where,
    include: {
      folder: true,
      tags: {
        include: {
          tag: true,
        },
      },
      _count: {
        select: { machines: true },
      },
      machines: {
        include: {
          _count: {
            select: {
              installations: {
                where: { removedAt: null },
              },
            },
          },
        },
      },
    },
    orderBy: { name: "asc" },
  });
}

export async function getSiteById(id: number) {
  const session = await requireSession();

  const site = await prisma.site.findUnique({
    where: { id },
    include: {
      folder: true,
      tags: {
        include: {
          tag: true,
        },
      },
      machines: {
        include: {
          _count: {
            select: {
              installations: {
                where: { removedAt: null },
              },
            },
          },
        },
        orderBy: { name: "asc" },
      },
    },
  });

  if (!site || site.organizationId !== session.organizationId) return null;

  return {
    ...site,
    metadata: normalizeJson<Record<string, MetadataValue>>(site.metadata),
  };
}

export async function createSite(formData: FormData) {
  const session = await requireSession();
  const rawData: any = Object.fromEntries(formData);

  const validatedData = siteSchema.parse(rawData);

  const site = await prisma.site.create({
    data: {
      name: validatedData.name,
      description: validatedData.description,
      iconName: validatedData.iconName,
      isObsolete: validatedData.isObsolete || false,
      obsoleteReason: validatedData.obsoleteReason,
      folderId: validatedData.folderId,
      metadata: validatedData.metadata ?? Prisma.JsonNull,
      organizationId: session.organizationId,
      createdById: session.userId,
    },
  });

  revalidatePath("/sites");
  return site.id;
}

export async function updateSite(id: number, formData: FormData) {
  const session = await requireSession();
  const rawData: any = Object.fromEntries(formData);

  const validatedData = siteSchema.parse(rawData);

  await prisma.site.update({
    where: {
      id,
      organizationId: session.organizationId
    },
    data: {
      name: validatedData.name,
      description: validatedData.description,
      iconName: validatedData.iconName,
      isObsolete: validatedData.isObsolete,
      obsoleteReason: validatedData.obsoleteReason,
      folderId: validatedData.folderId,
      metadata: validatedData.metadata ?? Prisma.JsonNull,
      updatedById: session.userId,
    },
  });

  revalidatePath(`/sites/${id}`);
  revalidatePath("/sites");
}

export async function deleteSite(id: number) {
  const session = await requireSession();

  if (session.role === "UTILISATEUR") {
    throw new Error("Permission insuffisante");
  }

  const site = await prisma.site.findUnique({
    where: { id, organizationId: session.organizationId },
  });

  if (!site) throw new Error("Site non trouvé");

  await prisma.site.delete({ where: { id } });
  revalidatePath("/sites");
  redirect("/sites");
}
