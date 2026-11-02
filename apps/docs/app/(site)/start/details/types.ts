/**
 * The full guide behind one piece of the journey, opened from the step panel. The panel
 * says what a piece is in a line; the guide says how to do it by hand in any repository,
 * with tools anyone can install, and only at the end how Platform does the same.
 */

export type CodeSample = {
  /** Shiki language id: "md", "json", "yaml", "ts", "js", "bash", "sh". */
  lang: string;
  code: string;
  /** The path the code lives at, shown above it. */
  file?: string;
  /** Set on every sample of a group shown as tabs, such as "OpenCode" and "Claude Code". */
  tab?: string;
};

export type GuideSection = {
  title: string;
  /** Plain prose. Separate paragraphs with a blank line. */
  body: string;
  code?: CodeSample[];
};

export type StepGuide = {
  /** What goes wrong without the piece, as a concrete scene rather than a principle. */
  problem: string;
  /** Doing it by hand, in order, with tools that are not ours. */
  sections: GuideSection[];
  /** How to tell that it works. */
  verify: string[];
  /** The mistakes people make with it. */
  pitfalls: string[];
  /** What the Platform shortcut does for this piece, in a sentence or two. */
  platform: string;
  links?: { label: string; href: string }[];
};
