import Header from "@/components/site/Header";
import Hero from "@/components/site/Hero";
import Catalog from "@/components/site/Catalog";
import Featured from "@/components/site/Featured";
import Occasions from "@/components/site/Occasions";
import Trending from "@/components/site/Trending";
import Testimonials from "@/components/site/Testimonials";
import ValueProps from "@/components/site/ValueProps";
import Story from "@/components/site/Story";
import Newsletter from "@/components/site/Newsletter";
import Footer from "@/components/site/Footer";
import ScrollToTop from "@/components/site/ScrollToTop";
import SiteAssistant from "@/components/site/SiteAssistant";

export default function Home() {
  return (
    <div className="min-h-screen bg-background text-foreground">
      <Header />
      <Hero />
      <Catalog />
      <Featured />
      <Occasions />
      <Trending />
      <Testimonials />
      <ValueProps />
      <Story />
      <Newsletter />
      <Footer />
      <ScrollToTop />
      <SiteAssistant />
    </div>
  );
}
