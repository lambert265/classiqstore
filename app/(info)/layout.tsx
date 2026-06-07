import Header from "@/components/site/Header";
import Footer from "@/components/site/Footer";

export default function InfoLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <Header />
      <main className="min-h-screen pt-24 pb-20">{children}</main>
      <Footer />
    </>
  );
}
