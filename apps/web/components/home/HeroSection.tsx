import Link from "next/link";
import { ArrowRight, Search } from "lucide-react";
import { Button } from "@/components/ui/button";
import { TAGLINES } from "@dropthetop/shared";

interface HeroSectionProps {
  heroImageUrl: string | null;
  activeCount: number;
}

function formatCount(count: number) {
  if (count >= 1000) return `${(count / 1000).toFixed(1).replace(/\.0$/, "")}K+`;
  return count.toString();
}

export function HeroSection({ heroImageUrl, activeCount }: HeroSectionProps) {
  return (
    <section className="relative min-h-[85vh] flex items-center justify-center overflow-hidden">
      {/* Background */}
      {heroImageUrl ? (
        <div
          className="absolute inset-0 bg-cover bg-center bg-no-repeat"
          style={{ backgroundImage: `url('${heroImageUrl}')` }}
        />
      ) : (
        <div className="absolute inset-0 bg-muted" />
      )}

      {/* Overlay */}
      <div className="absolute inset-0 hero-overlay" />

      {/* Red glow */}
      <div
        className="absolute bottom-0 left-1/2 -translate-x-1/2 w-[800px] h-[400px] opacity-30"
        style={{
          background:
            "radial-gradient(ellipse at center, hsl(var(--racing-red) / 0.4) 0%, transparent 70%)",
        }}
      />

      {/* Content */}
      <div className="relative z-10 container mx-auto px-4 text-center pt-2">
        <div className="max-w-4xl mx-auto">
          <p className="font-body text-accent uppercase tracking-[0.3em] text-sm md:text-base mb-6 animate-fade-in opacity-0 delay-100 drop-shadow-lg">
            {TAGLINES.full}
          </p>

          <h1 className="font-display text-4xl md:text-5xl lg:text-6xl leading-none mb-8 animate-fade-in opacity-0 delay-200 drop-shadow-xl">
            <span className="text-white">CURATED CORVETTES.</span>
            <br />
            <span className="text-gradient drop-shadow-lg">READY TO ROLL.</span>
          </h1>

          <p className="font-body text-lg md:text-xl text-white/90 max-w-2xl mx-auto mb-12 animate-fade-in opacity-0 delay-300 drop-shadow-md">
            From classic Stingrays to the latest C8 mid-engine beasts. Buy, sell, and connect with fellow enthusiasts.
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 animate-fade-in opacity-0 delay-400">
            <Link href="/inventory">
              <Button size="default" className="btn-racing px-6 py-2 gap-2 h-11 w-48">
                <Search className="w-4 h-4" />
                Browse Inventory
              </Button>
            </Link>
            <Link href="/sell">
              <Button
                size="default"
                variant="outline"
                className="px-6 py-2 gap-2 uppercase tracking-wider border-foreground/30 hover:bg-foreground/10 h-11 w-48"
              >
                Sell Your Corvette
                <ArrowRight className="w-4 h-4" />
              </Button>
            </Link>
          </div>

          {/* Stats */}
          <div className="mt-20 grid grid-cols-3 gap-8 max-w-2xl mx-auto animate-fade-in opacity-0 delay-500">
            <div className="text-center">
              <p
                className="font-display text-4xl md:text-5xl text-primary mb-2"
                style={{ textShadow: "0 0 10px rgba(0,0,0,0.5), 0 2px 4px rgba(0,0,0,0.3)" }}
              >
                {formatCount(activeCount)}
              </p>
              <p className="font-body text-sm text-white/80 uppercase tracking-wider drop-shadow-md">
                Active Listings
              </p>
            </div>
            <div className="text-center border-x border-border">
              <p
                className="font-display text-4xl md:text-5xl text-primary mb-2"
                style={{ textShadow: "0 0 10px rgba(0,0,0,0.5), 0 2px 4px rgba(0,0,0,0.3)" }}
              >
                10K+
              </p>
              <p className="font-body text-sm text-white/80 uppercase tracking-wider drop-shadow-md">
                Happy Buyers
              </p>
            </div>
            <div className="text-center">
              <p
                className="font-display text-4xl md:text-5xl text-primary mb-2"
                style={{ textShadow: "0 0 10px rgba(0,0,0,0.5), 0 2px 4px rgba(0,0,0,0.3)" }}
              >
                1953
              </p>
              <p className="font-body text-sm text-white/80 uppercase tracking-wider drop-shadow-md">
                To Present
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Scroll indicator */}
      <div className="absolute bottom-8 left-1/2 -translate-x-1/2 animate-bounce">
        <div className="w-6 h-10 border-2 border-foreground/30 rounded-full flex justify-center pt-2">
          <div className="w-1.5 h-3 bg-primary rounded-full" />
        </div>
      </div>
    </section>
  );
}
