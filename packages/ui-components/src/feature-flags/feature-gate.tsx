"use client";

import type { ReactNode } from "react";
import { useFeatures } from "./feature-context";

export type FeatureGateProps = {
  /** Key of the section. */
  feature: string;
  /** Rendered when the section is off or still loading. Nothing by default. */
  fallback?: ReactNode;
  children: ReactNode;
};

/**
 * Renders its children only when the section is on: a menu item, a button, a tab. It is a
 * convenience for the UI, the API already refuses what is off.
 */
export function FeatureGate({ feature, fallback = null, children }: FeatureGateProps) {
  const { has } = useFeatures();
  return <>{has(feature) ? children : fallback}</>;
}

export type FeatureGuardProps = {
  /** Key of the section the route belongs to. */
  feature: string;
  /**
   * What the app shows for a route that does not exist: its own not-found page. A section
   * that is off must look like it does not exist, so there is no "no access" variant.
   */
  notFound: ReactNode;
  /** Rendered while the list of sections is still loading. Nothing by default. */
  loading?: ReactNode;
  children: ReactNode;
};

/**
 * Wraps the page of a section. When the section is off it renders `notFound`, never a
 * message that says the person lacks access, because a hidden section looks like it does
 * not exist.
 */
export function FeatureGuard({ feature, notFound, loading = null, children }: FeatureGuardProps) {
  const { has, isLoading } = useFeatures();
  if (isLoading) return <>{loading}</>;
  return <>{has(feature) ? children : notFound}</>;
}
