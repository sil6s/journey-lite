"use server";

import { adminClient } from "@/src/lib/sanity/client";
import { revalidatePath } from "next/cache";

export async function deleteMediaAsset(assetId: string): Promise<void> {
  // Sanity delete — will throw if referenced
  await adminClient.delete(assetId);
  revalidatePath("/admin/media");
}
