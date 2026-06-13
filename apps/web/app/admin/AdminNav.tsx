"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  ClipboardList,
  Users,
  Mail,
  Bell,
  Database,
  Newspaper,
  Menu,
  ChevronLeft,
  ChevronRight,
  UserPlus,
  ExternalLink,
  Settings,
  Search,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { cn } from "@/lib/utils";

const NAV_ITEMS = [
  { label: "Manage Listings", path: "/admin", icon: ClipboardList, exact: true },
  { label: "Manage Users", path: "/admin/users", icon: Users },
  { label: "Manage Profiles", path: "/admin/profiles", icon: UserPlus },
  { label: "Manage News", path: "/admin/news", icon: Newspaper },
  { label: "External Links", path: "/admin/external-links", icon: ExternalLink },
  { label: "Fetch Listings", path: "/admin/fetch-listings", icon: Search },
  { label: "Manage Lookups", path: "/admin/lookups", icon: Database },
  { label: "System Config", path: "/admin/settings", icon: Settings },
  { label: "Launch Emails", path: "/admin/launch-emails", icon: Bell },
  { label: "Email Preview", path: "/admin/emails", icon: Mail },
];

function NavItems({ collapsed, onItemClick }: { collapsed?: boolean; onItemClick?: () => void }) {
  const pathname = usePathname();

  return (
    <nav className="flex flex-col gap-1 p-2">
      {NAV_ITEMS.map((item) => {
        const Icon = item.icon;
        const active = item.exact ? pathname === item.path : pathname.startsWith(item.path);
        return (
          <Link
            key={item.path}
            href={item.path}
            onClick={onItemClick}
            className={cn(
              "flex items-center gap-3 px-3 py-2.5 rounded-lg transition-colors",
              active
                ? "bg-primary text-primary-foreground"
                : "text-muted-foreground hover:bg-muted hover:text-foreground"
            )}
          >
            <Icon className="w-5 h-5 flex-shrink-0" />
            {!collapsed && <span className="font-medium text-sm">{item.label}</span>}
          </Link>
        );
      })}
    </nav>
  );
}

export function AdminNav() {
  const [collapsed, setCollapsed] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);

  return (
    <>
      {/* Desktop sidebar */}
      <aside
        className={cn(
          "hidden lg:flex flex-col border-r border-border bg-card transition-all duration-300 sticky top-[calc(4rem+var(--safe-area-top,0px))] h-[calc(100vh-4rem-var(--safe-area-top,0px))] flex-shrink-0",
          collapsed ? "w-16" : "w-56"
        )}
      >
        <div className="flex-1 py-4 overflow-y-auto">
          <NavItems collapsed={collapsed} />
        </div>
        <div className="p-2 border-t border-border">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setCollapsed(!collapsed)}
            className="w-full justify-center"
          >
            {collapsed ? (
              <ChevronRight className="w-4 h-4" />
            ) : (
              <>
                <ChevronLeft className="w-4 h-4 mr-2" />
                <span>Collapse</span>
              </>
            )}
          </Button>
        </div>
      </aside>

      {/* Mobile sheet trigger — rendered inline at top of page content */}
      <div className="lg:hidden fixed bottom-4 left-4 z-40">
        <Sheet open={mobileOpen} onOpenChange={setMobileOpen}>
          <SheetTrigger>
            <Button variant="outline" size="icon" className="shadow-lg pointer-events-none">
              <Menu className="w-5 h-5" />
            </Button>
          </SheetTrigger>
          <SheetContent side="left" className="w-64 p-0">
            <div className="p-4 border-b border-border">
              <h2 className="font-display text-lg">Admin</h2>
            </div>
            <NavItems onItemClick={() => setMobileOpen(false)} />
          </SheetContent>
        </Sheet>
      </div>
    </>
  );
}
