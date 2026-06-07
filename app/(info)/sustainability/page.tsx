export default function SustainabilityPage() {
  return (
    <div className="max-w-2xl mx-auto px-6">
      <div className="mb-12">
        <p className="text-[10px] uppercase tracking-[0.28em] text-primary mb-3">Responsibility</p>
        <h1 className="font-heading text-4xl text-foreground mb-4">Sustainability</h1>
        <p className="text-muted-foreground">Fashion with a conscience.</p>
      </div>
      <div className="flex flex-col gap-8 text-sm text-muted-foreground leading-relaxed">
        {[
          { title: "Small-Batch Production", body: "We produce in limited quantities to reduce deadstock and overproduction. Every item is made to be worn, not warehoused." },
          { title: "Conscious Materials", body: "We prioritise natural fabrics — cotton, linen, and silk — sourced from responsible suppliers. We are actively working towards fully traceable supply chains." },
          { title: "Packaging", body: "Our packaging is plastic-free. Orders ship in recycled paper mailers and tissue. We are continually reducing our packaging footprint." },
          { title: "Longevity by Design", body: "We design pieces to last. Timeless silhouettes mean our clothes never go out of style — reducing the cycle of fast fashion." },
        ].map(({ title, body }) => (
          <section key={title}>
            <h2 className="font-heading text-lg text-foreground mb-2">{title}</h2>
            <p>{body}</p>
          </section>
        ))}
      </div>
    </div>
  );
}
