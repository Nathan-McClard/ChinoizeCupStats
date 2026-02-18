"use client";

import { MobileSidebar } from "./sidebar";
import { ThemeToggle } from "@/components/ui/theme-toggle";

interface HeaderProps {
  title?: string;
  description?: string;
}

export function Header({ title, description }: HeaderProps) {
  return (
    <header className="sticky top-0 z-40 border-b border-border bg-background/80 backdrop-blur-md">
      <div className="flex items-center gap-4 px-4 lg:px-6 h-14">
        <MobileSidebar />

        <div className="flex items-center gap-3 lg:hidden">
          <span className="font-bold text-foreground">ChinoizeCupStats</span>
        </div>

        {title && (
          <div className="hidden lg:block">
            <h2 className="text-lg font-semibold text-foreground">{title}</h2>
            {description && (
              <p className="text-xs text-muted-foreground">{description}</p>
            )}
          </div>
        )}

        <div className="ml-auto">
          <ThemeToggle />
        </div>
      </div>
    </header>
  );
}
