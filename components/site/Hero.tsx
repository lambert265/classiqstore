"use client";

import Image from "next/image";
import { useState, useEffect } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";

const heroImages = [
  { src: "/hero-1.jpg", priority: true },
  { src: "/hero-2.jpg", priority: false },
  { src: "/hero-3.jpg", priority: false },
];

export default function Hero() {
  const [currentIndex, setCurrentIndex] = useState(0);

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % heroImages.length);
    }, 5000);
    return () => clearInterval(timer);
  }, []);

  const nextSlide = () => {
    setCurrentIndex((prev) => (prev + 1) % heroImages.length);
  };

  const prevSlide = () => {
    setCurrentIndex((prev) => (prev - 1 + heroImages.length) % heroImages.length);
  };

  return (
    <section className="relative w-full">

      {/* ── Mobile: Carousel with auto-rotation ── */}
      <div className="relative w-full h-[100dvh] md:hidden overflow-hidden">
        <Image 
          src={heroImages[currentIndex].src} 
          alt="CLASSIQ editorial" 
          fill 
          className="object-cover object-top transition-opacity duration-500" 
          priority 
          sizes="100vw" 
        />
        {/* Gradient */}
        <div className="absolute inset-0 bg-gradient-to-t from-foreground/75 via-foreground/20 to-transparent" />

        {/* Navigation Buttons */}
        <button
          onClick={prevSlide}
          className="absolute left-4 top-1/2 -translate-y-1/2 z-10 p-2 rounded-full bg-white/80 backdrop-blur-sm hover:bg-white transition-colors duration-200 shadow-lg"
          aria-label="Previous image"
        >
          <ChevronLeft className="w-5 h-5 text-foreground" />
        </button>
        <button
          onClick={nextSlide}
          className="absolute right-4 top-1/2 -translate-y-1/2 z-10 p-2 rounded-full bg-white/80 backdrop-blur-sm hover:bg-white transition-colors duration-200 shadow-lg"
          aria-label="Next image"
        >
          <ChevronRight className="w-5 h-5 text-foreground" />
        </button>

        {/* Slide indicators */}
        <div className="absolute bottom-20 left-0 right-0 flex justify-center gap-2 z-10">
          {heroImages.map((_, i) => (
            <button
              key={i}
              onClick={() => setCurrentIndex(i)}
              className={`w-2 h-2 rounded-full transition-all duration-300 ${
                i === currentIndex ? "bg-white w-6" : "bg-white/50"
              }`}
              aria-label={`Go to slide ${i + 1}`}
            />
          ))}
        </div>

        {/* Content */}
        <div className="absolute bottom-0 left-0 right-0 pb-28 px-5 flex flex-col gap-5">
          <div className="flex flex-col gap-2">
            <p className="text-[9px] uppercase tracking-[0.32em] text-white/50">SS 2026 New Collection</p>
            <div className="w-6 h-px bg-white/40" />
            <h1 className="font-display text-5xl text-white leading-[0.92] tracking-[-0.02em]">
              Designed<br />
              <em className="not-italic text-white/65">for her.</em>
            </h1>
            <p className="text-[10px] uppercase tracking-[0.2em] text-white/45 max-w-[220px]">
              Modern essentials that celebrate every woman
            </p>
          </div>
          <div className="flex gap-2">
            <button className="flex-1 py-3.5 rounded-full bg-white text-foreground text-[10px] uppercase tracking-[0.16em] hover:bg-primary hover:text-primary-foreground transition-colors duration-300">
              Shop now
            </button>
            <button className="px-6 py-3.5 rounded-full border border-white/40 text-white text-[10px] uppercase tracking-[0.16em]">
              Our story
            </button>
          </div>
        </div>
      </div>

      {/* ── Desktop: 3-column collage ── */}
      <div className="hidden md:grid grid-cols-3 gap-px bg-background">
        {[
          { src: "/hero-1.jpg", priority: true },
          { src: "/hero-2.jpg", priority: false },
          { src: "/hero-3.jpg", priority: false },
        ].map(({ src, priority }) => (
          <div key={src} className="relative aspect-[3/4] w-full overflow-hidden">
            <Image src={src} alt="Editorial fashion" fill className="object-cover" priority={priority} sizes="33vw" />
          </div>
        ))}
      </div>

      {/* Desktop gradient + rules */}
      <div className="hidden md:block absolute bottom-0 left-0 right-0 h-2/3 bg-gradient-to-t from-foreground/65 via-foreground/20 to-transparent pointer-events-none" />
      <div className="pointer-events-none absolute inset-0 hidden md:block">
        <div className="absolute left-1/3 top-0 h-full w-px bg-white/15" />
        <div className="absolute left-2/3 top-0 h-full w-px bg-white/15" />
      </div>

      {/* Desktop overlay content */}
      <div className="hidden md:block absolute bottom-0 left-0 right-0 z-10 pb-10 px-6">
        <div className="max-w-7xl mx-auto flex flex-col gap-6">
          <div className="flex flex-col gap-3">
            <p className="text-[10px] uppercase tracking-[0.32em] text-white/50">SS 2026 New Collection</p>
            <div className="w-8 h-px bg-white/40" />
            <h1 className="font-display text-6xl md:text-8xl text-white leading-[0.92] tracking-[-0.02em]">
              Designed<br />
              <em className="not-italic text-white/70">for her.</em>
            </h1>
            <p className="text-[11px] uppercase tracking-[0.22em] text-white/50 max-w-xs">
              Modern essentials that celebrate every woman
            </p>
          </div>
          <div className="flex flex-wrap gap-3">
            <button className="px-8 py-3.5 rounded-full bg-white text-foreground text-[11px] uppercase tracking-[0.18em] hover:bg-primary hover:text-primary-foreground transition-colors duration-300">
              Shop the collection
            </button>
            <button className="px-8 py-3.5 rounded-full border border-white/40 text-white text-[11px] uppercase tracking-[0.18em] hover:border-white hover:bg-white/10 transition-colors duration-300">
              Our story
            </button>
          </div>
        </div>
      </div>

      {/* Trust bar */}
      <div className="border-t border-border bg-background">
        <div className="max-w-7xl mx-auto px-5 py-3 flex items-center gap-6 overflow-x-auto scrollbar-none whitespace-nowrap">
          {["New members get 10% off", "Easy returns", "New arrivals weekly", "Sustainably made"].map((tag, i) => (
            <span key={tag} className="flex items-center gap-4 text-[9px] uppercase tracking-[0.18em] text-muted-foreground shrink-0">
              {i > 0 && <span className="w-px h-3 bg-border shrink-0" />}
              {tag}
            </span>
          ))}
        </div>
      </div>
    </section>
  );
}
