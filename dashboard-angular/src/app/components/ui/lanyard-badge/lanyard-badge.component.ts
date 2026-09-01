import {
  Component,
  ElementRef,
  NgZone,
  OnDestroy,
  OnInit,
  ViewChild,
  input,
  effect,
  ChangeDetectionStrategy
} from '@angular/core';
import { CommonModule } from '@angular/common';
import * as THREE from 'three';

@Component({
  selector: 'app-lanyard-badge',
  standalone: true,
  imports: [CommonModule],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="relative w-full h-full min-h-[440px] select-none touch-none overflow-hidden rounded-xl bg-slate-900/5">
      <!-- 3D WebGL Canvas -->
      <canvas #badgeCanvas class="w-full h-full block cursor-grab active:cursor-grabbing"></canvas>
      
      <!-- Interactive Micro Hints Overlay -->
      <div class="absolute bottom-3 left-3 pointer-events-none flex items-center gap-1.5 px-2.5 py-1 bg-white/90 backdrop-blur-sm border border-slate-900/30 rounded-md shadow-sm">
        <span class="inline-block w-1.5 h-1.5 rounded-full bg-teal-600 animate-pulse"></span>
        <span class="font-mono text-[10px] font-bold text-slate-700">DRAG & SWING 3D BADGE</span>
      </div>

      <div class="absolute top-3 right-3 pointer-events-none">
        <span class="font-mono text-[9px] font-black px-2 py-0.5 rounded bg-slate-900 text-teal-300 shadow-sm uppercase tracking-wider">
          #{{ badgeNumber() }}
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
export class LanyardBadgeComponent implements OnInit, OnDestroy {
  @ViewChild('badgeCanvas', { static: true }) canvasRef!: ElementRef<HTMLCanvasElement>;

  // Component Inputs
  memberName = input.required<string>();
  role = input.required<string>();
  githubUrl = input.required<string>();
  badgeNumber = input<string>('01');
  avatarText = input<string>('GB');
  isLead = input<boolean>(false);

  private scene!: THREE.Scene;
  private camera!: THREE.PerspectiveCamera;
  private renderer!: THREE.WebGLRenderer;
  private animFrameId: number | null = null;

  // 3D Objects
  private badgeMesh!: THREE.Mesh;
  private clipMesh!: THREE.Mesh;
  private ribbonMesh!: THREE.Mesh;
  private cardTexture!: THREE.CanvasTexture;
  private cardMaterial!: THREE.MeshStandardMaterial;

  // Physics Simulation State (Verlet + Rigid Pendulum)
  private ropeSegments = 5;
  private ropePoints: THREE.Vector3[] = [];
  private ropePrevPoints: THREE.Vector3[] = [];
  private ropeAnchor = new THREE.Vector3(0, 2.4, 0);

  // Badge Kinematics
  private badgePos = new THREE.Vector3(0, -0.2, 0);
  private badgeVel = new THREE.Vector3(0, 0, 0);
  private badgeRot = new THREE.Euler(0, 0, 0);
  private badgeRotVel = new THREE.Vector3(0, 0, 0);

  // Drag & Pointer state
  private isDragging = false;
  private pointerPos = new THREE.Vector2();
  private dragPlane = new THREE.Plane();
  private raycaster = new THREE.Raycaster();
  private planeIntersect = new THREE.Vector3();
  private targetDragPos = new THREE.Vector3();
  private boundOnPointerDown!: (e: PointerEvent) => void;
  private boundOnPointerMove!: (e: PointerEvent) => void;
  private boundOnPointerUp!: (e: PointerEvent) => void;
  private boundOnResize!: () => void;

  constructor(private ngZone: NgZone) {
    // Regenerate texture when any input changes
    effect(() => {
      const name = this.memberName();
      const role = this.role();
      const badge = this.badgeNumber();
      const avatar = this.avatarText();
      const lead = this.isLead();
      const github = this.githubUrl();

      if (this.cardTexture) {
        this.updateCardTexture(name, role, badge, avatar, lead, github);
        // Trigger a gentle swing excitation when member changes
        this.badgeVel.x += (Math.random() - 0.5) * 0.15;
        this.badgeVel.z += 0.1;
        this.badgeRotVel.y += 0.25;
      }
    });
  }

  ngOnInit(): void {
    this.ngZone.runOutsideAngular(() => {
      this.initThree();
      this.initPhysics();
      this.initEventListeners();
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
  // 1. Procedural 2D Texture Generator (Field Scientist ID Card)
  // ==============================================================
  private createCardTextureCanvas(
    name: string,
    role: string,
    badgeNumber: string,
    avatarText: string,
    isLead: boolean,
    githubUrl: string
  ): HTMLCanvasElement {
    const canvas = document.createElement('canvas');
    canvas.width = 1024;
    canvas.height = 1536;
    const ctx = canvas.getContext('2d')!;

    // Background - Crisp tactile cream journal paper
    ctx.fillStyle = '#f8fafc';
    ctx.fillRect(0, 0, 1024, 1536);

    // Subtle graph paper grid
    ctx.strokeStyle = 'rgba(15, 23, 42, 0.04)';
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

    // Outer 4px dark slate technical border
    ctx.strokeStyle = '#0f172a';
    ctx.lineWidth = 14;
    ctx.strokeRect(32, 32, 960, 1472);

    // Inner subtle border
    ctx.strokeStyle = '#0d9488';
    ctx.lineWidth = 4;
    ctx.strokeRect(48, 48, 928, 1440);

    // Lanyard slot hole visual at top
    ctx.fillStyle = '#0f172a';
    ctx.beginPath();
    ctx.roundRect(432, 60, 160, 24, 12);
    ctx.fill();

    // Header Tag
    ctx.fillStyle = '#0f172a';
    ctx.fillRect(72, 110, 880, 70);
    ctx.fillStyle = '#ffffff';
    ctx.font = 'bold 30px "JetBrains Mono", monospace';
    ctx.fillText('PROJECT SAGARDRISHTI // RESEARCH ID', 100, 156);
    
    // Status Beacon
    ctx.fillStyle = isLead ? '#f59e0b' : '#14b8a6';
    ctx.beginPath();
    ctx.arc(900, 145, 12, 0, Math.PI * 2);
    ctx.fill();

    // Large Avatar Photo / Monogram Box
    ctx.fillStyle = '#0f172a';
    ctx.fillRect(110, 230, 804, 520);
    ctx.fillStyle = '#042f2e';
    ctx.fillRect(118, 238, 788, 504);

    // Avatar Monogram
    ctx.fillStyle = '#2dd4bf';
    ctx.font = '900 180px "JetBrains Mono", monospace';
    ctx.textAlign = 'center';
    ctx.fillText(avatarText, 512, 545);
    ctx.textAlign = 'left';

    // Lead / Role Stamp on photo
    if (isLead) {
      ctx.fillStyle = '#f59e0b';
      ctx.fillRect(140, 660, 240, 50);
      ctx.fillStyle = '#0f172a';
      ctx.font = 'bold 24px "JetBrains Mono", monospace';
      ctx.fillText('★ LEAD ARCHITECT', 156, 694);
    } else {
      ctx.fillStyle = '#14b8a6';
      ctx.fillRect(140, 660, 240, 50);
      ctx.fillStyle = '#042f2e';
      ctx.font = 'bold 24px "JetBrains Mono", monospace';
      ctx.fillText('CORE RESEARCHER', 156, 694);
    }

    // Name Section
    ctx.fillStyle = '#0f172a';
    ctx.font = '900 56px "Outfit", sans-serif';
    ctx.fillText(name, 110, 840);

    // Role Section
    ctx.fillStyle = '#0d9488';
    ctx.font = 'bold 30px "JetBrains Mono", monospace';
    
    // Wrap long role strings cleanly
    const words = role.split(' ');
    let line = '';
    let roleY = 895;
    for (let n = 0; n < words.length; n++) {
      const testLine = line + words[n] + ' ';
      if (testLine.length > 34 && n > 0) {
        ctx.fillText(line, 110, roleY);
        line = words[n] + ' ';
        roleY += 40;
      } else {
        line = testLine;
      }
    }
    ctx.fillText(line, 110, roleY);

    // Technical metadata ledger
    const ledgerY = Math.max(roleY + 60, 1020);
    ctx.fillStyle = '#f1f5f9';
    ctx.fillRect(110, ledgerY, 804, 180);
    ctx.strokeStyle = '#cbd5e1';
    ctx.lineWidth = 3;
    ctx.strokeRect(110, ledgerY, 804, 180);

    ctx.fillStyle = '#64748b';
    ctx.font = 'bold 22px "JetBrains Mono", monospace';
    ctx.fillText('SPECIMEN SERIAL:', 136, ledgerY + 45);
    ctx.fillText('STATION CLEARANCE:', 136, ledgerY + 95);
    ctx.fillText('GITHUB HANDLE:', 136, ledgerY + 145);

    ctx.fillStyle = '#0f172a';
    ctx.font = 'bold 24px "JetBrains Mono", monospace';
    ctx.fillText(`SD-2026-ENG-${badgeNumber}`, 420, ledgerY + 45);
    ctx.fillText('LEVEL 4 // BASIN BROADCAST', 420, ledgerY + 95);

    const githubHandle = githubUrl.split('/').filter(Boolean).pop() || 'developer';
    ctx.fillStyle = '#0d9488';
    ctx.fillText(`@${githubHandle}`, 420, ledgerY + 145);

    // Bottom Barcode & Tech Seal
    const barY = 1260;
    ctx.fillStyle = '#0f172a';
    const barPattern = [6, 3, 12, 4, 8, 14, 3, 7, 18, 4, 9, 3, 15, 6, 8, 4, 16, 5, 10, 3, 14, 8, 5, 12];
    let barX = 110;
    for (let i = 0; i < 4; i++) {
      for (const width of barPattern) {
        ctx.fillRect(barX, barY, width, 90);
        barX += width + 6;
        if (barX > 700) break;
      }
    }

    // Holographic Seal Mockup
    ctx.fillStyle = '#0d9488';
    ctx.beginPath();
    ctx.arc(810, barY + 45, 50, 0, Math.PI * 2);
    ctx.fill();
    ctx.strokeStyle = '#0f172a';
    ctx.lineWidth = 4;
    ctx.stroke();

    ctx.fillStyle = '#ffffff';
    ctx.font = 'bold 18px "JetBrains Mono", monospace';
    ctx.textAlign = 'center';
    ctx.fillText('VERIFIED', 810, barY + 40);
    ctx.fillText('AUTONOMOUS', 810, barY + 60);
    ctx.textAlign = 'left';

    // Footer
    ctx.fillStyle = '#64748b';
    ctx.font = 'bold 20px "JetBrains Mono", monospace';
    ctx.fillText('CAPGEMINI TECH4POSITIVE FUTURE // WATER INTELLIGENCE', 110, 1420);

    return canvas;
  }

  private updateCardTexture(
    name: string,
    role: string,
    badgeNumber: string,
    avatarText: string,
    isLead: boolean,
    githubUrl: string
  ) {
    const canvas = this.createCardTextureCanvas(name, role, badgeNumber, avatarText, isLead, githubUrl);
    if (!this.cardTexture) {
      this.cardTexture = new THREE.CanvasTexture(canvas);
      this.cardTexture.colorSpace = THREE.SRGBColorSpace;
      this.cardTexture.anisotropy = 8;
    } else {
      this.cardTexture.image = canvas;
      this.cardTexture.needsUpdate = true;
    }
  }

  // ==============================================================
  // 2. Three.js Scene Setup & Geometry
  // ==============================================================
  private initThree(): void {
    const canvas = this.canvasRef.nativeElement;
    const width = canvas.clientWidth || 400;
    const height = canvas.clientHeight || 460;

    this.scene = new THREE.Scene();

    this.camera = new THREE.PerspectiveCamera(38, width / height, 0.1, 50);
    this.camera.position.set(0, 0.4, 5.2);
    this.camera.lookAt(0, 0.2, 0);

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

    // Lighting
    const ambientLight = new THREE.AmbientLight(0xffffff, 1.4);
    this.scene.add(ambientLight);

    const mainLight = new THREE.DirectionalLight(0xffffff, 2.2);
    mainLight.position.set(3, 5, 4);
    mainLight.castShadow = true;
    this.scene.add(mainLight);

    const rimLight = new THREE.DirectionalLight(0x2dd4bf, 1.2);
    rimLight.position.set(-3, -2, -2);
    this.scene.add(rimLight);

    // Initial Texture
    this.updateCardTexture(
      this.memberName(),
      this.role(),
      this.badgeNumber(),
      this.avatarText(),
      this.isLead(),
      this.githubUrl()
    );

    // Badge Card Geometry (2:3 Aspect ratio)
    const cardGeo = new THREE.BoxGeometry(1.6, 2.4, 0.04);
    
    // Front material with procedural badge canvas
    this.cardMaterial = new THREE.MeshStandardMaterial({
      map: this.cardTexture,
      roughness: 0.28,
      metalness: 0.08
    });

    // Dark slate side/back material
    const edgeMaterial = new THREE.MeshStandardMaterial({
      color: 0x0f172a,
      roughness: 0.5,
      metalness: 0.2
    });

    const materials = [
      edgeMaterial, // Right
      edgeMaterial, // Left
      edgeMaterial, // Top
      edgeMaterial, // Bottom
      this.cardMaterial, // Front
      edgeMaterial  // Back
    ];

    this.badgeMesh = new THREE.Mesh(cardGeo, materials);
    this.badgeMesh.castShadow = true;
    this.badgeMesh.receiveShadow = true;
    this.scene.add(this.badgeMesh);

    // Metallic Clip on top of badge
    const clipGeo = new THREE.CylinderGeometry(0.08, 0.08, 0.25, 16);
    const clipMat = new THREE.MeshStandardMaterial({
      color: 0x94a3b8,
      roughness: 0.2,
      metalness: 0.85
    });
    this.clipMesh = new THREE.Mesh(clipGeo, clipMat);
    this.clipMesh.rotation.z = Math.PI / 2;
    this.clipMesh.position.set(0, 1.25, 0);
    this.badgeMesh.add(this.clipMesh);

    // Metallic Grommet ring
    const ringGeo = new THREE.TorusGeometry(0.12, 0.03, 12, 24);
    const ringMesh = new THREE.Mesh(ringGeo, clipMat);
    ringMesh.position.set(0, 0.15, 0);
    this.clipMesh.add(ringMesh);

    // Lanyard Ribbon Mesh using TubeGeometry
    const initialCurve = new THREE.CatmullRomCurve3([
      this.ropeAnchor,
      new THREE.Vector3(0, 1.8, 0),
      new THREE.Vector3(0, 1.2, 0),
      new THREE.Vector3(0, 0.6, 0),
      new THREE.Vector3(0, 0, 0)
    ]);
    const ribbonGeo = new THREE.TubeGeometry(initialCurve, 32, 0.045, 8, false);
    const ribbonMat = new THREE.MeshStandardMaterial({
      color: 0x0d9488,
      roughness: 0.6,
      metalness: 0.1
    });
    this.ribbonMesh = new THREE.Mesh(ribbonGeo, ribbonMat);
    this.scene.add(this.ribbonMesh);
  }

  // ==============================================================
  // 3. Physics & Kinematics Engine (Verlet Rope + Damped Spring)
  // ==============================================================
  private initPhysics(): void {
    this.ropePoints = [];
    this.ropePrevPoints = [];
    const totalLength = 2.4;
    for (let i = 0; i <= this.ropeSegments; i++) {
      const p = new THREE.Vector3(
        0,
        this.ropeAnchor.y - (i / this.ropeSegments) * totalLength,
        0
      );
      this.ropePoints.push(p.clone());
      this.ropePrevPoints.push(p.clone());
    }

    this.badgePos.set(0, this.ropeAnchor.y - totalLength, 0);
    this.badgeVel.set(0, 0, 0);
    this.badgeRot.set(0, 0, 0);
    this.badgeRotVel.set(0, 0, 0);
  }

  private stepPhysics(dt: number): void {
    const gravity = new THREE.Vector3(0, -9.8, 0);
    const damping = 0.94;

    // 1. If dragging, calculate pull force on badge
    if (this.isDragging) {
      const pull = new THREE.Vector3().subVectors(this.targetDragPos, this.badgePos).multiplyScalar(28.0);
      this.badgeVel.addScaledVector(pull, dt);

      // Tilt badge in direction of movement
      const targetRotZ = -Math.max(-0.6, Math.min(0.6, this.badgeVel.x * 0.25));
      const targetRotX = Math.max(-0.6, Math.min(0.6, this.badgeVel.z * 0.25));
      this.badgeRot.z += (targetRotZ - this.badgeRot.z) * 0.18;
      this.badgeRot.x += (targetRotX - this.badgeRot.x) * 0.18;
    } else {
      // Free pendulum return torque
      const returnTorqueZ = -this.badgeRot.z * 18.0;
      const returnTorqueX = -this.badgeRot.x * 18.0;
      const returnTorqueY = -this.badgeRot.y * 12.0;

      this.badgeRotVel.z += returnTorqueZ * dt;
      this.badgeRotVel.x += returnTorqueX * dt;
      this.badgeRotVel.y += returnTorqueY * dt;

      this.badgeRotVel.multiplyScalar(0.92);
      this.badgeRot.z += this.badgeRotVel.z * dt;
      this.badgeRot.x += this.badgeRotVel.x * dt;
      this.badgeRot.y += this.badgeRotVel.y * dt;

      // Gentle ambient floating breeze when idle
      const time = performance.now() * 0.0015;
      this.badgeVel.x += Math.sin(time) * 0.015;
      this.badgeVel.z += Math.cos(time * 0.8) * 0.01;
    }

    // 2. Verlet integration for rope particles
    this.ropePoints[0].copy(this.ropeAnchor); // Anchor fixed

    for (let i = 1; i <= this.ropeSegments; i++) {
      const current = this.ropePoints[i];
      const prev = this.ropePrevPoints[i];
      const vel = new THREE.Vector3().subVectors(current, prev).multiplyScalar(damping);

      this.ropePrevPoints[i].copy(current);
      current.add(vel).addScaledVector(gravity, dt * dt);
    }

    // Last point attached to badge clip top
    const badgeTop = new THREE.Vector3(0, 1.25, 0).applyEuler(this.badgeRot).add(this.badgePos);
    this.ropePoints[this.ropeSegments].copy(badgeTop);

    // Distance constraint passes
    const segmentLength = 2.4 / this.ropeSegments;
    for (let pass = 0; pass < 5; pass++) {
      this.ropePoints[0].copy(this.ropeAnchor);
      for (let i = 0; i < this.ropeSegments; i++) {
        const p1 = this.ropePoints[i];
        const p2 = this.ropePoints[i + 1];
        const delta = new THREE.Vector3().subVectors(p2, p1);
        const dist = delta.length();
        if (dist > 0.0001) {
          const diff = (dist - segmentLength) / dist;
          if (i === 0) {
            p2.addScaledVector(delta, -diff);
          } else if (i === this.ropeSegments - 1) {
            p1.addScaledVector(delta, diff * 0.5);
          } else {
            p1.addScaledVector(delta, diff * 0.5);
            p2.addScaledVector(delta, -diff * 0.5);
          }
        }
      }
    }

    // 3. Integrate badge linear movement
    this.badgeVel.addScaledVector(gravity, dt);
    this.badgeVel.multiplyScalar(damping);
    this.badgePos.addScaledVector(this.badgeVel, dt);

    // Keep badge constrained to rope bottom
    const constraintPos = this.ropePoints[this.ropeSegments];
    const offsetFromClip = new THREE.Vector3(0, -1.25, 0).applyEuler(this.badgeRot);
    this.badgePos.copy(constraintPos).add(offsetFromClip);

    // Apply to Three.js Badge Mesh
    this.badgeMesh.position.copy(this.badgePos);
    this.badgeMesh.rotation.copy(this.badgeRot);

    // 4. Update Ribbon Tube Geometry along curve
    const curve = new THREE.CatmullRomCurve3(this.ropePoints);
    if (this.ribbonMesh) {
      this.ribbonMesh.geometry.dispose();
      this.ribbonMesh.geometry = new THREE.TubeGeometry(curve, 28, 0.042, 8, false);
    }
  }

  // ==============================================================
  // 4. Drag & Interaction Handling
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
    const intersects = this.raycaster.intersectObject(this.badgeMesh, true);

    if (intersects.length > 0) {
      this.isDragging = true;
      this.dragPlane.setFromNormalAndCoplanarPoint(
        new THREE.Vector3(0, 0, 1),
        this.badgePos
      );
      this.targetDragPos.copy(intersects[0].point);
      this.badgeRotVel.y += 0.4; // Give tactile initial spin impulse
    }
  }

  private onPointerMove(e: PointerEvent): void {
    this.updatePointerCoords(e);
    if (this.isDragging) {
      this.raycaster.setFromCamera(this.pointerPos, this.camera);
      if (this.raycaster.ray.intersectPlane(this.dragPlane, this.planeIntersect)) {
        // Clamp drag range to reasonable stage bounds
        this.targetDragPos.x = Math.max(-2.2, Math.min(2.2, this.planeIntersect.x));
        this.targetDragPos.y = Math.max(-1.8, Math.min(1.2, this.planeIntersect.y));
        this.targetDragPos.z = Math.max(-1.0, Math.min(1.5, this.planeIntersect.z));
      }
    }
  }

  private onPointerUp(_e: PointerEvent): void {
    if (this.isDragging) {
      this.isDragging = false;
      // Release impulse
      this.badgeVel.multiplyScalar(1.2);
    }
  }

  private onResize(): void {
    const canvas = this.canvasRef.nativeElement;
    if (!canvas || !this.renderer || !this.camera) return;
    const width = canvas.clientWidth || 400;
    const height = canvas.clientHeight || 460;
    this.camera.aspect = width / height;
    this.camera.updateProjectionMatrix();
    this.renderer.setSize(width, height);
  }

  // ==============================================================
  // 5. Main Render Loop (Outside NgZone)
  // ==============================================================
  private animate(): void {
    const loop = () => {
      this.stepPhysics(0.016);
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
    if (this.badgeMesh) {
      this.badgeMesh.geometry.dispose();
    }
    if (this.cardTexture) {
      this.cardTexture.dispose();
    }
    if (this.ribbonMesh) {
      this.ribbonMesh.geometry.dispose();
    }
  }
}
