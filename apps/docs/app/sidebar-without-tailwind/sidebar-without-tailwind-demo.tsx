"use client";

import {
  BarChart3,
  FileText,
  FolderKanban,
  LayoutDashboard,
  LogOut,
  Monitor,
  Moon,
  PanelLeftClose,
  PanelLeftOpen,
  Settings,
  Sun,
} from "lucide-react";
import { useState } from "react";

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
  AppSidebarThemeToggle,
  AppSidebarUserCard,
  AppSidebarUserMenuDivider,
  AppSidebarUserMenuItem,
} from "@plainconceptsplatform/ui-components/app-sidebar";

export function SidebarWithoutTailwindDemo() {
  const [theme, setTheme] = useState<"light" | "dark" | "system">("light");

  const userDropdown = (
    <>
      <AppSidebarThemeToggle
        value={theme}
        onChange={setTheme}
        icons={{
          light: <Sun size={14} />,
          dark: <Moon size={14} />,
          system: <Monitor size={14} />,
        }}
      />
      <AppSidebarUserMenuDivider />
      <AppSidebarUserMenuItem icon={<LogOut size={16} />}>Sign out</AppSidebarUserMenuItem>
    </>
  );

  return (
    <AppLayout>
      <AppLayoutSidebar>
        <AppSidebar>
          <AppSidebarHeader>
            <AppSidebarBrand
              name="Platform"
              logo={<span className="text-sidebar-primary font-bold">P</span>}
            />
            <AppSidebarActions>
              <AppSidebarCollapseButton
                expandIcon={<PanelLeftOpen size={16} />}
                collapseIcon={<PanelLeftClose size={16} />}
              />
            </AppSidebarActions>
          </AppSidebarHeader>
          <AppSidebarSeparator />
          <AppSidebarContent>
            <AppSidebarNav>
              <AppSidebarNavGroup label="Navigation">
                <AppSidebarNavItem to="#" isActive icon={LayoutDashboard} label="Dashboard" />
                <AppSidebarNavItem to="#" icon={FolderKanban} label="Projects" />
                <AppSidebarNavItem to="#" icon={FileText} label="Policies" />
                <AppSidebarNavItem to="#" icon={Settings} label="Settings" />
              </AppSidebarNavGroup>
              <AppSidebarNavGroup label="Reports">
                <AppSidebarNavItem to="#" icon={BarChart3} label="Overview" />
              </AppSidebarNavGroup>
            </AppSidebarNav>
          </AppSidebarContent>
          <AppSidebarSpacer />
          <AppSidebarFooter>
            <AppSidebarUserCard name="Jane Doe" subtitle="Admin" dropdown={userDropdown} />
          </AppSidebarFooter>
        </AppSidebar>
      </AppLayoutSidebar>
      <AppLayoutContent>
        <h1>Consumer content</h1>
        <p>
          This page is the docs app pretending to be an app without Tailwind preflight: the body is
          set to Georgia from hand-written globals, the sidebar still uses the Platform font, the
          theme toggle shows no fieldset border, and the nav anchors are not underlined. The
          hand-written globals also set a link colour of their own on every anchor, and the sidebar
          still paints its own token colours over it.
        </p>
      </AppLayoutContent>
    </AppLayout>
  );
}
