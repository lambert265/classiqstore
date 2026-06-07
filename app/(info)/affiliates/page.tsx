export default function AffiliatesPage() {
  return (
    <div className="max-w-2xl mx-auto px-6">
      <div className="mb-12">
        <p className="text-[10px] uppercase tracking-[0.28em] text-primary mb-3">Partner with us</p>
        <h1 className="font-heading text-4xl text-foreground mb-4">Affiliates</h1>
        <p className="text-muted-foreground">Earn by sharing what you love.</p>
      </div>

      <div className="flex flex-col gap-8 text-sm text-muted-foreground leading-relaxed">
        <p>
          The CLASSIQ Affiliate Programme lets content creators, stylists, and fashion enthusiasts earn a commission on every sale they refer. If your audience loves refined womenswear, this is for you.
        </p>

        <div className="grid grid-cols-3 gap-4">
          {[
            { num: "10%", label: "Commission per sale" },
            { num: "30 days", label: "Cookie window" },
            { num: "Monthly", label: "Payout schedule" },
          ].map(({ num, label }) => (
            <div key={label} className="p-5 rounded-2xl bg-muted text-center flex flex-col gap-1">
              <span className="font-heading text-2xl text-foreground">{num}</span>
              <span className="text-[10px] uppercase tracking-[0.16em] text-muted-foreground">{label}</span>
            </div>
          ))}
        </div>

        <p>
          To apply, email <a href="mailto:hello@classiq.ng" className="text-primary underline hover:text-accent transition-colors">hello@classiq.ng</a> with your name, platform links, and a brief note on your audience. We&apos;ll be in touch within 5 business days.
        </p>
      </div>
    </div>
  );
}
