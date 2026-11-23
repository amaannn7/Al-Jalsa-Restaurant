import type { ElementType, ReactNode } from "react";

/**
 * Wrapper kept for structure. Children marked data-reveal fade in once when they enter the
 * screen (handled by the single RevealObserver in the layout). Images are never animated.
 */
export function Reveal({ children, as: Tag = "div", className = "" }: { children: ReactNode; as?: ElementType; className?: string }) {
  return <Tag className={className}>{children}</Tag>;
}
