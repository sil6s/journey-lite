"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import Image from "next/image";

type Props = {
  beforeSrc: string;
  afterSrc: string;
  beforeAlt?: string;
  afterAlt?: string;
  aspectRatio?: string;
};

export function BeforeAfterSlider({
  beforeSrc,
  afterSrc,
  beforeAlt = "Before",
  afterAlt = "After",
  aspectRatio = "4/3",
}: Props) {
  const [position, setPosition] = useState(50);
  const dragging = useRef(false);
  const wrapperRef = useRef<HTMLDivElement>(null);

  const hasImages = beforeSrc && afterSrc;

  const clamp = (val: number) => Math.min(95, Math.max(5, val));

  const getPositionFromX = useCallback((clientX: number) => {
    const rect = wrapperRef.current?.getBoundingClientRect();
    if (!rect) return 50;
    return clamp(((clientX - rect.left) / rect.width) * 100);
  }, []);

  useEffect(() => {
    const onMouseMove = (e: MouseEvent) => {
      if (!dragging.current) return;
      setPosition(getPositionFromX(e.clientX));
    };
    const onMouseUp = () => { dragging.current = false; };
    const onTouchMove = (e: TouchEvent) => {
      if (!dragging.current) return;
      setPosition(getPositionFromX(e.touches[0].clientX));
    };
    const onTouchEnd = () => { dragging.current = false; };

    window.addEventListener("mousemove", onMouseMove);
    window.addEventListener("mouseup", onMouseUp);
    window.addEventListener("touchmove", onTouchMove, { passive: true });
    window.addEventListener("touchend", onTouchEnd);
    return () => {
      window.removeEventListener("mousemove", onMouseMove);
      window.removeEventListener("mouseup", onMouseUp);
      window.removeEventListener("touchmove", onTouchMove);
      window.removeEventListener("touchend", onTouchEnd);
    };
  }, [getPositionFromX]);

  const startDrag = () => { dragging.current = true; };

  if (!hasImages) {
    return (
      <div
        className="flex w-full items-center justify-center bg-[#1a2e24]"
        style={{ aspectRatio }}
      >
        <div className="flex flex-col items-center gap-3 opacity-40">
          <svg className="size-10 text-white" fill="none" stroke="currentColor" strokeWidth={1.5} viewBox="0 0 24 24">
            <path d="M2.25 15.75l5.159-5.159a2.25 2.25 0 013.182 0l5.159 5.159m-1.5-1.5l1.409-1.409a2.25 2.25 0 013.182 0l2.909 2.909M4.5 19.5h15a.75.75 0 00.75-.75v-15a.75.75 0 00-.75-.75h-15a.75.75 0 00-.75.75v15c0 .414.336.75.75.75z" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
          <span className="text-[11px] font-semibold uppercase tracking-widest text-white">Before / After Photos</span>
        </div>
      </div>
    );
  }

  return (
    <div
      className="relative w-full select-none overflow-hidden rounded-t-xl bg-[#1a2e24]"
      ref={wrapperRef}
      style={{ aspectRatio }}
    >
      {/* Before photo (full width, behind) */}
      <div className="absolute inset-0">
        <Image alt={beforeAlt} className="object-cover" fill sizes="(max-width: 768px) 100vw, 33vw" src={beforeSrc} />
      </div>

      {/* After photo (clips from left to position%) */}
      <div className="absolute inset-0 overflow-hidden" style={{ width: `${position}%` }}>
        <div className="absolute inset-0" style={{ width: `${100 / (position / 100)}%` }}>
          <Image alt={afterAlt} className="object-cover" fill sizes="(max-width: 768px) 100vw, 33vw" src={afterSrc} />
        </div>
      </div>

      {/* Labels */}
      <span className="absolute left-3 top-3 rounded bg-black/50 px-2 py-0.5 text-[11px] font-bold uppercase tracking-wider text-white">
        After
      </span>
      <span className="absolute right-3 top-3 rounded bg-black/50 px-2 py-0.5 text-[11px] font-bold uppercase tracking-wider text-white">
        Before
      </span>

      {/* Divider line */}
      <div
        className="absolute inset-y-0 w-0.5 bg-white/80 shadow-lg"
        style={{ left: `${position}%`, transform: "translateX(-50%)" }}
      />

      {/* Drag handle */}
      <button
        aria-label="Drag to compare before and after photos"
        className="absolute top-1/2 flex size-9 -translate-x-1/2 -translate-y-1/2 cursor-grab items-center justify-center rounded-full bg-white shadow-xl active:cursor-grabbing"
        onMouseDown={startDrag}
        onTouchStart={startDrag}
        style={{ left: `${position}%` }}
        type="button"
      >
        <svg className="size-4 text-[#0f3e2e]" fill="none" stroke="currentColor" strokeWidth={2.5} viewBox="0 0 24 24">
          <path d="M8 9l-3 3 3 3M16 9l3 3-3 3" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      </button>
    </div>
  );
}
