"use client";

import { usePathname } from "next/navigation";
import { Search, Bell, Plus, HelpCircle } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { SidebarTrigger } from "@/components/ui/sidebar";

export function TopHeader() {
  const pathname = usePathname();

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
    return "Dashboard";
  };

  return (
    <header className="flex shrink-0 items-center justify-between p-4 h-16 bg-white border-b border-gray-100">
      <div className="flex items-center gap-4">
        <SidebarTrigger />
        <h1 className="text-xl font-semibold text-gray-800">{getTitle()}</h1>
      </div>

      <div className="flex items-center gap-4">
        <Button
          variant="outline"
          className="hidden md:flex gap-2 text-gray-600 rounded-full h-9 px-4"
        >
          <HelpCircle className="h-4 w-4" />
          <span className="text-sm font-medium">Need help</span>
        </Button>

        <Button
          variant="ghost"
          size="icon"
          className="rounded-full border border-gray-200"
        >
          <Search className="h-4 w-4 text-gray-600" />
        </Button>

        <div className="relative">
          <Button
            variant="ghost"
            size="icon"
            className="rounded-full border border-gray-200"
          >
            <Bell className="h-4 w-4 text-gray-600" />
          </Button>
          <span className="absolute top-1 right-1 h-2 w-2 rounded-full bg-red-500 border-2 border-white"></span>
        </div>

        <div className="flex items-center -space-x-3 ml-2">
          <Avatar className="h-9 w-9 border-2 border-white pointer-events-none">
            <AvatarImage src="https://i.pravatar.cc/150?u=1" />
            <AvatarFallback>U1</AvatarFallback>
          </Avatar>
          <Avatar className="h-9 w-9 border-2 border-white relative z-10 pointer-events-none">
            <AvatarImage src="https://i.pravatar.cc/150?u=2" />
            <AvatarFallback>U2</AvatarFallback>
          </Avatar>
          <Avatar className="h-9 w-9 border-2 border-white relative z-20 pointer-events-none">
            <AvatarImage src="https://i.pravatar.cc/150?u=3" />
            <AvatarFallback>U3</AvatarFallback>
          </Avatar>
          <Button
            variant="outline"
            size="icon"
            className="h-9 w-9 rounded-full border-dashed border-2 relative z-30 bg-white hover:bg-gray-50"
          >
            <Plus className="h-4 w-4 text-gray-600" />
          </Button>
        </div>
      </div>
    </header>
  );
}
