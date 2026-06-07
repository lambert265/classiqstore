export default function PressPage() {
  return (
    <div className="max-w-2xl mx-auto px-6">
      <div className="mb-12">
        <p className="text-[10px] uppercase tracking-[0.28em] text-primary mb-3">Media</p>
        <h1 className="font-heading text-4xl text-foreground mb-4">Press</h1>
        <p className="text-muted-foreground">For press enquiries, collaborations, and media assets.</p>
      </div>

      <div className="flex flex-col gap-6 text-sm text-muted-foreground leading-relaxed">
        <p>
          CLASSIQ is available for editorial features, lookbook collaborations, and brand partnerships. We welcome press enquiries from fashion editors, bloggers, and content creators.
        </p>
        <div className="p-5 rounded-2xl bg-muted">
          <p className="text-[10px] uppercase tracking-[0.2em] text-muted-foreground mb-1">Press contact</p>
          <a href="mailto:press@classiq.ng" className="text-primary text-sm hover:text-accent transition-colors">press@classiq.ng</a>
        </div>
        <p>
          For brand assets, hi-res imagery, and press kits, please email us and we will respond within 2 business days.
        </p>
      </div>
    </div>
  );
}
