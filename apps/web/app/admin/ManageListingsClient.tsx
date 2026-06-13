"use client";

import { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { format } from "date-fns";
import {
  Loader2, Clock, CheckCircle, XCircle, AlertTriangle, Star, Trash2,
  Eye, Search, Pencil, ChevronDown, ChevronUp, ImageIcon, Calendar,
  Plus,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Dialog, DialogContent, DialogDescription, DialogFooter,
  DialogHeader, DialogTitle,
} from "@/components/ui/dialog";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";
import { Calendar as CalendarComponent } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { createClient } from "@/lib/supabase/client";
import { buildListingUrl } from "@dropthetop/shared";
import { ListingHistoryTable } from "@/components/admin/ListingHistoryTable";
import { ListingChangesDialog } from "@/components/admin/ListingChangesDialog";
import { cn } from "@/lib/utils";

// ─── types ────────────────────────────────────────────────────────────────────

interface AdminListing {
  id: string;
  title: string;
  price: number;
  year: number;
  generation: string;
  status: string;
  featured: boolean;
  created_at: string;
  views_count: number;
  seller_id: string;
  start_date: string | null;
  expiration_date: string | null;
  listing_type: string | null;
  is_sold: boolean;
  is_bid_to: boolean | null;
  stock_number: number | null;
  vin: string | null;
  model: string | null;
  managed_profile_id: string | null;
  profiles: { first_name: string | null; last_name: string | null; is_active: boolean | null } | null;
  managed_profiles: { first_name: string | null; last_name: string | null; dealer_name: string | null; is_dealer: boolean | null } | null;
  listing_images?: { image_url: string; is_primary: boolean | null }[] | null;
}

interface Props {
  initialListings: AdminListing[];
  initialViewsCount: number;
}

// ─── helpers ──────────────────────────────────────────────────────────────────

function sellerName(listing: AdminListing): string {
  if (listing.managed_profile_id && listing.managed_profiles) {
    const mp = listing.managed_profiles;
    return mp.dealer_name || [mp.first_name, mp.last_name].filter(Boolean).join(" ") || "Unknown";
  }
  return [listing.profiles?.first_name, listing.profiles?.last_name].filter(Boolean).join(" ") || "Unknown";
}

function primaryImage(listing: AdminListing): string | null {
  const imgs = listing.listing_images;
  if (!imgs || imgs.length === 0) return null;
  return imgs.find((i) => i.is_primary)?.image_url ?? imgs[0]?.image_url ?? null;
}

function fmtPrice(p: number) {
  return new Intl.NumberFormat("en-US", { style: "currency", currency: "USD", maximumFractionDigits: 0 }).format(p);
}

function fmtDate(d: string) {
  return new Date(d).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
}

function fmtDateTime(d: string) {
  return new Date(d).toLocaleString("en-US", { month: "short", day: "numeric", year: "numeric", hour: "numeric", minute: "2-digit" });
}

function fmtStock(n: number) {
  return String(n).padStart(5, "0");
}

function statusBadge(status: string) {
  const map: Record<string, { variant: "default" | "secondary" | "destructive" | "outline"; icon: React.ReactNode; label: string }> = {
    pending_new:    { variant: "secondary",   icon: <Clock className="w-3 h-3" />,         label: "Pending - New" },
    pending_edited: { variant: "secondary",   icon: <Clock className="w-3 h-3" />,         label: "Pending - Edited" },
    approved:       { variant: "default",     icon: <CheckCircle className="w-3 h-3" />,   label: "Approved" },
    rejected:       { variant: "destructive", icon: <XCircle className="w-3 h-3" />,       label: "Rejected" },
    expired:        { variant: "outline",     icon: <AlertTriangle className="w-3 h-3" />, label: "Expired" },
  };
  const { variant, icon, label } = map[status] ?? { variant: "outline" as const, icon: null, label: status };
  return <Badge variant={variant} className="gap-1">{icon}{label}</Badge>;
}

// ─── ListingRow ───────────────────────────────────────────────────────────────

function ListingRow({
  listing,
  actionLoading,
  onApprove,
  onOpenReject,
  onOpenChanges,
  onOpenExpiration,
  onToggleFeatured,
  onOpenDelete,
}: {
  listing: AdminListing;
  actionLoading: string | null;
  onApprove: (id: string) => void;
  onOpenReject: (id: string) => void;
  onOpenChanges: (id: string, title: string) => void;
  onOpenExpiration: (id: string, title: string, date: string | null) => void;
  onToggleFeatured: (id: string, current: boolean) => void;
  onOpenDelete: (listing: AdminListing) => void;
}) {
  const [showHistory, setShowHistory] = useState(false);
  const now = new Date();
  const isExpired = listing.expiration_date && new Date(listing.expiration_date) < now;
  const img = primaryImage(listing);

  const daysUntil = listing.expiration_date
    ? Math.ceil((new Date(listing.expiration_date).getTime() - now.getTime()) / 86400000)
    : null;

  return (
    <div className="glass-card rounded-lg p-4">
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
        {/* Left — thumbnail + info */}
        <div className="flex items-start gap-4 flex-1 min-w-0">
          <div className="w-20 h-14 rounded-md overflow-hidden bg-muted flex-shrink-0">
            {img ? (
              <img src={img} alt={listing.title} className="w-full h-full object-cover" />
            ) : (
              <div className="w-full h-full flex items-center justify-center text-muted-foreground">
                <ImageIcon className="w-6 h-6" />
              </div>
            )}
          </div>

          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 flex-wrap mb-1">
              <h3 className="font-display text-lg truncate">{listing.title}</h3>
              {statusBadge(listing.status)}
              {listing.featured && (
                <Badge className="bg-amber-500 text-amber-950 gap-1">
                  <Star className="w-3 h-3 fill-current" /> Featured
                </Badge>
              )}
              {listing.listing_type && (
                <Badge className={cn(
                  "text-xs font-semibold uppercase tracking-wider",
                  listing.listing_type === "certified" && "bg-emerald-500 text-white",
                  listing.listing_type === "guaranteed" && "bg-amber-500 text-white",
                  listing.listing_type === "premium" && "bg-purple-500 text-white",
                )}>
                  {listing.listing_type.charAt(0).toUpperCase() + listing.listing_type.slice(1)}
                </Badge>
              )}
              {listing.is_sold && <Badge className="bg-red-600 text-white">Sold</Badge>}
              {listing.is_bid_to && !listing.is_sold && <Badge className="bg-blue-600 text-white">Bid To</Badge>}
            </div>

            <p className="text-muted-foreground text-sm">
              {listing.stock_number && (
                <span className="text-primary font-medium">Stock #{fmtStock(listing.stock_number)} · </span>
              )}
              {listing.year} · {listing.generation} · {fmtPrice(listing.price)}
            </p>

            <p className="text-xs text-muted-foreground mt-0.5">
              Seller: {sellerName(listing)} · Listed {fmtDate(listing.created_at)} · {listing.views_count ?? 0} views
            </p>

            {/* Expiration date */}
            {listing.expiration_date ? (
              <div className="text-xs mt-1">
                <button
                  onClick={() => onOpenExpiration(listing.id, listing.title, listing.expiration_date)}
                  className={cn(
                    "inline-flex items-center gap-1 hover:underline cursor-pointer",
                    isExpired && "text-destructive font-medium",
                    !isExpired && daysUntil !== null && daysUntil <= 7 && "text-amber-500 font-medium",
                    !isExpired && (daysUntil === null || daysUntil > 7) && "text-muted-foreground",
                  )}
                >
                  <Calendar className="w-3 h-3" />
                  {fmtDateTime(listing.expiration_date)}
                  {!isExpired && daysUntil !== null && daysUntil <= 7 && ` (${daysUntil}d)`}
                </button>
              </div>
            ) : listing.status === "approved" ? (
              <div className="text-xs mt-1">
                <button
                  onClick={() => onOpenExpiration(listing.id, listing.title, null)}
                  className="inline-flex items-center gap-1 hover:underline cursor-pointer text-muted-foreground"
                >
                  <Calendar className="w-3 h-3" /> Set expiration
                </button>
              </div>
            ) : null}
          </div>
        </div>

        {/* Right — actions */}
        <div className="flex items-center gap-2 flex-wrap">
          <Button variant="ghost" size="sm" onClick={() => setShowHistory(!showHistory)} className="gap-1">
            {showHistory ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
            History
          </Button>

          {listing.stock_number && (
            <Link href={`${buildListingUrl(listing.stock_number, listing.year, listing.generation, listing.title)}?from=admin`}>
              <Button variant="outline" size="icon" title="View listing"><Eye className="w-4 h-4" /></Button>
            </Link>
          )}

          <Link href={`/dashboard/listings/${listing.stock_number}/edit`}>
            <Button variant="outline" size="icon" title="Edit listing"><Pencil className="w-4 h-4" /></Button>
          </Link>

          {(listing.status === "pending_new" || listing.status === "pending_edited") && (
            <>
              {listing.status === "pending_edited" && (
                <Button
                  variant="outline" size="sm"
                  onClick={() => onOpenChanges(listing.id, listing.title)}
                  className="border-amber-500/50 text-amber-500 hover:bg-amber-500/10"
                >
                  <Eye className="w-4 h-4 mr-1" /> View Changes
                </Button>
              )}
              <Button
                size="sm"
                onClick={() => onApprove(listing.id)}
                disabled={actionLoading === listing.id}
                className="bg-green-600 hover:bg-green-700 text-white"
              >
                {actionLoading === listing.id
                  ? <Loader2 className="w-4 h-4 animate-spin" />
                  : <><CheckCircle className="w-4 h-4 mr-1" /> Approve</>}
              </Button>
              <Button
                variant="destructive" size="sm"
                onClick={() => onOpenReject(listing.id)}
                disabled={actionLoading === listing.id}
              >
                <XCircle className="w-4 h-4 mr-1" /> Reject
              </Button>
            </>
          )}

          {listing.status === "approved" && (
            <Button
              variant={listing.featured ? "secondary" : "outline"}
              size="icon"
              onClick={() => onToggleFeatured(listing.id, listing.featured)}
              disabled={actionLoading === listing.id}
              title={listing.featured ? "Remove from featured" : "Add to featured"}
            >
              <Star className={cn("w-4 h-4", listing.featured && "fill-current")} />
            </Button>
          )}

          <Button
            variant="ghost" size="icon"
            className="text-destructive hover:text-destructive"
            onClick={() => onOpenDelete(listing)}
          >
            <Trash2 className="w-4 h-4" />
          </Button>
        </div>
      </div>

      {showHistory && <ListingHistoryTable listingId={listing.id} />}
    </div>
  );
}

// ─── main component ───────────────────────────────────────────────────────────

type TabKey = "approved" | "pending" | "active" | "bidto" | "sold" | "expired" | "deactivated" | "rejected" | "featured" | "all";

export function ManageListingsClient({ initialListings, initialViewsCount }: Props) {
  const router = useRouter();
  const [listings, setListings] = useState(initialListings);
  const [totalViews, setTotalViews] = useState(initialViewsCount);
  const [actionLoading, setActionLoading] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<TabKey>("approved");
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedSeller, setSelectedSeller] = useState("all");
  const [sortBy, setSortBy] = useState("stock_number");

  // Reject dialog
  const [rejectDialog, setRejectDialog] = useState<{ open: boolean; listingId: string | null; reason: string }>({
    open: false, listingId: null, reason: "",
  });

  // Changes dialog
  const [changesDialog, setChangesDialog] = useState<{ open: boolean; id: string; title: string }>({
    open: false, id: "", title: "",
  });

  // Expiration dialog
  const [expDialog, setExpDialog] = useState<{
    open: boolean; id: string; title: string; date: Date | undefined;
  }>({ open: false, id: "", title: "", date: undefined });

  // Delete dialog
  interface DeleteSummary { views: number; images: number; storageFiles: number; offers: number; favorites: number; messages: number; history: number; snapshots: number }
  const [deleteDialog, setDeleteDialog] = useState<{
    open: boolean; listing: AdminListing | null; summary: DeleteSummary | null; loading: boolean; deleting: boolean;
  }>({ open: false, listing: null, summary: null, loading: false, deleting: false });

  // Live views realtime
  useEffect(() => {
    const supabase = createClient();
    const channel = supabase
      .channel("admin-views")
      .on("postgres_changes", { event: "INSERT", schema: "public", table: "listing_views" }, () => {
        setTotalViews((v) => v + 1);
      })
      .subscribe();
    return () => { supabase.removeChannel(channel); };
  }, []);

  // ── derived lists ──────────────────────────────────────────────────────────

  const now = new Date();
  const isExpired = (l: AdminListing) => !!l.expiration_date && new Date(l.expiration_date) < now;
  const isActive = (l: AdminListing) => l.status === "approved" && !isExpired(l) && !l.is_sold && l.profiles?.is_active !== false;
  const isDeactivated = (l: AdminListing) => l.profiles?.is_active === false;

  const sellers = (() => {
    const map = new Map<string, string>();
    listings.forEach((l) => {
      const key = l.managed_profile_id ?? l.seller_id;
      if (!map.has(key)) map.set(key, sellerName(l));
    });
    return [...map.entries()].map(([id, name]) => ({ id, name })).sort((a, b) => a.name.localeCompare(b.name));
  })();

  const filtered = listings.filter((l) => {
    const q = searchQuery.toLowerCase();
    const matchSearch = !q ||
      l.title.toLowerCase().includes(q) ||
      (l.stock_number?.toString() ?? "").includes(q) ||
      (l.vin?.toLowerCase() ?? "").includes(q) ||
      (l.model?.toLowerCase() ?? "").includes(q) ||
      l.year.toString().includes(q) ||
      sellerName(l).toLowerCase().includes(q);
    const matchSeller = selectedSeller === "all" ||
      (l.managed_profile_id ? l.managed_profile_id === selectedSeller : l.seller_id === selectedSeller);
    return matchSearch && matchSeller;
  });

  const sorted = [...filtered].sort((a, b) => {
    switch (sortBy) {
      case "expiration_asc":
        if (!a.expiration_date && !b.expiration_date) return 0;
        if (!a.expiration_date) return 1;
        if (!b.expiration_date) return -1;
        return new Date(a.expiration_date).getTime() - new Date(b.expiration_date).getTime();
      case "expiration_desc":
        if (!a.expiration_date && !b.expiration_date) return 0;
        if (!a.expiration_date) return 1;
        if (!b.expiration_date) return -1;
        return new Date(b.expiration_date).getTime() - new Date(a.expiration_date).getTime();
      case "created_asc":  return new Date(a.created_at).getTime() - new Date(b.created_at).getTime();
      case "created_desc": return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
      case "price_asc":    return a.price - b.price;
      case "price_desc":   return b.price - a.price;
      default:             return (b.stock_number ?? 0) - (a.stock_number ?? 0);
    }
  });

  const tabs: Record<TabKey, AdminListing[]> = {
    approved:    sorted.filter((l) => l.status !== "rejected"),
    pending:     sorted.filter((l) => l.status === "pending_new" || l.status === "pending_edited"),
    active:      sorted.filter(isActive),
    bidto:       sorted.filter((l) => !!l.is_bid_to && !l.is_sold),
    sold:        sorted.filter((l) => l.is_sold),
    expired:     sorted.filter(isExpired),
    deactivated: sorted.filter(isDeactivated),
    rejected:    sorted.filter((l) => l.status === "rejected"),
    featured:    sorted.filter((l) => l.featured),
    all:         sorted,
  };

  // ── actions ────────────────────────────────────────────────────────────────

  const handleApprove = useCallback(async (listingId: string) => {
    setActionLoading(listingId);
    const supabase = createClient();
    try {
      const listing = listings.find((l) => l.id === listingId);
      const wasEdited = listing?.status === "pending_edited";

      let startDate: string | undefined;
      let expDate: string | undefined;
      if (listing && !listing.start_date) {
        const start = new Date();
        const exp = new Date(start);
        exp.setDate(exp.getDate() + 30);
        startDate = start.toISOString();
        expDate = exp.toISOString();
      }

      const { error } = await supabase
        .from("listings")
        .update({ status: "approved", ...(startDate ? { start_date: startDate, expiration_date: expDate } : {}) })
        .eq("id", listingId);
      if (error) throw error;

      // Send approval notification (fire-and-forget)
      if (listing) {
        const { data: ld } = await supabase
          .from("listings")
          .select("title, price, seller_id, profiles:seller_id(first_name)")
          .eq("id", listingId)
          .single();
        if (ld) {
          supabase.functions.invoke("notify-listing-approved", {
            body: {
              listingId,
              sellerId: ld.seller_id,
              listingTitle: ld.title,
              price: ld.price,
              sellerName: (ld.profiles as any)?.first_name ?? "",
              wasEdited,
              changes: [],
            },
          }).catch(() => {});
        }
        if (wasEdited) {
          await supabase.from("listing_snapshots").delete().eq("listing_id", listingId);
        }
      }

      setListings((prev) => prev.map((l) => l.id === listingId
        ? { ...l, status: "approved", ...(startDate ? { start_date: startDate, expiration_date: expDate } : {}) }
        : l
      ));
      toast.success("Listing approved.");
    } catch {
      toast.error("Failed to approve listing.");
    } finally {
      setActionLoading(null);
    }
  }, [listings]);

  const handleReject = async () => {
    const { listingId, reason } = rejectDialog;
    if (!listingId) return;
    setActionLoading(listingId);
    const supabase = createClient();
    try {
      const { data: ld } = await supabase
        .from("listings")
        .select("title, seller_id, status, profiles:seller_id(first_name)")
        .eq("id", listingId)
        .single();

      const { error } = await supabase
        .from("listings")
        .update({ status: "rejected", rejection_reason: reason.trim() || null })
        .eq("id", listingId);
      if (error) throw error;

      if (ld) {
        supabase.functions.invoke("notify-listing-rejected", {
          body: {
            listingId,
            sellerId: ld.seller_id,
            listingTitle: ld.title,
            sellerName: (ld.profiles as any)?.first_name ?? "",
            rejectionReason: reason.trim(),
            wasEdited: ld.status === "pending_edited",
            changes: [],
          },
        }).catch(() => {});
      }

      setListings((prev) => prev.map((l) => l.id === listingId ? { ...l, status: "rejected" } : l));
      toast.success("Listing rejected.");
      setRejectDialog({ open: false, listingId: null, reason: "" });
    } catch {
      toast.error("Failed to reject listing.");
    } finally {
      setActionLoading(null);
    }
  };

  const handleToggleFeatured = async (listingId: string, current: boolean) => {
    setActionLoading(listingId);
    const supabase = createClient();
    try {
      const { error } = await supabase.from("listings").update({ featured: !current }).eq("id", listingId);
      if (error) throw error;
      setListings((prev) => prev.map((l) => l.id === listingId ? { ...l, featured: !current } : l));
      toast.success(current ? "Removed from featured." : "Added to featured.");
    } catch {
      toast.error("Failed to update featured status.");
    } finally {
      setActionLoading(null);
    }
  };

  const handleUpdateExpiration = async () => {
    if (!expDialog.id || !expDialog.date) return;
    setActionLoading(expDialog.id);
    const supabase = createClient();
    try {
      const { error } = await supabase
        .from("listings")
        .update({ expiration_date: expDialog.date.toISOString() })
        .eq("id", expDialog.id);
      if (error) throw error;
      setListings((prev) => prev.map((l) => l.id === expDialog.id ? { ...l, expiration_date: expDialog.date!.toISOString() } : l));
      toast.success(`Expiration set to ${format(expDialog.date, "PPP")}.`);
      setExpDialog((d) => ({ ...d, open: false }));
    } catch {
      toast.error("Failed to update expiration date.");
    } finally {
      setActionLoading(null);
    }
  };

  const openDeleteDialog = async (listing: AdminListing) => {
    setDeleteDialog({ open: true, listing, summary: null, loading: true, deleting: false });
    const supabase = createClient();
    try {
      const { data, error } = await supabase.functions.invoke("delete-listing", {
        body: { action: "summary", listingId: listing.id },
      });
      if (error) throw error;
      setDeleteDialog((d) => ({ ...d, summary: data.summary, loading: false }));
    } catch {
      toast.error("Failed to load delete summary.");
      setDeleteDialog((d) => ({ ...d, loading: false }));
    }
  };

  const handleDelete = async () => {
    if (!deleteDialog.listing) return;
    setDeleteDialog((d) => ({ ...d, deleting: true }));
    const supabase = createClient();
    try {
      const { error } = await supabase.functions.invoke("delete-listing", {
        body: { action: "delete", listingId: deleteDialog.listing.id },
      });
      if (error) throw error;
      setListings((prev) => prev.filter((l) => l.id !== deleteDialog.listing?.id));
      toast.success("Listing deleted.");
      setDeleteDialog({ open: false, listing: null, summary: null, loading: false, deleting: false });
    } catch {
      toast.error("Failed to delete listing.");
      setDeleteDialog((d) => ({ ...d, deleting: false }));
    }
  };

  // ── stat cards ─────────────────────────────────────────────────────────────

  const stats: { key: TabKey; label: string; count: number; color: string; ring: string }[] = [
    { key: "approved",    label: "Approved",    count: listings.filter((l) => l.status !== "rejected").length, color: "text-blue-500",    ring: "ring-blue-500" },
    { key: "pending",     label: "Pending",     count: listings.filter((l) => l.status === "pending_new" || l.status === "pending_edited").length, color: "text-amber-500",  ring: "ring-amber-500" },
    { key: "active",      label: "Active",      count: listings.filter(isActive).length, color: "text-green-500",  ring: "ring-green-500" },
    { key: "bidto",       label: "Bid To",      count: listings.filter((l) => !!l.is_bid_to).length, color: "text-yellow-500", ring: "ring-yellow-500" },
    { key: "sold",        label: "Sold",        count: listings.filter((l) => l.is_sold).length, color: "text-red-500",    ring: "ring-red-500" },
    { key: "expired",     label: "Expired",     count: listings.filter(isExpired).length, color: "text-orange-500", ring: "ring-orange-500" },
    { key: "deactivated", label: "Deactivated", count: listings.filter(isDeactivated).length, color: "text-muted-foreground", ring: "ring-muted-foreground" },
    { key: "rejected",    label: "Rejected",    count: listings.filter((l) => l.status === "rejected").length, color: "text-destructive", ring: "ring-destructive" },
    { key: "featured",    label: "Featured",    count: listings.filter((l) => l.featured).length, color: "text-accent",    ring: "ring-accent" },
    { key: "all",         label: "All",         count: listings.length, color: "text-foreground",  ring: "ring-foreground" },
  ];

  // ── render ─────────────────────────────────────────────────────────────────

  return (
    <>
      {/* Page header */}
      <div className="flex items-start justify-between gap-4 mb-6">
        <div>
          <h1 className="font-display text-3xl md:text-4xl">Manage Listings</h1>
          <p className="text-muted-foreground mt-1">Approve submissions, feature vehicles, and manage all listings.</p>
        </div>
        <Link href="/dashboard/listings/new">
          <Button className="gap-2">
            <Plus className="w-4 h-4" />
            <span className="hidden sm:inline">Create Listing</span>
            <span className="sm:hidden">Create</span>
          </Button>
        </Link>
      </div>

      {/* Search + filter + sort */}
      <div className="flex flex-col sm:flex-row gap-2 mb-4">
        <div className="relative sm:w-56">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input
            placeholder="Search listings..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10 bg-input border-border"
          />
        </div>
        <Select value={selectedSeller} onValueChange={(v: string | null) => setSelectedSeller(v ?? "all")}>
          <SelectTrigger className="w-auto min-w-36 bg-input border-border">
            <SelectValue placeholder="All Users" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Users</SelectItem>
            {sellers.map((s) => (
              <SelectItem key={s.id} value={s.id}>{s.name}</SelectItem>
            ))}
          </SelectContent>
        </Select>
        <Select value={sortBy} onValueChange={(v: string | null) => setSortBy(v ?? "stock_number")}>
          <SelectTrigger className="w-auto min-w-44 bg-input border-border">
            <SelectValue placeholder="Sort by" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="stock_number">Stock # (Newest)</SelectItem>
            <SelectItem value="expiration_asc">Expiration (Soonest)</SelectItem>
            <SelectItem value="expiration_desc">Expiration (Latest)</SelectItem>
            <SelectItem value="created_desc">Created (Newest)</SelectItem>
            <SelectItem value="created_asc">Created (Oldest)</SelectItem>
            <SelectItem value="price_desc">Price (High to Low)</SelectItem>
            <SelectItem value="price_asc">Price (Low to High)</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Stat cards */}
      <div className="grid grid-cols-3 sm:grid-cols-5 xl:grid-cols-11 gap-3 mb-6">
        {stats.map(({ key, label, count, color, ring }) => (
          <div
            key={key}
            onClick={() => setActiveTab(key)}
            className={cn(
              "glass-card rounded-lg p-3 cursor-pointer hover:ring-2 transition-all",
              `hover:${ring}`,
              activeTab === key && `ring-2 ${ring}`,
            )}
          >
            <p className="text-muted-foreground text-[10px] uppercase tracking-wide">{label}</p>
            <p className={cn("font-display text-2xl", color)}>{count}</p>
          </div>
        ))}
        {/* Live views */}
        <div className="glass-card rounded-lg p-3">
          <div className="flex items-center gap-1.5">
            <p className="text-muted-foreground text-[10px] uppercase tracking-wide">Views</p>
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75" />
              <span className="relative inline-flex rounded-full h-2 w-2 bg-green-500" />
            </span>
          </div>
          <p className="font-display text-2xl text-blue-500">{totalViews.toLocaleString()}</p>
        </div>
      </div>

      {/* Listing rows */}
      {tabs[activeTab].length === 0 ? (
        <div className="text-center py-12 text-muted-foreground">
          <p>No listings in this category.</p>
        </div>
      ) : (
        <div className="space-y-4">
          {tabs[activeTab].map((listing) => (
            <ListingRow
              key={listing.id}
              listing={listing}
              actionLoading={actionLoading}
              onApprove={handleApprove}
              onOpenReject={(id) => setRejectDialog({ open: true, listingId: id, reason: "" })}
              onOpenChanges={(id, title) => setChangesDialog({ open: true, id, title })}
              onOpenExpiration={(id, title, date) =>
                setExpDialog({ open: true, id, title, date: date ? new Date(date) : undefined })
              }
              onToggleFeatured={handleToggleFeatured}
              onOpenDelete={openDeleteDialog}
            />
          ))}
        </div>
      )}

      {/* ── Reject Dialog ─────────────────────────────────────────────────── */}
      <Dialog open={rejectDialog.open} onOpenChange={(v) => setRejectDialog((d) => ({ ...d, open: v }))}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Reject Listing</DialogTitle>
            <DialogDescription>Provide a reason for rejecting. The seller will see this.</DialogDescription>
          </DialogHeader>
          <div className="space-y-2 py-4">
            <Label htmlFor="reject-reason">Rejection Reason</Label>
            <Textarea
              id="reject-reason"
              placeholder="e.g. incomplete information, inappropriate content..."
              value={rejectDialog.reason}
              onChange={(e) => setRejectDialog((d) => ({ ...d, reason: e.target.value }))}
              rows={4}
            />
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setRejectDialog({ open: false, listingId: null, reason: "" })}
              disabled={actionLoading === rejectDialog.listingId}>
              Cancel
            </Button>
            <Button variant="destructive" onClick={handleReject} disabled={actionLoading === rejectDialog.listingId}>
              {actionLoading === rejectDialog.listingId
                ? <Loader2 className="w-4 h-4 animate-spin mr-2" />
                : <XCircle className="w-4 h-4 mr-2" />}
              Reject Listing
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* ── View Changes Dialog ───────────────────────────────────────────── */}
      <ListingChangesDialog
        open={changesDialog.open}
        onOpenChange={(v) => setChangesDialog((d) => ({ ...d, open: v }))}
        listingId={changesDialog.id}
        listingTitle={changesDialog.title}
      />

      {/* ── Expiration Dialog ─────────────────────────────────────────────── */}
      <Dialog open={expDialog.open} onOpenChange={(v) => setExpDialog((d) => ({ ...d, open: v }))}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Edit Expiration Date</DialogTitle>
            <DialogDescription>{expDialog.title}</DialogDescription>
          </DialogHeader>
          <div className="py-4 space-y-4">
            <div className="flex justify-center">
              <CalendarComponent
                mode="single"
                selected={expDialog.date}
                onSelect={(date) => {
                  if (date) {
                    const h = expDialog.date?.getHours() ?? 23;
                    const m = expDialog.date?.getMinutes() ?? 59;
                    date.setHours(h, m, 0, 0);
                    setExpDialog((d) => ({ ...d, date }));
                  }
                }}
                disabled={(date) => { const t = new Date(); t.setHours(0,0,0,0); return date < t; }}
                className="rounded-md border"
              />
            </div>
            {expDialog.date && (
              <div className="space-y-2">
                <Label className="block text-center text-sm">Select time</Label>
                <div className="flex items-center justify-center gap-2">
                  <select
                    value={expDialog.date.getHours()}
                    onChange={(e) => {
                      const d = new Date(expDialog.date!);
                      d.setHours(+e.target.value);
                      setExpDialog((s) => ({ ...s, date: d }));
                    }}
                    className="h-9 rounded-md border border-input bg-background px-3 py-1 text-sm"
                  >
                    {Array.from({ length: 24 }, (_, i) => (
                      <option key={i} value={i}>{String(i).padStart(2, "0")}</option>
                    ))}
                  </select>
                  <span className="text-lg font-medium">:</span>
                  <select
                    value={expDialog.date.getMinutes()}
                    onChange={(e) => {
                      const d = new Date(expDialog.date!);
                      d.setMinutes(+e.target.value);
                      setExpDialog((s) => ({ ...s, date: d }));
                    }}
                    className="h-9 rounded-md border border-input bg-background px-3 py-1 text-sm"
                  >
                    {Array.from({ length: 60 }, (_, i) => (
                      <option key={i} value={i}>{String(i).padStart(2, "0")}</option>
                    ))}
                  </select>
                </div>
                <p className="text-sm text-muted-foreground text-center">
                  {format(expDialog.date, "PPP 'at' h:mm a")}
                </p>
              </div>
            )}
            <div className="flex gap-2 justify-center">
              {[7, 14, 30].map((days) => (
                <Button key={days} variant="outline" size="sm" onClick={() => {
                  const d = new Date();
                  d.setDate(d.getDate() + days);
                  d.setHours(23, 59, 0, 0);
                  setExpDialog((s) => ({ ...s, date: d }));
                }}>
                  +{days} days
                </Button>
              ))}
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setExpDialog((d) => ({ ...d, open: false }))}
              disabled={actionLoading === expDialog.id}>
              Cancel
            </Button>
            <Button onClick={handleUpdateExpiration} disabled={!expDialog.date || actionLoading === expDialog.id}>
              {actionLoading === expDialog.id
                ? <Loader2 className="w-4 h-4 animate-spin mr-2" />
                : <Calendar className="w-4 h-4 mr-2" />}
              Update Expiration
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* ── Delete Dialog ─────────────────────────────────────────────────── */}
      <Dialog
        open={deleteDialog.open}
        onOpenChange={(v) => { if (!deleteDialog.deleting) setDeleteDialog((d) => ({ ...d, open: v })); }}
      >
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-destructive">
              <AlertTriangle className="w-5 h-5" /> Permanently Delete Listing
            </DialogTitle>
            <DialogDescription>This action cannot be undone. All related data will be removed.</DialogDescription>
          </DialogHeader>

          {deleteDialog.listing && (
            <div className="space-y-4">
              <div className="bg-muted/50 rounded-lg p-4 space-y-1">
                <p className="font-semibold">{deleteDialog.listing.title}</p>
                <div className="flex gap-4 text-sm text-muted-foreground">
                  {deleteDialog.listing.stock_number && <span>Stock #{deleteDialog.listing.stock_number}</span>}
                  <span>{deleteDialog.listing.year} {deleteDialog.listing.generation}</span>
                </div>
              </div>

              {deleteDialog.loading ? (
                <div className="flex items-center justify-center py-8">
                  <Loader2 className="w-6 h-6 animate-spin text-muted-foreground" />
                  <span className="ml-2 text-muted-foreground">Loading summary…</span>
                </div>
              ) : deleteDialog.summary && (
                <div className="space-y-2">
                  <p className="text-sm font-medium text-muted-foreground">The following data will be deleted:</p>
                  <div className="grid grid-cols-2 gap-2">
                    {(["views", "images", "offers", "favorites", "messages", "history", "snapshots", "storageFiles"] as const).map((k) => (
                      <div key={k} className="bg-muted/30 rounded-md p-3 flex justify-between items-center">
                        <span className="text-sm text-muted-foreground capitalize">{k === "storageFiles" ? "Storage Files" : k.charAt(0).toUpperCase() + k.slice(1)}</span>
                        <span className="font-semibold">{(deleteDialog.summary as any)[k].toLocaleString()}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}

          <DialogFooter className="gap-2 sm:gap-0">
            <Button variant="outline" onClick={() => setDeleteDialog((d) => ({ ...d, open: false }))}
              disabled={deleteDialog.deleting}>
              Cancel
            </Button>
            <Button variant="destructive" onClick={handleDelete}
              disabled={deleteDialog.loading || deleteDialog.deleting}>
              {deleteDialog.deleting
                ? <><Loader2 className="w-4 h-4 animate-spin mr-2" />Deleting…</>
                : <><Trash2 className="w-4 h-4 mr-2" />Delete Listing</>}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
