import { useEffect, useRef } from 'react';
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

export default function DiskScene({ platters, selectedCylinder, selectedSector, rpm, spinning }: DiskSceneProps) {
  const mountRef = useRef<HTMLDivElement>(null);
  const sceneRef = useRef<THREE.Scene | null>(null);
  const spindleGroupRef = useRef<THREE.Group | null>(null);
  const armPivotRef = useRef<THREE.Group | null>(null);
  const dynamicGroupRef = useRef<THREE.Group | null>(null);
  const spinParamsRef = useRef({ rpm, spinning });
  const reducedMotion = useRef(window.matchMedia('(prefers-reduced-motion: reduce)').matches);

  useEffect(() => {
    spinParamsRef.current = { rpm, spinning };
  }, [rpm, spinning]);

  useEffect(() => {
    const mount = mountRef.current;
    if (!mount) return undefined;

    const scene = new THREE.Scene();
    scene.background = new THREE.Color('#10283c');
    scene.fog = new THREE.Fog('#10283c', 16, 34);

    const camera = new THREE.PerspectiveCamera(40, mount.clientWidth / Math.max(1, mount.clientHeight), 0.1, 100);
    camera.position.set(8.8, 6.8, 9.6);

    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: false });
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.setSize(mount.clientWidth, mount.clientHeight);
    mount.appendChild(renderer.domElement);

    const controls = new OrbitControls(camera, renderer.domElement);
    controls.enableDamping = true;
    controls.dampingFactor = 0.06;
    controls.minDistance = 6.5;
    controls.maxDistance = 22;

    scene.add(new THREE.AmbientLight('#dce7f0', 1.35));
    const keyLight = new THREE.DirectionalLight('#ffffff', 1.7);
    keyLight.position.set(7, 11, 6);
    scene.add(keyLight);
    const goldRim = new THREE.DirectionalLight('#c7a154', 0.85);
    goldRim.position.set(-8, 4, -6);
    scene.add(goldRim);

    // Chasis inferior
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

    sceneRef.current = scene;

    let raf = 0;
    let last = performance.now();
    const animate = (now: number) => {
      const dt = Math.min(0.05, (now - last) / 1000);
      last = now;
      if (!reducedMotion.current && spinParamsRef.current.spinning && spindleGroupRef.current) {
        // Escala didáctica suave proporcional a las RPM para distinguir sectores a simple vista
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
      camera.aspect = mountRef.current.clientWidth / Math.max(1, mountRef.current.clientHeight);
      camera.updateProjectionMatrix();
      renderer.setSize(mountRef.current.clientWidth, mountRef.current.clientHeight);
    };
    const observer = new ResizeObserver(onResize);
    observer.observe(mount);

    return () => {
      cancelAnimationFrame(raf);
      observer.disconnect();
      controls.dispose();
      renderer.dispose();
      mount.removeChild(renderer.domElement);
      scene.traverse((obj) => {
        const mesh = obj as THREE.Mesh;
        if (mesh.geometry) mesh.geometry.dispose();
        if (mesh.material) {
          if (Array.isArray(mesh.material)) mesh.material.forEach((m) => m.dispose());
          else mesh.material.dispose();
        }
      });
    };
  }, []);

  useEffect(() => {
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

    // Eje motor central (spindle)
    const hub = new THREE.Mesh(
      new THREE.CylinderGeometry(0.68, 0.68, totalHeight + 1.25, 32),
      new THREE.MeshStandardMaterial({ color: '#c7a154', roughness: 0.3, metalness: 0.65 }),
    );
    spindleGroup.add(hub);

    const sectorAngle = (Math.PI * 2) / SECTORS_VISUAL;

    for (let p = 0; p < safePlatters; p++) {
      const y = startY + p * spacing;

      // Plato magnético
      const disc = new THREE.Mesh(
        new THREE.CylinderGeometry(4.05, 4.05, 0.09, 64),
        new THREE.MeshStandardMaterial({ color: '#7d9db8', roughness: 0.25, metalness: 0.72 }),
      );
      disc.position.y = y;
      spindleGroup.add(disc);

      // Pistas concéntricas en cara superior
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

      // Divisiones radiales de sectores
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

      // Sector objetivo resaltado en el plato superior
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

    // Cilindro traslúcido 3D atravesando verticalmente todas las caras en la pista seleccionada
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

    // Actuador y peine de cabezales (2 cabezales por plato: cara superior e inferior)
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

    // Giro radial del peine de cabezales según el cilindro elegido (búsqueda / seek)
    const targetRotY = (cylIdx - 2) * 0.11;
    if (reducedMotion.current) {
      armPivot.rotation.y = targetRotY;
    } else {
      gsap.to(armPivot.rotation, { y: targetRotY, duration: 0.65, ease: 'power3.out' });
    }

    return undefined;
  }, [platters, selectedCylinder, selectedSector]);

  return (
    <div className="memory-scene disk-scene" aria-label="Escena 3D de geometría de disco duro magnético">
      <div ref={mountRef} />
      <div className="scene-caption">
        Oro traslúcido: cilindro activo ({platters * 2} pistas verticales) · Rojo: pista · Amarillo: sector · Arrastra para orbitar
      </div>
    </div>
  );
}
