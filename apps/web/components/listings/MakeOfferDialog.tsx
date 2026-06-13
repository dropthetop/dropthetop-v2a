"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import {
  Loader2,
  DollarSign,
  LogIn,
  Clock,
  MessageSquare,
  ShieldAlert,
} from "lucide-react";
import { z } from "zod";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { useAuth } from "@/contexts/AuthContext";
import { createClient } from "@/lib/supabase/client";

const offerSchema = z.object({
  amount: z.number().min(100, "Offer must be at least $100"),
  message: z.string().max(500, "Message must be less than 500 characters").optional(),
});

interface PendingOffer {
  id: string;
  amount: number;
  message: string | null;
  created_at: string | null;
  status: string | null;
}

interface Props {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  listingId: string;
  sellerId: string;
  listingTitle: string;
  askingPrice: number;
  onPendingOfferChange?: (pendingOffer: { hasPending: boolean; amount?: number }) => void;
}

function formatPrice(price: number) {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    maximumFractionDigits: 0,
  }).format(price);
}

function formatDate(dateString: string) {
  return new Date(dateString).toLocaleDateString("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
    hour: "numeric",
    minute: "2-digit",
  });
}

export function MakeOfferDialog({
  open,
  onOpenChange,
  listingId,
  sellerId,
  listingTitle,
  askingPrice,
  onPendingOfferChange,
}: Props) {
  const { user } = useAuth();
  const router = useRouter();
  const [amount, setAmount] = useState<number | "">("");
  const [message, setMessage] = useState("");
  const [sending, setSending] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [pendingOffer, setPendingOffer] = useState<PendingOffer | null>(null);
  const [loadingOffer, setLoadingOffer] = useState(false);

  const isVerified = !!user?.email_confirmed_at;

  // Fetch pending offer when dialog opens and user is signed in
  useEffect(() => {
    if (!open || !user) {
      if (!user) onPendingOfferChange?.({ hasPending: false });
      return;
    }

    let cancelled = false;
    setLoadingOffer(true);

    const supabase = createClient();
    supabase
      .from("offers")
      .select("id, amount, message, created_at, status")
      .eq("listing_id", listingId)
      .eq("buyer_id", user.id)
      .eq("status", "pending")
      .maybeSingle()
      .then(({ data, error }) => {
        if (cancelled) return;
        if (!error) {
          setPendingOffer(data);
          onPendingOfferChange?.({ hasPending: !!data, amount: data?.amount });
        }
        setLoadingOffer(false);
      });

    return () => { cancelled = true; };
  }, [open, user, listingId]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    const result = offerSchema.safeParse({ amount, message: message || undefined });
    if (!result.success) {
      setError(result.error.errors[0].message);
      return;
    }
    if (!user) return;

    setSending(true);
    try {
      const supabase = createClient();
      const { data: newOffer, error: insertError } = await supabase
        .from("offers")
        .insert({
          buyer_id: user.id,
          listing_id: listingId,
          amount: result.data.amount,
          message: result.data.message || null,
          status: "pending",
        })
        .select("id, amount, message, created_at, status")
        .single();

      if (insertError) {
        if (insertError.code === "23505") {
          throw new Error("You already have a pending offer on this listing.");
        }
        throw insertError;
      }

      // Fetch buyer name for notification
      const { data: buyerProfile } = await supabase
        .from("profiles")
        .select("first_name")
        .eq("id", user.id)
        .single();

      supabase.functions
        .invoke("notify-new-offer", {
          body: {
            sellerId,
            buyerName: buyerProfile?.first_name || "A buyer",
            listingTitle,
            askingPrice,
            offerAmount: result.data.amount,
            offerMessage: result.data.message,
          },
        })
        .catch(() => {});

      toast.success(`Your offer of ${formatPrice(result.data.amount)} has been sent.`);

      setPendingOffer(newOffer);
      onPendingOfferChange?.({ hasPending: true, amount: newOffer.amount });
      setAmount("");
      setMessage("");
      onOpenChange(false);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Failed to submit offer. Please try again.";
      toast.error(msg);
    } finally {
      setSending(false);
    }
  };

  function renderContent() {
    if (!user) {
      return (
        <div className="space-y-4">
          <p className="text-muted-foreground">
            Create an account to make an offer on this listing.
          </p>
          <Button onClick={() => router.push("/auth")} className="w-full gap-2">
            <LogIn className="w-4 h-4" />
            Create an Account
          </Button>
        </div>
      );
    }

    if (!isVerified) {
      return (
        <div className="space-y-4">
          <div className="flex items-start gap-3 p-4 bg-amber-500/10 border border-amber-500/30 rounded-lg">
            <ShieldAlert className="w-5 h-5 text-amber-500 mt-0.5 flex-shrink-0" />
            <div>
              <p className="font-medium text-amber-500">Email verification required</p>
              <p className="text-muted-foreground text-sm mt-1">
                Please verify your email to make offers on listings.
              </p>
            </div>
          </div>
          <Button
            onClick={() => {
              onOpenChange(false);
              router.push("/profile");
            }}
            className="w-full gap-2"
          >
            <ShieldAlert className="w-4 h-4" />
            Verify Email
          </Button>
        </div>
      );
    }

    if (loadingOffer) {
      return (
        <div className="flex items-center justify-center py-8">
          <Loader2 className="w-6 h-6 animate-spin text-primary" />
        </div>
      );
    }

    if (pendingOffer) {
      return (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <span className="text-muted-foreground">Your Offer Status</span>
            <Badge variant="secondary" className="gap-1">
              <Clock className="w-3 h-3" />
              Pending
            </Badge>
          </div>

          <div className="bg-muted/50 rounded-lg p-4">
            <p className="text-muted-foreground text-sm mb-1">Offer Amount</p>
            <p className="font-display text-2xl text-accent">
              {formatPrice(pendingOffer.amount)}
            </p>
          </div>

          <div>
            <p className="text-muted-foreground text-sm mb-1 flex items-center gap-1">
              <Clock className="w-3 h-3" />
              Submitted
            </p>
            <p className="text-foreground">
              {pendingOffer.created_at ? formatDate(pendingOffer.created_at) : "—"}
            </p>
          </div>

          {pendingOffer.message && (
            <div>
              <p className="text-muted-foreground text-sm mb-1 flex items-center gap-1">
                <MessageSquare className="w-3 h-3" />
                Your Message
              </p>
              <p className="text-foreground/80 italic">"{pendingOffer.message}"</p>
            </div>
          )}

          <p className="text-muted-foreground text-sm pt-2 border-t border-border">
            You&apos;ll be notified when the seller responds to your offer.
          </p>
        </div>
      );
    }

    return (
      <form onSubmit={handleSubmit} className="space-y-4">
        <p className="text-muted-foreground text-sm">
          Asking price:{" "}
          <span className="text-accent font-semibold">{formatPrice(askingPrice)}</span>
        </p>

        <div className="space-y-2">
          <Label htmlFor="offer-amount">Your Offer (USD)</Label>
          <div className="relative">
            <DollarSign className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input
              id="offer-amount"
              type="number"
              placeholder="Enter your offer"
              value={amount}
              onChange={(e) => {
                setAmount(e.target.value ? parseInt(e.target.value) : "");
                setError(null);
              }}
              className="pl-10 bg-input border-border"
            />
          </div>
          {error && <p className="text-destructive text-sm">{error}</p>}
        </div>

        <div className="space-y-2">
          <Label htmlFor="offer-message">Message (Optional)</Label>
          <Textarea
            id="offer-message"
            placeholder="Add a message to the seller..."
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            rows={3}
            className="resize-none bg-input border-border"
            maxLength={500}
          />
          <p className="text-muted-foreground text-xs text-right">{message.length}/500</p>
        </div>

        <Button type="submit" className="w-full btn-racing gap-2" disabled={sending}>
          {sending ? (
            <>
              <Loader2 className="w-4 h-4 animate-spin" />
              Submitting...
            </>
          ) : (
            <>
              <DollarSign className="w-4 h-4" />
              Submit Offer
            </>
          )}
        </Button>
      </form>
    );
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="font-display text-xl">
            {pendingOffer ? "Your Offer" : "Make an Offer"}
          </DialogTitle>
        </DialogHeader>
        {renderContent()}
      </DialogContent>
    </Dialog>
  );
}
