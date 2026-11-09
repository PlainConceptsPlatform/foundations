"use client";

import { useEffect } from "react";

export default function Page() {
  useEffect(() => {
    window.location.replace(
      `../case-studies/add-ai-to-a-project${window.location.search}${window.location.hash}`,
    );
  }, []);

  return (
    <p>
      Moving to <a href="../case-studies/add-ai-to-a-project">Add AI to a project</a>.
    </p>
  );
}
