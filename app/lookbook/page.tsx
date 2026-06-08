import { createClient } from "@/lib/supabase/server";
import Image from "next/image";
import Header from "@/components/site/Header";
import Footer from "@/components/site/Footer";

export const dynamic = "force-dynamic";

export default async function LookbookPage() {
  const supabase = await createClient();
  const { data: entries } = await supabase
    .from("lookbook")
    .select("*")
    .eq("published", true)
    .order("created_at", { ascending: false });

  const lookbooks = entries ?? [];

  return (
    <div className="min-h-screen bg-background text-foreground">
      <Header />
      <main className="max-w-7xl mx-auto px-6 pt-28 pb-20">
        <div className="mb-14">
          <p className="text-[10px] uppercase tracking-[0.28em] text-primary mb-3">Editorial</p>
          <h1 className="font-display text-5xl md:text-6xl tracking-[-0.01em]">Lookbook</h1>
        </div>

        {lookbooks.length === 0 ? (
          <div className="h-60 flex items-center justify-center">
            <p className="text-sm text-muted-foreground uppercase tracking-[0.18em]">Coming soon</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {lookbooks.map((entry: { id: string; title: string; description?: string; images?: string[] }) => (
              <div key={entry.id} className="glass rounded-3xl overflow-hidden group">
                <div className="relative aspect-[4/5] overflow-hidden bg-muted">
                  {entry.images?.[0] ? (
                    <Image
                      src={entry.images[0]}
                      alt={entry.title}
                      fill
                      className="object-cover transition-transform duration-700 group-hover:scale-[1.04]"
                      sizes="(max-width: 768px) 100vw, 50vw"
                    />
                  ) : (
                    <div className="absolute inset-0 bg-muted flex items-center justify-center">
                      <span className="text-[10px] uppercase tracking-[0.18em] text-muted-foreground">No image</span>
                    </div>
                  )}
                </div>
                <div className="p-7 flex flex-col gap-2">
                  <h2 className="font-display text-2xl text-foreground">{entry.title}</h2>
                  {entry.description && (
                    <p className="text-sm text-muted-foreground leading-relaxed">{entry.description}</p>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </main>
      <Footer />
    </div>
  );
}
