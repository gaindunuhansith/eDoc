"use client";

import * as React from "react";
import {
  LayoutDashboard,
  Users,
  Building2,
  Tag,
  CheckSquare,
  Package,
  Mail,
  Blocks,
  Settings,
  Hexagon,
  MoreHorizontal,
} from "lucide-react";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupAction,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarRail,
} from "@/components/ui/sidebar";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";

const navItems = {
  main: [
    { title: "Dashboard", url: "#", icon: LayoutDashboard, isActive: true },
    { title: "Contacts", url: "#", icon: Users },
    { title: "Companies", url: "#", icon: Building2 },
    { title: "Deals", url: "#", icon: Tag },
    { title: "Tasks", url: "#", icon: CheckSquare },
  ],
  marketing: [
    { title: "Products", url: "#", icon: Package },
    { title: "Emails", url: "#", icon: Mail },
  ],
  preferences: [
    { title: "Integrations", url: "#", icon: Blocks },
    { title: "Settings", url: "#", icon: Settings },
  ],
};

export function AppSidebar(props: React.ComponentProps<typeof Sidebar>) {
  return (
    <Sidebar className="border-r bg-brand-light" {...props}>
      <SidebarHeader className="pt-6 pb-4 px-6">
        <div className="flex items-center gap-3 font-semibold text-2xl tracking-tight text-brand-dark">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-brand-dark text-brand-light">
            <Hexagon className="h-5 w-5" />
          </div>
          Aivox
        </div>
      </SidebarHeader>

      <SidebarContent className="px-3">
        {/* MAIN MENU */}
        <SidebarGroup>
          <SidebarGroupLabel className="text-xs font-medium text-gray-500 uppercase tracking-wider mb-2">
            Main Menu
          </SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {navItems.main.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton
                    asChild
                    isActive={item.isActive}
                    className={
                      item.isActive
                        ? "bg-brand-dark text-brand-light hover:bg-brand-dark/90 hover:text-brand-light"
                        : "text-gray-600 hover:text-brand-dark hover:bg-gray-100"
                    }
                  >
                    <a href={item.url} className="font-medium">
                      <item.icon className="h-4 w-4 mr-2" />
                      <span>{item.title}</span>
                    </a>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>

        {/* MARKETING */}
        <SidebarGroup className="mt-4">
          <SidebarGroupLabel className="text-xs font-medium text-gray-500 uppercase tracking-wider mb-2">
            Marketing
          </SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {navItems.marketing.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton
                    asChild
                    className="text-gray-600 font-medium hover:text-brand-dark hover:bg-gray-100"
                  >
                    <a href={item.url}>
                      <item.icon className="h-4 w-4 mr-2" />
                      <span>{item.title}</span>
                    </a>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>

        {/* PREFERENCES */}
        <SidebarGroup className="mt-4">
          <SidebarGroupLabel className="text-xs font-medium text-gray-500 uppercase tracking-wider mb-2">
            Preferences
          </SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {navItems.preferences.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton
                    asChild
                    className="text-gray-600 font-medium hover:text-brand-dark hover:bg-gray-100"
                  >
                    <a href={item.url}>
                      <item.icon className="h-4 w-4 mr-2" />
                      <span>{item.title}</span>
                    </a>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>

      <SidebarFooter className="p-6 pb-8 space-y-6">
        {/* Upgrade Box */}
        <div className="rounded-xl border bg-gray-50 p-4 relative overflow-hidden">
          <div className="absolute top-0 right-0 p-2">
            {/* Close icon substitute */}
            <span className="text-gray-400 text-lg leading-none cursor-pointer hover:text-gray-700">&times;</span>
          </div>
          
          <div className="flex items-center gap-2 mb-3">
            <div className="rounded-full bg-brand-dark p-1.5 inline-flex">
               <Hexagon className="h-4 w-4 text-brand-light" />
            </div>
            <span className="text-xs font-bold text-brand-light bg-brand-dark rounded-full px-2 py-1">20 days left</span>
          </div>
          <p className="text-xs text-gray-600 mb-4 font-medium leading-relaxed">
            Upgrade to premium and enjoy the benefits for a long time
          </p>
          <Button variant="outline" className="w-full bg-brand-light text-brand-dark hover:bg-gray-100 font-semibold border-gray-200">
            View plan
          </Button>
        </div>

        {/* User Profile */}
        <div className="flex items-center gap-3 rounded-xl border p-3 hover:bg-gray-50 cursor-pointer transition-colors">
          <Avatar className="h-10 w-10">
            <AvatarImage src="https://github.com/shadcn.png" alt="Felicia Reid" />
            <AvatarFallback className="bg-brand-orange text-brand-light font-bold">FR</AvatarFallback>
          </Avatar>
          <div className="flex flex-col flex-1 overflow-hidden">
            <span className="text-sm font-semibold truncate text-brand-dark">Felicia Reid</span>
            <span className="text-xs text-gray-500 truncate">felicia@gmail.com</span>
          </div>
          <MoreHorizontal className="h-4 w-4 text-gray-400" />
        </div>
      </SidebarFooter>
      <SidebarRail />
    </Sidebar>
  );
}