import Header from "@/components/marketing/Header";
import Footer from "@/components/marketing/Footer";
import type { ReactNode } from "react";

export default function MarketingLayout({ children }: { children: ReactNode }) {
  return (
    <div className="min-h-screen flex flex-col bg-gray-50">
      <Header />
      <div className="flex-1">{children}</div>
      <Footer />
    </div>
  );
}

