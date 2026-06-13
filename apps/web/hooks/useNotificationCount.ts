"use client";

import { useState, useEffect } from "react";
import { createClient } from "@/lib/supabase/client";
import type { User } from "@supabase/supabase-js";

export function useNotificationCount(user: User | null): number {
  const [count, setCount] = useState(0);

  useEffect(() => {
    if (!user) {
      setCount(0);
      return;
    }

    const supabase = createClient();

    const fetch = async () => {
      try {
        const [{ count: msgCount }, { data: listings }] = await Promise.all([
          supabase
            .from("messages")
            .select("*", { count: "exact", head: true })
            .eq("recipient_id", user.id)
            .is("read_at", null),
          supabase.from("listings").select("id").eq("seller_id", user.id),
        ]);

        let offerCount = 0;
        if (listings && listings.length > 0) {
          const { count } = await supabase
            .from("offers")
            .select("*", { count: "exact", head: true })
            .in("listing_id", listings.map((l) => l.id))
            .eq("status", "pending");
          offerCount = count ?? 0;
        }

        setCount((msgCount ?? 0) + offerCount);
      } catch {
        // non-fatal
      }
    };

    fetch();

    const channel = supabase
      .channel("header-notifications")
      .on("postgres_changes", { event: "*", schema: "public", table: "messages" }, fetch)
      .on("postgres_changes", { event: "*", schema: "public", table: "offers" }, fetch)
      .subscribe();

    return () => { supabase.removeChannel(channel); };
  }, [user]);

  return count;
}
