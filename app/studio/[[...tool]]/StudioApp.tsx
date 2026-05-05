"use client";

import dynamic from "next/dynamic";
import config from "../../../sanity.config";

const NextStudio = dynamic(
  () => import("next-sanity/studio/client-component").then((mod) => mod.NextStudio),
  { ssr: false },
);

export function StudioApp() {
  return <NextStudio config={config} />;
}
