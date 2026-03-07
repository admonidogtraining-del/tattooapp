export default function BodyPartPreview({ placement, skinHex }: { placement: string; skinHex: string }) {
  const p = placement.toLowerCase();
  const bg = '#0f172a';

  const cylStops = (
    <>
      <stop offset="0%" stopColor="rgba(0,0,0,0.55)" />
      <stop offset="18%" stopColor="rgba(0,0,0,0.12)" />
      <stop offset="42%" stopColor="rgba(255,255,255,0.28)" />
      <stop offset="65%" stopColor="rgba(0,0,0,0.08)" />
      <stop offset="100%" stopColor="rgba(0,0,0,0.52)" />
    </>
  );

  if (p.includes('back')) {
    return (
      <svg viewBox="0 0 400 480" className="w-full h-full block" xmlns="http://www.w3.org/2000/svg">
        <defs>
          <radialGradient id="bk-g" cx="50%" cy="32%" r="70%">
            <stop offset="0%" stopColor="rgba(255,255,255,0.22)" />
            <stop offset="55%" stopColor="rgba(0,0,0,0)" />
            <stop offset="100%" stopColor="rgba(0,0,0,0.4)" />
          </radialGradient>
        </defs>
        <rect width="400" height="480" fill={bg} />
        <path d="M50,0 Q28,240 65,480 L335,480 Q372,240 350,0 Z" fill={skinHex} />
        <path d="M50,0 Q28,240 65,480 L335,480 Q372,240 350,0 Z" fill="url(#bk-g)" />
        <ellipse cx="135" cy="148" rx="62" ry="44" fill="rgba(0,0,0,0.07)" transform="rotate(-12,135,148)" />
        <ellipse cx="265" cy="148" rx="62" ry="44" fill="rgba(0,0,0,0.07)" transform="rotate(12,265,148)" />
        <path d="M200,18 Q199,240 200,465" stroke="rgba(0,0,0,0.1)" strokeWidth="3" fill="none" strokeLinecap="round" />
        <circle cx="175" cy="432" r="10" fill="rgba(0,0,0,0.06)" />
        <circle cx="225" cy="432" r="10" fill="rgba(0,0,0,0.06)" />
      </svg>
    );
  }

  if (p.includes('chest')) {
    return (
      <svg viewBox="0 0 400 440" className="w-full h-full block" xmlns="http://www.w3.org/2000/svg">
        <defs>
          <radialGradient id="cl-g" cx="33%" cy="42%">
            <stop offset="0%" stopColor="rgba(255,255,255,0.26)" />
            <stop offset="100%" stopColor="rgba(0,0,0,0)" />
          </radialGradient>
          <radialGradient id="cr-g" cx="67%" cy="42%">
            <stop offset="0%" stopColor="rgba(255,255,255,0.22)" />
            <stop offset="100%" stopColor="rgba(0,0,0,0)" />
          </radialGradient>
        </defs>
        <rect width="400" height="440" fill={bg} />
        <path d="M38,0 Q18,220 58,440 L342,440 Q382,220 362,0 Z" fill={skinHex} />
        <ellipse cx="142" cy="210" rx="95" ry="78" fill="url(#cl-g)" />
        <ellipse cx="258" cy="210" rx="95" ry="78" fill="url(#cr-g)" />
        <path d="M200,65 Q200,220 200,400" stroke="rgba(0,0,0,0.1)" strokeWidth="2.5" fill="none" />
        <path d="M88,52 Q148,36 200,42" stroke="rgba(0,0,0,0.12)" strokeWidth="3" fill="none" strokeLinecap="round" />
        <path d="M312,52 Q252,36 200,42" stroke="rgba(0,0,0,0.12)" strokeWidth="3" fill="none" strokeLinecap="round" />
        <circle cx="142" cy="245" r="8" fill="rgba(0,0,0,0.06)" />
        <circle cx="258" cy="245" r="8" fill="rgba(0,0,0,0.06)" />
      </svg>
    );
  }

  if (p.includes('shoulder')) {
    return (
      <svg viewBox="0 0 380 420" className="w-full h-full block" xmlns="http://www.w3.org/2000/svg">
        <defs>
          <radialGradient id="sh-g" cx="44%" cy="38%" r="65%">
            <stop offset="0%" stopColor="rgba(255,255,255,0.3)" />
            <stop offset="58%" stopColor="rgba(0,0,0,0)" />
            <stop offset="100%" stopColor="rgba(0,0,0,0.42)" />
          </radialGradient>
        </defs>
        <rect width="380" height="420" fill={bg} />
        <path d="M38,420 Q18,262 78,128 Q128,32 200,16 Q272,32 302,128 Q352,262 342,420 Z" fill={skinHex} />
        <path d="M38,420 Q18,262 78,128 Q128,32 200,16 Q272,32 302,128 Q352,262 342,420 Z" fill="url(#sh-g)" />
      </svg>
    );
  }

  if (p.includes('rib')) {
    return (
      <svg viewBox="0 0 300 480" className="w-full h-full block" xmlns="http://www.w3.org/2000/svg">
        <defs>
          <linearGradient id="rb-g" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="rgba(0,0,0,0.48)" />
            <stop offset="32%" stopColor="rgba(255,255,255,0.22)" />
            <stop offset="100%" stopColor="rgba(0,0,0,0.32)" />
          </linearGradient>
        </defs>
        <rect width="300" height="480" fill={bg} />
        <path d="M48,0 Q28,240 58,480 L242,480 Q272,240 252,0 Z" fill={skinHex} />
        <path d="M48,0 Q28,240 58,480 L242,480 Q272,240 252,0 Z" fill="url(#rb-g)" />
        <path d="M68,96 Q150,88 232,100" stroke="rgba(0,0,0,0.1)" strokeWidth="2.5" fill="none" />
        <path d="M68,140 Q150,132 232,144" stroke="rgba(0,0,0,0.1)" strokeWidth="2.5" fill="none" />
        <path d="M68,184 Q150,176 232,188" stroke="rgba(0,0,0,0.1)" strokeWidth="2.5" fill="none" />
        <path d="M68,228 Q150,220 232,232" stroke="rgba(0,0,0,0.1)" strokeWidth="2.5" fill="none" />
        <path d="M68,272 Q150,264 232,276" stroke="rgba(0,0,0,0.1)" strokeWidth="2.5" fill="none" />
        <path d="M68,316 Q150,308 232,320" stroke="rgba(0,0,0,0.1)" strokeWidth="2.5" fill="none" />
      </svg>
    );
  }

  if (p.includes('thigh') || (p.includes('leg') && !p.includes('calf') && !p.includes('lower'))) {
    return (
      <svg viewBox="0 0 320 480" className="w-full h-full block" xmlns="http://www.w3.org/2000/svg">
        <defs>
          <linearGradient id="th-g" x1="0%" y1="0%" x2="100%" y2="0%">{cylStops}</linearGradient>
        </defs>
        <rect width="320" height="480" fill={bg} />
        <path d="M38,0 Q22,240 52,480 L268,480 Q298,240 282,0 Z" fill={skinHex} />
        <path d="M38,0 Q22,240 52,480 L268,480 Q298,240 282,0 Z" fill="url(#th-g)" />
      </svg>
    );
  }

  if (p.includes('wrist')) {
    return (
      <svg viewBox="0 0 240 440" className="w-full h-full block" xmlns="http://www.w3.org/2000/svg">
        <defs>
          <linearGradient id="wr-g" x1="0%" y1="0%" x2="100%" y2="0%">{cylStops}</linearGradient>
        </defs>
        <rect width="240" height="440" fill={bg} />
        <path d="M64,0 Q52,200 66,360 L174,360 Q188,200 176,0 Z" fill={skinHex} />
        <path d="M64,0 Q52,200 66,360 L174,360 Q188,200 176,0 Z" fill="url(#wr-g)" />
        <path d="M78,328 Q120,315 162,328" stroke="rgba(255,255,255,0.12)" strokeWidth="2" fill="none" />
        <path d="M38,352 Q36,398 52,440 L188,440 Q204,398 202,352 Z" fill={skinHex} opacity="0.75" />
      </svg>
    );
  }

  if (p.includes('ankle') || p.includes('foot')) {
    return (
      <svg viewBox="0 0 280 460" className="w-full h-full block" xmlns="http://www.w3.org/2000/svg">
        <defs>
          <linearGradient id="an-g" x1="0%" y1="0%" x2="100%" y2="0%">{cylStops}</linearGradient>
        </defs>
        <rect width="280" height="460" fill={bg} />
        <path d="M74,0 Q58,180 66,310 L214,310 Q222,180 206,0 Z" fill={skinHex} />
        <path d="M74,0 Q58,180 66,310 L214,310 Q222,180 206,0 Z" fill="url(#an-g)" />
        <path d="M66,290 Q78,318 84,355 L196,355 Q202,318 214,290 Z" fill={skinHex} />
        <circle cx="82" cy="335" r="13" fill="rgba(255,255,255,0.1)" />
        <circle cx="198" cy="335" r="13" fill="rgba(255,255,255,0.08)" />
        <path d="M78,352 Q68,400 88,450 L248,450 Q260,390 228,352 Z" fill={skinHex} opacity="0.72" />
      </svg>
    );
  }

  if (p.includes('neck')) {
    return (
      <svg viewBox="0 0 240 440" className="w-full h-full block" xmlns="http://www.w3.org/2000/svg">
        <defs>
          <linearGradient id="nk-g" x1="0%" y1="0%" x2="100%" y2="0%">{cylStops}</linearGradient>
        </defs>
        <rect width="240" height="440" fill={bg} />
        <path d="M60,0 Q48,220 64,440 L176,440 Q192,220 180,0 Z" fill={skinHex} />
        <path d="M60,0 Q48,220 64,440 L176,440 Q192,220 180,0 Z" fill="url(#nk-g)" />
        <ellipse cx="120" cy="215" rx="20" ry="13" fill="rgba(0,0,0,0.07)" />
      </svg>
    );
  }

  if (p.includes('hand') || p.includes('finger')) {
    return (
      <svg viewBox="0 0 300 440" className="w-full h-full block" xmlns="http://www.w3.org/2000/svg">
        <defs>
          <radialGradient id="hd-g" cx="50%" cy="65%">
            <stop offset="0%" stopColor="rgba(255,255,255,0.2)" />
            <stop offset="100%" stopColor="rgba(0,0,0,0.32)" />
          </radialGradient>
        </defs>
        <rect width="300" height="440" fill={bg} />
        <rect x="68" y="58" width="34" height="162" rx="17" fill={skinHex} />
        <rect x="112" y="22" width="34" height="195" rx="17" fill={skinHex} />
        <rect x="156" y="18" width="34" height="198" rx="17" fill={skinHex} />
        <rect x="200" y="42" width="34" height="176" rx="17" fill={skinHex} />
        <path d="M28,188 Q8,148 28,106 Q48,72 74,124 L78,210 Z" fill={skinHex} />
        <path d="M62,208 Q58,338 82,440 L218,440 Q242,338 238,208 Z" fill={skinHex} />
        <path d="M62,208 Q58,338 82,440 L218,440 Q242,338 238,208 Z" fill="url(#hd-g)" />
      </svg>
    );
  }

  if (p.includes('calf')) {
    return (
      <svg viewBox="0 0 300 460" className="w-full h-full block" xmlns="http://www.w3.org/2000/svg">
        <defs>
          <linearGradient id="ca-g" x1="0%" y1="0%" x2="100%" y2="0%">{cylStops}</linearGradient>
        </defs>
        <rect width="300" height="460" fill={bg} />
        <path d="M88,0 Q68,155 58,228 Q52,288 78,460 L222,460 Q248,288 242,228 Q232,155 212,0 Z" fill={skinHex} />
        <path d="M88,0 Q68,155 58,228 Q52,288 78,460 L222,460 Q248,288 242,228 Q232,155 212,0 Z" fill="url(#ca-g)" />
      </svg>
    );
  }

  // Default: forearm
  return (
    <svg viewBox="0 0 300 480" className="w-full h-full block" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <linearGradient id="fa-g" x1="0%" y1="0%" x2="100%" y2="0%">{cylStops}</linearGradient>
      </defs>
      <rect width="300" height="480" fill={bg} />
      <path d="M80,0 Q66,240 86,480 L214,480 Q234,240 220,0 Z" fill={skinHex} />
      <path d="M80,0 Q66,240 86,480 L214,480 Q234,240 220,0 Z" fill="url(#fa-g)" />
      <ellipse cx="150" cy="18" rx="72" ry="22" fill={skinHex} />
      <ellipse cx="150" cy="462" rx="60" ry="20" fill={skinHex} opacity="0.85" />
    </svg>
  );
}
