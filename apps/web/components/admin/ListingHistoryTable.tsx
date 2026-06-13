"use client";

import { useState, useEffect } from "react";
import { createClient } from "@/lib/supabase/client";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Loader2, Clock, CheckCircle, XCircle, AlertTriangle, History } from "lucide-react";

interface HistoryEntry {
  id: string;
  changed_at: string;
  status: string | null;
  rejection_reason: string | null;
}

export function ListingHistoryTable({ listingId }: { listingId: string }) {
  const [history, setHistory] = useState<HistoryEntry[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const supabase = createClient();
    supabase
      .from("listing_history")
      .select("id, changed_at, status, rejection_reason")
      .eq("listing_id", listingId)
      .order("changed_at", { ascending: false })
      .then(({ data }) => {
        setHistory(data ?? []);
        setLoading(false);
      });
  }, [listingId]);

  const formatDateTime = (d: string) =>
    new Date(d).toLocaleString("en-US", {
      month: "short", day: "numeric", year: "numeric",
      hour: "numeric", minute: "2-digit", hour12: true,
    });

  const statusBadge = (status: string | null) => {
    if (!status) return <span className="text-muted-foreground">—</span>;
    const map: Record<string, { label: string; variant: "default" | "secondary" | "destructive" | "outline"; icon: React.ReactNode }> = {
      pending_new:    { label: "Pending - New",    variant: "secondary",    icon: <Clock className="w-3 h-3" /> },
      pending_edited: { label: "Pending - Edited", variant: "secondary",    icon: <Clock className="w-3 h-3" /> },
      approved:       { label: "Approved",          variant: "default",      icon: <CheckCircle className="w-3 h-3" /> },
      rejected:       { label: "Rejected",          variant: "destructive",  icon: <XCircle className="w-3 h-3" /> },
      expired:        { label: "Expired",           variant: "outline",      icon: <AlertTriangle className="w-3 h-3" /> },
    };
    const { label, variant, icon } = map[status] ?? { label: status, variant: "outline" as const, icon: null };
    return <Badge variant={variant} className="gap-1">{icon}{label}</Badge>;
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-4">
        <Loader2 className="w-4 h-4 animate-spin text-muted-foreground" />
      </div>
    );
  }

  return (
    <div className="mt-4 border-t border-border pt-4">
      <div className="flex items-center gap-2 mb-3">
        <History className="w-4 h-4 text-muted-foreground" />
        <h4 className="text-sm font-medium text-muted-foreground uppercase tracking-wider">Change History</h4>
      </div>
      {history.length === 0 ? (
        <p className="text-center py-4 text-muted-foreground text-sm">No history available.</p>
      ) : (
        <div className="rounded-md border border-border overflow-hidden">
          <Table>
            <TableHeader>
              <TableRow className="bg-muted/50">
                <TableHead className="w-[200px]">Date & Time</TableHead>
                <TableHead className="w-[160px]">Status</TableHead>
                <TableHead>Rejection Reason</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {history.map((entry) => (
                <TableRow key={entry.id}>
                  <TableCell className="text-sm">{formatDateTime(entry.changed_at)}</TableCell>
                  <TableCell>{statusBadge(entry.status)}</TableCell>
                  <TableCell className="text-sm text-muted-foreground">{entry.rejection_reason ?? "—"}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      )}
    </div>
  );
}
