import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "About",
  description: "About ChinoizeCupStats, data sources, and acknowledgements",
  alternates: { canonical: "/about" },
};

export default function AboutLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
