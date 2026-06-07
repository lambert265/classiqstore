const reviews = [
  { name: "Amara O.", location: "Lagos", rating: 5, text: "The Silk Wrap Dress is everything. Got so many compliments at my friend's wedding. The quality is unreal for the price." },
  { name: "Chidinma E.", location: "Abuja", rating: 5, text: "Finally a Nigerian brand that gets it. The linen trousers fit perfectly and the fabric is so breathable. Already ordering more." },
  { name: "Fatima B.", location: "Port Harcourt", rating: 5, text: "Nova helped me put together a full work outfit under ₦120k. I was shocked. Fast delivery too, arrived in 2 days." },
  { name: "Kemi A.", location: "Ibadan", rating: 5, text: "The Tailored Blazer is a masterpiece. Wore it to a pitch and got asked where I got it three times. CLASSIQ never misses." },
  { name: "Ngozi I.", location: "Enugu", rating: 5, text: "Customer service is amazing. Had a sizing question and Nova sorted it instantly. The knit cardigan is so soft and cosy." },
];

function Stars({ count }: { count: number }) {
  return (
    <div className="flex items-center gap-0.5">
      {Array.from({ length: count }).map((_, i) => (
        <svg key={i} className="w-3.5 h-3.5 text-primary fill-primary" viewBox="0 0 20 20">
          <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
        </svg>
      ))}
    </div>
  );
}

export default function Testimonials() {
  return (
    <section className="py-20 px-6 overflow-hidden">
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-10 flex flex-col items-center gap-2">
          <p className="text-[10px] uppercase tracking-[0.32em] text-muted-foreground">Real customers</p>
          <h2 className="font-display text-4xl md:text-5xl">What they are saying</h2>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-5 gap-4">
          {reviews.map((r) => (
            <div key={r.name} className="bg-white border border-blue-100 rounded-2xl p-5 flex flex-col gap-3">
              <Stars count={r.rating} />
              <p className="text-sm text-foreground leading-relaxed flex-1">&ldquo;{r.text}&rdquo;</p>
              <div className="flex flex-col gap-0.5 pt-2 border-t border-blue-50">
                <p className="text-xs font-medium text-foreground">{r.name}</p>
                <p className="text-[10px] uppercase tracking-[0.14em] text-muted-foreground">{r.location}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
