import Header from "@/components/ui/Header";
import Footer from "@/components/ui/Footer";

export default function WithHeaderLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen flex flex-col bg-neutral-100">
      <Header />
      <main className="flex-1">{children}</main>
      <Footer />
    </div>
  );
}
