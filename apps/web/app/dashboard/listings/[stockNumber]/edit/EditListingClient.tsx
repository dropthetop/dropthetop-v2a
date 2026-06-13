"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";
import { ArrowLeft, Loader2, CheckCircle, XCircle } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { ImageUploader, type UploadImage } from "@/components/listings/ImageUploader";
import { createClient } from "@/lib/supabase/client";
import { generations, US_STATES } from "@dropthetop/shared";
import {
  listingSchema,
  type ListingFormValues,
  type ListingLookups,
  type ExistingImage,
} from "@/lib/listing-form";

interface Props {
  userId: string;
  listing: Record<string, any> & {
    id: string;
    status: string | null;
    is_sold: boolean | null;
    listing_images: ExistingImage[];
  };
  lookups: ListingLookups;
}

// ─── Field helper ─────────────────────────────────────────────────────────────

function Field({
  label,
  error,
  required,
  children,
}: {
  label: string;
  error?: string;
  required?: boolean;
  children: React.ReactNode;
}) {
  return (
    <div className="space-y-1.5">
      <Label className="text-sm text-muted-foreground uppercase tracking-wider">
        {label}
        {required && <span className="text-destructive ml-1">*</span>}
      </Label>
      {children}
      {error && <p className="text-destructive text-xs">{error}</p>}
    </div>
  );
}

// ─── main ─────────────────────────────────────────────────────────────────────

export function EditListingClient({ userId, listing, lookups }: Props) {
  const router = useRouter();
  const [submitting, setSubmitting] = useState(false);
  const [corvetteModels, setCorvetteModels] = useState<{ id: string; model_name: string }[]>([]);

  // Build initial image state from existing DB images
  const initialImages: UploadImage[] = (listing.listing_images ?? [])
    .sort((a: ExistingImage, b: ExistingImage) => (a.display_order ?? 0) - (b.display_order ?? 0))
    .map((img: ExistingImage) => ({
      key: img.id,
      url: img.image_url,
      is_primary: !!img.is_primary,
      existingId: img.id,
    }));

  const [images, setImages] = useState<UploadImage[]>(initialImages);

  const {
    register,
    handleSubmit,
    watch,
    setValue,
    formState: { errors },
  } = useForm<ListingFormValues>({
    resolver: zodResolver(listingSchema),
    defaultValues: {
      title: listing.title ?? "",
      price: listing.price ?? 0,
      year: listing.year ?? new Date().getFullYear(),
      generation: listing.generation ?? "",
      mileage: listing.mileage ?? 0,
      transmission: listing.transmission ?? "",
      condition: listing.condition ?? "",
      vehicle_condition: (listing.vehicle_condition as "new" | "used") ?? "used",
      used_type: listing.used_type ?? null,
      model: listing.model ?? null,
      body_style: listing.body_style ?? null,
      engine: listing.engine ?? "",
      exterior_color: listing.exterior_color ?? "",
      interior_color: listing.interior_color ?? "",
      vin: listing.vin ?? "",
      description: listing.description ?? "",
      location_city: listing.location_city ?? "",
      location_state: listing.location_state ?? "",
      location_zip: listing.location_zip ?? "",
      negotiable: listing.negotiable ?? true,
      video_url: listing.video_url ?? "",
    },
  });

  const selectedGeneration = watch("generation");
  const vehicleCondition = watch("vehicle_condition");
  const watchedState = watch("location_state");

  const generationLabel = selectedGeneration
    ? generations.find((g) => g.id === selectedGeneration)
      ? `${generations.find((g) => g.id === selectedGeneration)!.name} (${generations.find((g) => g.id === selectedGeneration)!.years})`
      : selectedGeneration
    : "";
  const stateLabel = watchedState
    ? (US_STATES.find((s) => s.value === watchedState)?.label ?? watchedState)
    : "";

  // Fetch models when generation changes
  useEffect(() => {
    if (!selectedGeneration) return;
    const supabase = createClient();
    supabase
      .from("corvette_models")
      .select("id, model_name")
      .eq("generation", selectedGeneration)
      .order("display_order")
      .then(({ data }) => setCorvetteModels(data ?? []));
  }, [selectedGeneration]);

  const onSubmit = async (data: ListingFormValues) => {
    const visibleImages = images.filter((i) => !i.toDelete);
    if (visibleImages.length === 0) {
      toast.error("Please keep at least one photo.");
      return;
    }

    setSubmitting(true);
    const supabase = createClient();

    try {
      const wasApproved = listing.status === "approved";

      // 1. Snapshot for approved listings (before editing)
      if (wasApproved) {
        const existingImageUrls = initialImages.map((i) => i.url);
        try {
          await supabase.rpc("create_listing_snapshot", {
            p_listing_id: listing.id,
            p_title: listing.title,
            p_description: listing.description,
            p_price: listing.price,
            p_year: listing.year,
            p_generation: listing.generation,
            p_mileage: listing.mileage,
            p_transmission: listing.transmission,
            p_condition: listing.condition,
            p_engine: listing.engine,
            p_exterior_color: listing.exterior_color,
            p_interior_color: listing.interior_color,
            p_location_city: listing.location_city,
            p_location_state: listing.location_state,
            p_location_zip: listing.location_zip,
            p_vin: listing.vin,
            p_video_url: listing.video_url,
            p_listing_type: listing.listing_type,
            p_negotiable: listing.negotiable,
            p_model: listing.model,
            p_body_style: listing.body_style,
            p_used_type: listing.used_type,
            p_vehicle_condition: listing.vehicle_condition,
            p_image_urls: existingImageUrls,
          });
        } catch {
          // Non-fatal — snapshot failure should not block the edit
        }
      }

      // 2. Delete removed existing images
      const toDelete = images.filter((i) => i.toDelete && i.existingId);
      for (const img of toDelete) {
        await supabase.from("listing_images").delete().eq("id", img.existingId!);
        // Extract path from URL and delete from storage
        try {
          const url = new URL(img.url);
          const pathParts = url.pathname.split("/listing-images/");
          if (pathParts[1]) {
            await supabase.storage.from("listing-images").remove([pathParts[1]]);
          }
        } catch {}
      }

      // 3. Upload new images
      const newImages = images.filter((i) => !i.toDelete && !i.existingId && i.file);
      const maxExistingOrder = Math.max(
        0,
        ...images
          .filter((i) => !i.toDelete && i.existingId)
          .map((_, idx) => idx)
      );

      for (let i = 0; i < newImages.length; i++) {
        const img = newImages[i];
        if (!img.file) continue;

        const ext = img.file.name.split(".").pop() ?? "jpg";
        const path = `${listing.id}/${Date.now()}-${i}.${ext}`;

        const { error: uploadError } = await supabase.storage
          .from("listing-images")
          .upload(path, img.file, { upsert: false });

        if (uploadError) {
          toast.error(`Failed to upload photo ${i + 1}.`);
          continue;
        }

        const { data: urlData } = supabase.storage.from("listing-images").getPublicUrl(path);
        await supabase.from("listing_images").insert({
          listing_id: listing.id,
          image_url: urlData.publicUrl,
          is_primary: img.is_primary,
          display_order: maxExistingOrder + i + 1,
        });
      }

      // 4. Update primary flag on existing images
      const remainingExisting = images.filter((i) => !i.toDelete && i.existingId);
      for (const img of remainingExisting) {
        await supabase
          .from("listing_images")
          .update({ is_primary: img.is_primary })
          .eq("id", img.existingId!);
      }

      // 5. Update listing
      const { error: updateError } = await supabase
        .from("listings")
        .update({
          title: data.title,
          price: data.price,
          year: data.year,
          generation: data.generation,
          mileage: data.mileage,
          transmission: data.transmission,
          condition: data.condition,
          vehicle_condition: data.vehicle_condition,
          used_type: data.used_type || null,
          model: data.model || null,
          body_style: data.body_style || null,
          engine: data.engine,
          exterior_color: data.exterior_color,
          interior_color: data.interior_color,
          vin: data.vin || null,
          description: data.description,
          location_city: data.location_city,
          location_state: data.location_state,
          location_zip: data.location_zip,
          negotiable: data.negotiable,
          video_url: data.video_url || null,
          // If was approved, set to pending_edited for re-review
          ...(wasApproved ? { status: "pending_edited", rejection_reason: null } : {}),
        })
        .eq("id", listing.id);

      if (updateError) throw updateError;

      toast.success(wasApproved ? "Changes submitted for review." : "Listing updated.");
      router.push("/dashboard");
    } catch (err) {
      console.error(err);
      toast.error("Failed to save listing. Please try again.");
    } finally {
      setSubmitting(false);
    }
  };

  // Mark as sold toggle
  const toggleSold = async () => {
    const supabase = createClient();
    const newVal = !listing.is_sold;
    const { error } = await supabase
      .from("listings")
      .update({ is_sold: newVal })
      .eq("id", listing.id);

    if (!error) {
      toast.success(newVal ? "Marked as sold." : "Marked as available.");
      router.refresh();
    }
  };

  return (
    <main style={{ paddingTop: "calc(5rem + var(--safe-area-top, 0px))" }}>
      <div className="container mx-auto px-4 pb-12 max-w-2xl">
        <div className="flex items-center gap-3 mb-6">
          <Link href="/dashboard" className="text-muted-foreground hover:text-foreground transition-colors">
            <ArrowLeft className="w-5 h-5" />
          </Link>
          <h1 className="font-display text-3xl">Edit Listing</h1>
        </div>

        {/* Mark as sold */}
        <div
          className={`glass-card rounded-lg p-4 mb-6 flex items-center justify-between gap-3 border-2 ${
            listing.is_sold ? "border-red-500/40" : "border-green-500/40"
          }`}
        >
          <div className="flex items-center gap-2">
            {listing.is_sold ? (
              <XCircle className="w-5 h-5 text-red-500" />
            ) : (
              <CheckCircle className="w-5 h-5 text-green-500" />
            )}
            <div>
              <p className="font-semibold text-sm">
                {listing.is_sold ? "Marked as Sold" : "Available for Sale"}
              </p>
              <p className="text-xs text-muted-foreground">
                {listing.is_sold ? "Toggle to relist this vehicle" : "Toggle to mark this vehicle as sold"}
              </p>
            </div>
          </div>
          <Switch checked={!!listing.is_sold} onCheckedChange={toggleSold} />
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">

          {/* Photos */}
          <section className="glass-card rounded-lg p-4 space-y-3">
            <h2 className="font-display text-xl">Photos</h2>
            <ImageUploader images={images} onChange={setImages} maxImages={20} disabled={submitting} />
          </section>

          {/* Vehicle Details */}
          <section className="glass-card rounded-lg p-4 space-y-4">
            <h2 className="font-display text-xl">Vehicle Details</h2>

            <Field label="Title" error={errors.title?.message} required>
              <Input {...register("title")} disabled={submitting} />
            </Field>

            <div className="grid grid-cols-2 gap-4">
              <Field label="Year" error={errors.year?.message} required>
                <Input {...register("year")} type="number" disabled={submitting} />
              </Field>
              <Field label="Generation" error={errors.generation?.message} required>
                <Select
                  defaultValue={listing.generation ?? undefined}
                  onValueChange={(v: string | null) => { setValue("generation", v ?? ""); setValue("model", null); }}
                  disabled={submitting}
                >
                  <SelectTrigger><SelectValue>{generationLabel || undefined}</SelectValue></SelectTrigger>
                  <SelectContent>
                    {generations.map((g) => (
                      <SelectItem key={g.id} value={g.id}>{g.name} ({g.years})</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </Field>
            </div>

            {corvetteModels.length > 0 && (
              <Field label="Model" error={errors.model?.message}>
                <Select
                  defaultValue={listing.model ?? undefined}
                  onValueChange={(v: string | null) => setValue("model", v)}
                  disabled={submitting}
                >
                  <SelectTrigger><SelectValue placeholder="Select model…" /></SelectTrigger>
                  <SelectContent>
                    {corvetteModels.map((m) => (
                      <SelectItem key={m.id} value={m.model_name}>{m.model_name}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </Field>
            )}

            {lookups.body_styles.length > 0 && (
              <Field label="Body Style" error={errors.body_style?.message}>
                <Select
                  defaultValue={listing.body_style ?? undefined}
                  onValueChange={(v: string | null) => setValue("body_style", v)}
                  disabled={submitting}
                >
                  <SelectTrigger><SelectValue placeholder="Select…" /></SelectTrigger>
                  <SelectContent>
                    {lookups.body_styles.map((b) => (
                      <SelectItem key={b.id} value={b.display_name}>{b.display_name}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </Field>
            )}

            <div className="grid grid-cols-2 gap-4">
              <Field label="Mileage" error={errors.mileage?.message} required>
                <Input {...register("mileage")} type="number" disabled={submitting} />
              </Field>
              <Field label="Transmission" error={errors.transmission?.message} required>
                <Select
                  defaultValue={listing.transmission ?? undefined}
                  onValueChange={(v: string | null) => setValue("transmission", v ?? "")}
                  disabled={submitting}
                >
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    {lookups.transmissions.map((t) => (
                      <SelectItem key={t.id} value={t.display_name}>{t.display_name}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </Field>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <Field label="Condition" error={errors.condition?.message} required>
                <Select
                  defaultValue={listing.condition ?? undefined}
                  onValueChange={(v: string | null) => setValue("condition", v ?? "")}
                  disabled={submitting}
                >
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    {lookups.conditions.map((c) => (
                      <SelectItem key={c.id} value={c.display_name}>{c.display_name}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </Field>
              <Field label="New / Used" error={errors.vehicle_condition?.message} required>
                <Select
                  defaultValue={listing.vehicle_condition ?? "used"}
                  onValueChange={(v: string | null) => setValue("vehicle_condition", (v ?? "used") as "new" | "used")}
                  disabled={submitting}
                >
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="used">Used</SelectItem>
                    <SelectItem value="new">New</SelectItem>
                  </SelectContent>
                </Select>
              </Field>
            </div>

            {vehicleCondition === "used" && lookups.used_types.length > 0 && (
              <Field label="Used Type" error={errors.used_type?.message}>
                <Select
                  defaultValue={listing.used_type ?? undefined}
                  onValueChange={(v: string | null) => setValue("used_type", v)}
                  disabled={submitting}
                >
                  <SelectTrigger><SelectValue placeholder="Select…" /></SelectTrigger>
                  <SelectContent>
                    {lookups.used_types.map((ut) => (
                      <SelectItem key={ut.id} value={ut.display_name}>{ut.display_name}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </Field>
            )}

            <Field label="Engine" error={errors.engine?.message} required>
              <Input {...register("engine")} disabled={submitting} />
            </Field>

            <div className="grid grid-cols-2 gap-4">
              <Field label="Exterior Color" error={errors.exterior_color?.message} required>
                <Input {...register("exterior_color")} disabled={submitting} />
              </Field>
              <Field label="Interior Color" error={errors.interior_color?.message} required>
                <Input {...register("interior_color")} disabled={submitting} />
              </Field>
            </div>

            <Field label="VIN" error={errors.vin?.message}>
              <Input
                {...register("vin")}
                className="font-mono"
                maxLength={17}
                onChange={(e) => {
                  e.target.value = e.target.value.toUpperCase();
                  register("vin").onChange(e);
                }}
                disabled={submitting}
              />
            </Field>

            <Field label="Description" error={errors.description?.message} required>
              <Textarea {...register("description")} rows={5} className="resize-none" disabled={submitting} />
            </Field>
          </section>

          {/* Pricing */}
          <section className="glass-card rounded-lg p-4 space-y-4">
            <h2 className="font-display text-xl">Pricing</h2>
            <Field label="Price (USD)" error={errors.price?.message} required>
              <Input {...register("price")} type="number" disabled={submitting} />
            </Field>
            <div className="flex items-center justify-between">
              <div>
                <p className="font-medium text-sm">Accept Offers</p>
                <p className="text-xs text-muted-foreground">Allow buyers to submit offers</p>
              </div>
              <Switch
                defaultChecked={!!listing.negotiable}
                onCheckedChange={(v) => setValue("negotiable", v)}
                disabled={submitting}
              />
            </div>
          </section>

          {/* Video */}
          <section className="glass-card rounded-lg p-4 space-y-4">
            <h2 className="font-display text-xl">Walk-Around Video</h2>
            <Field label="YouTube URL" error={errors.video_url?.message}>
              <Input {...register("video_url")} placeholder="https://youtube.com/watch?v=..." disabled={submitting} />
            </Field>
          </section>

          {/* Location */}
          <section className="glass-card rounded-lg p-4 space-y-4">
            <h2 className="font-display text-xl">Location</h2>
            <div className="grid grid-cols-2 gap-4">
              <Field label="City" error={errors.location_city?.message} required>
                <Input {...register("location_city")} disabled={submitting} />
              </Field>
              <Field label="State" error={errors.location_state?.message} required>
                <Select
                  defaultValue={listing.location_state ?? undefined}
                  onValueChange={(v: string | null) => setValue("location_state", v ?? "")}
                  disabled={submitting}
                >
                  <SelectTrigger><SelectValue>{stateLabel || undefined}</SelectValue></SelectTrigger>
                  <SelectContent>
                    {US_STATES.map((s) => (
                      <SelectItem key={s.value} value={s.value}>{s.label}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </Field>
            </div>
            <Field label="ZIP Code" error={errors.location_zip?.message} required>
              <Input {...register("location_zip")} maxLength={5} className="w-36" disabled={submitting} />
            </Field>
          </section>

          <div className="flex gap-3">
            <Link href="/dashboard" className="flex-1">
              <Button type="button" variant="outline" className="w-full" disabled={submitting}>
                Cancel
              </Button>
            </Link>
            <Button type="submit" className="flex-1 btn-racing gap-2" disabled={submitting}>
              {submitting ? (
                <><Loader2 className="w-4 h-4 animate-spin" /> Saving…</>
              ) : (
                "Save Changes"
              )}
            </Button>
          </div>
        </form>
      </div>
    </main>
  );
}
