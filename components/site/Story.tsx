import Image from "next/image";

export default function Story() {
  return (
    <section className="relative w-full overflow-hidden">

      {/* Image */}
      <div className="relative aspect-[4/3] md:aspect-[21/9] w-full">
        <Image
          src="/story-1.jpg"
          alt="CLASSIQ story"
          fill
          className="object-cover object-top"
          sizes="100vw"
        />
        <div className="absolute inset-0 bg-foreground/55" />

        {/* Card — desktop only, centered over image */}
        <div className="hidden md:flex absolute inset-0 items-center justify-center px-6">
          <div className="bg-white/85 backdrop-blur-md border border-blue-100 rounded-2xl px-10 py-12 max-w-2xl w-full flex flex-col items-center text-center gap-6">
            <div className="w-8 h-px bg-primary" />
            <p className="text-[10px] uppercase tracking-[0.32em] text-muted-foreground">The CLASSIQ Manifesto</p>
            <blockquote className="font-display text-3xl md:text-5xl text-foreground leading-[1.1]">
              &ldquo;Clothing is the first thing the world sees.{" "}
              <em className="not-italic text-primary">Make it say something true.</em>&rdquo;
            </blockquote>
            <p className="text-sm text-muted-foreground leading-relaxed max-w-md">
              CLASSIQ was born from a belief that every woman deserves clothing
              that speaks before she does. Refined, intentional, and entirely her own.
            </p>
            <button className="px-8 py-3.5 rounded-full bg-primary text-primary-foreground text-[10px] uppercase tracking-[0.18em] hover:bg-accent transition-colors duration-300">
              Our Story
            </button>
          </div>
        </div>
      </div>

      {/* Card — mobile only, below image */}
      <div className="md:hidden bg-white border border-blue-100 px-6 py-10 flex flex-col items-center text-center gap-5">
        <div className="w-8 h-px bg-primary" />
        <p className="text-[10px] uppercase tracking-[0.32em] text-muted-foreground">The CLASSIQ Manifesto</p>
        <blockquote className="font-display text-2xl text-foreground leading-snug">
          &ldquo;Clothing is the first thing the world sees.{" "}
          <em className="not-italic text-primary">Make it say something true.</em>&rdquo;
        </blockquote>
        <p className="text-sm text-muted-foreground leading-relaxed">
          CLASSIQ was born from a belief that every woman deserves clothing
          that speaks before she does. Refined, intentional, and entirely her own.
        </p>
        <button className="px-8 py-3.5 rounded-full bg-primary text-primary-foreground text-[10px] uppercase tracking-[0.18em] hover:bg-accent transition-colors duration-300">
          Our Story
        </button>
      </div>

    </section>
  );
}
