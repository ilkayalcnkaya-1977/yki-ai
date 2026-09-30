import type { ScrollScrubScene, ScrollScrubTheme } from "@/components/scroll-scrub/scroll-scrub";

export const scrollScrubTheme: ScrollScrubTheme = {
  accent: "#e05a5a",
  background: "#050507",
  ink: "#ffffff",
  muted: "#a1a1aa",
};

export const scrollScrubScenes: ScrollScrubScene[] = [
  {
    id: "opening",
    label: "YKI AI",
    poster: "/assets/world/ykiai-hero-poster.png",
    mobilePoster: "/assets/world/ykiai-hero-mobile-poster.png",
    clip: "/assets/world/ykiai-hero.mp4",
    mobileClip: "/assets/world/ykiai-hero-mobile.mp4",
    kicker: "THE CREATIVE MACHINE",
    title: "Create what people cannot stop watching.",
    body: "One idea in. A complete short-form world out. Built for creators who want to move at the speed of culture.",
    tags: ["SHORTS", "REELS", "TIKTOK"],
    scroll: 2.2,
  },
];
