import {
  Component,
  Suspense,
  useEffect,
  useRef,
  useState,
  type ReactNode,
} from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import { OrbitControls, useTexture } from "@react-three/drei";
import * as THREE from "three";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
gsap.registerPlugin(ScrollTrigger);
function Dumbbell({
  reduced,
  scroll,
}: {
  reduced: boolean;
  scroll: React.RefObject<{ value: number }>;
}) {
  const group = useRef<THREE.Group>(null);
  useFrame(({ clock }) => {
    if (!group.current) return;
    group.current.rotation.y =
      -0.62 +
      scroll.current.value * 0.35 +
      (reduced ? 0 : Math.sin(clock.elapsedTime * 0.24) * 0.16);
    group.current.rotation.z = -0.36 + scroll.current.value * 0.12;
  });
  return (
    <group ref={group} rotation={[0.18, -0.62, -0.36]} scale={0.93}>
      <mesh rotation={[0, 0, Math.PI / 2]}>
        <cylinderGeometry args={[0.13, 0.13, 2.28, 32]} />
        <meshStandardMaterial
          color="#abb0b9"
          roughness={0.25}
          metalness={0.85}
        />
      </mesh>
      {Array.from({ length: 19 }, (_, i) => (
        <mesh
          key={i}
          position={[(i - 9) * 0.09, 0, 0]}
          rotation={[0, Math.PI / 2, 0]}
        >
          <torusGeometry args={[0.133, 0.009, 6, 28]} />
          <meshStandardMaterial
            color="#50545f"
            roughness={0.6}
            metalness={0.6}
          />
        </mesh>
      ))}
      {[-1, 1].map((side) => (
        <group key={side}>
          <mesh position={[side * 1.16, 0, 0]} rotation={[0, 0, Math.PI / 2]}>
            <cylinderGeometry args={[0.35, 0.35, 0.18, 40]} />
            <meshStandardMaterial
              color="#d52235"
              roughness={0.3}
              metalness={0.55}
            />
          </mesh>
          {[
            [1.36, 0.96, 0.28],
            [1.68, 1.02, 0.28],
            [2.0, 0.94, 0.28],
            [2.25, 0.72, 0.19],
          ].map(([x, radius, width]) => (
            <group
              key={x}
              position={[side * x, 0, 0]}
              rotation={[0, 0, Math.PI / 2]}
            >
              <mesh>
                <cylinderGeometry args={[radius, radius, width, 64]} />
                <meshStandardMaterial
                  color="#717985"
                  roughness={0.28}
                  metalness={0.85}
                />
              </mesh>
              <mesh>
                <cylinderGeometry
                  args={[radius * 0.88, radius * 0.88, width + 0.014, 64]}
                />
                <meshStandardMaterial
                  color="#242832"
                  roughness={0.46}
                  metalness={0.65}
                />
              </mesh>
            </group>
          ))}
          <mesh
            position={[side * 2.355, 0, 0]}
            rotation={[0, (side * Math.PI) / 2, 0]}
          >
            <ringGeometry args={[0.57, 0.59, 64]} />
            <meshStandardMaterial
              color="#ffcf5c"
              roughness={0.36}
              metalness={0.65}
            />
          </mesh>
          <Suspense fallback={null}>
            <DumbbellEmblem side={side} />
          </Suspense>
        </group>
      ))}
    </group>
  );
}
function DumbbellEmblem({ side }: { side: number }) {
  const emblem = useTexture("/brand/lmq-icon.png");
  return (
    <mesh
      position={[side * 2.36, 0, 0]}
      rotation={[0, (side * Math.PI) / 2, 0]}
    >
      <planeGeometry args={[0.88, 0.88]} />
      <meshBasicMaterial
        map={emblem}
        transparent
        alphaTest={0.02}
        toneMapped={false}
      />
    </mesh>
  );
}
export default function PerformanceScene() {
  const host = useRef<HTMLDivElement>(null);
  const scroll = useRef({ value: 0 });
  const [visible, setVisible] = useState(true);
  const [interactive, setInteractive] = useState(false);
  const [reduced, setReduced] = useState(
    () => matchMedia("(prefers-reduced-motion: reduce)").matches,
  );
  const [supported] = useState(() => {
    try {
      const c = document.createElement("canvas");
      const gl = c.getContext("webgl2");
      if (!gl) return false;
      gl.getExtension("WEBGL_lose_context")?.loseContext();
      return true;
    } catch {
      return false;
    }
  });
  useEffect(() => {
    const media = matchMedia("(prefers-reduced-motion: reduce)");
    const changed = () => setReduced(media.matches);
    media.addEventListener("change", changed);
    const observer = new IntersectionObserver(
      ([entry]) => setVisible(entry.isIntersecting),
      { rootMargin: "150px" },
    );
    if (host.current) observer.observe(host.current);
    const page = () =>
      setVisible(
        document.visibilityState === "visible" &&
          !!host.current &&
          host.current.getBoundingClientRect().bottom > 0,
      );
    document.addEventListener("visibilitychange", page);
    const tween = gsap.to(scroll.current, {
      value: 1,
      ease: "none",
      scrollTrigger: {
        trigger: document.documentElement,
        start: "top top",
        end: "bottom bottom",
        scrub: 1,
      },
    });
    return () => {
      media.removeEventListener("change", changed);
      observer.disconnect();
      document.removeEventListener("visibilitychange", page);
      tween.scrollTrigger?.kill();
      tween.kill();
    };
  }, []);
  return (
    <div ref={host} className="performance-scene">
      <SceneBoundary>
        {supported ? (
          <>
            <Canvas
              onCreated={() => setInteractive(true)}
              role={interactive ? "img" : undefined}
              aria-label={
                interactive ? "Interactive 3D LMQ dumbbell" : undefined
              }
              dpr={[1, 1.5]}
              camera={{ position: [0, 0, 7], fov: 43 }}
              frameloop={visible && !reduced ? "always" : "demand"}
              gl={{
                antialias: true,
                alpha: true,
                powerPreference: "low-power",
              }}
              fallback={<StaticSculpture />}
            >
              <ambientLight intensity={0.5} />
              <directionalLight
                position={[4, 5, 3]}
                intensity={4}
                color="#f6f7fb"
              />
              <directionalLight
                position={[-4, -1, 1]}
                intensity={3}
                color="#ff4d57"
              />
              <spotLight
                position={[2, -4, 2]}
                intensity={22}
                color="#ffcf5c"
                angle={0.6}
              />
              <Dumbbell reduced={reduced} scroll={scroll} />
              <OrbitControls
                enablePan={false}
                enableZoom={false}
                autoRotate={false}
              />
            </Canvas>
            {interactive && (
              <span className="scene-caption">
                LMQ DUMBBELL <span>Drag to explore</span>
              </span>
            )}
          </>
        ) : (
          <StaticSculpture />
        )}
      </SceneBoundary>
    </div>
  );
}
function StaticSculpture() {
  return (
    <div className="static-sculpture" role="img" aria-label="LMQ emblem">
      <img src="/brand/lmq-icon.png" alt="" width="180" height="180" />
    </div>
  );
}

class SceneBoundary extends Component<
  { children: ReactNode },
  { failed: boolean }
> {
  state = { failed: false };
  static getDerivedStateFromError() {
    return { failed: true };
  }
  render() {
    return this.state.failed ? <StaticSculpture /> : this.props.children;
  }
}
