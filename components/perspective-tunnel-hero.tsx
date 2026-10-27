"use client";

import {
  motion,
  useMotionValue,
  useMotionValueEvent,
  useReducedMotion,
  useSpring,
  useTransform,
  type MotionValue,
} from "framer-motion";
import { useEffect, useRef, useState } from "react";

const unsplash = (id: string) =>
  `https://images.unsplash.com/photo-${id}?w=600&q=75&auto=format&fit=crop`;

const IMAGES = [
  { src: "/bwu-campus-wide.webp", title: "Our Campus" },
  { src: unsplash("1524178232363-1fb2b075b655"), title: "Lecture Halls" },
  { src: unsplash("1427504494785-3a9ca7044f45"), title: "Central Library" },
  { src: unsplash("1532094349884-543bc11b234d"), title: "Research Labs" },
  { src: unsplash("1522202176988-66273c2fd55f"), title: "Peer Learning" },
  { src: unsplash("1434030216411-0b793f4b4173"), title: "Aptitude Prep" },
  { src: unsplash("1517048676732-d65bc937f952"), title: "Placement Drives" },
  { src: unsplash("1521737604893-d14cc237f11d"), title: "Campus Interviews" },
  { src: unsplash("1541339907198-e08756dedf3f"), title: "Graduation Day" },
];

type TunnelCardData = {
  item: (typeof IMAGES)[number];
  angleCos: number;
  angleSin: number;
  radiusFactorX: number;
  radiusFactorY: number;
  rotationZ: number;
  index: number;
};

const TUNNEL_CARDS: TunnelCardData[] = IMAGES.map((item, index) => {
  const goldenAngle = index * 137.5 * (Math.PI / 180);
  return {
    item,
    angleCos: Math.cos(goldenAngle),
    angleSin: Math.sin(goldenAngle),
    radiusFactorX: 0.28 + (index % 3) * 0.08,
    radiusFactorY: 0.26 + (index % 2) * 0.09,
    rotationZ: (index % 2 === 0 ? 1 : -1) * (3 + (index % 5) * 2),
    index,
  };
});

const SPRING_CONFIG = { stiffness: 60, damping: 25, mass: 0.5 };
// Progress at which the tunnel starts dissolving to reveal the page behind it.
const REVEAL_START = 0.88;
type StageDimensions = { width: number; height: number; isMobile: boolean };

function useCameraParallax(enabled: boolean) {
  const rawX = useMotionValue(0);
  const rawY = useMotionValue(0);
  const x = useSpring(rawX, SPRING_CONFIG);
  const y = useSpring(rawY, SPRING_CONFIG);

  useEffect(() => {
    if (!enabled) return;
    const onMove = (event: PointerEvent) => {
      rawX.set((event.clientX / window.innerWidth - 0.5) * 2);
      rawY.set((event.clientY / window.innerHeight - 0.5) * 2);
    };
    window.addEventListener("pointermove", onMove, { passive: true });
    return () => window.removeEventListener("pointermove", onMove);
  }, [enabled, rawX, rawY]);

  return { x, y };
}

function TunnelCard({ card, progress, pointer, total, stage }: { card: TunnelCardData; progress: MotionValue<number>; pointer: { x: MotionValue<number>; y: MotionValue<number> }; total: number; stage: StageDimensions }) {
  const start = (card.index / total) * 0.45;
  const localProgress = useTransform(progress, [start, start + 0.55], [0, 1]);
  const z = useTransform(localProgress, [0, 1], [stage.isMobile ? -1200 : -1700, stage.isMobile ? 350 : 500]);
  const opacity = useTransform(localProgress, [0, 0.18, 0.82, 0.98], [0, 1, 1, 0]);
  const cardWidth = stage.isMobile ? Math.max(130, Math.min(180, stage.width * 0.38)) : Math.max(180, Math.min(270, stage.width * 0.18));
  const baseX = card.angleCos * stage.width * card.radiusFactorX;
  const baseY = card.angleSin * stage.height * card.radiusFactorY;
  const transform = useTransform([z, pointer.x, pointer.y], ([currZ, px, py]: number[]) => `translate3d(calc(-50% + ${baseX - px * (stage.isMobile ? 20 : 45)}px), calc(-50% + ${baseY - py * (stage.isMobile ? 20 : 45)}px), ${currZ}px) rotateZ(${card.rotationZ}deg)`);

  return <motion.div style={{ width: cardWidth, transform, opacity, zIndex: card.index + 1 }} className="pointer-events-auto absolute left-1/2 top-1/2 aspect-[4/5] cursor-pointer select-none will-change-transform">
    <div className="group relative h-full w-full overflow-hidden rounded-2xl bg-[#0d3575] shadow-2xl shadow-black/60 ring-1 ring-white/15 transition-all duration-500 hover:shadow-[#F12D32]/25 hover:ring-[#F12D32]/70">
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img src={card.item.src} alt={card.item.title} draggable={false} className="h-full w-full object-cover transition-transform duration-700 ease-out group-hover:scale-110" />
      <div className="absolute inset-0 flex items-end bg-gradient-to-t from-[#082B63]/90 via-black/10 to-transparent p-4 sm:p-5"><span className="font-mono text-xs uppercase tracking-widest text-white/95 drop-shadow-md sm:text-sm">{card.item.title}</span></div>
    </div>
  </motion.div>;
}

/**
 * Full-screen intro that sits on top of the landing page. Scrolling (wheel,
 * touch or keyboard) flies through the tunnel; at the end it fades out and
 * unmounts, revealing and unlocking the page underneath.
 */
export default function PerspectiveTunnelHero() {
  const containerRef = useRef<HTMLDivElement>(null);
  const reduce = useReducedMotion();
  const [finished, setFinished] = useState(false);
  const done = finished || !!reduce;
  const [stage, setStage] = useState<StageDimensions>({ width: 1440, height: 900, isMobile: false });
  const rawProgress = useMotionValue(0);
  const smoothProgress = useSpring(rawProgress, { stiffness: 80, damping: 30, restDelta: 0.0001 });

  useMotionValueEvent(smoothProgress, "change", (value) => {
    if (value >= 0.995) setFinished(true);
  });

  // Hold the page at the top while the intro is on screen.
  useEffect(() => {
    if (done) return;
    const root = document.documentElement;
    const previous = root.style.overflow;
    window.scrollTo(0, 0);
    root.style.overflow = "hidden";
    return () => { root.style.overflow = previous; };
  }, [done]);

  useEffect(() => {
    const update = () => setStage({ width: window.innerWidth, height: window.innerHeight, isMobile: window.innerWidth < 768 });
    update();
    window.addEventListener("resize", update);
    return () => window.removeEventListener("resize", update);
  }, []);

  useEffect(() => {
    const element = containerRef.current;
    if (!element || done) return;
    const advance = (delta: number) => rawProgress.set(Math.min(1, Math.max(0, rawProgress.get() + delta)));

    const handleWheel = (event: WheelEvent) => { event.preventDefault(); advance(event.deltaY * 0.0008); };
    let lastTouchY: number | null = null;
    const handleTouchStart = (event: TouchEvent) => { lastTouchY = event.touches[0]?.clientY ?? null; };
    const handleTouchMove = (event: TouchEvent) => {
      const y = event.touches[0]?.clientY;
      if (y === undefined || lastTouchY === null) return;
      event.preventDefault();
      advance((lastTouchY - y) * 0.002);
      lastTouchY = y;
    };
    const handleKey = (event: KeyboardEvent) => {
      if (["ArrowDown", "PageDown", " "].includes(event.key)) { event.preventDefault(); advance(0.08); }
      else if (["ArrowUp", "PageUp"].includes(event.key)) { event.preventDefault(); advance(-0.08); }
      else if (event.key === "Escape" || event.key === "End") rawProgress.set(1);
    };

    element.addEventListener("wheel", handleWheel, { passive: false });
    element.addEventListener("touchstart", handleTouchStart, { passive: true });
    element.addEventListener("touchmove", handleTouchMove, { passive: false });
    window.addEventListener("keydown", handleKey);
    return () => {
      element.removeEventListener("wheel", handleWheel);
      element.removeEventListener("touchstart", handleTouchStart);
      element.removeEventListener("touchmove", handleTouchMove);
      window.removeEventListener("keydown", handleKey);
    };
  }, [rawProgress, done]);

  const pointer = useCameraParallax(!reduce);
  const titleScale = useTransform(smoothProgress, [0, 0.5, 1], [0.7, 1, 1.35]);
  const titleOpacity = useTransform(smoothProgress, [0, 0.12, 0.8, REVEAL_START], [0.25, 1, 1, 0]);
  const promptOpacity = useTransform(smoothProgress, [0, 0.12], [1, 0]);
  const overlayOpacity = useTransform(smoothProgress, [REVEAL_START, 1], [1, 0]);

  if (done) return null;

  return <motion.div ref={containerRef} style={{ opacity: overlayOpacity, perspective: stage.isMobile ? "900px" : "1200px", transformStyle: "preserve-3d" }} className="fixed inset-0 z-50 flex touch-none select-none items-center justify-center overflow-hidden bg-[#082B63] text-white" role="region" aria-label="Brainware University introduction">
    <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(rgba(255,255,255,0.18)_1px,transparent_1px)] opacity-60 [background-size:28px_28px] [mask-image:radial-gradient(ellipse_70%_70%_at_50%_50%,#000_60%,transparent_100%)]" />
    <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(60%_70%_at_50%_45%,rgba(23,74,145,0.9)_0%,transparent_70%),radial-gradient(40%_50%_at_0%_100%,rgba(241,45,50,0.18)_0%,transparent_70%)]" />
    <div className="pointer-events-none absolute h-[48vmin] w-[48vmin] rounded-full border border-[#F12D32]/25" />
    <div className="pointer-events-none absolute h-[76vmin] w-[76vmin] rounded-full border border-dashed border-white/15" />
    <motion.div style={{ scale: titleScale, opacity: titleOpacity }} className="pointer-events-none z-0 flex max-w-xl flex-col items-center px-6 text-center">
      <p className="mb-4 font-mono text-xs uppercase tracking-[0.4em] text-[#ff6b6f]">Brainware University</p>
      <p className="bg-gradient-to-b from-white via-white to-white/50 bg-clip-text text-5xl font-extrabold leading-[0.95] tracking-tighter text-transparent sm:text-7xl md:text-8xl">YOUR CAREER<br />STARTS <span className="text-[#F12D32]">HERE.</span></p>
      <p className="mt-5 max-w-[38ch] text-sm font-light text-white/75 sm:text-base">From the classroom to your first offer letter. Scroll to walk through the journey.</p>
    </motion.div>
    <motion.div style={{ opacity: promptOpacity }} className="pointer-events-none absolute bottom-8 z-20 flex flex-col items-center gap-2 font-mono text-xs uppercase tracking-[0.3em] text-white/70"><span>Scroll to Explore</span><div className="h-6 w-px bg-gradient-to-b from-[#F12D32] to-transparent" /></motion.div>
    <button type="button" onClick={() => rawProgress.set(1)} className="absolute right-5 top-5 z-[60] rounded-full border border-white/40 bg-white/10 px-4 py-2 text-xs font-semibold uppercase tracking-widest text-white backdrop-blur-sm transition hover:bg-white/20 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white sm:right-8 sm:top-6">Skip intro</button>
    <div className="pointer-events-none absolute inset-0" style={{ transformStyle: "preserve-3d" }}>{TUNNEL_CARDS.map((card) => <TunnelCard key={card.index} card={card} progress={smoothProgress} pointer={pointer} total={TUNNEL_CARDS.length} stage={stage} />)}</div>
  </motion.div>;
}
