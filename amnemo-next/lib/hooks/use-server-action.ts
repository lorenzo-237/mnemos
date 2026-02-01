'use client';

import { useError } from '@/components/error-provider';
import { useCallback } from 'react';

/**
 * Hook to wrap server actions with automatic error handling.
 *
 * Usage:
 * ```tsx
 * const handleDelete = useServerAction(async () => {
 *   await deleteSite(siteId);
 * });
 *
 * <Button onClick={handleDelete}>Delete</Button>
 * ```
 */
export function useServerAction<T extends (...args: any[]) => Promise<any>>(
  action: T
): (...args: Parameters<T>) => Promise<void> {
  const { showError } = useError();

  return useCallback(
    async (...args: Parameters<T>) => {
      try {
        await action(...args);
      } catch (error) {
        const message = error instanceof Error ? error.message : 'Une erreur est survenue';
        showError(message);
      }
    },
    [action, showError]
  );
}
