"use client";

import { type ReactNode, createContext, useContext, useMemo } from "react";

export type FeatureProviderProps = {
  /**
   * Keys of the sections that are ON for the signed-in person, as the API answers them
   * (`GET /me/features`). Pass `undefined` while the request is loading.
   */
  features: readonly string[] | undefined;
  children: ReactNode;
};

export type FeaturesState = {
  /** The keys that are on. Empty while loading. */
  features: readonly string[];
  /** True until the app has the answer from the API. A feature is off meanwhile. */
  isLoading: boolean;
  /** Whether a section is on. Off while loading, off for an unknown key. */
  has: (key: string) => boolean;
};

type Context = { keys: ReadonlySet<string>; isLoading: boolean; features: readonly string[] };

// Without a provider nothing is on and nothing is loading: a missing provider fails closed
// and shows what an off section shows, instead of waiting forever.
const FAIL_CLOSED: Context = { keys: new Set(), isLoading: false, features: [] };

const FeatureContext = createContext<Context>(FAIL_CLOSED);

/**
 * Makes the list of sections that are on available to the tree below. Context only: it
 * fetches nothing, the app owns its API client and passes the answer in.
 */
export function FeatureProvider({ features, children }: FeatureProviderProps) {
  // Keyed on the content, not the array identity, so an app that builds a new array on every
  // render does not re-render every consumer.
  const signature = features === undefined ? null : features.join("\u0000");

  // biome-ignore lint/correctness/useExhaustiveDependencies: `signature` stands for the content of `features`.
  const value = useMemo<Context>(
    () => ({
      keys: new Set(features ?? []),
      isLoading: features === undefined,
      features: features ?? [],
    }),
    [signature],
  );

  return <FeatureContext.Provider value={value}>{children}</FeatureContext.Provider>;
}

/** Whether a section is on for the signed-in person. Off while loading and without a provider. */
export function useFeature(key: string): boolean {
  return useContext(FeatureContext).keys.has(key);
}

/** The whole answer: the keys that are on, whether it is still loading, and `has(key)`. */
export function useFeatures(): FeaturesState {
  const { keys, isLoading, features } = useContext(FeatureContext);
  return useMemo(
    () => ({ features, isLoading, has: (key: string) => keys.has(key) }),
    [features, isLoading, keys],
  );
}
