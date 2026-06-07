"use client";
import { useState } from "react";
import { ChevronDown } from "lucide-react";

const faqs = [
  {
    q: "How do I place an order?",
    a: "Browse our collections, select your size and quantity, then add items to your cart. Proceed to checkout and follow the steps to complete your purchase.",
  },
  {
    q: "What payment methods do you accept?",
    a: "We accept all major debit/credit cards, bank transfers, and pay-on-delivery for select locations within Nigeria.",
  },
  {
    q: "How long does delivery take?",
    a: "Lagos orders typically arrive within 1–3 business days. Other states within Nigeria take 3–7 business days. International shipping is available on request.",
  },
  {
    q: "Can I return or exchange an item?",
    a: "Yes — unworn items in original condition can be returned within 14 days of delivery. Custom or sale items are final sale. See our Shipping & Returns page for full details.",
  },
  {
    q: "How do I find my size?",
    a: "Visit our Size Guide page for detailed measurements. If you're between sizes, we recommend sizing up. You can also contact us for personal styling advice.",
  },
  {
    q: "Do you offer custom orders?",
    a: "Yes! We offer custom and bespoke pieces. Submit a custom request through your account and our team will get back to you with a quote within 48 hours.",
  },
  {
    q: "How do I track my order?",
    a: "Once your order ships, you'll receive an email with a tracking number. You can also use the Track Order page on our site.",
  },
  {
    q: "Can I modify or cancel my order?",
    a: "Orders can be modified or cancelled within 2 hours of placement. Please contact us immediately via the Contact page.",
  },
];

export default function FAQPage() {
  const [open, setOpen] = useState<number | null>(null);

  return (
    <div className="max-w-2xl mx-auto px-6">
      <div className="mb-12">
        <p className="text-[10px] uppercase tracking-[0.28em] text-primary mb-3">Support</p>
        <h1 className="font-heading text-4xl text-foreground mb-4">Frequently Asked Questions</h1>
        <p className="text-muted-foreground">Everything you need to know about shopping with CLASSIQ.</p>
      </div>

      <div className="flex flex-col divide-y divide-border">
        {faqs.map((item, i) => (
          <div key={i}>
            <button
              onClick={() => setOpen(open === i ? null : i)}
              className="w-full flex items-center justify-between py-5 text-left gap-4"
            >
              <span className="text-sm font-medium text-foreground">{item.q}</span>
              <ChevronDown
                size={16}
                strokeWidth={1.5}
                className={`shrink-0 text-muted-foreground transition-transform duration-200 ${open === i ? "rotate-180" : ""}`}
              />
            </button>
            {open === i && (
              <p className="text-sm text-muted-foreground pb-5 leading-relaxed">{item.a}</p>
            )}
          </div>
        ))}
      </div>

      <div className="mt-12 p-6 rounded-2xl bg-muted text-center">
        <p className="text-sm text-foreground font-medium mb-1">Still have questions?</p>
        <p className="text-sm text-muted-foreground mb-4">Our team is happy to help.</p>
        <a
          href="/contact"
          className="inline-block px-6 py-3 rounded-full bg-primary text-primary-foreground text-[11px] uppercase tracking-[0.18em] hover:bg-accent transition-colors"
        >
          Contact us
        </a>
      </div>
    </div>
  );
}
