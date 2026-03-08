import { useEffect, useRef, useCallback } from 'react';
import * as THREE from 'three';
import { X, Save, RotateCcw, ZoomIn, ZoomOut, RotateCw } from 'lucide-react';
import { motion } from 'motion/react';
import { useApp } from '../context/AppContext';
import { SKIN_TONES, extractPlacement } from '../constants';

// ─── Smooth mannequin built entirely from CapsuleGeometry limbs ───────────────

function buildMannequin(skinHex: string): THREE.Group {
  const group = new THREE.Group();

  const base = new THREE.Color(0.88, 0.84, 0.79);
  base.lerp(new THREE.Color(skinHex), 0.22);

  const mat = new THREE.MeshStandardMaterial({
    color: base,
    roughness: 0.86,
    metalness: 0.03,
  });

  /** Add a CapsuleGeometry limb at (x,y,z) with optional rotation. */
  const cap = (
    r: number, len: number,
    x: number, y: number, z: number,
    rx = 0, ry = 0, rz = 0
  ) => {
    const m = new THREE.Mesh(new THREE.CapsuleGeometry(r, len, 14, 32), mat);
    m.position.set(x, y, z);
    m.rotation.set(rx, ry, rz);
    m.castShadow = true;
    m.receiveShadow = true;
    group.add(m);
  };

  /** Add a sphere joint. */
  const sph = (r: number, x: number, y: number, z: number) => {
    const m = new THREE.Mesh(new THREE.SphereGeometry(r, 32, 32), mat);
    m.position.set(x, y, z);
    m.castShadow = true;
    group.add(m);
  };

  // ── Head & neck ──────────────────────────────────────────────
  sph(0.215, 0, 2.55, 0);                       // head
  cap(0.1, 0.16, 0, 2.3, 0);                    // neck

  // ── Torso (two capsules for natural taper) ───────────────────
  cap(0.34, 0.5, 0, 1.82, 0);                   // upper torso / chest
  cap(0.29, 0.32, 0, 1.36, 0);                  // lower torso / abdomen

  // ── Hips ─────────────────────────────────────────────────────
  cap(0.27, 0.14, 0, 1.16, 0);                  // hip block
  cap(0.11, 0.04, -0.17, 1.08, 0, 0, 0, Math.PI / 2); // hip bridge L
  cap(0.11, 0.04,  0.17, 1.08, 0, 0, 0, Math.PI / 2); // hip bridge R

  // ── Shoulders ────────────────────────────────────────────────
  sph(0.125, -0.45, 2.1, 0);                    // L shoulder
  sph(0.125,  0.45, 2.1, 0);                    // R shoulder

  // ── Upper arms ───────────────────────────────────────────────
  cap(0.09, 0.34, -0.65, 2.1, 0, 0, 0,  Math.PI / 2); // L upper arm
  cap(0.09, 0.34,  0.65, 2.1, 0, 0, 0, -Math.PI / 2); // R upper arm

  // ── Elbows ───────────────────────────────────────────────────
  sph(0.09, -0.87, 2.1, 0);                     // L elbow
  sph(0.09,  0.87, 2.1, 0);                     // R elbow

  // ── Forearms ─────────────────────────────────────────────────
  cap(0.075, 0.3, -1.07, 2.1, 0, 0, 0,  Math.PI / 2); // L forearm
  cap(0.075, 0.3,  1.07, 2.1, 0, 0, 0, -Math.PI / 2); // R forearm

  // ── Wrists & hands ───────────────────────────────────────────
  sph(0.075, -1.27, 2.1, 0);                    // L wrist
  sph(0.075,  1.27, 2.1, 0);                    // R wrist
  sph(0.085, -1.42, 2.1, 0);                    // L hand
  sph(0.085,  1.42, 2.1, 0);                    // R hand

  // ── Thighs ───────────────────────────────────────────────────
  cap(0.125, 0.42, -0.17, 0.97, 0);             // L thigh
  cap(0.125, 0.42,  0.17, 0.97, 0);             // R thigh

  // ── Knees ────────────────────────────────────────────────────
  sph(0.10, -0.17, 0.70, 0);                    // L knee
  sph(0.10,  0.17, 0.70, 0);                    // R knee

  // ── Calves ───────────────────────────────────────────────────
  cap(0.09, 0.40, -0.17, 0.44, 0);              // L calf
  cap(0.09, 0.40,  0.17, 0.44, 0);              // R calf

  // ── Ankles & feet ────────────────────────────────────────────
  sph(0.075, -0.17, 0.18, 0);                   // L ankle
  sph(0.075,  0.17, 0.18, 0);                   // R ankle
  cap(0.055, 0.22, -0.17, 0.06, 0.07, Math.PI / 2, 0, 0); // L foot
  cap(0.055, 0.22,  0.17, 0.06, 0.07, Math.PI / 2, 0, 0); // R foot

  return group;
}

// ─── Canvas-based white background removal ────────────────────────────────────

async function buildTransparentTexture(dataUrl: string): Promise<THREE.Texture> {
  return new Promise((resolve) => {
    const img = new Image();
    img.onload = () => {
      const canvas = document.createElement('canvas');
      canvas.width = img.width;
      canvas.height = img.height;
      const ctx = canvas.getContext('2d')!;
      ctx.drawImage(img, 0, 0);
      const { data } = ctx.getImageData(0, 0, canvas.width, canvas.height);
      const out = ctx.getImageData(0, 0, canvas.width, canvas.height);
      for (let i = 0; i < data.length; i += 4) {
        // Perceptual whiteness: all three channels close to 255
        const whiteness = Math.min(data[i], data[i + 1], data[i + 2]) / 255;
        if (whiteness > 0.92) {
          out.data[i + 3] = 0;
        } else if (whiteness > 0.78) {
          out.data[i + 3] = Math.round(255 * (1 - (whiteness - 0.78) / 0.14));
        }
      }
      ctx.putImageData(out, 0, 0);
      const tex = new THREE.CanvasTexture(canvas);
      tex.colorSpace = THREE.SRGBColorSpace;
      resolve(tex);
    };
    img.src = dataUrl;
  });
}

// ─── Placement config ─────────────────────────────────────────────────────────

interface PlacementCfg {
  pos: [number, number, number];
  rot: [number, number, number];
  w: number; h: number;
}

const PLACEMENTS: Record<string, PlacementCfg> = {
  forearm:  { pos: [-1.07, 2.1,  0.08 ], rot: [0, 0,          0], w: 0.32, h: 0.20 },
  wrist:    { pos: [-1.27, 2.1,  0.077], rot: [0, 0,          0], w: 0.18, h: 0.13 },
  hand:     { pos: [-1.42, 2.1,  0.09 ], rot: [0, 0,          0], w: 0.17, h: 0.17 },
  finger:   { pos: [-1.42, 2.1,  0.09 ], rot: [0, 0,          0], w: 0.11, h: 0.11 },
  shoulder: { pos: [-0.45, 2.1,  0.13 ], rot: [0, 0,          0], w: 0.26, h: 0.26 },
  chest:    { pos: [ 0,    1.82, 0.36 ], rot: [0, 0,          0], w: 0.50, h: 0.50 },
  back:     { pos: [ 0,    1.82,-0.36 ], rot: [0, Math.PI,    0], w: 0.50, h: 0.56 },
  ribs:     { pos: [ 0.36, 1.7,  0.19 ], rot: [0, -0.72,      0], w: 0.26, h: 0.40 },
  thigh:    { pos: [-0.17, 0.97, 0.13 ], rot: [0, 0,          0], w: 0.26, h: 0.28 },
  calf:     { pos: [-0.17, 0.44, 0.095], rot: [0, 0,          0], w: 0.22, h: 0.26 },
  ankle:    { pos: [-0.17, 0.18, 0.078], rot: [0, 0,          0], w: 0.16, h: 0.11 },
  neck:     { pos: [ 0,    2.3,  0.11 ], rot: [0, 0,          0], w: 0.18, h: 0.14 },
  foot:     { pos: [-0.17, 0.05, 0.15 ], rot: [-Math.PI / 2, 0, 0], w: 0.16, h: 0.24 },
};

function cfg(placement: string): PlacementCfg {
  return PLACEMENTS[placement] ?? PLACEMENTS.forearm;
}

// ─── Component ────────────────────────────────────────────────────────────────

export default function TryOnModal() {
  const { generatedImage, showTryOn, setShowTryOn, questionnaire, result } = useApp();

  const containerRef = useRef<HTMLDivElement>(null);
  const rendererRef  = useRef<THREE.WebGLRenderer | null>(null);
  const sceneRef     = useRef<THREE.Scene | null>(null);
  const cameraRef    = useRef<THREE.PerspectiveCamera | null>(null);
  const mannequinRef = useRef<THREE.Group | null>(null);
  const tattooRef    = useRef<THREE.Mesh | null>(null);
  const frameIdRef   = useRef<number>(0);

  // Body rotation
  const isDragging  = useRef(false);
  const prevPt      = useRef({ x: 0, y: 0 });
  const rotY        = useRef(0);
  const rotX        = useRef(0.06);
  const cameraZ     = useRef(4.5);

  // Tattoo position (local to mannequin) and rotation
  const tattooOffX  = useRef(0);
  const tattooOffY  = useRef(0);
  const tattooRotZ  = useRef(0);

  const skinHex   = SKIN_TONES.find(t => t.value === questionnaire.skinColor)?.color ?? '#C68642';
  const placement = result
    ? (extractPlacement(result.user_profile_analysis.suggested_placement_logic) || 'forearm')
    : 'forearm';

  useEffect(() => {
    if (!showTryOn || !generatedImage || !containerRef.current) return;
    const container = containerRef.current;
    let ro: ResizeObserver | null = null;

    const init = async () => {
      const w = container.clientWidth  || window.innerWidth;
      const h = container.clientHeight || Math.round(window.innerHeight * 0.72);

      // Renderer
      const renderer = new THREE.WebGLRenderer({ antialias: true });
      renderer.setSize(w, h);
      renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
      renderer.outputColorSpace = THREE.SRGBColorSpace;
      renderer.shadowMap.enabled = true;
      renderer.shadowMap.type = THREE.PCFSoftShadowMap;
      container.appendChild(renderer.domElement);

      // Scene & fog
      const scene = new THREE.Scene();
      scene.background = new THREE.Color(0x0a0a0a);
      scene.fog = new THREE.Fog(0x0a0a0a, 9, 20);

      // Camera
      const camera = new THREE.PerspectiveCamera(42, w / h, 0.01, 50);
      camera.position.set(0, 1.45, cameraZ.current);
      camera.lookAt(0, 1.45, 0);

      // Lighting — soft three-point
      scene.add(new THREE.AmbientLight(0xffffff, 0.7));
      const key = new THREE.DirectionalLight(0xfff6ee, 1.3);
      key.position.set(2.5, 5, 4); key.castShadow = true;
      key.shadow.mapSize.set(1024, 1024);
      scene.add(key);
      const fill = new THREE.DirectionalLight(0xaabbff, 0.35);
      fill.position.set(-3, 2, -2); scene.add(fill);
      const rim = new THREE.DirectionalLight(0xffeedd, 0.18);
      rim.position.set(0, -1, -4); scene.add(rim);

      // Ground
      const ground = new THREE.Mesh(
        new THREE.PlaneGeometry(10, 10),
        new THREE.MeshStandardMaterial({ color: 0x111111, roughness: 1 })
      );
      ground.rotation.x = -Math.PI / 2; ground.receiveShadow = true;
      scene.add(ground);

      // Mannequin (body)
      const mannequin = buildMannequin(skinHex);
      mannequin.rotation.y = rotY.current;
      mannequin.rotation.x = rotX.current;
      scene.add(mannequin);
      mannequinRef.current = mannequin;

      // Tattoo — transparent texture, no white bg
      const pcfg = cfg(placement);
      const texture = await buildTransparentTexture(generatedImage);

      const mat = new THREE.MeshBasicMaterial({
        map: texture,
        transparent: true,
        alphaTest: 0.02,
        depthWrite: false,
        side: THREE.DoubleSide,
        // Push tattoo in front to avoid z-fighting
        polygonOffset: true,
        polygonOffsetFactor: -2,
        polygonOffsetUnits: -2,
      });

      const plane = new THREE.Mesh(new THREE.PlaneGeometry(pcfg.w, pcfg.h), mat);

      // Reset stored offsets when placement is fresh
      tattooOffX.current = 0; tattooOffY.current = 0; tattooRotZ.current = 0;

      plane.position.set(pcfg.pos[0], pcfg.pos[1], pcfg.pos[2]);
      plane.rotation.set(pcfg.rot[0], pcfg.rot[1], pcfg.rot[2]);
      plane.name = 'tattoo';

      // Attach tattoo to mannequin → it rotates exactly with the body in 360°
      mannequin.add(plane);
      tattooRef.current = plane;

      // Render loop
      const animate = () => {
        frameIdRef.current = requestAnimationFrame(animate);
        camera.position.z = cameraZ.current;
        camera.lookAt(0, 1.45, 0);
        renderer.render(scene, camera);
      };
      animate();

      rendererRef.current = renderer;
      sceneRef.current = scene;
      cameraRef.current = camera;

      ro = new ResizeObserver(() => {
        const nw = container.clientWidth  || window.innerWidth;
        const nh = container.clientHeight || Math.round(window.innerHeight * 0.72);
        renderer.setSize(nw, nh);
        camera.aspect = nw / nh;
        camera.updateProjectionMatrix();
      });
      ro.observe(container);
    };

    init();

    return () => {
      cancelAnimationFrame(frameIdRef.current);
      ro?.disconnect();
      const rend = rendererRef.current;
      if (rend) {
        rend.dispose();
        if (container.contains(rend.domElement)) container.removeChild(rend.domElement);
      }
      rendererRef.current = sceneRef.current = cameraRef.current = null;
      mannequinRef.current = tattooRef.current = null;
    };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [showTryOn, generatedImage, skinHex, placement]);

  // ── Drag to rotate body ───────────────────────────────────────────────────────
  const onPointerDown = useCallback((e: React.PointerEvent) => {
    isDragging.current = true;
    prevPt.current = { x: e.clientX, y: e.clientY };
    (e.target as HTMLElement).setPointerCapture(e.pointerId);
  }, []);

  const onPointerMove = useCallback((e: React.PointerEvent) => {
    if (!isDragging.current || !mannequinRef.current) return;
    const dx = e.clientX - prevPt.current.x;
    const dy = e.clientY - prevPt.current.y;
    prevPt.current = { x: e.clientX, y: e.clientY };
    rotY.current += dx * 0.012;
    rotX.current  = Math.max(-0.45, Math.min(0.45, rotX.current + dy * 0.008));
    mannequinRef.current.rotation.y = rotY.current;
    mannequinRef.current.rotation.x = rotX.current;
  }, []);

  const onPointerUp = useCallback(() => { isDragging.current = false; }, []);
  const onWheel = useCallback((e: React.WheelEvent) => {
    cameraZ.current = Math.max(2.2, Math.min(7.5, cameraZ.current + e.deltaY * 0.005));
  }, []);

  // ── Tattoo move / rotate controls ────────────────────────────────────────────
  const NUDGE = 0.025;
  const moveTattoo = useCallback((dx: number, dy: number) => {
    const p = tattooRef.current;
    if (!p) return;
    p.position.x += dx;
    p.position.y += dy;
  }, []);

  const rotateTattoo = useCallback((delta: number) => {
    const p = tattooRef.current;
    if (!p) return;
    p.rotation.z += delta;
  }, []);

  const handleZoomIn  = useCallback(() => { cameraZ.current = Math.max(2.2, cameraZ.current - 0.45); }, []);
  const handleZoomOut = useCallback(() => { cameraZ.current = Math.min(7.5, cameraZ.current + 0.45); }, []);

  const handleReset = useCallback(() => {
    rotY.current = 0; rotX.current = 0.06; cameraZ.current = 4.5;
    if (mannequinRef.current) {
      mannequinRef.current.rotation.y = 0;
      mannequinRef.current.rotation.x = 0.06;
    }
    const p = tattooRef.current;
    if (p) {
      const c = cfg(placement);
      p.position.set(c.pos[0], c.pos[1], c.pos[2]);
      p.rotation.set(c.rot[0], c.rot[1], c.rot[2]);
    }
  }, [placement]);

  const handleSave = useCallback(() => {
    const rend = rendererRef.current;
    const scene = sceneRef.current;
    const cam = cameraRef.current;
    if (!rend || !scene || !cam) return;
    rend.render(scene, cam);
    rend.domElement.toBlob(blob => {
      if (!blob) return;
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url; a.download = 'inksight-tryon.png'; a.click();
      URL.revokeObjectURL(url);
    }, 'image/png');
  }, []);

  if (!showTryOn || !generatedImage) return null;

  const label = (placement.charAt(0).toUpperCase() + placement.slice(1)).replace(/_/g, ' ');

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 bg-black flex flex-col"
    >
      {/* Header */}
      <div className="flex items-center justify-between px-5 py-3 border-b border-zinc-800/60 shrink-0">
        <div>
          <p className="text-white font-semibold text-sm">3D Try‑On</p>
          <p className="text-zinc-500 text-xs mt-0.5">
            Placement: <span className="text-zinc-300">{label}</span>
            <span className="ml-3 text-zinc-600">· Drag to rotate · Scroll to zoom</span>
          </p>
        </div>
        <button
          onClick={() => setShowTryOn(false)}
          className="w-9 h-9 bg-zinc-800 text-white rounded-full flex items-center justify-center hover:bg-zinc-700 transition-colors"
        >
          <X size={18} />
        </button>
      </div>

      {/* 3D Viewport */}
      <div
        ref={containerRef}
        className="flex-1 relative cursor-grab active:cursor-grabbing select-none overflow-hidden"
        onPointerDown={onPointerDown}
        onPointerMove={onPointerMove}
        onPointerUp={onPointerUp}
        onPointerLeave={onPointerUp}
        onWheel={onWheel}
      >
        <div className="absolute top-3 left-1/2 -translate-x-1/2 z-10 pointer-events-none">
          <div className="flex items-center gap-2 bg-black/50 backdrop-blur-sm px-3 py-1.5 rounded-full">
            <div className="w-1.5 h-1.5 rounded-full bg-white/60 animate-pulse" />
            <p className="text-white/60 text-xs font-medium">Drag to rotate 360°</p>
          </div>
        </div>
      </div>

      {/* Controls bar */}
      <div className="shrink-0 px-4 py-3 border-t border-zinc-800/60 bg-zinc-950">
        <div className="flex items-center gap-2 flex-wrap">

          {/* View controls */}
          <div className="flex gap-1.5">
            <button onClick={handleZoomOut} title="Zoom out"
              className="w-9 h-9 rounded-xl bg-zinc-800 text-zinc-300 flex items-center justify-center hover:bg-zinc-700 transition-colors">
              <ZoomOut size={15} />
            </button>
            <button onClick={handleZoomIn} title="Zoom in"
              className="w-9 h-9 rounded-xl bg-zinc-800 text-zinc-300 flex items-center justify-center hover:bg-zinc-700 transition-colors">
              <ZoomIn size={15} />
            </button>
            <button onClick={handleReset} title="Reset view"
              className="w-9 h-9 rounded-xl bg-zinc-800 text-zinc-300 flex items-center justify-center hover:bg-zinc-700 transition-colors">
              <RotateCcw size={14} />
            </button>
          </div>

          <div className="w-px h-6 bg-zinc-700 mx-1" />

          {/* Tattoo position label */}
          <span className="text-xs text-zinc-500 font-medium">Tattoo</span>

          {/* Move arrows */}
          <div className="flex gap-1">
            {([['◀', -NUDGE, 0], ['▶', NUDGE, 0], ['▲', 0, NUDGE], ['▼', 0, -NUDGE]] as const).map(([label, dx, dy]) => (
              <button key={label} onClick={() => moveTattoo(dx, dy)} title={`Move ${label}`}
                className="w-8 h-8 rounded-lg bg-zinc-800 text-zinc-300 text-sm font-bold flex items-center justify-center hover:bg-zinc-700 hover:text-white transition-colors">
                {label}
              </button>
            ))}
          </div>

          {/* Rotate */}
          <div className="flex gap-1">
            <button onClick={() => rotateTattoo(Math.PI / 12)} title="Rotate left"
              className="w-8 h-8 rounded-lg bg-zinc-800 text-zinc-300 flex items-center justify-center hover:bg-zinc-700 transition-colors">
              <RotateCcw size={13} />
            </button>
            <button onClick={() => rotateTattoo(-Math.PI / 12)} title="Rotate right"
              className="w-8 h-8 rounded-lg bg-zinc-800 text-zinc-300 flex items-center justify-center hover:bg-zinc-700 transition-colors">
              <RotateCw size={13} />
            </button>
          </div>

          <div className="flex-1" />

          <button onClick={handleSave}
            className="flex items-center gap-2 bg-zinc-800 text-zinc-100 rounded-xl px-4 py-2.5 text-sm font-medium hover:bg-zinc-700 transition-colors">
            <Save size={15} /> Save
          </button>
          <button onClick={() => setShowTryOn(false)}
            className="flex items-center gap-2 bg-transparent border border-zinc-700 text-zinc-300 rounded-xl px-4 py-2.5 text-sm font-medium hover:border-zinc-500 transition-colors">
            Done
          </button>
        </div>
      </div>
    </motion.div>
  );
}
