export default function CareersPage() {
  return (
    <div className="max-w-2xl mx-auto px-6">
      <div className="mb-12">
        <p className="text-[10px] uppercase tracking-[0.28em] text-primary mb-3">Join us</p>
        <h1 className="font-heading text-4xl text-foreground mb-4">Careers</h1>
        <p className="text-muted-foreground">We&apos;re building something meaningful. Join us.</p>
      </div>

      <div className="p-6 rounded-2xl bg-muted text-center mb-8">
        <p className="font-heading text-xl text-foreground mb-2">No open roles right now</p>
        <p className="text-sm text-muted-foreground">We&apos;re a small team but growing. Check back soon or send us a spontaneous application.</p>
      </div>

      <p className="text-sm text-muted-foreground leading-relaxed">
        Interested in working with CLASSIQ? We&apos;re always open to hearing from talented designers, photographers, stylists, and operators. Send your CV and portfolio to{" "}
        <a href="mailto:hello@classiq.ng" className="text-primary underline hover:text-accent transition-colors">hello@classiq.ng</a>{" "}
        with the subject line &quot;Spontaneous Application&quot;.
      </p>
    </div>
  );
}
