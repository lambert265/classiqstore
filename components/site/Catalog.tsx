"use client";

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { Plus, Heart, Star } from "lucide-react";

const products = [
  { id: 1, name: "Silk Wrap Dress",        price: "₦61,500", img: "/product-1.jpg", badge: "New",        meta: "clothing",    swatches: ["#dbeafe","#93c5fd","#1e3a5f"], rating: 4.8, reviews: 124, stock: 3 },
  { id: 2, name: "Cream Leather Sneakers", price: "₦54,000", img: "/product-2.jpg", badge: "Bestseller", meta: "footwear",    swatches: ["#ffffff","#bfdbfe","#1e3a5f"], rating: 4.9, reviews: 89,  stock: 12 },
  { id: 3, name: "Wide Leg Linen Trousers",price: "₦39,500", img: "/product-3.jpg", badge: "New",        meta: "clothing",    swatches: ["#eff6ff","#93c5fd","#3b82f6"], rating: 4.7, reviews: 56,  stock: 2 },
  { id: 4, name: "Strappy Heeled Mules",   price: "₦51,500", img: "/product-4.jpg", badge: "New",        meta: "footwear",    swatches: ["#bfdbfe","#1e3a5f","#ffffff"], rating: 4.6, reviews: 43,  stock: 8 },
  { id: 5, name: "Knit Cardigan",          price: "₦47,500", img: "/product-5.jpg", badge: "Bestseller", meta: "knitwear",    swatches: ["#dbeafe","#93c5fd","#bfdbfe"], rating: 4.9, reviews: 201, stock: 1 },
  { id: 6, name: "Gold Hoop Earrings",     price: "₦18,000", img: "/product-1.jpg", badge: "New",        meta: "accessories", swatches: ["#93c5fd","#e2e8f0"],           rating: 4.5, reviews: 31,  stock: 20 },
  { id: 7, name: "Tailored Blazer",        price: "₦78,000", img: "/product-2.jpg", badge: "New",        meta: "clothing",    swatches: ["#1e3a5f","#dbeafe","#3b82f6"], rating: 4.8, reviews: 77,  stock: 4 },
  { id: 8, name: "Ankle Strap Heels",      price: "₦58,500", img: "/product-3.jpg", badge: "Bestseller", meta: "footwear",    swatches: ["#1e3a5f","#bfdbfe","#ffffff"], rating: 4.7, reviews: 62,  stock: 6 },
];

const FILTERS = ["All", "Clothing", "Footwear", "Knitwear", "Accessories"];

function Stars({ rating }: { rating: number }) {
  return (
    <div className="flex items-center gap-0.5">
      {[1,2,3,4,5].map((i) => (
        <Star key={i} size={10} strokeWidth={0} className={i <= Math.round(rating) ? "fill-primary text-primary" : "fill-muted-foreground/30 text-muted-foreground/30"} />
      ))}
    </div>
  );
}

export default function Catalog() {
  const [loaded, setLoaded]     = useState<number[]>([]);
  const [filter, setFilter]     = useState("All");
  const [wished, setWished]     = useState<number[]>([]);
  const [viewed, setViewed]     = useState<number[]>([1, 3, 5]);

  const filtered = filter === "All" ? products : products.filter(p => p.meta.toLowerCase() === filter.toLowerCase());
  const recentlyViewed = products.filter(p => viewed.includes(p.id));

  return (
    <section className="py-20 px-6">
      <div className="max-w-7xl mx-auto">

        {/* Header */}
        <div className="flex items-end justify-between mb-6">
          <div className="flex flex-col gap-1">
            <p className="text-[10px] uppercase tracking-[0.32em] text-muted-foreground">Just Dropped</p>
            <h2 className="font-display text-4xl md:text-5xl">New Arrivals</h2>
          </div>
          <a href="/" className="px-5 py-2 rounded-full border border-foreground text-[10px] uppercase tracking-[0.18em] text-foreground hover:bg-foreground hover:text-background transition-colors duration-200">
            View All
          </a>
        </div>

        {/* Filter bar */}
        <div className="flex items-center gap-2 overflow-x-auto scrollbar-none pb-2 mb-8">
          {FILTERS.map((f) => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className={`shrink-0 px-4 py-2 rounded-full text-[11px] uppercase tracking-[0.16em] border transition-all duration-200 ${
                filter === f
                  ? "bg-primary text-white border-primary"
                  : "bg-white border-blue-100 text-foreground hover:border-primary hover:text-primary"
              }`}
            >
              {f}
            </button>
          ))}
        </div>

        {/* Grid */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
          {filtered.map((p) => (
            <div key={p.id} className="bg-white border border-blue-100 rounded-2xl overflow-hidden flex flex-col group">
              <div className="relative aspect-[3/4] overflow-hidden bg-muted">
                {!loaded.includes(p.id) && <div className="absolute inset-0 bg-muted animate-pulse z-10" />}
                <Link href={`/products/${p.id}`} onClick={() => setViewed(v => [...new Set([p.id, ...v])].slice(0,6))}>
                  <Image
                    src={p.img}
                    alt={p.name}
                    fill
                    className="object-cover transition-transform duration-700 group-hover:scale-[1.05]"
                    sizes="(max-width: 768px) 50vw, 25vw"
                    onLoad={() => setLoaded(prev => [...prev, p.id])}
                  />
                </Link>

                {/* Top badges row */}
                <div className="absolute top-3 left-3 right-3 z-20 flex items-start justify-between">
                  <div className="flex flex-col gap-1">
                    <span className={`px-2.5 py-1 text-[9px] uppercase tracking-[0.16em] rounded-full font-medium ${
                      p.badge === "New" ? "bg-primary text-white" : "bg-foreground text-background"
                    }`}>
                      {p.badge}
                    </span>
                    {p.stock <= 3 && (
                      <span className="px-2.5 py-1 text-[9px] uppercase tracking-[0.16em] rounded-full font-medium bg-rose-500 text-white">
                        Only {p.stock} left
                      </span>
                    )}
                  </div>
                  {/* Wishlist */}
                  <button
                    onClick={() => setWished(w => w.includes(p.id) ? w.filter(i => i !== p.id) : [...w, p.id])}
                    className="w-8 h-8 rounded-full bg-white/90 backdrop-blur-sm flex items-center justify-center shadow-sm hover:scale-110 transition-transform"
                  >
                    <Heart size={14} strokeWidth={1.8} className={wished.includes(p.id) ? "fill-rose-500 text-rose-500" : "text-foreground"} />
                  </button>
                </div>

                {/* Quick add */}
                <div className="absolute inset-x-3 bottom-3 translate-y-[120%] group-hover:translate-y-0 transition-transform duration-300 z-20">
                  <button className="w-full rounded-full bg-white/90 backdrop-blur-sm text-foreground py-2.5 text-[10px] uppercase tracking-[0.18em] flex items-center justify-center gap-2 hover:bg-primary hover:text-white transition-colors duration-200">
                    <Plus size={11} strokeWidth={2} />
                    Quick Add
                  </button>
                </div>
              </div>

              <div className="p-4 flex flex-col gap-1.5">
                <p className="text-[9px] uppercase tracking-[0.16em] text-muted-foreground">{p.meta}</p>
                <p className="text-sm text-foreground leading-snug">{p.name}</p>
                <div className="flex items-center gap-1.5">
                  <Stars rating={p.rating} />
                  <span className="text-[10px] text-muted-foreground">({p.reviews})</span>
                </div>
                <p className="font-display text-base text-foreground">{p.price}</p>
                <div className="flex items-center gap-1.5 mt-1">
                  {p.swatches.map((color) => (
                    <button key={color} className="w-3.5 h-3.5 rounded-full border border-border/60 hover:scale-125 transition-transform duration-150 shrink-0" style={{ backgroundColor: color }} />
                  ))}
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Recently Viewed */}
        {recentlyViewed.length > 0 && (
          <div className="mt-16">
            <p className="text-[10px] uppercase tracking-[0.28em] text-muted-foreground mb-5">Recently Viewed</p>
            <div className="flex gap-4 overflow-x-auto scrollbar-none pb-2">
              {recentlyViewed.map((p) => (
                <Link key={p.id} href={`/products/${p.id}`} className="shrink-0 flex items-center gap-3 bg-white border border-blue-100 rounded-2xl px-4 py-3 hover:border-primary transition-colors duration-200">
                  <div className="relative w-12 h-14 rounded-xl overflow-hidden bg-muted shrink-0">
                    <Image src={p.img} alt={p.name} fill className="object-cover" sizes="48px" />
                  </div>
                  <div className="flex flex-col gap-0.5 min-w-0">
                    <p className="text-xs font-medium text-foreground truncate max-w-[120px]">{p.name}</p>
                    <p className="text-xs text-primary">{p.price}</p>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        )}
      </div>
    </section>
  );
}
