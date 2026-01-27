export default function MachineDetailLoading() {
  return (
    <div>
      <div className="h-4 bg-muted rounded w-32 mb-4 animate-pulse"></div>

      <div className="flex items-start justify-between mb-8">
        <div className="flex-1">
          <div className="h-9 bg-muted rounded w-64 mb-2 animate-pulse"></div>
          <div className="h-4 bg-muted rounded w-48 animate-pulse"></div>
        </div>
        <div className="flex gap-2">
          <div className="h-10 w-24 bg-muted rounded animate-pulse"></div>
          <div className="h-10 w-24 bg-muted rounded animate-pulse"></div>
        </div>
      </div>

      <div className="space-y-6">
        <div className="h-40 bg-muted rounded animate-pulse"></div>
        <div className="h-60 bg-muted rounded animate-pulse"></div>
      </div>
    </div>
  );
}
