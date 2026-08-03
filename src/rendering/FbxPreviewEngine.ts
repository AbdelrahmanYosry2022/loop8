import {
  ACESFilmicToneMapping,
  AmbientLight,
  AnimationMixer,
  Box3,
  Clock,
  Color,
  DirectionalLight,
  Group,
  Mesh,
  MeshStandardMaterial,
  PerspectiveCamera,
  PlaneGeometry,
  Scene,
  SRGBColorSpace,
  Vector3,
  WebGLRenderer,
} from "three";
import { FBXLoader } from "three/addons/loaders/FBXLoader.js";
import type { ViewAngle } from "../domain/angles";
import { lockHorizontalRootMotion } from "../domain/animation";
import type { BackgroundMode, ExportResolution } from "../domain/exportSettings";

export interface FbxMetadata {
  clipName: string;
  duration: number;
}

export class FbxPreviewEngine {
  readonly canvas: HTMLCanvasElement;
  private readonly renderer: WebGLRenderer;
  private readonly scene = new Scene();
  private readonly camera = new PerspectiveCamera(32, 1, 0.01, 1000);
  private readonly turntable = new Group();
  private readonly clock = new Clock();
  private readonly observer: ResizeObserver;
  private floor: Mesh | null = null;
  private model: Group | null = null;
  private mixer: AnimationMixer | null = null;
  private animationDuration = 0;
  private animationFrame = 0;
  private playing = false;
  private exportMode = false;
  private backgroundMode: BackgroundMode = "studio";

  constructor(canvas: HTMLCanvasElement) {
    this.canvas = canvas;
    this.renderer = new WebGLRenderer({
      canvas,
      alpha: true,
      antialias: true,
      premultipliedAlpha: false,
      preserveDrawingBuffer: true,
    });
    this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    this.renderer.outputColorSpace = SRGBColorSpace;
    this.renderer.toneMapping = ACESFilmicToneMapping;
    this.renderer.toneMappingExposure = 1.05;
    this.renderer.shadowMap.enabled = true;
    this.scene.add(this.turntable);
    this.addStudio();
    this.applyBackground("studio");

    this.observer = new ResizeObserver(() => this.resize());
    this.observer.observe(canvas);
    this.resize();
    this.render();
  }

  get duration(): number {
    return this.animationDuration;
  }

  async load(buffer: ArrayBuffer): Promise<FbxMetadata> {
    this.pause();
    this.removeCurrentModel();

    const object = new FBXLoader().parse(buffer, "");
    const sourceClip = object.animations[0];
    if (!sourceClip || sourceClip.duration <= 0) {
      this.disposeObject(object);
      throw new Error("ملف FBX مفيهوش حركة قابلة للتشغيل");
    }

    object.traverse((child) => {
      if (child instanceof Mesh) {
        child.castShadow = true;
        child.receiveShadow = true;
      }
    });

    this.normalizeModel(object);
    this.model = object;
    this.turntable.add(object);
    const clip = lockHorizontalRootMotion(sourceClip);
    this.mixer = new AnimationMixer(object);
    this.mixer.clipAction(clip).play();
    this.animationDuration = clip.duration;
    this.setAngle(0);
    this.renderAt(0);
    this.play();

    return { clipName: clip.name || "Animation", duration: clip.duration };
  }

  setAngle(angle: ViewAngle): void {
    this.turntable.rotation.y = (angle * Math.PI) / 180;
    this.render();
  }

  setBackground(mode: BackgroundMode): void {
    this.backgroundMode = mode;
    this.applyBackground(mode);
    this.render();
  }

  prepareExport(resolution: ExportResolution, background: BackgroundMode): void {
    this.pause();
    this.exportMode = true;
    this.renderer.setPixelRatio(1);
    this.renderer.setSize(resolution, resolution, false);
    this.camera.aspect = 1;
    this.camera.updateProjectionMatrix();
    this.applyBackground(background);
    this.render();
  }

  finishExport(): void {
    this.exportMode = false;
    this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    this.applyBackground(this.backgroundMode);
    this.resize();
    this.play();
  }

  renderAt(seconds: number): void {
    if (this.mixer && this.animationDuration > 0) {
      this.mixer.setTime(Math.max(0, seconds % this.animationDuration));
    }
    this.render();
  }

  readRgbaFrame(): Uint8Array {
    const gl = this.renderer.getContext();
    const width = this.canvas.width;
    const height = this.canvas.height;
    const rowBytes = width * 4;
    const source = new Uint8Array(rowBytes * height);
    const flipped = new Uint8Array(source.length);
    gl.readPixels(0, 0, width, height, gl.RGBA, gl.UNSIGNED_BYTE, source);
    for (let row = 0; row < height; row += 1) {
      const sourceOffset = (height - row - 1) * rowBytes;
      flipped.set(source.subarray(sourceOffset, sourceOffset + rowBytes), row * rowBytes);
    }
    return flipped;
  }

  play(): void {
    if (this.playing || !this.mixer) return;
    this.playing = true;
    this.clock.start();

    const tick = () => {
      if (!this.playing) return;
      this.renderAt(this.clock.getElapsedTime());
      this.animationFrame = requestAnimationFrame(tick);
    };
    tick();
  }

  pause(): void {
    this.playing = false;
    cancelAnimationFrame(this.animationFrame);
    this.clock.stop();
  }

  dispose(): void {
    this.pause();
    this.observer.disconnect();
    this.removeCurrentModel();
    this.renderer.dispose();
  }

  private addStudio(): void {
    this.scene.add(new AmbientLight("#ffffff", 2.2));
    const key = new DirectionalLight("#fff8ed", 4.5);
    key.position.set(3, 7, 5);
    key.castShadow = true;
    key.shadow.mapSize.set(2048, 2048);
    this.scene.add(key);

    const fill = new DirectionalLight("#c9dcff", 2.2);
    fill.position.set(-4, 3, 2);
    this.scene.add(fill);

    this.floor = new Mesh(
      new PlaneGeometry(40, 40),
      new MeshStandardMaterial({ color: "#c8ced2", roughness: 0.92 }),
    );
    this.floor.rotation.x = -Math.PI / 2;
    this.floor.receiveShadow = true;
    this.scene.add(this.floor);
  }

  private applyBackground(mode: BackgroundMode): void {
    if (this.floor) this.floor.visible = mode === "studio";
    if (mode === "transparent") {
      this.scene.background = null;
      this.renderer.setClearAlpha(0);
    } else {
      this.scene.background = new Color(mode === "green" ? "#00ff00" : "#dfe3e6");
      this.renderer.setClearAlpha(1);
    }
  }

  private normalizeModel(object: Group): void {
    const bounds = new Box3().setFromObject(object);
    const center = bounds.getCenter(new Vector3());
    object.position.set(-center.x, -bounds.min.y, -center.z);
    object.updateMatrixWorld(true);

    const normalizedBounds = new Box3().setFromObject(object);
    const size = normalizedBounds.getSize(new Vector3());
    const height = Math.max(size.y, 0.1);
    const targetY = height * 0.48;
    const distance = height / (2 * Math.tan((this.camera.fov * Math.PI) / 360)) * 1.25;
    this.camera.position.set(0, targetY, distance);
    this.camera.near = Math.max(distance / 100, 0.01);
    this.camera.far = distance * 20;
    this.camera.lookAt(0, targetY, 0);
    this.camera.updateProjectionMatrix();
  }

  private resize(): void {
    if (this.exportMode) return;
    const width = Math.max(this.canvas.clientWidth, 1);
    const height = Math.max(this.canvas.clientHeight, 1);
    this.renderer.setSize(width, height, false);
    this.camera.aspect = width / height;
    this.camera.updateProjectionMatrix();
    this.render();
  }

  private render(): void {
    this.renderer.render(this.scene, this.camera);
  }

  private removeCurrentModel(): void {
    this.mixer?.stopAllAction();
    if (this.model) {
      this.turntable.remove(this.model);
      this.disposeObject(this.model);
    }
    this.model = null;
    this.mixer = null;
    this.animationDuration = 0;
  }

  private disposeObject(object: Group): void {
    object.traverse((child) => {
      if (!(child instanceof Mesh)) return;
      child.geometry?.dispose();
      const materials = Array.isArray(child.material) ? child.material : [child.material];
      materials.forEach((material) => material.dispose());
    });
  }
}
