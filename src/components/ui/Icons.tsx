import type { SVGProps } from "react";

type P = SVGProps<SVGSVGElement> & { size?: number };
const base = (size = 20, props: P) => ({
  width: size,
  height: size,
  viewBox: "0 0 24 24",
  fill: "none",
  stroke: "currentColor",
  strokeWidth: 1.5,
  strokeLinecap: "round" as const,
  strokeLinejoin: "round" as const,
  "aria-hidden": true,
  focusable: false,
  ...props,
});

export const IconBag = ({ size, ...p }: P) => (
  <svg {...base(size, p)}><path d="M5 8h14l-1.2 11.2a2 2 0 0 1-2 1.8H8.2a2 2 0 0 1-2-1.8L5 8Z" /><path d="M9 8V6.5a3 3 0 0 1 6 0V8" /></svg>
);
export const IconPhone = ({ size, ...p }: P) => (
  <svg {...base(size, p)}><path d="M5 3.5h3l1.5 4-2 1.3a11 11 0 0 0 7.7 7.7l1.3-2 4 1.5v3a2 2 0 0 1-2.2 2A17 17 0 0 1 3 5.7 2 2 0 0 1 5 3.5Z" /></svg>
);
export const IconPin = ({ size, ...p }: P) => (
  <svg {...base(size, p)}><path d="M12 21s7-6.1 7-11.5A7 7 0 0 0 5 9.5C5 14.9 12 21 12 21Z" /><circle cx="12" cy="9.5" r="2.5" /></svg>
);
export const IconClock = ({ size, ...p }: P) => (
  <svg {...base(size, p)}><circle cx="12" cy="12" r="8.5" /><path d="M12 7.5V12l3 2" /></svg>
);
export const IconPlus = ({ size, ...p }: P) => (
  <svg {...base(size, p)}><path d="M12 5v14M5 12h14" /></svg>
);
export const IconMinus = ({ size, ...p }: P) => (
  <svg {...base(size, p)}><path d="M5 12h14" /></svg>
);
export const IconClose = ({ size, ...p }: P) => (
  <svg {...base(size, p)}><path d="M6 6l12 12M18 6 6 18" /></svg>
);
export const IconSearch = ({ size, ...p }: P) => (
  <svg {...base(size, p)}><circle cx="11" cy="11" r="6.5" /><path d="m20 20-4.2-4.2" /></svg>
);
/** Points to the reading direction's "forward" (flips in RTL). */
export const IconArrow = ({ size, className = "", ...p }: P) => (
  <svg {...base(size, p)} className={`rtl:-scale-x-100 ${className}`}><path d="M4 12h15M13 6l6 6-6 6" /></svg>
);
export const IconCheck = ({ size, ...p }: P) => (
  <svg {...base(size, p)}><path d="m5 12.5 4.5 4.5L19 7.5" /></svg>
);
export const IconInfo = ({ size, ...p }: P) => (
  <svg {...base(size, p)}><circle cx="12" cy="12" r="8.5" /><path d="M12 11v5.5M12 7.8v.2" /></svg>
);
export const IconMail = ({ size, ...p }: P) => (
  <svg {...base(size, p)}><rect x="3.5" y="5.5" width="17" height="13" rx="1.5" /><path d="m4 7 8 6 8-6" /></svg>
);
export const IconCalendar = ({ size, ...p }: P) => (
  <svg {...base(size, p)}><rect x="3.5" y="5" width="17" height="15" rx="1.5" /><path d="M3.5 10h17M8 3v4M16 3v4" /></svg>
);
export const IconUsers = ({ size, ...p }: P) => (
  <svg {...base(size, p)}><circle cx="9" cy="8.5" r="3.2" /><path d="M3.5 19c.6-3.2 2.8-5 5.5-5s4.9 1.8 5.5 5" /><path d="M15.5 5.6a3.2 3.2 0 0 1 0 5.8M17.5 14.4c1.6.7 2.6 2.3 3 4.6" /></svg>
);

/* Brand marks (filled). */
const brand = (size = 20, props: P) => ({ width: size, height: size, viewBox: "0 0 24 24", fill: "currentColor", "aria-hidden": true, focusable: false, ...props });

export const IconWhatsApp = ({ size, ...p }: P) => (
  <svg {...brand(size, p)}>
    <path d="M12 2.2a9.7 9.7 0 0 0-8.3 14.8L2.4 21.6l4.7-1.2A9.7 9.7 0 1 0 12 2.2Zm0 17.7a8 8 0 0 1-4.1-1.1l-.3-.2-2.8.7.8-2.7-.2-.3A8 8 0 1 1 12 19.9Zm4.4-6c-.2-.1-1.4-.7-1.7-.8-.2-.1-.4-.1-.5.1l-.8.9c-.1.2-.3.2-.5.1a6.5 6.5 0 0 1-3.2-2.8c-.2-.4.2-.4.7-1.3.1-.2 0-.3 0-.4l-.8-1.8c-.2-.5-.4-.4-.5-.4h-.5a.9.9 0 0 0-.7.3 2.8 2.8 0 0 0-.9 2.1 4.9 4.9 0 0 0 1 2.6 11.2 11.2 0 0 0 4.3 3.8c1.6.7 2.2.7 3 .6a2.6 2.6 0 0 0 1.7-1.2 2.1 2.1 0 0 0 .2-1.2c-.1-.1-.3-.2-.5-.3Z" />
  </svg>
);
export const IconFacebook = ({ size, ...p }: P) => (
  <svg {...brand(size, p)}><path d="M13.4 21v-8h2.7l.4-3.2h-3.1v-2c0-.9.3-1.5 1.6-1.5h1.6V3.4a22 22 0 0 0-2.4-.1c-2.4 0-4 1.4-4 4.1v2.4H7.5V13h2.7v8h3.2Z" /></svg>
);
export const IconInstagram = ({ size, ...p }: P) => (
  <svg {...base(size, p)}><rect x="3.5" y="3.5" width="17" height="17" rx="4.5" /><circle cx="12" cy="12" r="3.8" /><circle cx="17.2" cy="6.8" r=".6" fill="currentColor" /></svg>
);
export const IconTikTok = ({ size, ...p }: P) => (
  <svg {...brand(size, p)}><path d="M16.6 3h-3.1v12.2a2.7 2.7 0 1 1-2.7-2.7c.3 0 .6 0 .8.1V9.4a5.9 5.9 0 1 0 5 5.8V9a7.4 7.4 0 0 0 4.3 1.4V7.3a4.3 4.3 0 0 1-4.3-4.3Z" /></svg>
);
export const IconSnapchat = ({ size, ...p }: P) => (
  <svg {...brand(size, p)}><path d="M12 2.8c2.9 0 5 2.2 5 5.1v2.3l1.6-.5c.5-.1 1 .4.7.9-.3.6-1.6 1-2.1 1.2.4 1.5 1.8 3.3 3.6 3.8.4.1.4.6.1.8-.6.4-1.6.5-2.2.6-.2.4-.2 1.1-.7 1.1-.6 0-1.4-.4-2.6 0-1.2.4-1.8 1.7-3.4 1.7s-2.2-1.3-3.4-1.7c-1.2-.4-2-.1-2.6 0-.5 0-.5-.7-.7-1.1-.6-.1-1.6-.2-2.2-.6-.3-.2-.3-.7.1-.8 1.8-.5 3.2-2.3 3.6-3.8-.5-.2-1.8-.6-2.1-1.2-.3-.5.2-1 .7-.9l1.6.5V7.9c0-2.9 2.1-5.1 5-5.1Z" /></svg>
);
export const IconX = ({ size, ...p }: P) => (
  <svg {...brand(size, p)}><path d="M17.6 3.5h3l-6.6 7.5 7.8 9.5h-6.1l-4.8-5.9-5.4 5.9h-3l7-7.9L2 3.5h6.2l4.3 5.4 5.1-5.4Zm-1 15.3h1.7L7.5 5.1H5.7l10.9 13.7Z" /></svg>
);
export const IconGoogle = ({ size, ...p }: P) => (
  <svg {...brand(size, p)}><path d="M21.6 12.2c0-.7-.1-1.4-.2-2H12v3.8h5.4a4.6 4.6 0 0 1-2 3v2.5h3.2c1.9-1.7 3-4.3 3-7.3ZM12 22c2.7 0 5-.9 6.6-2.4l-3.2-2.5c-.9.6-2 1-3.4 1-2.6 0-4.8-1.8-5.6-4.1H3.1v2.6A10 10 0 0 0 12 22Zm-5.6-8c-.2-.6-.3-1.3-.3-2s.1-1.4.3-2V7.4H3.1a10 10 0 0 0 0 9.2L6.4 14ZM12 5.9c1.5 0 2.8.5 3.8 1.5l2.9-2.9A10 10 0 0 0 3.1 7.4L6.4 10c.8-2.4 3-4.1 5.6-4.1Z" /></svg>
);
/** Diagonal "go" arrow (north-east; mirrored to north-west in RTL). */
export const IconArrowUpRight = ({ size, className = "", ...p }: P) => (
  <svg {...base(size, p)} className={`rtl:-scale-x-100 ${className}`}><path d="M7 17 17 7M8.5 7H17v8.5" /></svg>
);
export const IconMenu = ({ size, ...p }: P) => (
  <svg {...base(size, p)}><path d="M4 8h16M4 16h16" /></svg>
);
export const IconChevron = ({ size, className = "", ...p }: P) => (
  <svg {...base(size, p)} className={`rtl:-scale-x-100 ${className}`}><path d="m9 6 6 6-6 6" /></svg>
);
/** Fork and knife (solid), used as a section mark. */
export const IconCutlery = ({ size, ...p }: P) => (
  <svg {...base(size, p)} fill="currentColor" stroke="none" viewBox="0 0 24 32">
    <path d="M3 1h1.4v9h1.2V1H7v9h1.2V1h1.4v10.2a3 3 0 0 1-2.3 2.9V31H5.1V14.1A3 3 0 0 1 2.8 11.2V1Z" />
    <path d="M15.5 1c3.5 1.2 5.5 5.6 5.5 11.2 0 2.6-1 4.2-2.6 4.8V31h-2.6V1h-.3Z" />
  </svg>
);
export const IconStar = ({ size, ...p }: P) => (
  <svg {...base(size, p)} fill="currentColor" stroke="none"><path d="m12 2.8 2.8 5.8 6.3.9-4.6 4.4 1.1 6.3L12 17.2l-5.6 3 1.1-6.3L2.9 9.5l6.3-.9L12 2.8Z" /></svg>
);
