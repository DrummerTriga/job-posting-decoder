export default function Loading() {
  return (
    <main className="flex-1 bg-neutral-950 text-neutral-100">
      <div className="max-w-5xl mx-auto px-6 py-10 space-y-8 animate-pulse">
        <div className="flex justify-between items-start gap-4">
          <div className="space-y-2">
            <div className="h-9 w-48 rounded bg-neutral-900" />
            <div className="h-4 w-72 rounded bg-neutral-900" />
          </div>
          <div className="h-9 w-32 rounded-lg bg-neutral-900" />
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          {[0, 1, 2, 3].map((i) => (
            <div
              key={i}
              className="h-20 rounded-xl bg-neutral-900 border border-neutral-800"
            />
          ))}
        </div>

        <div className="space-y-3">
          {[0, 1, 2].map((i) => (
            <div
              key={i}
              className="h-36 rounded-xl bg-neutral-900 border border-neutral-800"
            />
          ))}
        </div>
      </div>
    </main>
  );
}
