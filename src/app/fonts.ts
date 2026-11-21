import { Bodoni_Moda, Cinzel, El_Messiri, Jost, Readex_Pro } from "next/font/google";

export const cinzel = Cinzel({ subsets: ["latin"], weight: ["700"], variable: "--font-cinzel", display: "swap" });
export const bodoni = Bodoni_Moda({
  subsets: ["latin"],
  weight: ["500"],
  style: ["normal", "italic"],
  variable: "--font-bodoni",
  display: "swap",
});
export const jost = Jost({ subsets: ["latin"], weight: ["400", "500"], variable: "--font-jost", display: "swap" });
export const messiri = El_Messiri({
  subsets: ["arabic", "latin"],
  weight: ["600", "700"],
  variable: "--font-messiri",
  display: "swap",
});
export const readex = Readex_Pro({
  subsets: ["arabic", "latin"],
  weight: ["400", "500"],
  variable: "--font-readex",
  display: "swap",
});

export const latinFonts = `${cinzel.variable} ${bodoni.variable} ${jost.variable}`;
export const arabicFonts = `${messiri.variable} ${readex.variable}`;
