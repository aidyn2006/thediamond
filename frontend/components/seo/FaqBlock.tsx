/**
 * Visible FAQ. Pair it with `faqPageJsonLd(qa)` on the same page — Google wants the
 * answers in the HTML, not only in the structured data.
 */
export function FaqBlock({
  title = "Частые вопросы",
  qa,
}: {
  title?: string;
  qa: { q: string; a: string }[];
}) {
  if (qa.length === 0) return null;
  return (
    <section aria-labelledby="faq" className="mt-12">
      <h2 id="faq" className="mb-4 text-22 font-bold md:text-28">
        {title}
      </h2>
      <dl className="flex flex-col gap-4">
        {qa.map((item) => (
          <div key={item.q} className="rounded-card border border-border bg-surface p-5">
            <dt className="text-15 font-semibold text-text">{item.q}</dt>
            <dd className="mt-2 text-15 leading-relaxed text-text-dim">{item.a}</dd>
          </div>
        ))}
      </dl>
    </section>
  );
}
