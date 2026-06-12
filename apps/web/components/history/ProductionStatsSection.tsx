import { Car, Wrench, Cog, Star, TrendingUp, Calendar, Palette, DollarSign } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import type { ProductionStats } from "@dropthetop/shared";

interface ProductionStatsSectionProps {
  stats: ProductionStats;
  generationName: string;
}

function formatNumber(num: number) {
  return new Intl.NumberFormat("en-US").format(num);
}

export function ProductionStatsSection({ stats, generationName }: ProductionStatsSectionProps) {
  const manualPct = ((stats.totalManual / stats.totalProduced) * 100).toFixed(1);
  const autoPct = ((stats.totalAutomatic / stats.totalProduced) * 100).toFixed(1);

  return (
    <div className="space-y-12">
      {/* Specs: body styles / transmissions / engines */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="bg-card border-border">
          <CardContent className="p-6">
            <div className="flex items-center gap-3 mb-4">
              <Car className="w-5 h-5 text-primary" />
              <h3 className="font-display text-xl">Body Styles</h3>
            </div>
            <ul className="space-y-2">
              {stats.bodyStyles.map((style, i) => (
                <li key={i} className="text-muted-foreground flex items-center gap-2">
                  <span className="w-1.5 h-1.5 rounded-full bg-primary flex-shrink-0" />
                  {style}
                </li>
              ))}
            </ul>
          </CardContent>
        </Card>

        <Card className="bg-card border-border">
          <CardContent className="p-6">
            <div className="flex items-center gap-3 mb-4">
              <Cog className="w-5 h-5 text-primary" />
              <h3 className="font-display text-xl">Transmissions</h3>
            </div>
            <ul className="space-y-2">
              {stats.transmissions.map((t, i) => (
                <li key={i} className="text-muted-foreground flex items-center gap-2">
                  <span className="w-1.5 h-1.5 rounded-full bg-primary flex-shrink-0" />
                  {t}
                </li>
              ))}
            </ul>
          </CardContent>
        </Card>

        <Card className="bg-card border-border">
          <CardContent className="p-6">
            <div className="flex items-center gap-3 mb-4">
              <Wrench className="w-5 h-5 text-primary" />
              <h3 className="font-display text-xl">Engines</h3>
            </div>
            <ul className="space-y-2">
              {stats.engines.map((e, i) => (
                <li key={i} className="text-muted-foreground flex items-center gap-2">
                  <span className="w-1.5 h-1.5 rounded-full bg-primary flex-shrink-0" />
                  {e}
                </li>
              ))}
            </ul>
          </CardContent>
        </Card>
      </div>

      {/* Notable features */}
      <div>
        <h3 className="font-display text-2xl text-center mb-6">Notable Features</h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {stats.notableFeatures.map((feature, i) => (
            <Card key={i} className="bg-card/50 border-border">
              <CardContent className="p-4 flex items-center gap-3">
                <Star className="w-5 h-5 text-accent shrink-0" />
                <span className="text-foreground text-sm">{feature}</span>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>

      {/* Production by year table */}
      <div>
        <h3 className="font-display text-2xl text-center mb-6">Production by Year</h3>
        <div className="overflow-x-auto rounded-lg border border-border">
          <Table>
            <TableHeader>
              <TableRow className="bg-card/50">
                <TableHead className="text-foreground font-semibold">Year</TableHead>
                <TableHead className="text-foreground font-semibold text-right">Total</TableHead>
                <TableHead className="text-foreground font-semibold text-right">Coupe</TableHead>
                <TableHead className="text-foreground font-semibold text-right">Convertible</TableHead>
                <TableHead className="text-foreground font-semibold text-right">Manual</TableHead>
                <TableHead className="text-foreground font-semibold text-right">Automatic</TableHead>
                <TableHead className="text-foreground font-semibold text-right">Base Price</TableHead>
                <TableHead className="text-foreground font-semibold text-right">Est. Current</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {stats.yearlyProduction.map((yr) => (
                <TableRow key={yr.year} className="hover:bg-card/30">
                  <TableCell className="font-medium text-primary">{yr.year}</TableCell>
                  <TableCell className="text-right">{formatNumber(yr.total)}</TableCell>
                  <TableCell className="text-right text-muted-foreground">
                    {formatNumber(yr.coupe)}
                  </TableCell>
                  <TableCell className="text-right text-muted-foreground">
                    {formatNumber(yr.convertible)}
                  </TableCell>
                  <TableCell className="text-right text-muted-foreground">
                    {formatNumber(yr.manual)}
                  </TableCell>
                  <TableCell className="text-right text-muted-foreground">
                    {formatNumber(yr.automatic)}
                  </TableCell>
                  <TableCell className="text-right">{yr.basePrice}</TableCell>
                  <TableCell className="text-right text-muted-foreground">
                    {yr.avgCurrentPrice}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </div>

      {/* Production summary stats */}
      <div>
        <h3 className="font-display text-2xl text-center mb-6">Production Summary</h3>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <Card className="bg-card border-border">
            <CardContent className="p-4 text-center">
              <TrendingUp className="w-6 h-6 text-primary mx-auto mb-2" />
              <p className="text-2xl font-bold text-foreground">{formatNumber(stats.totalProduced)}</p>
              <p className="text-sm text-muted-foreground">Total Produced</p>
            </CardContent>
          </Card>

          <Card className="bg-card border-border">
            <CardContent className="p-4 text-center">
              <Calendar className="w-6 h-6 text-primary mx-auto mb-2" />
              <p className="text-2xl font-bold text-foreground">{stats.rarestYear}</p>
              <p className="text-sm text-muted-foreground">Rarest Year</p>
            </CardContent>
          </Card>

          <Card className="bg-card border-border">
            <CardContent className="p-4 text-center">
              <Star className="w-6 h-6 text-accent mx-auto mb-2" />
              <p className="text-2xl font-bold text-foreground">
                {formatNumber(stats.specialEditionsTotal)}
              </p>
              <p className="text-sm text-muted-foreground">{stats.specialEditionsLabel}</p>
            </CardContent>
          </Card>

          <Card className="bg-card border-border">
            <CardContent className="p-4 text-center">
              <DollarSign className="w-6 h-6 text-accent mx-auto mb-2" />
              <p className="text-2xl font-bold text-foreground">{stats.avgBasePrice}</p>
              <p className="text-sm text-muted-foreground">Avg. Base Price</p>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Body style & transmission breakdown */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card className="bg-card border-border">
          <CardContent className="p-6">
            <h4 className="font-display text-lg mb-4 flex items-center gap-2">
              <Car className="w-4 h-4 text-primary" />
              Body Style Breakdown
            </h4>
            <div className="space-y-3">
              <div className="flex justify-between">
                <span className="text-muted-foreground">Convertible</span>
                <span className="font-semibold text-foreground">
                  {formatNumber(stats.totalConvertible)}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Coupe</span>
                <span className="font-semibold text-foreground">
                  {formatNumber(stats.totalCoupe)}
                </span>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-card border-border">
          <CardContent className="p-6">
            <h4 className="font-display text-lg mb-4 flex items-center gap-2">
              <Cog className="w-4 h-4 text-primary" />
              Transmission Breakdown
            </h4>
            <div className="space-y-3">
              <div className="flex justify-between">
                <span className="text-muted-foreground">Manual</span>
                <span className="font-semibold text-foreground">
                  {formatNumber(stats.totalManual)}{" "}
                  <span className="text-muted-foreground text-sm">({manualPct}%)</span>
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Automatic</span>
                <span className="font-semibold text-foreground">
                  {formatNumber(stats.totalAutomatic)}{" "}
                  <span className="text-muted-foreground text-sm">({autoPct}%)</span>
                </span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Colors */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Card className="bg-card border-border">
          <CardContent className="p-4 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Palette className="w-5 h-5 text-primary" />
              <span className="text-muted-foreground">Most Popular Color</span>
            </div>
            <span className="font-semibold text-foreground">{stats.mostPopularColor}</span>
          </CardContent>
        </Card>

        <Card className="bg-card border-border">
          <CardContent className="p-4 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Palette className="w-5 h-5 text-accent" />
              <span className="text-muted-foreground">Rarest Color</span>
            </div>
            <span className="font-semibold text-foreground">{stats.rarestColor}</span>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
