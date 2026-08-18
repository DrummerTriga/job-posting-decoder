export default function Section({
  title,
  tone,
  action,
  children,
}: {
  title: string;
  tone?: "red";
  action?: React.ReactNode;
  children: React.ReactNode;
}) {
  return (
    <section
      className={`p-4 rounded-xl bg-neutral-950 border ${
        tone === "red" ? "border-red-900/50" : "border-neutral-800"
      }`}
    >
      <div className="flex items-center justify-between gap-3 mb-2">
        <h3
          className={`font-semibold text-sm ${
            tone === "red" ? "text-red-400" : "text-neutral-200"
          }`}
        >
          {title}
        </h3>
        {action}
      </div>
      {children}
    </section>
  );
}
