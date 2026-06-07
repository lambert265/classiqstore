export default function PrivacyPage() {
  return (
    <div className="max-w-2xl mx-auto px-6">
      <div className="mb-12">
        <p className="text-[10px] uppercase tracking-[0.28em] text-primary mb-3">Legal</p>
        <h1 className="font-heading text-4xl text-foreground mb-2">Privacy Policy</h1>
        <p className="text-xs text-muted-foreground">Last updated: January 2026</p>
      </div>

      <div className="flex flex-col gap-8 text-sm text-muted-foreground leading-relaxed">
        {[
          {
            title: "Information We Collect",
            body: "We collect information you provide directly (name, email, shipping address, payment details) when you create an account or place an order. We also collect usage data such as pages visited and items viewed to improve your shopping experience.",
          },
          {
            title: "How We Use Your Information",
            body: "We use your information to process orders, send order updates, personalise your experience, and occasionally send promotional emails (which you can opt out of at any time). We do not sell your personal data to third parties.",
          },
          {
            title: "Data Storage & Security",
            body: "Your data is stored securely using industry-standard encryption. Payment information is processed by our payment provider and is never stored on our servers.",
          },
          {
            title: "Cookies",
            body: "We use cookies to keep you signed in, remember your cart, and analyse site traffic. You can disable cookies in your browser settings, though some features may not function correctly.",
          },
          {
            title: "Your Rights",
            body: "You have the right to access, correct, or delete your personal data at any time. To exercise these rights, contact us at hello@classiq.ng.",
          },
          {
            title: "Contact",
            body: "For any privacy-related questions, please contact us at hello@classiq.ng.",
          },
        ].map(({ title, body }) => (
          <section key={title}>
            <h2 className="font-heading text-lg text-foreground mb-2">{title}</h2>
            <p>{body}</p>
          </section>
        ))}
      </div>
    </div>
  );
}
