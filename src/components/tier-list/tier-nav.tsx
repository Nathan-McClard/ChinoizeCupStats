"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Info } from "lucide-react";

interface TierNavProps {
  tierCounts: Record<"S" | "A" | "B" | "C" | "U", number>;
}

const tiers = ["S", "A", "B", "C", "U"] as const;

const tierLabels: Record<string, string> = {
  S: "Elite",
  A: "Strong",
  B: "Viable",
  C: "Niche",
  U: "Unranked",
};

const blurIn = {
  hidden: { opacity: 0, y: 8, filter: "blur(4px)" },
  visible: {
    opacity: 1,
    y: 0,
    filter: "blur(0px)",
    transition: { duration: 0.5, ease: [0.16, 1, 0.3, 1] as const },
  },
};

export function TierNav({ tierCounts }: TierNavProps) {
  const [activeTier, setActiveTier] = useState<string | null>(null);

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting) {
            setActiveTier(entry.target.id.replace("tier-", ""));
          }
        }
      },
      { rootMargin: "-20% 0px -70% 0px" }
    );

    for (const tier of tiers) {
      const el = document.getElementById(`tier-${tier}`);
      if (el) observer.observe(el);
    }
    return () => observer.disconnect();
  }, []);

  function scrollToTier(tier: string) {
    const el = document.getElementById(`tier-${tier}`);
    if (el) el.scrollIntoView({ behavior: "smooth" });
  }

  function scrollToMethodology() {
    const el = document.getElementById("methodology");
    if (el) el.scrollIntoView({ behavior: "smooth" });
  }

  return (
    <div className="sticky top-14 z-30 -mx-4 lg:-mx-6 px-4 lg:px-6 py-2.5 bg-background/80 backdrop-blur-md border-b border-border/40">
      <motion.nav
        variants={{
          hidden: {},
          visible: { transition: { staggerChildren: 0.04 } },
        }}
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true }}
        className="flex items-center justify-between gap-2"
      >
        <div className="flex items-center gap-0.5">
          {tiers.map((tier) => {
            const count = tierCounts[tier];
            if (count === 0) return null;
            const isActive = activeTier === tier;
            return (
              <motion.button
                key={tier}
                variants={blurIn}
                onClick={() => scrollToTier(tier)}
                className="relative px-3 py-1.5 rounded-lg text-xs transition-colors cursor-pointer group"
              >
                {isActive && (
                  <motion.div
                    layoutId="tier-nav-active"
                    className="absolute inset-0 rounded-lg bg-black/[0.05] dark:bg-white/[0.06]"
                    transition={{
                      type: "spring",
                      stiffness: 380,
                      damping: 30,
                    }}
                  />
                )}
                <span className="relative flex items-center gap-1.5">
                  <span
                    className={`font-bold tracking-tight transition-colors ${
                      isActive
                        ? "text-foreground"
                        : "text-muted-foreground group-hover:text-foreground"
                    }`}
                  >
                    {tier}
                  </span>
                  <span
                    className={`font-data text-[10px] transition-colors ${
                      isActive
                        ? "text-muted-foreground"
                        : "text-muted-foreground/50 group-hover:text-muted-foreground"
                    }`}
                  >
                    {count}
                  </span>
                </span>
              </motion.button>
            );
          })}
        </div>

        <motion.button
          variants={blurIn}
          onClick={scrollToMethodology}
          className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs text-muted-foreground hover:text-foreground hover:bg-black/[0.04] dark:hover:bg-white/[0.04] transition-colors cursor-pointer"
        >
          <Info className="w-3.5 h-3.5" />
          <span className="hidden sm:inline">How it works</span>
        </motion.button>
      </motion.nav>
    </div>
  );
}
