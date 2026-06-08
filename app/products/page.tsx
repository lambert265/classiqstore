"use client";

import { useState, useEffect, Suspense } from "react";
import Image from "next/image";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import Header from "@/components/site/Header";
import Footer from "@/components/site/Footer";
import { ShoppingBag, SlidersHorizontal, X } from "lucide-react";
import { useCart } from "@/store/cart";

const allProducts = [
  { id: 1, name: "Silk Wrap Dress",        price: "₦61,500",  priceNum: 61500,  img: "/product-1.jpg", badge: "New",        meta: "women clothing",    occasions: ["event","weekend"] },
  { id: 2, name: "Cream Leather Sneakers", price: "₦54,000",  priceNum: 54000,  img: "/product-2.jpg", badge: "Bestseller", meta: "women footwear",    occasions: ["casual","weekend"] },
  { id: 3, name: "Wide Leg Linen Trousers",price: "₦39,500",  priceNum: 39500,  img: "/product-3.jpg", badge: "New",        meta: "women clothing",    occasions: ["casual","work","weekend"] },
  { id: 4, name: "Strappy Heeled Mules",   price: "₦51,500",  priceNum: 51500,  img: "/product-4.jpg", badge: "New",        meta: "women footwear",    occasions: ["event","work"] },
  { id: 5, name: "Knit Cardigan",          price: "₦47,500",  priceNum: 47500,  img: "/product-5.jpg", badge: "Bestseller", meta: "women knitwear",    occasions: ["casual","weekend","work"] },
  { id: 6, name: "Gold Hoop Earrings",     price: "₦18,000",  priceNum: 18000,  img: "/product-1.jpg", badge: "New",        meta: "women accessories", occasions: ["event","casual","work"] },
  { id: 7, name: "Tailored Blazer",        price: "₦78,000",  priceNum: 78000,  img: "/product-2.jpg", badge: "New",        meta: "women clothing",    occasions: ["work","event"] },
  { id: 8, name: "Ankle Strap Heels",      price: "₦58,500",  priceNum: 58500,  img: "/product-3.jpg", badge: "Bestseller", meta: "women footwear",    occasions: ["event","work"] },
];

const occasionLabels: Record<string, string> = {
  work: "Work", weekend: "Weekend", event: "Event", casual: "Casual",
};

const categories = ["All", "women clothing", "women footwear", "women knitwear", "women accessories"];

function ProductsContent() {
  const searchParams = useSearchParams();
  const occasion = searchParams.get("occasion") ?? "";
  const { addItem, setOpen } = useCart();

  const [activeCategory, setActiveCategory] = useState("All");
  const [activeOccasion, setActiveOccasion] = useState(occasion);
  const [showFilters, setShowFilters] = useState(false);
  const [addedId, setAddedId] = useState<number | null>(null);

  useEffect(() => { setActiveOccasion(occasion); }, [occasion]);

  const filtered = allProducts.filter((p) => {
    const catMatch = activeCategory === "All" || p.meta === activeCategory;
    const occMatch = !activeOccasion || p.occasions.includes(activeOccasion);
    return catMatch && occMatch;
  });

  function handleQuickAdd(p: typeof allProducts[0]) {
    addItem({ id: p.id, name: p.name, price: p.priceNum, img: p.img, size: "M", color: "#ffffff" });
    setAddedId(p.id);
    setOpen(true);
    setTimeout(() => setAddedId(null), 2000);
  }

  return (
    <div className="min-h-screen bg-background text-foreground">
      <Header />
      <main className="max-w-7xl mx-auto px-6 pt-28 pb-20">

        {/* Page heading */}
        <div className="mb-10">
          <p className="text-[10px] uppercase tracking-[0.28em] text-primary mb-2">
            {activeOccasion ? `Occasion — ${occasionLabels[activeOccasion] ?? activeOccasion}` : "All Products"}
          </p>
          <div className="flex items-end justify-between gap-4">
            <h1 className="font-display text-4xl md:text-5xl">
              {activeOccasion ? occasionLabels[activeOccasion] : "Shop"}
            </h1>
            <button onClick={() => setShowFilters(v => !v)}
              className="flex items-center gap-2 px-4 py-2 rounded-full border border-border text-[11px] uppercase tracking-[0.14em] text-foreground hover:border-primary hover:text-primary transition-colors">
              <SlidersHorizontal size={13} strokeWidth={1.5} />
              Filter
            </button>
          </div>
        </div>

        {/* Active filters */}
        {(activeOccasion || activeCategory !== "All") && (
          <div className="flex flex-wrap gap-2 mb-6">
            {activeOccasion && (
              <button onClick={() => setActiveOccasion("")}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-primary text-primary-foreground text-[10px] uppercase tracking-[0.12em]">
                {occasionLabels[activeOccasion]} <X size={10} />
              </button>
            )}
            {activeCategory !== "All" && (
              <button onClick={() => setActiveCategory("All")}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-primary text-primary-foreground text-[10px] uppercase tracking-[0.12em]">
                {activeCategory} <X size={10} />
              </button>
            )}
          </div>
        )}

        {/* Filter panel */}
        {showFilters && (
          <div className="glass rounded-2xl p-6 mb-8 flex flex-col gap-5">
            <div className="flex flex-col gap-3">
              <p className="text-[10px] uppercase tracking-[0.22em] text-muted-foreground">Category</p>
              <div className="flex flex-wrap gap-2">
                {categories.map((c) => (
                  <button key={c} onClick={() => setActiveCategory(c)}
                    className={`px-4 py-2 rounded-full border text-[11px] uppercase tracking-[0.12em] transition-all ${
                      activeCategory === c ? "bg-primary text-primary-foreground border-primary" : "border-border text-foreground hover:border-primary"
                    }`}>
                    {c === "All" ? "All" : c.replace("women ", "")}
                  </button>
                ))}
              </div>
            </div>
            <div className="flex flex-col gap-3">
              <p className="text-[10px] uppercase tracking-[0.22em] text-muted-foreground">Occasion</p>
              <div className="flex flex-wrap gap-2">
                {Object.entries(occasionLabels).map(([slug, label]) => (
                  <button key={slug} onClick={() => setActiveOccasion(activeOccasion === slug ? "" : slug)}
                    className={`px-4 py-2 rounded-full border text-[11px] uppercase tracking-[0.12em] transition-all ${
                      activeOccasion === slug ? "bg-primary text-primary-foreground border-primary" : "border-border text-foreground hover:border-primary"
                    }`}>
                    {label}
                  </button>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Grid */}
        {filtered.length === 0 ? (
          <div className="h-60 flex flex-col items-center justify-center gap-3">
            <p className="text-sm text-muted-foreground">No products found for this filter.</p>
            <button onClick={() => { setActiveCategory("All"); setActiveOccasion(""); }}
              className="px-5 py-2.5 rounded-full bg-primary text-primary-foreground text-[11px] uppercase tracking-[0.14em] hover:bg-accent transition-colors">
              Clear filters
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-5">
            {filtered.map((p) => (
              <div key={p.id} className="glass glass-lift rounded-2xl overflow-hidden flex flex-col group">
                <Link href={`/products/${p.id}`} className="relative aspect-[3/4] overflow-hidden bg-muted block">
                  <Image src={p.img} alt={p.name} fill
                    className="object-cover transition-transform duration-700 group-hover:scale-[1.05]" sizes="25vw" />
                  <span className={`absolute top-3 left-3 px-2.5 py-1 text-[9px] uppercase tracking-[0.14em] rounded-full font-medium ${
                    p.badge === "New" ? "bg-primary text-primary-foreground" : "bg-foreground text-background"
                  }`}>{p.badge}</span>
                </Link>
                <div className="p-4 flex flex-col gap-2">
                  <p className="text-[9px] uppercase tracking-[0.14em] text-muted-foreground">{p.meta}</p>
                  <Link href={`/products/${p.id}`} className="text-sm text-foreground hover:text-primary transition-colors">{p.name}</Link>
                  <div className="flex items-center justify-between mt-1">
                    <p className="font-display text-base text-foreground">{p.price}</p>
                    <button onClick={() => handleQuickAdd(p)}
                      className={`w-8 h-8 rounded-full flex items-center justify-center transition-all duration-200 ${
                        addedId === p.id ? "bg-accent text-primary-foreground" : "bg-primary text-primary-foreground hover:bg-accent"
                      }`}>
                      <ShoppingBag size={13} strokeWidth={1.5} />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </main>
      <Footer />
    </div>
  );
}

export default function ProductsPage() {
  return (
    <Suspense fallback={<div className="min-h-screen flex items-center justify-center"><div className="w-8 h-8 rounded-full border-2 border-primary border-t-transparent animate-spin" /></div>}>
      <ProductsContent />
    </Suspense>
  );
}
