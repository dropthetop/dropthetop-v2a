import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";

export function CallToAction() {
  return (
    <section className="py-10 md:py-14 relative overflow-hidden">
      {/* Background pattern */}
      <div
        className="absolute inset-0 opacity-5"
        style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ffffff' fill-opacity='0.4'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C%2Fg%3E%3C%2Fg%3E%3C%2Fsvg%3E")`,
        }}
      />
      <div
        className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] opacity-20"
        style={{
          background: "radial-gradient(circle, hsl(var(--racing-red) / 0.5) 0%, transparent 60%)",
        }}
      />

      <div className="container mx-auto px-4 relative z-10">
        <div className="max-w-4xl mx-auto text-center">
          <p className="font-body text-accent uppercase tracking-[0.2em] text-sm mb-4">
            Ready to Make a Move?
          </p>
          <h2 className="font-display text-5xl md:text-7xl mb-6">
            SELL YOUR <span className="text-gradient">CORVETTE</span>
          </h2>
          <p className="font-body text-xl text-muted-foreground mb-10 max-w-2xl mx-auto">
            Join thousands of satisfied sellers. List your Corvette with us and reach serious buyers
            from across the country.
          </p>

          <div className="flex flex-wrap justify-center gap-6 mb-10 text-sm">
            {["Free Listing", "Nationwide Reach", "Expert Support", "Secure Transactions"].map(
              (benefit) => (
                <div key={benefit} className="flex items-center gap-2">
                  <div className="w-2 h-2 rounded-full bg-primary" />
                  <span className="text-foreground">{benefit}</span>
                </div>
              )
            )}
          </div>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link href="/sell">
              <Button size="lg" className="btn-racing px-10 py-6 text-lg gap-2">
                Start Selling
                <ArrowRight className="w-5 h-5" />
              </Button>
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}
