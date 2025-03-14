import { ElementRef, Injectable, NgZone, OnDestroy } from '@angular/core';
import TCamara from '../../../iverimotor/entidades/TCamara';
import TLuz from '../../../iverimotor/entidades/TLuz';
import TNodo from '../../../iverimotor/nodos/TNodo';
import TMalla from '../../../iverimotor/entidades/TMalla';
import TEntidad from '../../../iverimotor/entidades/TEntidad';
import TGestorRecursos from '../../../iverimotor/recursos/TGestorRecursos';
import { mat4, vec3, vec4 } from 'gl-matrix';
import TRecursoMalla from '../../../iverimotor/recursos/TRecursoMalla';

@Injectable({ providedIn: 'root' })
export class EngineService implements OnDestroy {
  private gl!: WebGLRenderingContext; // Contexto WebGL
  private shaderProgram!: WebGLProgram; // Programa de shaders
  private frameId!: number; // ID del frame para el bucle de animación
  public nodoRaiz = new TNodo(); // Nodo raíz de la escena
  private gestorRecursos = new TGestorRecursos(); // Gestor de recursos

  constructor(private ngZone: NgZone) {}

  public ngOnDestroy(): void {
    if (this.frameId) cancelAnimationFrame(this.frameId);
  }

  public crearNodo(
    padre: TNodo,
    entidad: TEntidad,
    traslacion: vec3,
    escalado: vec3,
    rotacion: vec3
  ): TNodo {
    const nodo = new TNodo(entidad);
    padre.addChild(nodo);
    nodo.setTraslacion(traslacion);
    nodo.setEscalado(escalado);
    nodo.setRotacion(rotacion);
    return nodo;
  }

  public crearCamara(): TCamara {
    return new TCamara();
  }

  public crearLuz(): TLuz {
    const luz = new TLuz(this.shaderProgram);
    luz.setIntensidad(vec4.fromValues(1, 1, 1, 1));
    return luz;
  }

  public async crearMalla(nombre: string, fichero: string): Promise<TMalla> {
    console.log('Creando malla:', nombre);
    const recursoMalla = new TRecursoMalla(nombre, fichero);
    this.gestorRecursos.getRecurso('mapa', 'assets/FinalBaseMesh.obj', this.gl);
    const tMalla = new TMalla(this.gl, recursoMalla, this.shaderProgram);
    return tMalla;
  }

  public async crearEscena(
    canvas: ElementRef<HTMLCanvasElement>
  ): Promise<void> {
    this.gl = canvas.nativeElement.getContext('webgl')!;
    if (!this.gl) {
      console.error('WebGL no soportado');
      return;
    }
    this.gl.clearColor(0.0588, 0.1176, 0.2196, 1);
    this.gl.enable(this.gl.DEPTH_TEST);
    this.initShaders();
    this.animate();
  }

  private initShaders(): void {
    // VERTEX SHADER: Sirve para las posiciones de los vértices
    // Su función principal es transformar las coordenadas de los vértices de un espacio de coordenadas a otro.
    const vertexShaderSource = `
      attribute vec3 aPosition;
      attribute vec3 aNormal;
      attribute vec2 aTextureCoord;
      uniform mat4 uModelMatrix;
      void main(void) {
        gl_Position = uModelMatrix * vec4(aPosition, 1.0);
      }
    `;
    // FRAGMENT SHADER: Sirve para los colores de cada fragmento (píxel potencial)
    // generado por el rasterizador.
    const fragmentShaderSource = `
      precision mediump float;
      uniform vec4 uLightIntensity;
      void main(void) {
        gl_FragColor = uLightIntensity; // Usar la intensidad de la luz
      }
    `;

    const vertexShader = this.createShader(
      this.gl,
      this.gl.VERTEX_SHADER,
      vertexShaderSource
    );
    const fragmentShader = this.createShader(
      this.gl,
      this.gl.FRAGMENT_SHADER,
      fragmentShaderSource
    );

    this.shaderProgram = this.createProgram(
      this.gl,
      vertexShader,
      fragmentShader
    );
  }

  private createShader(
    gl: WebGLRenderingContext,
    type: number,
    source: string
  ): WebGLShader {
    const shader = gl.createShader(type)!;
    gl.shaderSource(shader, source);
    gl.compileShader(shader);
    if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
      console.error('Error compilando shader:', gl.getShaderInfoLog(shader));
      gl.deleteShader(shader);
      throw new Error('Shader compilation failed');
    }
    return shader;
  }

  private createProgram(
    gl: WebGLRenderingContext,
    vertexShader: WebGLShader,
    fragmentShader: WebGLShader
  ): WebGLProgram {
    const program = gl.createProgram()!;
    gl.attachShader(program, vertexShader);
    gl.attachShader(program, fragmentShader);
    gl.linkProgram(program);
    if (!gl.getProgramParameter(program, gl.LINK_STATUS)) {
      console.error('Error linkeando programa:', gl.getProgramInfoLog(program));
      gl.deleteProgram(program);
      throw new Error('Program linking failed');
    }
    return program;
  }

  private animate() {
    this.frameId = requestAnimationFrame(() => this.animate());
    this.gl.clear(this.gl.COLOR_BUFFER_BIT | this.gl.DEPTH_BUFFER_BIT);
    const matrizInicial = mat4.create();
    this.nodoRaiz.render(this.gl, matrizInicial);
  }
}
