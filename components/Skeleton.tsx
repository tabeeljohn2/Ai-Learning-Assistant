// components/Skeleton.tsx
export function ModuleCardSkeleton() {
  return (
    <div className="bg-paper/40 rounded-sm p-5 animate-pulse">
      <div className="h-4 bg-paper/60 rounded w-1/3 mb-3"></div>
      <div className="h-3 bg-paper/40 rounded w-2/3"></div>
    </div>
  );
}

export function WeakAreaSkeleton() {
  return (
    <div className="bg-clayTint/20 border-l-4 border-clay/40 rounded-sm p-5 animate-pulse">
      <div className="h-4 bg-clay/30 rounded w-1/4 mb-3"></div>
      <div className="h-3 bg-clay/20 rounded w-1/2"></div>
    </div>
  );
}