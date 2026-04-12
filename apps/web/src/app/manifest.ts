import type { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "PrivateDAO",
    short_name: "PrivateDAO",
    description: "Private governance, confidential treasury execution, reviewer-safe proof, and operator-grade runtime trust on Solana.",
    start_url: "/",
    display: "standalone",
    background_color: "#030510",
    theme_color: "#030510",
    icons: [
      {
        src: "/assets/logo.png",
        sizes: "512x512",
        type: "image/png",
      },
    ],
  };
}
