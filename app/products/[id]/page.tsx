"use client";

import React, { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { Heart, ShoppingBag, ArrowLeft, Star } from "lucide-react";
import { useCart } from "@/store/cart";

const allProducts = [
  { id: 1, name: "Obsidian Trench Coat",    price: "₦89,500", img: "/product-1.jpg", badge: "New",        meta: "men · clothing",  swatches: ["#1a1a1a","#4a3728","#c8b89a"], sizes: ["XS","S","M","L","XL"], description: "A structured trench coat cut from heavyweight wool-blend fabric. Features a double-breasted front, storm flap, and deep side pockets. Finished with a belted waist for a tailored silhouette." },
  { id: 2, name: "Cream Leather Sneakers",  price: "₦54,000", img: "/product-2.jpg", badge: "Bestseller", meta: "women · footwear", swatches: ["#f5f0e8","#c8b89a","#1a1a1a"], sizes: ["36","37","38","39","40","41"], description: "Clean-lined leather sneakers with a low-profile sole. Crafted from full-grain leather with a cushioned insole and tonal lace detailing. A wardrobe staple that pairs with everything." },
  { id: 3, name: "Wide-Leg Linen Trousers", price: "₦39,500", img: "/product-3.jpg", badge: "New",        meta: "women · clothing", swatches: ["#f5f0e8","#d4c5b0","#8b7355"], sizes: ["XS","S","M","L","XL"], description: "Relaxed wide-leg trousers in a breathable linen blend. High-rise waist with a flat front and side zip. Effortlessly elegant for warm-weather dressing." },
  { id: 4, name: "Suede Chelsea Boots",     price: "₦68,000", img: "/product-4.jpg", badge: "Bestseller", meta: "men · footwear",   swatches: ["#4a3728","#1a1a1a","#8b7355"], sizes: ["40","41","42","43","44","45"], description: "Classic Chelsea boots in premium suede with elastic side panels and a stacked leather heel. Resoleable construction for lasting wear." },
  { id: 5, name: "Heavyweight Hoodie",      price: "₦47,500", img: "/product-5.jpg", badge: "New",        meta: "men · clothing",  swatches: ["#1a1a1a","#f5f0e8","#6b7280"], sizes: ["XS","S","M","L","XL","XXL"], description: "500gsm French terry hoodie with a relaxed boxy fit. Ribbed cuffs and hem, kangaroo pocket, and a lined hood. Built to outlast every season." },
  { id: 6, name: "Strappy Heeled Mules",    price: "₦51,500", img: "/product-1.jpg", badge: "New",        meta: "women · footwear", swatches: ["#c8b89a","#1a1a1a","#f5f0e8"], sizes: ["36","37","38","39","40"], description: "Minimalist heeled mules with a thin ankle strap and a sculpted block heel. Finished in smooth nappa leather with a padded footbed." },
  { id: 7, name: "Silk Wrap Dress",         price: "₦61,500", img: "/product-2.jpg", badge: "New",        meta: "women · clothing", swatches: ["#f5f0e8","#d4a0a0","#1a1a1a"], sizes: ["XS","S","M","L"], description: "A fluid wrap dress in 100% silk charmeuse. V-neckline, self-tie waist, and a midi-length skirt with a subtle side slit. Drapes beautifully on every body." },
  { id: 8, name: "Low-Top Canvas Sneakers", price: "₦29,500", img: "/product-3.jpg", badge: "New",        meta: "men · footwear",   swatches: ["#f5f0e8","#1a1a1a","#6b7280"], sizes: ["40","41","42","43","44","45"], description: "Unbleached canvas sneakers with a vulcanised rubber sole. Simple, clean, and endlessly versatile. A modern take on the everyday classic." },
];

export default function ProductPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = React.use(params);
  const product = allProducts.find((p) => p.id === Number(id)) ?? allProducts[0];
  const related = allProducts.filter((p) => p.id !== product.id).slice(0, 4);

  const { addItem } = useCart();
  const [selectedSize, setSelectedSize] = useState("");
  const [selectedSwatch, setSelectedSwatch] = useState(product.swatches[0]);
  const [wished, setWished] = useState(false);
  const [added, setAdded] = useState(false);

  const handleAdd = () => {
    if (!selectedSize) return;
    addItem({
      id: product.id,
      name: product.name,
      price: parseInt(product.price.replace(/[₦,]/g, "")),
      img: product.img,
      size: selectedSize,
      color: selectedSwatch,
    });
    setAdded(true);
    setTimeout(() => setAdded(false), 2000);
  };

  return (
    <div className="min-h-screen bg-background text-foreground">

      {/* Back nav */}
      <div className="max-w-7xl mx-auto px-6 pt-28 pb-4">
        <Link href="/" className="inline-flex items-center gap-2 text-[10px] uppercase tracking-[0.18em] text-muted-foreground hover:text-foreground transition-colors duration-200">
          <ArrowLeft size={13} strokeWidth={1.5} />
          Back to shop
        </Link>
      </div>

      {/* Main grid */}
      <div className="max-w-7xl mx-auto px-6 py-8 grid grid-cols-1 md:grid-cols-2 gap-12 items-start">

        {/* Image */}
        <div className="glass rounded-2xl overflow-hidden relative aspect-[3/4] w-full">
          <Image src={product.img} alt={product.name} fill className="object-cover" sizes="50vw" priority />
          <div className="absolute top-4 left-4">
            <span className={`px-3 py-1.5 text-[9px] uppercase tracking-[0.16em] rounded-full font-medium ${
              product.badge === "New" ? "bg-primary text-primary-foreground" : "bg-foreground text-background"
            }`}>
              {product.badge}
            </span>
          </div>
        </div>

        {/* Details */}
        <div className="flex flex-col gap-7 md:pt-4">

          {/* Meta + title */}
          <div className="flex flex-col gap-2">
            <p className="text-[10px] uppercase tracking-[0.28em] text-muted-foreground">{product.meta}</p>
            <h1 className="font-display text-4xl md:text-5xl tracking-[-0.01em]">{product.name}</h1>
            <p className="font-display text-2xl text-primary mt-1">{product.price}</p>
          </div>

          {/* Stars */}
          <div className="flex items-center gap-1.5">
            {[...Array(5)].map((_, i) => (
              <Star key={i} size={13} className="fill-accent text-accent" />
            ))}
            <span className="text-[10px] text-muted-foreground ml-1 uppercase tracking-[0.14em]">4.9 · 128 reviews</span>
          </div>

          {/* Description */}
          <p className="text-sm text-muted-foreground leading-relaxed">{product.description}</p>

          <div className="w-full h-px bg-border" />

          {/* Colour swatches */}
          <div className="flex flex-col gap-3">
            <p className="text-[10px] uppercase tracking-[0.22em] text-muted-foreground">Colour</p>
            <div className="flex gap-2">
              {product.swatches.map((color) => (
                <button
                  key={color}
                  onClick={() => setSelectedSwatch(color)}
                  className={`w-7 h-7 rounded-full border-2 transition-all duration-150 ${
                    selectedSwatch === color ? "border-primary scale-110" : "border-border/60 hover:scale-110"
                  }`}
                  style={{ backgroundColor: color }}
                />
              ))}
            </div>
          </div>

          {/* Size selector */}
          <div className="flex flex-col gap-3">
            <div className="flex items-center justify-between">
              <p className="text-[10px] uppercase tracking-[0.22em] text-muted-foreground">Size</p>
              <button className="text-[10px] uppercase tracking-[0.18em] text-accent underline underline-offset-2">Size guide</button>
            </div>
            <div className="flex flex-wrap gap-2">
              {product.sizes.map((size) => (
                <button
                  key={size}
                  onClick={() => setSelectedSize(size)}
                  className={`px-4 py-2 rounded-full text-[11px] uppercase tracking-[0.14em] border transition-all duration-150 ${
                    selectedSize === size
                      ? "bg-primary text-primary-foreground border-primary"
                      : "border-border text-foreground hover:border-primary"
                  }`}
                >
                  {size}
                </button>
              ))}
            </div>
          </div>

          {/* Actions */}
          <div className="flex gap-3 mt-2">
            <button
              onClick={handleAdd}
              className={`flex-1 flex items-center justify-center gap-2 py-4 rounded-full text-[11px] uppercase tracking-[0.18em] transition-all duration-300 ${
                added
                  ? "bg-accent text-primary-foreground"
                  : "bg-primary text-primary-foreground hover:bg-accent"
              }`}
            >
              <ShoppingBag size={15} strokeWidth={1.5} />
              {added ? "Added to bag ✓" : !selectedSize ? "Select a size" : "Add to bag"}
            </button>
            <button
              onClick={() => setWished((w) => !w)}
              className={`w-14 h-14 rounded-full border flex items-center justify-center transition-all duration-200 ${
                wished ? "border-primary bg-primary/5" : "border-border hover:border-primary"
              }`}
            >
              <Heart size={18} strokeWidth={1.4} className={wished ? "fill-primary text-primary" : "text-foreground"} />
            </button>
          </div>

          {/* Trust pills */}
          <div className="flex flex-wrap gap-2">
            {["Free returns", "Secure checkout", "Ships in 2–4 days"].map((t) => (
              <span key={t} className="px-3 py-1.5 rounded-full border border-border text-[9px] uppercase tracking-[0.14em] text-muted-foreground">
                {t}
              </span>
            ))}
          </div>
        </div>
      </div>

      {/* Related products */}
      <div className="max-w-7xl mx-auto px-6 py-16">
        <div className="flex items-end justify-between mb-8">
          <h2 className="font-display text-3xl tracking-[-0.01em]">You may also like</h2>
          <Link href="/" className="px-5 py-2 rounded-full border border-foreground text-[10px] uppercase tracking-[0.18em] text-foreground hover:bg-foreground hover:text-background transition-colors duration-200">
            View All
          </Link>
        </div>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
          {related.map((p) => (
            <Link key={p.id} href={`/products/${p.id}`} className="glass glass-lift rounded-2xl overflow-hidden flex flex-col group">
              <div className="relative aspect-[3/4] overflow-hidden bg-muted">
                <Image src={p.img} alt={p.name} fill className="object-cover transition-transform duration-700 group-hover:scale-[1.05]" sizes="25vw" />
              </div>
              <div className="p-4 flex flex-col gap-1">
                <p className="text-[9px] uppercase tracking-[0.14em] text-muted-foreground">{p.meta}</p>
                <p className="text-sm text-foreground">{p.name}</p>
                <p className="font-display text-base text-foreground">{p.price}</p>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}
