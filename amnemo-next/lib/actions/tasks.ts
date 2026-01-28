'use server';

import { revalidatePath } from 'next/cache';
import { prisma } from '@/lib/prisma';
import { z } from 'zod';

const taskSchema = z.object({
  name: z.string().min(1, 'Le nom est requis').max(100),
  description: z.string().optional().nullable(),
  type: z.enum(['DEFAULT', 'SOFTWARE_REPLACEMENT']).default('DEFAULT'),
  targetType: z.enum(['SERVER', 'CLIENT']),
  iconName: z.string().optional().nullable(),
});

export async function getTasks(targetType?: 'SERVER' | 'CLIENT') {
  const where = targetType ? { targetType } : {};

  return await prisma.task.findMany({
    where,
    include: { tags: { include: { tag: true } } },
    orderBy: { name: 'asc' }
  });
}

export async function getTaskById(id: number) {
  return await prisma.task.findUnique({
    where: { id }
  });
}

export async function createTask(formData: FormData) {
  const rawData = {
    name: formData.get('name') as string,
    description: formData.get('description') as string,
    type: (formData.get('type') as 'DEFAULT' | 'SOFTWARE_REPLACEMENT') || 'DEFAULT',
    targetType: formData.get('targetType') as 'SERVER' | 'CLIENT',
    iconName: formData.get('iconName') as string,
  };

  const validated = taskSchema.parse(rawData);

  await prisma.task.create({
    data: {
      name: validated.name,
      description: validated.description,
      type: validated.type,
      targetType: validated.targetType,
      iconName: validated.iconName,
    }
  });

  revalidatePath('/tasks');
}

export async function updateTask(id: number, formData: FormData) {
  const rawData = {
    name: formData.get('name') as string,
    description: formData.get('description') as string,
    type: (formData.get('type') as 'DEFAULT' | 'SOFTWARE_REPLACEMENT') || 'DEFAULT',
    targetType: formData.get('targetType') as 'SERVER' | 'CLIENT',
    iconName: formData.get('iconName') as string,
  };

  const validated = taskSchema.parse(rawData);

  await prisma.task.update({
    where: { id },
    data: {
      name: validated.name,
      description: validated.description,
      type: validated.type,
      targetType: validated.targetType,
      iconName: validated.iconName,
    }
  });

  revalidatePath('/tasks');
}

export async function deleteTask(id: number) {
  await prisma.task.delete({
    where: { id }
  });

  revalidatePath('/tasks');
}

export async function addTagToTask(taskId: number, tagId: number) {
  await prisma.taskTag.create({
    data: {
      taskId,
      tagId
    }
  });

  revalidatePath('/tasks');
}

export async function removeTagFromTask(taskId: number, tagId: number) {
  await prisma.taskTag.delete({
    where: {
      taskId_tagId: {
        taskId,
        tagId
      }
    }
  });

  revalidatePath('/tasks');
}
