"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";
import { ArrowLeft, Loader2, ShieldAlert } from "lucide-react";
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
import { useAuth } from "@/contexts/AuthContext";
import { generations, US_STATES } from "@dropthetop/shared";
import { listingSchema, type ListingFormValues, type ListingLookups } from "@/lib/listing-form";

interface Props {
  userId: string;
  lookups: ListingLookups;
}

export function CreateListingClient({ userId, lookups }: Props) {
  const router = useRouter();
  const { user } = useAuth();
  const isVerified = !!user?.email_confirmed_at;

  const [images, setImages] = useState<UploadImage[]>([]);
  const [submitting, setSubmitting] = useState(false);
  const [corvetteModels, setCorvetteModels] = useState<{ id: string; model_name: string }[]>([]);

  const {
    register,
    handleSubmit,
    watch,
    setValue,
    formState: { errors },
  } = useForm<ListingFormValues>({
    resolver: zodResolver(listingSchema),
    defaultValues: {
      negotiable: true,
      vehicle_condition: "used",
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
    if (images.filter((i) => !i.toDelete).length === 0) {
      toast.error("Please add at least one photo.");
      return;
    }

    setSubmitting(true);
    const supabase = createClient();

    try {
      // 1. Create listing
      const { data: listing, error: insertError } = await supabase
        .from("listings")
        .insert({
          seller_id: userId,
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
          status: "pending_new",
        })
        .select("id")
        .single();

      if (insertError || !listing) throw insertError ?? new Error("Failed to create listing");

      // 2. Upload images
      const uploadedImages: { url: string; is_primary: boolean; order: number }[] = [];
      const visibleImages = images.filter((i) => !i.toDelete);

      for (let i = 0; i < visibleImages.length; i++) {
        const img = visibleImages[i];
        if (!img.file) continue;

        const ext = img.file.name.split(".").pop() ?? "jpg";
        const path = `${listing.id}/${Date.now()}-${i}.${ext}`;

        const { error: uploadError } = await supabase.storage
          .from("listing-images")
          .upload(path, img.file, { upsert: false });

        if (uploadError) {
          toast.error(`Failed to upload photo ${i + 1}. Continuing…`);
          continue;
        }

        const { data: urlData } = supabase.storage.from("listing-images").getPublicUrl(path);
        uploadedImages.push({
          url: urlData.publicUrl,
          is_primary: img.is_primary,
          order: i,
        });
      }

      // 3. Insert image records
      if (uploadedImages.length > 0) {
        await supabase.from("listing_images").insert(
          uploadedImages.map((img) => ({
            listing_id: listing.id,
            image_url: img.url,
            is_primary: img.is_primary,
            display_order: img.order,
          }))
        );
      }

      toast.success("Listing submitted for review!");
      router.push("/dashboard");
    } catch (err) {
      console.error(err);
      toast.error("Failed to create listing. Please try again.");
    } finally {
      setSubmitting(false);
    }
  };

  if (!isVerified && user !== null) {
    return (
      <main style={{ paddingTop: "calc(5rem + var(--safe-area-top, 0px))" }}>
        <div className="container mx-auto px-4 py-8 max-w-2xl">
          <div className="glass-card rounded-lg p-8 text-center space-y-4">
            <ShieldAlert className="w-12 h-12 text-amber-500 mx-auto" />
            <h2 className="font-display text-2xl">Email Verification Required</h2>
            <p className="text-muted-foreground">
              Please verify your email address before creating a listing.
            </p>
            <Link href="/profile">
              <Button className="btn-racing">Go to Profile to Verify</Button>
            </Link>
          </div>
        </div>
      </main>
    );
  }

  return (
    <main style={{ paddingTop: "calc(5rem + var(--safe-area-top, 0px))" }}>
      <div className="container mx-auto px-4 pb-12 max-w-2xl">
        <div className="flex items-center gap-3 mb-6">
          <Link href="/dashboard" className="text-muted-foreground hover:text-foreground transition-colors">
            <ArrowLeft className="w-5 h-5" />
          </Link>
          <h1 className="font-display text-3xl">Create Listing</h1>
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
              <Input {...register("title")} placeholder="e.g. 2020 Corvette C8 Stingray Coupe" disabled={submitting} />
            </Field>

            <div className="grid grid-cols-2 gap-4">
              <Field label="Year" error={errors.year?.message} required>
                <Input {...register("year")} type="number" placeholder="2020" disabled={submitting} />
              </Field>
              <Field label="Generation" error={errors.generation?.message} required>
                <Select onValueChange={(v: string | null) => { setValue("generation", v ?? ""); setValue("model", null); }} disabled={submitting}>
                  <SelectTrigger><SelectValue placeholder="Select…">{generationLabel || undefined}</SelectValue></SelectTrigger>
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
                <Select onValueChange={(v: string | null) => setValue("model", v)} disabled={submitting}>
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
                <Select onValueChange={(v: string | null) => setValue("body_style", v)} disabled={submitting}>
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
                <Input {...register("mileage")} type="number" placeholder="25000" disabled={submitting} />
              </Field>
              <Field label="Transmission" error={errors.transmission?.message} required>
                <Select onValueChange={(v: string | null) => setValue("transmission", v ?? "")} disabled={submitting}>
                  <SelectTrigger><SelectValue placeholder="Select…" /></SelectTrigger>
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
                <Select onValueChange={(v: string | null) => setValue("condition", v ?? "")} disabled={submitting}>
                  <SelectTrigger><SelectValue placeholder="Select…" /></SelectTrigger>
                  <SelectContent>
                    {lookups.conditions.map((c) => (
                      <SelectItem key={c.id} value={c.display_name}>{c.display_name}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </Field>
              <Field label="New / Used" error={errors.vehicle_condition?.message} required>
                <Select defaultValue="used" onValueChange={(v: string | null) => setValue("vehicle_condition", (v ?? "used") as "new" | "used")} disabled={submitting}>
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
                <Select onValueChange={(v: string | null) => setValue("used_type", v)} disabled={submitting}>
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
              <Input {...register("engine")} placeholder="e.g. 6.2L V8 LT1" disabled={submitting} />
            </Field>

            <div className="grid grid-cols-2 gap-4">
              <Field label="Exterior Color" error={errors.exterior_color?.message} required>
                <Input {...register("exterior_color")} placeholder="e.g. Torch Red" disabled={submitting} />
              </Field>
              <Field label="Interior Color" error={errors.interior_color?.message} required>
                <Input {...register("interior_color")} placeholder="e.g. Jet Black" disabled={submitting} />
              </Field>
            </div>

            <Field label="VIN" error={errors.vin?.message}>
              <Input
                {...register("vin")}
                placeholder="17-character VIN"
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
              <Textarea {...register("description")} rows={5} placeholder="Describe the vehicle, its history, modifications, and condition…" className="resize-none" disabled={submitting} />
            </Field>
          </section>

          {/* Pricing */}
          <section className="glass-card rounded-lg p-4 space-y-4">
            <h2 className="font-display text-xl">Pricing</h2>
            <Field label="Price (USD)" error={errors.price?.message} required>
              <Input {...register("price")} type="number" placeholder="45000" disabled={submitting} />
            </Field>
            <div className="flex items-center justify-between">
              <div>
                <p className="font-medium text-sm">Accept Offers</p>
                <p className="text-xs text-muted-foreground">Allow buyers to submit offers below your asking price</p>
              </div>
              <Switch
                defaultChecked
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
                <Input {...register("location_city")} placeholder="Nashville" disabled={submitting} />
              </Field>
              <Field label="State" error={errors.location_state?.message} required>
                <Select onValueChange={(v: string | null) => setValue("location_state", v ?? "")} disabled={submitting}>
                  <SelectTrigger><SelectValue placeholder="Select…">{stateLabel || undefined}</SelectValue></SelectTrigger>
                  <SelectContent>
                    {US_STATES.map((s) => (
                      <SelectItem key={s.value} value={s.value}>{s.label}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </Field>
            </div>
            <Field label="ZIP Code" error={errors.location_zip?.message} required>
              <Input {...register("location_zip")} placeholder="37201" maxLength={5} className="w-36" disabled={submitting} />
            </Field>
          </section>

          {/* Submit */}
          <div className="flex gap-3">
            <Link href="/dashboard" className="flex-1">
              <Button type="button" variant="outline" className="w-full" disabled={submitting}>
                Cancel
              </Button>
            </Link>
            <Button type="submit" className="flex-1 btn-racing gap-2" disabled={submitting}>
              {submitting ? (
                <><Loader2 className="w-4 h-4 animate-spin" /> Submitting…</>
              ) : (
                "Submit for Review"
              )}
            </Button>
          </div>
        </form>
      </div>
    </main>
  );
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
