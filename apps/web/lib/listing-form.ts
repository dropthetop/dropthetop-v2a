import { z } from "zod";

export const listingSchema = z.object({
  title: z
    .string()
    .trim()
    .min(10, "Title must be at least 10 characters")
    .max(100, "Title must be less than 100 characters"),
  price: z.coerce
    .number()
    .min(1000, "Price must be at least $1,000")
    .max(10000000, "Price seems too high"),
  year: z.coerce
    .number()
    .min(1953, "Year must be 1953 or later")
    .max(new Date().getFullYear() + 1, "Invalid year"),
  generation: z.string().min(1, "Please select a generation"),
  mileage: z.coerce.number().min(0, "Invalid").max(999999, "Invalid mileage"),
  transmission: z.string().min(1, "Required"),
  condition: z.string().min(1, "Required"),
  vehicle_condition: z.enum(["new", "used"]),
  used_type: z.string().nullable().optional(),
  model: z.string().nullable().optional(),
  body_style: z.string().nullable().optional(),
  engine: z.string().trim().min(1, "Required").max(100),
  exterior_color: z.string().trim().min(1, "Required").max(50),
  interior_color: z.string().trim().min(1, "Required").max(50),
  vin: z.string().optional().nullable(),
  description: z.string().trim().min(1, "Required").max(5000),
  location_city: z.string().trim().min(1, "Required").max(100),
  location_state: z.string().min(1, "Required"),
  location_zip: z.string().regex(/^\d{5}$/, "Must be 5 digits"),
  negotiable: z.boolean(),
  video_url: z.string().optional().nullable(),
});

export type ListingFormValues = z.infer<typeof listingSchema>;

export interface LookupItem {
  id: string;
  display_name: string;
}

export interface ListingLookups {
  transmissions: LookupItem[];
  conditions: LookupItem[];
  vehicle_conditions: LookupItem[];
  used_types: LookupItem[];
  body_styles: LookupItem[];
}

export interface ExistingImage {
  id: string;
  image_url: string;
  is_primary: boolean | null;
  display_order: number | null;
}
