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
    // Use the poster/video assets that actually exist in app/public/assets/world.
    poster: "/assets/world/noxia-hero-poster.png",
    mobilePoster: "/assets/world/noxia-hero-mobile-poster.png",
    clip: "/assets/world/noxia-hero.mp4",
    mobileClip: "/assets/world/noxia-hero-mobile.mp4",
    kicker: "THE CREATIVE MACHINE",
    title: "Create what people cannot stop watching.",
    body: "One idea in. A complete short-form world out. Built for creators who want to move at the speed of culture.",
    tags: ["SHORTS", "REELS", "TIKTOK"],
    scroll: 2.2,
  },
];
