"use client";

export function Skeleton({ className = "", style }: { className?: string; style?: React.CSSProperties }) {
  return (
    <div
      className={`animate-pulse rounded ${className}`}
      style={{ background: "rgba(37,45,61,0.4)", ...style }}
    />
  );
}

export function CardSkeleton() {
  return (
    <div className="p-4" style={{ background: "rgba(14,17,24,0.8)", border: "1px solid rgba(37,45,61,0.45)", borderRadius: 8 }}>
      <div className="flex justify-between mb-3">
        <Skeleton style={{ width: 32, height: 32, borderRadius: 8 }} />
        <Skeleton style={{ width: 52, height: 20, borderRadius: 4 }} />
      </div>
      <Skeleton style={{ width: "60%", height: 10, marginBottom: 8 }} />
      <Skeleton style={{ width: "80%", height: 28, marginBottom: 6 }} />
      <Skeleton style={{ width: "50%", height: 10 }} />
    </div>
  );
}

export function TableSkeleton({ rows = 5 }: { rows?: number }) {
  return (
    <div className="space-y-3">
      {Array.from({ length: rows }).map((_, i) => (
        <div key={i} className="flex gap-6">
          <Skeleton style={{ width: 80,  height: 14 }} />
          <Skeleton style={{ width: 50,  height: 14 }} />
          <Skeleton style={{ width: 40,  height: 14 }} />
          <Skeleton style={{ width: 70,  height: 14 }} />
          <Skeleton style={{ width: 70,  height: 14 }} />
          <Skeleton style={{ width: 60,  height: 14 }} />
          <Skeleton style={{ width: 80,  height: 14 }} />
        </div>
      ))}
    </div>
  );
}

export function ErrorState({ message, onRetry }: { message: string; onRetry?: () => void }) {
  return (
    <div className="flex flex-col items-center justify-center py-16 text-center">
      <div className="w-10 h-10 rounded-full flex items-center justify-center mb-4"
        style={{ background: "rgba(239,68,68,0.08)", border: "1px solid rgba(239,68,68,0.2)" }}>
        <span style={{ color: "#ef4444" }}>!</span>
      </div>
      <p className="text-sm mb-3" style={{ color: "#6b7a8d" }}>{message}</p>
      {onRetry && (
        <button onClick={onRetry} className="text-xs px-4 py-2 rounded"
          style={{ border: "1px solid rgba(37,45,61,0.5)", color: "#9fa8b4" }}>
          Try again
        </button>
      )}
    </div>
  );
}
