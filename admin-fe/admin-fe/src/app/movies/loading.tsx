export default function MoviesLoading() {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="h-8 w-32 animate-pulse rounded bg-gray-200" />
        <div className="h-10 w-32 animate-pulse rounded bg-gray-200" />
      </div>

      <div className="rounded-lg bg-white p-6 shadow">
        <div className="space-y-4">
          {[...Array(5)].map((_, i) => (
            <div key={i} className="h-16 animate-pulse rounded bg-gray-200" />
          ))}
        </div>
      </div>
    </div>
  );
}