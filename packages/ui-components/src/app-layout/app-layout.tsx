"use client";

import type { ReactNode } from "react";
import { AppSidebarProvider } from "../app-sidebar";
import { cn } from "../lib/utils";

type AppLayoutProps = {
  children: ReactNode;
  className?: string;
};

type AppLayoutSidebarProps = {
  children: ReactNode;
  className?: string;
};

type AppLayoutContentProps = {
  children: ReactNode;
  className?: string;
};

export function AppLayout({ children, className }: AppLayoutProps) {
  return (
    <AppSidebarProvider>
      <div
        data-layout="root"
        className={cn("grid min-h-dvh w-full grid-cols-[auto_minmax(0,1fr)]", className)}
      >
        {children}
      </div>
    </AppSidebarProvider>
  );
}

export function AppLayoutSidebar({ children, className }: AppLayoutSidebarProps) {
  return (
    <div data-layout="sidebar" className={className}>
      {children}
    </div>
  );
}

export function AppLayoutContent({ children, className }: AppLayoutContentProps) {
  return (
    <div data-layout="content" className={cn("flex min-w-0 flex-col", className)}>
      {children}
    </div>
  );
}
