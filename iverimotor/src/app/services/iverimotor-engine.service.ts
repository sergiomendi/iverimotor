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
    luz.setIntensidad(vec4.fromValues(1, 0, 0, 0.2));
    return luz;
  }

  public async crearMalla(nombre: string, fichero: string): Promise<TMalla> {
    console.log('Creando malla:', nombre);
    const recursoMalla = await this.gestorRecursos.getRecurso(
      'humano',
      'assets/FinalBaseMesh.obj',
      this.gl
    );
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
  attribute vec3 aNormal;       // Normales
  attribute vec2 aTexCoord;     // Coordenadas de textura
  uniform mat4 uModelMatrix;    // Matriz de transformación
  uniform mat4 uViewMatrix;     // Matriz de vista (cámara)
  uniform mat4 uProjectionMatrix; // Matriz de proyección

  varying vec3 vNormal;         // Pasar normales al fragment shader
  varying vec2 vTexCoord;       // Pasar coordenadas de textura al fragment shader

  void main(void) {
    // Transformar el vértice con la matriz de modelo, vista y proyección
    gl_Position = uProjectionMatrix * uViewMatrix * uModelMatrix * vec4(aPosition, 1.0);

    // Pasar normales y coordenadas de textura al fragment shader
    vNormal = aNormal;
    vTexCoord = aTexCoord;
  }
`;
    // FRAGMENT SHADER: Sirve para los colores de cada fragmento (píxel potencial)
    // generado por el rasterizador.
    const fragmentShaderSource = `
  precision mediump float;
  varying vec3 vNormal;         // Normales recibidas del vertex shader
  varying vec2 vTexCoord;       // Coordenadas de textura recibidas del vertex shader
  uniform vec4 uLightIntensity; // Intensidad de la luz

  void main(void) {
    // Usar las normales y coordenadas de textura para calcular el color
    gl_FragColor = uLightIntensity * vec4(vTexCoord, 1.0, 1.0); // Ejemplo simple
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
    // Llamar a animate() antes de la próxima actualización de la pantalla en cada frame
    this.frameId = requestAnimationFrame(() => this.animate());
    this.gl.clear(this.gl.COLOR_BUFFER_BIT | this.gl.DEPTH_BUFFER_BIT);

    // Obtener la matriz de vista de la cámara
    const camara = this.nodoRaiz.hijos
      .find((nodo) => nodo.getEntidad() instanceof TCamara)
      ?.getEntidad() as TCamara;
    const viewMatrix = camara ? camara.getViewMatrix() : mat4.create();
    // mat4.lookAt(viewMatrix, [0, 0, 50], [0, 0, 0], [0, 1, 0]);

    // Configurar matriz de proyección
    const projectionMatrix = mat4.create();
    mat4.perspective(
      projectionMatrix,
      Math.PI / 4,
      this.gl.canvas.width / this.gl.canvas.height,
      0.1,
      100.0
    );

    // Pasar matrices al shader
    const uViewMatrix = this.gl.getUniformLocation(
      this.shaderProgram,
      'uViewMatrix'
    );
    const uProjectionMatrix = this.gl.getUniformLocation(
      this.shaderProgram,
      'uProjectionMatrix'
    );
    if (uViewMatrix && uProjectionMatrix) {
      this.gl.uniformMatrix4fv(uViewMatrix, false, viewMatrix);
      this.gl.uniformMatrix4fv(uProjectionMatrix, false, projectionMatrix);
    }

    // Renderizar la escena
    const matrizInicial = mat4.create();
    this.nodoRaiz.render(this.gl, matrizInicial);
  }
}
