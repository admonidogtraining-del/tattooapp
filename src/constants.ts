// Short prompts used to generate AI preview images for the style-selection cards
// Note: word "tattoo" intentionally avoided to reduce content-filter rejections
export const STYLE_CARD_PROMPTS: Record<string, string> = {
  'American Traditional': 'American Traditional old school flash art illustration of a bold eagle with banner scroll, pure white background, thick uniform black outlines, flat red yellow green fills, zero shading, classic sailor flash sheet style',
  'Neo-Traditional': 'Neo-Traditional decorative illustration of an ornate rose with filigree scrollwork, white background, jewel tone purples and teals, varied bold line weights, crisp white highlights',
  'Japanese (Irezumi)': 'Japanese Irezumi traditional art of a koi fish with waves and wind bars, white background, bold black outlines, vivid red and gold flat fills, flowing gakubori wave background elements',
  'Black & Grey Realism': 'Black and grey realism illustration of a lion portrait, white background, zero outlines, smooth graywash shading only, single light source, photorealistic 3D volume, only black and grey tones',
  'Micro-Realism': 'Micro realism single-needle fine-line illustration of a tiny detailed butterfly, pure white background, ultra-fine hairline strokes, miniature hyper-detailed, high contrast, no thick outlines',
  'Color Realism': 'Color realism painterly illustration of a vibrant hummingbird, white background, no black outlines, rich saturated painterly color blending, complementary colors, photorealistic impressionism',
  'Blackwork': 'Blackwork geometric mandala design, white background, only solid pure black ink, bold interlocking geometric pattern, strong negative space contrast, no grey tones no color',
  'Cybersigilism': 'Cybersigilism design, white background, ultra-thin sharp black lines only, aggressive alien sigil geometry, long tapering stinger forms, no fills, wiry needle-thin organic-geometric lines',
  'Dotwork': 'Dotwork stippling mandala design, white background, form created entirely from individual dots, pointillist dot density creates shadows and highlights, no solid lines, grainy tactile texture',
  'Trash Polka': 'Trash Polka collage illustration, white background, ONLY black and red ink, realistic skull combined with abstract red paint splatters and bold graphic text, chaotic layered graphic composition',
  'Ignorant Style': 'Ignorant style naive illustration of a simple smiley face, white background, intentionally shaky imperfect wobbly lines, childlike sharpie drawing aesthetic, flat 2D, deliberately crude',
  'Patchwork': 'Patchwork flash collection illustration, white background, six small traditional flash designs arranged in a grid layout, each design surrounded by white border, hearts stars roses daggers snakes',
};

export const SKIN_TONES = [
  { label: 'Very Light', value: 'Very Light', color: '#FDDBB4' },
  { label: 'Light', value: 'Light', color: '#E8B078' },
  { label: 'Medium', value: 'Medium', color: '#C68642' },
  { label: 'Dark', value: 'Dark', color: '#8D5524' },
  { label: 'Very Dark', value: 'Very Dark', color: '#3D1A0A' },
];

const mkSvg = (svg: string) => `data:image/svg+xml,${encodeURIComponent(svg)}`;

export const TATTOO_STYLES = [
  {
    id: 'American Traditional',
    name: 'American Traditional',
    desc: 'Bold lines, solid colors (red, yellow, green, black).',
    imgSrc: mkSvg(`<svg viewBox="0 0 200 150" xmlns="http://www.w3.org/2000/svg"><rect width="200" height="150" fill="#0f0002"/><circle cx="100" cy="32" r="15" fill="none" stroke="#dc2626" stroke-width="8"/><rect x="94" y="47" width="12" height="70" rx="3" fill="#dc2626"/><rect x="58" y="73" width="84" height="11" rx="5" fill="#eab308"/><path d="M58,78 Q38,96 47,114 Q65,124 79,110 L74,84Z" fill="#dc2626"/><path d="M142,78 Q162,96 153,114 Q135,124 121,110 L126,84Z" fill="#dc2626"/><circle cx="100" cy="117" r="7" fill="#eab308"/><path d="M96,50 Q104,56 96,62 Q104,68 96,74" fill="none" stroke="#eab308" stroke-width="2.5" stroke-linecap="round"/><text x="20" y="38" font-size="22" fill="#eab308" font-family="serif">&#9733;</text><text x="158" y="38" font-size="22" fill="#eab308" font-family="serif">&#9733;</text></svg>`),
  },
  {
    id: 'Neo-Traditional',
    name: 'Neo-Traditional',
    desc: 'Varying line weights, jewel tones, filigree.',
    imgSrc: mkSvg(`<svg viewBox="0 0 200 150" xmlns="http://www.w3.org/2000/svg"><rect width="200" height="150" fill="#0f0a1e"/><path d="M100,145 Q98,120 100,100 Q102,80 100,62" stroke="#166534" stroke-width="4" fill="none"/><path d="M100,115 Q80,108 75,96 Q87,95 100,110" fill="#166534" stroke="#0a0518" stroke-width="1.5"/><path d="M100,100 Q122,93 127,80 Q115,80 100,96" fill="#14532d" stroke="#0a0518" stroke-width="1.5"/><path d="M80,48 Q78,30 90,26 Q100,24 100,36" fill="#581c87" stroke="#09090b" stroke-width="3"/><path d="M120,48 Q122,30 110,26 Q100,24 100,36" fill="#6d28d9" stroke="#09090b" stroke-width="3"/><path d="M72,58 Q56,50 58,36 Q68,40 74,52" fill="#4c1d95" stroke="#09090b" stroke-width="2.5"/><path d="M128,58 Q144,50 142,36 Q132,40 126,52" fill="#5b21b6" stroke="#09090b" stroke-width="2.5"/><ellipse cx="100" cy="62" rx="32" ry="28" fill="#7c3aed" stroke="#09090b" stroke-width="4"/><ellipse cx="100" cy="60" rx="20" ry="18" fill="#6d28d9"/><path d="M100,50 Q108,52 106,60 Q104,68 96,66 Q88,64 90,56 Q92,48 100,50" fill="none" stroke="#a78bfa" stroke-width="2"/><ellipse cx="88" cy="52" rx="7" ry="10" fill="rgba(255,255,255,0.22)" transform="rotate(-20,88,52)"/><path d="M72,65 Q60,80 64,95 Q68,82 75,72Z" fill="#4c1d95" stroke="#09090b" stroke-width="2"/><path d="M128,65 Q140,80 136,95 Q132,82 125,72Z" fill="#5b21b6" stroke="#09090b" stroke-width="2"/></svg>`),
  },
  {
    id: 'Japanese (Irezumi)',
    name: 'Japanese (Irezumi)',
    desc: 'Flowing backgrounds, mythological motifs.',
    imgSrc: mkSvg(`<svg viewBox="0 0 200 150" xmlns="http://www.w3.org/2000/svg"><rect width="200" height="150" fill="#050010"/><path d="M0,90 Q25,70 50,90 Q75,110 100,90 Q125,70 150,90 Q175,110 200,90 L200,150 L0,150Z" fill="#1e1b4b"/><path d="M0,105 Q25,88 50,105 Q75,122 100,105 Q125,88 150,105 Q175,122 200,105 L200,150 L0,150Z" fill="#1e3a8a" opacity="0.7"/><path d="M45,85 Q28,98 18,82 Q26,65 45,75Z" fill="#dc2626" stroke="#111" stroke-width="2.5"/><ellipse cx="100" cy="72" rx="55" ry="24" fill="#dc2626" stroke="#111" stroke-width="3.5" transform="rotate(-15,100,72)"/><ellipse cx="148" cy="52" rx="20" ry="15" fill="#b91c1c" stroke="#111" stroke-width="3"/><path d="M85,67 Q90,59 95,67" fill="none" stroke="#7f1d1d" stroke-width="1.5"/><path d="M96,67 Q101,59 106,67" fill="none" stroke="#7f1d1d" stroke-width="1.5"/><path d="M107,67 Q112,59 117,67" fill="none" stroke="#7f1d1d" stroke-width="1.5"/><path d="M90,76 Q95,68 100,76" fill="none" stroke="#7f1d1d" stroke-width="1.5"/><path d="M101,76 Q106,68 111,76" fill="none" stroke="#7f1d1d" stroke-width="1.5"/><path d="M113,58 Q120,38 132,52" fill="#f87171" stroke="#111" stroke-width="2"/><circle cx="150" cy="50" r="5" fill="#0a0010"/><circle cx="151" cy="49" r="2" fill="#fff"/><path d="M160,48 Q175,38 183,43" stroke="#eab308" stroke-width="2" fill="none" stroke-linecap="round"/><path d="M160,52 Q175,55 182,50" stroke="#eab308" stroke-width="1.5" fill="none" stroke-linecap="round"/></svg>`),
  },
  {
    id: 'Black & Grey Realism',
    name: 'Black & Grey Realism',
    desc: 'Smooth shading, no outlines, highly detailed.',
    imgSrc: mkSvg(`<svg viewBox="0 0 200 150" xmlns="http://www.w3.org/2000/svg"><defs><radialGradient id="sg" cx="40%" cy="30%"><stop offset="0%" stop-color="#e4e4e7"/><stop offset="55%" stop-color="#a1a1aa"/><stop offset="100%" stop-color="#27272a"/></radialGradient><radialGradient id="ey" cx="30%" cy="25%"><stop offset="0%" stop-color="#52525b"/><stop offset="100%" stop-color="#09090b"/></radialGradient></defs><rect width="200" height="150" fill="#09090b"/><ellipse cx="100" cy="64" rx="50" ry="52" fill="url(#sg)"/><rect x="54" y="95" width="92" height="22" rx="11" fill="#71717a"/><rect x="64" y="106" width="72" height="30" rx="8" fill="#52525b"/><rect x="74" y="122" width="10" height="15" rx="2" fill="#d4d4d8"/><rect x="88" y="122" width="10" height="17" rx="2" fill="#d4d4d8"/><rect x="102" y="122" width="10" height="17" rx="2" fill="#d4d4d8"/><rect x="116" y="122" width="10" height="15" rx="2" fill="#d4d4d8"/><ellipse cx="76" cy="70" rx="20" ry="19" fill="url(#ey)"/><ellipse cx="124" cy="70" rx="20" ry="19" fill="url(#ey)"/><path d="M88,94 Q100,86 112,94 Q107,103 100,105 Q93,103 88,94Z" fill="#18181b"/><ellipse cx="82" cy="46" rx="12" ry="8" fill="rgba(255,255,255,0.2)" transform="rotate(-20,82,46)"/></svg>`),
  },
  {
    id: 'Micro-Realism',
    name: 'Micro-Realism',
    desc: 'Tiny, intricate details using single needle.',
    imgSrc: mkSvg(`<svg viewBox="0 0 200 150" xmlns="http://www.w3.org/2000/svg"><rect width="200" height="150" fill="#fafafa"/><path d="M100,148 Q98,125 100,100 Q102,78 99,58" stroke="#3f3f46" stroke-width="0.8" fill="none"/><path d="M100,122 Q78,114 72,103 Q84,102 100,118" fill="none" stroke="#3f3f46" stroke-width="0.7"/><path d="M100,108 Q122,100 128,88 Q116,89 100,105" fill="none" stroke="#3f3f46" stroke-width="0.7"/><path d="M100,20 Q118,28 120,46 Q118,64 100,72 Q82,64 80,46 Q82,28 100,20Z" fill="none" stroke="#be185d" stroke-width="0.9"/><path d="M82,26 Q80,12 94,12 Q100,16 100,20" fill="none" stroke="#be185d" stroke-width="0.65"/><path d="M118,26 Q120,12 106,12 Q100,16 100,20" fill="none" stroke="#be185d" stroke-width="0.65"/><path d="M76,48 Q62,42 64,30 Q74,34 78,44" fill="none" stroke="#be185d" stroke-width="0.65"/><path d="M124,48 Q138,42 136,30 Q126,34 122,44" fill="none" stroke="#be185d" stroke-width="0.65"/><path d="M76,54 Q60,64 63,77 Q73,73 79,62" fill="none" stroke="#be185d" stroke-width="0.65"/><path d="M124,54 Q140,64 137,77 Q127,73 121,62" fill="none" stroke="#be185d" stroke-width="0.65"/><path d="M100,38 Q105,35 104,42 Q103,49 97,47 Q91,45 93,38 Q95,31 101,34" fill="none" stroke="#be185d" stroke-width="0.8"/><line x1="90" y1="30" x2="87" y2="62" stroke="#be185d" stroke-width="0.35" opacity="0.5"/><line x1="110" y1="30" x2="113" y2="62" stroke="#be185d" stroke-width="0.35" opacity="0.5"/></svg>`),
  },
  {
    id: 'Color Realism',
    name: 'Color Realism',
    desc: 'Painterly, vibrant, no black outlines.',
    imgSrc: mkSvg(`<svg viewBox="0 0 200 150" xmlns="http://www.w3.org/2000/svg"><rect width="200" height="150" fill="#0c0a0a"/><ellipse cx="100" cy="58" rx="38" ry="30" fill="#b91c1c" opacity="0.9"/><ellipse cx="80" cy="65" rx="26" ry="21" fill="#dc2626" opacity="0.85"/><ellipse cx="120" cy="65" rx="26" ry="21" fill="#ef4444" opacity="0.8"/><ellipse cx="95" cy="72" rx="22" ry="18" fill="#dc2626" opacity="0.9"/><ellipse cx="105" cy="72" rx="22" ry="18" fill="#b91c1c" opacity="0.85"/><ellipse cx="84" cy="46" rx="20" ry="24" fill="#be123c" opacity="0.75"/><ellipse cx="116" cy="46" rx="20" ry="24" fill="#9f1239" opacity="0.75"/><ellipse cx="100" cy="38" rx="16" ry="16" fill="#e11d48" opacity="0.7"/><ellipse cx="88" cy="51" rx="11" ry="8" fill="#fca5a5" opacity="0.4"/><ellipse cx="84" cy="59" rx="7" ry="6" fill="#fecdd3" opacity="0.25"/><ellipse cx="100" cy="62" rx="14" ry="11" fill="#7f1d1d" opacity="0.85"/><ellipse cx="100" cy="62" rx="7" ry="6" fill="#3b0a0a" opacity="0.95"/><path d="M78,88 Q64,110 68,132" stroke="#166534" stroke-width="14" fill="none" stroke-linecap="round" opacity="0.9"/><path d="M122,88 Q136,110 132,132" stroke="#15803d" stroke-width="11" fill="none" stroke-linecap="round" opacity="0.85"/><path d="M92,92 Q82,118 86,142" stroke="#14532d" stroke-width="9" fill="none" stroke-linecap="round"/></svg>`),
  },
  {
    id: 'Blackwork',
    name: 'Blackwork',
    desc: 'Heavy black saturation, negative space.',
    imgSrc: mkSvg(`<svg viewBox="0 0 200 150" xmlns="http://www.w3.org/2000/svg"><rect width="200" height="150" fill="#f5f5f0"/><circle cx="100" cy="75" r="65" fill="#09090b"/><circle cx="100" cy="75" r="52" fill="#f5f5f0"/><circle cx="100" cy="75" r="42" fill="#09090b"/><circle cx="100" cy="75" r="30" fill="#f5f5f0"/><circle cx="100" cy="75" r="20" fill="#09090b"/><circle cx="100" cy="75" r="10" fill="#f5f5f0"/><circle cx="100" cy="75" r="4" fill="#09090b"/><polygon points="100,11 104,68 100,75 96,68" fill="#09090b"/><polygon points="100,139 96,82 100,75 104,82" fill="#09090b"/><polygon points="36,75 93,71 100,75 93,79" fill="#09090b"/><polygon points="164,75 107,79 100,75 107,71" fill="#09090b"/><polygon points="55,30 97,72 100,75 94,78" fill="#09090b"/><polygon points="145,120 103,78 100,75 106,72" fill="#09090b"/><polygon points="55,120 97,78 100,75 94,72" fill="#09090b"/><polygon points="145,30 103,72 100,75 106,78" fill="#09090b"/></svg>`),
  },
  {
    id: 'Cybersigilism',
    name: 'Cybersigilism',
    desc: 'Sharp, aggressive, wire-like thin lines.',
    imgSrc: mkSvg(`<svg viewBox="0 0 200 150" xmlns="http://www.w3.org/2000/svg"><rect width="200" height="150" fill="#020617"/><path d="M100,8 L110,48 L148,22 L122,58 L172,52 L132,74 L178,88 L132,96 L158,132 L110,104 L108,148 L100,108 L92,148 L90,104 L42,132 L68,96 L22,88 L68,74 L28,52 L78,58 L52,22 L90,48Z" fill="none" stroke="#60a5fa" stroke-width="1.4" stroke-linejoin="round"/><path d="M100,28 L107,58 L132,40 L114,62 L148,58 L120,74 L152,84 L120,90 L136,118 L106,96 L100,132 L94,96 L64,118 L80,90 L48,84 L80,74 L52,58 L86,62 L68,40 L93,58Z" fill="none" stroke="#93c5fd" stroke-width="0.7" stroke-linejoin="round" opacity="0.45"/><circle cx="100" cy="75" r="9" fill="none" stroke="#60a5fa" stroke-width="1.5"/><circle cx="100" cy="75" r="3" fill="#60a5fa" opacity="0.8"/></svg>`),
  },
  {
    id: 'Dotwork',
    name: 'Dotwork',
    desc: 'Images created entirely with stippled dots.',
    imgSrc: mkSvg(`<svg viewBox="0 0 200 150" xmlns="http://www.w3.org/2000/svg"><defs><pattern id="dp1" x="0" y="0" width="7" height="7" patternUnits="userSpaceOnUse"><circle cx="3.5" cy="3.5" r="0.9" fill="#1c1917"/></pattern><pattern id="dp2" x="0" y="0" width="5" height="5" patternUnits="userSpaceOnUse"><circle cx="2.5" cy="2.5" r="1.1" fill="#1c1917"/></pattern><pattern id="dp3" x="0" y="0" width="3.5" height="3.5" patternUnits="userSpaceOnUse"><circle cx="1.75" cy="1.75" r="1.1" fill="#1c1917"/></pattern><clipPath id="r1"><circle cx="100" cy="75" r="64"/></clipPath><clipPath id="r2"><circle cx="100" cy="75" r="46"/></clipPath><clipPath id="r3"><circle cx="100" cy="75" r="28"/></clipPath><clipPath id="r4"><circle cx="100" cy="75" r="12"/></clipPath></defs><rect width="200" height="150" fill="#fafaf9"/><rect x="30" y="8" width="140" height="140" fill="url(#dp1)" clip-path="url(#r1)"/><circle cx="100" cy="75" r="46" fill="#fafaf9"/><rect x="48" y="25" width="104" height="104" fill="url(#dp2)" clip-path="url(#r2)"/><circle cx="100" cy="75" r="28" fill="#fafaf9"/><rect x="68" y="45" width="64" height="64" fill="url(#dp3)" clip-path="url(#r3)"/><circle cx="100" cy="75" r="12" fill="#fafaf9"/><rect x="86" y="61" width="28" height="28" fill="url(#dp3)" clip-path="url(#r4)"/><circle cx="100" cy="75" r="3" fill="#1c1917"/></svg>`),
  },
  {
    id: 'Trash Polka',
    name: 'Trash Polka',
    desc: 'Collage style, black and red, chaotic.',
    imgSrc: mkSvg(`<svg viewBox="0 0 200 150" xmlns="http://www.w3.org/2000/svg"><rect width="200" height="150" fill="#f5f5f0"/><ellipse cx="80" cy="60" rx="45" ry="30" fill="#09090b" opacity="0.85" transform="rotate(-15,80,60)"/><rect x="30" y="90" width="80" height="40" fill="#09090b" opacity="0.7" transform="rotate(5,70,110)"/><ellipse cx="140" cy="100" rx="35" ry="45" fill="#09090b" opacity="0.75" transform="rotate(20,140,100)"/><ellipse cx="120" cy="35" rx="40" ry="20" fill="#dc2626" opacity="0.9" transform="rotate(-25,120,35)"/><ellipse cx="160" cy="70" rx="20" ry="35" fill="#dc2626" opacity="0.8" transform="rotate(10,160,70)"/><circle cx="60" cy="130" r="22" fill="#dc2626" opacity="0.75"/><text x="100" y="80" font-size="26" fill="#f5f5f0" text-anchor="middle" font-family="sans-serif" font-weight="900" opacity="0.88" transform="rotate(-8,100,80)">CHAOS</text></svg>`),
  },
  {
    id: 'Ignorant Style',
    name: 'Ignorant Style',
    desc: 'Intentional amateurism, simple line drawings.',
    imgSrc: mkSvg(`<svg viewBox="0 0 200 150" xmlns="http://www.w3.org/2000/svg"><rect width="200" height="150" fill="#fafaf9"/><path d="M65,45 Q63,22 75,20 L80,38" fill="none" stroke="#09090b" stroke-width="4" stroke-linecap="round"/><path d="M135,45 Q137,22 125,20 L120,38" fill="none" stroke="#09090b" stroke-width="4" stroke-linecap="round"/><path d="M65,45 Q64,85 68,100 Q80,115 100,116 Q120,115 132,100 Q136,85 135,45 Q115,38 100,40 Q85,38 65,45Z" fill="none" stroke="#09090b" stroke-width="4.5" stroke-linejoin="round"/><circle cx="83" cy="68" r="9" fill="none" stroke="#09090b" stroke-width="3.5"/><circle cx="87" cy="70" r="5" fill="#09090b"/><circle cx="118" cy="66" r="9" fill="none" stroke="#09090b" stroke-width="3.5"/><circle cx="120" cy="69" r="5" fill="#09090b"/><path d="M97,82 L100,88 L103,82" fill="none" stroke="#09090b" stroke-width="3" stroke-linejoin="round"/><path d="M86,96 Q100,108 114,96" fill="none" stroke="#09090b" stroke-width="3.5" stroke-linecap="round"/></svg>`),
  },
  {
    id: 'Patchwork',
    name: 'Patchwork',
    desc: 'Collection of small, unrelated tattoos.',
    imgSrc: mkSvg(`<svg viewBox="0 0 200 150" xmlns="http://www.w3.org/2000/svg"><rect width="200" height="150" fill="#09090b"/><line x1="100" y1="5" x2="100" y2="145" stroke="#27272a" stroke-width="1" stroke-dasharray="4,4"/><line x1="5" y1="75" x2="195" y2="75" stroke="#27272a" stroke-width="1" stroke-dasharray="4,4"/><polygon points="50,18 55,32 70,32 58,41 63,56 50,47 37,56 42,41 30,32 45,32" fill="#eab308" stroke="#000" stroke-width="2"/><path d="M145,18 Q135,8 125,18 Q115,28 145,48 Q175,28 165,18 Q155,8 145,18Z" fill="#dc2626" stroke="#000" stroke-width="2"/><rect x="22" y="88" width="42" height="42" rx="7" fill="#f5f5f0" stroke="#09090b" stroke-width="3"/><circle cx="33" cy="99" r="3.5" fill="#09090b"/><circle cx="53" cy="99" r="3.5" fill="#09090b"/><circle cx="43" cy="109" r="3.5" fill="#09090b"/><circle cx="33" cy="119" r="3.5" fill="#09090b"/><circle cx="53" cy="119" r="3.5" fill="#09090b"/><path d="M138,86 L156,86 L142,108 L162,108 L130,148 L144,118 L126,118Z" fill="#eab308" stroke="#09090b" stroke-width="2.5" stroke-linejoin="round"/></svg>`),
  },
];

export const STYLE_IMAGE_PROMPTS: Record<string, string> = {
  'American Traditional':
    'STYLE: American Traditional (Old School) tattoo flash art. RULES — NO EXCEPTIONS: (1) Bold uniform thick black outlines on every shape, (2) Flat solid color fills using ONLY red, black, gold/yellow — absolutely zero gradients or blending, (3) Classic sailor tattoo poster aesthetic, (4) No photorealism, no shading, no textures.',
  'Neo-Traditional':
    'STYLE: Neo-Traditional tattoo illustration. RULES — NO EXCEPTIONS: (1) Hierarchical line weights — thick bold outer contour, progressively thinner internal detail lines, (2) Jewel tone palette (deep purple, teal, magenta, forest green), (3) Ornamental filigree and decorative flourishes, (4) Crisp white ink highlights, (5) No photorealistic shading.',
  'Japanese (Irezumi)':
    'STYLE: Japanese Irezumi traditional tattoo art. RULES — NO EXCEPTIONS: (1) Bold black outlines throughout, (2) Flat vivid color fills (red, black, gold), (3) Traditional gakubori background elements (stylized wind bars, crashing waves, or flowing clouds), (4) Classical Japanese motif treatment, (5) No Western shading techniques.',
  'Black & Grey Realism':
    'STYLE: Black & Grey Realism tattoo. RULES — NO EXCEPTIONS: (1) Zero outlines — all form built entirely from graywash, (2) Single consistent light source from upper-left creating photorealistic 3D volume, (3) ONLY black and grey tones — absolutely no color, (4) Power blacks in deepest shadow areas, smooth transitions to white highlights.',
  'Micro-Realism':
    'STYLE: Micro-Realism single-needle tattoo. RULES — NO EXCEPTIONS: (1) Extremely delicate ultra-thin hairline strokes (single needle 1RL weight), (2) Miniature hyper-detailed precision work, (3) No thick outlines anywhere, (4) Maximum contrast between fine detail and pure white background, (5) Every element rendered at tiny miniature scale.',
  'Color Realism':
    'STYLE: Color Realism painterly tattoo. RULES — NO EXCEPTIONS: (1) Absolutely no black outlines — shape defined entirely by color contrast, (2) Painterly blending of rich saturated pigments, (3) Impressionistic photorealism with complementary color contrast, (4) Vibrant luminous colors, (5) Soft edges with no hard line work.',
  'Blackwork':
    'STYLE: Blackwork tattoo. RULES — NO EXCEPTIONS: (1) ONLY pure solid black ink — no grey tones, no color, (2) Art exists entirely in negative space contrast between solid black and white, (3) Bold geometric or tribal forms with maximum black saturation, (4) No gradients, no outlines separate from fills.',
  'Cybersigilism':
    'STYLE: Cybersigilism tattoo. RULES — NO EXCEPTIONS: (1) Ultra-thin sharp black lines only — needle-thin, (2) No filled solid areas anywhere, (3) Aggressive organic-geometric shapes combining alien sigil forms with biological thorns and stingers, (4) Long tapering pointed forms, (5) Pure line art — zero fills, zero shading.',
  'Dotwork':
    'STYLE: Dotwork / Pointillist tattoo. RULES — NO EXCEPTIONS: (1) Every element of the design — including all shading — must be formed ONLY from individual dots, (2) No solid lines or fills anywhere, (3) High dot density = dark shadow, low dot density = highlight, (4) Grainy tactile pointillist texture throughout.',
  'Trash Polka':
    'STYLE: Trash Polka tattoo collage. RULES — NO EXCEPTIONS: (1) ONLY black and red — no other colors, (2) Chaotic collage layering: realistic imagery + abstract red paint splatters + bold graphic text + geometric elements, (3) High contrast aggressive composition, (4) Intentionally chaotic overlapping layers.',
  'Ignorant Style':
    'STYLE: Ignorant Style hand-poked tattoo. RULES — NO EXCEPTIONS: (1) Intentionally shaky imperfect wobbly lines — NOT smooth, (2) Naive childlike flat 2D drawing aesthetic (sharpie/ballpoint pen look), (3) Wrong proportions, simplified shapes, (4) Zero professional polish — looks handmade and crude, (5) No shading or gradients.',
  'Patchwork':
    'STYLE: Patchwork tattoo flash collection. RULES — NO EXCEPTIONS: (1) Multiple small distinct traditional tattoo designs arranged as a collection on white background, (2) Every individual element has a white border/outline around it separating it from adjacent pieces, (3) Classic flash motifs (hearts, stars, roses, daggers, snakes, animals), (4) Flash sheet layout.',
};

export const STYLE_SLUGS: Record<string, string> = {
  'American Traditional': 'american-traditional',
  'Neo-Traditional': 'neo-traditional',
  'Japanese (Irezumi)': 'japanese-irezumi',
  'Black & Grey Realism': 'black-grey-realism',
  'Micro-Realism': 'micro-realism',
  'Color Realism': 'color-realism',
  'Blackwork': 'blackwork',
  'Cybersigilism': 'cybersigilism',
  'Dotwork': 'dotwork',
  'Trash Polka': 'trash-polka',
  'Ignorant Style': 'ignorant-style',
  'Patchwork': 'patchwork',
};

export const stylePreviewPublicUrl = (styleId: string): string | null => {
  const slug = STYLE_SLUGS[styleId];
  return slug ? `/style-previews/${slug}.png` : null;
};

export const buildStylePrompt = (dallePrompt: string, style: string): string => {
  const prefix = STYLE_IMAGE_PROMPTS[style] ?? '';
  // The suffix enforces presentation quality and anchors the subject
  const suffix =
    ' The tattoo design must be completely standalone, finished artwork — full subject visible, not cropped, perfectly centered on a pure white background, presented as professional tattoo flash art. Do NOT deviate from the style rules above.';
  return prefix
    ? `${prefix}\n\nTattoo concept to render in this exact style: "${dallePrompt}"${suffix}`
    : `Tattoo flash art design — concept: "${dallePrompt}". Pure white background, professional flash sheet, complete standalone design.`;
};

export const extractPlacement = (text: string): string => {
  const lower = (text || '').toLowerCase();
  if (lower.includes('back') && !lower.includes('set back') && !lower.includes('setback')) return 'back';
  if (lower.includes('chest') || lower.includes('sternum') || lower.includes('pec')) return 'chest';
  if (lower.includes('shoulder') || lower.includes('deltoid')) return 'shoulder';
  if (lower.includes('rib') || lower.includes('side body') || lower.includes('flank')) return 'ribs';
  if (lower.includes('thigh') || lower.includes('upper leg') || lower.includes('quad')) return 'thigh';
  if (lower.includes('calf') || lower.includes('lower leg')) return 'calf';
  if (lower.includes('forearm') || lower.includes('fore arm') || lower.includes('lower arm')) return 'forearm';
  if (lower.includes('wrist')) return 'wrist';
  if (lower.includes('ankle')) return 'ankle';
  if (lower.includes('foot') || lower.includes('feet') || lower.includes('heel')) return 'foot';
  if (lower.includes('neck') || lower.includes('throat') || lower.includes('nape')) return 'neck';
  if (lower.includes('finger') || lower.includes('knuckle')) return 'finger';
  if (lower.includes('hand') || lower.includes('palm')) return 'hand';
  if (lower.includes('arm')) return 'forearm';
  return text;
};

export const getPlacementBg = (placement: string) => {
  const p = placement.toLowerCase();
  if (p.includes('back')) return { color: '#c4a882', label: 'Back' };
  if (p.includes('chest')) return { color: '#d2a87c', label: 'Chest' };
  if (p.includes('shoulder')) return { color: '#ccab85', label: 'Shoulder' };
  if (p.includes('rib')) return { color: '#c9a06e', label: 'Ribs' };
  if (p.includes('thigh') || (p.includes('leg') && !p.includes('foreleg'))) return { color: '#caa880', label: 'Thigh' };
  if (p.includes('forearm') || p.includes('arm')) return { color: '#c8a882', label: 'Forearm' };
  if (p.includes('wrist')) return { color: '#c2a07a', label: 'Wrist' };
  if (p.includes('ankle') || p.includes('foot')) return { color: '#be9e6e', label: 'Ankle' };
  if (p.includes('neck')) return { color: '#d5ae8a', label: 'Neck' };
  if (p.includes('calf')) return { color: '#c6a47e', label: 'Calf' };
  if (p.includes('hand') || p.includes('finger')) return { color: '#c0a07a', label: 'Hand' };
  return { color: '#c8a882', label: placement };
};
