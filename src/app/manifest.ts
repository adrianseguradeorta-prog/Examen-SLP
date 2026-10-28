import type { MetadataRoute } from "next";
export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "SLP 3333 Trainer",
    short_name: "SLP 3333",
    start_url: "/",
    display: "standalone",
    background_color: "#f5f6f3",
    theme_color: "#163d35",
    icons: [
      { src: "/icon.svg", sizes: "any", type: "image/svg+xml", purpose: "any" },
    ],
  };
}
