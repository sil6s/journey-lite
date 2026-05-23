"use client";

function getEmbedUrl(url: string): string | null {
  try {
    const parsed = new URL(url);

    // YouTube
    if (parsed.hostname.includes("youtube.com") || parsed.hostname.includes("youtu.be")) {
      const videoId =
        parsed.searchParams.get("v") ??
        parsed.pathname.replace(/^\/embed\//, "").replace(/^\//, "").split("/")[0];
      if (videoId) return `https://www.youtube.com/embed/${videoId}`;
    }

    // Vimeo
    if (parsed.hostname.includes("vimeo.com")) {
      const videoId = parsed.pathname.replace(/^\//, "").split("/")[0];
      if (videoId && /^\d+$/.test(videoId)) {
        return `https://player.vimeo.com/video/${videoId}`;
      }
    }

    // Loom
    if (parsed.hostname.includes("loom.com")) {
      const videoId = parsed.pathname.replace("/share/", "").replace("/embed/", "");
      if (videoId) return `https://www.loom.com/embed/${videoId}`;
    }

    // Assume it's a direct MP4
    if (url.endsWith(".mp4") || url.endsWith(".webm")) return null;

    return null;
  } catch {
    return null;
  }
}

export function VideoEmbed({ url }: { url: string }) {
  const embedUrl = getEmbedUrl(url);

  if (!embedUrl) {
    // Direct video file
    return (
      <div className="overflow-hidden rounded-2xl border border-[#dce4df] bg-black shadow-sm">
        <video
          className="aspect-video w-full"
          controls
          preload="metadata"
          src={url}
        >
          Your browser doesn&apos;t support this video format.
        </video>
      </div>
    );
  }

  return (
    <div className="overflow-hidden rounded-2xl border border-[#dce4df] shadow-sm">
      <div className="relative aspect-video w-full bg-black">
        <iframe
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
          allowFullScreen
          className="absolute inset-0 h-full w-full"
          src={embedUrl}
          title="Lesson video"
        />
      </div>
    </div>
  );
}
