"use client";

import { MobileSidebar } from "./sidebar";
import { ThemeToggle } from "@/components/ui/theme-toggle";

interface HeaderProps {
  title?: string;
  description?: string;
}

export function Header({ title, description }: HeaderProps) {
  return (
    <header className="sticky top-0 z-40 border-b border-border bg-background/80 backdrop-blur-md lg:hidden">
      <div className="flex items-center gap-4 px-4 h-14">
        <MobileSidebar />

        <div className="flex items-center gap-3">
          <span className="font-bold text-foreground">Chinoize Cup Stats</span>
        </div>

        <div className="ml-auto">
          <ThemeToggle />
        </div>
      </div>
    </header>
  );
}
