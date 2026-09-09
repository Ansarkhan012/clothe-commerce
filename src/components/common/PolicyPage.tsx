import { businessConfig } from "@/src/config/business";
export type PolicySection = { title: string; body: string };
export function PolicyPage({
  title,
  intro,
  sections,
}: {
  title: string;
  intro: string;
  sections: PolicySection[];
}) {
  const contacts = [
    businessConfig.supportEmail && `Email: ${businessConfig.supportEmail}`,
    businessConfig.supportPhone && `Phone: ${businessConfig.supportPhone}`,
    businessConfig.businessAddress &&
      `Address: ${businessConfig.businessAddress}`,
  ].filter(Boolean);
  return (
    <main className="mx-auto max-w-4xl px-5 py-16">
      <p className="text-xs uppercase tracking-[.2em] text-brand-gold-dark">
        Customer information
      </p>
      <h1 className="mt-2 font-display text-4xl text-brand-green-dark sm:text-5xl">
        {title}
      </h1>
      <p className="mt-5 max-w-3xl leading-7 text-muted">{intro}</p>
      <div className="mt-10 space-y-8">
        {sections.map((section) => (
          <section key={section.title} className="border-t border-border pt-6">
            <h2 className="font-display text-2xl">{section.title}</h2>
            <p className="mt-3 whitespace-pre-line leading-7 text-muted">
              {section.body}
            </p>
          </section>
        ))}
      </div>
      <aside className="mt-12 border border-brand-gold/50 bg-brand-cream p-5 text-sm">
        <strong>Need assistance?</strong>{" "}
        {contacts.length
          ? contacts.join(" · ")
          : "Use the secure Support form. Verified business contact details will be published after confirmation."}
      </aside>
    </main>
  );
}
