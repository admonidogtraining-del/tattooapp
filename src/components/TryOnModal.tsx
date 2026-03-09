import { useEffect, useRef, useCallback, useState } from 'react';
import * as THREE from 'three';
import { X, Save, RotateCcw, ZoomIn, ZoomOut, RotateCw, Plus, Minus, Target } from 'lucide-react';
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
  leftShoulder:  [number, number, number];
  leftElbow:     [number, number, number];
  rightShoulder: [number, number, number];
  rightElbow:    [number, number, number];
  leftHip:       [number, number, number];
  leftKnee:      [number, number, number];
  rightHip:      [number, number, number];
  rightKnee:     [number, number, number];
}

interface BodyHit {
  point: THREE.Vector3;
  normal: THREE.Vector3;
  jointKey: keyof JointRefs;
  object: THREE.Mesh;
}

// ─── Pose presets ─────────────────────────────────────────────────────────────

const PI = Math.PI;

// Rotation conventions (local space):
//   leftShoulder.z  -PI/2 = arm UP,   +PI/2 = arm DOWN
//   rightShoulder.z +PI/2 = arm UP,   -PI/2 = arm DOWN
//   leftElbow.z     negative = elbow bends toward head
//   rightElbow.z    positive = elbow bends toward head
//   hip.x           positive = leg forward,  negative = leg backward
//   knee.x          negative = knee bends (calf backward), limits [−PI*0.8, 0.05]

const POSES: Record<PoseName, PoseAngles> = {
  tpose: {
    leftShoulder:  [0, 0, 0],       leftElbow:     [0, 0, 0],
    rightShoulder: [0, 0, 0],       rightElbow:    [0, 0, 0],
    leftHip:       [0, 0, 0],       leftKnee:      [0, 0, 0],
    rightHip:      [0, 0, 0],       rightKnee:     [0, 0, 0],
  },
  relaxed: {
    leftShoulder:  [0, 0,  PI / 2.1], leftElbow:   [0, 0, -PI / 12],
    rightShoulder: [0, 0, -PI / 2.1], rightElbow:  [0, 0,  PI / 12],
    leftHip:       [0, 0, 0],         leftKnee:    [0, 0, 0],
    rightHip:      [0, 0, 0],         rightKnee:   [0, 0, 0],
  },
  armUp: {
    leftShoulder:  [0, 0, -PI / 2], leftElbow:     [0, 0, 0],
    rightShoulder: [0, 0,  PI / 2], rightElbow:    [0, 0, 0],
    leftHip:       [0, 0, 0],       leftKnee:      [0, 0, 0],
    rightHip:      [0, 0, 0],       rightKnee:     [0, 0, 0],
  },
  walking: {
    leftShoulder:  [0,  0.28,  PI * 0.52], leftElbow:  [0, 0, -PI / 8],
    rightShoulder: [0, -0.28, -PI * 0.52], rightElbow: [0, 0,  PI / 8],
    leftHip:       [0.44, 0, 0],           leftKnee:   [-0.08, 0, 0],
    rightHip:      [-0.44, 0, 0],          rightKnee:  [-0.38, 0, 0],
  },
};

const POSE_LABELS: { key: PoseName; label: string }[] = [
  { key: 'tpose',   label: 'T‑Pose'  },
  { key: 'relaxed', label: 'Relaxed' },
  { key: 'armUp',   label: 'Arms Up' },
  { key: 'walking', label: 'Walking' },
];

// ─── Articulated mannequin builder ────────────────────────────────────────────

interface MannequinResult {
  group: THREE.Group;
  joints: JointRefs;
  meshToJoint: Map<THREE.Mesh, keyof JointRefs>;
}

function buildArticulatedMannequin(skinHex: string): MannequinResult {
  const group = new THREE.Group();
  const meshToJoint = new Map<THREE.Mesh, keyof JointRefs>();

  const base = new THREE.Color(0.88, 0.84, 0.79);
  base.lerp(new THREE.Color(skinHex), 0.22);
  const mat = new THREE.MeshStandardMaterial({ color: base, roughness: 0.86, metalness: 0.03 });

  const addCap = (
    parent: THREE.Object3D, jk: keyof JointRefs,
    r: number, len: number, x: number, y: number, z: number,
    rx = 0, ry = 0, rz = 0,
  ) => {
    const m = new THREE.Mesh(new THREE.CapsuleGeometry(r, len, 14, 32), mat);
    m.position.set(x, y, z); m.rotation.set(rx, ry, rz);
    m.castShadow = true; m.receiveShadow = true;
    parent.add(m); meshToJoint.set(m, jk);
  };

  const addSph = (parent: THREE.Object3D, jk: keyof JointRefs, r: number, x: number, y: number, z: number) => {
    const m = new THREE.Mesh(new THREE.SphereGeometry(r, 32, 32), mat);
    m.position.set(x, y, z); m.castShadow = true;
    parent.add(m); meshToJoint.set(m, jk);
  };

  const grp = (parent: THREE.Object3D, x: number, y: number, z: number): THREE.Group => {
    const g = new THREE.Group(); g.position.set(x, y, z); parent.add(g); return g;
  };

  // Spine (torso + head) — at origin
  const spine = grp(group, 0, 0, 0);
  addSph(spine, 'spine', 0.215, 0, 2.55, 0);
  addCap(spine, 'spine', 0.1,  0.16, 0, 2.3,  0);
  addCap(spine, 'spine', 0.34, 0.5,  0, 1.82, 0);
  addCap(spine, 'spine', 0.29, 0.32, 0, 1.36, 0);
  addCap(spine, 'spine', 0.27, 0.14, 0, 1.16, 0);
  addCap(spine, 'spine', 0.11, 0.04, -0.17, 1.08, 0, 0, 0, PI / 2);
  addCap(spine, 'spine', 0.11, 0.04,  0.17, 1.08, 0, 0, 0, PI / 2);

  // Left arm — shoulder pivot in spine local (= world since spine at origin)
  // Arm extends in local -X from shoulder. Z rotation: −PI/2 = up, +PI/2 = down.
  const leftShoulder = grp(spine, -0.45, 2.1, 0);
  addSph(leftShoulder, 'leftShoulder', 0.125, 0, 0, 0);
  addCap(leftShoulder, 'leftShoulder', 0.09, 0.34, -0.20, 0, 0, 0, 0, PI / 2);

  const leftElbow = grp(leftShoulder, -0.42, 0, 0);
  addSph(leftElbow, 'leftElbow', 0.09,   0,     0, 0);
  addCap(leftElbow, 'leftElbow', 0.075, 0.3,  -0.20, 0, 0, 0, 0, PI / 2);
  addSph(leftElbow, 'leftElbow', 0.075, -0.40, 0, 0);
  addSph(leftElbow, 'leftElbow', 0.085, -0.55, 0, 0);

  // Right arm — mirror. Arm extends in local +X. Z rotation: +PI/2 = up, −PI/2 = down.
  const rightShoulder = grp(spine, 0.45, 2.1, 0);
  addSph(rightShoulder, 'rightShoulder', 0.125, 0, 0, 0);
  addCap(rightShoulder, 'rightShoulder', 0.09, 0.34, 0.20, 0, 0, 0, 0, -PI / 2);

  const rightElbow = grp(rightShoulder, 0.42, 0, 0);
  addSph(rightElbow, 'rightElbow', 0.09,   0,    0, 0);
  addCap(rightElbow, 'rightElbow', 0.075, 0.3,  0.20, 0, 0, 0, 0, -PI / 2);
  addSph(rightElbow, 'rightElbow', 0.075, 0.40, 0, 0);
  addSph(rightElbow, 'rightElbow', 0.085, 0.55, 0, 0);

  // Left leg — hip pivot is child of root group (not spine).
  // Leg extends in local -Y. Hip.x: positive = leg forward (−Z world), negative = backward (+Z world).
  const leftHip = grp(group, -0.17, 1.1, 0);
  addCap(leftHip, 'leftHip', 0.125, 0.42, 0, -0.13, 0);

  const leftKnee = grp(leftHip, 0, -0.40, 0);
  addSph(leftKnee, 'leftKnee', 0.10,  0,     0,    0);
  addCap(leftKnee, 'leftKnee', 0.09,  0.40,  0,   -0.26, 0);
  addSph(leftKnee, 'leftKnee', 0.075, 0,    -0.52, 0);
  addCap(leftKnee, 'leftKnee', 0.055, 0.22,  0,   -0.64, 0.07, PI / 2, 0, 0);

  // Right leg — mirror
  const rightHip = grp(group, 0.17, 1.1, 0);
  addCap(rightHip, 'rightHip', 0.125, 0.42, 0, -0.13, 0);

  const rightKnee = grp(rightHip, 0, -0.40, 0);
  addSph(rightKnee, 'rightKnee', 0.10,  0,     0,    0);
  addCap(rightKnee, 'rightKnee', 0.09,  0.40,  0,   -0.26, 0);
  addSph(rightKnee, 'rightKnee', 0.075, 0,    -0.52, 0);
  addCap(rightKnee, 'rightKnee', 0.055, 0.22,  0,   -0.64, 0.07, PI / 2, 0, 0);

  return {
    group,
    joints: { spine, leftShoulder, leftElbow, rightShoulder, rightElbow, leftHip, leftKnee, rightHip, rightKnee },
    meshToJoint,
  };
}

// ─── White background removal (aggressive, with edge feathering) ──────────────

async function buildTransparentTexture(dataUrl: string): Promise<THREE.Texture> {
  return new Promise((resolve) => {
    const img = new Image();
    img.onload = () => {
      const canvas = document.createElement('canvas');
      canvas.width = img.width; canvas.height = img.height;
      const ctx = canvas.getContext('2d')!;
      ctx.drawImage(img, 0, 0);
      const src = ctx.getImageData(0, 0, canvas.width, canvas.height);
      const out = ctx.getImageData(0, 0, canvas.width, canvas.height);
      const d = src.data, o = out.data;
      const W = canvas.width, H = canvas.height;

      for (let i = 0; i < d.length; i += 4) {
        const r = d[i] / 255, g = d[i + 1] / 255, b = d[i + 2] / 255;
        // Both minimum-channel whiteness AND perceptual brightness
        const minCh = Math.min(r, g, b);
        const bright = (r * 0.299 + g * 0.587 + b * 0.114);
        const score = (minCh * 0.6 + bright * 0.4);
        if (score > 0.87) {
          o[i + 3] = 0;
        } else if (score > 0.72) {
          o[i + 3] = Math.round(255 * (1 - (score - 0.72) / 0.15));
        }
        // else: keep original alpha (fully opaque)
      }
      ctx.putImageData(out, 0, 0);

      // Erode alpha 1px to remove white fringe on edges
      const eroded = ctx.getImageData(0, 0, W, H);
      const edata = eroded.data;
      for (let y = 1; y < H - 1; y++) {
        for (let x = 1; x < W - 1; x++) {
          const idx = (y * W + x) * 4;
          const a = out.data[idx + 3];
          if (a > 0) {
            const minNeighbor = Math.min(
              out.data[((y - 1) * W + x) * 4 + 3],
              out.data[((y + 1) * W + x) * 4 + 3],
              out.data[(y * W + (x - 1)) * 4 + 3],
              out.data[(y * W + (x + 1)) * 4 + 3],
            );
            edata[idx + 3] = Math.min(a, minNeighbor);
          }
        }
      }
      ctx.putImageData(eroded, 0, 0);

      const tex = new THREE.CanvasTexture(canvas);
      tex.colorSpace = THREE.SRGBColorSpace;
      resolve(tex);
    };
    img.src = dataUrl;
  });
}

// ─── Placement config (local-space relative to named joint group) ─────────────

interface PlacementCfg {
  joint: keyof JointRefs;
  pos: [number, number, number];
  rot: [number, number, number];
  w: number; h: number;
}

const PLACEMENTS: Record<string, PlacementCfg> = {
  chest:    { joint: 'spine',        pos: [ 0,    1.82,  0.36 ], rot: [0, 0,       0], w: 0.50, h: 0.50 },
  back:     { joint: 'spine',        pos: [ 0,    1.82, -0.36 ], rot: [0, PI,      0], w: 0.50, h: 0.56 },
  ribs:     { joint: 'spine',        pos: [ 0.36, 1.7,   0.19 ], rot: [0, -0.72,   0], w: 0.26, h: 0.40 },
  neck:     { joint: 'spine',        pos: [ 0,    2.3,   0.11 ], rot: [0, 0,       0], w: 0.18, h: 0.14 },
  shoulder: { joint: 'leftShoulder', pos: [0, 0,  0.13 ],        rot: [0, 0,       0], w: 0.26, h: 0.26 },
  forearm:  { joint: 'leftElbow',    pos: [-0.20, 0,  0.08 ],    rot: [0, 0,       0], w: 0.32, h: 0.20 },
  wrist:    { joint: 'leftElbow',    pos: [-0.40, 0,  0.077],    rot: [0, 0,       0], w: 0.18, h: 0.13 },
  hand:     { joint: 'leftElbow',    pos: [-0.55, 0,  0.09 ],    rot: [0, 0,       0], w: 0.17, h: 0.17 },
  finger:   { joint: 'leftElbow',    pos: [-0.55, 0,  0.09 ],    rot: [0, 0,       0], w: 0.11, h: 0.11 },
  thigh:    { joint: 'leftHip',      pos: [0, -0.13,  0.13 ],    rot: [0, 0,       0], w: 0.26, h: 0.28 },
  calf:     { joint: 'leftKnee',     pos: [0, -0.26,  0.095],    rot: [0, 0,       0], w: 0.22, h: 0.26 },
  ankle:    { joint: 'leftKnee',     pos: [0, -0.52,  0.078],    rot: [0, 0,       0], w: 0.16, h: 0.11 },
  foot:     { joint: 'leftKnee',     pos: [0, -0.65,  0.15 ],    rot: [-PI / 2, 0, 0], w: 0.16, h: 0.24 },
};

function cfg(placement: string): PlacementCfg {
  return PLACEMENTS[placement] ?? PLACEMENTS.forearm;
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

const clamp = (v: number, lo: number, hi: number) => Math.max(lo, Math.min(hi, v));
const JSENS = 0.016; // joint drag sensitivity

// ─── Component ────────────────────────────────────────────────────────────────

export default function TryOnModal() {
  const { generatedImage, showTryOn, setShowTryOn, questionnaire, result } = useApp();

  // Three.js objects
  const containerRef  = useRef<HTMLDivElement>(null);
  const rendererRef   = useRef<THREE.WebGLRenderer | null>(null);
  const sceneRef      = useRef<THREE.Scene | null>(null);
  const cameraRef     = useRef<THREE.PerspectiveCamera | null>(null);
  const mannequinRef  = useRef<THREE.Group | null>(null);
  const jointsRef     = useRef<JointRefs | null>(null);
  const meshToJointRef = useRef<Map<THREE.Mesh, keyof JointRefs>>(new Map());
  const tattooRef     = useRef<THREE.Mesh | null>(null);
  const frameIdRef    = useRef<number>(0);

  // Body drag-rotation
  const isDragging    = useRef(false);
  const prevPt        = useRef({ x: 0, y: 0 });
  const dragStartPt   = useRef({ x: 0, y: 0 });
  const rotY          = useRef(0);
  const rotX          = useRef(0.06);
  const cameraZ       = useRef(4.5);

  // Drag mode: 'body' = rotate whole model, 'joint' = rotate a limb joint
  const dragModeRef      = useRef<'body' | 'joint' | null>(null);
  const dragJointRef     = useRef<THREE.Group | null>(null);
  const dragJointKeyRef  = useRef<keyof JointRefs | null>(null);

  // Pose lerp
  const targetPoseRef = useRef<PoseAngles>({ ...POSES.relaxed });

  // Tattoo state
  const tattooScaleRef = useRef(1.0);

  // React state (for re-rendering UI only)
  const [activePose, setActivePose]         = useState<PoseName>('relaxed');
  const [isPlacementMode, setIsPlacementMode] = useState(false);
  const isPlacementModeRef = useRef(false); // mirror for event handlers

  const skinHex   = SKIN_TONES.find(t => t.value === questionnaire.skinColor)?.color ?? '#C68642';
  const placement = result
    ? (extractPlacement(result.user_profile_analysis.suggested_placement_logic) || 'forearm')
    : 'forearm';

  // ── Scene init ──────────────────────────────────────────────────────────────
  useEffect(() => {
    if (!showTryOn || !generatedImage || !containerRef.current) return;
    const container = containerRef.current;
    let ro: ResizeObserver | null = null;

    const init = async () => {
      const w = container.clientWidth  || window.innerWidth;
      const h = container.clientHeight || Math.round(window.innerHeight * 0.72);

      const renderer = new THREE.WebGLRenderer({ antialias: true, preserveDrawingBuffer: true });
      renderer.setSize(w, h);
      renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
      renderer.outputColorSpace = THREE.SRGBColorSpace;
      renderer.shadowMap.enabled = true;
      renderer.shadowMap.type = THREE.PCFSoftShadowMap;
      container.appendChild(renderer.domElement);

      const scene = new THREE.Scene();
      scene.background = new THREE.Color(0x0a0a0a);
      scene.fog = new THREE.Fog(0x0a0a0a, 9, 20);

      const camera = new THREE.PerspectiveCamera(42, w / h, 0.01, 50);
      camera.position.set(0, 1.45, cameraZ.current);
      camera.lookAt(0, 1.45, 0);

      // Lighting
      scene.add(new THREE.AmbientLight(0xffffff, 0.7));
      const key = new THREE.DirectionalLight(0xfff6ee, 1.3);
      key.position.set(2.5, 5, 4); key.castShadow = true;
      key.shadow.mapSize.set(1024, 1024); scene.add(key);
      scene.add(Object.assign(new THREE.DirectionalLight(0xaabbff, 0.35), { position: new THREE.Vector3(-3, 2, -2) }));
      scene.add(Object.assign(new THREE.DirectionalLight(0xffeedd, 0.18), { position: new THREE.Vector3(0, -1, -4) }));

      // Ground
      const ground = new THREE.Mesh(
        new THREE.PlaneGeometry(10, 10),
        new THREE.MeshStandardMaterial({ color: 0x111111, roughness: 1 }),
      );
      ground.rotation.x = -PI / 2; ground.receiveShadow = true; scene.add(ground);

      // Articulated mannequin
      const { group: mannequin, joints, meshToJoint } = buildArticulatedMannequin(skinHex);
      mannequin.rotation.y = rotY.current;
      scene.add(mannequin);
      mannequinRef.current  = mannequin;
      jointsRef.current     = joints;
      meshToJointRef.current = meshToJoint;

      // Apply initial pose instantly
      const initPose = targetPoseRef.current;
      for (const k of Object.keys(initPose) as (keyof PoseAngles)[]) {
        const [px, py, pz] = initPose[k];
        joints[k].rotation.set(px, py, pz);
      }

      // Tattoo — transparent texture on limb group
      const pcfg    = cfg(placement);
      const texture = await buildTransparentTexture(generatedImage);

      const tMat = new THREE.MeshBasicMaterial({
        map: texture,
        transparent: true,
        alphaTest: 0.01,
        depthWrite: false,
        side: THREE.DoubleSide,
        polygonOffset: true,
        polygonOffsetFactor: -4,
        polygonOffsetUnits: -4,
      });

      // Build plane with a slight UV inset to hide any edge artifacts / frame
      const geo = new THREE.PlaneGeometry(pcfg.w, pcfg.h);
      const uvAttr = geo.attributes.uv as THREE.BufferAttribute;
      const INSET = 0.025;
      for (let i = 0; i < uvAttr.count; i++) {
        uvAttr.setXY(i,
          THREE.MathUtils.lerp(INSET, 1 - INSET, uvAttr.getX(i)),
          THREE.MathUtils.lerp(INSET, 1 - INSET, uvAttr.getY(i)),
        );
      }

      tattooScaleRef.current = 1.0;
      const plane = new THREE.Mesh(geo, tMat);
      plane.position.set(pcfg.pos[0], pcfg.pos[1], pcfg.pos[2]);
      plane.rotation.set(pcfg.rot[0], pcfg.rot[1], pcfg.rot[2]);
      plane.renderOrder = 1;
      plane.name = 'tattoo';
      joints[pcfg.joint].add(plane);
      tattooRef.current = plane;

      // Animate loop — lerp joints toward target pose
      const animate = () => {
        frameIdRef.current = requestAnimationFrame(animate);
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

      rendererRef.current = renderer; sceneRef.current = scene; cameraRef.current = camera;

      ro = new ResizeObserver(() => {
        const nw = container.clientWidth  || window.innerWidth;
        const nh = container.clientHeight || Math.round(window.innerHeight * 0.72);
        renderer.setSize(nw, nh); camera.aspect = nw / nh; camera.updateProjectionMatrix();
      });
      ro.observe(container);
    };

    init();
    return () => {
      cancelAnimationFrame(frameIdRef.current);
      ro?.disconnect();
      const rend = rendererRef.current;
      if (rend) { rend.dispose(); if (container.contains(rend.domElement)) container.removeChild(rend.domElement); }
      rendererRef.current = sceneRef.current = cameraRef.current = null;
      mannequinRef.current = jointsRef.current = tattooRef.current = null;
      meshToJointRef.current = new Map();
    };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [showTryOn, generatedImage, skinHex, placement]);

  // ── Raycast helper: find which body mesh (and joint) was hit ─────────────────
  const getBodyHit = useCallback((e: React.PointerEvent | PointerEvent): BodyHit | null => {
    const renderer = rendererRef.current;
    const camera   = cameraRef.current;
    const mtj      = meshToJointRef.current;
    if (!renderer || !camera || !mtj.size) return null;

    const rect = renderer.domElement.getBoundingClientRect();
    const x = ((e.clientX - rect.left) / rect.width)  *  2 - 1;
    const y = -((e.clientY - rect.top)  / rect.height) *  2 + 1;

    const raycaster = new THREE.Raycaster();
    raycaster.setFromCamera(new THREE.Vector2(x, y), camera);

    const meshes = Array.from(mtj.keys());
    const hits = raycaster.intersectObjects(meshes, false);

    // Take the first hit that is a registered body mesh
    for (const hit of hits) {
      const jointKey = mtj.get(hit.object as THREE.Mesh);
      if (jointKey && hit.face) {
        return { point: hit.point, normal: hit.face.normal, jointKey, object: hit.object as THREE.Mesh };
      }
    }
    return null;
  }, []);

  // ── Place tattoo at a body hit point ─────────────────────────────────────────
  const placeTattooAtHit = useCallback((hit: BodyHit) => {
    const tattoo = tattooRef.current;
    const joints = jointsRef.current;
    const camera = cameraRef.current;
    if (!tattoo || !joints) return;

    const hitJoint = joints[hit.jointKey];
    hitJoint.updateWorldMatrix(true, false);

    // World-space normal (face normal is in mesh local geometry space)
    const worldNormal = hit.normal.clone().transformDirection(hit.object.matrixWorld).normalize();

    // Ensure it faces toward camera (outward from body)
    if (camera) {
      const toCamera = camera.position.clone().sub(hit.point).normalize();
      if (worldNormal.dot(toCamera) < 0) worldNormal.negate();
    }

    // Convert hit point to joint's local space
    const localPos = hitJoint.worldToLocal(hit.point.clone());

    // Convert world normal to joint's local space
    const invMat     = hitJoint.matrixWorld.clone().invert();
    const localNormal = worldNormal.clone().transformDirection(invMat).normalize();

    // Re-parent tattoo to the hit joint
    tattoo.parent?.remove(tattoo);

    // Push tattoo slightly above surface to avoid z-fighting
    tattoo.position.copy(localPos).addScaledVector(localNormal, 0.014);

    // Orient: plane's +Z axis aligns with surface normal
    const q = new THREE.Quaternion();
    q.setFromUnitVectors(new THREE.Vector3(0, 0, 1), localNormal);
    tattoo.quaternion.copy(q);
    tattoo.scale.setScalar(tattooScaleRef.current);

    hitJoint.add(tattoo);

    // Exit placement mode
    isPlacementModeRef.current = false;
    setIsPlacementMode(false);
  }, []);

  // ── Pointer handlers ──────────────────────────────────────────────────────────
  const onPointerDown = useCallback((e: React.PointerEvent) => {
    isDragging.current = true;
    prevPt.current      = { x: e.clientX, y: e.clientY };
    dragStartPt.current = { x: e.clientX, y: e.clientY };
    (e.target as HTMLElement).setPointerCapture(e.pointerId);

    if (isPlacementModeRef.current) {
      // In placement mode: drag still rotates body; click (up) will place
      dragModeRef.current = 'body';
      return;
    }

    // Normal mode: clicking a non-spine limb → joint drag; otherwise → body rotate
    const hit = getBodyHit(e);
    if (hit && hit.jointKey !== 'spine') {
      dragModeRef.current     = 'joint';
      dragJointRef.current    = jointsRef.current![hit.jointKey];
      dragJointKeyRef.current = hit.jointKey;
    } else {
      dragModeRef.current = 'body';
    }
  }, [getBodyHit]);

  const onPointerMove = useCallback((e: React.PointerEvent) => {
    if (!isDragging.current) return;
    const dx = e.clientX - prevPt.current.x;
    const dy = e.clientY - prevPt.current.y;
    prevPt.current = { x: e.clientX, y: e.clientY };

    if (dragModeRef.current === 'body' && mannequinRef.current) {
      rotY.current += dx * 0.012;
      rotX.current = clamp(rotX.current + dy * 0.008, -0.45, 0.45);
      mannequinRef.current.rotation.y = rotY.current;
      mannequinRef.current.rotation.x = rotX.current;

    } else if (dragModeRef.current === 'joint') {
      const joint = dragJointRef.current;
      const key   = dragJointKeyRef.current;
      if (!joint || !key) return;

      // Rotate joint and sync targetPose so lerp doesn't fight manual drag
      switch (key) {
        case 'leftShoulder':
          // dy<0 (drag up) → arm goes up → z decreases toward −PI/2
          joint.rotation.z = clamp(joint.rotation.z + dy * JSENS, -PI, PI);
          joint.rotation.y = clamp(joint.rotation.y + dx * JSENS, -PI * 0.6, PI * 0.6);
          break;
        case 'leftElbow':
          // dy<0 (drag up) → elbow bends → z decreases toward −PI*0.88
          joint.rotation.z = clamp(joint.rotation.z + dy * JSENS, -PI * 0.88, 0.1);
          break;
        case 'rightShoulder':
          // Mirrored: dy<0 → arm up → z increases toward +PI/2
          joint.rotation.z = clamp(joint.rotation.z - dy * JSENS, -PI, PI);
          joint.rotation.y = clamp(joint.rotation.y + dx * JSENS, -PI * 0.6, PI * 0.6);
          break;
        case 'rightElbow':
          // dy<0 → elbow bends → z increases toward +PI*0.88
          joint.rotation.z = clamp(joint.rotation.z - dy * JSENS, -0.1, PI * 0.88);
          break;
        case 'leftHip':
          // dy<0 (drag up) → leg forward → x increases
          joint.rotation.x = clamp(joint.rotation.x - dy * JSENS, -PI / 2, PI / 2);
          joint.rotation.z = clamp(joint.rotation.z + dx * JSENS, -PI / 5, PI / 5);
          break;
        case 'leftKnee':
          // dy>0 (drag down) → knee bends → x decreases toward −PI*0.8
          joint.rotation.x = clamp(joint.rotation.x - dy * JSENS, -PI * 0.8, 0.05);
          break;
        case 'rightHip':
          joint.rotation.x = clamp(joint.rotation.x - dy * JSENS, -PI / 2, PI / 2);
          joint.rotation.z = clamp(joint.rotation.z - dx * JSENS, -PI / 5, PI / 5);
          break;
        case 'rightKnee':
          joint.rotation.x = clamp(joint.rotation.x - dy * JSENS, -PI * 0.8, 0.05);
          break;
      }

      // Sync targetPose so the lerp animation doesn't fight manual rotation
      if (key in targetPoseRef.current) {
        targetPoseRef.current[key as keyof PoseAngles] = [
          joint.rotation.x, joint.rotation.y, joint.rotation.z,
        ];
      }
    }
  }, []);

  const onPointerUp = useCallback((e: React.PointerEvent) => {
    isDragging.current = false;

    // In placement mode: if the pointer barely moved → treat as a click → place tattoo
    if (isPlacementModeRef.current) {
      const dx = e.clientX - dragStartPt.current.x;
      const dy = e.clientY - dragStartPt.current.y;
      if (dx * dx + dy * dy < 36) { // <6px movement = click
        const hit = getBodyHit(e);
        if (hit) placeTattooAtHit(hit);
      }
    }

    dragModeRef.current     = null;
    dragJointRef.current    = null;
    dragJointKeyRef.current = null;
  }, [getBodyHit, placeTattooAtHit]);

  const onWheel = useCallback((e: React.WheelEvent) => {
    cameraZ.current = clamp(cameraZ.current + e.deltaY * 0.005, 2.2, 7.5);
  }, []);

  // ── Pose switching ──────────────────────────────────────────────────────────
  const setPose = useCallback((name: PoseName) => {
    setActivePose(name);
    targetPoseRef.current = { ...POSES[name] };
  }, []);

  // ── Tattoo nudge / rotate / scale ──────────────────────────────────────────
  const NUDGE = 0.025;
  const moveTattoo   = useCallback((dx: number, dy: number) => {
    const p = tattooRef.current; if (!p) return;
    p.position.x += dx; p.position.y += dy;
  }, []);
  const rotateTattoo = useCallback((delta: number) => {
    const p = tattooRef.current; if (!p) return;
    p.rotation.z += delta;
  }, []);
  const scaleTattoo  = useCallback((delta: number) => {
    const p = tattooRef.current; if (!p) return;
    tattooScaleRef.current = clamp(tattooScaleRef.current + delta, 0.25, 4.0);
    p.scale.setScalar(tattooScaleRef.current);
  }, []);

  const handleZoomIn  = useCallback(() => { cameraZ.current = clamp(cameraZ.current - 0.45, 2.2, 7.5); }, []);
  const handleZoomOut = useCallback(() => { cameraZ.current = clamp(cameraZ.current + 0.45, 2.2, 7.5); }, []);

  const handleReset = useCallback(() => {
    rotY.current = 0; rotX.current = 0.06; cameraZ.current = 4.5;
    if (mannequinRef.current) mannequinRef.current.rotation.set(0.06, 0, 0);
    targetPoseRef.current = { ...POSES.relaxed };
    setActivePose('relaxed');
    isPlacementModeRef.current = false;
    setIsPlacementMode(false);
    const p = tattooRef.current;
    if (p) {
      const c = cfg(placement);
      const joints = jointsRef.current;
      if (joints) {
        p.parent?.remove(p);
        p.position.set(c.pos[0], c.pos[1], c.pos[2]);
        p.rotation.set(c.rot[0], c.rot[1], c.rot[2]);
        p.quaternion.setFromEuler(p.rotation);
        tattooScaleRef.current = 1.0;
        p.scale.set(1, 1, 1);
        joints[c.joint].add(p);
      }
    }
  }, [placement]);

  const togglePlacementMode = useCallback(() => {
    const next = !isPlacementModeRef.current;
    isPlacementModeRef.current = next;
    setIsPlacementMode(next);
  }, []);

  const handleSave = useCallback(() => {
    const rend = rendererRef.current; const scene = sceneRef.current; const cam = cameraRef.current;
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
  const cursorClass = isPlacementMode ? 'cursor-crosshair' : 'cursor-grab active:cursor-grabbing';

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
            {isPlacementMode
              ? <span className="ml-3 text-amber-400 font-medium">Click on body to place tattoo</span>
              : <span className="ml-3 text-zinc-600">· Drag body = rotate · Drag limb = pose it</span>}
          </p>
        </div>
        <button onClick={() => setShowTryOn(false)}
          className="w-9 h-9 bg-zinc-800 text-white rounded-full flex items-center justify-center hover:bg-zinc-700 transition-colors">
          <X size={18} />
        </button>
      </div>

      {/* 3D Viewport */}
      <div
        ref={containerRef}
        className={`flex-1 relative ${cursorClass} select-none overflow-hidden`}
        onPointerDown={onPointerDown}
        onPointerMove={onPointerMove}
        onPointerUp={onPointerUp}
        onPointerLeave={onPointerUp}
        onWheel={onWheel}
      >
        {/* Top hint */}
        <div className="absolute top-3 left-1/2 -translate-x-1/2 z-10 pointer-events-none">
          {isPlacementMode ? (
            <div className="flex items-center gap-2 bg-amber-500/20 backdrop-blur-sm border border-amber-500/40 px-4 py-2 rounded-full">
              <Target size={13} className="text-amber-400" />
              <p className="text-amber-300 text-xs font-medium">Click any spot on the body to place your tattoo</p>
            </div>
          ) : (
            <div className="flex items-center gap-2 bg-black/50 backdrop-blur-sm px-3 py-1.5 rounded-full">
              <div className="w-1.5 h-1.5 rounded-full bg-white/60 animate-pulse" />
              <p className="text-white/60 text-xs font-medium">Drag body · Drag limbs to pose · Scroll to zoom</p>
            </div>
          )}
        </div>
      </div>

      {/* Pose strip */}
      <div className="shrink-0 px-4 pt-2 pb-1 border-t border-zinc-800/40 bg-zinc-950 flex items-center gap-2">
        <span className="text-xs text-zinc-500 font-medium mr-1">Pose</span>
        {POSE_LABELS.map(({ key, label: pl }) => (
          <button key={key} onClick={() => setPose(key)}
            className={`px-3 py-1 rounded-lg text-xs font-medium transition-colors ${
              activePose === key
                ? 'bg-white text-zinc-900'
                : 'bg-zinc-800 text-zinc-300 hover:bg-zinc-700 hover:text-white'
            }`}>
            {pl}
          </button>
        ))}
      </div>

      {/* Controls bar */}
      <div className="shrink-0 px-4 py-3 border-t border-zinc-800/60 bg-zinc-950">
        <div className="flex items-center gap-2 flex-wrap">

          {/* View */}
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

          <div className="w-px h-6 bg-zinc-700 mx-0.5" />

          {/* Place tattoo toggle */}
          <button onClick={togglePlacementMode}
            className={`flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-medium transition-colors ${
              isPlacementMode
                ? 'bg-amber-500 text-black'
                : 'bg-zinc-800 text-zinc-300 hover:bg-zinc-700 hover:text-white'
            }`}>
            <Target size={13} />
            Place
          </button>

          <div className="w-px h-6 bg-zinc-700 mx-0.5" />

          {/* Tattoo nudge arrows */}
          <span className="text-xs text-zinc-500 font-medium">Move</span>
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
            <button onClick={() => rotateTattoo( PI / 12)} title="Rotate CCW"
              className="w-8 h-8 rounded-lg bg-zinc-800 text-zinc-300 flex items-center justify-center hover:bg-zinc-700 transition-colors">
              <RotateCcw size={13} />
            </button>
            <button onClick={() => rotateTattoo(-PI / 12)} title="Rotate CW"
              className="w-8 h-8 rounded-lg bg-zinc-800 text-zinc-300 flex items-center justify-center hover:bg-zinc-700 transition-colors">
              <RotateCw size={13} />
            </button>
          </div>

          <div className="w-px h-6 bg-zinc-700 mx-0.5" />

          {/* Size */}
          <span className="text-xs text-zinc-500 font-medium">Size</span>
          <div className="flex gap-1">
            <button onClick={() => scaleTattoo(-0.12)} title="Smaller"
              className="w-8 h-8 rounded-lg bg-zinc-800 text-zinc-300 flex items-center justify-center hover:bg-zinc-700 transition-colors">
              <Minus size={13} />
            </button>
            <button onClick={() => scaleTattoo( 0.12)} title="Bigger"
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
