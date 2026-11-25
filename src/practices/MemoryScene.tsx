import { useEffect, useRef, useState } from 'react';
import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';
import gsap from 'gsap';

interface MemorySceneProps {
  groups: number;
  chipsPerGroup: number;
  selectedGroup: number;
}

function drawFallbackMemory2D(
  canvas: HTMLCanvasElement,
  groups: number,
  chipsPerGroup: number,
  selectedGroup: number,
  yaw: number,
) {
  const ctx = canvas.getContext('2d');
  if (!ctx) return;
  const w = canvas.width;
  const h = canvas.height;
  ctx.clearRect(0, 0, w, h);
  ctx.fillStyle = '#10283c';
  ctx.fillRect(0, 0, w, h);

  const safeGroups = Math.max(1, Math.min(groups, 12));
  const safeChips = Math.max(1, Math.min(chipsPerGroup, 12));
  const cos = Math.cos(yaw);
  const sin = Math.sin(yaw);
  const scale = Math.min(w, h) * 0.045;

  const project = (x: number, y: number, z: number): [number, number] => {
    const rx = x * cos - z * sin;
    const rz = x * sin + z * cos;
    const sx = w * 0.52 + rx * scale;
    const sy = h * 0.56 - y * scale + rz * scale * 0.52;
    return [sx, sy];
  };

  const drawIsoBox = (cx: number, cy: number, cz: number, bw: number, bh: number, bd: number, top: string, side: string, stroke: string) => {
    const hx = bw / 2;
    const hy = bh / 2;
    const hz = bd / 2;
    const p = [
      project(cx - hx, cy + hy, cz - hz),
      project(cx + hx, cy + hy, cz - hz),
      project(cx + hx, cy + hy, cz + hz),
      project(cx - hx, cy + hy, cz + hz),
      project(cx - hx, cy - hy, cz + hz),
      project(cx + hx, cy - hy, cz + hz),
      project(cx + hx, cy - hy, cz - hz),
    ];
    // Top face
    ctx.beginPath();
    ctx.moveTo(p[0][0], p[0][1]);
    ctx.lineTo(p[1][0], p[1][1]);
    ctx.lineTo(p[2][0], p[2][1]);
    ctx.lineTo(p[3][0], p[3][1]);
    ctx.closePath();
    ctx.fillStyle = top;
    ctx.fill();
    ctx.strokeStyle = stroke;
    ctx.lineWidth = 1.2;
    ctx.stroke();

    // Front face
    ctx.beginPath();
    ctx.moveTo(p[3][0], p[3][1]);
    ctx.lineTo(p[2][0], p[2][1]);
    ctx.lineTo(p[5][0], p[5][1]);
    ctx.lineTo(p[4][0], p[4][1]);
    ctx.closePath();
    ctx.fillStyle = side;
    ctx.fill();
    ctx.stroke();

    // Right face
    ctx.beginPath();
    ctx.moveTo(p[2][0], p[2][1]);
    ctx.lineTo(p[1][0], p[1][1]);
    ctx.lineTo(p[6][0], p[6][1]);
    ctx.lineTo(p[5][0], p[5][1]);
    ctx.closePath();
    ctx.fillStyle = side;
    ctx.fill();
    ctx.stroke();
  };

  // Placa base
  drawIsoBox(0, -0.25, 0, 15, 0.4, 10, '#183a56', '#11293e', '#2f5d80');
  // Decodificador
  drawIsoBox(-6.4, 0.55, 0, 1.4, 1.2, 1.8, '#dfc07c', '#b38d42', '#fff3d1');

  for (let g = 0; g < safeGroups; g++) {
    const z = -3.8 + (g / Math.max(1, safeGroups - 1)) * 7.6;
    const isSel = g === selectedGroup;
    // Línea de selección desde el decodificador
    const [dx, dy] = project(-5.6, 0.4, 0);
    const [gx, gy] = project(-4.4, 0.2, z);
    ctx.beginPath();
    ctx.moveTo(dx, dy);
    ctx.lineTo(gx, gy);
    ctx.strokeStyle = isSel ? '#f3c669' : '#2d5270';
    ctx.lineWidth = isSel ? 2.4 : 1;
    ctx.stroke();

    for (let c = 0; c < safeChips; c++) {
      const x = -3.6 + (c / Math.max(1, safeChips - 1)) * 8.2;
      drawIsoBox(
        x,
        0.35,
        z,
        Math.min(1.05, 7.2 / safeChips),
        0.55,
        Math.min(0.85, 6.2 / safeGroups),
        isSel ? '#d45a47' : '#6b8fae',
        isSel ? '#963426' : '#436480',
        isSel ? '#ffd7cf' : '#10283c',
      );
    }
  }
}

export default function MemoryScene({ groups, chipsPerGroup, selectedGroup }: MemorySceneProps) {
  const mountRef = useRef<HTMLDivElement>(null);
  const sceneRef = useRef<THREE.Scene | null>(null);
  const cameraRef = useRef<THREE.PerspectiveCamera | null>(null);
  const rendererRef = useRef<THREE.WebGLRenderer | null>(null);
  const controlsRef = useRef<OrbitControls | null>(null);
  const groupMeshes = useRef<THREE.Group[]>([]);
  const reducedMotion = useRef(window.matchMedia('(prefers-reduced-motion: reduce)').matches);
  const [webglFailed, setWebglFailed] = useState(false);
  const fallbackCanvasRef = useRef<HTMLCanvasElement>(null);
  const [yaw, setYaw] = useState(0.62);

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
    scene.fog = new THREE.Fog('#10283c', 18, 36);

    const camera = new THREE.PerspectiveCamera(42, width / height, 0.1, 100);
    camera.position.set(11, 7.2, 13);
    camera.lookAt(0, 0, 0);

    renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));
    renderer.setSize(width, height);
    renderer.shadowMap.enabled = true;
    mount.innerHTML = '';
    mount.appendChild(renderer.domElement);

    const controls = new OrbitControls(camera, renderer.domElement);
    controls.enableDamping = true;
    controls.dampingFactor = 0.06;
    controls.minDistance = 7;
    controls.maxDistance = 26;

    scene.add(new THREE.AmbientLight('#d7e4ee', 1.4));
    const key = new THREE.DirectionalLight('#ffffff', 1.7);
    key.position.set(8, 12, 6);
    key.castShadow = true;
    scene.add(key);
    const rim = new THREE.DirectionalLight('#c7a154', 0.75);
    rim.position.set(-9, 3, -7);
    scene.add(rim);

    const board = new THREE.Mesh(
      new THREE.BoxGeometry(16, 0.35, 10),
      new THREE.MeshStandardMaterial({ color: '#173650', roughness: 0.55, metalness: 0.12 }),
    );
    board.receiveShadow = true;
    scene.add(board);

    const grid = new THREE.GridHelper(16, 16, '#2b5272', '#1d3d59');
    grid.position.y = 0.18;
    scene.add(grid);

    const decoder = new THREE.Mesh(
      new THREE.BoxGeometry(1.3, 1.1, 1.2),
      new THREE.MeshStandardMaterial({ color: '#c7a154', roughness: 0.35, metalness: 0.4 }),
    );
    decoder.position.set(-7, 0.8, 0);
    decoder.castShadow = true;
    scene.add(decoder);

    const label = new THREE.Mesh(
      new THREE.BoxGeometry(0.14, 0.7, 0.14),
      new THREE.MeshStandardMaterial({ color: '#b84635' }),
    );
    label.position.set(-6.25, 0.6, 0);
    scene.add(label);

    sceneRef.current = scene;
    cameraRef.current = camera;
    rendererRef.current = renderer;
    controlsRef.current = controls;

    let raf = 0;
    const render = () => {
      controls.update();
      renderer.render(scene, camera);
      raf = requestAnimationFrame(render);
    };
    render();

    const resize = () => {
      if (!mountRef.current) return;
      const nw = Math.max(260, mountRef.current.clientWidth || 640);
      const nh = Math.max(320, mountRef.current.clientHeight || 430);
      camera.aspect = nw / nh;
      camera.updateProjectionMatrix();
      renderer.setSize(nw, nh);
    };
    const observer = new ResizeObserver(resize);
    observer.observe(mount);

    return () => {
      cancelAnimationFrame(raf);
      observer.disconnect();
      controls.dispose();
      renderer.dispose();
      if (renderer.domElement.parentNode === mount) {
        mount.removeChild(renderer.domElement);
      }
      scene.traverse((object) => {
        const mesh = object as THREE.Mesh;
        if (mesh.geometry) mesh.geometry.dispose();
        if (mesh.material) {
          if (Array.isArray(mesh.material)) mesh.material.forEach((material) => material.dispose());
          else mesh.material.dispose();
        }
      });
    };
  }, [webglFailed]);

  useEffect(() => {
    if (webglFailed) {
      if (fallbackCanvasRef.current) {
        drawFallbackMemory2D(fallbackCanvasRef.current, groups, chipsPerGroup, selectedGroup, yaw);
      }
      return undefined;
    }
    const scene = sceneRef.current;
    if (!scene) return undefined;

    const chips: THREE.Group[] = [];
    const safeGroups = Math.max(1, Math.min(groups, 12));
    const safeChips = Math.max(1, Math.min(chipsPerGroup, 12));
    const groupWidth = 1.25;
    const boardWidth = Math.max(8, safeChips * groupWidth + 1);
    const groupZ = (index: number) => (safeGroups === 1 ? 0 : -3.8 + (index / (safeGroups - 1)) * 7.6);
    const chipX = (index: number) => -boardWidth / 2 + 1.2 + index * 1.1;

    for (let group = 0; group < safeGroups; group++) {
      const groupMesh = new THREE.Group();
      groupMesh.position.set(0, 0.35, groupZ(group));
      const selected = group === selectedGroup;
      for (let chip = 0; chip < safeChips; chip++) {
        const mesh = new THREE.Mesh(
          new THREE.BoxGeometry(0.95, 0.45, 0.72),
          new THREE.MeshStandardMaterial({
            color: selected ? '#b84635' : '#6b8fae',
            roughness: 0.38,
            metalness: 0.22,
            emissive: selected ? '#963426' : '#10283c',
            emissiveIntensity: selected ? 0.38 : 0,
          }),
        );
        mesh.position.set(chipX(chip), 0.22, 0);
        mesh.castShadow = true;
        groupMesh.add(mesh);
      }
      const base = new THREE.Mesh(
        new THREE.BoxGeometry(safeChips * 1.1 + 0.3, 0.08, 0.92),
        new THREE.MeshStandardMaterial({ color: selected ? '#c7a154' : '#244a69', roughness: 0.7 }),
      );
      base.position.set(chipX((safeChips - 1) / 2), -0.04, 0);
      groupMesh.add(base);
      scene.add(groupMesh);
      chips.push(groupMesh);
    }

    groupMeshes.current.forEach((oldGroup) => scene.remove(oldGroup));
    groupMeshes.current = chips;

    const camera = cameraRef.current;
    if (camera && !reducedMotion.current) {
      gsap.to(camera.position, { x: 10 + safeGroups * 0.15, y: 6.8, z: 12.5, duration: 0.8, ease: 'power3.out' });
    }

    return () => {
      chips.forEach((group) => {
        group.traverse((object) => {
          const mesh = object as THREE.Mesh;
          if (mesh.geometry) mesh.geometry.dispose();
          if (mesh.material) {
            if (Array.isArray(mesh.material)) mesh.material.forEach((material) => material.dispose());
            else mesh.material.dispose();
          }
        });
        scene.remove(group);
      });
    };
  }, [groups, chipsPerGroup, selectedGroup, webglFailed, yaw]);

  return (
    <div className="memory-scene" aria-label="Escena 3D de ampliación de memoria">
      {webglFailed ? (
        <canvas
          ref={fallbackCanvasRef}
          width={760}
          height={430}
          className="scene-fallback-canvas"
          onPointerMove={(e) => {
            if (e.buttons === 1) setYaw((y) => y + e.movementX * 0.01);
          }}
        />
      ) : (
        <div className="scene-viewport" ref={mountRef} />
      )}
      <div className="scene-caption">Arrastra para orbitar · Dorado: decodificador · Rojo: banco seleccionado</div>
    </div>
  );
}
