"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useMemo, useState } from "react";
import { Search, Bell, HelpCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { SidebarTrigger } from "@/components/ui/sidebar";
import { getNavForPathname } from "@/lib/sidebar-nav";
import { useStore } from "@/store/store";
import { useGetUnreadCount } from "@/api/notificationApi";
import { NotificationPanel } from "@/components/notifications/notification-panel";

export function TopHeader() {
  const pathname = usePathname() || "";
  const [searchQuery, setSearchQuery] = useState("");
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const togglePanel = useStore((s) => s.togglePanel);
  const unreadCount = useStore((s) => s.unreadCount);
  const setUnreadCount = useStore((s) => s.setUnreadCount);

  // Keep store unread count in sync from the polling query
  const { data: unreadData } = useGetUnreadCount();
  useMemo(() => {
    if (unreadData !== undefined) setUnreadCount(unreadData.count);
  }, [unreadData, setUnreadCount]);
  const navItems = useMemo(() => getNavForPathname(pathname), [pathname]);
  const searchResults = useMemo(() => {
    const query = searchQuery.trim().toLowerCase();
    if (!query) {
      return navItems;
    }

    return navItems.filter(
      (item) =>
        item.title.toLowerCase().includes(query) ||
        item.url.toLowerCase().includes(query)
    );
  }, [navItems, searchQuery]);

  // Basic title generation based on path
  const getTitle = () => {
    if (pathname.includes("/dashboard")) return "Dashboard";
    if (pathname.includes("/patients")) return "Patients";
    if (pathname.includes("/doctors")) return "Doctors";
    if (pathname.includes("/appointments")) return "Appointments";
    if (pathname.includes("/reports")) return "Reports";
    if (pathname.includes("/prescriptions")) return "Prescriptions";
    if (pathname.includes("/payments")) return "Payments";
    if (pathname.includes("/users")) return "Users";
    if (pathname.includes("/edoc-ai") || pathname.includes("/ai-assistant")) return "eDoc AI";
    if (pathname.includes("/telemedicine")) return "Telemedicine";
    if (pathname.includes("/feedback")) return "Feedback";
    if (pathname.includes("/confirm-order")) return "Confirm Order";
    if (pathname === "/admin" || pathname === "/doctor" || pathname === "/patient") return "Dashboard";
    return "";
  };

  return (
    <header className="flex shrink-0 items-center justify-between p-4 h-16 bg-white border-b border-gray-100">
      <div className="flex items-center gap-4">
        <SidebarTrigger />
        <h1 className="text-xl font-semibold text-gray-800">{getTitle()}</h1>
      </div>

      <div className="flex items-center gap-4">
        <Button
          asChild
          variant="outline"
          className="hidden md:flex gap-2 text-gray-600 rounded-full h-9 px-4"
        >
          <Link href="/help">
            <HelpCircle className="h-4 w-4" />
            <span className="text-sm font-medium">Need help</span>
          </Link>
        </Button>

        <Popover open={isSearchOpen} onOpenChange={setIsSearchOpen}>
          <PopoverTrigger asChild>
            <Button
              variant="ghost"
              size="icon"
              className="rounded-full border border-gray-200"
              aria-label="Search pages"
            >
              <Search className="h-4 w-4 text-gray-600" />
            </Button>
          </PopoverTrigger>
          <PopoverContent align="end" className="w-80 p-3">
            <div className="space-y-2">
              <Input
                value={searchQuery}
                onChange={(event) => setSearchQuery(event.target.value)}
                placeholder="Search sidebar pages..."
                aria-label="Search sidebar pages"
              />
              <div className="max-h-64 overflow-auto rounded-md border border-gray-100 bg-white">
                {searchResults.length === 0 ? (
                  <p className="px-3 py-4 text-sm text-gray-500">
                    No pages found.
                  </p>
                ) : (
                  <ul className="py-1">
                    {searchResults.map((item) => (
                      <li key={item.url}>
                        <Link
                          href={item.url}
                          onClick={() => {
                            setIsSearchOpen(false);
                            setSearchQuery("");
                          }}
                          className="flex items-center justify-between px-3 py-2 text-sm text-gray-700 hover:bg-gray-50"
                        >
                          <span>{item.title}</span>
                          <span className="text-xs text-gray-400">{item.url}</span>
                        </Link>
                      </li>
                    ))}
                  </ul>
                )}
              </div>
            </div>
          </PopoverContent>
        </Popover>

        <div className="relative">
          <Button
            variant="ghost"
            size="icon"
            className="rounded-full border border-gray-200"
            aria-label="View notifications"
            onClick={togglePanel}
          >
            <Bell className="h-4 w-4 text-gray-600" />
          </Button>
          {unreadCount > 0 && (
            <span className="absolute -top-0.5 -right-0.5 flex items-center justify-center min-w-[18px] h-[18px] px-1 rounded-full bg-blue-500 text-white text-[10px] font-bold border-2 border-white">
              {unreadCount > 99 ? "99+" : unreadCount}
            </span>
          )}
        </div>
        <NotificationPanel />
      </div>
    </header>
  );
}
