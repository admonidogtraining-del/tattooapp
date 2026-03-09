import { useEffect, useRef, useCallback } from 'react';
import * as THREE from 'three';
import { X, Save, RotateCcw, ZoomIn, ZoomOut, RotateCw, Plus, Minus } from 'lucide-react';
import { motion } from 'motion/react';
import { useApp } from '../context/AppContext';
import { SKIN_TONES, extractPlacement } from '../constants';

// ─── Types ────────────────────────────────────────────────────────────────────

interface JointRefs {
  spine: THREE.Group;
  leftShoulder: THREE.Group;
  leftElbow: THREE.Group;
  rightShoulder: THREE.Group;
  rightElbow: THREE.Group;
  leftHip: THREE.Group;
  leftKnee: THREE.Group;
  rightHip: THREE.Group;
  rightKnee: THREE.Group;
}

type PoseName = 'tpose' | 'relaxed' | 'armUp' | 'walking';

interface PoseAngles {
  leftShoulder: [number, number, number];
  leftElbow:    [number, number, number];
  rightShoulder:[number, number, number];
  rightElbow:   [number, number, number];
  leftHip:      [number, number, number];
  leftKnee:     [number, number, number];
  rightHip:     [number, number, number];
  rightKnee:    [number, number, number];
}

// ─── Pose presets ─────────────────────────────────────────────────────────────

const PI = Math.PI;

const POSES: Record<PoseName, PoseAngles> = {
  tpose: {
    leftShoulder:  [0, 0, 0],
    leftElbow:     [0, 0, 0],
    rightShoulder: [0, 0, 0],
    rightElbow:    [0, 0, 0],
    leftHip:       [0, 0, 0],
    leftKnee:      [0, 0, 0],
    rightHip:      [0, 0, 0],
    rightKnee:     [0, 0, 0],
  },
  relaxed: {
    leftShoulder:  [0, 0,  PI / 2.1],
    leftElbow:     [0, 0,  PI / 12],
    rightShoulder: [0, 0, -PI / 2.1],
    rightElbow:    [0, 0, -PI / 12],
    leftHip:       [0, 0, 0],
    leftKnee:      [0, 0, 0],
    rightHip:      [0, 0, 0],
    rightKnee:     [0, 0, 0],
  },
  armUp: {
    leftShoulder:  [0, 0, -PI / 2],
    leftElbow:     [0, 0,  PI / 8],
    rightShoulder: [0, 0, -PI / 2],
    rightElbow:    [0, 0,  PI / 8],
    leftHip:       [0, 0, 0],
    leftKnee:      [0, 0, 0],
    rightHip:      [0, 0, 0],
    rightKnee:     [0, 0, 0],
  },
  walking: {
    leftShoulder:  [0, 0,  PI * 0.58],
    leftElbow:     [0, 0,  PI / 10],
    rightShoulder: [0, 0, -PI * 0.58],
    rightElbow:    [0, 0, -PI / 10],
    leftHip:       [-0.42, 0, 0],
    leftKnee:      [ 0.32, 0, 0],
    rightHip:      [ 0.42, 0, 0],
    rightKnee:     [ 0,    0, 0],
  },
};

// ─── Articulated mannequin builder ────────────────────────────────────────────

function buildArticulatedMannequin(skinHex: string): { group: THREE.Group; joints: JointRefs } {
  const group = new THREE.Group();

  const base = new THREE.Color(0.88, 0.84, 0.79);
  base.lerp(new THREE.Color(skinHex), 0.22);
  const mat = new THREE.MeshStandardMaterial({ color: base, roughness: 0.86, metalness: 0.03 });

  const addCap = (
    parent: THREE.Object3D,
    r: number, len: number,
    x: number, y: number, z: number,
    rx = 0, ry = 0, rz = 0,
  ) => {
    const m = new THREE.Mesh(new THREE.CapsuleGeometry(r, len, 14, 32), mat);
    m.position.set(x, y, z);
    m.rotation.set(rx, ry, rz);
    m.castShadow = true;
    m.receiveShadow = true;
    parent.add(m);
  };

  const addSph = (parent: THREE.Object3D, r: number, x: number, y: number, z: number) => {
    const m = new THREE.Mesh(new THREE.SphereGeometry(r, 32, 32), mat);
    m.position.set(x, y, z);
    m.castShadow = true;
    parent.add(m);
  };

  const grp = (parent: THREE.Object3D, x: number, y: number, z: number): THREE.Group => {
    const g = new THREE.Group();
    g.position.set(x, y, z);
    parent.add(g);
    return g;
  };

  // ── Spine (torso + head) — child of root, no offset ──────────────────────
  const spine = grp(group, 0, 0, 0);
  addSph(spine, 0.215, 0, 2.55, 0);                              // head
  addCap(spine, 0.1,  0.16, 0, 2.3,  0);                        // neck
  addCap(spine, 0.34, 0.5,  0, 1.82, 0);                        // upper torso
  addCap(spine, 0.29, 0.32, 0, 1.36, 0);                        // lower torso
  addCap(spine, 0.27, 0.14, 0, 1.16, 0);                        // hip block
  addCap(spine, 0.11, 0.04, -0.17, 1.08, 0, 0, 0, PI / 2);    // hip bridge L
  addCap(spine, 0.11, 0.04,  0.17, 1.08, 0, 0, 0, PI / 2);    // hip bridge R

  // ── Left arm — pivot at shoulder ─────────────────────────────────────────
  // Shoulder joint is at (-0.45, 2.1, 0) in spine (=world) space.
  // In this group's local space: arm extends in the -X direction.
  const leftShoulder = grp(spine, -0.45, 2.1, 0);
  addSph(leftShoulder, 0.125, 0, 0, 0);                          // shoulder sphere
  addCap(leftShoulder, 0.09, 0.34, -0.20, 0, 0, 0, 0, PI / 2); // upper arm

  // Elbow joint at (-0.42, 0, 0) in leftShoulder local → (-0.87, 2.1, 0) world
  const leftElbow = grp(leftShoulder, -0.42, 0, 0);
  addSph(leftElbow, 0.09,  0,     0, 0);                         // elbow sphere
  addCap(leftElbow, 0.075, 0.3, -0.20, 0, 0, 0, 0, PI / 2);   // forearm
  addSph(leftElbow, 0.075, -0.40, 0, 0);                         // wrist
  addSph(leftElbow, 0.085, -0.55, 0, 0);                         // hand

  // ── Right arm — mirror ───────────────────────────────────────────────────
  const rightShoulder = grp(spine, 0.45, 2.1, 0);
  addSph(rightShoulder, 0.125, 0, 0, 0);
  addCap(rightShoulder, 0.09, 0.34, 0.20, 0, 0, 0, 0, -PI / 2);

  const rightElbow = grp(rightShoulder, 0.42, 0, 0);
  addSph(rightElbow, 0.09,  0,    0, 0);
  addCap(rightElbow, 0.075, 0.3,  0.20, 0, 0, 0, 0, -PI / 2);
  addSph(rightElbow, 0.075, 0.40, 0, 0);
  addSph(rightElbow, 0.085, 0.55, 0, 0);

  // ── Left leg — pivot at hip (child of root group, not spine) ─────────────
  // Hip pivot at (-0.17, 1.1, 0). Leg extends in -Y in local space.
  const leftHip = grp(group, -0.17, 1.1, 0);
  addCap(leftHip, 0.125, 0.42, 0, -0.13, 0);                    // thigh

  // Knee joint at (0, -0.40, 0) in leftHip local → (-0.17, 0.70, 0) world
  const leftKnee = grp(leftHip, 0, -0.40, 0);
  addSph(leftKnee, 0.10, 0, 0, 0);                               // knee sphere
  addCap(leftKnee, 0.09, 0.40, 0, -0.26, 0);                    // calf
  addSph(leftKnee, 0.075, 0, -0.52, 0);                         // ankle
  addCap(leftKnee, 0.055, 0.22, 0, -0.64, 0.07, PI / 2, 0, 0); // foot

  // ── Right leg — mirror ───────────────────────────────────────────────────
  const rightHip = grp(group, 0.17, 1.1, 0);
  addCap(rightHip, 0.125, 0.42, 0, -0.13, 0);

  const rightKnee = grp(rightHip, 0, -0.40, 0);
  addSph(rightKnee, 0.10, 0, 0, 0);
  addCap(rightKnee, 0.09, 0.40, 0, -0.26, 0);
  addSph(rightKnee, 0.075, 0, -0.52, 0);
  addCap(rightKnee, 0.055, 0.22, 0, -0.64, 0.07, PI / 2, 0, 0);

  return {
    group,
    joints: { spine, leftShoulder, leftElbow, rightShoulder, rightElbow, leftHip, leftKnee, rightHip, rightKnee },
  };
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

// ─── Placement config (local-space position relative to the parent joint) ─────

interface PlacementCfg {
  joint: keyof JointRefs;
  pos: [number, number, number];
  rot: [number, number, number];
  w: number;
  h: number;
}

// Positions are in the LOCAL space of the named joint group.
// This means the tattoo automatically follows limb rotation when poses change.
const PLACEMENTS: Record<string, PlacementCfg> = {
  // Spine-parented — these don't move with arms/legs
  chest:    { joint: 'spine', pos: [ 0,    1.82,  0.36 ], rot: [0, 0,     0], w: 0.50, h: 0.50 },
  back:     { joint: 'spine', pos: [ 0,    1.82, -0.36 ], rot: [0, PI,    0], w: 0.50, h: 0.56 },
  ribs:     { joint: 'spine', pos: [ 0.36, 1.7,   0.19 ], rot: [0, -0.72, 0], w: 0.26, h: 0.40 },
  neck:     { joint: 'spine', pos: [ 0,    2.3,   0.11 ], rot: [0, 0,     0], w: 0.18, h: 0.14 },
  // Shoulder-parented — offset (0,0,0.13) = just in front of shoulder sphere
  shoulder: { joint: 'leftShoulder', pos: [0, 0, 0.13], rot: [0, 0, 0], w: 0.26, h: 0.26 },
  // Elbow-parented — forearm/wrist/hand move with arm pose
  forearm:  { joint: 'leftElbow', pos: [-0.20,  0, 0.08 ], rot: [0, 0, 0], w: 0.32, h: 0.20 },
  wrist:    { joint: 'leftElbow', pos: [-0.40,  0, 0.077], rot: [0, 0, 0], w: 0.18, h: 0.13 },
  hand:     { joint: 'leftElbow', pos: [-0.55,  0, 0.09 ], rot: [0, 0, 0], w: 0.17, h: 0.17 },
  finger:   { joint: 'leftElbow', pos: [-0.55,  0, 0.09 ], rot: [0, 0, 0], w: 0.11, h: 0.11 },
  // Hip-parented — thigh moves with leg pose
  thigh:    { joint: 'leftHip',  pos: [0, -0.13,  0.13 ], rot: [0, 0, 0], w: 0.26, h: 0.28 },
  // Knee-parented — calf/ankle/foot move with knee bend
  calf:     { joint: 'leftKnee', pos: [0, -0.26, 0.095], rot: [0, 0, 0], w: 0.22, h: 0.26 },
  ankle:    { joint: 'leftKnee', pos: [0, -0.52, 0.078], rot: [0, 0, 0], w: 0.16, h: 0.11 },
  foot:     { joint: 'leftKnee', pos: [0, -0.65, 0.15 ], rot: [-PI / 2, 0, 0], w: 0.16, h: 0.24 },
};

function cfg(placement: string): PlacementCfg {
  return PLACEMENTS[placement] ?? PLACEMENTS.forearm;
}

// ─── Component ────────────────────────────────────────────────────────────────

const POSE_LABELS: { key: PoseName; label: string }[] = [
  { key: 'tpose',   label: 'T‑Pose'  },
  { key: 'relaxed', label: 'Relaxed' },
  { key: 'armUp',   label: 'Arms Up' },
  { key: 'walking', label: 'Walking' },
];

export default function TryOnModal() {
  const { generatedImage, showTryOn, setShowTryOn, questionnaire, result } = useApp();

  const containerRef  = useRef<HTMLDivElement>(null);
  const rendererRef   = useRef<THREE.WebGLRenderer | null>(null);
  const sceneRef      = useRef<THREE.Scene | null>(null);
  const cameraRef     = useRef<THREE.PerspectiveCamera | null>(null);
  const mannequinRef  = useRef<THREE.Group | null>(null);
  const jointsRef     = useRef<JointRefs | null>(null);
  const tattooRef     = useRef<THREE.Mesh | null>(null);
  const frameIdRef    = useRef<number>(0);

  // Body drag-rotation
  const isDragging  = useRef(false);
  const prevPt      = useRef({ x: 0, y: 0 });
  const rotY        = useRef(0);
  const rotX        = useRef(0.06);
  const cameraZ     = useRef(4.5);

  // Pose lerp target
  const targetPoseRef   = useRef<PoseAngles>({ ...POSES.relaxed });
  const activePoseRef   = useRef<PoseName>('relaxed');

  // Tattoo adjustments
  const tattooOffX  = useRef(0);
  const tattooOffY  = useRef(0);
  const tattooRotZ  = useRef(0);
  const tattooScale = useRef(1.0);

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

      // Scene
      const scene = new THREE.Scene();
      scene.background = new THREE.Color(0x0a0a0a);
      scene.fog = new THREE.Fog(0x0a0a0a, 9, 20);

      // Camera
      const camera = new THREE.PerspectiveCamera(42, w / h, 0.01, 50);
      camera.position.set(0, 1.45, cameraZ.current);
      camera.lookAt(0, 1.45, 0);

      // Lighting
      scene.add(new THREE.AmbientLight(0xffffff, 0.7));
      const key = new THREE.DirectionalLight(0xfff6ee, 1.3);
      key.position.set(2.5, 5, 4);
      key.castShadow = true;
      key.shadow.mapSize.set(1024, 1024);
      scene.add(key);
      const fill = new THREE.DirectionalLight(0xaabbff, 0.35);
      fill.position.set(-3, 2, -2);
      scene.add(fill);
      const rim = new THREE.DirectionalLight(0xffeedd, 0.18);
      rim.position.set(0, -1, -4);
      scene.add(rim);

      // Ground
      const ground = new THREE.Mesh(
        new THREE.PlaneGeometry(10, 10),
        new THREE.MeshStandardMaterial({ color: 0x111111, roughness: 1 })
      );
      ground.rotation.x = -Math.PI / 2;
      ground.receiveShadow = true;
      scene.add(ground);

      // Articulated mannequin
      const { group: mannequin, joints } = buildArticulatedMannequin(skinHex);
      mannequin.rotation.y = rotY.current;
      mannequin.rotation.x = rotX.current;
      scene.add(mannequin);
      mannequinRef.current = mannequin;
      jointsRef.current = joints;

      // Apply initial pose instantly
      const initPose = targetPoseRef.current;
      for (const key of Object.keys(initPose) as (keyof PoseAngles)[]) {
        const [px, py, pz] = initPose[key];
        joints[key].rotation.set(px, py, pz);
      }

      // Tattoo — attach to the appropriate limb joint group
      const pcfg = cfg(placement);
      const texture = await buildTransparentTexture(generatedImage);

      const tMat = new THREE.MeshBasicMaterial({
        map: texture,
        transparent: true,
        alphaTest: 0.02,
        depthWrite: false,
        side: THREE.DoubleSide,
        polygonOffset: true,
        polygonOffsetFactor: -2,
        polygonOffsetUnits: -2,
      });

      tattooOffX.current = 0;
      tattooOffY.current = 0;
      tattooRotZ.current = 0;
      tattooScale.current = 1.0;

      const plane = new THREE.Mesh(new THREE.PlaneGeometry(pcfg.w, pcfg.h), tMat);
      plane.position.set(pcfg.pos[0], pcfg.pos[1], pcfg.pos[2]);
      plane.rotation.set(pcfg.rot[0], pcfg.rot[1], pcfg.rot[2]);
      plane.name = 'tattoo';

      // Parent tattoo to its specific limb joint so it moves with the pose
      joints[pcfg.joint].add(plane);
      tattooRef.current = plane;

      // Render loop — smooth pose lerp
      const animate = () => {
        frameIdRef.current = requestAnimationFrame(animate);

        // Lerp joints toward target pose
        const j = jointsRef.current;
        const tp = targetPoseRef.current;
        if (j) {
          for (const k of Object.keys(tp) as (keyof PoseAngles)[]) {
            const [tx, ty, tz] = tp[k];
            const joint = j[k];
            joint.rotation.x += (tx - joint.rotation.x) * 0.1;
            joint.rotation.y += (ty - joint.rotation.y) * 0.1;
            joint.rotation.z += (tz - joint.rotation.z) * 0.1;
          }
        }

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
      mannequinRef.current = jointsRef.current = tattooRef.current = null;
    };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [showTryOn, generatedImage, skinHex, placement]);

  // ── Body drag-rotate ──────────────────────────────────────────────────────
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
    rotX.current = Math.max(-0.45, Math.min(0.45, rotX.current + dy * 0.008));
    mannequinRef.current.rotation.y = rotY.current;
    mannequinRef.current.rotation.x = rotX.current;
  }, []);

  const onPointerUp   = useCallback(() => { isDragging.current = false; }, []);
  const onWheel       = useCallback((e: React.WheelEvent) => {
    cameraZ.current = Math.max(2.2, Math.min(7.5, cameraZ.current + e.deltaY * 0.005));
  }, []);

  // ── Pose switching ────────────────────────────────────────────────────────
  const setPose = useCallback((name: PoseName) => {
    activePoseRef.current = name;
    targetPoseRef.current = { ...POSES[name] };
  }, []);

  // ── Tattoo nudge / rotate / scale ─────────────────────────────────────────
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

  const scaleTattoo = useCallback((delta: number) => {
    const p = tattooRef.current;
    if (!p) return;
    tattooScale.current = Math.max(0.3, Math.min(3.0, tattooScale.current + delta));
    p.scale.setScalar(tattooScale.current);
  }, []);

  const handleZoomIn  = useCallback(() => { cameraZ.current = Math.max(2.2, cameraZ.current - 0.45); }, []);
  const handleZoomOut = useCallback(() => { cameraZ.current = Math.min(7.5, cameraZ.current + 0.45); }, []);

  const handleReset = useCallback(() => {
    rotY.current = 0; rotX.current = 0.06; cameraZ.current = 4.5;
    if (mannequinRef.current) {
      mannequinRef.current.rotation.set(0, 0.06, 0);
    }
    targetPoseRef.current = { ...POSES.relaxed };
    activePoseRef.current = 'relaxed';
    const p = tattooRef.current;
    if (p) {
      const c = cfg(placement);
      p.position.set(c.pos[0], c.pos[1], c.pos[2]);
      p.rotation.set(c.rot[0], c.rot[1], c.rot[2]);
      tattooScale.current = 1.0;
      p.scale.set(1, 1, 1);
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

      {/* Pose strip */}
      <div className="shrink-0 px-4 pt-2 pb-1 border-t border-zinc-800/40 bg-zinc-950 flex items-center gap-2">
        <span className="text-xs text-zinc-500 font-medium mr-1">Pose</span>
        {POSE_LABELS.map(({ key, label: pl }) => (
          <button
            key={key}
            onClick={() => setPose(key)}
            className={`px-3 py-1 rounded-lg text-xs font-medium transition-colors ${
              activePoseRef.current === key
                ? 'bg-zinc-200 text-zinc-900'
                : 'bg-zinc-800 text-zinc-300 hover:bg-zinc-700 hover:text-white'
            }`}
          >
            {pl}
          </button>
        ))}
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
            <button onClick={handleReset} title="Reset all"
              className="w-9 h-9 rounded-xl bg-zinc-800 text-zinc-300 flex items-center justify-center hover:bg-zinc-700 transition-colors">
              <RotateCcw size={14} />
            </button>
          </div>

          <div className="w-px h-6 bg-zinc-700 mx-1" />

          {/* Tattoo label */}
          <span className="text-xs text-zinc-500 font-medium">Tattoo</span>

          {/* Move arrows */}
          <div className="flex gap-1">
            {([['◀', -NUDGE, 0], ['▶', NUDGE, 0], ['▲', 0, NUDGE], ['▼', 0, -NUDGE]] as const).map(([lbl, dx, dy]) => (
              <button key={lbl} onClick={() => moveTattoo(dx, dy)}
                className="w-8 h-8 rounded-lg bg-zinc-800 text-zinc-300 text-sm font-bold flex items-center justify-center hover:bg-zinc-700 hover:text-white transition-colors">
                {lbl}
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
              className="w-8 h-8 rounded-xl bg-zinc-800 text-zinc-300 flex items-center justify-center hover:bg-zinc-700 transition-colors">
              <RotateCw size={13} />
            </button>
          </div>

          <div className="w-px h-6 bg-zinc-700 mx-1" />

          {/* Size controls */}
          <span className="text-xs text-zinc-500 font-medium">Size</span>
          <div className="flex gap-1">
            <button onClick={() => scaleTattoo(-0.1)} title="Smaller"
              className="w-8 h-8 rounded-lg bg-zinc-800 text-zinc-300 flex items-center justify-center hover:bg-zinc-700 transition-colors">
              <Minus size={13} />
            </button>
            <button onClick={() => scaleTattoo(0.1)} title="Bigger"
              className="w-8 h-8 rounded-lg bg-zinc-800 text-zinc-300 flex items-center justify-center hover:bg-zinc-700 transition-colors">
              <Plus size={13} />
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
