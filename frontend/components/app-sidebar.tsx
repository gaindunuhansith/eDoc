"use client";

import { useState, type ComponentProps } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  Blocks,
  Hexagon,
  LogOut,
  Mail,
  MoreHorizontal,
  Package,
  Settings,
  User as UserIcon,
} from "lucide-react";

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Separator } from "@/components/ui/separator";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarRail,
  useSidebar,
} from "@/components/ui/sidebar";
import { getNavForPathname } from "@/lib/sidebar-nav";

const marketingItems = [
  { title: "Products", icon: Package },
  { title: "Emails", icon: Mail },
];

const preferenceItems = [
  { title: "Integrations", icon: Blocks },
  { title: "Settings", icon: Settings },
];

export function AppSidebar(props: ComponentProps<typeof Sidebar>) {
  const pathname = usePathname() || "";
  const { state } = useSidebar();
  const isCollapsed = state === "collapsed";
  const [showTrialCard, setShowTrialCard] = useState(true);

  const mainNav = getNavForPathname(pathname);

  return (
    <Sidebar collapsible="icon" className="border-r bg-[#f8fbff]" {...props}>
      <SidebarHeader
        className={`pt-6 pb-4 ${isCollapsed ? "px-0 flex justify-center" : "px-6"}`}
      >
        <div
          className={`flex items-center ${isCollapsed ? "justify-center" : "gap-3"} font-semibold text-2xl tracking-tight text-gray-900 ${isCollapsed ? "" : "w-full"}`}
        >
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-gray-900 text-white shrink-0">
            <Hexagon className="h-5 w-5 fill-current" />
          </div>
          {!isCollapsed && <span>eDoc</span>}
        </div>
      </SidebarHeader>

      <SidebarContent className={isCollapsed ? "px-2" : "px-3"}>
        <SidebarGroup>
          {!isCollapsed && (
            <SidebarGroupLabel className="text-xs font-medium text-gray-500 uppercase tracking-wider mb-2">
              Main Menu
            </SidebarGroupLabel>
          )}
          <SidebarGroupContent>
            <SidebarMenu className={isCollapsed ? "items-center" : ""}>
              {mainNav.map((item) => {
                const isActive = pathname === item.url;
                return (
                  <SidebarMenuItem key={item.title}>
                    <SidebarMenuButton
                      asChild
                      isActive={isActive}
                      tooltip={item.title}
                      className={
                        isActive
                          ? "bg-gray-800 text-white data-active:bg-gray-800 data-active:text-white hover:bg-gray-700 hover:text-white"
                          : "text-gray-600 hover:text-gray-900 hover:bg-gray-100"
                      }
                    >
                      <Link
                        href={item.url}
                        className={
                          isCollapsed ? "" : "font-medium"
                        }
                      >
                        <item.icon
                          className={`h-4 w-4 ${isCollapsed ? "" : "mr-2"}`}
                        />
                        {!isCollapsed && <span>{item.title}</span>}
                      </Link>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                );
              })}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>

        <div className="px-4 py-2">
          <Separator className="bg-gray-200" />
        </div>

        <SidebarGroup>
          {!isCollapsed && (
            <SidebarGroupLabel className="text-xs font-medium text-gray-500 uppercase tracking-wider mb-2">
              Marketing
            </SidebarGroupLabel>
          )}
          <SidebarGroupContent>
            <SidebarMenu className={isCollapsed ? "items-center" : ""}>
              {marketingItems.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton
                    type="button"
                    tooltip={item.title}
                    className={`text-gray-600 hover:text-gray-900 hover:bg-gray-100 ${isCollapsed ? "justify-center" : "font-medium"}`}
                  >
                    <item.icon
                      className={`h-4 w-4 ${isCollapsed ? "" : "mr-2"}`}
                    />
                    {!isCollapsed && <span>{item.title}</span>}
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>

        <div className="px-4 py-2">
          <Separator className="bg-gray-200" />
        </div>

        <SidebarGroup>
          {!isCollapsed && (
            <SidebarGroupLabel className="text-xs font-medium text-gray-500 uppercase tracking-wider mb-2">
              Preferences
            </SidebarGroupLabel>
          )}
          <SidebarGroupContent>
            <SidebarMenu className={isCollapsed ? "items-center" : ""}>
              {preferenceItems.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton
                    type="button"
                    tooltip={item.title}
                    className={`text-gray-600 hover:text-gray-900 hover:bg-gray-100 ${isCollapsed ? "justify-center" : "font-medium"}`}
                  >
                    <item.icon
                      className={`h-4 w-4 ${isCollapsed ? "" : "mr-2"}`}
                    />
                    {!isCollapsed && <span>{item.title}</span>}
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>

      <SidebarFooter
        className={`p-4 pb-6 space-y-4 ${isCollapsed ? "items-center px-2" : ""}`}
      >
        {!isCollapsed && showTrialCard && (
          <div className="rounded-xl border bg-gray-50 p-4 relative overflow-hidden">
            <div className="absolute top-0 right-0 p-2">
              <button
                type="button"
                onClick={() => setShowTrialCard(false)}
                aria-label="Dismiss trial card"
                className="text-gray-400 text-lg leading-none cursor-pointer hover:text-gray-700"
              >
                &times;
              </button>
            </div>
            <div className="flex items-center gap-2 mb-3">
              <div className="rounded-full bg-gray-900 p-1.5 inline-flex">
                <Hexagon className="h-4 w-4 text-white" />
              </div>
              <span className="text-xs font-bold text-white bg-gray-900 rounded-full px-2 py-1">
                20 days left
              </span>
            </div>
            <p className="text-xs text-gray-600 mb-4 font-medium leading-relaxed">
              Upgrade to premium and enjoy the benefits for a long time
            </p>
            <Button
              variant="outline"
              className="w-full bg-white text-gray-900 hover:bg-gray-100 font-semibold border-gray-200"
            >
              View plan
            </Button>
          </div>
        )}

        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <div
              className={`flex items-center gap-3 rounded-xl border p-2 hover:bg-gray-100 cursor-pointer transition-colors ${isCollapsed ? "justify-center w-full" : ""}`}
            >
              <Avatar className="h-10 w-10 shrink-0">
                <AvatarImage
                  src="https://github.com/shadcn.png"
                  alt="Felicia Reid"
                />
                <AvatarFallback className="bg-gray-800 text-white font-bold">
                  FR
                </AvatarFallback>
              </Avatar>
              {!isCollapsed && (
                <>
                  <div className="flex flex-col flex-1 overflow-hidden min-w-0">
                    <span className="text-sm font-semibold truncate text-gray-900">
                      Felicia Reid
                    </span>
                    <span className="text-xs text-gray-500 truncate">
                      felicia@gmail.com
                    </span>
                  </div>
                  <MoreHorizontal className="h-4 w-4 text-gray-400 shrink-0" />
                </>
              )}
            </div>
          </DropdownMenuTrigger>
          <DropdownMenuContent
            align={isCollapsed ? "start" : "end"}
            className="w-56"
            side="right"
          >
            <DropdownMenuLabel>My Account</DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuItem>
              <UserIcon className="mr-2 h-4 w-4" />
              <span>Profile</span>
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem
              asChild
              className="text-red-600 focus:bg-red-50 focus:text-red-600 cursor-pointer"
            >
              <Link href="/">
                <LogOut className="mr-2 h-4 w-4" />
                <span>Log out</span>
              </Link>
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </SidebarFooter>

      <SidebarRail />
    </Sidebar>
  );
}
