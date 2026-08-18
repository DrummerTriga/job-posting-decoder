export default function Loading() {
  return (
    <main className="flex-1 bg-neutral-950 text-neutral-100">
      <div className="max-w-2xl mx-auto px-6 py-10 space-y-8 animate-pulse">
        <div className="space-y-2">
          <div className="h-9 w-40 rounded bg-neutral-900" />
          <div className="h-4 w-full max-w-md rounded bg-neutral-900" />
        </div>
        <div className="h-32 rounded-xl bg-neutral-900 border border-neutral-800" />
        <div className="h-48 rounded-xl bg-neutral-900 border border-dashed border-neutral-800" />
      </div>
    </main>
  );
}
