"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Loader2, Send, LogIn, ShieldAlert } from "lucide-react";
import { z } from "zod";
import { useAuth } from "@/contexts/AuthContext";
import { createClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

const messageSchema = z.object({
  content: z
    .string()
    .trim()
    .min(10, { message: "Message must be at least 10 characters" })
    .max(1000, { message: "Message must be less than 1000 characters" }),
});

interface Props {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  listingId: string;
  sellerId: string;
  listingTitle: string;
}

export function ContactSellerDialog({
  open,
  onOpenChange,
  listingId,
  sellerId,
  listingTitle,
}: Props) {
  const { user } = useAuth();
  const router = useRouter();
  const [message, setMessage] = useState("");
  const [sending, setSending] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const isVerified = !!user?.email_confirmed_at;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    const result = messageSchema.safeParse({ content: message });
    if (!result.success) {
      setError(result.error.errors[0].message);
      return;
    }
    if (!user) return;

    setSending(true);
    try {
      const supabase = createClient();
      const { error: insertError } = await supabase.from("messages").insert({
        sender_id: user.id,
        recipient_id: sellerId,
        listing_id: listingId,
        content: result.data.content,
      });
      if (insertError) throw insertError;

      supabase.functions
        .invoke("notify-new-message", {
          body: {
            sellerId,
            buyerId: user.id,
            listingTitle,
            message: result.data.content,
            siteUrl: window.location.origin,
          },
        })
        .catch(() => {});

      toast.success("Your message has been sent to the seller.");
      setMessage("");
      onOpenChange(false);
    } catch {
      toast.error("Failed to send message. Please try again.");
    } finally {
      setSending(false);
    }
  };

  function renderContent() {
    if (!user) {
      return (
        <div className="space-y-4">
          <p className="text-muted-foreground">
            Create an account to send a message about this {listingTitle}.
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
                Please verify your email to contact sellers.
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

    return (
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="space-y-2">
          <Label
            htmlFor="contact-message"
            className="text-sm uppercase tracking-wider text-muted-foreground"
          >
            Your Message
          </Label>
          <Textarea
            id="contact-message"
            placeholder={`Hi, I'm interested in your ${listingTitle}. Is it still available?`}
            value={message}
            onChange={(e) => {
              setMessage(e.target.value);
              setError(null);
            }}
            rows={4}
            className="resize-none bg-input border-border"
            maxLength={1000}
          />
          <div className="flex justify-between text-xs text-muted-foreground">
            {error ? (
              <span className="text-destructive">{error}</span>
            ) : (
              <span>Introduce yourself and ask questions about the vehicle</span>
            )}
            <span>{message.length}/1000</span>
          </div>
        </div>

        <Button type="submit" className="w-full btn-racing gap-2" disabled={sending}>
          {sending ? (
            <>
              <Loader2 className="w-4 h-4 animate-spin" />
              Sending...
            </>
          ) : (
            <>
              <Send className="w-4 h-4" />
              Send Message
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
          <DialogTitle className="font-display text-xl">Contact Seller</DialogTitle>
        </DialogHeader>
        {renderContent()}
      </DialogContent>
    </Dialog>
  );
}
