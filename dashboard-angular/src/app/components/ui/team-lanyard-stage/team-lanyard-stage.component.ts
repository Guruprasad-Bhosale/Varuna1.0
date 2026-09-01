import {
  Component,
  ElementRef,
  NgZone,
  OnDestroy,
  OnInit,
  ViewChild,
  input,
  output,
  effect,
  ChangeDetectionStrategy
} from '@angular/core';
import { CommonModule } from '@angular/common';
import * as THREE from 'three';

export interface TeamArchitect {
  id: string;
  name: string;
  role: string;
  lead?: boolean;
  specimenNo: string;
  avatarInitials: string;
  skills: string[];
  githubUrl: string;
  accentColor: string;
}

interface PhysicsJoint {
  pos: THREE.Vector3;
  prevPos: THREE.Vector3;
  vel: THREE.Vector3;
}

interface LanyardRig {
  member: TeamArchitect;
  baseX: number;
  fixedAnchor: THREE.Vector3;
  j1: PhysicsJoint;
  j2: PhysicsJoint;
  j3: PhysicsJoint;
  cardClipPoint: THREE.Vector3;
  segmentLength: number;
  cardBody: {
    pos: THREE.Vector3;
    vel: THREE.Vector3;
    rot: THREE.Euler;
    quat: THREE.Quaternion;
    angularVelocity: THREE.Vector3;
  };
  badgeMesh: THREE.Mesh;
  ribbonMesh: THREE.Mesh;
  curve: THREE.CatmullRomCurve3;
  frontTexture: THREE.CanvasTexture;
  backTexture: THREE.CanvasTexture;
  frontMaterial: THREE.MeshPhysicalMaterial;
  backMaterial: THREE.MeshPhysicalMaterial;
  isDragged: boolean;
  targetPos: THREE.Vector3;
}

@Component({
  selector: 'app-team-lanyard-stage',
  standalone: true,
  imports: [CommonModule],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="relative w-full h-full select-none touch-none overflow-hidden rounded-2xl bg-slate-950">
      <!-- 3D WebGL Canvas -->
      <canvas #stageCanvas class="w-full h-full block cursor-grab active:cursor-grabbing"></canvas>
      
      <!-- Interactive Navigation & Controls Overlay -->
      <div class="absolute bottom-4 left-4 pointer-events-none flex items-center gap-2 px-3.5 py-1.5 bg-slate-900/90 backdrop-blur-md border border-slate-700 rounded-xl shadow-lg">
        <span class="inline-block w-2 h-2 rounded-full bg-emerald-400 animate-ping"></span>
        <span class="font-mono text-xs font-black text-slate-200 uppercase tracking-wider">
          RAPID RAPIER/VERLET PHYSICS • DRAG, SWING & THROW ANY CARD
        </span>
      </div>

      <!-- Focused Member Tag -->
      <div class="absolute top-4 right-4 pointer-events-none flex items-center gap-2">
        <span class="font-mono text-xs font-black px-3.5 py-1.5 rounded-xl bg-teal-500 text-slate-950 border border-teal-300 shadow-lg uppercase tracking-wider">
          FOCUS // {{ teamMembers()[activeIndex()].specimenNo }} • {{ teamMembers()[activeIndex()].name.split(' ')[0] }}
        </span>
      </div>
    </div>
  `,
  styles: [`
    :host {
      display: block;
      width: 100%;
      height: 100%;
    }
  `]
})
export class TeamLanyardStageComponent implements OnInit, OnDestroy {
  @ViewChild('stageCanvas', { static: true }) canvasRef!: ElementRef<HTMLCanvasElement>;

  // Component Inputs & Outputs
  teamMembers = input.required<TeamArchitect[]>();
  activeIndex = input<number>(0);
  memberSelected = output<number>();

  private scene!: THREE.Scene;
  private camera!: THREE.PerspectiveCamera;
  private renderer!: THREE.WebGLRenderer;
  private animFrameId: number | null = null;
  private lastTime = 0;

  // 5 Lanyard Rigs Array
  private lanyards: LanyardRig[] = [];
  private badgeSpacing = 2.45; // Spacing between the 5 badges: -4.9, -2.45, 0, 2.45, 4.9

  // Physics Parameters
  private gravity = -38.0;
  private linearDamping = 3.8;
  private angularDamping = 4.2;

  // Drag & Pointer Velocity State
  private draggedLanyardIndex: number | null = null;
  private pointerPos = new THREE.Vector2();
  private dragPlane = new THREE.Plane();
  private raycaster = new THREE.Raycaster();
  private planeIntersect = new THREE.Vector3();
  private targetDragPos = new THREE.Vector3();

  private lastPointerPos = new THREE.Vector3();
  private lastPointerTime = 0;
  private pointerVelocity = new THREE.Vector3();

  // Event Listeners
  private boundOnPointerDown!: (e: PointerEvent) => void;
  private boundOnPointerMove!: (e: PointerEvent) => void;
  private boundOnPointerUp!: (e: PointerEvent) => void;
  private boundOnResize!: () => void;

  constructor(private ngZone: NgZone) {
    // Focus impulse when activeIndex signal updates
    effect(() => {
      const idx = this.activeIndex();
      this.focusMember(idx);
    });
  }

  ngOnInit(): void {
    this.ngZone.runOutsideAngular(() => {
      this.initThree();
      this.createAllLanyards();
      this.initPhysicsDrop(11.0); // Free-fall spawn sequence high above the screen (y = +11)
      this.initEventListeners();
      this.lastTime = performance.now();
      this.animate();
    });
  }

  ngOnDestroy(): void {
    if (this.animFrameId !== null) {
      cancelAnimationFrame(this.animFrameId);
    }
    this.removeEventListeners();
    this.disposeThree();
  }

  // ==============================================================
  // 1. Procedural 2D Texture Compositor (Front & Back Faces)
  // ==============================================================
  private createCardFrontCanvas(member: TeamArchitect): HTMLCanvasElement {
    const canvas = document.createElement('canvas');
    canvas.width = 1024;
    canvas.height = 1536;
    const ctx = canvas.getContext('2d')!;

    // Base Field Cardstock
    ctx.fillStyle = '#f8fafc';
    ctx.fillRect(0, 0, 1024, 1536);

    // Subtle graph paper grid
    ctx.strokeStyle = 'rgba(15, 23, 42, 0.05)';
    ctx.lineWidth = 1.5;
    const gridSize = 32;
    for (let x = 0; x < 1024; x += gridSize) {
      ctx.beginPath();
      ctx.moveTo(x, 0);
      ctx.lineTo(x, 1536);
      ctx.stroke();
    }
    for (let y = 0; y < 1536; y += gridSize) {
      ctx.beginPath();
      ctx.moveTo(0, y);
      ctx.lineTo(1024, y);
      ctx.stroke();
    }

    // Outer 14px dark slate border
    ctx.strokeStyle = '#0f172a';
    ctx.lineWidth = 14;
    ctx.strokeRect(32, 32, 960, 1472);

    // Inner accent border
    ctx.strokeStyle = member.accentColor || '#0d9488';
    ctx.lineWidth = 6;
    ctx.strokeRect(48, 48, 928, 1440);

    // Lanyard punch hole
    ctx.fillStyle = '#0f172a';
    ctx.beginPath();
    ctx.roundRect(432, 60, 160, 24, 12);
    ctx.fill();

    // Header Bar
    ctx.fillStyle = '#0f172a';
    ctx.fillRect(72, 110, 880, 70);
    ctx.fillStyle = '#ffffff';
    ctx.font = 'bold 26px "JetBrains Mono", monospace';
    ctx.fillText('SAGARDRISHTI // FIELD RESEARCH CREDENTIAL', 96, 154);

    // Status Indicator
    ctx.fillStyle = member.accentColor || '#14b8a6';
    ctx.beginPath();
    ctx.arc(905, 145, 12, 0, Math.PI * 2);
    ctx.fill();

    // Large Monogram Avatar Frame
    ctx.fillStyle = '#0f172a';
    ctx.fillRect(110, 225, 804, 500);
    ctx.fillStyle = '#031b20';
    ctx.fillRect(118, 233, 788, 484);

    // Monogram Initials
    ctx.fillStyle = member.accentColor || '#2dd4bf';
    ctx.font = '900 170px "JetBrains Mono", monospace';
    ctx.textAlign = 'center';
    ctx.fillText(member.avatarInitials, 512, 530);
    ctx.textAlign = 'left';

    // Lead / Role Stamp Pill
    if (member.lead) {
      ctx.fillStyle = '#f59e0b';
      ctx.fillRect(136, 645, 260, 52);
      ctx.fillStyle = '#0f172a';
      ctx.font = 'bold 24px "JetBrains Mono", monospace';
      ctx.fillText('★ CORE LEAD', 160, 680);
    } else {
      ctx.fillStyle = member.accentColor || '#0d9488';
      ctx.fillRect(136, 645, 260, 52);
      ctx.fillStyle = '#ffffff';
      ctx.font = 'bold 22px "JetBrains Mono", monospace';
      ctx.fillText('FIELD SPECIALIST', 156, 680);
    }

    // Name Typography
    ctx.fillStyle = '#0f172a';
    ctx.font = '900 52px "Outfit", sans-serif';
    ctx.fillText(member.name, 110, 810);

    // Role Typography (Wrapped)
    ctx.fillStyle = member.accentColor || '#0d9488';
    ctx.font = 'bold 28px "JetBrains Mono", monospace';
    const words = member.role.split(' ');
    let line = '';
    let roleY = 860;
    for (let n = 0; n < words.length; n++) {
      const testLine = line + words[n] + ' ';
      if (testLine.length > 30 && n > 0) {
        ctx.fillText(line, 110, roleY);
        line = words[n] + ' ';
        roleY += 38;
      } else {
        line = testLine;
      }
    }
    ctx.fillText(line, 110, roleY);

    // Specimen Metadata Box
    const ledgerY = Math.max(roleY + 50, 980);
    ctx.fillStyle = '#f1f5f9';
    ctx.fillRect(110, ledgerY, 804, 210);
    ctx.strokeStyle = '#cbd5e1';
    ctx.lineWidth = 3;
    ctx.strokeRect(110, ledgerY, 804, 210);

    ctx.fillStyle = '#64748b';
    ctx.font = 'bold 22px "JetBrains Mono", monospace';
    ctx.fillText('SPECIMEN INDEX:', 136, ledgerY + 45);
    ctx.fillText('DEPLOYED DOMAIN:', 136, ledgerY + 95);
    ctx.fillText('GITHUB HANDLE:', 136, ledgerY + 145);

    ctx.fillStyle = '#0f172a';
    ctx.font = 'bold 24px "JetBrains Mono", monospace';
    ctx.fillText(`SPECIMEN // ${member.specimenNo}`, 420, ledgerY + 45);
    ctx.fillText(member.skills[0] || 'Embedded IoT', 420, ledgerY + 95);

    const githubHandle = member.githubUrl.split('/').filter(Boolean).pop() || 'architect';
    ctx.fillStyle = member.accentColor || '#0d9488';
    ctx.fillText(`@${githubHandle}`, 420, ledgerY + 145);

    // Barcode Strip
    const barY = 1270;
    ctx.fillStyle = '#0f172a';
    const pattern = [6, 3, 12, 4, 8, 14, 3, 7, 18, 4, 9, 3, 15, 6, 8, 4, 16, 5, 10, 3, 14, 8, 5, 12];
    let barX = 110;
    for (let i = 0; i < 4; i++) {
      for (const w of pattern) {
        ctx.fillRect(barX, barY, w, 85);
        barX += w + 6;
        if (barX > 680) break;
      }
    }

    // Holographic Seal
    ctx.fillStyle = member.accentColor || '#0d9488';
    ctx.beginPath();
    ctx.arc(810, barY + 42, 48, 0, Math.PI * 2);
    ctx.fill();
    ctx.strokeStyle = '#0f172a';
    ctx.lineWidth = 4;
    ctx.stroke();

    ctx.fillStyle = '#ffffff';
    ctx.font = 'bold 16px "JetBrains Mono", monospace';
    ctx.textAlign = 'center';
    ctx.fillText('VERIFIED', 810, barY + 38);
    ctx.fillText('ARCHITECT', 810, barY + 58);
    ctx.textAlign = 'left';

    // Footer
    ctx.fillStyle = '#64748b';
    ctx.font = 'bold 20px "JetBrains Mono", monospace';
    ctx.fillText('GAD RIVER PILOT // SINDHUDURG BASIN TESTBED', 110, 1420);

    return canvas;
  }

  private createCardBackCanvas(member: TeamArchitect): HTMLCanvasElement {
    const canvas = document.createElement('canvas');
    canvas.width = 1024;
    canvas.height = 1536;
    const ctx = canvas.getContext('2d')!;

    // Dark slate reverse face
    ctx.fillStyle = '#090d16';
    ctx.fillRect(0, 0, 1024, 1536);

    // Outer border
    ctx.strokeStyle = member.accentColor || '#0d9488';
    ctx.lineWidth = 8;
    ctx.strokeRect(36, 36, 952, 1464);

    // Punch hole
    ctx.fillStyle = '#020617';
    ctx.beginPath();
    ctx.roundRect(432, 60, 160, 24, 12);
    ctx.fill();

    // Security Chip Representation
    ctx.fillStyle = '#f59e0b';
    ctx.beginPath();
    ctx.roundRect(140, 160, 180, 140, 16);
    ctx.fill();
    ctx.strokeStyle = '#d97706';
    ctx.lineWidth = 4;
    ctx.stroke();

    ctx.strokeStyle = '#78350f';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(230, 160); ctx.lineTo(230, 300);
    ctx.moveTo(140, 230); ctx.lineTo(320, 230);
    ctx.stroke();

    // Header Back
    ctx.fillStyle = '#ffffff';
    ctx.font = 'bold 26px "JetBrains Mono", monospace';
    ctx.fillText('SECURITY LEDGER // ENCRYPTED ACCESS', 360, 210);

    ctx.fillStyle = '#94a3b8';
    ctx.font = 'bold 20px "JetBrains Mono", monospace';
    ctx.fillText(`TOKEN: SD-2026-${member.specimenNo}`, 360, 250);

    // Skills Matrix Block
    ctx.fillStyle = '#0f172a';
    ctx.fillRect(110, 360, 804, 380);
    ctx.strokeStyle = '#1e293b';
    ctx.lineWidth = 3;
    ctx.strokeRect(110, 360, 804, 380);

    ctx.fillStyle = member.accentColor || '#2dd4bf';
    ctx.font = 'bold 24px "JetBrains Mono", monospace';
    ctx.fillText('CORE TECHNICAL COMPETENCIES:', 140, 410);

    member.skills.forEach((skill, idx) => {
      ctx.fillStyle = '#f8fafc';
      ctx.font = 'bold 22px "Outfit", sans-serif';
      ctx.fillText(`• ${skill}`, 160, 470 + idx * 48);
    });

    // Encrypted Hash Box
    ctx.fillStyle = '#020617';
    ctx.fillRect(110, 800, 804, 220);
    ctx.strokeStyle = '#334155';
    ctx.lineWidth = 2;
    ctx.strokeRect(110, 800, 804, 220);

    ctx.fillStyle = '#64748b';
    ctx.font = 'bold 18px "JetBrains Mono", monospace';
    ctx.fillText('PUBLIC KEY CERTIFICATE / GITHUB REPO:', 140, 840);

    ctx.fillStyle = '#38bdf8';
    ctx.font = 'bold 22px "JetBrains Mono", monospace';
    ctx.fillText(member.githubUrl, 140, 890);

    ctx.fillStyle = '#94a3b8';
    ctx.font = '16px "JetBrains Mono", monospace';
    ctx.fillText('SHA-256: 8b7a4c9f1e2d3b4a5e6f7a8b9c0d1e2f3a4b5c6d', 140, 940);
    ctx.fillText('DEPLOYMENT: GAD RIVER BASIN • SARJEKOT PILOT', 140, 980);

    // Stylized Watermark Stamp
    ctx.fillStyle = member.accentColor || '#0d9488';
    ctx.font = '900 64px "JetBrains Mono", monospace';
    ctx.textAlign = 'center';
    ctx.fillText('SAGARDRISHTI', 512, 1260);

    ctx.fillStyle = '#64748b';
    ctx.font = 'bold 20px "JetBrains Mono", monospace';
    ctx.fillText('AUTONOMOUS ESTUARY & COASTAL ENVIRONMENTAL INTELLIGENCE', 512, 1310);
    ctx.fillText('GOVERNMENT OF MAHARASHTRA • PILOT INITIATIVE 2026', 512, 1350);
    ctx.textAlign = 'left';

    return canvas;
  }

  // ==============================================================
  // 2. Three.js Scene Setup & 5-Lanyard Physics Rig
  // ==============================================================
  private initThree(): void {
    const canvas = this.canvasRef.nativeElement;
    const width = canvas.clientWidth || 900;
    const height = canvas.clientHeight || 600;

    this.scene = new THREE.Scene();

    this.camera = new THREE.PerspectiveCamera(40, width / height, 0.1, 50);
    this.camera.position.set(0, 0.2, 9.8);
    this.camera.lookAt(0, -0.2, 0);

    this.renderer = new THREE.WebGLRenderer({
      canvas,
      alpha: true,
      antialias: true,
      powerPreference: 'high-performance'
    });
    this.renderer.setSize(width, height);
    this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    this.renderer.shadowMap.enabled = true;
    this.renderer.shadowMap.type = THREE.PCFSoftShadowMap;

    // Rich Lighting
    const ambientLight = new THREE.AmbientLight(0xffffff, 1.6);
    this.scene.add(ambientLight);

    const mainLight = new THREE.DirectionalLight(0xffffff, 2.5);
    mainLight.position.set(5, 8, 6);
    mainLight.castShadow = true;
    this.scene.add(mainLight);

    const backRimLight = new THREE.DirectionalLight(0x2dd4bf, 1.5);
    backRimLight.position.set(-6, -3, -4);
    this.scene.add(backRimLight);

    const softFill = new THREE.PointLight(0xffffff, 1.2, 16);
    softFill.position.set(0, 3, 5);
    this.scene.add(softFill);
  }

  private createAllLanyards(): void {
    const members = this.teamMembers();
    const count = members.length;
    const startX = -((count - 1) * this.badgeSpacing) / 2;

    this.lanyards = [];

    const clipMat = new THREE.MeshStandardMaterial({
      color: 0x94a3b8,
      roughness: 0.18,
      metalness: 0.88
    });

    const edgeMat = new THREE.MeshStandardMaterial({
      color: 0x0f172a,
      roughness: 0.5,
      metalness: 0.2
    });

    members.forEach((member, index) => {
      const baseX = startX + index * this.badgeSpacing;
      const fixedAnchor = new THREE.Vector3(baseX, 3.8, 0);

      // Front Canvas Texture
      const frontCanvas = this.createCardFrontCanvas(member);
      const frontTex = new THREE.CanvasTexture(frontCanvas);
      frontTex.colorSpace = THREE.SRGBColorSpace;
      frontTex.anisotropy = 8;

      const frontMat = new THREE.MeshPhysicalMaterial({
        map: frontTex,
        roughness: 0.18,
        clearcoat: 1.0,
        clearcoatRoughness: 0.1,
        metalness: 0.12,
        reflectivity: 0.8
      });

      // Back Canvas Texture
      const backCanvas = this.createCardBackCanvas(member);
      const backTex = new THREE.CanvasTexture(backCanvas);
      backTex.colorSpace = THREE.SRGBColorSpace;
      backTex.anisotropy = 8;

      const backMat = new THREE.MeshPhysicalMaterial({
        map: backTex,
        roughness: 0.22,
        clearcoat: 0.9,
        clearcoatRoughness: 0.15,
        metalness: 0.15
      });

      // Box Geometry with front/back UV mapping
      const cardGeo = new THREE.BoxGeometry(1.5, 2.25, 0.04);
      const materials = [edgeMat, edgeMat, edgeMat, edgeMat, frontMat, backMat];

      const badgeMesh = new THREE.Mesh(cardGeo, materials);
      badgeMesh.castShadow = true;
      badgeMesh.receiveShadow = true;
      badgeMesh.userData = { memberIndex: index };

      // Top Metallic Clip & Torus Ring
      const clipGeo = new THREE.CylinderGeometry(0.075, 0.075, 0.24, 16);
      const clipMesh = new THREE.Mesh(clipGeo, clipMat);
      clipMesh.rotation.z = Math.PI / 2;
      clipMesh.position.set(0, 1.18, 0);
      badgeMesh.add(clipMesh);

      const ringGeo = new THREE.TorusGeometry(0.11, 0.028, 12, 24);
      const ringMesh = new THREE.Mesh(ringGeo, clipMat);
      ringMesh.position.set(0, 0.13, 0);
      clipMesh.add(ringMesh);

      this.scene.add(badgeMesh);

      // Ribbon Strap Curve along 5 control points
      const initialCurve = new THREE.CatmullRomCurve3([
        fixedAnchor,
        new THREE.Vector3(baseX, 3.0, 0),
        new THREE.Vector3(baseX, 2.0, 0),
        new THREE.Vector3(baseX, 1.0, 0),
        new THREE.Vector3(baseX, 0, 0)
      ]);

      const ribbonGeo = new THREE.TubeGeometry(initialCurve, 28, 0.042, 8, false);
      const ribbonMat = new THREE.MeshStandardMaterial({
        color: new THREE.Color(member.accentColor || '#0d9488'),
        roughness: 0.52,
        metalness: 0.14
      });
      const ribbonMesh = new THREE.Mesh(ribbonGeo, ribbonMat);
      this.scene.add(ribbonMesh);

      this.lanyards.push({
        member,
        baseX,
        fixedAnchor,
        j1: { pos: new THREE.Vector3(baseX, 3.0, 0), prevPos: new THREE.Vector3(baseX, 3.0, 0), vel: new THREE.Vector3(0, 0, 0) },
        j2: { pos: new THREE.Vector3(baseX, 2.0, 0), prevPos: new THREE.Vector3(baseX, 2.0, 0), vel: new THREE.Vector3(0, 0, 0) },
        j3: { pos: new THREE.Vector3(baseX, 1.0, 0), prevPos: new THREE.Vector3(baseX, 1.0, 0), vel: new THREE.Vector3(0, 0, 0) },
        cardClipPoint: new THREE.Vector3(baseX, 0, 0),
        segmentLength: 0.72,
        cardBody: {
          pos: new THREE.Vector3(baseX, -1.18, 0),
          vel: new THREE.Vector3(0, 0, 0),
          rot: new THREE.Euler(0, 0, 0),
          quat: new THREE.Quaternion(),
          angularVelocity: new THREE.Vector3(0, 0, 0)
        },
        badgeMesh,
        ribbonMesh,
        curve: initialCurve,
        frontTexture: frontTex,
        backTexture: backTex,
        frontMaterial: frontMat,
        backMaterial: backMat,
        isDragged: false,
        targetPos: new THREE.Vector3(baseX, -1.18, 0)
      });
    });
  }

  // ==============================================================
  // 3. Initial Free-Fall Gravity Drop Sequence
  // ==============================================================
  private initPhysicsDrop(initialYOffset = 11.0): void {
    this.lanyards.forEach((l, idx) => {
      l.fixedAnchor.set(l.baseX, 3.8, 0);

      const stagger = idx * 0.16;
      const rndX = (Math.random() - 0.5) * 0.5;
      const rndZ = (Math.random() - 0.5) * 0.8;

      l.j1.pos.set(l.baseX + rndX, 3.0 + initialYOffset + stagger, rndZ);
      l.j1.prevPos.copy(l.j1.pos);
      l.j1.vel.set(0, -6.0, 0);

      l.j2.pos.set(l.baseX + rndX * 1.5, 2.0 + initialYOffset + stagger, rndZ * 1.5);
      l.j2.prevPos.copy(l.j2.pos);
      l.j2.vel.set(0, -8.0, 0);

      l.j3.pos.set(l.baseX + rndX * 2.0, 1.0 + initialYOffset + stagger, rndZ * 2.0);
      l.j3.prevPos.copy(l.j3.pos);
      l.j3.vel.set(0, -10.0, 0);

      l.cardBody.pos.set(l.baseX + rndX * 2.5, -0.2 + initialYOffset + stagger, rndZ * 2.5);
      l.cardBody.vel.set((Math.random() - 0.5) * 3, -12.0, (Math.random() - 0.5) * 4);
      l.cardBody.angularVelocity.set(
        (Math.random() - 0.5) * 4.5,
        (Math.random() - 0.5) * 7.0,
        (Math.random() - 0.5) * 3.5
      );
      l.cardBody.quat.setFromEuler(new THREE.Euler(0.3, (Math.random() - 0.5) * 0.8, 0));
    });
  }

  // Distance constraint solver between two 3D points
  private solveDistanceConstraint(p1: THREE.Vector3, p2: THREE.Vector3, targetDist: number, weight = 0.5): void {
    const delta = new THREE.Vector3().subVectors(p2, p1);
    const dist = delta.length();
    if (dist > 0.0001) {
      const diff = (dist - targetDist) / dist;
      if (weight >= 1.0) {
        // p1 is completely fixed, move only p2
        p2.addScaledVector(delta, -diff);
      } else {
        p1.addScaledVector(delta, diff * (1 - weight));
        p2.addScaledVector(delta, -diff * weight);
      }
    }
  }

  // ==============================================================
  // 4. Verlet / Spring-Damper Physics Integration Loop
  // ==============================================================
  private updatePhysics(dt: number): void {
    const timeStep = Math.min(dt, 1 / 30);
    const activeIdx = this.activeIndex();

    this.lanyards.forEach((l, idx) => {
      const isFocused = idx === activeIdx;

      if (l.isDragged) {
        // Direct kinetic drag position tracking
        l.cardBody.pos.lerp(l.targetPos, 0.35);
        l.cardBody.vel.set(0, 0, 0);

        // Responsive tilt while dragging based on pointer offset
        const deltaX = l.targetPos.x - l.baseX;
        const targetRotZ = -Math.max(-0.75, Math.min(0.75, deltaX * 0.25));
        const targetRotX = Math.max(-0.65, Math.min(0.65, (l.targetPos.z - (isFocused ? 0.85 : 0)) * 0.35));

        const targetQuat = new THREE.Quaternion().setFromEuler(
          new THREE.Euler(targetRotX, l.cardBody.rot.y, targetRotZ)
        );
        l.cardBody.quat.slerp(targetQuat, 0.2);

        // Wake up neighboring badges via spring tension wave
        this.lanyards.forEach((otherLanyard, oIdx) => {
          if (oIdx !== idx) {
            const distFactor = Math.max(0, 1 - Math.abs(oIdx - idx) * 0.35);
            otherLanyard.cardBody.vel.x += this.pointerVelocity.x * 0.06 * distFactor;
            otherLanyard.cardBody.angularVelocity.y += this.pointerVelocity.x * 0.04 * distFactor;
          }
        });
      } else {
        // 1. Gravity acceleration
        l.cardBody.vel.y += this.gravity * timeStep;

        // 2. Exponential linear and angular velocity damping
        l.cardBody.vel.multiplyScalar(Math.exp(-this.linearDamping * timeStep));
        l.cardBody.angularVelocity.multiplyScalar(Math.exp(-this.angularDamping * timeStep));

        // 3. Card position integration
        l.cardBody.pos.addScaledVector(l.cardBody.vel, timeStep);

        // Upright pendulum restoring torque
        const currentEuler = new THREE.Euler().setFromQuaternion(l.cardBody.quat);
        const torqueX = -currentEuler.x * 18.0;
        const torqueZ = -currentEuler.z * 18.0;
        const torqueY = -currentEuler.y * 12.0;

        l.cardBody.angularVelocity.x += torqueX * timeStep;
        l.cardBody.angularVelocity.z += torqueZ * timeStep;
        l.cardBody.angularVelocity.y += torqueY * timeStep;

        // Z-focus elevation pull for active member
        const targetZ = isFocused ? 0.85 : 0.0;
        const zPull = (targetZ - l.cardBody.pos.z) * 8.0;
        l.cardBody.vel.z += zPull * timeStep;

        // Ambient idle breeze oscillation
        const time = performance.now() * 0.0014 + idx * 0.9;
        l.cardBody.vel.x += Math.sin(time) * 0.015;
        l.cardBody.vel.z += Math.cos(time * 0.8) * 0.01;

        // Integrate orientation quaternion
        const rotDelta = new THREE.Quaternion().setFromEuler(
          new THREE.Euler(
            l.cardBody.angularVelocity.x * timeStep,
            l.cardBody.angularVelocity.y * timeStep,
            l.cardBody.angularVelocity.z * timeStep
          )
        );
        l.cardBody.quat.multiply(rotDelta);
      }

      // Update card top clip point in world coordinates
      const clipLocal = new THREE.Vector3(0, 1.18, 0).applyQuaternion(l.cardBody.quat);
      l.cardClipPoint.copy(l.cardBody.pos).add(clipLocal);

      // 4. Verlet integration for ribbon joints (j1, j2, j3)
      [l.j1, l.j2, l.j3].forEach(joint => {
        const v = new THREE.Vector3().subVectors(joint.pos, joint.prevPos).multiplyScalar(0.94);
        joint.prevPos.copy(joint.pos);
        joint.pos.add(v).addScaledVector(new THREE.Vector3(0, this.gravity, 0), timeStep * timeStep);
      });

      // 5. Multi-pass distance constraints: fixedAnchor -> j1 -> j2 -> j3 -> cardClipPoint
      for (let pass = 0; pass < 6; pass++) {
        this.solveDistanceConstraint(l.fixedAnchor, l.j1.pos, l.segmentLength, 1.0);
        this.solveDistanceConstraint(l.j1.pos, l.j2.pos, l.segmentLength, 0.5);
        this.solveDistanceConstraint(l.j2.pos, l.j3.pos, l.segmentLength, 0.5);
        this.solveDistanceConstraint(l.j3.pos, l.cardClipPoint, 0.35, 0.7);
      }

      // Re-anchor card position to clip point
      const currentClipOffset = new THREE.Vector3(0, 1.18, 0).applyQuaternion(l.cardBody.quat);
      l.cardBody.pos.copy(l.cardClipPoint).sub(currentClipOffset);

      // Synchronize Three.js Mesh Transform
      l.badgeMesh.position.copy(l.cardBody.pos);
      l.badgeMesh.quaternion.copy(l.cardBody.quat);

      // Update Ribbon Strap CatmullRom Curve
      l.curve.points[0].copy(l.fixedAnchor);
      l.curve.points[1].copy(l.j1.pos);
      l.curve.points[2].copy(l.j2.pos);
      l.curve.points[3].copy(l.j3.pos);
      l.curve.points[4].copy(l.cardClipPoint);

      if (l.ribbonMesh) {
        l.ribbonMesh.geometry.dispose();
        l.ribbonMesh.geometry = new THREE.TubeGeometry(l.curve, 28, 0.042, 8, false);
      }
    });
  }

  // ==============================================================
  // 5. Drag Gesture & Inertia Handling
  // ==============================================================
  private initEventListeners(): void {
    const canvas = this.canvasRef.nativeElement;

    this.boundOnPointerDown = (e: PointerEvent) => this.onPointerDown(e);
    this.boundOnPointerMove = (e: PointerEvent) => this.onPointerMove(e);
    this.boundOnPointerUp = (e: PointerEvent) => this.onPointerUp(e);
    this.boundOnResize = () => this.onResize();

    canvas.addEventListener('pointerdown', this.boundOnPointerDown);
    window.addEventListener('pointermove', this.boundOnPointerMove);
    window.addEventListener('pointerup', this.boundOnPointerUp);
    window.addEventListener('pointercancel', this.boundOnPointerUp);
    window.addEventListener('resize', this.boundOnResize);
  }

  private removeEventListeners(): void {
    const canvas = this.canvasRef.nativeElement;
    if (canvas) {
      canvas.removeEventListener('pointerdown', this.boundOnPointerDown);
    }
    window.removeEventListener('pointermove', this.boundOnPointerMove);
    window.removeEventListener('pointerup', this.boundOnPointerUp);
    window.removeEventListener('pointercancel', this.boundOnPointerUp);
    window.removeEventListener('resize', this.boundOnResize);
  }

  private updatePointerCoords(e: PointerEvent): void {
    const rect = this.canvasRef.nativeElement.getBoundingClientRect();
    this.pointerPos.x = ((e.clientX - rect.left) / rect.width) * 2 - 1;
    this.pointerPos.y = -((e.clientY - rect.top) / rect.height) * 2 + 1;
  }

  private onPointerDown(e: PointerEvent): void {
    this.updatePointerCoords(e);
    this.raycaster.setFromCamera(this.pointerPos, this.camera);

    const meshes = this.lanyards.map(l => l.badgeMesh);
    const intersects = this.raycaster.intersectObjects(meshes, true);

    if (intersects.length > 0) {
      let topObject: THREE.Object3D = intersects[0].object;
      while (topObject.parent && topObject.parent !== this.scene) {
        topObject = topObject.parent;
      }

      const memberIdx = topObject.userData?.['memberIndex'];
      if (typeof memberIdx === 'number') {
        this.draggedLanyardIndex = memberIdx;
        this.memberSelected.emit(memberIdx);

        const lanyard = this.lanyards[memberIdx];
        lanyard.isDragged = true;

        this.dragPlane.setFromNormalAndCoplanarPoint(
          new THREE.Vector3(0, 0, 1),
          lanyard.cardBody.pos
        );

        this.targetDragPos.copy(intersects[0].point);
        lanyard.targetPos.copy(this.targetDragPos);

        this.lastPointerPos.copy(this.targetDragPos);
        this.lastPointerTime = performance.now();
        this.pointerVelocity.set(0, 0, 0);

        lanyard.cardBody.angularVelocity.y += 0.55;
      }
    }
  }

  private onPointerMove(e: PointerEvent): void {
    this.updatePointerCoords(e);
    if (this.draggedLanyardIndex !== null) {
      this.raycaster.setFromCamera(this.pointerPos, this.camera);
      if (this.raycaster.ray.intersectPlane(this.dragPlane, this.planeIntersect)) {
        this.targetDragPos.x = Math.max(-6.5, Math.min(6.5, this.planeIntersect.x));
        this.targetDragPos.y = Math.max(-3.0, Math.min(2.5, this.planeIntersect.y));
        this.targetDragPos.z = Math.max(-1.5, Math.min(2.5, this.planeIntersect.z));

        const lanyard = this.lanyards[this.draggedLanyardIndex];
        lanyard.targetPos.copy(this.targetDragPos);

        // Compute kinetic pointer throw velocity
        const now = performance.now();
        const dt = (now - this.lastPointerTime) / 1000;
        if (dt > 0.006) {
          this.pointerVelocity.subVectors(this.planeIntersect, this.lastPointerPos).divideScalar(dt);
          this.lastPointerPos.copy(this.planeIntersect);
          this.lastPointerTime = now;
        }
      }
    }
  }

  private onPointerUp(_e: PointerEvent): void {
    if (this.draggedLanyardIndex !== null) {
      const lanyard = this.lanyards[this.draggedLanyardIndex];
      if (lanyard) {
        lanyard.isDragged = false;

        // Apply throw velocity momentum & angular velocity
        const throwVel = this.pointerVelocity.clone().clampLength(0, 26.0);
        lanyard.cardBody.vel.copy(throwVel);
        lanyard.cardBody.angularVelocity.set(
          (Math.random() - 0.5) * 5.0,
          throwVel.x * 2.2,
          -throwVel.x * 0.8
        );
      }
      this.draggedLanyardIndex = null;
    }
  }

  private focusMember(index: number): void {
    const lanyard = this.lanyards[index];
    if (lanyard) {
      // Pull forward in Z and give an upward/rotational pop impulse
      lanyard.cardBody.vel.set(0, 4.2, 5.0);
      lanyard.cardBody.angularVelocity.set(-1.2, 2.0, (Math.random() - 0.5) * 1.5);
    }
  }

  private onResize(): void {
    const canvas = this.canvasRef.nativeElement;
    if (!canvas || !this.renderer || !this.camera) return;
    const width = canvas.clientWidth || 900;
    const height = canvas.clientHeight || 600;
    this.camera.aspect = width / height;
    this.camera.updateProjectionMatrix();
    this.renderer.setSize(width, height);
  }

  // ==============================================================
  // 6. Main Render Loop & Resource Cleanup
  // ==============================================================
  private animate(): void {
    const loop = (time: number) => {
      const delta = (time - this.lastTime) / 1000 || 0.016;
      this.lastTime = time;

      this.updatePhysics(delta);

      if (this.renderer && this.scene && this.camera) {
        this.renderer.render(this.scene, this.camera);
      }
      this.animFrameId = requestAnimationFrame(loop);
    };
    this.animFrameId = requestAnimationFrame(loop);
  }

  private disposeThree(): void {
    if (this.renderer) {
      this.renderer.dispose();
    }
    this.lanyards.forEach(l => {
      if (l.badgeMesh) l.badgeMesh.geometry.dispose();
      if (l.ribbonMesh) l.ribbonMesh.geometry.dispose();
      if (l.frontTexture) l.frontTexture.dispose();
      if (l.backTexture) l.backTexture.dispose();
      if (l.frontMaterial) l.frontMaterial.dispose();
      if (l.backMaterial) l.backMaterial.dispose();
    });
    this.lanyards = [];
  }
}
