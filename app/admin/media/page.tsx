import { adminClient } from "@/src/lib/sanity/client";
import { MediaClient } from "./MediaClient";

export const metadata = { title: "Media Library — JourneyLite Admin" };
export const dynamic = "force-dynamic";

type SanityAsset = {
  _id: string;
  url: string;
  originalFilename: string;
  size: number;
  mimeType: string;
  metadata?: { dimensions?: { width: number; height: number } };
  _createdAt: string;
};

async function fetchAssets(): Promise<SanityAsset[]> {
  try {
    return await adminClient.fetch<SanityAsset[]>(
      `*[_type == "sanity.imageAsset"] | order(_createdAt desc) [0...200] {
        _id, url, originalFilename, size, mimeType, _createdAt,
        metadata { dimensions { width, height } }
      }`
    );
  } catch {
    return [];
  }
}

export default async function AdminMediaPage() {
  const assets = await fetchAssets();
  return <MediaClient initialAssets={assets} />;
}
