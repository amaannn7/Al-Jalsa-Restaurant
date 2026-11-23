import { DM_Sans, Newsreader, Noto_Naskh_Arabic, Readex_Pro } from "next/font/google";

/** Headings: Newsreader (closest match to the reference's display serif). Body/UI: DM Sans. */
export const newsreader = Newsreader({
  subsets: ["latin"],
  weight: ["400", "500"],
  style: ["normal"],
  variable: "--font-newsreader",
  display: "swap",
});
export const dmSans = DM_Sans({ subsets: ["latin"], weight: ["400", "500", "600"], variable: "--font-dmsans", display: "swap" });
/**
 * Arabic headings (Naskh pairs with the serif) and Arabic body text. Readex is preloaded (it sets most
 * Arabic text, so swapping it late shifts the layout); Naskh is not, to keep English pages light.
 */
export const naskh = Noto_Naskh_Arabic({ subsets: ["arabic"], weight: ["500", "600"], variable: "--font-naskh", display: "swap", preload: false });
export const readex = Readex_Pro({ subsets: ["arabic"], weight: ["400", "500"], variable: "--font-readex", display: "swap" });

export const latinFonts = `${newsreader.variable} ${dmSans.variable}`;
export const arabicFonts = `${naskh.variable} ${readex.variable}`;
