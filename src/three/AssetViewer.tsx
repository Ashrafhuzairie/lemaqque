import {
  Component,
  Suspense,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import { Canvas, useThree } from "@react-three/fiber";
import { OrbitControls, useGLTF, useAnimations } from "@react-three/drei";
import { clone } from "three/addons/utils/SkeletonUtils.js";
import * as THREE from "three";
import { Button } from "../components/ui/button";
import { Notice } from "../components/common";
import type { ModelAsset, AnimationAsset } from "../lib/types";
const safeURL = (url: string) =>
  (url.startsWith("/") && !url.startsWith("//")) || url.startsWith("https://");
function Model({
  asset,
  region,
  onSelect,
  clip,
  playing,
  speed,
}: {
  asset: ModelAsset;
  region: string;
  onSelect: (r: string) => void;
  clip?: string;
  playing: boolean;
  speed: number;
}) {
  const gltf = useGLTF(asset.url);
  const scene = useMemo(() => {
    const model = clone(gltf.scene);
    model.traverse((o) => {
      if (o instanceof THREE.Mesh) {
        o.material = Array.isArray(o.material)
          ? o.material.map((m) => m.clone())
          : o.material.clone();
      }
    });
    return model;
  }, [gltf.scene]);
  const { actions } = useAnimations(gltf.animations, scene);
  useEffect(() => {
    if (!clip) return;
    const action = actions[clip];
    if (!action) return;
    action.reset().play();
    return () => {
      action.stop();
    };
  }, [actions, clip]);
  useEffect(() => {
    if (clip && actions[clip]) {
      actions[clip]!.paused = !playing;
      actions[clip]!.timeScale = speed;
    }
  }, [playing, speed, actions, clip]);
  useEffect(() => {
    scene.traverse((o) => {
      if (o instanceof THREE.Mesh) {
        for (const m of Array.isArray(o.material) ? o.material : [o.material])
          if ("emissive" in m)
            (m as THREE.MeshStandardMaterial).emissive.set(
              asset.region_map[region]?.includes(o.name)
                ? "#3c6630"
                : "#000000",
            );
      }
    });
  }, [scene, region, asset.region_map]);
  useEffect(
    () => () => {
      scene.traverse((o) => {
        if (o instanceof THREE.Mesh)
          for (const m of Array.isArray(o.material) ? o.material : [o.material])
            m.dispose();
      });
    },
    [scene],
  );
  return (
    <primitive
      object={scene}
      onClick={(e: { stopPropagation: () => void; object: THREE.Object3D }) => {
        e.stopPropagation();
        const match = Object.entries(asset.region_map).find(([, names]) =>
          names.includes(e.object.name),
        );
        if (match) onSelect(match[0]);
      }}
    />
  );
}
function CameraPreset({ view }: { view: string }) {
  const { camera, invalidate } = useThree();
  useEffect(() => {
    camera.position.set(
      view === "side" ? 4 : 0,
      1,
      view === "rear" ? -4 : view === "side" ? 0 : 4,
    );
    camera.lookAt(0, 1, 0);
    invalidate();
  }, [view, camera, invalidate]);
  return null;
}
export default function AssetViewer({
  asset,
  animation,
  region,
  onSelect,
}: {
  asset: ModelAsset;
  animation?: AnimationAsset;
  region: string;
  onSelect: (r: string) => void;
}) {
  const [playing, setPlaying] = useState(true),
    [speed, setSpeed] = useState(1),
    [view, setView] = useState("front");
  if (
    asset.review_status !== "approved" ||
    !asset.license ||
    !safeURL(asset.url)
  )
    return <Notice>Only approved, licensed 3D assets can be loaded.</Notice>;
  return (
    <ViewerBoundary>
      <div className="asset-viewer">
        <div className="asset-canvas">
          <Canvas
            camera={{ position: [0, 1, 4], fov: 45 }}
            dpr={[1, 1.5]}
            frameloop={animation && playing ? "always" : "demand"}
          >
            <ambientLight intensity={1.2} />
            <directionalLight position={[3, 5, 4]} intensity={2} />
            <Suspense fallback={null}>
              <Model
                asset={asset}
                region={region}
                onSelect={onSelect}
                clip={animation?.clip_name}
                playing={playing}
                speed={speed}
              />
            </Suspense>
            <OrbitControls
              target={[0, 1, 0]}
              minDistance={1.5}
              maxDistance={8}
            />
            <CameraPreset view={view} />
          </Canvas>
        </div>
        <div className="actions">
          {["front", "side", "rear"].map((v) => (
            <Button
              key={v}
              variant="outline"
              onClick={() => setView(v)}
              aria-pressed={view === v}
            >
              {v}
            </Button>
          ))}
          {animation && (
            <>
              <Button onClick={() => setPlaying(!playing)}>
                {playing ? "Pause" : "Play"}
              </Button>
              <select
                aria-label="Playback speed"
                value={speed}
                onChange={(e) => setSpeed(Number(e.target.value))}
              >
                {[0.5, 1, 1.5].map((s) => (
                  <option key={s} value={s}>
                    {s}× speed
                  </option>
                ))}
              </select>
            </>
          )}
        </div>
        <small>
          {asset.attribution} · {asset.license} ·{" "}
          <a href={asset.source_url} target="_blank" rel="noreferrer">
            Asset source
          </a>
        </small>
      </div>
    </ViewerBoundary>
  );
}

class ViewerBoundary extends Component<
  { children: ReactNode },
  { failed: boolean }
> {
  state = { failed: false };
  static getDerivedStateFromError() {
    return { failed: true };
  }
  render() {
    return this.state.failed ? (
      <Notice>
        3D is unavailable on this device or this asset could not load. Use the
        muscle directory and written exercise guidance.
      </Notice>
    ) : (
      this.props.children
    );
  }
}
