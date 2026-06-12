import { Shield, Users, Award, Clock } from "lucide-react";
import { BRAND } from "@dropthetop/shared";

const features = [
  {
    icon: Shield,
    title: "Verified Listings",
    description:
      "Every listing is reviewed and verified by our expert team before going live on the marketplace.",
  },
  {
    icon: Users,
    title: "Enthusiast Community",
    description:
      "Connect with passionate Corvette owners, collectors, and enthusiasts from across the nation.",
  },
  {
    icon: Award,
    title: "Fair Pricing",
    description:
      "Our market analytics ensure transparent, fair pricing for both buyers and sellers.",
  },
  {
    icon: Clock,
    title: "Quick Process",
    description:
      "From listing to sale, our streamlined process gets deals done faster than traditional methods.",
  },
];

export function WhyChooseUs() {
  return (
    <section className="py-10 md:py-14 bg-secondary">
      <div className="container mx-auto px-4">
        <div className="text-center max-w-2xl mx-auto mb-8">
          <p className="font-body text-accent uppercase tracking-[0.2em] text-sm mb-3">
            Why {BRAND.name}
          </p>
          <h2 className="font-display text-5xl md:text-6xl mb-6">THE TRUSTED CHOICE</h2>
          <p className="font-body text-lg text-muted-foreground">
            We&apos;re not just a marketplace. We&apos;re a community built by Corvette enthusiasts,
            for Corvette enthusiasts.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {features.map((feature, index) => (
            <div
              key={feature.title}
              className="text-center p-8 glass-card rounded-lg border-glow"
              style={{ animationDelay: `${index * 100}ms` }}
            >
              <div className="w-16 h-16 mx-auto mb-6 rounded-full bg-primary/10 flex items-center justify-center glow-primary">
                <feature.icon className="w-8 h-8 text-primary" />
              </div>
              <h3 className="font-display text-2xl mb-4">{feature.title}</h3>
              <p className="font-body text-muted-foreground text-sm leading-relaxed">
                {feature.description}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
