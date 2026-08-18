// Dynamic routes without a loading file are not prefetched, so the click sits
// there with no feedback until the server responds. This makes the navigation
// land immediately and stream the page in behind it.
export default function Loading() {
  return (
    <main className="flex-1 bg-neutral-950 text-neutral-100">
      <div className="max-w-5xl mx-auto px-6 py-10 space-y-8 animate-pulse">
        <div className="space-y-3">
          <div className="h-3 w-24 rounded bg-neutral-900" />
          <div className="h-9 w-2/3 rounded bg-neutral-900" />
          <div className="h-4 w-1/2 rounded bg-neutral-900" />
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          {[0, 1, 2, 3].map((i) => (
            <div
              key={i}
              className="h-20 rounded-xl bg-neutral-900 border border-neutral-800"
            />
          ))}
        </div>

        <div className="grid gap-4 sm:grid-cols-3">
          {[0, 1, 2].map((i) => (
            <div
              key={i}
              className="h-32 rounded-xl bg-neutral-900 border border-neutral-800"
            />
          ))}
        </div>
      </div>
    </main>
  );
}
