import Image from "next/image";

const items = [
  { rank: 1, name: "Silk Wrap Dress",           meta: "women clothing",    img: "/product-1.jpg" },
  { rank: 2, name: "Strappy Heeled Mules",       meta: "women footwear",    img: "/product-2.jpg" },
  { rank: 3, name: "Wide Leg Linen Trousers",    meta: "women clothing",    img: "/product-3.jpg" },
  { rank: 4, name: "Cream Leather Sneakers",     meta: "women footwear",    img: "/product-4.jpg" },
  { rank: 5, name: "Knit Cardigan",              meta: "women knitwear",    img: "/product-5.jpg" },
  { rank: 6, name: "Ankle Strap Heels",          meta: "women footwear",    img: "/product-1.jpg" },
  { rank: 7, name: "Tailored Blazer",            meta: "women clothing",    img: "/product-2.jpg" },
  { rank: 8, name: "Gold Hoop Earrings",         meta: "women accessories", img: "/product-3.jpg" },
];

export default function Trending() {
  return (
    <section className="py-20 px-6">
      <div className="max-w-7xl mx-auto">

        {/* Header */}
        <div className="flex items-center gap-4 mb-10">
          <div className="flex items-center gap-2">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-accent opacity-75" />
              <span className="relative inline-flex rounded-full h-2 w-2 bg-accent" />
            </span>
            <p className="text-[10px] uppercase tracking-[0.32em] text-muted-foreground">What&apos;s Hot</p>
          </div>
          <div className="flex-1 h-px bg-border" />
          <h2 className="font-display text-3xl md:text-4xl tracking-[-0.01em]">Trending Now</h2>
        </div>

        {/* Card grid */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
          {items.map((item) => (
            <a key={item.name} href="/" className="bg-white border border-blue-100 rounded-2xl overflow-hidden flex flex-col group">

              {/* Image */}
              <div className="relative aspect-[3/4] overflow-hidden bg-muted">
                <Image
                  src={item.img}
                  alt={item.name}
                  fill
                  className="object-cover transition-transform duration-700 group-hover:scale-[1.05]"
                  sizes="(max-width: 768px) 50vw, 25vw"
                />
                {/* Rank badge */}
                <div className="absolute top-3 left-3">
                  <span className="w-7 h-7 rounded-full bg-white/90 backdrop-blur-sm text-foreground text-[11px] font-medium flex items-center justify-center">
                    {item.rank}
                  </span>
                </div>
                {/* Shop pill on hover */}
                <div className="absolute inset-x-3 bottom-3 translate-y-[120%] group-hover:translate-y-0 transition-transform duration-300">
                  <button className="w-full rounded-full bg-white/90 backdrop-blur-sm text-foreground py-2.5 text-[10px] uppercase tracking-[0.18em] hover:bg-primary hover:text-primary-foreground transition-colors duration-200">
                    Shop
                  </button>
                </div>
              </div>

              {/* Info */}
              <div className="p-4 flex flex-col gap-1">
                <p className="text-[9px] uppercase tracking-[0.14em] text-muted-foreground">{item.meta}</p>
                <p className="text-sm text-foreground group-hover:text-primary transition-colors duration-200 leading-snug">{item.name}</p>
              </div>
            </a>
          ))}
        </div>
      </div>
    </section>
  );
}
