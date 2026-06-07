export default function TermsPage() {
  return (
    <div className="max-w-2xl mx-auto px-6">
      <div className="mb-12">
        <p className="text-[10px] uppercase tracking-[0.28em] text-primary mb-3">Legal</p>
        <h1 className="font-heading text-4xl text-foreground mb-2">Terms of Service</h1>
        <p className="text-xs text-muted-foreground">Last updated: January 2026</p>
      </div>

      <div className="flex flex-col gap-8 text-sm text-muted-foreground leading-relaxed">
        {[
          {
            title: "Acceptance of Terms",
            body: "By accessing or using the CLASSIQ website or placing an order, you agree to be bound by these Terms of Service. If you do not agree, please do not use our services.",
          },
          {
            title: "Products & Pricing",
            body: "All prices are listed in Nigerian Naira (₦) and are subject to change without notice. We reserve the right to cancel orders in the event of pricing errors. Product images are for illustrative purposes — minor colour variations may occur.",
          },
          {
            title: "Orders & Payment",
            body: "Orders are confirmed only upon payment. We accept debit/credit cards and bank transfers. By placing an order you confirm that the payment information provided is accurate and authorised.",
          },
          {
            title: "Intellectual Property",
            body: "All content on this site — including images, text, logos, and design — is the property of CLASSIQ and may not be reproduced or used without prior written consent.",
          },
          {
            title: "Limitation of Liability",
            body: "CLASSIQ is not liable for any indirect, incidental, or consequential damages arising from the use of our products or services. Our liability is limited to the value of your order.",
          },
          {
            title: "Governing Law",
            body: "These terms are governed by the laws of the Federal Republic of Nigeria. Any disputes will be resolved in the courts of Lagos State.",
          },
          {
            title: "Contact",
            body: "Questions about these terms? Contact us at hello@classiq.ng.",
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
