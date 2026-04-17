"use client";

import { useEffect } from "react";
import { formatDistanceToNow } from "date-fns";
import {
  Bell,
  BellOff,
  Check,
  CheckCheck,
  Trash2,
  Calendar,
  CreditCard,
  Video,
  X,
  Info,
} from "lucide-react";

import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";

import { useStore } from "@/store/store";
import {
  useGetAllNotifications,
  useGetUnreadCount,
  useMarkNotificationRead,
  useMarkAllNotificationsRead,
  useDeleteNotification,
  type NotificationType,
} from "@/api/notificationApi";
import { cn } from "@/lib/utils";

// ─── Icon by notification type ────────────────────────────────────────────────

function NotificationIcon({ type }: { type: NotificationType }) {
  const base = "w-4 h-4";
  switch (type) {
    case "APPOINTMENT_REMINDER":
    case "APPOINTMENT_CONFIRMED":
    case "APPOINTMENT_CANCELLED":
      return <Calendar className={cn(base, "text-blue-500")} />;
    case "PAYMENT_SUCCESS":
    case "PAYMENT_FAILED":
      return <CreditCard className={cn(base, type === "PAYMENT_FAILED" ? "text-rose-500" : "text-emerald-500")} />;
    case "TELEMEDICINE_STARTING":
      return <Video className={cn(base, "text-purple-500")} />;
    default:
      return <Info className={cn(base, "text-muted-foreground")} />;
  }
}

// ─── Single notification item ─────────────────────────────────────────────────

function NotificationItem({ notification }: { notification: { id: string; type: NotificationType; title: string; message: string; isRead: boolean; createdAt: string } }) {
  const markRead = useMarkNotificationRead();
  const deleteNotif = useDeleteNotification();

  return (
    <div
      className={cn(
        "group flex items-start gap-3 px-4 py-3 transition-colors hover:bg-muted/40 cursor-pointer",
        !notification.isRead && "bg-blue-50/60 dark:bg-blue-500/5"
      )}
      onClick={() => {
        if (!notification.isRead) {
          markRead.mutate(notification.id);
        }
      }}
    >
      {/* Icon */}
      <div className="mt-0.5 shrink-0 p-1.5 rounded-md bg-background border border-border/60">
        <NotificationIcon type={notification.type} />
      </div>

      {/* Content */}
      <div className="flex-1 min-w-0">
        <div className="flex items-start justify-between gap-2">
          <p
            className={cn(
              "text-sm leading-snug",
              notification.isRead
                ? "text-muted-foreground font-normal"
                : "text-foreground font-semibold"
            )}
          >
            {notification.title}
          </p>
          {!notification.isRead && (
            <span className="mt-1 shrink-0 w-2 h-2 rounded-full bg-blue-500" />
          )}
        </div>
        <p className="text-xs text-muted-foreground mt-0.5 line-clamp-2">
          {notification.message}
        </p>
        <p className="text-xs text-muted-foreground/60 mt-1">
          {formatDistanceToNow(new Date(notification.createdAt), { addSuffix: true })}
        </p>
      </div>

      {/* Delete button — appears on hover */}
      <button
        className="shrink-0 mt-0.5 p-1 rounded opacity-0 group-hover:opacity-100 transition-opacity hover:bg-rose-50 hover:text-rose-500 dark:hover:bg-rose-500/10 text-muted-foreground"
        onClick={(e) => {
          e.stopPropagation();
          deleteNotif.mutate(notification.id);
        }}
        aria-label="Delete notification"
      >
        <Trash2 className="w-3.5 h-3.5" />
      </button>
    </div>
  );
}

// ─── Panel ────────────────────────────────────────────────────────────────────

export function NotificationPanel() {
  const isOpen = useStore((s) => s.isPanelOpen);
  const closePanel = useStore((s) => s.closePanel);
  const setUnreadCount = useStore((s) => s.setUnreadCount);
  const clearUnreadCount = useStore((s) => s.clearUnreadCount);

  const { data: notifications = [], isLoading } = useGetAllNotifications();
  const { data: unreadData } = useGetUnreadCount();
  const markAll = useMarkAllNotificationsRead();

  // Keep Zustand unread count in sync with server
  useEffect(() => {
    if (unreadData !== undefined) {
      setUnreadCount(unreadData.count);
    }
  }, [unreadData, setUnreadCount]);

  const handleMarkAllRead = () => {
    markAll.mutate(undefined, {
      onSuccess: () => clearUnreadCount(),
    });
  };

  const unread = notifications.filter((n) => !n.isRead);
  const read = notifications.filter((n) => n.isRead);

  return (
    <Sheet open={isOpen} onOpenChange={(open) => !open && closePanel()}>
      <SheetContent side="right" className="w-full sm:w-[420px] p-0 flex flex-col">
        {/* Header */}
        <SheetHeader className="px-4 py-4 border-b border-border/60 shrink-0">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <SheetTitle className="text-base font-semibold">Notifications</SheetTitle>
              {unread.length > 0 && (
                <Badge className="h-5 min-w-5 px-1.5 text-xs bg-blue-500 hover:bg-blue-500 text-white border-0">
                  {unread.length}
                </Badge>
              )}
            </div>
            <div className="flex items-center gap-1">
              {unread.length > 0 && (
                <Button
                  variant="ghost"
                  size="sm"
                  className="text-xs text-muted-foreground h-8 px-2 gap-1 hover:text-foreground"
                  onClick={handleMarkAllRead}
                  disabled={markAll.isPending}
                >
                  <CheckCheck className="w-3.5 h-3.5" />
                  Mark all read
                </Button>
              )}
              <Button
                variant="ghost"
                size="icon"
                className="h-8 w-8 text-muted-foreground"
                onClick={closePanel}
                aria-label="Close"
              >
                <X className="w-4 h-4" />
              </Button>
            </div>
          </div>
        </SheetHeader>

        {/* Body */}
        <ScrollArea className="flex-1">
          {isLoading ? (
            <div className="space-y-1 p-4">
              {[1, 2, 3].map((i) => (
                <div key={i} className="flex gap-3 animate-pulse">
                  <div className="w-8 h-8 rounded-md bg-muted shrink-0" />
                  <div className="flex-1 space-y-2 py-1">
                    <div className="h-3 bg-muted rounded w-3/4" />
                    <div className="h-3 bg-muted rounded w-1/2" />
                  </div>
                </div>
              ))}
            </div>
          ) : notifications.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-20 text-center px-6">
              <div className="p-4 rounded-full bg-muted/60 mb-4">
                <BellOff className="w-6 h-6 text-muted-foreground" />
              </div>
              <p className="text-sm font-medium text-foreground">No notifications yet</p>
              <p className="text-xs text-muted-foreground mt-1">
                You&apos;ll see alerts for appointments, payments and more here.
              </p>
            </div>
          ) : (
            <div className="pb-4">
              {/* Unread section */}
              {unread.length > 0 && (
                <>
                  <div className="px-4 py-2 flex items-center gap-2">
                    <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">
                      Unread
                    </span>
                    <Check className="w-3 h-3 text-muted-foreground" />
                  </div>
                  {unread.map((n) => (
                    <NotificationItem key={n.id} notification={n} />
                  ))}
                </>
              )}

              {/* Read section */}
              {read.length > 0 && (
                <>
                  {unread.length > 0 && <Separator className="my-2" />}
                  <div className="px-4 py-2">
                    <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">
                      Earlier
                    </span>
                  </div>
                  {read.map((n) => (
                    <NotificationItem key={n.id} notification={n} />
                  ))}
                </>
              )}
            </div>
          )}
        </ScrollArea>
      </SheetContent>
    </Sheet>
  );
}
