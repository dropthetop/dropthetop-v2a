"use client";

import { useState, useEffect } from "react";
import { createClient } from "@/lib/supabase/client";
import {
  Dialog, DialogContent, DialogHeader, DialogTitle,
} from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Loader2, ImagePlus, ImageMinus } from "lucide-react";
import { cn } from "@/lib/utils";

const FIELD_LABELS: Record<string, string> = {
  title: "Title", description: "Description", price: "Price", year: "Year",
  generation: "Generation", mileage: "Mileage", transmission: "Transmission",
  condition: "Condition", engine: "Engine", exterior_color: "Exterior Color",
  interior_color: "Interior Color", location_city: "City", location_state: "State",
  location_zip: "ZIP Code", vin: "VIN", video_url: "Video URL",
  listing_type: "Listing Type", negotiable: "Negotiable", model: "Model",
  body_style: "Body Style", used_type: "Used Type", vehicle_condition: "New/Used",
};

function fmtVal(field: string, value: unknown): string {
  if (value === null || value === undefined || value === "") return "—";
  if (field === "price") return new Intl.NumberFormat("en-US", { style: "currency", currency: "USD", maximumFractionDigits: 0 }).format(Number(value));
  if (field === "mileage") return new Intl.NumberFormat("en-US").format(Number(value)) + " mi";
  if (field === "negotiable") return value ? "Yes" : "No";
  return String(value);
}

interface Props {
  open: boolean;
  onOpenChange: (v: boolean) => void;
  listingId: string;
  listingTitle: string;
}

interface Change { field: string; label: string; oldValue: string; newValue: string }

export function ListingChangesDialog({ open, onOpenChange, listingId, listingTitle }: Props) {
  const [loading, setLoading] = useState(true);
  const [changes, setChanges] = useState<Change[]>([]);
  const [addedImages, setAddedImages] = useState<string[]>([]);
  const [removedImages, setRemovedImages] = useState<string[]>([]);
  const [noSnapshot, setNoSnapshot] = useState(false);

  useEffect(() => {
    if (!open) return;
    setLoading(true);
    const supabase = createClient();

    Promise.all([
      supabase.from("listing_snapshots").select("*").eq("listing_id", listingId).maybeSingle(),
      supabase.from("listings").select(Object.keys(FIELD_LABELS).join(", ")).eq("id", listingId).single(),
      supabase.from("listing_images").select("image_url").eq("listing_id", listingId).order("display_order"),
    ]).then(([{ data: snap }, { data: current }, { data: imgs }]) => {
      if (!snap) { setNoSnapshot(true); setLoading(false); return; }
      setNoSnapshot(false);

      const changed: Change[] = [];
      for (const field of Object.keys(FIELD_LABELS)) {
        const oldV = (snap as any)[field] ?? null;
        const newV = current ? (current as any)[field] ?? null : null;
        if (String(oldV ?? "") !== String(newV ?? "")) {
          changed.push({ field, label: FIELD_LABELS[field], oldValue: fmtVal(field, oldV), newValue: fmtVal(field, newV) });
        }
      }
      setChanges(changed);

      const currentUrls = (imgs ?? []).map((i) => i.image_url);
      const snapUrls: string[] = (snap as any).image_urls ?? [];
      setAddedImages(currentUrls.filter((u) => !snapUrls.includes(u)));
      setRemovedImages(snapUrls.filter((u) => !currentUrls.includes(u)));
      setLoading(false);
    });
  }, [open, listingId]);

  const hasChanges = changes.length > 0 || addedImages.length > 0 || removedImages.length > 0;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-3xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Changes for: {listingTitle}</DialogTitle>
        </DialogHeader>

        {loading ? (
          <div className="flex items-center justify-center py-12">
            <Loader2 className="w-8 h-8 animate-spin text-primary" />
          </div>
        ) : noSnapshot ? (
          <p className="text-center py-8 text-muted-foreground">No snapshot found. This listing may be a new submission.</p>
        ) : !hasChanges ? (
          <p className="text-center py-8 text-muted-foreground">No changes detected from the approved version.</p>
        ) : (
          <div className="space-y-6">
            <div className="flex items-center gap-4 text-sm">
              <Badge variant="outline" className="bg-red-500/10 text-red-500 border-red-500/30">Approved (Live)</Badge>
              <span className="text-muted-foreground">→</span>
              <Badge variant="outline" className="bg-green-500/10 text-green-500 border-green-500/30">Pending Changes</Badge>
            </div>

            {changes.length > 0 && (
              <div className="border border-border rounded-lg overflow-hidden">
                <table className="w-full text-sm">
                  <thead className="bg-muted/50">
                    <tr>
                      <th className="text-left px-4 py-2 font-medium">Field</th>
                      <th className="text-left px-4 py-2 font-medium text-red-500">Before</th>
                      <th className="text-left px-4 py-2 font-medium text-green-500">After</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-border">
                    {changes.map((c) => (
                      <tr key={c.field} className="hover:bg-muted/30">
                        <td className="px-4 py-3 font-medium">{c.label}</td>
                        <td className={cn("px-4 py-3", c.field === "description" && "max-w-xs truncate")}>
                          <span className="bg-red-500/10 text-red-400 px-2 py-0.5 rounded">{c.oldValue}</span>
                        </td>
                        <td className={cn("px-4 py-3", c.field === "description" && "max-w-xs truncate")}>
                          <span className="bg-green-500/10 text-green-400 px-2 py-0.5 rounded">{c.newValue}</span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}

            {(addedImages.length > 0 || removedImages.length > 0) && (
              <div className="space-y-4">
                <h3 className="text-sm font-medium">Image Changes</h3>
                {addedImages.length > 0 && (
                  <div className="space-y-2">
                    <div className="flex items-center gap-2 text-green-500">
                      <ImagePlus className="w-4 h-4" />
                      <span className="text-sm font-medium">{addedImages.length} image{addedImages.length !== 1 ? "s" : ""} added</span>
                    </div>
                    <div className="flex flex-wrap gap-2">
                      {addedImages.map((url, i) => (
                        <div key={i} className="relative w-20 h-20 rounded-md overflow-hidden border-2 border-green-500">
                          <img src={url} alt="" className="w-full h-full object-cover" />
                          <div className="absolute top-1 right-1">
                            <Badge className="bg-green-500 text-white text-[10px] px-1 py-0">NEW</Badge>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
                {removedImages.length > 0 && (
                  <div className="space-y-2">
                    <div className="flex items-center gap-2 text-red-500">
                      <ImageMinus className="w-4 h-4" />
                      <span className="text-sm font-medium">{removedImages.length} image{removedImages.length !== 1 ? "s" : ""} removed</span>
                    </div>
                    <div className="flex flex-wrap gap-2">
                      {removedImages.map((url, i) => (
                        <div key={i} className="relative w-20 h-20 rounded-md overflow-hidden border-2 border-red-500 opacity-60">
                          <img src={url} alt="" className="w-full h-full object-cover" />
                          <div className="absolute inset-0 bg-red-500/20" />
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}

            <p className="text-xs text-muted-foreground">
              {changes.length} field{changes.length !== 1 ? "s" : ""} changed
              {addedImages.length > 0 && `, ${addedImages.length} added`}
              {removedImages.length > 0 && `, ${removedImages.length} removed`}.{" "}
              Approving will make these changes live.
            </p>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
