import { Callout } from "fumadocs-ui/components/callout";
import type { ReactNode } from "react";

const ORG_URL = "https://github.com/PlainConceptsPlatform";

/**
 * The one way this public site marks a link to a private repository, such as Kitchen-Sink or
 * Project-Health-Platform. `inline` follows the link in a sentence; the block form opens a
 * section whose links are all private.
 */
export function Internal({ inline, children }: { inline?: boolean; children?: ReactNode }) {
  if (inline) {
    return (
      <span className="text-muted-foreground text-sm">
        {" "}
        (internal: requires access to <a href={ORG_URL}>PlainConceptsPlatform</a>)
      </span>
    );
  }
  return (
    <Callout type="info" title="Internal">
      {children} Requires access to the <a href={ORG_URL}>PlainConceptsPlatform</a> organisation on
      GitHub. Everything else on this page is public.
    </Callout>
  );
}
