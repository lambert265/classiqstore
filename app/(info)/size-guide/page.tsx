export default function SizeGuidePage() {
  return (
    <div className="max-w-2xl mx-auto px-6">
      <div className="mb-12">
        <p className="text-[10px] uppercase tracking-[0.28em] text-primary mb-3">Fit</p>
        <h1 className="font-heading text-4xl text-foreground mb-4">Size Guide</h1>
        <p className="text-muted-foreground">All measurements are in centimetres. When in doubt, size up.</p>
      </div>

      <section className="mb-10">
        <h2 className="font-heading text-xl text-foreground mb-4">Women&apos;s Clothing</h2>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border">
                {["Size", "Bust", "Waist", "Hips"].map((h) => (
                  <th key={h} className="text-left text-[10px] uppercase tracking-[0.18em] text-muted-foreground py-3 pr-6">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {[
                ["XS", "78–82", "60–64", "86–90"],
                ["S", "82–86", "64–68", "90–94"],
                ["M", "86–92", "68–74", "94–100"],
                ["L", "92–98", "74–80", "100–106"],
                ["XL", "98–104", "80–86", "106–112"],
                ["2XL", "104–112", "86–94", "112–120"],
              ].map(([size, bust, waist, hips]) => (
                <tr key={size} className="text-foreground">
                  <td className="py-3.5 pr-6 font-medium">{size}</td>
                  <td className="py-3.5 pr-6 text-muted-foreground">{bust}</td>
                  <td className="py-3.5 pr-6 text-muted-foreground">{waist}</td>
                  <td className="py-3.5 pr-6 text-muted-foreground">{hips}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      <section className="mb-10">
        <h2 className="font-heading text-xl text-foreground mb-4">How to Measure</h2>
        <div className="flex flex-col gap-4">
          {[
            { label: "Bust", desc: "Measure around the fullest part of your chest, keeping the tape parallel to the floor." },
            { label: "Waist", desc: "Measure around your natural waist — the narrowest part of your torso." },
            { label: "Hips", desc: "Measure around the fullest part of your hips, about 20cm below your waist." },
          ].map(({ label, desc }) => (
            <div key={label} className="flex gap-4 p-4 rounded-2xl bg-muted">
              <span className="text-[10px] uppercase tracking-[0.2em] text-primary font-medium w-14 shrink-0 mt-0.5">{label}</span>
              <p className="text-sm text-muted-foreground leading-relaxed">{desc}</p>
            </div>
          ))}
        </div>
      </section>

      <p className="text-sm text-muted-foreground">
        Need help with your size? <a href="/contact" className="text-primary hover:text-accent transition-colors underline">Contact our team</a> and we&apos;ll guide you personally.
      </p>
    </div>
  );
}
