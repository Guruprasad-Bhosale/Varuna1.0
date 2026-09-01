import {
  Component,
  ElementRef,
  ViewChild,
  AfterViewInit,
  OnDestroy,
  NgZone,
  input,
  effect,
  ChangeDetectionStrategy
} from '@angular/core';
import { CommonModule } from '@angular/common';
import * as THREE from 'three';

export interface ArchitectData {
  firstName: string;
  fullName: string;
  role: string;
  lead?: boolean;
  specimenNo: string;
  avatarInitials: string;
  tags: string[];
  githubUrl: string;
  accentColor: string;
  bio: string;
  stats: { label: string; value: string }[];
}

interface PhysicsJoint {
  pos: THREE.Vector3;
  prevPos: THREE.Vector3;
}

@Component({
  selector: 'app-architect-lanyard',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div #canvasContainer class="w-full h-full relative cursor-grab active:cursor-grabbing select-none overflow-hidden rounded-2xl bg-slate-950 border-2 border-slate-900 shadow-inner">
      <!-- Watermark Badge -->
      <div class="absolute top-4 left-4 z-10 flex items-center gap-2 px-3 py-1.5 rounded-xl border-2 border-slate-900 bg-white shadow-[2px_2px_0px_0px_#0f172a] pointer-events-none">
        <span class="h-2 w-2 rounded-full bg-teal-500 animate-ping"></span>
        <span class="font-mono text-[11px] font-black text-slate-900 uppercase tracking-widest">
          PHYSICS ENGINE ACTIVE // DRAG & SWING
        </span>
      </div>

      <!-- Quick Reset Indicator -->
      <div class="absolute bottom-4 right-4 z-10 px-3 py-1 rounded-lg border border-slate-700 bg-slate-900/90 font-mono text-[10px] font-black text-teal-400 pointer-events-none">
        {{ architect().specimenNo }} • GRAVITY: -40 m/s² • 60 FPS
      </div>
    </div>
  `,
  styles: [`
    :host {
      display: block;
      width: 100%;
      height: 100%;
    }
  `],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class ArchitectLanyardComponent implements AfterViewInit, OnDestroy {
  @ViewChild('canvasContainer', { static: true }) containerRef!: ElementRef<HTMLDivElement>;
  architect = input.required<ArchitectData>();

  private renderer!: THREE.WebGLRenderer;
  private scene!: THREE.Scene;
  private camera!: THREE.PerspectiveCamera;
  private frameId: number | null = null;
  private isInitialized = false;

  // Physics Simulation Vectors (Multi-Joint Chain)
  private readonly gravity = new THREE.Vector3(0, -40.0, 0);
  private readonly linearDamping = 3.6;
  private readonly angularDamping = 4.0;
  private readonly segmentLength = 0.85;

  private fixedAnchor = new THREE.Vector3(0, 3.8, 0);
  private j1: PhysicsJoint = { pos: new THREE.Vector3(0, 2.9, 0), prevPos: new THREE.Vector3(0, 2.9, 0) };
  private j2: PhysicsJoint = { pos: new THREE.Vector3(0, 1.9, 0), prevPos: new THREE.Vector3(0, 1.9, 0) };
  private j3: PhysicsJoint = { pos: new THREE.Vector3(0, 0.9, 0), prevPos: new THREE.Vector3(0, 0.9, 0) };

  // Card Body (Enlarged Scale: 2.8w x 4.0h x 0.06d)
  private cardPos = new THREE.Vector3(0, -1.2, 0);
  private cardVel = new THREE.Vector3(0, 0, 0);
  private cardRot = new THREE.Euler(0, 0, 0);
  private cardAngVel = new THREE.Vector3(0, 0, 0);

  // Interaction Handles
  private isDragging = false;
  private pointerTarget = new THREE.Vector3();
  private prevPointerPos = new THREE.Vector3();
  private lastPointerTime = 0;
  private pointerVelocity = new THREE.Vector3();
  private raycaster = new THREE.Raycaster();
  private pointer = new THREE.Vector2();
  private dragPlane = new THREE.Plane(new THREE.Vector3(0, 0, 1), 0);

  // Meshes
  private cardGroup!: THREE.Group;
  private cardMesh!: THREE.Mesh;
  private clipMesh!: THREE.Mesh;
  private ribbonMesh!: THREE.Mesh;
  private bandCurve = new THREE.CatmullRomCurve3([
    new THREE.Vector3(0, 3.8, 0),
    new THREE.Vector3(0, 2.9, 0),
    new THREE.Vector3(0, 1.9, 0),
    new THREE.Vector3(0, 0.9, 0),
    new THREE.Vector3(0, 0.8, 0)
  ]);
  private frontTexture: THREE.CanvasTexture | null = null;

  constructor(private ngZone: NgZone) {
    effect(() => {
      const data = this.architect();
      if (this.isInitialized && this.cardMesh) {
        this.renderCardTextureAtlas(data);
        this.triggerFreeFallGravityDrop();
      }
    });
  }

  ngAfterViewInit(): void {
    this.ngZone.runOutsideAngular(() => {
      this.initThreeScene();
      this.renderCardTextureAtlas(this.architect());
      this.triggerFreeFallGravityDrop();
      this.attachPointerInteractions();
      this.isInitialized = true;
      this.renderLoop();
    });
  }

  private triggerFreeFallGravityDrop(): void {
    const dropOffset = 5.5;
    this.j1.pos.set((Math.random() - 0.5) * 0.3, 3.8 + dropOffset * 0.7, (Math.random() - 0.5) * 0.3);
    this.j1.prevPos.copy(this.j1.pos);

    this.j2.pos.set((Math.random() - 0.5) * 0.5, 2.8 + dropOffset * 0.85, (Math.random() - 0.5) * 0.5);
    this.j2.prevPos.copy(this.j2.pos);

    this.j3.pos.set((Math.random() - 0.5) * 0.7, 1.8 + dropOffset, (Math.random() - 0.5) * 0.7);
    this.j3.prevPos.copy(this.j3.pos);

    this.cardPos.set(0, -0.2 + dropOffset, 0);
    this.cardVel.set((Math.random() - 0.5) * 2, -12.0, (Math.random() - 0.5) * 2);
    this.cardAngVel.set((Math.random() - 0.5) * 5, (Math.random() - 0.5) * 7, (Math.random() - 0.5) * 2);
    this.cardRot.set(0.25, (Math.random() - 0.5) * 0.6, 0);
  }

  private renderCardTextureAtlas(member: ArchitectData): void {
    const canvas = document.createElement('canvas');
    canvas.width = 1024;
    canvas.height = 1536;
    const ctx = canvas.getContext('2d')!;

    // Background Cardstock
    ctx.fillStyle = '#ffffff';
    ctx.fillRect(0, 0, 1024, 1536);

    // Subtle graph grid
    ctx.strokeStyle = 'rgba(15, 23, 42, 0.04)';
    ctx.lineWidth = 1.5;
    for (let x = 0; x < 1024; x += 32) {
      ctx.beginPath();
      ctx.moveTo(x, 0);
      ctx.lineTo(x, 1536);
      ctx.stroke();
    }
    for (let y = 0; y < 1536; y += 32) {
      ctx.beginPath();
      ctx.moveTo(0, y);
      ctx.lineTo(1024, y);
      ctx.stroke();
    }

    // 2px Blueprint Slate Outer Border
    ctx.lineWidth = 28;
    ctx.strokeStyle = '#0f172a';
    ctx.strokeRect(20, 20, 984, 1496);

    // Top Header Banner
    ctx.fillStyle = '#0f172a';
    ctx.fillRect(20, 20, 984, 180);
    ctx.fillStyle = '#ffffff';
    ctx.font = 'bold 38px "JetBrains Mono", monospace';
    ctx.fillText('SAGARDRISHTI // FLIGHT CREDENTIAL', 60, 125);

    // Status Indicator
    ctx.fillStyle = member.accentColor || '#14b8a6';
    ctx.beginPath();
    ctx.arc(920, 110, 14, 0, Math.PI * 2);
    ctx.fill();

    // Dynamic Accent Badge Box
    ctx.fillStyle = member.accentColor || '#0d9488';
    ctx.fillRect(60, 260, 904, 400);

    // Avatar Monogram
    ctx.fillStyle = '#ffffff';
    ctx.font = '900 180px "JetBrains Mono", monospace';
    ctx.textAlign = 'center';
    ctx.fillText(member.avatarInitials, 512, 520);

    // Lead / Specialist Stamp Pill
    if (member.lead) {
      ctx.fillStyle = '#f59e0b';
      ctx.fillRect(80, 580, 270, 48);
      ctx.fillStyle = '#0f172a';
      ctx.font = 'bold 22px "JetBrains Mono", monospace';
      ctx.fillText('★ CORE LEAD', 215, 612);
    } else {
      ctx.fillStyle = '#0f172a';
      ctx.fillRect(80, 580, 270, 48);
      ctx.fillStyle = '#ffffff';
      ctx.font = 'bold 20px "JetBrains Mono", monospace';
      ctx.fillText('FIELD SPECIALIST', 215, 612);
    }

    // First Name Hero Display
    ctx.fillStyle = '#0f172a';
    ctx.font = '900 88px "Outfit", sans-serif';
    ctx.fillText(member.firstName, 512, 780);

    // Full Name & Specimen Code
    ctx.fillStyle = '#475569';
    ctx.font = 'bold 34px "JetBrains Mono", monospace';
    ctx.fillText(`${member.fullName} • ${member.specimenNo}`, 512, 850);

    // Role Subtitle
    ctx.fillStyle = '#0f766e';
    ctx.font = 'bold 32px "Outfit", sans-serif';
    ctx.fillText(member.role, 512, 930);

    // Technical Focus Box
    ctx.fillStyle = '#f8fafc';
    ctx.strokeStyle = '#0f172a';
    ctx.lineWidth = 6;
    ctx.fillRect(70, 1000, 884, 240);
    ctx.strokeRect(70, 1000, 884, 240);

    ctx.fillStyle = '#0f172a';
    ctx.font = 'bold 26px "JetBrains Mono", monospace';
    ctx.textAlign = 'left';
    ctx.fillText('CORE SYSTEM SPECIALIZATION:', 100, 1050);

    member.tags.forEach((tag, i) => {
      const col = i % 2 === 0 ? 100 : 530;
      const row = 1110 + Math.floor(i / 2) * 55;
      ctx.fillStyle = '#0f172a';
      ctx.font = 'bold 25px "Outfit", sans-serif';
      ctx.fillText(`• ${tag}`, col, row);
    });

    // Barcode Security Hash
    ctx.fillStyle = '#0f172a';
    for (let i = 0; i < 44; i++) {
      const w = i % 4 === 0 ? 18 : i % 2 === 0 ? 10 : 5;
      ctx.fillRect(110 + i * 18, 1330, w, 90);
    }

    // Holographic Seal
    ctx.fillStyle = member.accentColor || '#0d9488';
    ctx.beginPath();
    ctx.arc(840, 1375, 52, 0, Math.PI * 2);
    ctx.fill();
    ctx.strokeStyle = '#0f172a';
    ctx.lineWidth = 4;
    ctx.stroke();

    ctx.fillStyle = '#ffffff';
    ctx.font = 'bold 16px "JetBrains Mono", monospace';
    ctx.textAlign = 'center';
    ctx.fillText('VERIFIED', 840, 1370);
    ctx.fillText('ARCHITECT', 840, 1390);
    ctx.textAlign = 'left';

    // Footer
    ctx.fillStyle = '#64748b';
    ctx.font = 'bold 20px "JetBrains Mono", monospace';
    ctx.fillText('GAD RIVER PILOT // SINDHUDURG BASIN TESTBED', 60, 1490);

    if (this.frontTexture) {
      this.frontTexture.dispose();
    }
    this.frontTexture = new THREE.CanvasTexture(canvas);
    this.frontTexture.colorSpace = THREE.SRGBColorSpace;
    this.frontTexture.anisotropy = 16;

    if (this.cardMesh) {
      const mat = (this.cardMesh.material as THREE.Material[])[4] as THREE.MeshPhysicalMaterial;
      if (mat) {
        mat.map = this.frontTexture;
        mat.needsUpdate = true;
      }
    }
  }

  private initThreeScene(): void {
    const container = this.containerRef.nativeElement;
    const width = container.clientWidth || 700;
    const height = container.clientHeight || 600;

    this.scene = new THREE.Scene();
    this.camera = new THREE.PerspectiveCamera(28, width / height, 0.1, 100);
    this.camera.position.set(0, 0.2, 12.8);
    this.camera.lookAt(0, -0.4, 0);

    this.renderer = new THREE.WebGLRenderer({ alpha: true, antialias: true, powerPreference: 'high-performance' });
    this.renderer.setSize(width, height);
    this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    this.renderer.shadowMap.enabled = true;
    this.renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    container.appendChild(this.renderer.domElement);

    // Studio Lights
    const ambient = new THREE.AmbientLight(0xffffff, 2.4);
    this.scene.add(ambient);

    const keyLight = new THREE.DirectionalLight(0xffffff, 2.8);
    keyLight.position.set(5, 8, 8);
    keyLight.castShadow = true;
    this.scene.add(keyLight);

    const fillLight = new THREE.DirectionalLight(0x99f6e4, 1.2);
    fillLight.position.set(-5, -2, 6);
    this.scene.add(fillLight);

    // Card Mesh (Enlarged Proportion: 2.8w x 4.0h x 0.06d)
    this.cardGroup = new THREE.Group();

    const cardGeo = new THREE.BoxGeometry(2.8, 4.0, 0.06);
    const edgeMat = new THREE.MeshStandardMaterial({ color: 0x0f172a, roughness: 0.5, metalness: 0.2 });
    const backMat = new THREE.MeshPhysicalMaterial({
      color: 0x0f172a,
      roughness: 0.25,
      clearcoat: 0.8,
      clearcoatRoughness: 0.1,
      metalness: 0.15
    });
    const frontMat = new THREE.MeshPhysicalMaterial({
      roughness: 0.2,
      clearcoat: 1.0,
      clearcoatRoughness: 0.1,
      metalness: 0.1
    });

    const materials = [edgeMat, edgeMat, edgeMat, edgeMat, frontMat, backMat];
    this.cardMesh = new THREE.Mesh(cardGeo, materials);
    this.cardMesh.castShadow = true;
    this.cardMesh.receiveShadow = true;
    this.cardGroup.add(this.cardMesh);

    // Metallic Clasp
    const clipGeo = new THREE.CylinderGeometry(0.18, 0.18, 0.5, 16);
    const clipMat = new THREE.MeshStandardMaterial({ color: 0x334155, metalness: 0.85, roughness: 0.2 });
    this.clipMesh = new THREE.Mesh(clipGeo, clipMat);
    this.clipMesh.rotation.z = Math.PI / 2;
    this.clipMesh.position.set(0, 2.1, 0);
    this.cardGroup.add(this.clipMesh);

    this.scene.add(this.cardGroup);

    // Thick Lanyard Ribbon
    this.bandCurve.curveType = 'chordal';
    const bandGeo = new THREE.TubeGeometry(this.bandCurve, 32, 0.14, 8, false);
    const bandMat = new THREE.MeshStandardMaterial({
      color: new THREE.Color(this.architect().accentColor || '#0f766e'),
      roughness: 0.7,
      metalness: 0.1
    });
    this.ribbonMesh = new THREE.Mesh(bandGeo, bandMat);
    this.scene.add(this.ribbonMesh);
  }

  private constrainJoints(p1: THREE.Vector3, p2: THREE.Vector3, targetDist: number, weight = 0.5): void {
    const delta = new THREE.Vector3().subVectors(p2, p1);
    const dist = delta.length();
    if (dist > 0.0001) {
      const diff = (dist - targetDist) / dist;
      if (weight >= 1.0) {
        p2.addScaledVector(delta, -diff);
      } else {
        p1.addScaledVector(delta, diff * (1 - weight));
        p2.addScaledVector(delta, -diff * weight);
      }
    }
  }

  private renderLoop = () => {
    const dt = 0.016;

    // 1. Verlet step for joints
    const damping = 0.94;
    [this.j1, this.j2, this.j3].forEach(joint => {
      const v = new THREE.Vector3().subVectors(joint.pos, joint.prevPos).multiplyScalar(damping);
      joint.prevPos.copy(joint.pos);
      joint.pos.add(v).addScaledVector(this.gravity, dt * dt * 0.4);
    });

    // 2. Card body dynamics
    if (this.isDragging) {
      this.cardPos.lerp(this.pointerTarget, 0.35);
      this.cardVel.set(0, 0, 0);

      const deltaX = this.pointerTarget.x;
      const targetRotZ = -Math.max(-0.65, Math.min(0.65, deltaX * 0.22));
      const targetRotX = Math.max(-0.55, Math.min(0.55, this.pointerTarget.z * 0.3));
      this.cardRot.z += (targetRotZ - this.cardRot.z) * 0.2;
      this.cardRot.x += (targetRotX - this.cardRot.x) * 0.2;
    } else {
      this.cardVel.addScaledVector(this.gravity, dt);
      this.cardVel.multiplyScalar(Math.exp(-this.linearDamping * dt));
      this.cardAngVel.multiplyScalar(Math.exp(-this.angularDamping * dt));

      this.cardPos.addScaledVector(this.cardVel, dt);

      // Upright restoring torque
      const torqueX = -this.cardRot.x * 16.0;
      const torqueZ = -this.cardRot.z * 16.0;
      const torqueY = -this.cardRot.y * 12.0;

      this.cardAngVel.x += torqueX * dt;
      this.cardAngVel.z += torqueZ * dt;
      this.cardAngVel.y += torqueY * dt;

      // Subtle breeze
      const time = performance.now() * 0.0014;
      this.cardVel.x += Math.sin(time) * 0.012;
      this.cardVel.z += Math.cos(time * 0.8) * 0.008;

      this.cardRot.x += this.cardAngVel.x * dt;
      this.cardRot.y += this.cardAngVel.y * dt;
      this.cardRot.z += this.cardAngVel.z * dt;
    }

    // 3. Chain distance constraints from fixed anchor to card top clip
    const clipOffset = new THREE.Vector3(0, 2.1, 0).applyEuler(this.cardRot);
    const cardClip = new THREE.Vector3().addVectors(this.cardPos, clipOffset);

    for (let pass = 0; pass < 8; pass++) {
      this.constrainJoints(this.fixedAnchor, this.j1.pos, this.segmentLength, 1.0);
      this.constrainJoints(this.j1.pos, this.j2.pos, this.segmentLength, 0.5);
      this.constrainJoints(this.j2.pos, this.j3.pos, this.segmentLength, 0.5);
      this.constrainJoints(this.j3.pos, cardClip, 0.35, 0.8);
    }

    // Physically bind card body to constrained clip point
    this.cardPos.copy(cardClip).sub(clipOffset);

    // Update Mesh Transform
    this.cardGroup.position.copy(this.cardPos);
    this.cardGroup.rotation.copy(this.cardRot);

    // Rebuild Ribbon Curve
    this.bandCurve.points[0].copy(this.fixedAnchor);
    this.bandCurve.points[1].copy(this.j1.pos);
    this.bandCurve.points[2].copy(this.j2.pos);
    this.bandCurve.points[3].copy(this.j3.pos);
    this.bandCurve.points[4].copy(cardClip);

    this.ribbonMesh.geometry.dispose();
    this.ribbonMesh.geometry = new THREE.TubeGeometry(this.bandCurve, 32, 0.14, 8, false);
    (this.ribbonMesh.material as THREE.MeshStandardMaterial).color.set(this.architect().accentColor || '#0f766e');

    if (this.renderer && this.scene && this.camera) {
      this.renderer.render(this.scene, this.camera);
    }
    this.frameId = requestAnimationFrame(this.renderLoop);
  };

  private attachPointerInteractions(): void {
    const dom = this.renderer.domElement;

    const onPointerDown = (e: PointerEvent) => {
      const rect = dom.getBoundingClientRect();
      this.pointer.x = ((e.clientX - rect.left) / rect.width) * 2 - 1;
      this.pointer.y = -((e.clientY - rect.top) / rect.height) * 2 + 1;

      this.raycaster.setFromCamera(this.pointer, this.camera);
      const hits = this.raycaster.intersectObject(this.cardMesh);
      if (hits.length > 0) {
        this.isDragging = true;
        try {
          dom.setPointerCapture(e.pointerId);
        } catch {}
        this.dragPlane.setFromNormalAndCoplanarPoint(new THREE.Vector3(0, 0, 1), this.cardPos);
        this.pointerTarget.copy(hits[0].point);
        this.prevPointerPos.copy(this.pointerTarget);
        this.lastPointerTime = performance.now();
        this.pointerVelocity.set(0, 0, 0);

        this.cardAngVel.y += 0.5;
      }
    };

    const onPointerMove = (e: PointerEvent) => {
      if (!this.isDragging) return;
      const rect = dom.getBoundingClientRect();
      this.pointer.x = ((e.clientX - rect.left) / rect.width) * 2 - 1;
      this.pointer.y = -((e.clientY - rect.top) / rect.height) * 2 + 1;

      this.raycaster.setFromCamera(this.pointer, this.camera);
      if (this.raycaster.ray.intersectPlane(this.dragPlane, this.pointerTarget)) {
        this.pointerTarget.x = Math.max(-5.0, Math.min(5.0, this.pointerTarget.x));
        this.pointerTarget.y = Math.max(-3.5, Math.min(2.5, this.pointerTarget.y));
        this.pointerTarget.z = Math.max(-1.5, Math.min(2.5, this.pointerTarget.z));

        const now = performance.now();
        const dt = (now - this.lastPointerTime) / 1000;
        if (dt > 0.006) {
          this.pointerVelocity.subVectors(this.pointerTarget, this.prevPointerPos).divideScalar(dt);
          this.prevPointerPos.copy(this.pointerTarget);
          this.lastPointerTime = now;
        }
      }
    };

    const onPointerUp = (e: PointerEvent) => {
      if (this.isDragging) {
        this.isDragging = false;
        try {
          dom.releasePointerCapture(e.pointerId);
        } catch {}
        const throwVel = this.pointerVelocity.clone().clampLength(0, 30);
        this.cardVel.copy(throwVel);
        this.cardAngVel.set(throwVel.y * 0.4, -throwVel.x * 0.45, throwVel.x * 0.2);
      }
    };

    const onResize = () => {
      const container = this.containerRef.nativeElement;
      if (!container || !this.renderer || !this.camera) return;
      const width = container.clientWidth || 700;
      const height = container.clientHeight || 600;
      this.camera.aspect = width / height;
      this.camera.updateProjectionMatrix();
      this.renderer.setSize(width, height);
    };

    dom.addEventListener('pointerdown', onPointerDown);
    window.addEventListener('pointermove', onPointerMove);
    window.addEventListener('pointerup', onPointerUp);
    window.addEventListener('pointercancel', onPointerUp);
    window.addEventListener('resize', onResize);
  }

  ngOnDestroy(): void {
    if (this.frameId !== null) {
      cancelAnimationFrame(this.frameId);
    }
    if (this.renderer) {
      this.renderer.dispose();
    }
    if (this.frontTexture) {
      this.frontTexture.dispose();
    }
  }
}
