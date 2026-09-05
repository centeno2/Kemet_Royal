import {
  Component,
  Suspense,
  useEffect,
  useLayoutEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import { ContactShadows, OrbitControls, useGLTF } from "@react-three/drei";
import * as THREE from "three";
import {
  Maximize2,
  Minimize2,
  MoveHorizontal,
  Pause,
  RotateCcw,
  RotateCw,
} from "lucide-react";
import { useReducedMotion } from "../hooks";

const configurations = {
  temple: { camera: [7, 6.5, 10], target: [0, 0.45, 0], size: 7.6 },
  statue: { camera: [0.4, 2.8, 8.7], target: [0, 2, 0], size: 4.4 },
  eye: { camera: [0, 1.9, 8], target: [0, 1.9, 0], size: 4.5 },
  pyramid: { camera: [5, 4, 7], target: [0, 1.4, 0], size: 4.7 },
  papyrus: { camera: [0, 6.7, 5], target: [0, 0, 0], size: 5.2 },
};

class SceneBoundary extends Component {
  state = { failed: false };
  static getDerivedStateFromError() {
    return { failed: true };
  }
  render() {
    return this.state.failed ? this.props.fallback : this.props.children;
  }
}

function Artifact({ model, reveal, onReady }) {
  const { scene } = useGLTF(`/models/${model}.glb`);
  const clippingPlane = useMemo(
    () => new THREE.Plane(new THREE.Vector3(0, -1, 0), 100),
    [],
  );
  const { object, height, materials } = useMemo(() => {
    const object = scene.clone(true);
    const bounds = new THREE.Box3().setFromObject(object);
    const dimensions = bounds.getSize(new THREE.Vector3());
    const center = bounds.getCenter(new THREE.Vector3());
    const scale =
      configurations[model].size /
      Math.max(dimensions.x, dimensions.y, dimensions.z);
    object.scale.multiplyScalar(scale);
    object.position.set(
      -center.x * scale,
      -bounds.min.y * scale,
      -center.z * scale,
    );
    const materials = [];
    object.traverse((child) => {
      if (!child.isMesh) return;
      const cloneMaterial = (material) => {
        const next = material.clone();
        next.clippingPlanes = [clippingPlane];
        next.side = THREE.DoubleSide;
        materials.push(next);
        return next;
      };
      child.material = Array.isArray(child.material)
        ? child.material.map(cloneMaterial)
        : cloneMaterial(child.material);
    });
    return { object, height: dimensions.y * scale, materials };
  }, [scene, model, clippingPlane]);
  useLayoutEffect(() => {
    clippingPlane.constant =
      reveal == null ? height + 0.2 : Math.max(0.025, reveal) * (height + 0.12);
    // Initialize the cut before the first frame; subsequent scroll changes are interpolated.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [object, height, clippingPlane]);
  useEffect(() => {
    onReady();
    return () => materials.forEach((material) => material.dispose());
  }, [onReady, materials]);
  useFrame((_, delta) => {
    const target =
      reveal == null ? height + 0.2 : Math.max(0.025, reveal) * (height + 0.12);
    clippingPlane.constant = THREE.MathUtils.damp(
      clippingPlane.constant,
      target,
      7,
      Math.min(delta, 0.1),
    );
  });
  return <primitive object={object} />;
}

function StaticPoster({ model, label, onFallback }) {
  useEffect(() => {
    onFallback();
  }, [onFallback]);
  return (
    <div className="model-fallback">
      <img src={`/models/${model}-poster.webp`} alt={label} />
      <span>Vista del modelo · Exploración 3D no disponible</span>
    </div>
  );
}

export default function ModelViewer({
  model = "temple",
  className = "",
  construction,
  dark = false,
  label = "Modelo 3D interactivo",
  controls = true,
}) {
  const container = useRef(null);
  const orbit = useRef(null);
  const [visible, setVisible] = useState(false);
  const [activated, setActivated] = useState(false);
  const [loadedModel, setLoadedModel] = useState("");
  const [failedModel, setFailedModel] = useState("");
  const [rotating, setRotating] = useState(false);
  const [full, setFull] = useState(false);
  const reduced = useReducedMotion();
  const config = configurations[model];
  const loaded = loadedModel === model;
  const ready = useMemo(() => () => setLoadedModel(model), [model]);
  const fallbackReady = useMemo(
    () => () => {
      setLoadedModel(model);
      setFailedModel(model);
    },
    [model],
  );

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        setVisible(entry.isIntersecting);
        if (entry.isIntersecting) setActivated(true);
      },
      { rootMargin: "180px" },
    );
    if (container.current) observer.observe(container.current);
    return () => observer.disconnect();
  }, []);
  useEffect(() => {
    setRotating(false);
  }, [model]);
  useEffect(() => {
    const change = () =>
      setFull(document.fullscreenElement === container.current);
    document.addEventListener("fullscreenchange", change);
    return () => document.removeEventListener("fullscreenchange", change);
  }, []);

  async function toggleFullscreen() {
    try {
      if (document.fullscreenElement) await document.exitFullscreen();
      else await container.current.requestFullscreen();
    } catch {
      /* The browser may not support fullscreen; inline exploration remains available. */
    }
  }

  const poster = (
    <StaticPoster model={model} label={label} onFallback={fallbackReady} />
  );
  return (
    <div
      ref={container}
      className={`model-viewer ${dark ? "model-viewer--dark" : ""} ${className}`}
      role="group"
      aria-label={label}
    >
      {!loaded && (
        <div className="model-loading" aria-live="polite">
          <img src={`/models/${model}-poster.webp`} alt="" />
          <span>
            <i /> Preparando tu recorrido 3D
          </span>
        </div>
      )}
      {activated && (
        <SceneBoundary key={model} fallback={poster}>
          <Canvas
            key={model}
            camera={{ position: config.camera, fov: 34, near: 0.1, far: 100 }}
            dpr={[1, 1.5]}
            frameloop={
              !visible
                ? "never"
                : rotating || (construction != null && !reduced)
                  ? "always"
                  : "demand"
            }
            gl={{ antialias: true, alpha: true, powerPreference: "low-power" }}
            onCreated={({ gl }) => {
              gl.localClippingEnabled = true;
              gl.setClearColor(0x000000, 0);
            }}
            fallback={<img src={`/models/${model}-poster.webp`} alt={label} />}
          >
            <ambientLight intensity={1.65} />
            <hemisphereLight args={["#fff4d8", "#b2ad93", 1.5]} />
            <directionalLight
              position={[3, 8, 5]}
              intensity={2.8}
              color="#fff5df"
            />
            <directionalLight
              position={[-4, 3, -2]}
              intensity={1.0}
              color="#dce8e5"
            />
            <Suspense fallback={null}>
              <Artifact
                model={model}
                reveal={reduced ? undefined : construction}
                onReady={ready}
              />
              <ContactShadows
                position={[0, -0.015, 0]}
                opacity={dark ? 0.38 : 0.25}
                scale={15}
                blur={3}
                far={6}
                resolution={256}
                frames={1}
                color={dark ? "#071c1c" : "#716448"}
              />
            </Suspense>
            <OrbitControls
              ref={orbit}
              target={config.target}
              enablePan={false}
              enableZoom={false}
              autoRotate={rotating && !reduced}
              autoRotateSpeed={0.7}
              minPolarAngle={0.25}
              maxPolarAngle={Math.PI / 2.05}
              onStart={() => setRotating(false)}
              touches={{
                ONE: THREE.TOUCH.ROTATE,
                TWO: THREE.TOUCH.DOLLY_ROTATE,
              }}
            />
          </Canvas>
        </SceneBoundary>
      )}
      {controls && failedModel !== model && (
        <div className="viewer-toolbar">
          <span className="viewer-hint">
            <MoveHorizontal size={15} /> Arrastra para explorar
          </span>
          <div className="viewer-buttons">
            {!reduced && (
              <button
                type="button"
                aria-label={rotating ? "Pausar rotación" : "Girar modelo"}
                aria-pressed={rotating}
                onClick={() => setRotating(!rotating)}
              >
                {rotating ? <Pause size={16} /> : <RotateCw size={16} />}
              </button>
            )}
            <button
              type="button"
              aria-label="Restablecer vista 3D"
              onClick={() => {
                orbit.current?.reset();
                setRotating(false);
              }}
            >
              <RotateCcw size={15} />
            </button>
            {document.fullscreenEnabled && (
              <button
                type="button"
                aria-label={
                  full
                    ? "Salir de pantalla completa"
                    : "Ver modelo a pantalla completa"
                }
                onClick={toggleFullscreen}
              >
                {full ? <Minimize2 size={15} /> : <Maximize2 size={15} />}
              </button>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
