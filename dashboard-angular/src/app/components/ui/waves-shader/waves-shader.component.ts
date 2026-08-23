import { Component, ElementRef, ViewChild, AfterViewInit, OnDestroy, inject, NgZone, HostListener, ChangeDetectionStrategy } from '@angular/core';

@Component({
  selector: 'app-waves-shader',
  standalone: true,
  template: `
    <div class="w-full h-full relative" [class.bg-gradient-to-br]="!hasWebGL" [class.from-slate-900]="!hasWebGL" [class.via-teal-950]="!hasWebGL" [class.to-slate-900]="!hasWebGL">
      <canvas #glCanvas class="block w-full h-full pointer-events-auto"></canvas>
    </div>
  `,
  styles: [`
    :host { display: block; width: 100%; height: 100%; }
  `],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class WavesShaderComponent implements AfterViewInit, OnDestroy {
  @ViewChild('glCanvas') private canvasRef!: ElementRef<HTMLCanvasElement>;
  private ngZone = inject(NgZone);
  
  private rafId: number | null = null;
  private gl: WebGLRenderingContext | null = null;
  private program: WebGLProgram | null = null;
  private buffer: WebGLBuffer | null = null;
  
  private timeLocation: WebGLUniformLocation | null = null;
  private resolutionLocation: WebGLUniformLocation | null = null;
  private cursorLocation: WebGLUniformLocation | null = null;
  private colorsLocation: WebGLUniformLocation | null = null;
  
  private startTime = 0;
  private observer: IntersectionObserver | null = null;
  private isVisible = false;

  private cursor = { x: -1, y: -1, targetX: -1, targetY: -1 };
  
  hasWebGL = true;

  private readonly vertexShaderSource = `
    attribute vec2 position;
    void main() {
      gl_Position = vec4(position, 0.0, 1.0);
    }
  `;

  private readonly fragmentShaderSource = `
    precision mediump float;
    uniform float u_time;
    uniform vec2 u_resolution;
    uniform vec2 u_cursor;
    uniform vec3 u_colors[4];

    float random(in vec2 st) {
      return fract(sin(dot(st.xy, vec2(12.9898,78.233))) * 43758.5453123);
    }

    float noise(in vec2 st) {
      vec2 i = floor(st);
      vec2 f = fract(st);
      float a = random(i);
      float b = random(i + vec2(1.0, 0.0));
      float c = random(i + vec2(0.0, 1.0));
      float d = random(i + vec2(1.0, 1.0));
      vec2 u = f * f * (3.0 - 2.0 * f);
      return mix(a, b, u.x) + (c - a)* u.y * (1.0 - u.x) + (d - b) * u.x * u.y;
    }

    float fbm(in vec2 st) {
      float value = 0.0;
      float amplitude = 0.5;
      vec2 shift = vec2(100.0);
      mat2 rot = mat2(cos(0.5), sin(0.5), -sin(0.5), cos(0.50));
      for (int i = 0; i < 5; ++i) {
        value += amplitude * noise(st);
        st = rot * st * 2.0 + shift;
        amplitude *= 0.5;
      }
      return value;
    }

    void main() {
      vec2 st = gl_FragCoord.xy / u_resolution.xy;
      st.x *= u_resolution.x / u_resolution.y;

      // Distort based on cursor
      vec2 cursorDist = u_cursor - (gl_FragCoord.xy / u_resolution.xy);
      float dist = length(cursorDist);
      vec2 dir = normalize(cursorDist + vec2(0.001));
      st += dir * exp(-dist * 8.0) * 0.06 * sin(u_time * 2.0);

      vec2 q = vec2(0.);
      q.x = fbm(st + 0.00 * u_time);
      q.y = fbm(st + vec2(1.0));
      vec2 r = vec2(0.);
      r.x = fbm(st + 1.0 * q + vec2(1.7, 9.2) + 0.15 * u_time);
      r.y = fbm(st + 1.0 * q + vec2(8.3, 2.8) + 0.126 * u_time);
      float f = fbm(st + r);

      vec3 color = mix(u_colors[0], u_colors[1], clamp((f * f) * 4.0, 0.0, 1.0));
      color = mix(color, u_colors[2], clamp(length(q), 0.0, 1.0));
      color = mix(color, u_colors[3], clamp(length(r.x), 0.0, 1.0));

      gl_FragColor = vec4(color, 1.0);
    }
  `;

  ngAfterViewInit(): void {
    const canvas = this.canvasRef.nativeElement;
    this.gl = canvas.getContext('webgl');

    if (!this.gl) {
      this.hasWebGL = false;
      return;
    }

    this.ngZone.runOutsideAngular(() => {
      this.initWebGL();
      this.setupIntersectionObserver();
      this.setupPointerEvents(canvas);
    });
  }

  private setupPointerEvents(canvas: HTMLCanvasElement) {
    canvas.addEventListener('pointermove', this.onPointerMove.bind(this));
    canvas.addEventListener('pointerleave', this.onPointerLeave.bind(this));
  }

  private setupIntersectionObserver() {
    this.observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        this.isVisible = entry.isIntersecting;
        if (this.isVisible && !this.rafId) {
          this.startTime = performance.now() - (this.startTime > 0 ? this.startTime : 0);
          this.startRenderLoop();
        } else if (!this.isVisible && this.rafId) {
          cancelAnimationFrame(this.rafId);
          this.rafId = null;
        }
      });
    }, { threshold: 0.1 });
    
    this.observer.observe(this.canvasRef.nativeElement);
  }

  private initWebGL() {
    const gl = this.gl!;
    
    const vertexShader = this.compileShader(gl.VERTEX_SHADER, this.vertexShaderSource);
    const fragmentShader = this.compileShader(gl.FRAGMENT_SHADER, this.fragmentShaderSource);
    
    if (!vertexShader || !fragmentShader) return;

    this.program = gl.createProgram();
    gl.attachShader(this.program!, vertexShader);
    gl.attachShader(this.program!, fragmentShader);
    gl.linkProgram(this.program!);

    if (!gl.getProgramParameter(this.program!, gl.LINK_STATUS)) {
      console.error('Program linking failed:', gl.getProgramInfoLog(this.program!));
      return;
    }

    gl.useProgram(this.program!);

    const vertices = new Float32Array([
      -1, -1,
       1, -1,
      -1,  1,
      -1,  1,
       1, -1,
       1,  1
    ]);

    this.buffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, this.buffer);
    gl.bufferData(gl.ARRAY_BUFFER, vertices, gl.STATIC_DRAW);

    const positionLocation = gl.getAttribLocation(this.program!, 'position');
    gl.enableVertexAttribArray(positionLocation);
    gl.vertexAttribPointer(positionLocation, 2, gl.FLOAT, false, 0, 0);

    this.timeLocation = gl.getUniformLocation(this.program!, 'u_time');
    this.resolutionLocation = gl.getUniformLocation(this.program!, 'u_resolution');
    this.cursorLocation = gl.getUniformLocation(this.program!, 'u_cursor');
    this.colorsLocation = gl.getUniformLocation(this.program!, 'u_colors');

    // JalDrishti Marine Palette
    const colors = new Float32Array([
      0.011, 0.110, 0.149, // Deep Marine Slate
      0.051, 0.580, 0.533, // Teal 600
      0.224, 0.792, 0.757, // Cyan / Aquamarine
      0.941, 0.980, 0.988  // Fresh Water Foam
    ]);
    
    gl.uniform3fv(this.colorsLocation, colors);
  }

  private compileShader(type: number, source: string): WebGLShader | null {
    const gl = this.gl!;
    const shader = gl.createShader(type);
    if (!shader) return null;
    
    gl.shaderSource(shader, source);
    gl.compileShader(shader);
    
    if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
      console.error('Shader compilation failed:', gl.getShaderInfoLog(shader));
      gl.deleteShader(shader);
      return null;
    }
    return shader;
  }

  private startRenderLoop() {
    const render = (time: number) => {
      if (!this.gl || !this.program) return;
      
      const gl = this.gl;
      const canvas = gl.canvas as HTMLCanvasElement;
      
      const dpr = Math.min(window.devicePixelRatio || 1, 1.5);
      const displayWidth = Math.floor(canvas.clientWidth * dpr);
      const displayHeight = Math.floor(canvas.clientHeight * dpr);
      
      if (canvas.width !== displayWidth || canvas.height !== displayHeight) {
        canvas.width = displayWidth;
        canvas.height = displayHeight;
        gl.viewport(0, 0, gl.canvas.width, gl.canvas.height);
      }

      // Cursor lerping for fluid movement
      this.cursor.x += (this.cursor.targetX - this.cursor.x) * 0.1;
      this.cursor.y += (this.cursor.targetY - this.cursor.y) * 0.1;

      gl.useProgram(this.program);
      gl.uniform1f(this.timeLocation, (time - this.startTime) * 0.001);
      gl.uniform2f(this.resolutionLocation, gl.canvas.width, gl.canvas.height);
      gl.uniform2f(this.cursorLocation, this.cursor.x, this.cursor.y);
      
      gl.drawArrays(gl.TRIANGLES, 0, 6);
      
      if (this.isVisible) {
        this.rafId = requestAnimationFrame(render);
      }
    };
    
    this.rafId = requestAnimationFrame(render);
  }

  onPointerMove(event: PointerEvent) {
    if (!this.isVisible) return;
    const canvas = this.canvasRef.nativeElement;
    const rect = canvas.getBoundingClientRect();
    this.cursor.targetX = (event.clientX - rect.left) / rect.width;
    this.cursor.targetY = 1.0 - ((event.clientY - rect.top) / rect.height); // Flip Y for WebGL
    
    if (this.cursor.x === -1) {
       this.cursor.x = this.cursor.targetX;
       this.cursor.y = this.cursor.targetY;
    }
  }

  onPointerLeave() {
    this.cursor.targetX = 0.5;
    this.cursor.targetY = 0.5;
  }

  ngOnDestroy(): void {
    const canvas = this.canvasRef?.nativeElement;
    if (canvas) {
      canvas.removeEventListener('pointermove', this.onPointerMove.bind(this));
      canvas.removeEventListener('pointerleave', this.onPointerLeave.bind(this));
    }

    if (this.observer) {
      this.observer.disconnect();
    }
    if (this.rafId) {
      cancelAnimationFrame(this.rafId);
      this.rafId = null;
    }
    
    if (this.gl) {
      const ext = this.gl.getExtension('WEBGL_lose_context');
      if (ext) ext.loseContext();
      
      if (this.buffer) this.gl.deleteBuffer(this.buffer);
      if (this.program) this.gl.deleteProgram(this.program);
    }
  }
}
