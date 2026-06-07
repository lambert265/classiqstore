"use client";
import { useState } from "react";
import { Mail, MapPin, Clock } from "lucide-react";

export default function ContactPage() {
  const [sent, setSent] = useState(false);
  const [form, setForm] = useState({ name: "", email: "", subject: "", message: "" });

  function handleChange(e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) {
    setForm((f) => ({ ...f, [e.target.name]: e.target.value }));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    // TODO: wire to your email API (Brevo/Resend)
    setSent(true);
  }

  return (
    <div className="max-w-4xl mx-auto px-6">
      <div className="mb-12">
        <p className="text-[10px] uppercase tracking-[0.28em] text-primary mb-3">Get in touch</p>
        <h1 className="font-heading text-4xl text-foreground mb-4">Contact Us</h1>
        <p className="text-muted-foreground">We&apos;d love to hear from you. We reply within 24 hours.</p>
      </div>

      <div className="grid md:grid-cols-2 gap-12">
        {/* Form */}
        <div>
          {sent ? (
            <div className="p-6 rounded-2xl bg-primary/10 border border-primary/20 text-center">
              <p className="font-heading text-xl text-foreground mb-2">Message sent!</p>
              <p className="text-sm text-muted-foreground">We&apos;ll get back to you within 24 hours.</p>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="flex flex-col gap-4">
              <input
                name="name" value={form.name} onChange={handleChange} required
                placeholder="Your name"
                className="w-full px-5 py-3.5 rounded-full border border-border bg-background text-sm text-foreground placeholder:text-muted-foreground outline-none focus:border-primary transition-colors"
              />
              <input
                name="email" value={form.email} onChange={handleChange} required type="email"
                placeholder="Email address"
                className="w-full px-5 py-3.5 rounded-full border border-border bg-background text-sm text-foreground placeholder:text-muted-foreground outline-none focus:border-primary transition-colors"
              />
              <select
                name="subject" value={form.subject} onChange={handleChange} required
                className="w-full px-5 py-3.5 rounded-full border border-border bg-background text-sm text-foreground outline-none focus:border-primary transition-colors"
              >
                <option value="">Select a topic</option>
                <option>Order enquiry</option>
                <option>Returns & exchanges</option>
                <option>Custom order request</option>
                <option>Wholesale / collaboration</option>
                <option>Other</option>
              </select>
              <textarea
                name="message" value={form.message} onChange={handleChange} required rows={5}
                placeholder="Your message"
                className="w-full px-5 py-4 rounded-2xl border border-border bg-background text-sm text-foreground placeholder:text-muted-foreground outline-none focus:border-primary transition-colors resize-none"
              />
              <button
                type="submit"
                className="w-full py-4 rounded-full bg-primary text-primary-foreground text-[11px] uppercase tracking-[0.18em] hover:bg-accent transition-colors duration-300"
              >
                Send message
              </button>
            </form>
          )}
        </div>

        {/* Info */}
        <div className="flex flex-col gap-6">
          {[
            { Icon: Mail, label: "Email", value: "hello@classiq.ng" },
            { Icon: MapPin, label: "Location", value: "Lagos, Nigeria" },
            { Icon: Clock, label: "Hours", value: "Mon – Sat, 9 AM – 6 PM WAT" },
          ].map(({ Icon, label, value }) => (
            <div key={label} className="flex gap-4 items-start">
              <div className="w-10 h-10 rounded-full bg-muted flex items-center justify-center shrink-0">
                <Icon size={16} strokeWidth={1.4} className="text-primary" />
              </div>
              <div>
                <p className="text-[10px] uppercase tracking-[0.2em] text-muted-foreground mb-0.5">{label}</p>
                <p className="text-sm text-foreground">{value}</p>
              </div>
            </div>
          ))}

          <div className="mt-4 p-5 rounded-2xl bg-muted">
            <p className="text-[10px] uppercase tracking-[0.2em] text-muted-foreground mb-2">Instagram</p>
            <a href="https://instagram.com" target="_blank" rel="noopener noreferrer" className="text-sm text-primary hover:text-accent transition-colors">
              @classiq.ng
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}
