import Image from "next/image";

const occasions = [
  { label: "Work",    desc: "Boardroom ready",   img: "/product-1.jpg", color: "from-blue-900/70" },
  { label: "Weekend", desc: "Effortlessly casual", img: "/product-2.jpg", color: "from-slate-800/70" },
  { label: "Event",   desc: "Dress to impress",  img: "/product-3.jpg", color: "from-indigo-900/70" },
  { label: "Casual",  desc: "Everyday ease",     img: "/product-4.jpg", color: "from-blue-800/70" },
];

export default function Occasions() {
  return (
    <section className="py-20 px-6 bg-secondary">
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-10 flex flex-col items-center gap-2">
          <p className="text-[10px] uppercase tracking-[0.32em] text-muted-foreground">Dress for the moment</p>
          <h2 className="font-display text-4xl md:text-5xl">Shop by Occasion</h2>
        </div>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {occasions.map(({ label, desc, img, color }) => (
            <a key={label} href="/" className="relative rounded-2xl overflow-hidden aspect-[3/4] group cursor-pointer">
              <Image src={img} alt={label} fill className="object-cover transition-transform duration-700 group-hover:scale-105" sizes="(max-width: 768px) 50vw, 25vw" />
              <div className={`absolute inset-0 bg-gradient-to-t ${color} to-transparent`} />
              <div className="absolute bottom-0 left-0 right-0 p-5 flex flex-col gap-1">
                <p className="font-display text-2xl text-white leading-tight">{label}</p>
                <p className="text-[10px] uppercase tracking-[0.18em] text-white/60">{desc}</p>
              </div>
              <div className="absolute inset-0 ring-2 ring-white/0 group-hover:ring-white/30 rounded-2xl transition-all duration-300" />
            </a>
          ))}
        </div>
      </div>
    </section>
  );
}
