import { Sparkles, Leaf, Heart } from "lucide-react";

const props = [
  {
    icon: Sparkles,
    stat: "100%",
    title: "Crafted with Care",
    body: "Every piece is made from sustainably sourced, skin kind fabrics built to move with you, season after season.",
  },
  {
    icon: Leaf,
    stat: "0 waste",
    title: "Consciously Made",
    body: "Our production runs are intentionally small. Less waste, more meaning. Fashion that respects the planet.",
  },
  {
    icon: Heart,
    stat: "For her",
    title: "Designed for Every Woman",
    body: "From the boardroom to the weekend. Sizes XS to 3XL, cut to celebrate every silhouette without exception.",
  },
];

export default function ValueProps() {
  return (
    <section className="py-20 px-6 bg-secondary">
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-12 flex flex-col items-center gap-3">
          <p className="text-[10px] uppercase tracking-[0.32em] text-muted-foreground">Why CLASSIQ</p>
          <h2 className="font-display text-4xl md:text-5xl tracking-[-0.01em]">More than clothing.</h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {props.map(({ icon: Icon, stat, title, body }) => (
            <div key={title} className="bg-white border border-blue-100 rounded-2xl flex flex-col gap-6 px-8 py-10">
              <div className="flex items-center gap-4">
                <div className="w-11 h-11 rounded-full flex items-center justify-center border border-border/60 bg-white/70 shrink-0">
                  <Icon size={18} strokeWidth={1.4} className="text-primary" />
                </div>
                <span className="font-display text-3xl text-primary">{stat}</span>
              </div>
              <div className="flex flex-col gap-2">
                <h3 className="font-sans font-medium text-sm text-foreground">{title}</h3>
                <p className="text-sm text-muted-foreground leading-relaxed">{body}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
