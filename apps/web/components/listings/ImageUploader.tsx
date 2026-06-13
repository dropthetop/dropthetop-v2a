"use client";

import { useRef } from "react";
import { ImageIcon, X, Star } from "lucide-react";
import { Button } from "@/components/ui/button";

export interface UploadImage {
  key: string;
  url: string;
  file?: File;
  is_primary: boolean;
  existingId?: string;
  toDelete?: boolean;
}

interface Props {
  images: UploadImage[];
  onChange: (images: UploadImage[]) => void;
  maxImages?: number;
  disabled?: boolean;
}

export function ImageUploader({ images, onChange, maxImages = 20, disabled }: Props) {
  const inputRef = useRef<HTMLInputElement>(null);

  const visible = images.filter((img) => !img.toDelete);

  const handleFiles = (files: FileList | null) => {
    if (!files) return;
    const remaining = maxImages - visible.length;
    if (remaining <= 0) return;

    const added: UploadImage[] = Array.from(files)
      .slice(0, remaining)
      .map((file, i) => ({
        key: `new-${Date.now()}-${i}`,
        url: URL.createObjectURL(file),
        file,
        is_primary: visible.length === 0 && i === 0,
      }));

    onChange([...images, ...added]);
  };

  const setPrimary = (key: string) => {
    onChange(
      images.map((img) => ({
        ...img,
        is_primary: img.key === key,
      }))
    );
  };

  const remove = (key: string) => {
    const img = images.find((i) => i.key === key);
    if (!img) return;

    let next: UploadImage[];
    if (img.existingId) {
      // Mark existing DB image for deletion
      next = images.map((i) => (i.key === key ? { ...i, toDelete: true } : i));
    } else {
      // Remove new upload entirely
      URL.revokeObjectURL(img.url);
      next = images.filter((i) => i.key !== key);
    }

    // If we removed the primary, promote the first remaining visible
    const stillVisible = next.filter((i) => !i.toDelete);
    const hasPrimary = stillVisible.some((i) => i.is_primary);
    if (!hasPrimary && stillVisible.length > 0) {
      next = next.map((i) =>
        i.key === stillVisible[0].key ? { ...i, is_primary: true } : i
      );
    }

    onChange(next);
  };

  return (
    <div className="space-y-3">
      <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 gap-2">
        {visible.map((img) => (
          <div key={img.key} className="relative group aspect-[4/3] rounded-md overflow-hidden border border-border bg-muted">
            <img
              src={img.url}
              alt=""
              className="w-full h-full object-cover"
            />
            {/* Primary badge */}
            {img.is_primary && (
              <div className="absolute top-1 left-1 bg-primary text-primary-foreground text-[10px] font-semibold px-1.5 py-0.5 rounded">
                Primary
              </div>
            )}
            {/* Hover actions */}
            {!disabled && (
              <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-1.5">
                {!img.is_primary && (
                  <button
                    type="button"
                    onClick={() => setPrimary(img.key)}
                    title="Set as primary"
                    className="bg-background/90 hover:bg-background rounded-full p-1.5 transition-colors"
                  >
                    <Star className="w-3.5 h-3.5 text-amber-400" />
                  </button>
                )}
                <button
                  type="button"
                  onClick={() => remove(img.key)}
                  title="Remove"
                  className="bg-background/90 hover:bg-background rounded-full p-1.5 transition-colors"
                >
                  <X className="w-3.5 h-3.5 text-destructive" />
                </button>
              </div>
            )}
          </div>
        ))}

        {/* Upload button */}
        {!disabled && visible.length < maxImages && (
          <button
            type="button"
            onClick={() => inputRef.current?.click()}
            className="aspect-[4/3] rounded-md border-2 border-dashed border-border hover:border-primary/50 bg-muted/30 hover:bg-muted/50 flex flex-col items-center justify-center gap-1 transition-colors text-muted-foreground hover:text-foreground"
          >
            <ImageIcon className="w-5 h-5" />
            <span className="text-xs">Add Photos</span>
          </button>
        )}
      </div>

      <input
        ref={inputRef}
        type="file"
        accept="image/*"
        multiple
        className="hidden"
        onChange={(e) => handleFiles(e.target.files)}
        disabled={disabled}
      />

      <p className="text-xs text-muted-foreground">
        {visible.length}/{maxImages} photos — click a photo to set it as primary
      </p>
    </div>
  );
}
