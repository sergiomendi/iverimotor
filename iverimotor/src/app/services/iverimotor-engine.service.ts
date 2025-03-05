import { ElementRef, Injectable, NgZone, OnDestroy } from '@angular/core';
import TEscena from '../../../iverimotor/nodos/TEscena';
import TCamara from '../../../iverimotor/entidades/TCamara';
import TLuz from '../../../iverimotor/entidades/TLuz';
import TAnimal from '../../../iverimotor/nodos/TAnimal';

@Injectable({
  providedIn: 'root',
})
export class EngineService implements OnDestroy {
  private canvas!: HTMLCanvasElement;
  private gl!: WebGLRenderingContext;
  private program!: WebGLProgram;
  private frameId!: number;
  private nodoRaiz!: TEscena;

  constructor(private ngZone: NgZone) {
    this.nodoRaiz = new TEscena();
  }

  public ngOnDestroy(): void {
    if (this.frameId != null) {
      cancelAnimationFrame(this.frameId);
    }
  }

  public createScene(canvas: ElementRef<HTMLCanvasElement>): void {
    this.canvas = canvas.nativeElement;
    this.gl = this.canvas.getContext('webgl')!;
    if (!this.gl) {
      console.error('WebGL no soportado');
      return;
    }
    this.initWebGL();
    this.animate();
  }

  private initWebGL() {
    this.gl.clearColor(0, 0, 0, 1);
    this.gl.clear(this.gl.COLOR_BUFFER_BIT);
    this.setupShaders();
    // Definir geometría simple (triángulo)
    const vertices = new Float32Array([0.0, 1.0, -1.0, -1.0, 1.0, -1.0]);

    const buffer = this.gl.createBuffer();
    this.gl.bindBuffer(this.gl.ARRAY_BUFFER, buffer);
    this.gl.bufferData(this.gl.ARRAY_BUFFER, vertices, this.gl.STATIC_DRAW);

    const positionLocation = this.gl.getAttribLocation(
      this.program,
      'a_position'
    );
    this.gl.enableVertexAttribArray(positionLocation);
    this.gl.vertexAttribPointer(
      positionLocation,
      2,
      this.gl.FLOAT,
      false,
      0,
      0
    );

    // Crear escena con nodos
    const camara = new TCamara();
    const luz = new TLuz();
    const mapa = new TMapa();
    this.nodoRaiz.addChild(camara);
    this.nodoRaiz.addChild(luz);
    this.nodoRaiz.addChild(mapa);
  }

  private setupShaders() {
    const vertexShaderSource = `
      attribute vec4 a_position;
      void main() {
        gl_Position = a_position;
      }
    `;
    const fragmentShaderSource = `
      precision mediump float;
      void main() {
        gl_FragColor = vec4(1, 0, 0, 1);
      }
    `;

    const vertexShader = this.createShader(
      this.gl.VERTEX_SHADER,
      vertexShaderSource
    );
    const fragmentShader = this.createShader(
      this.gl.FRAGMENT_SHADER,
      fragmentShaderSource
    );
    this.program = this.createProgram(vertexShader, fragmentShader);
    this.gl.useProgram(this.program);
  }

  private createShader(type: number, source: string): WebGLShader {
    const shader = this.gl.createShader(type)!;
    this.gl.shaderSource(shader, source);
    this.gl.compileShader(shader);
    if (!this.gl.getShaderParameter(shader, this.gl.COMPILE_STATUS)) {
      console.error(
        'Error compilando shader:',
        this.gl.getShaderInfoLog(shader)
      );
      this.gl.deleteShader(shader);
      throw new Error('Shader compilation failed');
    }
    return shader;
  }

  private createProgram(
    vertexShader: WebGLShader,
    fragmentShader: WebGLShader
  ): WebGLProgram {
    const program = this.gl.createProgram()!;
    this.gl.attachShader(program, vertexShader);
    this.gl.attachShader(program, fragmentShader);
    this.gl.linkProgram(program);
    if (!this.gl.getProgramParameter(program, this.gl.LINK_STATUS)) {
      console.error(
        'Error linkeando programa:',
        this.gl.getProgramInfoLog(program)
      );
      this.gl.deleteProgram(program);
    }
    return program;
  }

  private animate() {
    this.frameId = requestAnimationFrame(() => this.animate());
    this.gl.clear(this.gl.COLOR_BUFFER_BIT);
    this.nodoRaiz.update();
    this.nodoRaiz.render(this.gl);
  }
}
