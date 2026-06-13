"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { format } from "date-fns";
import {
  Star,
  MessageSquare,
  DollarSign,
  List,
  Plus,
  Edit,
  Eye,
  CheckCircle,
  XCircle,
  Clock,
  Send,
  Building2,
  Loader2,
  AlertCircle,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Textarea } from "@/components/ui/textarea";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { createClient } from "@/lib/supabase/client";
import { buildListingUrl } from "@dropthetop/shared";

// ─── helpers ─────────────────────────────────────────────────────────────────

function formatDisplayName(
  profile: { first_name: string | null; last_name: string | null } | null | undefined,
  fallback = "Unknown"
): string {
  if (!profile) return fallback;
  const parts = [profile.first_name, profile.last_name].filter(Boolean);
  return parts.length > 0 ? parts.join(" ") : fallback;
}

function formatPrice(p: number) {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    maximumFractionDigits: 0,
  }).format(p);
}

function formatDate(d: string) {
  return format(new Date(d), "MMM d, yyyy");
}

function formatStock(n: number) {
  return n.toString().padStart(5, "0");
}

function getPrimaryImage(images: { image_url: string; is_primary: boolean | null; display_order: number | null }[] | undefined | null): string | null {
  if (!images || images.length === 0) return null;
  const sorted = [...images].sort((a, b) => (a.display_order ?? 0) - (b.display_order ?? 0));
  return sorted.find((i) => i.is_primary)?.image_url ?? sorted[0]?.image_url ?? null;
}

function getListingStatus(listing: any): { label: string; color: string } {
  if (listing.is_sold) return { label: "Sold", color: "bg-red-600 text-white" };
  if (listing.is_bid_to) return { label: "Bid To", color: "bg-yellow-500 text-black" };
  if (listing.status === "approved") {
    if (listing.expiration_date && new Date(listing.expiration_date) < new Date()) {
      return { label: "Expired", color: "bg-muted text-muted-foreground" };
    }
    return { label: "Active", color: "bg-green-600 text-white" };
  }
  if (listing.status === "pending_new" || listing.status === "pending_edited") {
    return { label: "Pending Review", color: "bg-amber-500 text-black" };
  }
  if (listing.status === "rejected") return { label: "Rejected", color: "bg-destructive text-white" };
  return { label: listing.status ?? "Unknown", color: "bg-muted text-muted-foreground" };
}

const OFFER_STATUS_MAP: Record<string, { label: string; color: string }> = {
  pending: { label: "Pending", color: "bg-amber-500/20 text-amber-600 border-amber-500/30" },
  accepted: { label: "Accepted", color: "bg-green-500/20 text-green-600 border-green-500/30" },
  rejected: { label: "Declined", color: "bg-red-500/20 text-red-600 border-red-500/30" },
  countered: { label: "Countered", color: "bg-blue-500/20 text-blue-600 border-blue-500/30" },
};

// ─── types ─────────────────────────────────────────────────────────────────

interface Props {
  userId: string;
  profile: { first_name: string | null; last_name: string | null; is_dealer: boolean | null } | null;
  myListings: any[];
  favorites: any[];
  offersReceived: any[];
  myOffers: any[];
  messages: any[];
}

// ─── Offer Response Dialog ────────────────────────────────────────────────────

function OfferResponseDialog({
  offer,
  action,
  onClose,
  onDone,
}: {
  offer: any;
  action: "accept" | "reject";
  onClose: () => void;
  onDone: (offerId: string, newStatus: string) => void;
}) {
  const [message, setMessage] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      const supabase = createClient();
      const { error } = await supabase
        .from("offers")
        .update({
          status: action === "accept" ? "accepted" : "rejected",
          ...(action === "accept"
            ? { approval_message: message || null }
            : { rejection_reason: message || null }),
        })
        .eq("id", offer.id);

      if (error) throw error;

      // Fire-and-forget notification
      supabase.functions
        .invoke("notify-offer-response", {
          body: {
            offerId: offer.id,
            action,
            message: message || null,
          },
        })
        .catch(() => {});

      toast.success(action === "accept" ? "Offer accepted." : "Offer declined.");
      onDone(offer.id, action === "accept" ? "accepted" : "rejected");
      onClose();
    } catch {
      toast.error("Something went wrong. Please try again.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Dialog open onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="font-display text-xl">
            {action === "accept" ? "Accept Offer" : "Decline Offer"}
          </DialogTitle>
        </DialogHeader>
        <div className="mb-3 p-3 rounded-md bg-muted/50 text-sm">
          <p className="text-muted-foreground">Offer amount</p>
          <p className="font-display text-xl text-accent">{formatPrice(offer.amount)}</p>
          {offer.message && (
            <p className="text-muted-foreground mt-2 italic">"{offer.message}"</p>
          )}
        </div>
        <form onSubmit={handleSubmit} className="space-y-3">
          <Textarea
            placeholder={
              action === "accept"
                ? "Optional: add a note for the buyer..."
                : "Optional: reason for declining..."
            }
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            rows={3}
            className="resize-none bg-input border-border"
            maxLength={500}
          />
          <div className="flex gap-2">
            <Button type="button" variant="outline" className="flex-1" onClick={onClose}>
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={submitting}
              className={`flex-1 gap-2 ${action === "accept" ? "bg-green-600 hover:bg-green-700" : "bg-destructive hover:bg-destructive/90"} text-white`}
            >
              {submitting ? <Loader2 className="w-4 h-4 animate-spin" /> : null}
              {action === "accept" ? "Accept" : "Decline"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}

// ─── Reply Message Dialog ─────────────────────────────────────────────────────

function ReplyDialog({
  message,
  userId,
  onClose,
  onSent,
}: {
  message: any;
  userId: string;
  onClose: () => void;
  onSent: () => void;
}) {
  const [reply, setReply] = useState("");
  const [sending, setSending] = useState(false);

  const recipientId = message.sender_id === userId ? message.recipient_id : message.sender_id;

  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!reply.trim()) return;
    setSending(true);
    try {
      const supabase = createClient();
      const { error } = await supabase.from("messages").insert({
        sender_id: userId,
        recipient_id: recipientId,
        listing_id: message.listing_id,
        content: reply.trim(),
      });
      if (error) throw error;

      supabase.functions
        .invoke("notify-new-message", {
          body: {
            sellerId: recipientId,
            buyerId: userId,
            listingTitle: message.listings?.title ?? "",
            message: reply.trim(),
            siteUrl: window.location.origin,
          },
        })
        .catch(() => {});

      toast.success("Reply sent.");
      setReply("");
      onSent();
      onClose();
    } catch {
      toast.error("Failed to send reply. Please try again.");
    } finally {
      setSending(false);
    }
  };

  return (
    <Dialog open onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="font-display text-xl">Reply</DialogTitle>
        </DialogHeader>
        <div className="mb-3 p-3 rounded-md bg-muted/50 text-sm">
          <p className="text-muted-foreground text-xs mb-1">
            {message.listings?.title ?? "Unknown listing"}
          </p>
          <p className="text-foreground/80 italic">"{message.content}"</p>
        </div>
        <form onSubmit={handleSend} className="space-y-3">
          <Textarea
            placeholder="Your reply..."
            value={reply}
            onChange={(e) => setReply(e.target.value)}
            rows={4}
            className="resize-none bg-input border-border"
            maxLength={1000}
          />
          <div className="flex gap-2">
            <Button type="button" variant="outline" className="flex-1" onClick={onClose}>
              Cancel
            </Button>
            <Button type="submit" disabled={sending || !reply.trim()} className="flex-1 btn-racing gap-2">
              {sending ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
              Send
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}

// ─── main component ───────────────────────────────────────────────────────────

export function DashboardClient({
  userId,
  profile,
  myListings: initialListings,
  favorites: initialFavorites,
  offersReceived: initialOffersReceived,
  myOffers,
  messages: initialMessages,
}: Props) {
  const router = useRouter();
  const [myListings, setMyListings] = useState(initialListings);
  const [favorites, setFavorites] = useState(initialFavorites);
  const [offersReceived, setOffersReceived] = useState(initialOffersReceived);
  const [messages, setMessages] = useState(initialMessages);

  // Dialog state
  const [offerDialog, setOfferDialog] = useState<{ offer: any; action: "accept" | "reject" } | null>(null);
  const [replyDialog, setReplyDialog] = useState<any | null>(null);

  // Real-time messages
  useEffect(() => {
    const supabase = createClient();
    const channel = supabase
      .channel("dashboard-messages")
      .on(
        "postgres_changes",
        { event: "INSERT", schema: "public", table: "messages" },
        (payload) => {
          const msg = payload.new as any;
          if (msg.sender_id === userId || msg.recipient_id === userId) {
            router.refresh();
          }
        }
      )
      .subscribe();

    return () => { supabase.removeChannel(channel); };
  }, [userId, router]);

  const displayName = profile?.first_name
    ? `${profile.first_name}${profile.last_name ? ` ${profile.last_name}` : ""}`
    : "My Dashboard";

  // ── unfavorite ──────────────────────────────────────────────────────────────
  const removeFavorite = async (favId: string) => {
    const supabase = createClient();
    const { error } = await supabase.from("favorites").delete().eq("id", favId);
    if (!error) {
      setFavorites((prev) => prev.filter((f) => f.id !== favId));
      toast.success("Removed from favorites.");
    }
  };

  // ── offer response ──────────────────────────────────────────────────────────
  const handleOfferResponseDone = (offerId: string, newStatus: string) => {
    setOffersReceived((prev) =>
      prev.map((o) => (o.id === offerId ? { ...o, status: newStatus } : o))
    );
  };

  return (
    <>
      {/* Dialogs */}
      {offerDialog && (
        <OfferResponseDialog
          offer={offerDialog.offer}
          action={offerDialog.action}
          onClose={() => setOfferDialog(null)}
          onDone={handleOfferResponseDone}
        />
      )}
      {replyDialog && (
        <ReplyDialog
          message={replyDialog}
          userId={userId}
          onClose={() => setReplyDialog(null)}
          onSent={() => router.refresh()}
        />
      )}

      <main style={{ paddingTop: "calc(5rem + var(--safe-area-top, 0px))" }}>
        <div className="container mx-auto px-4 pb-12 max-w-5xl">
          {/* Header */}
          <div className="flex items-center justify-between mb-6">
            <div>
              <h1 className="font-display text-3xl md:text-4xl">{displayName}</h1>
              {profile?.is_dealer && (
                <div className="flex items-center gap-1.5 mt-1 text-muted-foreground text-sm">
                  <Building2 className="w-4 h-4" />
                  Dealer Account
                </div>
              )}
            </div>
            <Link href="/dashboard/listings/new">
              <Button className="btn-racing gap-2">
                <Plus className="w-4 h-4" />
                <span className="hidden sm:inline">New Listing</span>
                <span className="sm:hidden">List</span>
              </Button>
            </Link>
          </div>

          <Tabs defaultValue="listings">
            <TabsList className="w-full grid grid-cols-5 mb-6">
              <TabsTrigger value="listings" className="gap-1 text-xs sm:text-sm">
                <List className="w-3.5 h-3.5 hidden sm:block" />
                Listings
                {myListings.length > 0 && (
                  <span className="ml-1 text-xs opacity-70">({myListings.length})</span>
                )}
              </TabsTrigger>
              <TabsTrigger value="favorites" className="gap-1 text-xs sm:text-sm">
                <Star className="w-3.5 h-3.5 hidden sm:block" />
                Saved
                {favorites.length > 0 && (
                  <span className="ml-1 text-xs opacity-70">({favorites.length})</span>
                )}
              </TabsTrigger>
              <TabsTrigger value="offers-received" className="gap-1 text-xs sm:text-sm">
                <DollarSign className="w-3.5 h-3.5 hidden sm:block" />
                Offers
                {offersReceived.filter((o) => o.status === "pending").length > 0 && (
                  <span className="ml-1 text-xs bg-primary text-primary-foreground rounded-full px-1.5">
                    {offersReceived.filter((o) => o.status === "pending").length}
                  </span>
                )}
              </TabsTrigger>
              <TabsTrigger value="my-offers" className="gap-1 text-xs sm:text-sm">
                <DollarSign className="w-3.5 h-3.5 hidden sm:block" />
                My Offers
              </TabsTrigger>
              <TabsTrigger value="messages" className="gap-1 text-xs sm:text-sm">
                <MessageSquare className="w-3.5 h-3.5 hidden sm:block" />
                Messages
                {messages.filter((m) => m.recipient_id === userId && !m.read_at).length > 0 && (
                  <span className="ml-1 text-xs bg-primary text-primary-foreground rounded-full px-1.5">
                    {messages.filter((m) => m.recipient_id === userId && !m.read_at).length}
                  </span>
                )}
              </TabsTrigger>
            </TabsList>

            {/* ── My Listings ────────────────────────────────────────────── */}
            <TabsContent value="listings">
              {myListings.length === 0 ? (
                <div className="text-center py-16 text-muted-foreground">
                  <List className="w-12 h-12 mx-auto mb-3 opacity-30" />
                  <p className="mb-4">You haven&apos;t listed any vehicles yet.</p>
                  <Link href="/dashboard/listings/new">
                    <Button className="btn-racing gap-2">
                      <Plus className="w-4 h-4" /> Create Your First Listing
                    </Button>
                  </Link>
                </div>
              ) : (
                <div className="space-y-3">
                  {myListings.map((listing) => {
                    const status = getListingStatus(listing);
                    const img = getPrimaryImage(listing.listing_images);
                    const listingPath = listing.stock_number
                      ? buildListingUrl(listing.stock_number, listing.year, listing.generation, listing.title)
                      : null;

                    return (
                      <div key={listing.id} className="glass-card rounded-lg p-3 flex gap-3 items-start">
                        {/* Thumbnail */}
                        <div className="w-20 h-16 rounded-md overflow-hidden bg-muted flex-shrink-0">
                          {img ? (
                            <img src={img} alt={listing.title} className="w-full h-full object-cover" />
                          ) : (
                            <div className="w-full h-full bg-muted" />
                          )}
                        </div>

                        <div className="flex-1 min-w-0">
                          <div className="flex items-start justify-between gap-2">
                            <div className="min-w-0">
                              <p className="font-semibold truncate text-sm">{listing.title}</p>
                              <div className="flex items-center gap-2 mt-0.5 flex-wrap">
                                <span
                                  className={`text-xs font-semibold px-2 py-0.5 rounded ${status.color}`}
                                >
                                  {status.label}
                                </span>
                                {listing.stock_number && (
                                  <span className="text-xs text-muted-foreground">
                                    #{formatStock(listing.stock_number)}
                                  </span>
                                )}
                                <span className="text-xs text-muted-foreground">
                                  {formatDate(listing.created_at)}
                                </span>
                              </div>
                              {listing.status === "rejected" && listing.rejection_reason && (
                                <p className="text-xs text-destructive mt-1 flex items-start gap-1">
                                  <AlertCircle className="w-3 h-3 mt-0.5 flex-shrink-0" />
                                  {listing.rejection_reason}
                                </p>
                              )}
                            </div>
                            <div className="flex gap-1.5 flex-shrink-0">
                              {listingPath && (
                                <Link href={`${listingPath}?from=dashboard`}>
                                  <Button variant="outline" size="icon" className="h-8 w-8" title="View listing">
                                    <Eye className="w-3.5 h-3.5" />
                                  </Button>
                                </Link>
                              )}
                              <Link href={`/dashboard/listings/${listing.stock_number}/edit`}>
                                <Button variant="outline" size="icon" className="h-8 w-8" title="Edit listing">
                                  <Edit className="w-3.5 h-3.5" />
                                </Button>
                              </Link>
                            </div>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </TabsContent>

            {/* ── Favorites ──────────────────────────────────────────────── */}
            <TabsContent value="favorites">
              {favorites.length === 0 ? (
                <div className="text-center py-16 text-muted-foreground">
                  <Star className="w-12 h-12 mx-auto mb-3 opacity-30" />
                  <p>No saved listings yet.</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {favorites.map((fav) => {
                    const listing = fav.listings;
                    if (!listing) return null;
                    const img = getPrimaryImage(listing.listing_images);
                    const listingPath = listing.stock_number
                      ? buildListingUrl(listing.stock_number, listing.year, listing.generation, listing.title)
                      : null;

                    return (
                      <div key={fav.id} className="glass-card rounded-lg p-3 flex gap-3 items-center">
                        <div className="w-20 h-16 rounded-md overflow-hidden bg-muted flex-shrink-0">
                          {img && <img src={img} alt={listing.title} className="w-full h-full object-cover" />}
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="font-semibold truncate text-sm">{listing.title}</p>
                          <div className="flex items-center gap-2 mt-0.5">
                            <span className="text-muted-foreground text-sm">
                              {formatPrice(listing.price)}
                            </span>
                            {listing.is_sold && (
                              <span className="text-xs bg-red-600 text-white px-2 py-0.5 rounded font-semibold">Sold</span>
                            )}
                          </div>
                        </div>
                        <div className="flex gap-1.5 flex-shrink-0">
                          {listingPath && (
                            <Link href={listingPath}>
                              <Button variant="outline" size="icon" className="h-8 w-8">
                                <Eye className="w-3.5 h-3.5" />
                              </Button>
                            </Link>
                          )}
                          <Button
                            variant="outline"
                            size="icon"
                            className="h-8 w-8 text-muted-foreground hover:text-destructive"
                            onClick={() => removeFavorite(fav.id)}
                          >
                            <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
                          </Button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </TabsContent>

            {/* ── Offers Received ────────────────────────────────────────── */}
            <TabsContent value="offers-received">
              {offersReceived.length === 0 ? (
                <div className="text-center py-16 text-muted-foreground">
                  <DollarSign className="w-12 h-12 mx-auto mb-3 opacity-30" />
                  <p>No offers received yet.</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {offersReceived.map((offer) => {
                    const listing = offer.listings;
                    const statusInfo = OFFER_STATUS_MAP[offer.status] ?? OFFER_STATUS_MAP.pending;
                    return (
                      <div key={offer.id} className="glass-card rounded-lg p-4">
                        <div className="flex items-start justify-between gap-3">
                          <div className="flex-1 min-w-0">
                            <p className="text-xs text-muted-foreground mb-0.5">{listing?.title ?? "Unknown listing"}</p>
                            <p className="font-display text-2xl text-accent">{formatPrice(offer.amount)}</p>
                            <p className="text-xs text-muted-foreground mt-0.5">
                              From: <span className="font-medium text-foreground/80">{formatDisplayName(offer.buyer_profile)}</span>
                            </p>
                            {offer.message && (
                              <p className="text-muted-foreground text-sm mt-1 italic">"{offer.message}"</p>
                            )}
                            <p className="text-xs text-muted-foreground mt-1">
                              {formatDate(offer.created_at)}
                            </p>
                          </div>
                          <span className={`text-xs font-semibold px-2 py-1 rounded border ${statusInfo.color} flex-shrink-0`}>
                            {statusInfo.label}
                          </span>
                        </div>

                        {offer.status === "pending" && (
                          <div className="flex gap-2 mt-3 pt-3 border-t border-border">
                            <Button
                              size="sm"
                              className="flex-1 gap-1.5 bg-green-600 hover:bg-green-700 text-white"
                              onClick={() => setOfferDialog({ offer, action: "accept" })}
                            >
                              <CheckCircle className="w-3.5 h-3.5" /> Accept
                            </Button>
                            <Button
                              size="sm"
                              variant="outline"
                              className="flex-1 gap-1.5 text-destructive border-destructive/30 hover:bg-destructive/10"
                              onClick={() => setOfferDialog({ offer, action: "reject" })}
                            >
                              <XCircle className="w-3.5 h-3.5" /> Decline
                            </Button>
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              )}
            </TabsContent>

            {/* ── My Offers ──────────────────────────────────────────────── */}
            <TabsContent value="my-offers">
              {myOffers.length === 0 ? (
                <div className="text-center py-16 text-muted-foreground">
                  <DollarSign className="w-12 h-12 mx-auto mb-3 opacity-30" />
                  <p>You haven&apos;t made any offers yet.</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {myOffers.map((offer) => {
                    const listing = offer.listings;
                    const img = getPrimaryImage(listing?.listing_images);
                    const listingPath =
                      listing?.stock_number
                        ? buildListingUrl(listing.stock_number, listing.year ?? 0, "", listing.title)
                        : null;
                    const statusInfo = OFFER_STATUS_MAP[offer.status] ?? OFFER_STATUS_MAP.pending;

                    return (
                      <div key={offer.id} className="glass-card rounded-lg p-3 flex gap-3">
                        {img && (
                          <div className="w-16 h-14 rounded-md overflow-hidden bg-muted flex-shrink-0">
                            <img src={img} alt="" className="w-full h-full object-cover" />
                          </div>
                        )}
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-semibold truncate">{listing?.title ?? "Unknown listing"}</p>
                          <p className="text-xs text-muted-foreground mt-0.5">
                            To: <span className="font-medium text-foreground/80">{formatDisplayName(offer.seller_profile)}</span>
                          </p>
                          <div className="flex items-center gap-2 mt-0.5 flex-wrap">
                            <span className="text-accent font-semibold text-sm">{formatPrice(offer.amount)}</span>
                            <span className={`text-xs px-2 py-0.5 rounded border ${statusInfo.color}`}>
                              {statusInfo.label}
                            </span>
                          </div>
                          {offer.status === "accepted" && offer.approval_message && (
                            <p className="text-xs text-green-600 mt-1">"{offer.approval_message}"</p>
                          )}
                          {offer.status === "rejected" && offer.rejection_reason && (
                            <p className="text-xs text-muted-foreground mt-1">"{offer.rejection_reason}"</p>
                          )}
                          <p className="text-xs text-muted-foreground mt-0.5">{formatDate(offer.created_at)}</p>
                        </div>
                        {listingPath && (
                          <Link href={listingPath} className="flex-shrink-0">
                            <Button variant="outline" size="icon" className="h-8 w-8">
                              <Eye className="w-3.5 h-3.5" />
                            </Button>
                          </Link>
                        )}
                      </div>
                    );
                  })}
                </div>
              )}
            </TabsContent>

            {/* ── Messages ───────────────────────────────────────────────── */}
            <TabsContent value="messages">
              {messages.length === 0 ? (
                <div className="text-center py-16 text-muted-foreground">
                  <MessageSquare className="w-12 h-12 mx-auto mb-3 opacity-30" />
                  <p>No messages yet.</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {messages.map((msg) => {
                    const isReceived = msg.recipient_id === userId;
                    const isUnread = isReceived && !msg.read_at;

                    return (
                      <div
                        key={msg.id}
                        className={`glass-card rounded-lg p-4 ${isUnread ? "border-primary/40 border" : ""}`}
                      >
                        <div className="flex items-start justify-between gap-3">
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2 mb-1 flex-wrap">
                              <span className={`text-xs font-semibold px-2 py-0.5 rounded ${isReceived ? "bg-primary/20 text-primary" : "bg-muted text-muted-foreground"}`}>
                                {isReceived ? "Received" : "Sent"}
                              </span>
                              {isUnread && (
                                <span className="text-xs bg-primary text-primary-foreground px-2 py-0.5 rounded font-semibold">
                                  New
                                </span>
                              )}
                              <span className="text-xs text-muted-foreground">
                                {isReceived
                                  ? formatDisplayName(msg.sender_profile)
                                  : `To: ${formatDisplayName(msg.recipient_profile)}`}
                              </span>
                              <span className="text-xs text-muted-foreground">
                                {formatDate(msg.created_at)}
                              </span>
                            </div>
                            {msg.listings?.title && (
                              <p className="text-xs text-muted-foreground mb-1">
                                Re: {msg.listings.title}
                              </p>
                            )}
                            <p className="text-sm text-foreground/80">{msg.content}</p>
                          </div>
                          {isReceived && (
                            <Button
                              size="sm"
                              variant="outline"
                              className="flex-shrink-0 gap-1.5"
                              onClick={() => setReplyDialog(msg)}
                            >
                              <Send className="w-3.5 h-3.5" />
                              <span className="hidden sm:inline">Reply</span>
                            </Button>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </TabsContent>
          </Tabs>
        </div>
      </main>
    </>
  );
}
