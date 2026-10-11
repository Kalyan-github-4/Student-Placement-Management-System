export function Slogan() {
  return (
    <div
      className="pointer-events-none absolute right-0 bottom-0 z-10 h-[200px] w-[300px] sm:h-[250px] sm:w-[400px] lg:h-[300px] lg:w-[480px]"
      style={{
        background: "linear-gradient(135deg, #174A91 0%, #0f3671 100%)",
        clipPath: "polygon(100% 0%, 100% 100%, 0% 100%, 38% 52%)",
      }}
      aria-hidden="true"
    >
      <div className="absolute right-8 bottom-9 text-right font-[family-name:var(--font-script)] text-white italic sm:right-10 sm:bottom-11">
        <p className="text-xl leading-tight sm:text-2xl">Better</p>
        <p className="text-xl leading-tight sm:text-2xl">Placements</p>
        <p className="text-xl leading-tight sm:text-2xl">Brighter Futures</p>
        <svg
          className="mt-1.5 ml-auto h-3 w-28 sm:w-32"
          viewBox="0 0 120 12"
          fill="none"
        >
          <path
            d="M2,8 C30,2 90,2 118,8"
            stroke="#F12D32"
            strokeWidth="3"
            strokeLinecap="round"
          />
        </svg>
      </div>
    </div>
  );
}
