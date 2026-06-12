import Link from "next/link";
import { ArrowLeft, Search } from "lucide-react";
import { Button } from "@/components/ui/button";
import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";

export default function NotFound() {
  return (
    <div className="min-h-screen flex flex-col bg-background">
      <Header />

      <main className="flex-1 flex items-center justify-center px-4">
        <div className="text-center max-w-lg">
          <p className="font-display text-8xl md:text-9xl text-primary mb-2">404</p>
          <h1 className="font-display text-3xl md:text-4xl text-foreground mb-4">Page Not Found</h1>
          <p className="text-muted-foreground text-lg mb-10">
            This page doesn&apos;t exist or may have been moved. Let&apos;s get you back on track.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link href="/">
              <Button variant="outline" className="w-full sm:w-auto gap-2">
                <ArrowLeft className="w-4 h-4" />
                Back to Home
              </Button>
            </Link>
            <Link href="/inventory">
              <Button className="btn-racing w-full sm:w-auto gap-2">
                <Search className="w-4 h-4" />
                Browse Inventory
              </Button>
            </Link>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
