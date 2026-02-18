import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "About - ChinoizeCupStats",
  description: "About ChinoizeCupStats, data sources, and acknowledgements",
};

export default function AboutLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
