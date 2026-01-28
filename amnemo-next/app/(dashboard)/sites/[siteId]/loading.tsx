import { LoadingCardGrid } from '@/components/shared/loading-card';

export default function SiteDetailLoading() {
  return (
    <div>
      <div className="flex items-center justify-between mb-8">
        <div className="flex-1">
          <div className="h-9 bg-muted rounded w-48 animate-pulse"></div>
          <div className="h-4 bg-muted rounded w-32 mt-2 animate-pulse"></div>
        </div>
        <div className="flex gap-2">
          <div className="h-10 w-24 bg-muted rounded animate-pulse"></div>
          <div className="h-10 w-24 bg-muted rounded animate-pulse"></div>
        </div>
      </div>

      <div>
        <div className="h-6 bg-muted rounded w-32 mb-4 animate-pulse"></div>
        <LoadingCardGrid />
      </div>
    </div>
  );
}
