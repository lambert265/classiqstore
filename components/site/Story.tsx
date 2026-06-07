import Image from "next/image";

export default function Story() {
  return (
    <section className="relative w-full overflow-hidden">
      {/* Full-bleed background image */}
      <div className="relative aspect-[16/9] md:aspect-[21/9] w-full">
        <Image
          src="/story-1.jpg"
          alt="CLASSIQ story"
          fill
          className="object-cover object-top"
          sizes="100vw"
        />
        {/* Dark veil */}
        <div className="absolute inset-0 bg-foreground/55" />

        {/* Centered glass card */}
        <div className="absolute inset-0 flex items-center justify-center px-6">
          <div className="bg-white/85 backdrop-blur-md border border-blue-100 rounded-2xl px-10 py-12 max-w-2xl w-full flex flex-col items-center text-center gap-6">
            <div className="w-8 h-px bg-primary" />
            <p className="text-[10px] uppercase tracking-[0.32em] text-muted-foreground">The CLASSIQ Manifesto</p>
            <blockquote className="font-display text-3xl md:text-5xl text-foreground leading-[1.1] tracking-[-0.02em]">
              &quot;Clothing is the first thing the world sees.{" "}
              <em className="not-italic text-primary">Make it say something true.</em>&quot;
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
    </section>
  );
}
