// SVG Flag Icons Component
// Using inline SVGs for crisp, colorful country flags

const flags = {
  gb: (
    <svg viewBox="0 0 640 480" className="w-full h-full">
      <path fill="#012169" d="M0 0h640v480H0z"/>
      <path fill="#FFF" d="m75 0 244 181L562 0h78v62L400 241l240 178v61h-80L320 301 81 480H0v-60l239-178L0 64V0h75z"/>
      <path fill="#C8102E" d="m424 281 216 159v40L369 281h55zm-184 20 6 35L54 480H0l240-179zM640 0v3L391 191l2-44L590 0h50zM0 0l239 176h-60L0 42V0z"/>
      <path fill="#FFF" d="M241 0v480h160V0H241zM0 160v160h640V160H0z"/>
      <path fill="#C8102E" d="M0 193v96h640v-96H0zM273 0v480h96V0h-96z"/>
    </svg>
  ),
  it: (
    <svg viewBox="0 0 640 480" className="w-full h-full">
      <g fillRule="evenodd" strokeWidth="1pt">
        <path fill="#fff" d="M0 0h640v480H0z"/>
        <path fill="#009246" d="M0 0h213.3v480H0z"/>
        <path fill="#ce2b37" d="M426.7 0H640v480H426.7z"/>
      </g>
    </svg>
  ),
  es: (
    <svg viewBox="0 0 640 480" className="w-full h-full">
      <path fill="#AA151B" d="M0 0h640v480H0z"/>
      <path fill="#F1BF00" d="M0 120h640v240H0z"/>
    </svg>
  ),
  fr: (
    <svg viewBox="0 0 640 480" className="w-full h-full">
      <g fillRule="evenodd" strokeWidth="1pt">
        <path fill="#fff" d="M0 0h640v480H0z"/>
        <path fill="#002654" d="M0 0h213.3v480H0z"/>
        <path fill="#CE1126" d="M426.7 0H640v480H426.7z"/>
      </g>
    </svg>
  ),
  de: (
    <svg viewBox="0 0 640 480" className="w-full h-full">
      <path fill="#ffce00" d="M0 320h640v160H0z"/>
      <path d="M0 0h640v160H0z"/>
      <path fill="#d00" d="M0 160h640v160H0z"/>
    </svg>
  ),
  pt: (
    <svg viewBox="0 0 640 480" className="w-full h-full">
      <path fill="#006600" d="M0 0h640v480H0z"/>
      <path fill="#FF0000" d="M256 0h384v480H256z"/>
      <circle cx="256" cy="240" r="80" fill="#FFCC00"/>
      <circle cx="256" cy="240" r="64" fill="#FF0000"/>
      <path fill="#fff" d="M256 176c-35.3 0-64 28.7-64 64s28.7 64 64 64 64-28.7 64-64-28.7-64-64-64zm0 16c26.5 0 48 21.5 48 48s-21.5 48-48 48-48-21.5-48-48 21.5-48 48-48z"/>
    </svg>
  ),
  nl: (
    <svg viewBox="0 0 640 480" className="w-full h-full">
      <path fill="#21468B" d="M0 0h640v480H0z"/>
      <path fill="#FFF" d="M0 0h640v320H0z"/>
      <path fill="#AE1C28" d="M0 0h640v160H0z"/>
    </svg>
  ),
  ru: (
    <svg viewBox="0 0 640 480" className="w-full h-full">
      <path fill="#fff" d="M0 0h640v160H0z"/>
      <path fill="#0039A6" d="M0 160h640v160H0z"/>
      <path fill="#D52B1E" d="M0 320h640v160H0z"/>
    </svg>
  ),
  cn: (
    <svg viewBox="0 0 640 480" className="w-full h-full">
      <path fill="#DE2910" d="M0 0h640v480H0z"/>
      <path fill="#FFDE00" d="M96 48l24 72-60-44h72l-60 44zm80 24l8 24-20-14h24l-20 14zm16 48l8 24-20-14h24l-20 14zm-16 48l8 24-20-14h24l-20 14zm-48 16l8 24-20-14h24l-20 14z"/>
    </svg>
  ),
  jp: (
    <svg viewBox="0 0 640 480" className="w-full h-full">
      <path fill="#fff" d="M0 0h640v480H0z"/>
      <circle cx="320" cy="240" r="120" fill="#bc002d"/>
    </svg>
  ),
  kr: (
    <svg viewBox="0 0 640 480" className="w-full h-full">
      <path fill="#fff" d="M0 0h640v480H0z"/>
      <circle cx="320" cy="240" r="96" fill="#c60c30"/>
      <path fill="#003478" d="M320 144a96 96 0 0 0 0 192 48 48 0 0 1 0-96 48 48 0 0 0 0-96z"/>
      <path fill="#c60c30" d="M320 336a96 96 0 0 0 0-192 48 48 0 0 1 0 96 48 48 0 0 0 0 96z"/>
    </svg>
  ),
  sa: (
    <svg viewBox="0 0 640 480" className="w-full h-full">
      <path fill="#006C35" d="M0 0h640v480H0z"/>
      <path fill="#fff" d="M160 160h320v80H160zm80 80h160v80H240z"/>
    </svg>
  ),
  in: (
    <svg viewBox="0 0 640 480" className="w-full h-full">
      <path fill="#f93" d="M0 0h640v160H0z"/>
      <path fill="#fff" d="M0 160h640v160H0z"/>
      <path fill="#128807" d="M0 320h640v160H0z"/>
      <circle cx="320" cy="240" r="48" fill="#008" fillOpacity=".8"/>
      <circle cx="320" cy="240" r="40" fill="#fff"/>
      <circle cx="320" cy="240" r="8" fill="#008"/>
    </svg>
  ),
  tr: (
    <svg viewBox="0 0 640 480" className="w-full h-full">
      <path fill="#E30A17" d="M0 0h640v480H0z"/>
      <circle cx="240" cy="240" r="120" fill="#fff"/>
      <circle cx="272" cy="240" r="96" fill="#E30A17"/>
      <path fill="#fff" d="M352 240l-72-52 28 84-72-52h88z"/>
    </svg>
  ),
  pl: (
    <svg viewBox="0 0 640 480" className="w-full h-full">
      <path fill="#fff" d="M0 0h640v240H0z"/>
      <path fill="#dc143c" d="M0 240h640v240H0z"/>
    </svg>
  ),
  se: (
    <svg viewBox="0 0 640 480" className="w-full h-full">
      <path fill="#006AA7" d="M0 0h640v480H0z"/>
      <path fill="#FECC00" d="M0 192h176V0h64v192h400v96H240v192h-64V288H0z"/>
    </svg>
  ),
  dk: (
    <svg viewBox="0 0 640 480" className="w-full h-full">
      <path fill="#C8102E" d="M0 0h640v480H0z"/>
      <path fill="#fff" d="M0 192h176V0h64v192h400v96H240v192h-64V288H0z"/>
    </svg>
  ),
  no: (
    <svg viewBox="0 0 640 480" className="w-full h-full">
      <path fill="#BA0C2F" d="M0 0h640v480H0z"/>
      <path fill="#fff" d="M0 176h176V0h96v176h368v128H272v176h-96V304H0z"/>
      <path fill="#00205B" d="M0 200h200V0h48v200h392v80H248v200h-48V280H0z"/>
    </svg>
  ),
}

export default function FlagIcon({ countryCode, className = "w-6 h-5" }) {
  const flag = flags[countryCode?.toLowerCase()]
  
  if (!flag) {
    // Fallback to a generic globe icon
    return (
      <div className={`${className} bg-gray-200 rounded-sm flex items-center justify-center`}>
        <span className="text-xs text-gray-500">{countryCode?.toUpperCase()}</span>
      </div>
    )
  }

  return (
    <div className={`${className} rounded-sm overflow-hidden shadow-sm ring-1 ring-black/10`}>
      {flag}
    </div>
  )
}
