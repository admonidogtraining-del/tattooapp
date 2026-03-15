interface Props {
  size?: number;
  className?: string;
}

export function InksightLogo({ size = 44, className }: Props) {
  const h = Math.round(size * 100 / 118);
  return (
    <svg
      viewBox="0 0 118 100"
      width={size}
      height={h}
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
    >
      <defs>
        <linearGradient id="il-left" x1="100%" y1="0%" x2="0%" y2="40%">
          <stop offset="0%" stopColor="#9060C8" />
          <stop offset="100%" stopColor="#6A38AA" />
        </linearGradient>
        <linearGradient id="il-right" x1="0%" y1="0%" x2="100%" y2="30%">
          <stop offset="0%" stopColor="#C05090" />
          <stop offset="100%" stopColor="#E84393" />
        </linearGradient>
        <linearGradient id="il-eye" x1="0%" y1="0%" x2="100%" y2="0%">
          <stop offset="0%" stopColor="#9060C8" />
          <stop offset="100%" stopColor="#E84393" />
        </linearGradient>
        <linearGradient id="il-stem" x1="0%" y1="0%" x2="0%" y2="100%">
          <stop offset="0%" stopColor="#B05090" />
          <stop offset="100%" stopColor="#C9A870" />
        </linearGradient>
      </defs>

      {/* ── Left hemisphere outline ── */}
      <path
        d="M59,7 C46,3 24,10 14,25 C5,39 8,58 20,71 C30,81 44,86 55,85 L59,85 L59,7Z"
        stroke="url(#il-left)" strokeWidth="1.8" fill="none" strokeLinejoin="round"
      />

      {/* ── Right hemisphere outline ── */}
      <path
        d="M59,7 C72,3 94,11 104,26 C113,40 110,60 99,73 C88,83 73,86 62,85 L59,85 L59,7Z"
        stroke="url(#il-right)" strokeWidth="1.8" fill="none" strokeLinejoin="round"
      />

      {/* ── Neural network spokes (left half) ── */}
      <line x1="33" y1="44" x2="33" y2="23" stroke="#7848C0" strokeWidth="1.2" />
      <line x1="33" y1="44" x2="48" y2="32" stroke="#8050C4" strokeWidth="1.2" />
      <line x1="33" y1="44" x2="52" y2="47" stroke="#8858C8" strokeWidth="1.2" />
      <line x1="33" y1="44" x2="43" y2="63" stroke="#8858C8" strokeWidth="1.2" />
      <line x1="33" y1="44" x2="18" y2="59" stroke="#7848C0" strokeWidth="1.2" />
      <line x1="33" y1="44" x2="14" y2="38" stroke="#7040B8" strokeWidth="1.2" />
      <line x1="33" y1="44" x2="20" y2="26" stroke="#7848C0" strokeWidth="1.2" />

      {/* Outer hexagonal ring */}
      <polyline
        points="33,23 48,32 52,47 43,63 18,59 14,38 20,26 33,23"
        stroke="#8050C0" strokeWidth="1.0" fill="none" strokeLinejoin="round"
      />

      {/* Brain-fold hint lines inside left lobe */}
      <line x1="26" y1="30" x2="24" y2="38" stroke="#6A38AA" strokeWidth="0.9" opacity="0.5" />
      <line x1="22" y1="50" x2="20" y2="58" stroke="#6A38AA" strokeWidth="0.9" opacity="0.5" />

      {/* Gold dots at network nodes */}
      <circle cx="33" cy="44" r="3.4" fill="#C9A870" />
      <circle cx="33" cy="23" r="2.2" fill="#C9A870" />
      <circle cx="48" cy="32" r="2.2" fill="#C9A870" />
      <circle cx="52" cy="47" r="2.2" fill="#C9A870" />
      <circle cx="43" cy="63" r="2.2" fill="#C9A870" />
      <circle cx="18" cy="59" r="2.2" fill="#C9A870" />
      <circle cx="14" cy="38" r="2.2" fill="#C9A870" />
      <circle cx="20" cy="26" r="2.2" fill="#C9A870" />

      {/* ── Eye (straddles center divide) ── */}
      <path
        d="M51,42 C54,34 62,31 70,34 C76,37 79,42 79,42 C79,42 76,47 70,50 C62,53 54,50 51,42Z"
        stroke="url(#il-eye)" strokeWidth="1.4" fill="none"
      />
      <circle cx="65" cy="42" r="5.2" stroke="url(#il-eye)" strokeWidth="1.2" fill="none" />
      {/* C-spiral pupil */}
      <path
        d="M65,40 C66.4,40 67.4,41 67.4,42.2 C67.4,43.4 66.4,44.2 65,44.2 C63.6,44.2 62.8,43.4 62.8,42"
        stroke="#C05090" strokeWidth="1.1" fill="none" strokeLinecap="round"
      />
      {/* Eye tail-lashes extending left */}
      <path d="M51,42 C49,38 46,36 43,35" stroke="#9060C8" strokeWidth="1.0" strokeLinecap="round" fill="none" />
      <path d="M51,42 C49,46 46,48 43,49" stroke="#9060C8" strokeWidth="1.0" strokeLinecap="round" fill="none" />

      {/* ── Organic right side ── */}

      {/* Phoenix arch – top */}
      <path d="M65,31 C74,23 89,15 99,16" stroke="url(#il-right)" strokeWidth="1.4" strokeLinecap="round" fill="none" />
      {/* Phoenix wings */}
      <path d="M99,16 C102,11 105,8 108,10" stroke="#E84393" strokeWidth="1.2" strokeLinecap="round" fill="none" />
      <path d="M99,16 C103,13 106,12 108,15" stroke="#E84393" strokeWidth="1.0" strokeLinecap="round" fill="none" />
      <path d="M99,16 C102,21 103,25 101,29" stroke="#D04898" strokeWidth="1.0" strokeLinecap="round" fill="none" />
      <circle cx="99" cy="16" r="2.1" fill="#E84393" />

      {/* Arch 2 */}
      <path d="M68,36 C79,29 94,26 104,30" stroke="url(#il-right)" strokeWidth="1.3" strokeLinecap="round" fill="none" />
      <path d="M104,30 C107,29 110,29 111,32" stroke="#E84393" strokeWidth="1.0" strokeLinecap="round" fill="none" />

      {/* Arch 3 – eye level */}
      <path d="M79,42 C87,40 96,40 104,44" stroke="#C85090" strokeWidth="1.3" strokeLinecap="round" fill="none" />
      <circle cx="104" cy="44" r="1.6" fill="#C85090" opacity="0.8" />

      {/* Arch 4 – lower */}
      <path d="M70,52 C81,50 93,50 101,55" stroke="#C05090" strokeWidth="1.3" strokeLinecap="round" fill="none" />
      <path d="M101,55 C103,59 103,63 101,66" stroke="#C05090" strokeWidth="1.0" strokeLinecap="round" fill="none" />
      <circle cx="93" cy="50" r="1.3" fill="#B84888" opacity="0.7" />

      {/* Arch 5 – floral lower */}
      <path d="M64,64 C74,63 85,62 93,67" stroke="#B84888" strokeWidth="1.2" strokeLinecap="round" fill="none" />

      {/* Lotus flower – bottom right */}
      <path
        d="M89,73 C87,68 89,65 92,69 C95,65 97,68 95,73 C98,72 100,74 97,76 C98,79 95,81 92,78 C89,81 86,79 87,76 C84,74 85,72 89,73Z"
        stroke="#E84393" strokeWidth="0.9" fill="none"
      />
      <circle cx="92" cy="74" r="1.6" fill="#C9A870" opacity="0.9" />

      {/* ── Brainstem ── */}
      <path
        d="M53,85 C52,91 52,96 55,98 C57,99.5 61,99.5 63,98 C66,96 66,91 65,85"
        stroke="url(#il-stem)" strokeWidth="1.9" strokeLinejoin="round" fill="none"
      />
    </svg>
  );
}
