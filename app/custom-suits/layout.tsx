import type { Metadata } from "next";
import { buildSeoMetadata } from "@/lib/seo";

export const metadata: Metadata = buildSeoMetadata({
  title: "Odela po meri (Custom Suits) — Ručna izrada u Srbiji | Santos",
  description:
    "Ručno šivenje muških odela po meri u Srbiji od 100% italijanske runske vune. Santos bespoke i made-to-measure krojački pristup — bez uvozne turske konfekcije.",
  path: "/custom-suits",
  keywords: [
    "custom suits",
    "odela po meri",
    "odela po meri srbija",
    "rucno sivena odela po meri",
    "bespoke odela srbija",
    "made to measure srbija",
    "santos custom suits",
  ],
});

export default function CustomSuitsLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return children;
}
