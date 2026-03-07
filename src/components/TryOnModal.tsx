import { useEffect, useRef, useCallback } from 'react';
import * as THREE from 'three';
import { X, Save, RotateCcw, ZoomIn, ZoomOut } from 'lucide-react';
import { motion } from 'motion/react';
import { useApp } from '../context/AppContext';
import { SKIN_TONES, extractPlacement } from '../constants';

// ─── Mannequin builder ────────────────────────────────────────────────────────

function buildMannequin(skinHex: string): THREE.Group {
  const group = new THREE.Group();

  // Neutral mannequin color — slightly tinted with skin tone for warmth
  const skinColor = new THREE.Color(skinHex);
  const baseColor = new THREE.Color(0.86, 0.83, 0.80);
  baseColor.lerp(skinColor, 0.18);

  const mat = new THREE.MeshStandardMaterial({
    color: baseColor,
    roughness: 0.88,
    metalness: 0.04,
  });

  const add = (
    geo: THREE.BufferGeometry,
    x: number, y: number, z: number,
    rx = 0, ry = 0, rz = 0
  ): THREE.Mesh => {
    const m = new THREE.Mesh(geo, mat);
    m.position.set(x, y, z);
    m.rotation.set(rx, ry, rz);
    m.castShadow = true;
    m.receiveShadow = true;
    group.add(m);
    return m;
  };

  // Head (smooth, featureless sphere)
  add(new THREE.SphereGeometry(0.22, 36, 36), 0, 2.55, 0);
  // Neck
  add(new THREE.CylinderGeometry(0.1, 0.12, 0.18, 20), 0, 2.27, 0);

  // Torso (chest + abdomen, slight taper)
  add(new THREE.CylinderGeometry(0.37, 0.3, 0.85, 24), 0, 1.75, 0);
  // Hips / pelvis
  add(new THREE.CylinderGeometry(0.3, 0.28, 0.2, 20), 0, 1.28, 0);

  // Shoulder joints
  add(new THREE.SphereGeometry(0.115, 20, 20), -0.43, 2.1, 0); // L
  add(new THREE.SphereGeometry(0.115, 20, 20),  0.43, 2.1, 0); // R

  // Upper arms (T-pose — horizontal, rotated 90° on Z)
  add(new THREE.CylinderGeometry(0.095, 0.085, 0.44, 16), -0.645, 2.1, 0, 0, 0,  Math.PI / 2);
  add(new THREE.CylinderGeometry(0.095, 0.085, 0.44, 16),  0.645, 2.1, 0, 0, 0, -Math.PI / 2);

  // Elbow joints
  add(new THREE.SphereGeometry(0.08, 16, 16), -0.88, 2.1, 0);
  add(new THREE.SphereGeometry(0.08, 16, 16),  0.88, 2.1, 0);

  // Forearms (horizontal)
  add(new THREE.CylinderGeometry(0.078, 0.068, 0.4, 16), -1.1, 2.1, 0, 0, 0,  Math.PI / 2);
  add(new THREE.CylinderGeometry(0.078, 0.068, 0.4, 16),  1.1, 2.1, 0, 0, 0, -Math.PI / 2);

  // Wrist joints
  add(new THREE.SphereGeometry(0.07, 14, 14), -1.32, 2.1, 0);
  add(new THREE.SphereGeometry(0.07, 14, 14),  1.32, 2.1, 0);

  // Hands
  add(new THREE.SphereGeometry(0.085, 14, 14), -1.45, 2.1, 0);
  add(new THREE.SphereGeometry(0.085, 14, 14),  1.45, 2.1, 0);

  // Thighs
  add(new THREE.CylinderGeometry(0.13, 0.11, 0.52, 20), -0.17, 0.99, 0);
  add(new THREE.CylinderGeometry(0.13, 0.11, 0.52, 20),  0.17, 0.99, 0);

  // Knee joints
  add(new THREE.SphereGeometry(0.095, 16, 16), -0.17, 0.71, 0);
  add(new THREE.SphereGeometry(0.095, 16, 16),  0.17, 0.71, 0);

  // Calves
  add(new THREE.CylinderGeometry(0.095, 0.08, 0.5, 20), -0.17, 0.43, 0);
  add(new THREE.CylinderGeometry(0.095, 0.08, 0.5, 20),  0.17, 0.43, 0);

  // Ankle joints
  add(new THREE.SphereGeometry(0.075, 14, 14), -0.17, 0.16, 0);
  add(new THREE.SphereGeometry(0.075, 14, 14),  0.17, 0.16, 0);

  // Feet (simple box)
  const footGeo = new THREE.BoxGeometry(0.14, 0.09, 0.28);
  add(footGeo, -0.17, 0.05, 0.08);
  add(footGeo,  0.17, 0.05, 0.08);

  return group;
}

// ─── Tattoo placement configs ─────────────────────────────────────────────────

interface PlacementCfg {
  pos: [number, number, number];
  rot: [number, number, number]; // euler XYZ
  w: number;
  h: number;
}

const PLACEMENT_CFGS: Record<string, PlacementCfg> = {
  forearm:  { pos: [-1.1,  2.1,  0.082], rot: [0,  0,          0], w: 0.34, h: 0.22 },
  wrist:    { pos: [-1.32, 2.1,  0.074], rot: [0,  0,          0], w: 0.20, h: 0.14 },
  hand:     { pos: [-1.45, 2.1,  0.09 ], rot: [0,  0,          0], w: 0.18, h: 0.18 },
  finger:   { pos: [-1.45, 2.1,  0.09 ], rot: [0,  0,          0], w: 0.12, h: 0.12 },
  shoulder: { pos: [-0.43, 2.1,  0.12 ], rot: [0,  0,          0], w: 0.28, h: 0.28 },
  chest:    { pos: [ 0,    1.75, 0.38 ], rot: [0,  0,          0], w: 0.52, h: 0.52 },
  back:     { pos: [ 0,    1.75,-0.38 ], rot: [0,  Math.PI,    0], w: 0.52, h: 0.58 },
  ribs:     { pos: [ 0.38, 1.6,  0.2  ], rot: [0, -0.75,       0], w: 0.28, h: 0.42 },
  thigh:    { pos: [-0.17, 0.99, 0.134], rot: [0,  0,          0], w: 0.28, h: 0.30 },
  calf:     { pos: [-0.17, 0.43, 0.098], rot: [0,  0,          0], w: 0.24, h: 0.28 },
  ankle:    { pos: [-0.17, 0.16, 0.079], rot: [0,  0,          0], w: 0.18, h: 0.12 },
  neck:     { pos: [ 0,    2.27, 0.112], rot: [0,  0,          0], w: 0.20, h: 0.16 },
  foot:     { pos: [-0.17, 0.05, 0.15 ], rot: [-Math.PI / 2, 0, 0], w: 0.18, h: 0.26 },
};

function getTattooCfg(placement: string): PlacementCfg {
  return PLACEMENT_CFGS[placement] ?? PLACEMENT_CFGS.forearm;
}

// ─── Component ────────────────────────────────────────────────────────────────

export default function TryOnModal() {
  const { generatedImage, showTryOn, setShowTryOn, questionnaire, result } = useApp();

  const containerRef = useRef<HTMLDivElement>(null);
  const rendererRef  = useRef<THREE.WebGLRenderer | null>(null);
  const sceneRef     = useRef<THREE.Scene | null>(null);
  const cameraRef    = useRef<THREE.PerspectiveCamera | null>(null);
  const mannequinRef = useRef<THREE.Group | null>(null);
  const frameIdRef   = useRef<number>(0);

  // Interaction state (refs so animation loop sees latest values without re-renders)
  const isDragging   = useRef(false);
  const prevPointer  = useRef({ x: 0, y: 0 });
  const rotY         = useRef(0);
  const rotX         = useRef(0.08);
  const cameraZ      = useRef(4.5);

  const skinHex   = SKIN_TONES.find(t => t.value === questionnaire.skinColor)?.color ?? '#C68642';
  const placement = result
    ? (extractPlacement(result.user_profile_analysis.suggested_placement_logic) || 'forearm')
    : 'forearm';

  // Build scene
  useEffect(() => {
    if (!showTryOn || !generatedImage || !containerRef.current) return;

    const container = containerRef.current;
    const w = container.clientWidth;
    const h = container.clientHeight;

    // Renderer
    const renderer = new THREE.WebGLRenderer({ antialias: true });
    renderer.setSize(w, h);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.outputColorSpace = THREE.SRGBColorSpace;
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    container.appendChild(renderer.domElement);

    // Scene
    const scene = new THREE.Scene();
    scene.background = new THREE.Color(0x0a0a0a);
    scene.fog = new THREE.Fog(0x0a0a0a, 8, 20);

    // Camera
    const camera = new THREE.PerspectiveCamera(42, w / h, 0.01, 50);
    camera.position.set(0, 1.4, cameraZ.current);
    camera.lookAt(0, 1.4, 0);

    // Lighting
    const ambient = new THREE.AmbientLight(0xffffff, 0.65);
    scene.add(ambient);

    const keyLight = new THREE.DirectionalLight(0xffffff, 1.4);
    keyLight.position.set(3, 5, 4);
    keyLight.castShadow = true;
    keyLight.shadow.mapSize.set(1024, 1024);
    scene.add(keyLight);

    const fillLight = new THREE.DirectionalLight(0x9ab4ff, 0.35);
    fillLight.position.set(-3, 2, -3);
    scene.add(fillLight);

    const rimLight = new THREE.DirectionalLight(0xffeedd, 0.2);
    rimLight.position.set(0, -1, -4);
    scene.add(rimLight);

    // Ground (receives shadow only)
    const groundGeo = new THREE.PlaneGeometry(10, 10);
    const groundMat = new THREE.MeshStandardMaterial({ color: 0x111111, roughness: 1 });
    const ground = new THREE.Mesh(groundGeo, groundMat);
    ground.rotation.x = -Math.PI / 2;
    ground.receiveShadow = true;
    scene.add(ground);

    // Mannequin
    const mannequin = buildMannequin(skinHex);
    mannequin.rotation.y = rotY.current;
    mannequin.rotation.x = rotX.current;
    scene.add(mannequin);
    mannequinRef.current = mannequin;

    // Tattoo overlay
    const cfg = getTattooCfg(placement);
    const loader = new THREE.TextureLoader();
    loader.load(generatedImage, (texture) => {
      texture.colorSpace = THREE.SRGBColorSpace;
      const geo = new THREE.PlaneGeometry(cfg.w, cfg.h);
      const mat = new THREE.MeshBasicMaterial({
        map: texture,
        transparent: true,
        blending: THREE.MultiplyBlending,
        depthWrite: false,
        side: THREE.DoubleSide,
      });
      const plane = new THREE.Mesh(geo, mat);
      plane.position.set(...cfg.pos);
      plane.rotation.set(...cfg.rot);
      plane.name = 'tattoo';
      mannequin.add(plane);
    });

    // Animation loop
    const animate = () => {
      frameIdRef.current = requestAnimationFrame(animate);
      camera.position.z = cameraZ.current;
      camera.lookAt(0, 1.4, 0);
      renderer.render(scene, camera);
    };
    animate();

    rendererRef.current = renderer;
    sceneRef.current = scene;
    cameraRef.current = camera;

    // Resize observer
    const ro = new ResizeObserver(() => {
      const nw = container.clientWidth;
      const nh = container.clientHeight;
      renderer.setSize(nw, nh);
      camera.aspect = nw / nh;
      camera.updateProjectionMatrix();
    });
    ro.observe(container);

    return () => {
      cancelAnimationFrame(frameIdRef.current);
      ro.disconnect();
      renderer.dispose();
      if (container.contains(renderer.domElement)) {
        container.removeChild(renderer.domElement);
      }
      rendererRef.current = null;
      sceneRef.current = null;
      cameraRef.current = null;
      mannequinRef.current = null;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [showTryOn, generatedImage, skinHex, placement]);

  // ── Pointer / mouse interaction ──────────────────────────────────────────────

  const onPointerDown = useCallback((e: React.PointerEvent) => {
    isDragging.current = true;
    prevPointer.current = { x: e.clientX, y: e.clientY };
    (e.target as HTMLElement).setPointerCapture(e.pointerId);
  }, []);

  const onPointerMove = useCallback((e: React.PointerEvent) => {
    if (!isDragging.current || !mannequinRef.current) return;
    const dx = e.clientX - prevPointer.current.x;
    const dy = e.clientY - prevPointer.current.y;
    prevPointer.current = { x: e.clientX, y: e.clientY };

    rotY.current += dx * 0.012;
    rotX.current = Math.max(-0.5, Math.min(0.5, rotX.current + dy * 0.008));

    mannequinRef.current.rotation.y = rotY.current;
    mannequinRef.current.rotation.x = rotX.current;
  }, []);

  const onPointerUp = useCallback(() => {
    isDragging.current = false;
  }, []);

  const onWheel = useCallback((e: React.WheelEvent) => {
    cameraZ.current = Math.max(2.2, Math.min(7.5, cameraZ.current + e.deltaY * 0.005));
  }, []);

  const handleZoomIn = useCallback(() => {
    cameraZ.current = Math.max(2.2, cameraZ.current - 0.4);
  }, []);

  const handleZoomOut = useCallback(() => {
    cameraZ.current = Math.min(7.5, cameraZ.current + 0.4);
  }, []);

  const handleReset = useCallback(() => {
    rotY.current = 0;
    rotX.current = 0.08;
    cameraZ.current = 4.5;
    if (mannequinRef.current) {
      mannequinRef.current.rotation.y = 0;
      mannequinRef.current.rotation.x = 0.08;
    }
  }, []);

  const handleSave = useCallback(() => {
    const renderer = rendererRef.current;
    const scene = sceneRef.current;
    const camera = cameraRef.current;
    if (!renderer || !scene || !camera) return;
    renderer.render(scene, camera);
    renderer.domElement.toBlob(blob => {
      if (!blob) return;
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = 'inksight-tryon-3d.png';
      a.click();
      URL.revokeObjectURL(url);
    }, 'image/png');
  }, []);

  // Hooks must all be above any early return
  if (!showTryOn || !generatedImage) return null;

  const placementLabel = (placement.charAt(0).toUpperCase() + placement.slice(1)).replace(/_/g, ' ');

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
            Placement: <span className="text-zinc-300">{placementLabel}</span>
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
        className="flex-1 relative cursor-grab active:cursor-grabbing select-none"
        onPointerDown={onPointerDown}
        onPointerMove={onPointerMove}
        onPointerUp={onPointerUp}
        onPointerLeave={onPointerUp}
        onWheel={onWheel}
      >
        {/* Hint overlay */}
        <div className="absolute top-3 left-1/2 -translate-x-1/2 z-10 pointer-events-none">
          <div className="flex items-center gap-2 bg-black/50 backdrop-blur-sm px-3 py-1.5 rounded-full">
            <div className="w-1.5 h-1.5 rounded-full bg-white/60 animate-pulse" />
            <p className="text-white/60 text-xs font-medium">Drag to rotate 360°</p>
          </div>
        </div>
      </div>

      {/* Controls */}
      <div className="shrink-0 px-4 py-3 border-t border-zinc-800/60 flex items-center gap-3">
        {/* Zoom controls */}
        <button
          onClick={handleZoomOut}
          className="w-9 h-9 rounded-full bg-zinc-800 text-white flex items-center justify-center hover:bg-zinc-700 transition-colors"
          title="Zoom out"
        >
          <ZoomOut size={16} />
        </button>
        <button
          onClick={handleZoomIn}
          className="w-9 h-9 rounded-full bg-zinc-800 text-white flex items-center justify-center hover:bg-zinc-700 transition-colors"
          title="Zoom in"
        >
          <ZoomIn size={16} />
        </button>

        {/* Reset rotation */}
        <button
          onClick={handleReset}
          className="w-9 h-9 rounded-full bg-zinc-800 text-white flex items-center justify-center hover:bg-zinc-700 transition-colors"
          title="Reset view"
        >
          <RotateCcw size={15} />
        </button>

        <div className="flex-1" />

        {/* Save */}
        <button
          onClick={handleSave}
          className="flex items-center gap-2 bg-zinc-800 text-zinc-100 rounded-xl px-4 py-2.5 text-sm font-medium hover:bg-zinc-700 transition-colors"
        >
          <Save size={15} /> Save
        </button>

        {/* Close */}
        <button
          onClick={() => setShowTryOn(false)}
          className="flex items-center gap-2 bg-zinc-900 border border-zinc-700 text-zinc-300 rounded-xl px-4 py-2.5 text-sm font-medium hover:border-zinc-500 transition-colors"
        >
          Done
        </button>
      </div>
    </motion.div>
  );
}
