'use server';

import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';
import { prisma } from '@/lib/prisma';
import { requireSession } from '@/lib/auth/session';
import { tagSchema } from '@/lib/validators';

export async function getTags() {
  const session = await requireSession();

  return await prisma.tag.findMany({
    where: { organizationId: session.organizationId },
    include: {
      _count: {
        select: { sites: true }
      }
    },
    orderBy: { name: 'asc' }
  });
}

export async function getTagById(id: number) {
  const session = await requireSession();

  const tag = await prisma.tag.findUnique({
    where: { id },
    include: {
      sites: {
        include: {
          site: {
            include: {
              _count: {
                select: { machines: true }
              }
            }
          }
        }
      }
    }
  });

  if (!tag || tag.organizationId !== session.organizationId) {
    return null;
  }

  return tag;
}

export async function createTag(formData: FormData) {
  const session = await requireSession();

  const rawData = {
    name: formData.get('name') as string,
  };

  const validated = tagSchema.parse(rawData);

  await prisma.tag.create({
    data: {
      ...validated,
      organizationId: session.organizationId,
      createdById: session.userId,
    }
  });

  revalidatePath('/sites');
}

export async function updateTag(id: number, formData: FormData) {
  const session = await requireSession();

  const rawData = {
    name: formData.get('name') as string,
  };

  const validated = tagSchema.parse(rawData);

  await prisma.tag.update({
    where: {
      id,
      organizationId: session.organizationId
    },
    data: {
      ...validated,
      updatedById: session.userId
    }
  });

  revalidatePath('/sites');
}

export async function deleteTag(id: number) {
  const session = await requireSession();

  if (session.role === "UTILISATEUR") {
    throw new Error("Permission insuffisante");
  }

  const tag = await prisma.tag.findUnique({
    where: { id, organizationId: session.organizationId },
  });

  if (!tag) throw new Error("Tag non trouvé");

  await prisma.tag.delete({ where: { id } });

  revalidatePath('/sites');
}

export async function addTagToSite(siteId: number, tagId: number) {
  await prisma.siteTag.create({
    data: {
      siteId,
      tagId
    }
  });

  revalidatePath('/sites');
  revalidatePath(`/sites/${siteId}`);
}

export async function removeTagFromSite(siteId: number, tagId: number) {
  await prisma.siteTag.delete({
    where: {
      siteId_tagId: {
        siteId,
        tagId
      }
    }
  });

  revalidatePath('/sites');
  revalidatePath(`/sites/${siteId}`);
}
