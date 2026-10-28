"use client";

import { useEffect, useRef } from "react";

/**
 * Muted, looping background video. Autoplay is started from an effect because
 * React only sets `muted` as a property, which some browsers ignore for the
 * autoplay check. Visitors who prefer reduced motion get the poster frame.
 */
export function HeroVideo({ src, poster }: { src: string; poster: string }) {
  const ref = useRef<HTMLVideoElement>(null);

  useEffect(() => {
    const video = ref.current;
    if (!video) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      video.pause();
      return;
    }
    video.muted = true;
    video.play().catch(() => {});
  }, []);

  return (
    <video
      ref={ref}
      muted
      loop
      playsInline
      preload="auto"
      poster={poster}
      aria-hidden="true"
      className="absolute inset-0 h-full w-full object-cover"
      style={{ filter: "contrast(110%) brightness(90%)" }}
    >
      <source src={src} type="video/mp4" />
    </video>
  );
}
