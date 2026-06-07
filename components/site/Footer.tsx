const colHead = "text-[10px] uppercase tracking-[0.22em] text-primary-foreground mb-5 block";
const colLink = "block text-sm text-primary-foreground/60 hover:text-primary-foreground transition-colors duration-200 mb-3";

export default function Footer() {
  return (
    <footer className="bg-primary text-primary-foreground">
      <div className="max-w-7xl mx-auto px-6 py-16 grid grid-cols-2 md:grid-cols-4 gap-10">

        {/* Brand */}
        <div className="col-span-2 md:col-span-1 flex flex-col gap-4">
          <span className="font-display text-2xl tracking-[0.18em]">CLASSIQ</span>
          <p className="text-sm text-primary-foreground/60 leading-relaxed max-w-xs">
            Gender-inclusive fashion for every story. Clothing and footwear
            crafted with intention.
          </p>
        </div>

        {/* Shop */}
        <div>
          <span className={colHead}>Shop</span>
          {["Women's Clothing", "Teens", "Kids", "New Arrivals", "Lookbook"].map((l) => (
            <a key={l} href="/" className={colLink}>{l}</a>
          ))}
        </div>

        {/* Help */}
        <div>
          <span className={colHead}>Help</span>
          {["Size Guide", "Shipping & Returns", "Track Order", "FAQ", "Contact Us"].map((l) => (
            <a key={l} href="/" className={colLink}>{l}</a>
          ))}
        </div>

        {/* Company */}
        <div>
          <span className={colHead}>Company</span>
          {["About CLASSIQ", "Sustainability", "Careers", "Press", "Affiliates"].map((l) => (
            <a key={l} href="/" className={colLink}>{l}</a>
          ))}
        </div>
      </div>

      {/* Legal */}
      <div className="border-t border-primary-foreground/10">
        <div className="max-w-7xl mx-auto px-6 py-5 flex flex-col sm:flex-row items-center justify-between gap-3">
          <p className="text-[10px] text-primary-foreground/40 uppercase tracking-[0.14em]">
            © 2026 CLASSIQ. All rights reserved.
          </p>
          <a href="/" className="text-[10px] uppercase tracking-[0.14em] text-primary-foreground/40 hover:text-primary-foreground transition-colors duration-200">
            Privacy Policy
          </a>
        </div>
      </div>
    </footer>
  );
}
