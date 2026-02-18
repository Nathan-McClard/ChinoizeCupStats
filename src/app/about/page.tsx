"use client";

import { motion } from "framer-motion";
import {
  ExternalLink,
  BarChart3,
  PieChart,
  Users,
  TrendingUp,
  FileText,
  Crown,
} from "lucide-react";

const container = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.08 } },
};

const item = {
  hidden: { opacity: 0, y: 24, filter: "blur(6px)" },
  visible: {
    opacity: 1,
    y: 0,
    filter: "blur(0px)",
    transition: { duration: 0.7, ease: [0.16, 1, 0.3, 1] as const },
  },
};

const features = [
  { icon: BarChart3, label: "Tournament Analytics", desc: "Results, brackets, and placement history" },
  { icon: PieChart, label: "Meta Snapshots", desc: "Format-level metagame breakdowns" },
  { icon: Users, label: "Player Statistics", desc: "Individual performance and records" },
  { icon: TrendingUp, label: "Win Rates", desc: "Conversion rates and matchup data" },
  { icon: FileText, label: "Decklist Breakdowns", desc: "Card choices and build trends" },
  { icon: Crown, label: "Leader Tracking", desc: "Tier rankings and performance over time" },
];

export default function AboutPage() {
  return (
    <motion.div
      className="max-w-3xl mx-auto pb-16"
      variants={container}
      initial="hidden"
      animate="visible"
    >
      {/* ── Hero ── */}
      <motion.div variants={item} className="pt-2 pb-14">
        <p className="text-xs font-semibold uppercase tracking-[0.2em] text-primary mb-4">
          About
        </p>
        <h1 className="text-4xl lg:text-5xl font-bold text-foreground tracking-tight leading-[1.1]">
          Competitive intel
          <br />
          <span className="text-muted-foreground">for the community.</span>
        </h1>
        <div className="mt-6 h-px w-full bg-gradient-to-r from-primary/40 via-primary/10 to-transparent" />
        <p className="mt-6 text-base lg:text-lg text-muted-foreground leading-relaxed max-w-2xl">
          ChinoizeCupStats is an analytics platform dedicated to tracking and
          showcasing competitive data from Chinoize Cup tournaments. Our goal is
          to provide players with clear insights into the evolving meta, deck
          performance, and player results through accurate, easy-to-read
          statistics.
        </p>
      </motion.div>

      {/* ── What is ChinoizeCup ── */}
      <motion.section variants={item} className="pb-14">
        <div className="flex items-center gap-3 mb-6">
          <div className="h-8 w-1 rounded-full bg-primary" />
          <h2 className="text-2xl font-semibold text-foreground tracking-tight">
            What is ChinoizeCup?
          </h2>
        </div>
        <div className="space-y-4">
          <p className="text-sm text-muted-foreground leading-relaxed">
            ChinoizeCup is an online One Piece Trading Card Game tournament
            series hosted multiple times a week — typically every Monday,
            Tuesday, and Wednesday — and played through simulator platforms.
          </p>
          <p className="text-sm text-muted-foreground leading-relaxed">
            The event consistently attracts competitive players from across the
            community, making it one of the most active and reliable sources
            for observing meta trends in a fast-paced environment.
          </p>
        </div>
      </motion.section>

      {/* ── Features ── */}
      <motion.section variants={item} className="pb-14">
        <p className="text-xs font-semibold uppercase tracking-[0.2em] text-primary mb-6">
          What we track
        </p>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
          {features.map(({ icon: Icon, label, desc }) => (
            <div
              key={label}
              className="rounded-xl border border-border bg-card p-5 flex flex-col gap-3"
            >
              <div className="flex items-center justify-center w-9 h-9 rounded-lg bg-primary/10">
                <Icon className="w-4 h-4 text-primary" />
              </div>
              <div>
                <p className="text-sm font-semibold text-foreground">{label}</p>
                <p className="text-xs text-muted-foreground mt-0.5 leading-relaxed">
                  {desc}
                </p>
              </div>
            </div>
          ))}
        </div>
      </motion.section>

      {/* ── Data & Disclaimer ── */}
      <motion.section variants={item}>
        <div className="h-px w-full bg-border mb-10" />

        <div className="grid lg:grid-cols-2 gap-10">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-primary mb-3">
              Data Source
            </p>
            <p className="text-sm text-muted-foreground leading-relaxed">
              All tournament data, match results, standings, and decklists are
              sourced from{" "}
              <a
                href="https://limitlesstcg.com"
                target="_blank"
                rel="noopener noreferrer"
                className="text-primary hover:underline underline-offset-2 inline-flex items-center gap-1"
              >
                Limitless TCG
                <ExternalLink className="w-3 h-3" />
              </a>
              . Card images are served from the Limitless TCG CDN.
            </p>
            <p className="text-sm text-muted-foreground leading-relaxed mt-2">
              We are not affiliated with Limitless TCG — we simply consume their
              publicly available data.
            </p>
          </div>

          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-muted-foreground mb-3">
              Disclaimer
            </p>
            <p className="text-sm text-muted-foreground leading-relaxed">
              One Piece Card Game is a product of Bandai. This site is a
              fan-made project and is not affiliated with, endorsed by, or
              sponsored by Bandai, Toei Animation, or any official One Piece
              entity. All card images and game assets are property of their
              respective owners.
            </p>
          </div>
        </div>
      </motion.section>
    </motion.div>
  );
}
