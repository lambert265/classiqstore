import Image from "next/image";

export default function AboutPage() {
  return (
    <div className="max-w-3xl mx-auto px-6">
      <div className="mb-12">
        <p className="text-[10px] uppercase tracking-[0.28em] text-primary mb-3">Our story</p>
        <h1 className="font-heading text-4xl text-foreground mb-4">About CLASSIQ</h1>
      </div>

      <div className="relative h-72 rounded-3xl overflow-hidden mb-12">
        <Image src="/hero-2.jpg" alt="CLASSIQ story" fill className="object-cover object-center" />
        <div className="absolute inset-0 bg-foreground/30" />
      </div>

      <div className="flex flex-col gap-8 text-sm text-muted-foreground leading-relaxed">
        <p>
          CLASSIQ was born from a simple conviction: that clothing should feel as intentional as the woman wearing it. Founded in Lagos, we craft womenswear in soft neutrals and refined silhouettes — designed for the woman who moves through the world with purpose.
        </p>
        <p>
          Every piece is considered. From the weight of the fabric to the fall of a hem, we obsess over the details so you don&apos;t have to. Our collections are made in small batches, ensuring quality and reducing waste.
        </p>
        <blockquote className="font-heading text-2xl text-foreground italic border-l-2 border-primary pl-6">
          "Dress like the woman you are becoming."
        </blockquote>
        <p>
          We believe fashion is a form of self-authorship. CLASSIQ is not about trends — it is about building a wardrobe that grows with you, that travels with you, and that tells your story without saying a word.
        </p>

        <div className="grid grid-cols-3 gap-6 pt-4">
          {[
            { num: "2021", label: "Founded" },
            { num: "500+", label: "Pieces crafted" },
            { num: "12+", label: "Collections" },
          ].map(({ num, label }) => (
            <div key={label} className="flex flex-col gap-1 p-5 rounded-2xl bg-muted text-center">
              <span className="font-heading text-3xl text-foreground">{num}</span>
              <span className="text-[10px] uppercase tracking-[0.18em] text-muted-foreground">{label}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
