import { Toaster } from "@plainconceptsplatform/ui-components/toaster";
import { RootProvider } from "fumadocs-ui/provider";
import type { ReactNode } from "react";
import "../global.css";

export default function Layout({ children }: { children: ReactNode }) {
  return (
    <>
      <RootProvider>{children}</RootProvider>
      <Toaster />
    </>
  );
}
