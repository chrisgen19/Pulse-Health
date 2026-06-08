"use client";

import React, { useState } from "react";
import { useServerInsertedHTML } from "next/navigation";
import { StyleRegistry, createStyleRegistry } from "styled-jsx";

/**
 * Collects styled-jsx styles during server rendering and injects them into the
 * streamed HTML, so `<style jsx>` rules are present on first paint instead of
 * being attached client-side after hydration (which caused a flash of
 * unstyled content on reload). See: Next.js "How to use CSS-in-JS libraries".
 */
export default function StyledJsxRegistry({
  children,
}: {
  children: React.ReactNode;
}) {
  // Create the stylesheet only once, lazily.
  const [jsxStyleRegistry] = useState(() => createStyleRegistry());

  useServerInsertedHTML(() => {
    const styles = jsxStyleRegistry.styles();
    jsxStyleRegistry.flush();
    return <>{styles}</>;
  });

  return <StyleRegistry registry={jsxStyleRegistry}>{children}</StyleRegistry>;
}
