import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence, useMotionValue } from 'motion/react';
import {
  Upload, PenTool, Sparkles, AlertTriangle, Image as ImageIcon,
  ChevronRight, Droplet, ChevronLeft, X, Download, Plus, Maximize, Save
} from 'lucide-react';
import {
  generateTattooConsultation,
  generateTattooImage,
  TattooConsultation,
  QuestionnaireData
} from './services/geminiService';

const BODY_SHAPES = [
  { id: 'Ectomorph', name: 'Ectomorph', desc: 'Lean & Slender' },
  { id: 'Mesomorph', name: 'Mesomorph', desc: 'Athletic & Muscular' },
  { id: 'Endomorph', name: 'Endomorph', desc: 'Broad & Stocky' },
  { id: 'Hourglass', name: 'Hourglass', desc: 'Balanced top/bottom, defined waist' },
  { id: 'Pear', name: 'Pear', desc: 'Wider hips than shoulders' },
  { id: 'Apple', name: 'Apple', desc: 'Broader upper body & midsection' },
];

const SKIN_TONES = [
  { label: 'Very Light', value: 'Very Light', color: '#FDDBB4' },
  { label: 'Light', value: 'Light', color: '#E8B078' },
  { label: 'Medium', value: 'Medium', color: '#C68642' },
  { label: 'Dark', value: 'Dark', color: '#8D5524' },
  { label: 'Very Dark', value: 'Very Dark', color: '#3D1A0A' },
];

const mkSvg = (svg: string) => `data:image/svg+xml,${encodeURIComponent(svg)}`;

const TATTOO_STYLES = [
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
    imgSrc: mkSvg(`<svg viewBox="0 0 200 150" xmlns="http://www.w3.org/2000/svg"><defs><clipPath id="c1"><circle cx="100" cy="75" r="64"/></clipPath><clipPath id="c2"><circle cx="100" cy="75" r="46"/></clipPath><clipPath id="c3"><circle cx="100" cy="75" r="28"/></clipPath><pattern id="dp" x="0" y="0" width="0" height="0"/></defs><rect width="200" height="150" fill="#f5f5f0"/><circle cx="100" cy="75" r="65" fill="#09090b"/><circle cx="100" cy="75" r="52" fill="#f5f5f0"/><circle cx="100" cy="75" r="42" fill="#09090b"/><circle cx="100" cy="75" r="30" fill="#f5f5f0"/><circle cx="100" cy="75" r="20" fill="#09090b"/><circle cx="100" cy="75" r="10" fill="#f5f5f0"/><circle cx="100" cy="75" r="4" fill="#09090b"/><polygon points="100,11 104,68 100,75 96,68" fill="#09090b"/><polygon points="100,139 96,82 100,75 104,82" fill="#09090b"/><polygon points="36,75 93,71 100,75 93,79" fill="#09090b"/><polygon points="164,75 107,79 100,75 107,71" fill="#09090b"/><polygon points="55,30 97,72 100,75 94,78" fill="#09090b"/><polygon points="145,120 103,78 100,75 106,72" fill="#09090b"/><polygon points="55,120 97,78 100,75 94,72" fill="#09090b"/><polygon points="145,30 103,72 100,75 106,78" fill="#09090b"/></svg>`),
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
    imgSrc: mkSvg(`<svg viewBox="0 0 200 150" xmlns="http://www.w3.org/2000/svg"><defs><pattern id="dp1" x="0" y="0" width="7" height="7" patternUnits="userSpaceOnUse"><circle cx="3.5" cy="3.5" r="0.9" fill="#1c1917"/></pattern><pattern id="dp2" x="0" y="0" width="5" height="5" patternUnits="userSpaceOnUse"><circle cx="2.5" cy="2.5" r="1.1" fill="#1c1917"/></pattern><pattern id="dp3" x="0" y="0" width="3.5" height="3.5" patternUnits="userSpaceOnUse"><circle cx="1.75" cy="1.75" r="1.1" fill="#1c1917"/></pattern><clipPath id="r1"><circle cx="100" cy="75" r="64"/></clipPath><clipPath id="r2"><circle cx="100" cy="75" r="46"/></clipPath><clipPath id="r3"><circle cx="100" cy="75" r="28"/></clipPath><clipPath id="r4"><circle cx="100" cy="75" r="12"/></clipPath></defs><rect width="200" height="150" fill="#fafaf9"/><rect x="30" y="8" width="140" height="140" fill="url(#dp1)" clip-path="url(#r1)"/><circle cx="100" cy="75" r="46" fill="#fafaf9"/><rect x="48" y="25" width="104" height="104" fill="url(#dp2)" clip-path="url(#r2)"/><circle cx="100" cy="75" r="28" fill="#fafaf9"/><rect x="68" y="45" width="64" height="64" fill="url(#dp3)" clip-path="url(#r3)"/><circle cx="100" cy="75" r="12" fill="#fafaf9"/><rect x="86" y="61" width="28" height="28" fill="url(#dp3)" clip-path="url(#r4)"/><circle cx="100" cy="75" r="3" fill="#1c1917"/><line x1="100" y1="11" x2="100" y2="139" stroke="#1c1917" stroke-width="0.5" opacity="0.25"/><line x1="36" y1="75" x2="164" y2="75" stroke="#1c1917" stroke-width="0.5" opacity="0.25"/><line x1="55" y1="30" x2="145" y2="120" stroke="#1c1917" stroke-width="0.5" opacity="0.25"/><line x1="145" y1="30" x2="55" y2="120" stroke="#1c1917" stroke-width="0.5" opacity="0.25"/></svg>`),
  },
  {
    id: 'Trash Polka',
    name: 'Trash Polka',
    desc: 'Collage style, black and red, chaotic.',
    imgSrc: mkSvg(`<svg viewBox="0 0 200 150" xmlns="http://www.w3.org/2000/svg"><rect width="200" height="150" fill="#f5f5f0"/><ellipse cx="80" cy="60" rx="45" ry="30" fill="#09090b" opacity="0.85" transform="rotate(-15,80,60)"/><rect x="30" y="90" width="80" height="40" fill="#09090b" opacity="0.7" transform="rotate(5,70,110)"/><ellipse cx="140" cy="100" rx="35" ry="45" fill="#09090b" opacity="0.75" transform="rotate(20,140,100)"/><ellipse cx="120" cy="35" rx="40" ry="20" fill="#dc2626" opacity="0.9" transform="rotate(-25,120,35)"/><ellipse cx="160" cy="70" rx="20" ry="35" fill="#dc2626" opacity="0.8" transform="rotate(10,160,70)"/><circle cx="60" cy="130" r="22" fill="#dc2626" opacity="0.75"/><circle cx="172" cy="28" r="6" fill="#dc2626" opacity="0.85"/><circle cx="182" cy="48" r="4" fill="#dc2626" opacity="0.7"/><circle cx="157" cy="20" r="3" fill="#dc2626" opacity="0.8"/><line x1="10" y1="10" x2="190" y2="140" stroke="#09090b" stroke-width="8" opacity="0.12"/><line x1="10" y1="140" x2="190" y2="10" stroke="#dc2626" stroke-width="3" opacity="0.18"/><text x="100" y="80" font-size="26" fill="#f5f5f0" text-anchor="middle" font-family="sans-serif" font-weight="900" opacity="0.88" transform="rotate(-8,100,80)">CHAOS</text></svg>`),
  },
  {
    id: 'Ignorant Style',
    name: 'Ignorant Style',
    desc: 'Intentional amateurism, simple line drawings.',
    imgSrc: mkSvg(`<svg viewBox="0 0 200 150" xmlns="http://www.w3.org/2000/svg"><rect width="200" height="150" fill="#fafaf9"/><path d="M65,45 Q63,22 75,20 L80,38" fill="none" stroke="#09090b" stroke-width="4" stroke-linecap="round"/><path d="M135,45 Q137,22 125,20 L120,38" fill="none" stroke="#09090b" stroke-width="4" stroke-linecap="round"/><path d="M65,45 Q64,85 68,100 Q80,115 100,116 Q120,115 132,100 Q136,85 135,45 Q115,38 100,40 Q85,38 65,45Z" fill="none" stroke="#09090b" stroke-width="4.5" stroke-linejoin="round"/><circle cx="83" cy="68" r="9" fill="none" stroke="#09090b" stroke-width="3.5"/><circle cx="87" cy="70" r="5" fill="#09090b"/><circle cx="118" cy="66" r="9" fill="none" stroke="#09090b" stroke-width="3.5"/><circle cx="120" cy="69" r="5" fill="#09090b"/><path d="M97,82 L100,88 L103,82" fill="none" stroke="#09090b" stroke-width="3" stroke-linejoin="round"/><path d="M86,96 Q100,108 114,96" fill="none" stroke="#09090b" stroke-width="3.5" stroke-linecap="round"/><line x1="40" y1="78" x2="72" y2="82" stroke="#09090b" stroke-width="2.5" stroke-linecap="round"/><line x1="38" y1="88" x2="72" y2="88" stroke="#09090b" stroke-width="2.5" stroke-linecap="round"/><line x1="128" y1="82" x2="162" y2="78" stroke="#09090b" stroke-width="2.5" stroke-linecap="round"/><line x1="128" y1="88" x2="163" y2="90" stroke="#09090b" stroke-width="2.5" stroke-linecap="round"/><text x="100" y="136" font-size="10" fill="#09090b" text-anchor="middle" font-family="sans-serif">hand poked</text></svg>`),
  },
  {
    id: 'Patchwork',
    name: 'Patchwork',
    desc: 'Collection of small, unrelated tattoos.',
    imgSrc: mkSvg(`<svg viewBox="0 0 200 150" xmlns="http://www.w3.org/2000/svg"><rect width="200" height="150" fill="#09090b"/><line x1="100" y1="5" x2="100" y2="145" stroke="#27272a" stroke-width="1" stroke-dasharray="4,4"/><line x1="5" y1="75" x2="195" y2="75" stroke="#27272a" stroke-width="1" stroke-dasharray="4,4"/><polygon points="50,18 55,32 70,32 58,41 63,56 50,47 37,56 42,41 30,32 45,32" fill="#eab308" stroke="#000" stroke-width="2"/><path d="M145,18 Q135,8 125,18 Q115,28 145,48 Q175,28 165,18 Q155,8 145,18Z" fill="#dc2626" stroke="#000" stroke-width="2"/><rect x="22" y="88" width="42" height="42" rx="7" fill="#f5f5f0" stroke="#09090b" stroke-width="3"/><circle cx="33" cy="99" r="3.5" fill="#09090b"/><circle cx="53" cy="99" r="3.5" fill="#09090b"/><circle cx="43" cy="109" r="3.5" fill="#09090b"/><circle cx="33" cy="119" r="3.5" fill="#09090b"/><circle cx="53" cy="119" r="3.5" fill="#09090b"/><path d="M138,86 L156,86 L142,108 L162,108 L130,148 L144,118 L126,118Z" fill="#eab308" stroke="#09090b" stroke-width="2.5" stroke-linejoin="round"/></svg>`),
  },
];

// Hard style rules injected into every image generation prompt
const STYLE_IMAGE_PROMPTS: Record<string, string> = {
  'American Traditional': 'American Traditional old school tattoo flash art on pure white background. MANDATORY: bold thick black outlines, flat solid fill colors using ONLY red, black, gold/yellow, zero shading or gradients, no photorealism, classic poster flash style.',
  'Neo-Traditional': 'Neo-Traditional tattoo illustration on white background. MANDATORY: varying line weights (bold outer contour, fine internal details), jewel tone palette (deep purple, teal, magenta), ornamental filigree flourishes, white ink highlights, no photorealism.',
  'Japanese (Irezumi)': 'Japanese Irezumi traditional tattoo art on white background. MANDATORY: bold black outlines, flat vivid colors (red, black, gold), gakubori background elements (wind bars, waves, clouds), traditional Japanese iconography, no Western shading.',
  'Black & Grey Realism': 'Black and grey realism tattoo art on white background. MANDATORY: zero outlines, grey wash technique only, single consistent light source from upper left, photorealistic 3D volumetric shading, only black and grey ink, no color.',
  'Micro-Realism': 'Micro-realism single-needle tattoo design on white background. MANDATORY: extremely delicate ultra-thin lines (1RL needle weight), tiny miniature scale, hyper-detailed precision, no thick outlines, high contrast, delicate fine linework only.',
  'Color Realism': 'Color realism painterly tattoo art on white background. MANDATORY: no black outlines anywhere, painterly blending, solid vibrant saturated pigments, complementary color contrast defines shapes, impressionistic photorealistic style.',
  'Blackwork': 'Blackwork tattoo design on white background. MANDATORY: only pure solid black ink, no grey tones, no color, strong negative space contrast, bold geometric or tribal forms, solid black saturation.',
  'Cybersigilism': 'Cybersigilism tattoo design on white background. MANDATORY: only ultra-thin sharp black lines, no fills or solid areas, sharp aggressive organic-geometric shapes, long tapering stinger forms, alien sigil aesthetic, needle-thin lines only.',
  'Dotwork': 'Dotwork stippling tattoo on white background. MANDATORY: form created entirely from individual dots only, no solid lines or fills, dot density creates shading (dense=shadow, sparse=highlight), pointillist texture throughout, no smooth gradients.',
  'Trash Polka': 'Trash Polka tattoo collage on white background. MANDATORY: ONLY black and red colors, chaotic collage of realistic imagery mixed with abstract red paint splatters and bold graphic text elements, high contrast, aggressive composition.',
  'Ignorant Style': 'Ignorant style hand-poked tattoo on white background. MANDATORY: intentionally shaky imperfect lines, simple naive childlike drawing, flat 2D, wrong proportions, sharpie marker aesthetic, primitive look, no professional polish whatsoever.',
  'Patchwork': 'Patchwork tattoo flash collection on white background. MANDATORY: multiple small distinct traditional tattoo designs arranged together, each element surrounded by a white border outline, mix of classic flash motifs (hearts, stars, roses, daggers, animals), flash sheet layout.',
};

// Maps style IDs to their pre-generated PNG filename under public/style-previews/
const STYLE_SLUGS: Record<string, string> = {
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

/** Returns the public URL for a pre-generated style preview, or null if not available. */
const stylePreviewPublicUrl = (styleId: string): string | null => {
  const slug = STYLE_SLUGS[styleId];
  return slug ? `/style-previews/${slug}.png` : null;
};

const buildStylePrompt = (dallePrompt: string, style: string): string => {
  const prefix = STYLE_IMAGE_PROMPTS[style] ?? '';
  const suffix = ' Complete standalone tattoo design, full subject visible, not cropped, perfectly centered on pure white background, tattoo flash sheet presentation.';
  return prefix ? `${prefix} The tattoo design subject: ${dallePrompt}${suffix}` : `${dallePrompt}${suffix}`;
};

function BodyPartPreview({ placement, skinHex }: { placement: string; skinHex: string }) {
  const p = placement.toLowerCase();
  const bg = '#0f172a';

  // Cylindrical gradient stops (left shadow → center highlight → right shadow)
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
        <path d="M108,188 Q154,168 200,188" stroke="rgba(0,0,0,0.1)" strokeWidth="3" fill="none" />
        <path d="M200,188 Q246,168 292,188" stroke="rgba(0,0,0,0.1)" strokeWidth="3" fill="none" />
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
        <path d="M158,105 Q162,240 158,395" stroke="rgba(0,0,0,0.08)" strokeWidth="3" fill="none" />
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
        <path d="M112,80 Q116,200 113,320" stroke="rgba(100,130,210,0.14)" strokeWidth="1.5" fill="none" />
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
        <path d="M83,52 Q87,215 84,400" stroke="rgba(0,0,0,0.07)" strokeWidth="3" fill="none" />
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
        <path d="M78,182 Q150,175 222,182" stroke="rgba(0,0,0,0.09)" strokeWidth="2" fill="none" />
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
        <path d="M148,80 Q152,228 150,420" stroke="rgba(0,0,0,0.09)" strokeWidth="2.5" fill="none" />
      </svg>
    );
  }

  // Default: forearm (arm, inner forearm, outer forearm, etc.)
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
      <path d="M146,100 Q150,240 147,360" stroke="rgba(100,130,210,0.14)" strokeWidth="1.8" fill="none" />
      <path d="M155,120 Q158,240 156,340" stroke="rgba(100,130,210,0.1)" strokeWidth="1.2" fill="none" />
    </svg>
  );
}

export default function App() {
  const [prompt, setPrompt] = useState('');
  const [images, setImages] = useState<{ data: string; mimeType: string; url: string }[]>([]);
  const [questionnaire, setQuestionnaire] = useState<QuestionnaireData>({
    gender: '',
    weight: '5',
    bodyShape: '',
    skinColor: '',
    placement: '',
    colorPreference: '',
    size: '',
    style: '',
  });
  const [step, setStep] = useState<
    'initial' | 'questionnaire' | 'style_selection' | 'generating' | 'discovery' | 'results'
  >('initial');
  const [discoveryAnswers, setDiscoveryAnswers] = useState<Record<string, string>>({});
  const [result, setResult] = useState<TattooConsultation | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [generatedImage, setGeneratedImage] = useState<string | null>(null);
  const [customImagePrompt, setCustomImagePrompt] = useState<string>('');
  const [isGeneratingImage, setIsGeneratingImage] = useState(false);
  const [showTryOn, setShowTryOn] = useState(false);
  const [tattooScale, setTattooScale] = useState(1);
  // stylePreviewImages holds images from public/style-previews/ (generated via `npm run gen-previews`)
  // They are used as style references when generating the final tattoo — not shown in the UI cards.
  const [stylePreviewImages, setStylePreviewImages] = useState<Record<string, string>>({});

  // On mount: silently load pre-generated style reference images into state
  // so they're available as Gemini input references when the user generates a tattoo
  useEffect(() => {
    TATTOO_STYLES.forEach(style => {
      const url = stylePreviewPublicUrl(style.id);
      if (!url) return;
      fetch(url, { method: 'HEAD' })
        .then(r => {
          if (!r.ok) return;
          return fetch(url).then(r2 => r2.blob()).then(blob => new Promise<string>(resolve => {
            const reader = new FileReader();
            reader.onloadend = () => resolve(reader.result as string);
            reader.readAsDataURL(blob);
          }));
        })
        .then(dataUrl => {
          if (!dataUrl) return;
          setStylePreviewImages(prev => prev[style.id] ? prev : { ...prev, [style.id]: dataUrl });
        })
        .catch(() => { /* no pre-generated file — generation works fine without it */ });
    });
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const tattooX = useMotionValue(0);
  const tattooY = useMotionValue(0);

  // Scroll to top whenever the user moves to a new step
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, [step]);


  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []) as File[];
    if (files.length === 0) return;

    files.forEach((file) => {
      const reader = new FileReader();
      reader.onloadend = () => {
        const base64String = reader.result as string;
        const base64Data = base64String.split(',')[1];
        setImages((prev) => [
          ...prev,
          { data: base64Data, mimeType: file.type, url: URL.createObjectURL(file) },
        ]);
      };
      reader.readAsDataURL(file);
    });

    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const removeImage = (index: number) => {
    setImages((prev) => prev.filter((_, i) => i !== index));
  };

  const handleContinueToQuestionnaire = (e: React.FormEvent) => {
    e.preventDefault();
    if (!prompt.trim() && images.length === 0) return;
    setStep('questionnaire');
  };

  const handleContinueToStyle = (e: React.FormEvent) => {
    e.preventDefault();
    setStep('style_selection');
  };

  const handleSubmit = async (e?: React.FormEvent, isDiscoverySubmit = false) => {
    if (e) e.preventDefault();
    setStep('generating');
    setError(null);
    try {
      let finalPrompt = prompt;
      if (isDiscoverySubmit) {
        const answersText = Object.entries(discoveryAnswers)
          .map(([q, a]) => `Q: ${q}\nA: ${a}`)
          .join('\n');
        finalPrompt += `\n\nClarifications:\n${answersText}`;
      }

      const consultation = await generateTattooConsultation(
        finalPrompt,
        images.map((img) => ({ data: img.data, mimeType: img.mimeType })),
        questionnaire
      );

      if (consultation.discovery_required && !isDiscoverySubmit) {
        setResult(consultation);
        setStep('discovery');
      } else {
        setResult(consultation);
        setStep('results');
        // Auto-start image generation with style-enforced prompt
        setIsGeneratingImage(true);
        generateTattooImage(
          buildStylePrompt(consultation.image_generation.dalle_prompt, questionnaire.style),
          stylePreviewImages[questionnaire.style]
        ).then((img) => setGeneratedImage(img))
          .catch((err) => console.error('Auto image generation failed:', err))
          .finally(() => setIsGeneratingImage(false));
      }
    } catch (err: unknown) {
      console.error(err);
      const message = err instanceof Error ? err.message : 'Failed to generate consultation. Please try again.';
      setError(message);
      setStep(isDiscoverySubmit ? 'discovery' : 'style_selection');
    }
  };

  const handleDiscoveryAnswer = (question: string, answer: string) => {
    setDiscoveryAnswers((prev) => ({ ...prev, [question]: answer }));
  };

  const handleReset = () => {
    setPrompt('');
    setImages([]);
    setQuestionnaire({
      gender: '',
      weight: '5',
      bodyShape: '',
      skinColor: '',
      placement: '',
      colorPreference: '',
      size: '',
      style: '',
    });
    setStep('initial');
    setResult(null);
    setError(null);
    setGeneratedImage(null);
    setCustomImagePrompt('');
    setIsGeneratingImage(false);
    setDiscoveryAnswers({});
    setShowTryOn(false);
    setTattooScale(1);
    tattooX.set(0);
    tattooY.set(0);
  };

  // Extracts the best-matching body part keyword from free-form text
  const extractPlacement = (text: string): string => {
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
    if (lower.includes('arm')) return 'forearm'; // generic "arm" defaults to forearm
    return text;
  };

  const getPlacementBg = (placement: string) => {
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

  const handleGenerateImage = async () => {
    if (!result) return;
    setIsGeneratingImage(true);
    setError(null);
    try {
      const promptToUse = customImagePrompt.trim() || buildStylePrompt(result.image_generation.dalle_prompt, questionnaire.style);
      const imageBase64 = await generateTattooImage(promptToUse, stylePreviewImages[questionnaire.style]);
      setGeneratedImage(imageBase64);
    } catch (err: unknown) {
      console.error(err);
      const message = err instanceof Error ? err.message : 'Failed to generate image. Please try again.';
      setError(message);
    } finally {
      setIsGeneratingImage(false);
    }
  };

  return (
    <div className="min-h-screen bg-zinc-950 text-zinc-50 selection:bg-zinc-800 selection:text-zinc-50">
      <header className="border-b border-zinc-900 bg-zinc-950/50 backdrop-blur-md sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3 cursor-pointer" onClick={handleReset}>
            <div className="w-8 h-8 rounded-full bg-zinc-100 text-zinc-950 flex items-center justify-center">
              <PenTool size={18} className="stroke-[2.5]" />
            </div>
            <div>
              <h1 className="text-lg font-semibold tracking-tight leading-none">InkSight AI</h1>
              <p className="text-xs text-zinc-500 mt-1 uppercase tracking-widest">
                Art Director & Prompt Architect
              </p>
            </div>
          </div>
        </div>
      </header>

      <main className="px-6 py-12">
        <input
          type="file"
          ref={fileInputRef}
          onChange={handleImageUpload}
          accept="image/*"
          multiple
          className="hidden"
        />

        <AnimatePresence mode="wait">
          {/* ── STEP 1: UPLOAD ── */}
          {step === 'initial' && (
            <motion.div
              key="initial"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="max-w-2xl mx-auto mt-12"
            >
              <h2 className="text-4xl font-light tracking-tight mb-4 text-center">
                Begin Consultation
              </h2>
              <p className="text-zinc-400 text-center mb-12">
                Upload reference photos or describe your concept to start.
              </p>

              <div className="space-y-8">
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
                  {images.map((img, idx) => (
                    <div
                      key={idx}
                      className="relative aspect-square rounded-xl overflow-hidden bg-zinc-900 border border-zinc-800 group"
                    >
                      <img
                        src={img.url}
                        alt={`Upload ${idx + 1}`}
                        className="w-full h-full object-cover"
                      />
                      <button
                        onClick={() => removeImage(idx)}
                        className="absolute top-2 right-2 w-8 h-8 bg-black/60 text-white rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity hover:bg-red-500"
                      >
                        <X size={14} />
                      </button>
                    </div>
                  ))}
                  <div
                    onClick={() => fileInputRef.current?.click()}
                    className="aspect-square border-2 border-dashed border-zinc-800 rounded-xl flex flex-col items-center justify-center gap-2 cursor-pointer hover:bg-zinc-900/50 hover:border-zinc-700 transition-all group"
                  >
                    <div className="w-10 h-10 rounded-full bg-zinc-900 flex items-center justify-center text-zinc-500 group-hover:text-zinc-300 group-hover:scale-110 transition-all">
                      {images.length > 0 ? <Plus size={20} /> : <Upload size={20} />}
                    </div>
                    <p className="text-xs font-medium text-zinc-400">
                      {images.length > 0 ? 'Add Photo' : 'Upload Photos'}
                    </p>
                  </div>
                </div>

                <div className="relative flex items-center py-4">
                  <div className="flex-grow border-t border-zinc-900"></div>
                  <span className="flex-shrink-0 mx-4 text-xs uppercase tracking-widest text-zinc-600">
                    And / Or
                  </span>
                  <div className="flex-grow border-t border-zinc-900"></div>
                </div>

                <form onSubmit={handleContinueToQuestionnaire} className="space-y-4">
                  <textarea
                    value={prompt}
                    onChange={(e) => setPrompt(e.target.value)}
                    placeholder="Describe your story, emotions, or concept..."
                    className="w-full h-32 bg-zinc-900/50 border border-zinc-800 rounded-xl p-4 text-sm focus:outline-none focus:ring-1 focus:ring-zinc-500 focus:border-zinc-500 transition-all resize-none placeholder:text-zinc-600"
                  />
                  <button
                    type="submit"
                    disabled={!prompt.trim() && images.length === 0}
                    className="w-full bg-zinc-100 text-zinc-950 rounded-xl py-3.5 px-4 text-sm font-medium hover:bg-white disabled:opacity-50 disabled:cursor-not-allowed transition-all flex items-center justify-center gap-2"
                  >
                    Continue to Details <ChevronRight size={16} />
                  </button>
                </form>
              </div>
            </motion.div>
          )}

          {/* ── STEP 2: QUESTIONNAIRE ── */}
          {step === 'questionnaire' && (
            <motion.div
              key="questionnaire"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="max-w-3xl mx-auto mt-8"
            >
              <button
                onClick={() => setStep('initial')}
                className="text-sm text-zinc-400 hover:text-zinc-200 flex items-center gap-2 mb-8 transition-colors"
              >
                <ChevronLeft size={16} /> Back
              </button>

              <div className="mb-8">
                <h2 className="text-3xl font-light tracking-tight mb-2">
                  Technical Specifications
                </h2>
                <p className="text-sm text-zinc-400 leading-relaxed">
                  To give the absolute best technical foundation for editing and generating tattoos,
                  we need to move beyond "vibes". Please provide the mechanical constraints.
                </p>
              </div>

              <form onSubmit={handleContinueToStyle} className="space-y-8">
                <div className="grid sm:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-zinc-400 uppercase tracking-wider mb-3 block">
                      Gender
                    </label>
                    <select
                      required
                      value={questionnaire.gender}
                      onChange={(e) => setQuestionnaire({ ...questionnaire, gender: e.target.value })}
                      className="w-full bg-zinc-900/50 border border-zinc-800 rounded-xl p-4 text-base text-zinc-100 focus:outline-none focus:ring-1 focus:ring-zinc-500"
                    >
                      <option value="" disabled>
                        Select...
                      </option>
                      <option value="Male">Male</option>
                      <option value="Female">Female</option>
                      <option value="Other">Other / Prefer not to say</option>
                    </select>
                  </div>

                  <div className="space-y-2">
                    <label className="text-sm font-medium text-zinc-400 uppercase tracking-wider mb-3 flex justify-between">
                      <span>Body Weight Scale</span>
                      <span>{questionnaire.weight}/10</span>
                    </label>
                    <input
                      type="range"
                      min="1"
                      max="10"
                      value={questionnaire.weight}
                      onChange={(e) => setQuestionnaire({ ...questionnaire, weight: e.target.value })}
                      className="w-full accent-zinc-500 mt-4"
                    />
                    <div className="flex justify-between text-sm font-medium text-zinc-400 uppercase tracking-wider mt-2">
                      <span>Very Slim</span>
                      <span>Average</span>
                      <span>Heavy</span>
                    </div>
                  </div>

                  <div className="space-y-2 sm:col-span-2">
                    <label className="text-sm font-medium text-zinc-400 uppercase tracking-wider mb-3 block">
                      Body Shape
                    </label>
                    <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                      {BODY_SHAPES.map((shape) => (
                        <div
                          key={shape.id}
                          onClick={() => setQuestionnaire({ ...questionnaire, bodyShape: shape.id })}
                          className={`cursor-pointer p-4 rounded-xl border transition-all ${
                            questionnaire.bodyShape === shape.id
                              ? 'bg-zinc-800 border-zinc-500'
                              : 'bg-zinc-900/50 border-zinc-800 hover:border-zinc-700'
                          }`}
                        >
                          <p className="text-base text-zinc-100 mb-1">{shape.name}</p>
                          <p className="text-sm text-zinc-400">{shape.desc}</p>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="space-y-2">
                    <label className="text-sm font-medium text-zinc-400 uppercase tracking-wider mb-3 block">
                      Skin Color (Melanin)
                    </label>
                    <div className="flex gap-4 flex-wrap">
                      {SKIN_TONES.map((tone) => (
                        <button
                          key={tone.value}
                          type="button"
                          onClick={() => setQuestionnaire({ ...questionnaire, skinColor: tone.value })}
                          className="flex flex-col items-center gap-2 group"
                        >
                          <div
                            className={`w-11 h-11 rounded-full transition-all ${
                              questionnaire.skinColor === tone.value
                                ? 'ring-2 ring-offset-2 ring-offset-zinc-950 ring-zinc-300 scale-110'
                                : 'opacity-70 hover:opacity-100 hover:scale-105'
                            }`}
                            style={{ backgroundColor: tone.color }}
                          />
                          <span className={`text-xs transition-colors ${questionnaire.skinColor === tone.value ? 'text-zinc-200' : 'text-zinc-500'}`}>
                            {tone.label}
                          </span>
                        </button>
                      ))}
                    </div>
                  </div>

                  <div className="space-y-2">
                    <label className="text-sm font-medium text-zinc-400 uppercase tracking-wider mb-3 block">
                      Placement
                    </label>
                    <input
                      required
                      type="text"
                      placeholder="e.g., Inner Forearm, Upper Back, Ribs..."
                      value={questionnaire.placement}
                      onChange={(e) =>
                        setQuestionnaire({ ...questionnaire, placement: e.target.value })
                      }
                      className="w-full bg-zinc-900/50 border border-zinc-800 rounded-xl p-4 text-base text-zinc-100 focus:outline-none focus:ring-1 focus:ring-zinc-500 placeholder:text-zinc-600"
                    />
                  </div>

                  <div className="space-y-2">
                    <label className="text-sm font-medium text-zinc-400 uppercase tracking-wider mb-3 block">
                      Color Preference
                    </label>
                    <select
                      required
                      value={questionnaire.colorPreference}
                      onChange={(e) =>
                        setQuestionnaire({ ...questionnaire, colorPreference: e.target.value })
                      }
                      className="w-full bg-zinc-900/50 border border-zinc-800 rounded-xl p-4 text-base text-zinc-100 focus:outline-none focus:ring-1 focus:ring-zinc-500"
                    >
                      <option value="" disabled>
                        Select...
                      </option>
                      <option value="Black & Grey Only">Black & Grey Only</option>
                      <option value="Full Color">Full Color</option>
                      <option value="Black with Color Accents">Black with Color Accents</option>
                    </select>
                  </div>

                  <div className="space-y-2">
                    <label className="text-sm font-medium text-zinc-400 uppercase tracking-wider mb-3 block">
                      Size
                    </label>
                    <select
                      required
                      value={questionnaire.size}
                      onChange={(e) =>
                        setQuestionnaire({ ...questionnaire, size: e.target.value })
                      }
                      className="w-full bg-zinc-900/50 border border-zinc-800 rounded-xl p-4 text-base text-zinc-100 focus:outline-none focus:ring-1 focus:ring-zinc-500"
                    >
                      <option value="" disabled>
                        Select...
                      </option>
                      <option value="Micro (Under 2 inches)">Micro (Under 2 inches)</option>
                      <option value="Small (2-4 inches)">Small (2-4 inches)</option>
                      <option value="Medium (4-7 inches)">Medium (4-7 inches)</option>
                      <option value="Large (7-12 inches)">Large (7-12 inches)</option>
                      <option value="Extra Large (Full Sleeve/Back)">
                        Extra Large (Full Sleeve/Back)
                      </option>
                    </select>
                  </div>
                </div>

                <div className="pt-4 border-t border-zinc-900">
                  <button
                    type="submit"
                    disabled={!questionnaire.bodyShape || !questionnaire.skinColor}
                    className="w-full bg-zinc-100 text-zinc-950 rounded-xl py-4 px-4 text-base font-medium hover:bg-white disabled:opacity-50 disabled:cursor-not-allowed transition-all flex items-center justify-center gap-2"
                  >
                    Continue to Style Selection <ChevronRight size={16} />
                  </button>
                </div>

                {error && (
                  <div className="p-4 bg-red-950/30 border border-red-900/50 rounded-xl text-red-400 text-sm flex items-start gap-3">
                    <AlertTriangle size={16} className="shrink-0 mt-0.5" />
                    <p>{error}</p>
                  </div>
                )}
              </form>
            </motion.div>
          )}

          {/* ── STEP 3: STYLE SELECTION ── */}
          {step === 'style_selection' && (
            <motion.div
              key="style_selection"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="max-w-5xl mx-auto mt-8"
            >
              <button
                onClick={() => setStep('questionnaire')}
                className="text-sm text-zinc-400 hover:text-zinc-200 flex items-center gap-2 mb-8 transition-colors"
              >
                <ChevronLeft size={16} /> Back to Details
              </button>

              <div className="mb-8">
                <h2 className="text-3xl font-light tracking-tight mb-2">Select Tattoo Style</h2>
                <p className="text-sm text-zinc-400 leading-relaxed">
                  Choose the aesthetic direction for your tattoo. This helps us generate the correct
                  technical prompts.
                </p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
                {TATTOO_STYLES.map((style) => (
                  <div
                    key={style.id}
                    onClick={() => setQuestionnaire({ ...questionnaire, style: style.id })}
                    className={`cursor-pointer group relative rounded-2xl overflow-hidden border-2 transition-all ${
                      questionnaire.style === style.id
                        ? 'border-zinc-300 ring-2 ring-zinc-300/20'
                        : 'border-zinc-800 hover:border-zinc-600'
                    }`}
                  >
                    <div className="aspect-[4/3] relative overflow-hidden">
                      <img
                        src={style.imgSrc}
                        alt={style.name}
                        className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/20 to-transparent" />
                      <div className="absolute bottom-0 left-0 right-0 p-5">
                        <h3 className="text-base font-medium text-white mb-1">
                          {style.name}
                        </h3>
                        <p className="text-sm text-zinc-300 line-clamp-2">{style.desc}</p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              <div className="pt-4 border-t border-zinc-900 flex justify-end">
                <button
                  onClick={(e) => handleSubmit(e, false)}
                  disabled={!questionnaire.style}
                  className="w-full sm:w-auto bg-zinc-100 text-zinc-950 rounded-xl py-4 px-8 text-base font-medium hover:bg-white disabled:opacity-50 disabled:cursor-not-allowed transition-all flex items-center justify-center gap-2"
                >
                  <Sparkles size={16} />
                  Generate Technical Blueprint
                </button>
              </div>

              {error && (
                <div className="mt-4 p-4 bg-red-950/30 border border-red-900/50 rounded-xl text-red-400 text-sm flex items-start gap-3">
                  <AlertTriangle size={16} className="shrink-0 mt-0.5" />
                  <p>{error}</p>
                </div>
              )}
            </motion.div>
          )}

          {/* ── STEP 4: DISCOVERY LOOP ── */}
          {step === 'discovery' && result?.discovery_questions && (
            <motion.div
              key="discovery"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="max-w-3xl mx-auto mt-8"
            >
              <div className="mb-8">
                <div className="inline-flex items-center gap-2 px-3 py-1.5 bg-zinc-900 border border-zinc-800 rounded-lg mb-6">
                  <AlertTriangle size={14} className="text-yellow-500" />
                  <span className="text-sm font-medium text-zinc-400 uppercase tracking-wider">
                    Discovery Loop Triggered
                  </span>
                </div>
                <h2 className="text-3xl font-light tracking-tight mb-2">Clarify Your Concept</h2>
                <p className="text-base text-zinc-400 leading-relaxed">
                  Your prompt is a bit ambiguous. To give you the best technical blueprint, please
                  clarify the following:
                </p>
              </div>

              <div className="space-y-8">
                {result.discovery_questions.map((q, idx) => (
                  <div key={idx} className="bg-zinc-900/30 border border-zinc-800 rounded-2xl p-6">
                    <h3 className="text-sm font-medium text-zinc-400 uppercase tracking-wider mb-4">
                      {q.question}
                    </h3>
                    <div className="grid sm:grid-cols-2 gap-3">
                      {q.options.map((opt) => (
                        <button
                          key={opt}
                          onClick={() => handleDiscoveryAnswer(q.question, opt)}
                          className={`p-4 rounded-xl border text-left transition-all ${
                            discoveryAnswers[q.question] === opt
                              ? 'bg-zinc-800 border-zinc-500 text-zinc-100'
                              : 'bg-zinc-900/50 border-zinc-800 text-zinc-400 hover:border-zinc-700 hover:text-zinc-200'
                          }`}
                        >
                          <span className="text-base">{opt}</span>
                        </button>
                      ))}
                    </div>
                  </div>
                ))}

                <div className="pt-4 border-t border-zinc-900">
                  <button
                    onClick={(e) => handleSubmit(e, true)}
                    disabled={
                      Object.keys(discoveryAnswers).length !== result.discovery_questions.length
                    }
                    className="w-full bg-zinc-100 text-zinc-950 rounded-xl py-4 px-4 text-base font-medium hover:bg-white disabled:opacity-50 disabled:cursor-not-allowed transition-all flex items-center justify-center gap-2"
                  >
                    <Sparkles size={16} />
                    Finalize Blueprint
                  </button>
                </div>

                {error && (
                  <div className="p-4 bg-red-950/30 border border-red-900/50 rounded-xl text-red-400 text-sm flex items-start gap-3">
                    <AlertTriangle size={16} className="shrink-0 mt-0.5" />
                    <p>{error}</p>
                  </div>
                )}
              </div>
            </motion.div>
          )}

          {/* ── GENERATING LOADER ── */}
          {step === 'generating' && (
            <motion.div
              key="generating"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="max-w-md mx-auto mt-32 flex flex-col items-center justify-center text-zinc-500 space-y-8"
            >
              <div className="relative w-24 h-24">
                <div className="absolute inset-0 border-2 border-zinc-800 rounded-full" />
                <div className="absolute inset-0 border-2 border-zinc-400 rounded-full border-t-transparent animate-spin" />
                <div className="absolute inset-0 flex items-center justify-center">
                  <PenTool size={24} className="text-zinc-400 animate-pulse" />
                </div>
              </div>
              <div className="text-center space-y-3">
                <p className="text-base font-medium text-zinc-300">
                  Consulting Art Director...
                </p>
                <p className="text-sm font-medium text-zinc-500 uppercase tracking-wider">
                  Analyzing anatomy & longevity
                </p>
              </div>
            </motion.div>
          )}

          {/* ── STEP 5: RESULTS ── */}
          {step === 'results' && result && (
            <motion.div
              key="results"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="max-w-4xl mx-auto space-y-6"
            >
              <button
                onClick={handleReset}
                className="text-sm text-zinc-400 hover:text-zinc-200 flex items-center gap-2 transition-colors"
              >
                <ChevronLeft size={16} /> Start Over
              </button>

              {/* ── CONCEPT ART (top, most important) ── */}
              <div className="bg-zinc-900/30 border border-zinc-800 rounded-2xl p-6">
                <div className="flex items-center gap-3 pb-4 border-b border-zinc-800/50 mb-6">
                  <div className="w-8 h-8 rounded-full bg-zinc-800 flex items-center justify-center text-zinc-400">
                    <Sparkles size={16} />
                  </div>
                  <h3 className="text-sm font-medium text-zinc-400 uppercase tracking-wider">
                    Your Tattoo Concept
                  </h3>
                </div>

                <div className="flex flex-col items-center justify-center">
                  {!generatedImage && !isGeneratingImage && (
                    <div className="text-center space-y-3 py-8">
                      <p className="text-base text-zinc-300">
                        Ready to see your design?
                      </p>
                      <p className="text-sm text-zinc-500">
                        Generation takes about 20–40 seconds
                      </p>
                      <button
                        onClick={handleGenerateImage}
                        className="bg-zinc-100 text-zinc-950 rounded-xl py-3 px-6 text-sm font-medium hover:bg-white transition-all flex items-center gap-2 mx-auto mt-2"
                      >
                        <Sparkles size={16} />
                        Generate Concept Art
                      </button>
                    </div>
                  )}

                  {isGeneratingImage && (
                    <div className="py-12 flex flex-col items-center justify-center space-y-4">
                      <div className="relative w-14 h-14">
                        <div className="absolute inset-0 border-2 border-zinc-800 rounded-full" />
                        <div className="absolute inset-0 border-2 border-zinc-400 rounded-full border-t-transparent animate-spin" />
                        <div className="absolute inset-0 flex items-center justify-center">
                          <PenTool size={18} className="text-zinc-400 animate-pulse" />
                        </div>
                      </div>
                      <p className="text-sm text-zinc-300 font-medium">Generating your tattoo...</p>
                      <p className="text-xs text-zinc-500">This usually takes 20–40 seconds</p>
                    </div>
                  )}

                  {generatedImage && !isGeneratingImage && (
                    <div className="w-full max-w-sm mx-auto space-y-4">
                      <div className="relative aspect-square rounded-xl overflow-hidden border border-zinc-800 bg-zinc-950">
                        <img
                          src={generatedImage}
                          alt="Generated Tattoo Concept"
                          className="w-full h-full object-cover"
                        />
                      </div>
                      <div className="flex justify-center gap-6">
                        <a
                          href={generatedImage}
                          download="inksight-concept.png"
                          className="text-sm text-zinc-400 hover:text-zinc-200 flex items-center gap-2 transition-colors"
                        >
                          <Download size={16} /> Download
                        </a>
                        <button
                          onClick={() => { tattooX.set(0); tattooY.set(0); setTattooScale(1); setShowTryOn(true); }}
                          className="text-sm text-zinc-400 hover:text-zinc-200 flex items-center gap-2 transition-colors"
                        >
                          <Maximize size={16} /> Try on Body
                        </button>
                      </div>
                      <div className="flex gap-2 pt-2">
                        <input
                          type="text"
                          value={customImagePrompt}
                          onChange={(e) => setCustomImagePrompt(e.target.value)}
                          placeholder="Tweak the prompt to regenerate..."
                          className="flex-1 bg-zinc-900/50 border border-zinc-800 rounded-xl p-3 text-sm text-zinc-100 focus:outline-none focus:ring-1 focus:ring-zinc-500 placeholder:text-zinc-600"
                        />
                        <button
                          onClick={handleGenerateImage}
                          className="bg-zinc-800 text-zinc-100 rounded-xl px-4 py-3 text-sm font-medium hover:bg-zinc-700 transition-all flex items-center gap-2 shrink-0"
                        >
                          <Sparkles size={16} />
                          Redo
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              </div>

              {/* ── YOUR DESIGN ── */}
              <div className="bg-zinc-900/30 border border-zinc-800 rounded-2xl p-6 space-y-5">
                <h3 className="text-sm font-medium text-zinc-400 uppercase tracking-wider pb-3 border-b border-zinc-800/50">
                  Your Design
                </h3>

                {/* Style picker */}
                <div>
                  <p className="text-xs font-medium text-zinc-500 uppercase tracking-wider mb-2">Style — tap to change</p>
                  <div className="flex flex-wrap gap-2">
                    {TATTOO_STYLES.map((s) => (
                      <button
                        key={s.id}
                        onClick={() => {
                          setQuestionnaire(q => ({ ...q, style: s.id }));
                          setCustomImagePrompt('');
                          setIsGeneratingImage(true);
                          setGeneratedImage(null);
                          generateTattooImage(
                            buildStylePrompt(result.image_generation.dalle_prompt, s.id),
                            stylePreviewImages[s.id]
                          ).then(img => setGeneratedImage(img))
                            .catch(err => { console.error(err); setError('Image generation failed.'); })
                            .finally(() => setIsGeneratingImage(false));
                        }}
                        className={`px-3 py-1 text-xs rounded-full border transition-colors ${
                          questionnaire.style === s.id
                            ? 'bg-zinc-100 text-zinc-900 border-zinc-100'
                            : 'bg-zinc-900 text-zinc-300 border-zinc-700 hover:border-zinc-500 hover:text-zinc-100'
                        }`}
                      >
                        {s.name}
                      </button>
                    ))}
                  </div>
                </div>

                <div>
                  <p className="text-xs font-medium text-zinc-500 uppercase tracking-wider mb-1">Interpretation</p>
                  <p className="text-base font-medium text-zinc-100">
                    {result.user_profile_analysis.interpreted_style}
                  </p>
                </div>

                <div>
                  <p className="text-xs font-medium text-zinc-500 uppercase tracking-wider mb-2">Themes</p>
                  <div className="flex flex-wrap gap-2">
                    {result.user_profile_analysis.symbolic_metaphors.map((m, i) => (
                      <span
                        key={i}
                        className="px-2.5 py-1 bg-zinc-800 text-zinc-200 text-xs rounded-lg border border-zinc-700"
                      >
                        {m}
                      </span>
                    ))}
                  </div>
                </div>

                <div>
                  <p className="text-xs font-medium text-zinc-500 uppercase tracking-wider mb-1">Placement Tip</p>
                  <p className="text-sm text-zinc-300 leading-relaxed">
                    {result.user_profile_analysis.suggested_placement_logic}
                  </p>
                </div>

                <div className="grid grid-cols-2 gap-4 pt-1">
                  <div>
                    <p className="text-xs font-medium text-zinc-500 uppercase tracking-wider mb-1">Longevity</p>
                    <p className="text-sm text-zinc-300">{result.technical_brief.estimated_longevity}</p>
                  </div>
                  <div>
                    <p className="text-xs font-medium text-zinc-500 uppercase tracking-wider mb-1">Healing</p>
                    <div className="flex items-center gap-2 mt-1">
                      <div
                        className={`w-2 h-2 rounded-full shrink-0 ${
                          result.aftercare_preview.healing_difficulty.toLowerCase().includes('high')
                            ? 'bg-red-500'
                            : result.aftercare_preview.healing_difficulty.toLowerCase().includes('med')
                              ? 'bg-yellow-500'
                              : 'bg-emerald-500'
                        }`}
                      />
                      <span className="text-sm text-zinc-200 leading-tight">
                        {result.aftercare_preview.healing_difficulty}
                      </span>
                    </div>
                  </div>
                </div>

                <div>
                  <p className="text-xs font-medium text-zinc-500 uppercase tracking-wider mb-2">Color Palette</p>
                  <div className="flex gap-2 flex-wrap">
                    {result.technical_brief.artist_notes.color_palette_hex.map((hex, i) => (
                      <div
                        key={i}
                        className="w-7 h-7 rounded-full border-2 border-zinc-700 shadow-sm"
                        style={{ backgroundColor: hex }}
                        title={hex}
                      />
                    ))}
                  </div>
                </div>

                <div>
                  <p className="text-xs font-medium text-zinc-500 uppercase tracking-wider mb-1">Aftercare</p>
                  <p className="text-sm text-zinc-300 leading-relaxed">
                    {result.aftercare_preview.lifestyle_warning}
                  </p>
                </div>
              </div>

              {/* ── ARTIST BRIEF (compact) ── */}
              <div className="bg-zinc-900/30 border border-zinc-800 rounded-2xl p-5">
                <div className="flex items-center justify-between mb-3">
                  <p className="text-xs font-medium text-zinc-400 uppercase tracking-wider">
                    Prompt for Your Artist / AI Tool
                  </p>
                  <button
                    onClick={() => navigator.clipboard.writeText(result.image_generation.dalle_prompt)}
                    className="text-xs text-zinc-400 hover:text-zinc-200 transition-colors border border-zinc-700 hover:border-zinc-500 px-2.5 py-1 rounded-lg"
                  >
                    Copy
                  </button>
                </div>
                <p className="text-xs font-mono text-zinc-500 leading-relaxed line-clamp-3">
                  {result.image_generation.dalle_prompt}
                </p>
              </div>

              {/* ── SAVE DESIGN ── */}
              {generatedImage && (
                <div className="bg-zinc-900/50 border border-zinc-700 rounded-2xl p-5 flex flex-col items-center gap-3 text-center">
                  <p className="text-sm text-zinc-400">Happy with your design? Save it to your computer.</p>
                  <a
                    href={generatedImage}
                    download="inksight-tattoo-design.png"
                    className="w-full flex items-center justify-center gap-3 bg-zinc-100 text-zinc-950 rounded-xl py-3.5 px-6 text-base font-semibold hover:bg-white transition-all"
                  >
                    <Save size={20} /> Save Design to Computer
                  </a>
                </div>
              )}

              {error && (
                <div className="p-4 bg-red-950/30 border border-red-900/50 rounded-xl text-red-400 text-sm flex items-start gap-3">
                  <AlertTriangle size={16} className="shrink-0 mt-0.5" />
                  <p>{error}</p>
                </div>
              )}
            </motion.div>
          )}
        </AnimatePresence>

        {/* ── TRY-ON MODAL ── */}
        <AnimatePresence>
          {showTryOn && generatedImage && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 z-50 bg-black/95 flex flex-col items-center justify-center p-4 sm:p-6 gap-4"
            >
              {/* Header */}
              <div className="flex items-center justify-between w-full max-w-2xl">
                <div>
                  <p className="text-white font-medium">Try on Body</p>
                  {questionnaire.placement && (
                    <p className="text-zinc-400 text-sm mt-0.5">
                      Placement: <span className="text-zinc-200">{questionnaire.placement}</span>
                    </p>
                  )}
                </div>
                <button
                  onClick={() => setShowTryOn(false)}
                  className="w-10 h-10 bg-zinc-800 text-white rounded-full flex items-center justify-center hover:bg-zinc-700 transition-colors"
                >
                  <X size={20} />
                </button>
              </div>

              {(() => {
                const skinHex = SKIN_TONES.find(t => t.value === questionnaire.skinColor)?.color ?? '#C68642';
                const isLightSkin = ['Very Light', 'Light'].includes(questionnaire.skinColor);
                // Use the AI's suggested placement if the user's input doesn't map to a known body part
                const userExtracted = extractPlacement(questionnaire.placement || '');
                const aiExtracted = result ? extractPlacement(result.user_profile_analysis.suggested_placement_logic) : '';
                const knownParts = ['back', 'chest', 'shoulder', 'rib', 'thigh', 'calf', 'forearm', 'wrist', 'ankle', 'foot', 'neck', 'finger', 'hand', 'arm'];
                const effectivePlacement = knownParts.some(p => userExtracted.toLowerCase().includes(p))
                  ? userExtracted
                  : (aiExtracted || userExtracted || 'forearm');
                const placementLabel = getPlacementBg(effectivePlacement).label;
                return (
                  <div className="relative w-full max-w-2xl aspect-[3/4] sm:aspect-square rounded-[40px] sm:rounded-[60px] overflow-hidden shadow-inner border-4 border-zinc-800">
                    {/* Body part SVG fills entire container */}
                    <div className="absolute inset-0 try-on-body">
                      <BodyPartPreview placement={effectivePlacement} skinHex={skinHex} />
                    </div>

                    {/* Placement area badge */}
                    <div className="absolute top-4 left-4 z-20 flex items-center gap-2 bg-black/40 backdrop-blur-sm px-3 py-1.5 rounded-full">
                      <div className="w-1.5 h-1.5 rounded-full bg-white/80" />
                      <p className="text-white/80 text-xs font-medium uppercase tracking-wider">
                        {placementLabel} · Drag to position
                      </p>
                    </div>

                    {/* Draggable tattoo overlay */}
                    <div className="absolute inset-0 flex items-center justify-center">
                      <motion.img
                        drag
                        dragConstraints={{ left: -200, right: 200, top: -200, bottom: 200 }}
                        style={{
                          x: tattooX,
                          y: tattooY,
                          opacity: isLightSkin ? 0.92 : 0.78,
                          width: `${Math.round(192 * tattooScale)}px`,
                          height: `${Math.round(192 * tattooScale)}px`,
                        }}
                        src={generatedImage!}
                        className={`object-contain cursor-grab active:cursor-grabbing z-10 drop-shadow-2xl ${isLightSkin ? 'mix-blend-multiply' : ''}`}
                        alt="Tattoo Try On"
                      />
                    </div>
                  </div>
                );
              })()}

              {/* Scale control */}
              <div className="w-full max-w-2xl flex items-center gap-3">
                <button
                  onClick={() => setTattooScale(s => Math.max(0.3, +(s - 0.1).toFixed(1)))}
                  className="w-8 h-8 rounded-full bg-zinc-800 text-white text-lg flex items-center justify-center hover:bg-zinc-700 transition-colors shrink-0"
                >−</button>
                <input
                  type="range"
                  min="0.3"
                  max="2.5"
                  step="0.05"
                  value={tattooScale}
                  onChange={e => setTattooScale(parseFloat(e.target.value))}
                  className="flex-1 accent-zinc-400"
                />
                <button
                  onClick={() => setTattooScale(s => Math.min(2.5, +(s + 0.1).toFixed(1)))}
                  className="w-8 h-8 rounded-full bg-zinc-800 text-white text-lg flex items-center justify-center hover:bg-zinc-700 transition-colors shrink-0"
                >+</button>
                <span className="text-zinc-500 text-xs w-10 text-right">{Math.round(tattooScale * 100)}%</span>
              </div>

              <div className="w-full max-w-2xl flex gap-3">
                <button
                  onClick={() => {
                    if (!generatedImage) return;
                    // Capture body SVG + tattoo onto a canvas and save
                    const svgEl = document.querySelector('.try-on-body svg') as SVGElement | null;
                    const canvas = document.createElement('canvas');
                    const size = 600;
                    canvas.width = size;
                    canvas.height = size;
                    const ctx = canvas.getContext('2d')!;
                    ctx.fillStyle = '#0f172a';
                    ctx.fillRect(0, 0, size, size);

                    const drawTattoo = () => {
                      const tattooSize = Math.round(192 * tattooScale);
                      const cx = size / 2 + tattooX.get();
                      const cy = size / 2 + tattooY.get();
                      const img = new Image();
                      img.onload = () => {
                        ctx.globalAlpha = 0.85;
                        ctx.drawImage(img, cx - tattooSize / 2, cy - tattooSize / 2, tattooSize, tattooSize);
                        ctx.globalAlpha = 1;
                        canvas.toBlob(blob => {
                          if (!blob) return;
                          const url = URL.createObjectURL(blob);
                          const a = document.createElement('a');
                          a.href = url;
                          a.download = 'inksight-tryon.png';
                          a.click();
                          URL.revokeObjectURL(url);
                        }, 'image/png');
                      };
                      img.src = generatedImage!;
                    };

                    if (svgEl) {
                      const svgData = new XMLSerializer().serializeToString(svgEl);
                      const blob = new Blob([svgData], { type: 'image/svg+xml;charset=utf-8' });
                      const url = URL.createObjectURL(blob);
                      const bodyImg = new Image();
                      bodyImg.onload = () => {
                        ctx.drawImage(bodyImg, 0, 0, size, size);
                        URL.revokeObjectURL(url);
                        drawTattoo();
                      };
                      bodyImg.src = url;
                    } else {
                      drawTattoo();
                    }
                  }}
                  className="flex-1 flex items-center justify-center gap-2 bg-zinc-800 text-zinc-100 rounded-xl py-3 text-sm font-medium hover:bg-zinc-700 transition-colors"
                >
                  <Save size={16} /> Save Try-On
                </button>
                <button
                  onClick={() => setShowTryOn(false)}
                  className="flex-1 flex items-center justify-center gap-2 bg-zinc-900 border border-zinc-700 text-zinc-300 rounded-xl py-3 text-sm font-medium hover:border-zinc-500 transition-colors"
                >
                  Done
                </button>
              </div>

              <p className="text-zinc-600 text-xs text-center">
                Drag to position · Use slider to resize
              </p>
            </motion.div>
          )}
        </AnimatePresence>
      </main>
    </div>
  );
}
