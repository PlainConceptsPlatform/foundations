"use client";

import {
  FolderKanban,
  LayoutDashboard,
  PanelLeftClose,
  PanelLeftOpen,
  Settings,
  Users,
} from "lucide-react";

import {
  AppLayout,
  AppLayoutContent,
  AppLayoutSidebar,
} from "@plainconceptsplatform/ui-components/app-layout";
import {
  AppSidebar,
  AppSidebarActions,
  AppSidebarBrand,
  AppSidebarCollapseButton,
  AppSidebarContent,
  AppSidebarFooter,
  AppSidebarHeader,
  AppSidebarNav,
  AppSidebarNavGroup,
  AppSidebarNavItem,
  AppSidebarSeparator,
  AppSidebarSpacer,
  AppSidebarUserCard,
} from "@plainconceptsplatform/ui-components/app-sidebar";

export function AppLayoutDemo() {
  return (
    <div className="overflow-hidden rounded-md border">
      <AppLayout>
        <AppLayoutSidebar>
          <AppSidebar>
            <AppSidebarHeader>
              <AppSidebarBrand
                name="Platform"
                logo={<span className="font-bold text-sidebar-primary">P</span>}
              />
              <AppSidebarActions>
                <AppSidebarCollapseButton
                  expandIcon={<PanelLeftOpen className="size-4" />}
                  collapseIcon={<PanelLeftClose className="size-4" />}
                />
              </AppSidebarActions>
            </AppSidebarHeader>
            <AppSidebarSeparator />
            <AppSidebarContent>
              <AppSidebarNav>
                <AppSidebarNavGroup label="Navigation">
                  <AppSidebarNavItem to="#" isActive icon={LayoutDashboard} label="Dashboard" />
                  <AppSidebarNavItem to="#" icon={FolderKanban} label="Projects" />
                  <AppSidebarNavItem to="#" icon={Users} label="Team" />
                  <AppSidebarNavItem to="#" icon={Settings} label="Settings" />
                </AppSidebarNavGroup>
              </AppSidebarNav>
            </AppSidebarContent>
            <AppSidebarSpacer />
            <AppSidebarFooter>
              <AppSidebarUserCard name="Jane Doe" subtitle="Admin" />
            </AppSidebarFooter>
          </AppSidebar>
        </AppLayoutSidebar>
        <AppLayoutContent>
          <div className="flex h-12 items-center gap-2 border-b bg-card px-4 text-sm text-muted-foreground">
            The header stays the app's own: any markup, height and content
          </div>
          <main className="flex flex-1 flex-col gap-4 p-6">
            <p className="text-sm text-muted-foreground">
              The content cell holds a wide table here. It scrolls instead of pushing the sidebar
              column, because the cell carries min-w-0 and the sidebar sizes its own grid track.
            </p>
            <table className="w-full min-w-[48rem] table-auto border-collapse text-sm">
              <thead>
                <tr className="border-b text-left text-muted-foreground">
                  <th className="py-2 pr-4 font-medium">Project</th>
                  <th className="py-2 pr-4 font-medium">Owner</th>
                  <th className="py-2 pr-4 font-medium">Status</th>
                  <th className="py-2 font-medium">Updated</th>
                </tr>
              </thead>
              <tbody>
                {["Atlas", "Capacity", "Numa", "Foundations"].map((name) => (
                  <tr key={name} className="border-b">
                    <td className="py-2 pr-4">{name}</td>
                    <td className="py-2 pr-4">Jane Doe</td>
                    <td className="py-2 pr-4">Active</td>
                    <td className="py-2">Today</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </main>
        </AppLayoutContent>
      </AppLayout>
    </div>
  );
}
