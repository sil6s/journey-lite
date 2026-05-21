import { createClient } from "next-sanity";
import { apiVersion, dataset, projectId } from "./env";

export const client = createClient({
  projectId,
  dataset,
  apiVersion,
  useCdn: false,
});

export const adminClient = client.withConfig({
  useCdn: false,
  token: process.env.SANITY_API_WRITE_TOKEN || process.env.SANITY_WRITE_TOKEN,
});
