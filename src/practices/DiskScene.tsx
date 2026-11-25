import { useEffect, useRef, useState } from 'react';
import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';
import gsap from 'gsap';

interface DiskSceneProps {
  platters: number;
  selectedCylinder: number;
  selectedSector: number;
  rpm: number;
  spinning: boolean;
}

const TRACK_RADII = [3.65, 3.1, 2.55, 2.0, 1.45];
const SECTORS_VISUAL = 12;

function drawFallbackDisk2D(
  canvas: HTMLCanvasElement,
  platters: number,
  selectedCylinder: number,
  selectedSector: number,
  phase: number,
) {
  const ctx = canvas.getContext('2d');
  if (!ctx) return;
  const w = canvas.width;
  const h = canvas.height;
  ctx.clearRect(0, 0, w, h);
  ctx.fillStyle = '#10283c';
  ctx.fillRect(0, 0, w, h);

  const safePlatters = Math.max(1, Math.min(6, Math.round(platters)));
  const cylIdx = Math.max(0, Math.min(TRACK_RADII.length - 1, selectedCylinder));
  const cx = w * 0.46;
  const baseCy = h * 0.68;
  const gapY = Math.min(46, 180 / Math.max(1, safePlatters));
  const rxScale = Math.min(w * 0.32, 210) / 4.05;
  const ryScale = rxScale * 0.4;
  const cylRx = TRACK_RADII[cylIdx] * rxScale;
  const cylRy = TRACK_RADII[cylIdx] * ryScale;

  for (let p = 0; p < safePlatters; p++) {
    const cy = baseCy - p * gapY;
    // Plato elíptico isométrico
    ctx.beginPath();
    ctx.ellipse(cx, cy, 4.05 * rxScale, 4.05 * ryScale, 0, 0, Math.PI * 2);
    ctx.fillStyle = '#6f92ae';
    ctx.fill();
    ctx.strokeStyle = '#d7e4ee';
    ctx.lineWidth = 1.4;
    ctx.stroke();

    // Divisiones de sectores
    for (let s = 0; s < SECTORS_VISUAL; s++) {
      const a = phase + (s * Math.PI * 2) / SECTORS_VISUAL;
      ctx.beginPath();
      ctx.moveTo(cx + Math.cos(a) * 1.1 * rxScale, cy + Math.sin(a) * 1.1 * ryScale);
      ctx.lineTo(cx + Math.cos(a) * 3.95 * rxScale, cy + Math.sin(a) * 3.95 * ryScale);
      ctx.strokeStyle = 'rgba(16, 40, 60, 0.38)';
      ctx.lineWidth = 1;
      ctx.stroke();
    }

    // Pistas concéntricas
    TRACK_RADII.forEach((r, idx) => {
      ctx.beginPath();
      ctx.ellipse(cx, cy, r * rxScale, r * ryScale, 0, 0, Math.PI * 2);
      ctx.strokeStyle = idx === cylIdx ? '#b84635' : '#1b3b56';
      ctx.lineWidth = idx === cylIdx ? 3 : 1;
      ctx.stroke();
    });

    // Sector activo en el plato superior
    if (p === safePlatters - 1) {
      const a0 = phase + ((selectedSector % SECTORS_VISUAL) * Math.PI * 2) / SECTORS_VISUAL;
      const a1 = a0 + (Math.PI * 2) / SECTORS_VISUAL;
      ctx.beginPath();
      ctx.ellipse(cx, cy, cylRx, cylRy, 0, a0, a1);
      ctx.strokeStyle = '#f3c669';
      ctx.lineWidth = 7;
      ctx.stroke();
    }
  }

  // Paredes verticales del cilindro activo uniendo todos los platos
  const topCy = baseCy - (safePlatters - 1) * gapY;
  ctx.fillStyle = 'rgba(199, 161, 84, 0.20)';
  ctx.fillRect(cx - cylRx, topCy, cylRx * 2, (safePlatters - 1) * gapY);
  ctx.strokeStyle = '#f3c669';
  ctx.setLineDash([5, 4]);
  ctx.lineWidth = 1.8;
  ctx.beginPath();
  ctx.moveTo(cx - cylRx, topCy);
  ctx.lineTo(cx - cylRx, baseCy);
  ctx.moveTo(cx + cylRx, topCy);
  ctx.lineTo(cx + cylRx, baseCy);
  ctx.stroke();
  ctx.setLineDash([]);

  // Eje central y brazo actuador
  ctx.fillStyle = '#c7a154';
  ctx.fillRect(cx - 8, topCy - 24, 16, (safePlatters - 1) * gapY + 34);

  const armX = w * 0.84;
  for (let p = 0; p < safePlatters; p++) {
    const cy = baseCy - p * gapY - 3;
    ctx.beginPath();
    ctx.moveTo(armX, cy + 12);
    ctx.lineTo(cx + cylRx, cy);
    ctx.strokeStyle = '#e6dfd0';
    ctx.lineWidth = 3;
    ctx.stroke();
    ctx.fillStyle = '#b84635';
    ctx.fillRect(cx + cylRx - 5, cy - 4, 10, 8);
  }
}

export default function DiskScene({ platters, selectedCylinder, selectedSector, rpm, spinning }: DiskSceneProps) {
  const mountRef = useRef<HTMLDivElement>(null);
  const spindleGroupRef = useRef<THREE.Group | null>(null);
  const armPivotRef = useRef<THREE.Group | null>(null);
  const dynamicGroupRef = useRef<THREE.Group | null>(null);
  const spinParamsRef = useRef({ rpm, spinning });
  const reducedMotion = useRef(window.matchMedia('(prefers-reduced-motion: reduce)').matches);
  const [webglFailed, setWebglFailed] = useState(false);
  const fallbackCanvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    spinParamsRef.current = { rpm, spinning };
  }, [rpm, spinning]);

  useEffect(() => {
    const mount = mountRef.current;
    if (!mount || webglFailed) return undefined;

    const width = Math.max(300, mount.clientWidth || 640);
    const height = Math.max(360, mount.clientHeight || 430);

    let renderer: THREE.WebGLRenderer;
    try {
      renderer = new THREE.WebGLRenderer({ antialias: true, alpha: false });
    } catch {
      setWebglFailed(true);
      return undefined;
    }

    const scene = new THREE.Scene();
    scene.background = new THREE.Color('#10283c');
    scene.fog = new THREE.Fog('#10283c', 16, 36);

    const camera = new THREE.PerspectiveCamera(40, width / height, 0.1, 100);
    camera.position.set(8.8, 6.8, 9.6);
    camera.lookAt(0, 0, 0);

    renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));
    renderer.setSize(width, height);
    mount.innerHTML = '';
    mount.appendChild(renderer.domElement);

    const controls = new OrbitControls(camera, renderer.domElement);
    controls.enableDamping = true;
    controls.dampingFactor = 0.06;
    controls.minDistance = 6.5;
    controls.maxDistance = 22;

    scene.add(new THREE.AmbientLight('#dce7f0', 1.4));
    const keyLight = new THREE.DirectionalLight('#ffffff', 1.7);
    keyLight.position.set(7, 11, 6);
    scene.add(keyLight);
    const goldRim = new THREE.DirectionalLight('#c7a154', 0.85);
    goldRim.position.set(-8, 4, -6);
    scene.add(goldRim);

    const chassis = new THREE.Mesh(
      new THREE.BoxGeometry(11.4, 0.35, 10.2),
      new THREE.MeshStandardMaterial({ color: '#173650', roughness: 0.65, metalness: 0.18 }),
    );
    chassis.position.set(0.5, -2.55, 0);
    scene.add(chassis);

    const spindleGroup = new THREE.Group();
    scene.add(spindleGroup);
    spindleGroupRef.current = spindleGroup;

    const dynamicGroup = new THREE.Group();
    scene.add(dynamicGroup);
    dynamicGroupRef.current = dynamicGroup;

    const armPivot = new THREE.Group();
    armPivot.position.set(4.95, 0, 2.85);
    scene.add(armPivot);
    armPivotRef.current = armPivot;

    let raf = 0;
    let last = performance.now();
    const animate = (now: number) => {
      const dt = Math.min(0.05, (now - last) / 1000);
      last = now;
      if (!reducedMotion.current && spinParamsRef.current.spinning && spindleGroupRef.current) {
        const visualRadPerSec = (spinParamsRef.current.rpm / 7200) * 1.45;
        spindleGroupRef.current.rotation.y += visualRadPerSec * dt;
      }
      controls.update();
      renderer.render(scene, camera);
      raf = requestAnimationFrame(animate);
    };
    raf = requestAnimationFrame(animate);

    const onResize = () => {
      if (!mountRef.current) return;
      const nw = Math.max(260, mountRef.current.clientWidth || 640);
      const nh = Math.max(320, mountRef.current.clientHeight || 430);
      camera.aspect = nw / nh;
      camera.updateProjectionMatrix();
      renderer.setSize(nw, nh);
    };
    const observer = new ResizeObserver(onResize);
    observer.observe(mount);

    return () => {
      cancelAnimationFrame(raf);
      observer.disconnect();
      controls.dispose();
      renderer.dispose();
      if (renderer.domElement.parentNode === mount) {
        mount.removeChild(renderer.domElement);
      }
      scene.traverse((obj) => {
        const mesh = obj as THREE.Mesh;
        if (mesh.geometry) mesh.geometry.dispose();
        if (mesh.material) {
          if (Array.isArray(mesh.material)) mesh.material.forEach((m) => m.dispose());
          else mesh.material.dispose();
        }
      });
    };
  }, [webglFailed]);

  useEffect(() => {
    if (!webglFailed) return undefined;
    let raf = 0;
    let phase = 0;
    let last = performance.now();
    const loop = (now: number) => {
      const dt = Math.min(0.05, (now - last) / 1000);
      last = now;
      if (!reducedMotion.current && spinParamsRef.current.spinning) {
        phase += (spinParamsRef.current.rpm / 7200) * 1.2 * dt;
      }
      if (fallbackCanvasRef.current) {
        drawFallbackDisk2D(fallbackCanvasRef.current, platters, selectedCylinder, selectedSector, phase);
      }
      raf = requestAnimationFrame(loop);
    };
    raf = requestAnimationFrame(loop);
    return () => cancelAnimationFrame(raf);
  }, [webglFailed, platters, selectedCylinder, selectedSector]);

  useEffect(() => {
    if (webglFailed) return undefined;
    const spindleGroup = spindleGroupRef.current;
    const dynamicGroup = dynamicGroupRef.current;
    const armPivot = armPivotRef.current;
    if (!spindleGroup || !dynamicGroup || !armPivot) return undefined;

    const clearGroup = (group: THREE.Group) => {
      while (group.children.length > 0) {
        const child = group.children[0];
        child.traverse((obj) => {
          const mesh = obj as THREE.Mesh;
          if (mesh.geometry) mesh.geometry.dispose();
          if (mesh.material) {
            if (Array.isArray(mesh.material)) mesh.material.forEach((m) => m.dispose());
            else mesh.material.dispose();
          }
        });
        group.remove(child);
      }
    };

    clearGroup(spindleGroup);
    clearGroup(dynamicGroup);
    clearGroup(armPivot);

    const safePlatters = Math.max(1, Math.min(6, Math.round(platters)));
    const cylIdx = Math.max(0, Math.min(TRACK_RADII.length - 1, selectedCylinder));
    const activeRadius = TRACK_RADII[cylIdx];
    const secIdx = ((selectedSector % SECTORS_VISUAL) + SECTORS_VISUAL) % SECTORS_VISUAL;

    const spacing = safePlatters > 4 ? 0.68 : 0.84;
    const totalHeight = (safePlatters - 1) * spacing;
    const startY = -totalHeight / 2;

    const hub = new THREE.Mesh(
      new THREE.CylinderGeometry(0.68, 0.68, totalHeight + 1.25, 32),
      new THREE.MeshStandardMaterial({ color: '#c7a154', roughness: 0.3, metalness: 0.65 }),
    );
    spindleGroup.add(hub);

    const sectorAngle = (Math.PI * 2) / SECTORS_VISUAL;

    for (let p = 0; p < safePlatters; p++) {
      const y = startY + p * spacing;

      const disc = new THREE.Mesh(
        new THREE.CylinderGeometry(4.05, 4.05, 0.09, 64),
        new THREE.MeshStandardMaterial({ color: '#7d9db8', roughness: 0.25, metalness: 0.72 }),
      );
      disc.position.y = y;
      spindleGroup.add(disc);

      TRACK_RADII.forEach((r, idx) => {
        const isSelectedTrack = idx === cylIdx;
        const ring = new THREE.Mesh(
          new THREE.RingGeometry(r - (isSelectedTrack ? 0.08 : 0.025), r + (isSelectedTrack ? 0.08 : 0.025), 64),
          new THREE.MeshBasicMaterial({
            color: isSelectedTrack ? '#b84635' : '#1b3b56',
            side: THREE.DoubleSide,
          }),
        );
        ring.rotation.x = -Math.PI / 2;
        ring.position.y = y + 0.052;
        spindleGroup.add(ring);
      });

      for (let s = 0; s < SECTORS_VISUAL; s++) {
        const ang = s * sectorAngle;
        const spoke = new THREE.Mesh(
          new THREE.BoxGeometry(3.15, 0.01, 0.02),
          new THREE.MeshBasicMaterial({ color: '#244a69' }),
        );
        spoke.position.set(Math.cos(ang) * 2.45, y + 0.051, Math.sin(ang) * 2.45);
        spoke.rotation.y = -ang;
        spindleGroup.add(spoke);
      }

      if (p === safePlatters - 1) {
        const wedge = new THREE.Mesh(
          new THREE.RingGeometry(activeRadius - 0.18, activeRadius + 0.18, 24, 1, secIdx * sectorAngle, sectorAngle * 0.88),
          new THREE.MeshBasicMaterial({ color: '#f3c669', side: THREE.DoubleSide }),
        );
        wedge.rotation.x = -Math.PI / 2;
        wedge.position.y = y + 0.058;
        spindleGroup.add(wedge);
      }
    }

    const cylWall = new THREE.Mesh(
      new THREE.CylinderGeometry(activeRadius, activeRadius, totalHeight + 0.55, 64, 1, true),
      new THREE.MeshStandardMaterial({
        color: '#c7a154',
        emissive: '#c7a154',
        emissiveIntensity: 0.28,
        transparent: true,
        opacity: 0.26,
        side: THREE.DoubleSide,
        depthWrite: false,
      }),
    );
    dynamicGroup.add(cylWall);

    const actuatorPost = new THREE.Mesh(
      new THREE.CylinderGeometry(0.36, 0.42, totalHeight + 1.35, 24),
      new THREE.MeshStandardMaterial({ color: '#d7d1c3', roughness: 0.38, metalness: 0.5 }),
    );
    armPivot.add(actuatorPost);

    for (let p = 0; p < safePlatters; p++) {
      const y = startY + p * spacing;
      for (const offset of [0.11, -0.11]) {
        const arm = new THREE.Mesh(
          new THREE.BoxGeometry(3.85, 0.045, 0.2),
          new THREE.MeshStandardMaterial({ color: '#e6dfd0', roughness: 0.4, metalness: 0.45 }),
        );
        arm.position.set(-1.85, y + offset, -0.95);
        arm.rotation.y = -0.46;
        armPivot.add(arm);

        const head = new THREE.Mesh(
          new THREE.BoxGeometry(0.24, 0.06, 0.16),
          new THREE.MeshStandardMaterial({ color: '#b84635', emissive: '#963426', emissiveIntensity: 0.35 }),
        );
        head.position.set(-3.45, y + offset * 0.72, -1.82);
        armPivot.add(head);
      }
    }

    const targetRotY = (cylIdx - 2) * 0.11;
    if (reducedMotion.current) {
      armPivot.rotation.y = targetRotY;
    } else {
      gsap.to(armPivot.rotation, { y: targetRotY, duration: 0.65, ease: 'power3.out' });
    }

    return undefined;
  }, [platters, selectedCylinder, selectedSector, webglFailed]);

  return (
    <div className="memory-scene disk-scene" aria-label="Escena 3D de geometría de disco duro magnético">
      {webglFailed ? (
        <canvas ref={fallbackCanvasRef} width={760} height={430} className="scene-fallback-canvas" />
      ) : (
        <div className="scene-viewport" ref={mountRef} />
      )}
      <div className="scene-caption">
        Oro traslúcido: cilindro activo ({platters * 2} pistas verticales) · Rojo: pista · Amarillo: sector · Arrastra para orbitar
      </div>
    </div>
  );
}
