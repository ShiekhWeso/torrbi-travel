export default function HeroBackground() {
  return (
    <div aria-hidden className="pointer-events-none absolute inset-0 overflow-hidden">
      <svg className="absolute -top-44 -end-44 w-[620px]" viewBox="0 0 400 400" fill="none">
        <circle cx="200" cy="200" r="190" stroke="#0A7FD0" strokeOpacity=".25" strokeWidth="2" />
        <circle cx="200" cy="200" r="140" stroke="#FE9962" strokeOpacity=".5" strokeWidth="2" />
        <circle cx="200" cy="200" r="90" fill="#0F1859" fillOpacity=".07" />
      </svg>
      <div className="absolute -bottom-80 -start-48 h-[560px] w-[560px] rounded-full bg-navy/[0.07]" />
      <svg className="absolute top-1/3 start-[7%] w-14 animate-pulse" viewBox="0 0 100 100">
        <path d="M50 0C55 35 65 45 100 50C65 55 55 65 50 100C45 65 35 55 0 50C35 45 45 35 50 0Z" fill="#FE9962" fillOpacity=".6" />
      </svg>
      <svg className="absolute bottom-20 end-0 w-[700px]" viewBox="0 0 640 200" fill="none">
        <path id="flightPath" d="M0 180C160 20 360 20 640 90" stroke="#0F1859" strokeOpacity=".25" strokeWidth="2" strokeDasharray="6 10" />
        <path d="M14 0L-10 -9L-4 0L-10 9Z" fill="#0F1859">
          <animateMotion dur="14s" repeatCount="indefinite" rotate="auto">
            <mpath href="#flightPath" />
          </animateMotion>
        </path>
      </svg>
    </div>
  );
}