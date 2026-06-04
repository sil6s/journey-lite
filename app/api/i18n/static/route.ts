import { readFile } from "fs/promises";
import path from "path";
import { NextRequest, NextResponse } from "next/server";
import { defaultLocale, isValidLocale } from "@/lib/i18n/config";

export async function GET(request: NextRequest) {
  const locale = request.nextUrl.searchParams.get("locale") ?? defaultLocale;

  if (!isValidLocale(locale)) {
    return NextResponse.json({ error: "Invalid locale." }, { status: 400 });
  }

  if (locale === defaultLocale) {
    return NextResponse.json({});
  }

  try {
    const filePath = path.join(process.cwd(), "locales", locale, "static.json");
    const contents = await readFile(filePath, "utf-8");
    return new NextResponse(contents, {
      headers: {
        "content-type": "application/json; charset=utf-8",
        "cache-control": "public, max-age=300, stale-while-revalidate=3600",
      },
    });
  } catch {
    return NextResponse.json({});
  }
}
