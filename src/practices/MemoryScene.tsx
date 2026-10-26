import { useEffect, useRef } from 'react';
import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';
import gsap from 'gsap';

interface MemorySceneProps {
  groups: number;
  chipsPerGroup: number;
  selectedGroup: number;
}

export default function MemoryScene({ groups, chipsPerGroup, selectedGroup }: MemorySceneProps) {
  const mountRef = useRef<HTMLDivElement>(null);
  const sceneRef = useRef<THREE.Scene | null>(null);
  const cameraRef = useRef<THREE.PerspectiveCamera | null>(null);
  const rendererRef = useRef<THREE.WebGLRenderer | null>(null);
  const controlsRef = useRef<OrbitControls | null>(null);
  const groupMeshes = useRef<THREE.Group[]>([]);
  const selectedRef = useRef(selectedGroup);
  const reducedMotion = useRef(window.matchMedia('(prefers-reduced-motion: reduce)').matches);

  useEffect(() => {
    const mount = mountRef.current;
    if (!mount) return undefined;
    const scene = new THREE.Scene();
    scene.background = new THREE.Color('#10283c');
    scene.fog = new THREE.Fog('#10283c', 18, 34);
    const camera = new THREE.PerspectiveCamera(42, mount.clientWidth / mount.clientHeight, 0.1, 100);
    camera.position.set(11, 7, 13);
    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: false });
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.setSize(mount.clientWidth, mount.clientHeight);
    renderer.shadowMap.enabled = true;
    mount.appendChild(renderer.domElement);
    const controls = new OrbitControls(camera, renderer.domElement);
    controls.enableDamping = true;
    controls.dampingFactor = 0.06;
    controls.minDistance = 8;
    controls.maxDistance = 26;
    scene.add(new THREE.AmbientLight('#d7e4ee', 1.3));
    const key = new THREE.DirectionalLight('#ffffff', 1.6);
    key.position.set(8, 12, 6);
    key.castShadow = true;
    scene.add(key);
    const rim = new THREE.DirectionalLight('#c7a154', .6);
    rim.position.set(-9, 3, -7);
    scene.add(rim);

    const board = new THREE.Mesh(new THREE.BoxGeometry(16, .35, 10), new THREE.MeshStandardMaterial({ color: '#173650', roughness: .55, metalness: .12 }));
    board.receiveShadow = true;
    scene.add(board);
    const grid = new THREE.GridHelper(16, 16, '#23405a', '#18354e');
    grid.position.y = .18;
    scene.add(grid);
    const decoder = new THREE.Mesh(new THREE.BoxGeometry(1.3, 1.1, .8), new THREE.MeshStandardMaterial({ color: '#c7a154', roughness: .35, metalness: .4 }));
    decoder.position.set(-7, .8, 0);
    decoder.castShadow = true;
    scene.add(decoder);
    const label = new THREE.Mesh(new THREE.BoxGeometry(.1, .7, .1), new THREE.MeshStandardMaterial({ color: '#b84635' }));
    label.position.set(-6.3, .6, 0);
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
      camera.aspect = mountRef.current.clientWidth / mountRef.current.clientHeight;
      camera.updateProjectionMatrix();
      renderer.setSize(mountRef.current.clientWidth, mountRef.current.clientHeight);
    };
    const observer = new ResizeObserver(resize);
    observer.observe(mount);

    return () => {
      cancelAnimationFrame(raf);
      observer.disconnect();
      controls.dispose();
      renderer.dispose();
      mount.removeChild(renderer.domElement);
      scene.traverse((object) => {
        const mesh = object as THREE.Mesh;
        if (mesh.geometry) mesh.geometry.dispose();
        if (mesh.material) {
          if (Array.isArray(mesh.material)) mesh.material.forEach((material) => material.dispose());
          else mesh.material.dispose();
        }
      });
    };
  }, []);

  useEffect(() => {
    const scene = sceneRef.current;
    if (!scene) return;
    const chips: THREE.Group[] = [];
    const safeGroups = Math.max(1, Math.min(groups, 12));
    const safeChips = Math.max(1, Math.min(chipsPerGroup, 12));
    const groupWidth = 1.25;
    const boardWidth = Math.max(8, safeGroups * groupWidth + 1);
    const groupZ = (index: number) => -4 + (index / Math.max(1, safeGroups - 1)) * 8;
    const chipX = (index: number) => -boardWidth / 2 + .8 + index * 1.1;
    for (let group = 0; group < safeGroups; group++) {
      const groupMesh = new THREE.Group();
      groupMesh.position.set(0, .35, groupZ(group));
      const selected = group === selectedGroup;
      for (let chip = 0; chip < safeChips; chip++) {
        const mesh = new THREE.Mesh(new THREE.BoxGeometry(.95, .4, .7), new THREE.MeshStandardMaterial({ color: selected ? '#b84635' : '#6b8fae', roughness: .38, metalness: .22, emissive: selected ? '#963426' : '#10283c', emissiveIntensity: selected ? .35 : 0 }));
        mesh.position.set(chipX(chip), .2, 0);
        mesh.castShadow = true;
        groupMesh.add(mesh);
      }
      const base = new THREE.Mesh(new THREE.BoxGeometry(safeChips * 1.1 + .2, .08, .9), new THREE.MeshStandardMaterial({ color: selected ? '#c7a154' : '#244a69', roughness: .7 }));
      base.position.set(safeChips * .5 + .05, -.05, 0);
      groupMesh.add(base);
      scene.add(groupMesh);
      chips.push(groupMesh);
    }
    groupMeshes.current.forEach((oldGroup) => scene.remove(oldGroup));
    groupMeshes.current = chips;
    selectedRef.current = selectedGroup;
    const camera = cameraRef.current;
    if (camera && !reducedMotion.current) {
      gsap.to(camera.position, { x: 10 + safeGroups * .15, y: 6.5, z: 12.5, duration: .9, ease: 'power3.out' });
      gsap.to(camera, { duration: .9, onUpdate: () => camera.lookAt(0, 0, groupZ(selectedGroup)) });
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
  }, [groups, chipsPerGroup, selectedGroup]);

  return (
    <div className="memory-scene" aria-label="Escena 3D de ampliación de memoria">
      <div ref={mountRef} />
      <div className="scene-caption">Arrastra para orbitar · grupos seleccionados por el decodificador</div>
      <noscript>La escena 3D requiere JavaScript; la tabla inferior resume la configuración.</noscript>
    </div>
  );
}
