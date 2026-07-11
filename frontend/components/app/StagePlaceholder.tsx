/** Temporary placeholder for screens built in later stages. */
export function StagePlaceholder({
  title,
  note,
}: {
  title: string;
  note: string;
}) {
  return (
    <div className="mx-auto max-w-[1200px] px-6 py-16 md:px-10">
      <h1 className="text-28 font-semibold">{title}</h1>
      <p className="mt-3 max-w-prose text-15 text-text-dim">{note}</p>
    </div>
  );
}
