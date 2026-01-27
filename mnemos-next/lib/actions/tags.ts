'use server';

import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';
import { prisma } from '@/lib/prisma';
import { z } from 'zod';

const tagSchema = z.object({
  name: z.string().min(1, 'Le nom est requis').max(50, 'Le nom est trop long'),
});

export async function getTags() {
  return await prisma.tag.findMany({
    include: {
      _count: {
        select: { sites: true }
      }
    },
    orderBy: { name: 'asc' }
  });
}

export async function getTagById(id: number) {
  return await prisma.tag.findUnique({
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
}

export async function createTag(formData: FormData) {
  const rawData = {
    name: formData.get('name') as string,
  };

  const validated = tagSchema.parse(rawData);

  await prisma.tag.create({
    data: validated
  });

  revalidatePath('/sites');
}

export async function updateTag(id: number, formData: FormData) {
  const rawData = {
    name: formData.get('name') as string,
  };

  const validated = tagSchema.parse(rawData);

  await prisma.tag.update({
    where: { id },
    data: validated
  });

  revalidatePath('/sites');
}

export async function deleteTag(id: number) {
  await prisma.tag.delete({
    where: { id }
  });

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
