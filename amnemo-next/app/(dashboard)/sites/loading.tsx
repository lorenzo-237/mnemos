import { LoadingCardGrid } from '@/components/shared/loading-card';

export default function SitesLoading() {
  return (
    <div>
      <div className="flex items-center justify-between mb-8">
        <div>
          <div className="h-9 bg-muted rounded w-32 animate-pulse"></div>
          <div className="h-4 bg-muted rounded w-64 mt-2 animate-pulse"></div>
        </div>
      </div>

      <LoadingCardGrid />
    </div>
  );
}
