import { useEffect, useRef, useState } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import { OrbitControls } from "@react-three/drei";
import * as THREE from "three";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
gsap.registerPlugin(ScrollTrigger);
function Sculpture({
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
      scroll.current.value * 1.3 +
      (reduced ? 0 : Math.sin(clock.elapsedTime * 0.22) * 0.12);
    group.current.rotation.z = -0.28 + scroll.current.value * 0.2;
  });
  return (
    <group ref={group} rotation={[0.3, 0, -0.28]}>
      <mesh rotation={[0, 0, Math.PI / 7]}>
        <torusKnotGeometry args={[1.35, 0.29, 180, 24, 2, 3]} />
        <meshPhysicalMaterial
          color="#b4bfad"
          roughness={0.32}
          metalness={0.76}
          clearcoat={0.6}
        />
      </mesh>
      <mesh rotation={[Math.PI / 2, 0.3, 0]}>
        <torusGeometry args={[2.18, 0.012, 8, 120]} />
        <meshStandardMaterial
          color="#a6e083"
          roughness={0.4}
          metalness={0.25}
        />
      </mesh>
      <mesh rotation={[0.6, 0, Math.PI / 5]}>
        <torusGeometry args={[2.45, 0.009, 8, 120]} />
        <meshStandardMaterial color="#c5ad7a" roughness={0.5} metalness={0.4} />
      </mesh>
    </group>
  );
}
export default function PerformanceScene() {
  const host = useRef<HTMLDivElement>(null);
  const scroll = useRef({ value: 0 });
  const [visible, setVisible] = useState(true);
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
    <div
      ref={host}
      className="performance-scene"
      aria-label="Original interactive 3D performance sculpture"
    >
      {supported ? (
        <Canvas
          dpr={[1, 1.5]}
          camera={{ position: [0, 0, 7], fov: 43 }}
          frameloop={visible && !reduced ? "always" : "demand"}
          gl={{ antialias: true, alpha: true, powerPreference: "low-power" }}
          fallback={<StaticSculpture />}
        >
          <ambientLight intensity={0.5} />
          <directionalLight
            position={[4, 5, 3]}
            intensity={4}
            color="#f3ede1"
          />
          <directionalLight
            position={[-4, -1, 1]}
            intensity={3}
            color="#a6e083"
          />
          <spotLight
            position={[2, -4, 2]}
            intensity={22}
            color="#c5ad7a"
            angle={0.6}
          />
          <Sculpture reduced={reduced} scroll={scroll} />
          <OrbitControls
            enablePan={false}
            enableZoom={false}
            autoRotate={false}
          />
        </Canvas>
      ) : (
        <StaticSculpture />
      )}
      <span className="scene-caption">
        FORM IN MOTION <span>Drag to explore</span>
      </span>
    </div>
  );
}
function StaticSculpture() {
  return (
    <div
      className="static-sculpture"
      role="img"
      aria-label="LMQ abstract static graphic"
    >
      <span>LMQ</span>
    </div>
  );
}
