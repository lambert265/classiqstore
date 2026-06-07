import Image from "next/image";

export default function Featured() {
  return (
    <section className="py-20 px-6 bg-secondary">
      <div className="max-w-7xl mx-auto">
        <div className="flex items-center justify-between mb-10">
          <div className="flex flex-col gap-1">
            <p className="text-[10px] uppercase tracking-[0.32em] text-muted-foreground">Featured Collection</p>
            <h2 className="font-display text-4xl md:text-5xl tracking-[-0.01em]">The Lumière Edit</h2>
          </div>
          <a href="/" className="px-5 py-2 rounded-full border border-foreground text-[10px] uppercase tracking-[0.18em] text-foreground hover:bg-foreground hover:text-background transition-colors duration-200">
            Explore
          </a>
        </div>

        {/* Images + card — stacked on mobile, overlaid on desktop */}
        <div className="relative rounded-2xl overflow-hidden">
          <div className="grid grid-cols-3 gap-px bg-border">
            {["/story-1.jpg", "/product-1.jpg", "/story-3.jpg"].map((src, i) => (
              <div key={src} className={`relative overflow-hidden bg-muted ${i === 1 ? "aspect-[3/5]" : "aspect-[3/4]"}`}>
                <Image src={src} alt="Collection look" fill className="object-cover" sizes="33vw" />
              </div>
            ))}
          </div>

          {/* Gradient veil */}
          <div className="absolute inset-0 bg-gradient-to-t from-foreground/70 via-foreground/10 to-transparent pointer-events-none" />

          {/* Card — below images on mobile, overlaid on md+ */}
          <div className="relative md:absolute md:bottom-6 md:left-6 md:right-auto md:max-w-sm bg-white/95 md:bg-white/85 backdrop-blur-md border border-blue-100 rounded-2xl p-6 md:p-8 flex flex-col gap-4 md:gap-5">
            <div className="flex flex-col gap-2">
              <p className="text-[10px] uppercase tracking-[0.28em] text-muted-foreground">SS 2026</p>
              <h3 className="font-display text-2xl md:text-4xl text-foreground leading-tight">
                Soft power.<br />
                <em className="not-italic text-primary">Worn with intention.</em>
              </h3>
            </div>
            <p className="text-sm text-muted-foreground leading-relaxed">
              Fluid silhouettes, tactile fabrics and a palette drawn from dawn light.
              The Lumi&egrave;re Edit is femininity without apology.
            </p>
            <button className="self-start px-6 py-3 rounded-full bg-primary text-primary-foreground text-[10px] uppercase tracking-[0.18em] hover:bg-accent transition-colors duration-300">
              Shop the Edit
            </button>
          </div>
        </div>
      </div>
    </section>
  );
}
