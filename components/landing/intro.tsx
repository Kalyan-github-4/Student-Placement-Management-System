"use client";

import { useEffect, useState, type CSSProperties } from "react";
import { useReducedMotion } from "framer-motion";
import { MoveRight } from "lucide-react";
import { cn } from "@/lib/utils";

const unsplash = (id: string) =>
  `https://images.unsplash.com/photo-${id}?w=600&q=75&auto=format&fit=crop`;

// Collage tiles: position and size are % of the viewport, dx / dy (vw / vh)
// and rot are where each tile flies off to when the collage scatters.
const PHOTOS = [
  { src: "/bwu-campus-wide.webp", desktop: [7.85, 38.9, 19.86, 27.9], mobile: [4, 24, 28, 18], dx: -18, dy: -18, rot: -12 },
  { src: unsplash("1524178232363-1fb2b075b655"), desktop: [27.7, 30, 15.97, 22.07], mobile: [36, 24, 28, 18], dx: 0, dy: -24, rot: 8 },
  { src: unsplash("1427504494785-3a9ca7044f45"), desktop: [27.7, 52.05, 15.97, 22.46], mobile: [68, 24, 28, 18], dx: -24, dy: 4, rot: -8 },
  { src: unsplash("1532094349884-543bc11b234d"), desktop: [43.68, 17.38, 14.24, 21.48], mobile: [4, 44, 28, 18], dx: 18, dy: -18, rot: 14 },
  { src: unsplash("1522202176988-66273c2fd55f"), desktop: [43.68, 38.38, 14.44, 20.8], mobile: [36, 44, 28, 18], dx: 26, dy: -2, rot: -10 },
  { src: unsplash("1434030216411-0b793f4b4173"), desktop: [43.68, 58.79, 14.24, 23.83], mobile: [68, 44, 28, 18], dx: -16, dy: 22, rot: 10 },
  { src: unsplash("1517048676732-d65bc937f952"), desktop: [57.92, 30, 14.86, 22.56], mobile: [4, 64, 28, 18], dx: 10, dy: -26, rot: -6 },
  { src: unsplash("1521737604893-d14cc237f11d"), desktop: [57.85, 52.44, 15, 21.97], mobile: [36, 64, 28, 18], dx: 22, dy: 24, rot: 12 },
  { src: unsplash("1541339907198-e08756dedf3f"), desktop: [72.78, 41.31, 19.31, 28.42], mobile: [68, 64, 28, 18], dx: 28, dy: 14, rot: -14 },
] as const;

type Phase = "enter" | "ready" | "start" | "collage" | "scatter" | "reveal" | "done";

const ORDER: Phase[] = ["enter", "ready", "start", "collage", "scatter", "reveal", "done"];

// Each phase advances on its own after the delay in ms.
const NEXT: Partial<Record<Phase, [Phase, number]>> = {
  enter: ["ready", 250],
  ready: ["start", 1500],
  start: ["collage", 650],
  collage: ["scatter", PHOTOS.length * 180 + 1300],
  scatter: ["reveal", 650],
  reveal: ["done", 700],
};

const EASE = "cubic-bezier(.33,0,.2,1)";

/**
 * Full-screen intro that sits on top of the landing page. The wordmark
 * settles in the centre, moves to the corner, plays a campus photo collage
 * that then scatters, and fades out to the page. Escape skips it.
 */
export function Intro() {
  const [phase, setPhase] = useState<Phase>("enter");
  const [mobile, setMobile] = useState(false);
  const reduce = useReducedMotion();
  const reached = (p: Phase) => ORDER.indexOf(phase) >= ORDER.indexOf(p);
  const done = phase === "done" || !!reduce;

  useEffect(() => {
    const next = NEXT[phase];
    if (!next) return;
    const timer = setTimeout(() => setPhase(next[0]), next[1]);
    return () => clearTimeout(timer);
  }, [phase]);

  useEffect(() => {
    const query = window.matchMedia("(max-width: 1024px)");
    const update = () => setMobile(query.matches);
    update();
    query.addEventListener("change", update);
    return () => query.removeEventListener("change", update);
  }, []);

  // Hold the page at the top while the intro is on screen.
  useEffect(() => {
    if (done) return;
    const root = document.documentElement;
    const previous = root.style.overflow;
    window.scrollTo(0, 0);
    root.style.overflow = "hidden";
    return () => {
      root.style.overflow = previous;
    };
  }, [done]);

  useEffect(() => {
    if (done) return;
    const onKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") setPhase("reveal");
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [done]);

  if (done) return null;

  const started = reached("start");
  const scattered = reached("scatter");

  return (
    <div
      role="region"
      aria-label="Brainware University introduction"
      className="fixed inset-0 z-50 overflow-hidden bg-white select-none"
      style={{
        opacity: reached("reveal") ? 0 : 1,
        transition: "opacity 700ms ease",
      }}
    >
      <div
        className={cn(
          "pointer-events-none absolute @container",
          started
            ? "top-6 left-6 w-37.5 md:top-8 md:left-10 md:w-50 lg:w-62.5"
            : "top-[44%] left-1/2 w-[min(80vw,64vh)]"
        )}
        style={{
          transform: started
            ? "none"
            : reached("ready")
              ? "translate(-50%, -50%)"
              : "translate(-50%, -50%) scale(0.55)",
          opacity: reached("ready") ? 1 : 0,
          transition: `left 900ms ${EASE}, top 900ms ${EASE}, width 900ms ${EASE}, transform 900ms ${EASE}, opacity 900ms ease`,
        }}
      >
        <p className="text-[15.5cqw] leading-[0.88] font-extrabold tracking-tight whitespace-nowrap text-[#082B63] uppercase">
          Brainware
          <br />
          University
        </p>
        <div className="mt-[4.5cqw] flex items-center gap-[3cqw]">
          <span className="h-[0.9cqw] w-[11cqw] rounded-full bg-[#F12D32]" />
          <span className="text-[4.4cqw] font-semibold tracking-[0.12em] whitespace-nowrap text-[#526987] uppercase">
            Where futures take shape
          </span>
        </div>
      </div>

      {reached("collage") &&
        PHOTOS.map((photo, index) => {
          const [left, top, width, height] = mobile ? photo.mobile : photo.desktop;
          const style: CSSProperties = {
            left: `${left}%`,
            top: `${top}%`,
            width: `${width}%`,
            height: `${height}%`,
            transform: scattered
              ? `translate(${photo.dx}vw, ${photo.dy}vh) rotate(${photo.rot}deg) scale(0.7)`
              : "none",
            opacity: scattered ? 0 : 1,
            transition:
              "transform 900ms cubic-bezier(.5,0,.75,.4), opacity 900ms cubic-bezier(.5,0,.75,.4)",
            // Staggered entrance; the transition above only runs for the scatter.
            animationDelay: `${index * 180}ms`,
            animationDuration: "400ms",
          };
          return (
            <div
              key={photo.src}
              className="pointer-events-none absolute animate-in overflow-hidden shadow-lg shadow-[#082B63]/15 fade-in fill-mode-backwards"
              style={style}
            >
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={photo.src}
                alt=""
                draggable={false}
                className="block h-full w-full object-cover"
              />
            </div>
          );
        })}

      <div
        aria-hidden="true"
        className={cn(
          "pointer-events-none absolute top-[64%] left-1/2 flex -translate-x-1/2 items-center gap-2 transition-all duration-500 ease-out",
          phase === "ready"
            ? "translate-y-0 opacity-100 delay-200"
            : started
              ? "-translate-y-3 opacity-0"
              : "translate-y-4 opacity-0"
        )}
      >
        <span className="text-sm leading-none font-medium whitespace-nowrap text-[#082B63] md:text-[15px]">
          Start the experience
        </span>
        <MoveRight className="h-5 w-5 text-[#F12D32]" />
      </div>
    </div>
  );
}
