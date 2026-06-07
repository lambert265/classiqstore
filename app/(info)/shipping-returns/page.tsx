export default function ShippingReturnsPage() {
  return (
    <div className="max-w-2xl mx-auto px-6">
      <div className="mb-12">
        <p className="text-[10px] uppercase tracking-[0.28em] text-primary mb-3">Policies</p>
        <h1 className="font-heading text-4xl text-foreground mb-4">Shipping &amp; Returns</h1>
        <p className="text-muted-foreground">Clear, simple policies — because your time matters.</p>
      </div>

      <section className="mb-10">
        <h2 className="font-heading text-xl text-foreground mb-4">Shipping</h2>
        <div className="flex flex-col gap-4">
          {[
            { zone: "Lagos (same state)", time: "1–3 business days", cost: "₦2,000 flat" },
            { zone: "Other Nigerian states", time: "3–7 business days", cost: "₦3,500 flat" },
            { zone: "International", time: "10–21 business days", cost: "Calculated at checkout" },
          ].map((row) => (
            <div key={row.zone} className="grid grid-cols-3 gap-4 py-4 border-b border-border text-sm">
              <span className="text-foreground font-medium">{row.zone}</span>
              <span className="text-muted-foreground">{row.time}</span>
              <span className="text-muted-foreground">{row.cost}</span>
            </div>
          ))}
        </div>
        <p className="text-sm text-muted-foreground mt-4 leading-relaxed">
          Orders placed before 12 PM on weekdays are processed same day. Orders placed after 12 PM or on weekends are processed the next business day. You will receive a shipping confirmation email with tracking details once your order ships.
        </p>
      </section>

      <section className="mb-10">
        <h2 className="font-heading text-xl text-foreground mb-4">Returns &amp; Exchanges</h2>
        <p className="text-sm text-muted-foreground leading-relaxed mb-4">
          We want you to love every piece. If something isn't right, here's what to do:
        </p>
        <ul className="flex flex-col gap-3 text-sm text-muted-foreground list-none">
          {[
            "Items must be returned within 14 days of delivery.",
            "Items must be unworn, unwashed, and in original packaging with tags attached.",
            "Custom-made, personalised, and sale items are final sale and cannot be returned.",
            "To initiate a return, contact us with your order number and reason for return.",
            "Return shipping is the customer's responsibility unless the item is defective.",
            "Refunds are processed within 5–7 business days of receiving the returned item.",
          ].map((point, i) => (
            <li key={i} className="flex gap-3">
              <span className="text-primary mt-0.5 shrink-0">—</span>
              {point}
            </li>
          ))}
        </ul>
      </section>

      <section>
        <h2 className="font-heading text-xl text-foreground mb-4">Damaged or Incorrect Items</h2>
        <p className="text-sm text-muted-foreground leading-relaxed">
          If you receive a damaged or incorrect item, please contact us within 48 hours of delivery with photos and your order number. We will replace the item or issue a full refund at no additional cost to you.
        </p>
      </section>
    </div>
  );
}
