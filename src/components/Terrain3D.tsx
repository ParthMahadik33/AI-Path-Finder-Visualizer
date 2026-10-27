import React, { useEffect, useRef } from 'react';
import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';
import { useAppStore } from '../store/appStore';
import { areCoordsEqual } from '../algorithms/helpers';
import { Camera } from 'lucide-react';

export const Terrain3D: React.FC = () => {
  const mountRef = useRef<HTMLDivElement>(null);
  const rows = useAppStore((s) => s.rows);
  const cols = useAppStore((s) => s.cols);
  const start = useAppStore((s) => s.start);
  const destination = useAppStore((s) => s.destination);
  const walls = useAppStore((s) => s.walls);
  const weights = useAppStore((s) => s.weights);
  const cellVisuals = useAppStore((s) => s.cellVisuals);
  const theme = useAppStore((s) => s.theme);

  const sceneRef = useRef<THREE.Scene | null>(null);
  const cameraRef = useRef<THREE.PerspectiveCamera | null>(null);
  const rendererRef = useRef<THREE.WebGLRenderer | null>(null);
  const controlsRef = useRef<OrbitControls | null>(null);
  const meshGroupRef = useRef<THREE.Group | null>(null);

  // Initialize Three.js scene
  useEffect(() => {
    const container = mountRef.current;
    if (!container) return;

    const width = container.clientWidth;
    const height = container.clientHeight;

    // Scene
    const scene = new THREE.Scene();
    scene.background = new THREE.Color(theme === 'dark' ? 0x121312 : 0xf6f5f0);
    sceneRef.current = scene;

    // Camera
    const camera = new THREE.PerspectiveCamera(45, width / height, 0.1, 1000);
    const maxDim = Math.max(rows, cols);
    camera.position.set(0, maxDim * 1.5, maxDim * 1.4);
    camera.lookAt(0, 0, 0);
    cameraRef.current = camera;

    // Renderer
    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: false });
    renderer.setSize(width, height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    container.appendChild(renderer.domElement);
    rendererRef.current = renderer;

    // Controls
    const controls = new OrbitControls(camera, renderer.domElement);
    controls.enableDamping = true;
    controls.dampingFactor = 0.05;
    controls.maxPolarAngle = Math.PI / 2 - 0.05; // prevent going below ground
    controls.minDistance = 5;
    controls.maxDistance = maxDim * 4;
    controlsRef.current = controls;

    // Lighting
    const ambientLight = new THREE.AmbientLight(0xffffff, theme === 'dark' ? 0.6 : 0.85);
    scene.add(ambientLight);

    const dirLight = new THREE.DirectionalLight(0xffffff, theme === 'dark' ? 1.0 : 1.2);
    dirLight.position.set(maxDim * 0.8, maxDim * 1.5, maxDim * 0.8);
    dirLight.castShadow = true;
    dirLight.shadow.mapSize.width = 1024;
    dirLight.shadow.mapSize.height = 1024;
    scene.add(dirLight);

    // Group for dynamic grid meshes
    const meshGroup = new THREE.Group();
    scene.add(meshGroup);
    meshGroupRef.current = meshGroup;

    // Resize observer
    const handleResize = () => {
      if (!container || !renderer || !camera) return;
      const w = container.clientWidth;
      const h = container.clientHeight;
      camera.aspect = w / h;
      camera.updateProjectionMatrix();
      renderer.setSize(w, h);
    };

    const resizeObserver = new ResizeObserver(handleResize);
    resizeObserver.observe(container);

    // Animation render loop
    let animId: number;
    const animate = () => {
      animId = requestAnimationFrame(animate);
      controls.update();
      renderer.render(scene, camera);
    };
    animate();

    return () => {
      cancelAnimationFrame(animId);
      resizeObserver.disconnect();
      controls.dispose();
      renderer.dispose();
      if (container.contains(renderer.domElement)) {
        container.removeChild(renderer.domElement);
      }
    };
  }, [theme, rows, cols]);

  // Update 3D tiles when grid or playback changes
  useEffect(() => {
    const meshGroup = meshGroupRef.current;
    if (!meshGroup) return;

    // Clean previous children
    while (meshGroup.children.length > 0) {
      const child = meshGroup.children[0] as THREE.Mesh;
      if (child.geometry) child.geometry.dispose();
      if (child.material) {
        if (Array.isArray(child.material)) {
          child.material.forEach((m) => m.dispose());
        } else {
          child.material.dispose();
        }
      }
      meshGroup.remove(child);
    }

    const spacing = 1.05;
    const offsetX = (cols * spacing) / 2 - spacing / 2;
    const offsetZ = (rows * spacing) / 2 - spacing / 2;

    const isDark = theme === 'dark';

    // Materials
    const floorMat = new THREE.MeshStandardMaterial({
      color: isDark ? 0x1d201d : 0xffffff,
      roughness: 0.8
    });
    const wallMat = new THREE.MeshStandardMaterial({
      color: isDark ? 0x0a0b0a : 0x191a18,
      roughness: 0.4
    });
    const exploredMat = new THREE.MeshStandardMaterial({
      color: isDark ? 0x334958 : 0x8fa6b2,
      roughness: 0.5
    });
    const frontierMat = new THREE.MeshStandardMaterial({
      color: isDark ? 0x1e3a5f : 0xbae6fd,
      roughness: 0.4
    });
    const pathMat = new THREE.MeshStandardMaterial({
      color: 0xf0442d,
      roughness: 0.2,
      emissive: 0x661108
    });
    const weightMat = new THREE.MeshStandardMaterial({
      color: isDark ? 0x3d3728 : 0xd4c9a8,
      roughness: 0.9
    });
    const startMat = new THREE.MeshStandardMaterial({
      color: 0x2563eb,
      roughness: 0.3,
      emissive: 0x0d2861
    });
    const destMat = new THREE.MeshStandardMaterial({
      color: 0x15803d,
      roughness: 0.3,
      emissive: 0x053614
    });

    const boxGeo = new THREE.BoxGeometry(1, 1, 1);

    for (let r = 0; r < rows; r++) {
      for (let c = 0; c < cols; c++) {
        const x = c * spacing - offsetX;
        const z = r * spacing - offsetZ;

        const isStart = areCoordsEqual({ r, c }, start);
        const isDest = areCoordsEqual({ r, c }, destination);
        const isWall = walls[r][c];
        const isWeight = weights[r][c] > 1;
        const cellVisual = cellVisuals[r][c];

        let height = 0.15;
        let mat = floorMat;

        if (isStart) {
          height = 2.0;
          mat = startMat;
        } else if (isDest) {
          height = 2.0;
          mat = destMat;
        } else if (cellVisual === 'path') {
          height = 0.85;
          mat = pathMat;
        } else if (cellVisual === 'explored') {
          height = 0.4;
          mat = exploredMat;
        } else if (cellVisual === 'frontier') {
          height = 0.55;
          mat = frontierMat;
        } else if (isWall) {
          height = 1.8;
          mat = wallMat;
        } else if (isWeight) {
          height = 0.25;
          mat = weightMat;
        }

        const mesh = new THREE.Mesh(boxGeo, mat);
        mesh.scale.set(1, height, 1);
        mesh.position.set(x, height / 2, z);
        mesh.castShadow = isWall || isStart || isDest;
        mesh.receiveShadow = true;

        meshGroup.add(mesh);
      }
    }
  }, [rows, cols, start, destination, walls, weights, cellVisuals, theme]);

  const resetCamera = () => {
    if (!cameraRef.current || !controlsRef.current) return;
    const maxDim = Math.max(rows, cols);
    cameraRef.current.position.set(0, maxDim * 1.5, maxDim * 1.4);
    controlsRef.current.target.set(0, 0, 0);
    controlsRef.current.update();
  };

  return (
    <div className="relative w-full h-full min-h-[500px] bg-[#F6F5F0] dark:bg-[#121312] overflow-hidden select-none">
      <div ref={mountRef} className="w-full h-full min-h-[500px]" />

      {/* Floating 3D Controls Overlay */}
      <div className="absolute top-4 right-4 flex items-center gap-2 bg-white/80 dark:bg-[#1A1C1A]/80 backdrop-blur-xs p-1.5 rounded-md border border-[#DEDED5] dark:border-[#2E322E] shadow-sm font-mono-tech text-xs">
        <button
          onClick={resetCamera}
          className="flex items-center gap-1.5 px-2.5 py-1.5 bg-[#EEEEE8] dark:bg-[#232623] hover:bg-[#E5E5DD] dark:hover:bg-[#2D302D] text-[#191A18] dark:text-[#EDEDE8] rounded transition-colors"
          title="Reset 3D Camera Position"
        >
          <Camera className="w-3.5 h-3.5 text-[#F0442D]" />
          <span>Reset Camera</span>
        </button>

        <span className="text-[10px] text-[#73746D] dark:text-[#9A9C94] px-1 hidden sm:inline">
          Orbit: Drag • Zoom: Scroll
        </span>
      </div>
    </div>
  );
};
