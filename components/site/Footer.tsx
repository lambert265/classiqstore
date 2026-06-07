import Link from "next/link";

const colHead = "text-[10px] uppercase tracking-[0.22em] text-primary-foreground mb-5 block";
const colLink = "block text-sm text-primary-foreground/60 hover:text-primary-foreground transition-colors duration-200 mb-3";

export default function Footer() {
  return (
    <footer className="bg-primary text-primary-foreground">
      <div className="max-w-7xl mx-auto px-6 py-16 grid grid-cols-2 md:grid-cols-4 gap-10">

        {/* Brand */}
        <div className="col-span-2 md:col-span-1 flex flex-col gap-4">
          <Link href="/" className="font-heading text-2xl tracking-[0.18em]">CLASSIQ</Link>
          <p className="text-sm text-primary-foreground/60 leading-relaxed max-w-xs">
            Gender-inclusive fashion for every story. Clothing and footwear
            crafted with intention.
          </p>
        </div>

        {/* Shop */}
        <div>
          <span className={colHead}>Shop</span>
          <Link href="/?category=womens" className={colLink}>Women&apos;s Clothing</Link>
          <Link href="/?category=teens" className={colLink}>Teens</Link>
          <Link href="/?category=kids" className={colLink}>Kids</Link>
          <Link href="/?category=new" className={colLink}>New Arrivals</Link>
          <Link href="/lookbook" className={colLink}>Lookbook</Link>
        </div>

        {/* Help */}
        <div>
          <span className={colHead}>Help</span>
          <Link href="/size-guide" className={colLink}>Size Guide</Link>
          <Link href="/shipping-returns" className={colLink}>Shipping &amp; Returns</Link>
          <Link href="/track-order" className={colLink}>Track Order</Link>
          <Link href="/faq" className={colLink}>FAQ</Link>
          <Link href="/contact" className={colLink}>Contact Us</Link>
        </div>

        {/* Company */}
        <div>
          <span className={colHead}>Company</span>
          <Link href="/about" className={colLink}>About CLASSIQ</Link>
          <Link href="/sustainability" className={colLink}>Sustainability</Link>
          <Link href="/careers" className={colLink}>Careers</Link>
          <Link href="/press" className={colLink}>Press</Link>
          <Link href="/affiliates" className={colLink}>Affiliates</Link>
        </div>
      </div>

      {/* Legal */}
      <div className="border-t border-primary-foreground/10">
        <div className="max-w-7xl mx-auto px-6 py-5 flex flex-col sm:flex-row items-center justify-between gap-3">
          <p className="text-[10px] text-primary-foreground/40 uppercase tracking-[0.14em]">
            © 2026 CLASSIQ. All rights reserved.
          </p>
          <div className="flex items-center gap-4">
            <Link href="/privacy" className="text-[10px] uppercase tracking-[0.14em] text-primary-foreground/40 hover:text-primary-foreground transition-colors duration-200">
              Privacy Policy
            </Link>
            <Link href="/terms" className="text-[10px] uppercase tracking-[0.14em] text-primary-foreground/40 hover:text-primary-foreground transition-colors duration-200">
              Terms of Service
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
